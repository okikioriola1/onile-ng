import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { canMoveToDisbursement } from '../lib/business'
import { formatCurrency } from '../lib/utils'
import { useAppStore, useCurrentUser } from '../store/useAppStore'
import { Button, Card, EmptyState, Input, PageSection, Select, TextArea } from '../components/ui'
import type { ListingDraftInput } from '../types'

const listingSchema = z.object({
  title: z.string().min(3),
  state: z.string().min(2),
  city: z.string().min(2),
  price: z.number().min(10_000_000),
  propertyType: z.enum(['Apartment', 'Terrace', 'Duplex', 'Bungalow', 'Maisonette']),
  completionStatus: z.enum(['completed', 'off-plan']),
  mortgageEligible: z.enum(['yes', 'no']),
  description: z.string().min(12),
})

export function PartnerDashboardPage() {
  const user = useCurrentUser()
  const allListings = useAppStore((state) => state.listings)
  const allApplications = useAppStore((state) => state.applications)
  const createListing = useAppStore((state) => state.createListing)
  const listings = useMemo(
    () => allListings.filter((listing) => listing.ownerId === user?.id),
    [allListings, user?.id],
  )
  const form = useForm<z.infer<typeof listingSchema>>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      state: 'Lagos',
      city: '',
      price: 80_000_000,
      propertyType: 'Apartment',
      completionStatus: 'completed',
      mortgageEligible: 'yes',
      description: '',
    },
  })

  if (!user) return null

  if (user.accountState !== 'verified') {
    return <EmptyState title="Listing creation locked" body="Only verified sellers can create listings." />
  }

  return (
    <div className="space-y-8">
      <PageSection title="Seller dashboard" subtitle="Manage listing states, review comments, financing activity, and disbursement readiness.">
        <div className="grid gap-6 xl:grid-cols-[1fr,360px]">
          <div className="space-y-5">
            {listings.map((listing) => {
              const relatedApplications = allApplications.filter((application) => application.listingId === listing.id)
              return (
                <Card key={listing.id} className="space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xl font-semibold text-[var(--forest)]">{listing.title}</p>
                      <p className="mt-1 text-sm text-[var(--body)]">{listing.location.city}, {listing.location.state}</p>
                      <p className="mt-3 text-sm text-[var(--body)]">State: {listing.status}</p>
                    </div>
                    <p className="text-xl font-semibold text-[var(--forest)]">{formatCurrency(listing.price)}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[24px] bg-[var(--surface)] p-4">
                      <p className="text-sm text-[var(--body)]">Buyer interest</p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--forest)]">{listing.buyerInterestCount}</p>
                    </div>
                    <div className="rounded-[24px] bg-[var(--surface)] p-4">
                      <p className="text-sm text-[var(--body)]">Financed transactions</p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--forest)]">{listing.activeFinancedTransactions}</p>
                    </div>
                    <div className="rounded-[24px] bg-[var(--surface)] p-4">
                      <p className="text-sm text-[var(--body)]">Docs ready</p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--forest)]">{listing.documentsReady ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="rounded-[24px] bg-[var(--surface)] p-4">
                      <p className="text-sm text-[var(--body)]">Disbursement readiness</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--forest)]">
                        {relatedApplications.some((application) => canMoveToDisbursement(application, listing)) ? 'Ready' : 'Blocked'}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3 rounded-[24px] bg-[var(--surface)] p-4">
                      <p className="font-semibold text-[var(--forest)]">Review comments</p>
                      {listing.reviewComments.map((comment) => (
                        <p key={comment} className="text-sm text-[var(--body)]">{comment}</p>
                      ))}
                    </div>
                    <div className="space-y-3 rounded-[24px] bg-[var(--surface)] p-4">
                      <p className="font-semibold text-[var(--forest)]">Document status</p>
                      {listing.documentStatus.map((document) => (
                        <div key={document.id} className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-[var(--body)]">{document.type}</span>
                          <span className={document.status === 'rejected' ? 'text-red-700' : 'text-[var(--muted-teal)]'}>{document.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {listing.milestoneChecklist?.length ? (
                    <div className="rounded-[24px] bg-[var(--surface)] p-4">
                      <p className="font-semibold text-[var(--forest)]">Milestone checklist</p>
                      <div className="mt-3 space-y-2">
                        {listing.milestoneChecklist.map((milestone) => (
                          <div key={milestone.id} className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-[var(--body)]">{milestone.label}</span>
                            <span className={milestone.done ? 'text-green-700' : 'text-amber-700'}>{milestone.done ? 'Done' : 'Pending'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </Card>
              )
            })}
          </div>

          <Card className="space-y-4">
            <p className="text-lg font-semibold text-[var(--forest)]">Create new listing</p>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => {
                const payload: ListingDraftInput = {
                  ...values,
                  mortgageEligible: values.mortgageEligible === 'yes',
                }
                createListing(user.id, payload)
                form.reset()
              })}
            >
              <Input label="Listing title" {...form.register('title')} error={form.formState.errors.title?.message} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="State" {...form.register('state')} error={form.formState.errors.state?.message} />
                <Input label="City" {...form.register('city')} error={form.formState.errors.city?.message} />
              </div>
              <Input label="Price" type="number" {...form.register('price', { valueAsNumber: true })} error={form.formState.errors.price?.message} />
              <Select label="Property type" {...form.register('propertyType')} error={form.formState.errors.propertyType?.message}>
                <option value="Apartment">Apartment</option>
                <option value="Terrace">Terrace</option>
                <option value="Duplex">Duplex</option>
                <option value="Bungalow">Bungalow</option>
                <option value="Maisonette">Maisonette</option>
              </Select>
              <Select label="Completion status" {...form.register('completionStatus')} error={form.formState.errors.completionStatus?.message}>
                <option value="completed">Completed</option>
                <option value="off-plan">Off-plan</option>
              </Select>
              <Select label="Mortgage eligibility" {...form.register('mortgageEligible')} error={form.formState.errors.mortgageEligible?.message}>
                <option value="yes">Mortgage eligible</option>
                <option value="no">Cash only</option>
              </Select>
              <TextArea label="Description" {...form.register('description')} error={form.formState.errors.description?.message} />
              <Button type="submit" className="w-full">
                Create draft listing
              </Button>
            </form>
          </Card>
        </div>
      </PageSection>
    </div>
  )
}
