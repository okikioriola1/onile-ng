export type UserRole = 'buyer' | 'seller' | 'admin'

export type UserAccountState =
  | 'registered'
  | 'kyc_pending'
  | 'bank_account_pending'
  | 'bank_account_created'
  | 'verified'
  | 'restricted'

export type ListingState =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'live'
  | 'reserved'
  | 'disbursed_closed'

export type ApplicationState =
  | 'started'
  | 'docs_pending'
  | 'under_verification'
  | 'bank_review'
  | 'offer_issued'
  | 'mandate_pending'
  | 'approved'
  | 'disbursement_in_progress'
  | 'disbursed'
  | 'repayment_active'
  | 'default_exception'
  | 'fraud_hold'
  | 'title_hold'
  | 'compliance_hold'

export type WorkflowOwner = 'buyer' | 'ops' | 'bank'
export type NotificationType =
  | 'onboarding_complete'
  | 'savings_account_created'
  | 'document_rejected'
  | 'application_state_change'
  | 'offer_issued'
  | 'mandate_failure'
  | 'disbursement_confirmed'
export type EmploymentType = 'salaried' | 'self-employed'
export type DocumentStatus = 'missing' | 'uploaded' | 'approved' | 'rejected'
export type SavingsAccountStatus = 'pending' | 'created' | 'failed'
export type CompletionStatus = 'completed' | 'off-plan'
export type PropertyType = 'Apartment' | 'Terrace' | 'Duplex' | 'Bungalow' | 'Maisonette'

export interface UploadedDocument {
  id: string
  name: string
  type: string
  status: DocumentStatus
  uploadedAt?: string
  reviewerNote?: string
  required: boolean
}

export interface BankMandate {
  bankName: string
  accountNumber: string
  accountName: string
  validated: boolean
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
}

export interface SavingsActivity {
  id: string
  type: 'deposit' | 'goal_created' | 'account_created'
  amount?: number
  description: string
  createdAt: string
  goalId?: string
}

export interface SavingsAccount {
  userId: string
  status: SavingsAccountStatus
  accountNumber?: string
  accountName?: string
  balance: number
  activities: SavingsActivity[]
  goals: SavingsGoal[]
  failedReason?: string
}

export interface OfferLetter {
  approvedAmount: number
  loanTermYears: number
  monthlyRepayment: number
  conditions: string[]
  status: 'pending' | 'accepted' | 'rejected' | 'clarification_requested'
  clarificationQuestion?: string
}

export interface AuditTrailEntry {
  id: string
  actorName: string
  actorRole: UserRole | 'system'
  action: string
  note?: string
  createdAt: string
}

export interface WorkflowEvent {
  id: string
  fromState: ApplicationState | null
  toState: ApplicationState
  actor: string
  actorRole: UserRole | 'system'
  note?: string
  createdAt: string
}

export interface MortgageApplication {
  id: string
  userId: string
  listingId: string
  propertySnapshot: {
    title: string
    price: number
    image: string
    location: string
    completionStatus: CompletionStatus
  }
  state: ApplicationState
  createdAt: string
  updatedAt: string
  affordability: {
    monthlyIncome: number
    existingObligations: number
    preferredTermYears: number
  }
  mandate: BankMandate
  documents: UploadedDocument[]
  notes: string[]
  offer?: OfferLetter
  workflow: WorkflowEvent[]
  auditTrail: AuditTrailEntry[]
  repayment?: {
    nextDueDate: string
    amount: number
    mandateStatus: 'active' | 'failed' | 'pending'
  }
}

export interface PropertyListing {
  id: string
  ownerId: string
  ownerRole: 'seller'
  title: string
  location: {
    state: string
    city: string
  }
  price: number
  propertyType: PropertyType
  completionStatus: CompletionStatus
  mortgageEligible: boolean
  verificationBadge: boolean
  status: ListingState
  description: string
  images: string[]
  documentsReady: boolean
  sellerInfo: {
    name: string
    company?: string
    verifiedLabel: string
  }
  reviewComments: string[]
  buyerInterestCount: number
  activeFinancedTransactions: number
  milestoneChecklist?: Array<{
    id: string
    label: string
    done: boolean
  }>
  documentStatus: UploadedDocument[]
}

export interface OnboardingDraft {
  userId: string
  role: Exclude<UserRole, 'admin'>
  currentStep: number
  completed: boolean
  fullLegalName: string
  phone: string
  email: string
  residentialAddress: string
  nin: string
  bvn: string
  employmentType?: EmploymentType
  consents: {
    terms: boolean
    privacy: boolean
    dataSharing: boolean
  }
  documents: UploadedDocument[]
}

export interface AppUser {
  id: string
  role: UserRole
  fullName: string
  email: string
  password: string
  phone: string
  residentialAddress: string
  nin: string
  bvn: string
  employmentType?: EmploymentType
  accountState: UserAccountState
  savedListingIds: string[]
  applicationIds: string[]
  listingIds: string[]
  onboardingSubmittedAt?: string
}

export interface MarketplaceFilters {
  search: string
  state: string
  city: string
  propertyType: string
  completionStatus: string
  mortgageEligible: string
  maxPrice: number
}

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  href: string
  userId?: string
  read: boolean
  createdAt: string
}

export interface SuccessMetric {
  id: string
  label: string
  targetLabel: string
  currentValue: string
  passes: boolean
}

export interface RegistrationPayload {
  role: Exclude<UserRole, 'admin'>
  fullName: string
  email: string
  password: string
  phone: string
  residentialAddress: string
  nin: string
  bvn: string
  employmentType?: EmploymentType
}

export interface ListingDraftInput {
  title: string
  state: string
  city: string
  price: number
  propertyType: PropertyType
  completionStatus: CompletionStatus
  mortgageEligible: boolean
  description: string
}
