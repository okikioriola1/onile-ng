import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import {
  applicationStateColor,
  computeSuccessMetrics,
  documentCompletionData,
  getApplicationBlockers,
  getBusinessDayDiff,
  getSlaMeta,
  WORKFLOW_CONFIG,
} from '../lib/business'
import { formatDate } from '../lib/utils'
import { useAppStore } from '../store/useAppStore'
import { Badge, Button, Card, PageSection } from '../components/ui'

export function AdminDashboardPage() {
  const users = useAppStore((state) => state.users)
  const listings = useAppStore((state) => state.listings)
  const applications = useAppStore((state) => state.applications)
  const savings = useAppStore((state) => state.savingsAccounts)
  const onboardingDrafts = useAppStore((state) => state.onboardingDrafts)
  const reviewOnboarding = useAppStore((state) => state.adminReviewOnboarding)
  const reviewListing = useAppStore((state) => state.adminReviewListing)
  const advanceApplication = useAppStore((state) => state.adminAdvanceApplication)
  const toggleMilestone = useAppStore((state) => state.adminToggleMilestone)

  const metrics = computeSuccessMetrics(users, listings, applications, savings)
  const onboardingQueue = users.filter((user) => user.accountState === 'kyc_pending')
  const listingQueue = listings.filter((listing) => ['under_review', 'submitted'].includes(listing.status))
  const mortgageQueue = applications.filter((application) => ['under_verification', 'bank_review'].includes(application.state))
  const disbursementQueue = applications.filter((application) => ['approved', 'disbursement_in_progress'].includes(application.state))

  const alertItems = [
    ...applications
      .filter((application) => application.state === 'offer_issued' && getSlaMeta(application.createdAt, application.state).elapsed > 5)
      .map((application) => `Offer breached SLA for ${application.propertySnapshot.title}`),
    ...applications
      .filter((application) => application.state === 'disbursement_in_progress' && getSlaMeta(application.createdAt, application.state).elapsed > 15)
      .map((application) => `Disbursement breached SLA for ${application.propertySnapshot.title}`),
    ...applications
      .filter((application) => application.mandate.validated === false && application.state === 'mandate_pending')
      .map((application) => `Mandate issue on ${application.propertySnapshot.title}`),
    ...applications
      .filter((application) => application.state === 'fraud_hold')
      .map((application) => `Fraud flag on ${application.propertySnapshot.title}`),
  ]

  return (
    <div className="space-y-8">
      <PageSection title="Ops metrics panel" subtitle="Targets, current mock values, and pass or fail visibility for the admin console.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <Card key={metric.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-[var(--body)]">{metric.label}</p>
                <Badge className={metric.passes ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}>
                  {metric.passes ? 'Pass' : 'Fail'}
                </Badge>
              </div>
              <p className="text-3xl font-semibold text-[var(--forest)]">{metric.currentValue}</p>
              <p className="text-xs text-[var(--muted-teal)]">Target {metric.targetLabel}</p>
            </Card>
          ))}
        </div>
      </PageSection>

      <PageSection title="Operational queues" subtitle="Approve, reject, move states, and review audit evidence across onboarding, listings, and mortgage workflows.">
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[var(--muted-teal)]" />
              <div>
                <p className="text-lg font-semibold text-[var(--forest)]">Onboarding queue</p>
                <p className="text-sm text-[var(--body)]">{onboardingQueue.length} awaiting KYC review</p>
              </div>
            </div>
            {onboardingQueue.map((user) => (
              <div key={user.id} className="rounded-[24px] bg-[var(--surface)] p-4">
                <p className="font-semibold text-[var(--forest)]">{user.fullName}</p>
                <p className="text-sm text-[var(--body)]">{onboardingDrafts[user.id]?.documents.length ?? 0} required docs on file</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => reviewOnboarding(user.id, 'approve', 'KYC approved and bank account created.')}>
                    Approve
                  </Button>
                  <Button variant="danger" onClick={() => reviewOnboarding(user.id, 'reject', 'Replacement ID required.')}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-[var(--gold)]" />
              <div>
                <p className="text-lg font-semibold text-[var(--forest)]">Listing queue</p>
                <p className="text-sm text-[var(--body)]">{listingQueue.length} listings awaiting verification</p>
              </div>
            </div>
            {listingQueue.map((listing) => (
              <div key={listing.id} className="rounded-[24px] bg-[var(--surface)] p-4">
                <p className="font-semibold text-[var(--forest)]">{listing.title}</p>
                <p className="text-sm text-[var(--body)]">Current blocker: {listing.reviewComments[0]}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => reviewListing(listing.id, 'approve', 'Listing verified and moved live.')}>
                    Approve
                  </Button>
                  <Button variant="ghost" onClick={() => reviewListing(listing.id, 'request_docs', 'Please replace the rejected permit set.')}>
                    Request docs
                  </Button>
                  <Button variant="danger" onClick={() => reviewListing(listing.id, 'reject', 'Rejected due to insufficient title evidence.')}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr,360px]">
          <Card className="space-y-5">
            <div>
              <p className="text-lg font-semibold text-[var(--forest)]">Mortgage processing queue</p>
              <p className="text-sm text-[var(--body)]">{mortgageQueue.length} applications with active ops or bank processing.</p>
            </div>

            {mortgageQueue.map((application) => {
              const listing = listings.find((item) => item.id === application.listingId)
              if (!listing) return null
              const documentData = documentCompletionData(application.documents)
              return (
                <div key={application.id} className="rounded-[28px] border border-[var(--surface-strong)] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xl font-semibold text-[var(--forest)]">{application.propertySnapshot.title}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge className={applicationStateColor(application.state)}>{WORKFLOW_CONFIG[application.state].label}</Badge>
                        <Badge className="bg-amber-100 text-amber-800">{getSlaMeta(application.createdAt, application.state).elapsed} days old</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => advanceApplication(application.id, 'bank_review', 'Forwarded to partner bank review.')}>
                        Move to bank review
                      </Button>
                      <Button variant="ghost" onClick={() => advanceApplication(application.id, 'offer_issued', 'Offer package issued to buyer.')}>
                        Issue offer
                      </Button>
                      <Button variant="danger" onClick={() => advanceApplication(application.id, 'fraud_hold', 'Fraud exception flag raised.')}>
                        Flag fraud
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1fr,220px]">
                    <div className="space-y-2">
                      <p className="font-semibold text-[var(--forest)]">Current blocker</p>
                      {getApplicationBlockers(application, listing).map((blocker) => (
                        <p key={blocker} className="text-sm text-[var(--body)]">{blocker}</p>
                      ))}
                      <p className="pt-2 text-sm text-[var(--body)]">
                        SLA age: {getBusinessDayDiff(application.createdAt)} business days. Audit entries: {application.auditTrail.length}
                      </p>
                    </div>
                    <div className="h-44 rounded-[24px] bg-[var(--surface)] p-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={documentData} dataKey="value" nameKey="name" innerRadius={38} outerRadius={64}>
                            {documentData.map((entry) => (
                              <Cell
                                key={entry.name}
                                fill={
                                  entry.name === 'Approved'
                                    ? '#2D7A4F'
                                    : entry.name === 'Uploaded'
                                      ? '#3A7A68'
                                      : entry.name === 'Rejected'
                                        ? '#C0392B'
                                        : '#C9923A'
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 rounded-[24px] bg-[var(--surface)] p-4">
                    <p className="font-semibold text-[var(--forest)]">Audit trail</p>
                    {application.auditTrail.slice(-3).map((entry) => (
                      <div key={entry.id} className="text-sm text-[var(--body)]">
                        {entry.action} by {entry.actorName} on {formatDate(entry.createdAt)}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </Card>

          <div className="space-y-5">
            <Card className="space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-[var(--gold)]" />
                <div>
                  <p className="text-lg font-semibold text-[var(--forest)]">Alerts</p>
                  <p className="text-sm text-[var(--body)]">SLA breaches, failed mandates, and fraud flags.</p>
                </div>
              </div>
              {alertItems.length ? (
                alertItems.map((alert) => (
                  <div key={alert} className="rounded-[20px] bg-amber-50 p-3 text-sm text-amber-800">
                    {alert}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--body)]">No active alert conditions in the seeded demo.</p>
              )}
            </Card>

            <Card className="space-y-4">
              <p className="text-lg font-semibold text-[var(--forest)]">Disbursement queue</p>
              {disbursementQueue.map((application) => {
                const listing = listings.find((item) => item.id === application.listingId)
                if (!listing) return null
                return (
                  <div key={application.id} className="rounded-[24px] bg-[var(--surface)] p-4">
                    <p className="font-semibold text-[var(--forest)]">{application.propertySnapshot.title}</p>
                    <p className="mt-2 text-sm text-[var(--body)]">State: {application.state}</p>
                    {listing.milestoneChecklist?.length ? (
                      <div className="mt-3 space-y-2">
                        {listing.milestoneChecklist.map((milestone) => (
                          <label key={milestone.id} className="flex items-center justify-between gap-3 text-sm text-[var(--body)]">
                            <span>{milestone.label}</span>
                            <input type="checkbox" checked={milestone.done} onChange={() => toggleMilestone(listing.id, milestone.id)} />
                          </label>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => advanceApplication(application.id, 'disbursement_in_progress', 'Disbursement desk has started processing.')}>
                        Confirm processing
                      </Button>
                      <Button variant="ghost" onClick={() => advanceApplication(application.id, 'disbursed', 'Funds released to seller.')}>
                        Confirm disbursement
                      </Button>
                      <Button variant="danger" onClick={() => advanceApplication(application.id, 'compliance_hold', 'Compliance blocker raised before release.')}>
                        Block
                      </Button>
                    </div>
                  </div>
                )
              })}
            </Card>
          </div>
        </div>
      </PageSection>
    </div>
  )
}
