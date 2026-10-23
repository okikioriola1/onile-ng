import { zodResolver } from '@hookform/resolvers/zod'
import { Bookmark, CircleAlert, FileClock, PiggyBank } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import {
  applicationChartData,
  applicationStateColor,
  canStartMortgage,
  canSubmitApplication,
  getApplicationBlockers,
  getSlaMeta,
  savingsChartData,
  WORKFLOW_CONFIG,
} from '../lib/business'
import { formatCurrency, formatDate } from '../lib/utils'
import { useAppStore, useCurrentUser } from '../store/useAppStore'
import { Badge, Button, Card, EmptyState, Input, PageSection, ProgressBar, Select, StatCard } from '../components/ui'

const goalSchema = z.object({
  name: z.string().min(2),
  targetAmount: z.number().min(100_000),
  targetDate: z.string().optional(),
})

const depositSchema = z.object({
  goalId: z.string().min(1),
  amount: z.number().min(10_000),
})

const affordabilitySchema = z.object({
  monthlyIncome: z.number().min(1),
  existingObligations: z.number().min(0),
  preferredTermYears: z.number().min(5).max(25),
})

const mandateSchema = z.object({
  bankName: z.string().min(2),
  accountNumber: z.string().length(10),
  accountName: z.string().min(3),
})

