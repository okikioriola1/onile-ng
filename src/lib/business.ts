import type {
  AppUser,
  ApplicationState,
  CompletionStatus,
  MarketplaceFilters,
  MortgageApplication,
  NotificationItem,
  OnboardingDraft,
  PropertyListing,
  SavingsAccount,
  SuccessMetric,
  UploadedDocument,
  WorkflowOwner,
} from '../types'

export const WORKFLOW_CONFIG: Record<
  ApplicationState,
  {
    label: string
    owner: WorkflowOwner
    nextAction: string
    businessDays: number
    tone: 'neutral' | 'warning' | 'positive' | 'danger'
  }
> = {
  started: { label: 'Started', owner: 'buyer', nextAction: 'Complete mortgage application steps', businessDays: 2, tone: 'neutral' },
  docs_pending: { label: 'Docs Pending', owner: 'buyer', nextAction: 'Upload all mandatory buyer documents', businessDays: 3, tone: 'warning' },
  under_verification: { label: 'Under Verification', owner: 'ops', nextAction: 'Ops validates profile and submitted documents', businessDays: 5, tone: 'warning' },
  bank_review: { label: 'Bank Review', owner: 'bank', nextAction: 'Partner bank reviews affordability package', businessDays: 5, tone: 'warning' },
  offer_issued: { label: 'Offer Issued', owner: 'buyer', nextAction: 'Accept, reject, or request clarification', businessDays: 5, tone: 'positive' },
  mandate_pending: { label: 'Mandate Pending', owner: 'buyer', nextAction: 'Validate repayment mandate details', businessDays: 3, tone: 'warning' },
  approved: { label: 'Approved', owner: 'ops', nextAction: 'Clear disbursement checks and milestone readiness', businessDays: 4, tone: 'positive' },
  disbursement_in_progress: { label: 'Disbursement In Progress', owner: 'bank', nextAction: 'Confirm disbursement release', businessDays: 15, tone: 'warning' },
  disbursed: { label: 'Disbursed', owner: 'bank', nextAction: 'Activate repayment monitoring', businessDays: 1, tone: 'positive' },
  repayment_active: { label: 'Repayment Active', owner: 'buyer', nextAction: 'Maintain mandate success and repayment schedule', businessDays: 30, tone: 'positive' },
  default_exception: { label: 'Default Exception', owner: 'ops', nextAction: 'Resolve collections exception', businessDays: 2, tone: 'danger' },
  fraud_hold: { label: 'Fraud Hold', owner: 'ops', nextAction: 'Fraud team review required', businessDays: 2, tone: 'danger' },
  title_hold: { label: 'Title Hold', owner: 'ops', nextAction: 'Resolve title verification issue', businessDays: 3, tone: 'danger' },
  compliance_hold: { label: 'Compliance Hold', owner: 'ops', nextAction: 'Resolve compliance blocker', businessDays: 3, tone: 'danger' },
}

