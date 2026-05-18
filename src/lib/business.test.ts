import { describe, expect, it } from 'vitest'
import { canMoveToDisbursement, canStartMortgage, canSubmitApplication, filterListings, getVisibleListings } from './business'
import { seedApplications, seedListings, seedSavingsAccounts, seedUsers } from './seed'

describe('business rules', () => {
  it('shows only verified live listings publicly', () => {
    const visible = getVisibleListings(seedListings)
    expect(visible.every((listing) => listing.status === 'live' && listing.verificationBadge)).toBe(true)
    expect(visible).toHaveLength(3)
  })

  it('filters marketplace listings by search and mortgage status', () => {
    const filtered = filterListings(seedListings, {
      search: 'harbour',
      state: '',
      city: '',
      propertyType: '',
      completionStatus: '',
      mortgageEligible: 'yes',
      maxPrice: 300_000_000,
    })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].title).toContain('Harbour')
  })

  it('requires verified buyer with created bank account to start mortgage', () => {
    expect(canStartMortgage(seedUsers[0], seedSavingsAccounts[0])).toBe(true)
    expect(canStartMortgage(seedUsers[2], seedSavingsAccounts[2])).toBe(false)
  })

  it('requires complete docs and validated mandate before submit readiness', () => {
    expect(canSubmitApplication(seedApplications[0])).toBe(true)
    const invalidApp = {
      ...seedApplications[0],
      mandate: { ...seedApplications[0].mandate, validated: false },
    }
    expect(canSubmitApplication(invalidApp)).toBe(false)
  })

  it('blocks off-plan disbursement until milestones are complete', () => {
    expect(canMoveToDisbursement(seedApplications[1], seedListings[1])).toBe(false)
    const readyListing = {
      ...seedListings[1],
      milestoneChecklist: seedListings[1].milestoneChecklist?.map((milestone) => ({ ...milestone, done: true })),
    }
    expect(canMoveToDisbursement(seedApplications[1], readyListing)).toBe(true)
  })
})