export function BuyerDashboardPage() {
  const user = useCurrentUser()
  const savingsAccounts = useAppStore((state) => state.savingsAccounts)
  const listings = useAppStore((state) => state.listings)
  const allApplications = useAppStore((state) => state.applications)
  const createGoal = useAppStore((state) => state.createSavingsGoal)
  const depositToGoal = useAppStore((state) => state.depositToGoal)
  const decideOffer = useAppStore((state) => state.decideOffer)
  const navigate = useNavigate()

  const savings = useMemo(
    () => savingsAccounts.find((account) => account.userId === user?.id),
    [savingsAccounts, user?.id],
  )
  const applications = useMemo(
    () => allApplications.filter((application) => application.userId === user?.id),
    [allApplications, user?.id],
  )

  const savedListings = listings.filter((listing) => user?.savedListingIds.includes(listing.id))
  const stats = [
    {
      label: 'Savings balance',
      value: formatCurrency(savings?.balance ?? 0),
      helper: savings?.status === 'created' ? 'Partner-bank savings account active' : 'Account pending remediation',
      icon: <PiggyBank size={20} />,
    },
    {
      label: 'Active applications',
      value: applications.length.toString(),
      helper: 'Tracked through the workflow state machine',
      icon: <FileClock size={20} />,
    },
    {
      label: 'Saved properties',
      value: savedListings.length.toString(),
      helper: 'Public listings bookmarked for later',
      icon: <Bookmark size={20} />,
    },
    {
      label: 'Pending actions',
      value: applications.filter((application) => ['offer_issued', 'docs_pending', 'mandate_pending'].includes(application.state)).length.toString(),
      helper: 'Tasks needing your attention',
      icon: <CircleAlert size={20} />,
    },
  ]

  const goalForm = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: { name: '', targetAmount: 1_000_000, targetDate: '' },
  })
  const depositForm = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: { goalId: savings?.goals[0]?.id ?? '', amount: 100_000 },
  })

  if (!user) return null

  const chartData = savingsChartData(savings)
  const workflowData = applicationChartData(applications)
  const startMortgageReady = canStartMortgage(user, savings)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} helper={stat.helper} icon={stat.icon} />
        ))}
      </div>

      {!startMortgageReady ? (
        <Card className="border-amber-200 bg-[linear-gradient(180deg,rgba(255,247,233,0.95),rgba(255,250,240,0.92))]">
          <p className="text-sm font-semibold text-amber-700">Mortgage application start is disabled.</p>
          <p className="mt-2 text-sm text-amber-700">
            This buyer route only enables new mortgage applications after verification and successful partner-bank savings account creation.
          </p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => navigate('/auth/onboarding')}>
              Resume onboarding
            </Button>
          </div>
        </Card>
      ) : null}

      <PageSection title="Savings" subtitle="Goals, balances, and instant mock Pay Now deposits." action={<Link to="/marketplace" className="text-sm font-medium text-[var(--muted-teal)]">Browse more homes</Link>}>
        <div className="grid gap-6 xl:grid-cols-[1fr,320px]">
          <Card className="space-y-5" id="savings">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--body)]">Partner bank account</p>
                <p className="text-xl font-semibold text-[var(--forest)]">{savings?.accountName ?? 'Pending account creation'}</p>
              </div>
              <Badge className={savings?.status === 'created' ? 'bg-green-100 text-green-800' : savings?.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}>
                {savings?.status ?? 'pending'}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {savings?.goals.map((goal) => {
                const percent = (goal.currentAmount / goal.targetAmount) * 100
                return (
                  <div key={goal.id} className="rounded-[26px] border border-white/65 bg-[linear-gradient(180deg,rgba(232,240,236,0.72),rgba(232,240,236,0.52))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--forest)]">{goal.name}</p>
                        <p className="text-sm text-[var(--body)]">{formatDate(goal.targetDate)}</p>
                      </div>
                      <Badge className="bg-[rgba(201,146,58,0.15)] text-[#9b6c22]">{Math.round(percent)}%</Badge>
                    </div>
                    <p className="mt-4 text-sm text-[var(--body)]">
                      {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                    </p>
                    <div className="mt-3">
                      <ProgressBar value={percent} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="h-72 rounded-[28px] border border-white/65 bg-[linear-gradient(180deg,rgba(232,240,236,0.68),rgba(232,240,236,0.46))] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d8e2dd" />
                  <XAxis dataKey="name" stroke="#5A6A62" />
                  <YAxis stroke="#5A6A62" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="saved" fill="#3A7A68" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="target" fill="#C9923A" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="space-y-4">
              <p className="text-lg font-semibold text-[var(--forest)]">Create a goal</p>
              <form
                className="space-y-4"
                onSubmit={goalForm.handleSubmit((values) => {
                  createGoal(user.id, values)
                  goalForm.reset()
                })}
              >
                <Input label="Goal name" {...goalForm.register('name')} error={goalForm.formState.errors.name?.message} />
                <Input label="Target amount" type="number" {...goalForm.register('targetAmount', { valueAsNumber: true })} error={goalForm.formState.errors.targetAmount?.message} />
                <Input label="Target date" type="date" {...goalForm.register('targetDate')} error={goalForm.formState.errors.targetDate?.message} />
                <Button type="submit" className="w-full">
                  Add savings goal
                </Button>
              </form>
            </Card>

            <Card className="space-y-4">
              <p className="text-lg font-semibold text-[var(--forest)]">Pay Now</p>
              <form
                className="space-y-4"
                onSubmit={depositForm.handleSubmit((values) => {
                  depositToGoal(user.id, values)
                  depositForm.reset({ goalId: values.goalId, amount: 100_000 })
                })}
              >
                <Select label="Goal" {...depositForm.register('goalId')} error={depositForm.formState.errors.goalId?.message}>
                  {savings?.goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name}
                    </option>
                  ))}
                </Select>
                <Input label="Deposit amount" type="number" {...depositForm.register('amount', { valueAsNumber: true })} error={depositForm.formState.errors.amount?.message} />
                <Button type="submit" className="w-full">
                  Credit goal balance
                </Button>
              </form>
            </Card>

            <Card className="space-y-3">
              <p className="text-lg font-semibold text-[var(--forest)]">Recent activity</p>
              {savings?.activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="rounded-[22px] border border-white/65 bg-[linear-gradient(180deg,rgba(232,240,236,0.66),rgba(232,240,236,0.42))] p-3">
                  <p className="text-sm font-medium text-[var(--forest)]">{activity.description}</p>
                  <p className="text-xs text-[var(--body)]">{formatDate(activity.createdAt)}</p>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </PageSection>

      <PageSection title="Applications" subtitle="SLA-aware workflow visibility, document checklists, and buyer offer decisions.">
        {applications.length ? (
          <div className="space-y-5">
            <Card className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workflowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d8e2dd" />
                  <XAxis dataKey="state" stroke="#5A6A62" />
                  <YAxis stroke="#5A6A62" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1F4A35" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {applications.map((application) => {
              const listing = listings.find((item) => item.id === application.listingId)
              if (!listing) return null
              const sla = getSlaMeta(application.createdAt, application.state)
              return (
                <Card key={application.id} className="space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      <img src={application.propertySnapshot.image} alt={application.propertySnapshot.title} className="h-24 w-24 rounded-[24px] object-cover shadow-[0_12px_28px_rgba(31,74,53,0.12)]" />
                      <div>
                        <p className="text-xl font-semibold text-[var(--forest)]">{application.propertySnapshot.title}</p>
                        <p className="mt-1 text-sm text-[var(--body)]">{application.propertySnapshot.location}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge className={applicationStateColor(application.state)}>{WORKFLOW_CONFIG[application.state].label}</Badge>
                          <Badge className={sla.chipTone === 'forest' ? 'bg-green-100 text-green-800' : sla.chipTone === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'}>
                            {sla.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-[var(--body)]">
                      <p>Owner: {WORKFLOW_CONFIG[application.state].owner}</p>
                      <p>Next action: {WORKFLOW_CONFIG[application.state].nextAction}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3 rounded-[26px] border border-white/65 bg-[linear-gradient(180deg,rgba(232,240,236,0.68),rgba(232,240,236,0.48))] p-4">
                      <p className="font-semibold text-[var(--forest)]">Document checklist</p>
                      {application.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between gap-3">
                          <span className="text-sm text-[var(--body)]">{doc.type}</span>
                          <Badge className={doc.status === 'rejected' ? 'bg-red-100 text-red-700' : doc.status === 'missing' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 rounded-[26px] border border-white/65 bg-[linear-gradient(180deg,rgba(232,240,236,0.68),rgba(232,240,236,0.48))] p-4">
                      <p className="font-semibold text-[var(--forest)]">Blockers and next required action</p>
                      {getApplicationBlockers(application, listing).length ? (
                        getApplicationBlockers(application, listing).map((blocker) => (
                          <p key={blocker} className="text-sm text-red-700">
                            {blocker}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-[var(--body)]">No active blockers for the current state.</p>
                      )}
                      {application.offer ? (
                        <div className="space-y-3 pt-3">
                          <p className="font-semibold text-[var(--forest)]">Offer summary</p>
                          <p className="text-sm text-[var(--body)]">
                            {formatCurrency(application.offer.approvedAmount)} over {application.offer.loanTermYears} years at {formatCurrency(application.offer.monthlyRepayment)}/month.
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <Button variant="secondary" onClick={() => decideOffer(application.id, 'accepted')}>
                              Accept
                            </Button>
                            <Button variant="ghost" onClick={() => decideOffer(application.id, 'clarification_requested', 'Please clarify valuation timing.')}>
                              Request clarification
                            </Button>
                            <Button variant="danger" onClick={() => decideOffer(application.id, 'rejected')}>
                              Reject
                            </Button>
                          </div>
                        </div>
                      ) : null}
                      {application.repayment ? (
                        <div className="space-y-1 pt-3 text-sm text-[var(--body)]">
                          <p>Next due date: {formatDate(application.repayment.nextDueDate)}</p>
                          <p>Amount: {formatCurrency(application.repayment.amount)}</p>
                          <p>Mandate status: {application.repayment.mandateStatus}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState title="No buyer applications yet" body="Start from a mortgage-eligible listing to create your first workflow." />
        )}
      </PageSection>
    </div>
  )
}

export function MortgageApplicationPage() {
  const { listingId } = useParams()
  const user = useCurrentUser()
  const listings = useAppStore((state) => state.listings)
  const savingsAccounts = useAppStore((state) => state.savingsAccounts)
  const createDraft = useAppStore((state) => state.createApplicationDraft)
  const uploadApplicationDocument = useAppStore((state) => state.uploadApplicationDocument)
  const updateApplication = useAppStore((state) => state.updateApplication)
  const submitApplication = useAppStore((state) => state.submitApplication)
  const applications = useAppStore((state) => state.applications)
  const navigate = useNavigate()
  const [draftId, setDraftId] = useState<string>()

  const listing = useMemo(
    () => listings.find((item) => item.id === listingId),
    [listingId, listings],
  )
  const savings = useMemo(
    () => savingsAccounts.find((account) => account.userId === user?.id),
    [savingsAccounts, user?.id],
  )

  const existingDraft = applications.find((item) =>
    item.userId === user?.id && item.listingId === listing?.id && item.state === 'started',
  )
  // Keep the selected application after submission changes its workflow state.
  if (!draftId && existingDraft) setDraftId(existingDraft.id)

  useEffect(() => {
    if (!user || !listing || draftId) return
    // Read the live store so Strict Mode effect replay cannot create a duplicate.
    const existing = useAppStore.getState().applications.find((item) =>
      item.userId === user.id && item.listingId === listing.id && item.state === 'started',
    )
    if (!existing) createDraft(user.id, listing.id)
  }, [createDraft, draftId, listing, user])

  const application = useMemo(() => {
    if (!user || !listing) return undefined
    return applications.find((item) => item.id === draftId) ?? applications.find((item) => item.userId === user.id && item.listingId === listing.id && item.state === 'started')
  }, [applications, draftId, listing, user])

  const affordabilityForm = useForm<z.infer<typeof affordabilitySchema>>({
    resolver: zodResolver(affordabilitySchema),
    values: {
      monthlyIncome: application?.affordability.monthlyIncome ?? 0,
      existingObligations: application?.affordability.existingObligations ?? 0,
      preferredTermYears: application?.affordability.preferredTermYears ?? 15,
    },
  })

  const mandateForm = useForm<z.infer<typeof mandateSchema>>({
    resolver: zodResolver(mandateSchema),
    values: {
      bankName: application?.mandate.bankName ?? '',
      accountNumber: application?.mandate.accountNumber ?? '',
      accountName: application?.mandate.accountName ?? '',
    },
  })

  if (!user || !listing || !application) return null
  if (!canStartMortgage(user, savings)) {
    return <EmptyState title="Mortgage application unavailable" body="Only verified buyers with created bank savings accounts can start an application." />
  }

  const readyToSubmit = canSubmitApplication(application)

  return (
    <div className="space-y-6">
      <PageSection title="Mortgage application flow" subtitle="Structured, mock, document-led origination with frontend-only persistence.">
        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          <div className="space-y-5">
            <Card className="space-y-3">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted-teal)]">Step 1</p>
              <h2 className="text-2xl font-semibold text-[var(--forest)]">Confirm selected property</h2>
              <p className="text-sm text-[var(--body)]">{application.propertySnapshot.title} at {formatCurrency(application.propertySnapshot.price)}</p>
            </Card>

            <Card className="space-y-4">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted-teal)]">Step 2</p>
              <h2 className="text-2xl font-semibold text-[var(--forest)]">Buyer profile summary</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Full name" value={user.fullName} readOnly />
                <Input label="Email" value={user.email} readOnly />
                <Input label="Phone" value={user.phone} readOnly />
                <Input label="Address" value={user.residentialAddress} readOnly />
              </div>
            </Card>

            <Card className="space-y-4">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted-teal)]">Step 3</p>
              <h2 className="text-2xl font-semibold text-[var(--forest)]">Document checklist</h2>
              <div className="space-y-3">
                {application.documents.map((document) => (
                  <div key={document.id} className="rounded-[24px] border border-[var(--surface-strong)] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-[var(--forest)]">{document.type}</p>
                        <p className="text-sm text-[var(--body)]">{document.name ? `Uploaded: ${document.name}` : 'Missing'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={document.status === 'missing' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
                          {document.status}
                        </Badge>
                        <label className="rounded-full bg-[var(--forest)] px-4 py-2 text-sm font-medium text-white">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(event) => {
                              const fileName = event.target.files?.[0]?.name
                              if (fileName) uploadApplicationDocument(application.id, document.type, fileName)
                            }}
                          />
                          Upload
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted-teal)]">Step 4</p>
              <h2 className="text-2xl font-semibold text-[var(--forest)]">Affordability</h2>
              <form
                className="grid gap-4 md:grid-cols-3"
                onChange={() => {
                  const values = affordabilityForm.getValues()
                  updateApplication(application.id, { affordability: values })
                }}
              >
                <Input label="Monthly income" type="number" {...affordabilityForm.register('monthlyIncome', { valueAsNumber: true })} error={affordabilityForm.formState.errors.monthlyIncome?.message} />
                <Input label="Existing obligations" type="number" {...affordabilityForm.register('existingObligations', { valueAsNumber: true })} error={affordabilityForm.formState.errors.existingObligations?.message} />
                <Input label="Preferred term (years)" type="number" {...affordabilityForm.register('preferredTermYears', { valueAsNumber: true })} error={affordabilityForm.formState.errors.preferredTermYears?.message} />
              </form>
            </Card>

            <Card className="space-y-4">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted-teal)]">Step 5</p>
              <h2 className="text-2xl font-semibold text-[var(--forest)]">Repayment mandate</h2>
              <form
                className="grid gap-4 md:grid-cols-3"
                onSubmit={mandateForm.handleSubmit((values) => {
                  updateApplication(application.id, { mandate: { ...values, validated: true } })
                })}
              >
                <Input label="Bank name" {...mandateForm.register('bankName')} error={mandateForm.formState.errors.bankName?.message} />
                <Input label="Account number" {...mandateForm.register('accountNumber')} error={mandateForm.formState.errors.accountNumber?.message} />
                <Input label="Account name" {...mandateForm.register('accountName')} error={mandateForm.formState.errors.accountName?.message} />
                <Button type="submit" className="md:col-span-3">
                  Validate mandate
                </Button>
              </form>
            </Card>

            <Card className="space-y-4">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted-teal)]">Step 6</p>
              <h2 className="text-2xl font-semibold text-[var(--forest)]">Review and submit</h2>
              <p className="text-sm text-[var(--body)]">
                Submit to ops when the mandatory documents and mandate are complete. Incomplete packages move to `docs_pending`.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    submitApplication(application.id)
                    navigate('/buyer')
                  }}
                >
                  Submit package
                </Button>
                <Badge className={readyToSubmit ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                  {readyToSubmit ? 'Ready to submit to bank' : 'Submit-to-bank gated until docs + mandate are complete'}
                </Badge>
              </div>
            </Card>
          </div>

          <Card className="space-y-4">
            <p className="text-lg font-semibold text-[var(--forest)]">Application snapshot</p>
            <p className="text-sm text-[var(--body)]">State: {WORKFLOW_CONFIG[application.state].label}</p>
            <p className="text-sm text-[var(--body)]">Next action: {WORKFLOW_CONFIG[application.state].nextAction}</p>
            <p className="text-sm text-[var(--body)]">Mandate validated: {application.mandate.validated ? 'Yes' : 'No'}</p>
            <div className="space-y-2">
              {application.documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[var(--body)]">{document.type}</span>
                  <Badge className={document.status === 'missing' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
                    {document.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </PageSection>
    </div>
  )
}