export function getBusinessDayDiff(startDate: string, endDate = new Date().toISOString()) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  let days = 0
  const cursor = new Date(start)
  while (cursor < end) {
    const day = cursor.getDay()
    if (day !== 0 && day !== 6) days += 1
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export function getSlaMeta(createdAt: string, state: ApplicationState) {
  const config = WORKFLOW_CONFIG[state]
  const elapsed = getBusinessDayDiff(createdAt)
  const target = config.businessDays
  const ratio = target === 0 ? 0 : elapsed / target
  const remaining = Math.max(target - elapsed, 0)
  let chipTone: 'forest' | 'amber' | 'red' = 'forest'
  if (ratio >= 0.8) chipTone = 'red'
  else if (ratio >= 0.5) chipTone = 'amber'
  return {
    elapsed,
    target,
    remaining,
    chipTone,
    label: `${remaining} business day${remaining === 1 ? '' : 's'} left`,
  }
}

export function getOnboardingRequirements(draft: Pick<OnboardingDraft, 'role' | 'employmentType'>) {
  const base = ['Government-issued ID', 'Proof of address', 'Passport photograph']
  if (draft.role === 'buyer' && draft.employmentType === 'salaried') {
    return [...base, 'Employment letter', 'Payslips', 'Bank statements']
  }
  if (draft.role === 'buyer' && draft.employmentType === 'self-employed') {
    return [...base, 'Business registration', 'Bank statements', 'Income evidence']
  }
  if (draft.role === 'seller') {
    return [...base, 'Proof of ownership', 'Title documents', 'Signed platform authority']
  }
  return base
}

export function getApplicationRequirements(listing: Pick<PropertyListing, 'completionStatus'>) {
  const base = ['Government-issued ID', 'Proof of address', 'Bank statements', 'Affordability declaration']
  if (listing.completionStatus === 'off-plan') {
    return [...base, 'Off-plan milestone acknowledgement']
  }
  return base
}

export function areRequiredDocumentsComplete(documents: UploadedDocument[]) {
  return documents.filter((doc) => doc.required).every((doc) => doc.status === 'uploaded' || doc.status === 'approved')
}

export function canStartMortgage(user: AppUser | undefined, savings?: SavingsAccount) {
  return Boolean(user && user.role === 'buyer' && user.accountState === 'verified' && savings?.status === 'created')
}

export function canSubmitApplication(application: MortgageApplication) {
  const mandate = application.mandate
  return (
    areRequiredDocumentsComplete(application.documents) &&
    mandate.validated &&
    Boolean(mandate.accountName && mandate.accountNumber && mandate.bankName)
  )
}

export function canMoveToDisbursement(application: MortgageApplication, listing: PropertyListing) {
  const offerAccepted = application.offer?.status === 'accepted'
  const milestoneReady =
    listing.completionStatus === 'completed' ||
    (listing.milestoneChecklist?.every((milestone) => milestone.done) ?? true)
  return offerAccepted && application.state === 'approved' && application.mandate.validated && milestoneReady
}

export function getVisibleListings(listings: PropertyListing[]) {
  return listings.filter((listing) => listing.status === 'live' && listing.verificationBadge)
}

export function filterListings(listings: PropertyListing[], filters: MarketplaceFilters) {
  return getVisibleListings(listings).filter((listing) => {
    const matchesSearch = filters.search
      ? `${listing.title} ${listing.location.city} ${listing.location.state}`.toLowerCase().includes(filters.search.toLowerCase())
      : true
    const matchesState = filters.state ? listing.location.state === filters.state : true
    const matchesCity = filters.city ? listing.location.city === filters.city : true
    const matchesType = filters.propertyType ? listing.propertyType === filters.propertyType : true
    const matchesCompletion = filters.completionStatus ? listing.completionStatus === filters.completionStatus : true
    const matchesMortgage =
      filters.mortgageEligible === ''
        ? true
        : filters.mortgageEligible === 'yes'
          ? listing.mortgageEligible
          : !listing.mortgageEligible
    const matchesPrice = listing.price <= filters.maxPrice
    return matchesSearch && matchesState && matchesCity && matchesType && matchesCompletion && matchesMortgage && matchesPrice
  })
}

export function getUnreadNotificationCount(notifications: NotificationItem[], userId?: string) {
  return notifications.filter((item) => !item.read && (!item.userId || item.userId === userId)).length
}

export function computeSuccessMetrics(
  users: AppUser[],
  listings: PropertyListing[],
  applications: MortgageApplication[],
  savingsAccounts: SavingsAccount[],
) {
  const externalUsers = users.filter((user) => user.role !== 'admin')
  const verifiedUsers = externalUsers.filter((user) => user.accountState === 'verified')
  const onboardingRate = externalUsers.length ? (verifiedUsers.length / externalUsers.length) * 100 : 0
  const savingsActivation = verifiedUsers.length
    ? (savingsAccounts.filter((account) => account.status === 'created').length / verifiedUsers.length) * 100
    : 0
  const listingCandidates = listings.filter((listing) => ['verified', 'live', 'reserved', 'disbursed_closed'].includes(listing.status))
  const listingApprovalRate = listings.length ? (listingCandidates.length / listings.length) * 100 : 0
  const completedApplications = applications.filter((application) =>
    ['approved', 'disbursement_in_progress', 'disbursed', 'repayment_active'].includes(application.state),
  ).length
  const applicationCompletionRate = applications.length ? (completedApplications / applications.length) * 100 : 0
  const offerTurnaround = median(
    applications
      .filter((application) => application.state === 'offer_issued' || application.offer)
      .map((application) => getBusinessDayDiff(application.createdAt, application.updatedAt)),
  )
  const disbursementTurnaround = median(
    applications
      .filter((application) => application.state === 'disbursed' || application.state === 'repayment_active')
      .map((application) => getBusinessDayDiff(application.createdAt, application.updatedAt)),
  )
  const repaymentSuccessRate = applications.filter((application) => application.repayment).length
    ? (applications.filter((application) => application.repayment?.mandateStatus === 'active').length /
        applications.filter((application) => application.repayment).length) *
      100
    : 0
  const rejectedDocuments = applications.flatMap((app) => app.documents).filter((doc) => doc.status === 'rejected').length
  const totalDocuments = applications.flatMap((app) => app.documents).length || 1
  const defectRate = (rejectedDocuments / totalDocuments) * 100
  const conversionRate = getVisibleListings(listings).length ? (applications.length / getVisibleListings(listings).length) * 100 : 0

  const metrics: SuccessMetric[] = [
    { id: 'onboarding', label: 'Onboarding completion rate', targetLabel: '>= 65%', currentValue: `${Math.round(onboardingRate)}%`, passes: onboardingRate >= 65 },
    { id: 'savings', label: 'Savings activation rate', targetLabel: '>= 90%', currentValue: `${Math.round(savingsActivation)}%`, passes: savingsActivation >= 90 },
    { id: 'listing', label: 'Verified listing approval rate', targetLabel: '>= 60%', currentValue: `${Math.round(listingApprovalRate)}%`, passes: listingApprovalRate >= 60 },
    { id: 'application', label: 'Mortgage application completion rate', targetLabel: '>= 55%', currentValue: `${Math.round(applicationCompletionRate)}%`, passes: applicationCompletionRate >= 55 },
    { id: 'offer', label: 'Median offer turnaround', targetLabel: '<= 5 days', currentValue: `${offerTurnaround} days`, passes: offerTurnaround <= 5 },
    { id: 'disbursement', label: 'Median disbursement turnaround', targetLabel: '<= 15 days', currentValue: `${disbursementTurnaround} days`, passes: disbursementTurnaround <= 15 },
    { id: 'repayment', label: 'Monthly repayment success rate', targetLabel: '>= 92%', currentValue: `${Math.round(repaymentSuccessRate)}%`, passes: repaymentSuccessRate >= 92 },
    { id: 'defect', label: 'Document defect rate', targetLabel: '<= 20%', currentValue: `${Math.round(defectRate)}%`, passes: defectRate <= 20 },
    { id: 'conversion', label: 'Marketplace conversion rate', targetLabel: '>= 8%', currentValue: `${Math.round(conversionRate)}%`, passes: conversionRate >= 8 },
  ]
  return metrics
}

function median(values: number[]) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? Math.round((sorted[middle - 1] + sorted[middle]) / 2) : sorted[middle]
}

export function getApplicationBlockers(application: MortgageApplication, listing: PropertyListing) {
  const blockers: string[] = []
  if (!areRequiredDocumentsComplete(application.documents)) blockers.push('Mandatory documents are still missing.')
  if (!application.mandate.validated) blockers.push('Repayment mandate has not been validated.')
  if (listing.completionStatus === 'off-plan' && listing.milestoneChecklist?.some((item) => !item.done)) {
    blockers.push('Off-plan milestone checklist is incomplete.')
  }
  if (application.offer && application.offer.status !== 'accepted') blockers.push('Offer must be accepted before disbursement.')
  return blockers
}

export function getRoleDashboardPath(user?: AppUser) {
  if (!user) return '/auth'
  if (user.role === 'buyer') return '/buyer'
  if (user.role === 'seller') return '/seller'
  return '/admin'
}

export function buildNotificationsForRejection(userId: string): NotificationItem {
  return {
    id: `note-${userId}-rejection`,
    type: 'document_rejected',
    title: 'Document rejected',
    message: 'A reviewer requested replacement KYC documentation.',
    href: '/auth/onboarding',
    userId,
    read: false,
    createdAt: new Date().toISOString(),
  }
}

export function applicationChartData(applications: MortgageApplication[]) {
  const states = ['docs_pending', 'under_verification', 'bank_review', 'offer_issued', 'approved', 'repayment_active']
  return states.map((state) => ({
    state,
    count: applications.filter((application) => application.state === state).length,
  }))
}

export function savingsChartData(account?: SavingsAccount) {
  return account?.goals.map((goal) => ({
    name: goal.name,
    saved: goal.currentAmount,
    target: goal.targetAmount,
  })) ?? []
}

export function documentCompletionData(documents: UploadedDocument[]) {
  return [
    { name: 'Approved', value: documents.filter((doc) => doc.status === 'approved').length },
    { name: 'Uploaded', value: documents.filter((doc) => doc.status === 'uploaded').length },
    { name: 'Rejected', value: documents.filter((doc) => doc.status === 'rejected').length },
    { name: 'Missing', value: documents.filter((doc) => doc.status === 'missing').length },
  ]
}

export function summarizeOnboardingState(draft?: OnboardingDraft) {
  if (!draft) return 'No onboarding draft started yet.'
  if (draft.completed) return 'Onboarding submitted and awaiting ops review.'
  return `Step ${draft.currentStep + 1} in progress with ${draft.documents.filter((doc) => doc.status !== 'missing').length} documents captured.`
}

export function filterNotificationsForUser(notifications: NotificationItem[], user?: AppUser) {
  return notifications.filter((notification) => !notification.userId || notification.userId === user?.id)
}

export function publicStats(listings: PropertyListing[], applications: MortgageApplication[]) {
  const visible = getVisibleListings(listings)
  const completed = visible.filter((listing) => listing.completionStatus === 'completed').length
  const offPlan = visible.filter((listing) => listing.completionStatus === 'off-plan').length
  return [
    { label: 'Verified homes live', value: visible.length.toString() },
    { label: 'Completed inventory', value: completed.toString() },
    { label: 'Off-plan projects', value: offPlan.toString() },
    { label: 'Financed workflows', value: applications.length.toString() },
  ]
}

export function applicationStateColor(state: ApplicationState) {
  const tone = WORKFLOW_CONFIG[state].tone
  if (tone === 'positive') return 'bg-green-100 text-green-800'
  if (tone === 'warning') return 'bg-amber-100 text-amber-800'
  if (tone === 'danger') return 'bg-red-100 text-red-700'
  return 'bg-slate-100 text-slate-700'
}

export function completionBadgeColor(status: CompletionStatus) {
  return status === 'completed' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
}
