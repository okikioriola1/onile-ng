import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppUser,
  ListingDraftInput,
  MarketplaceFilters,
  MortgageApplication,
  NotificationItem,
  OnboardingDraft,
  PropertyListing,
  RegistrationPayload,
  SavingsAccount,
} from '../types'
import { buildNotificationsForRejection, getApplicationRequirements, getOnboardingRequirements } from '../lib/business'
import { createSeedState } from '../lib/seed'
import { futureDate, uniqueId } from '../lib/utils'

interface AppState {
  currentUserId?: string
  users: AppUser[]
  onboardingDrafts: Record<string, OnboardingDraft>
  listings: PropertyListing[]
  applications: MortgageApplication[]
  savingsAccounts: SavingsAccount[]
  notifications: NotificationItem[]
  marketplaceFilters: MarketplaceFilters
  login: (email: string, password: string) => { ok: boolean; message: string }
  demoLogin: (userId: string) => void
  logout: () => void
  registerUser: (payload: RegistrationPayload) => AppUser
  upsertOnboardingDraft: (userId: string, values: Partial<OnboardingDraft>) => void
  uploadOnboardingDocument: (userId: string, docType: string, fileName: string) => void
  submitOnboarding: (userId: string) => void
  toggleSaveListing: (userId: string, listingId: string) => void
  setMarketplaceFilters: (values: Partial<MarketplaceFilters>) => void
  createSavingsGoal: (userId: string, values: { name: string; targetAmount: number; targetDate?: string }) => void
  depositToGoal: (userId: string, values: { goalId: string; amount: number }) => void
  createApplicationDraft: (userId: string, listingId: string) => MortgageApplication
  updateApplication: (applicationId: string, values: Partial<MortgageApplication>) => void
  uploadApplicationDocument: (applicationId: string, docType: string, fileName: string) => void
  submitApplication: (applicationId: string) => void
  decideOffer: (applicationId: string, decision: 'accepted' | 'rejected' | 'clarification_requested', question?: string) => void
  adminReviewOnboarding: (userId: string, decision: 'approve' | 'reject', note: string) => void
  adminReviewListing: (listingId: string, decision: 'approve' | 'reject' | 'request_docs', note: string) => void
  adminAdvanceApplication: (applicationId: string, nextState: MortgageApplication['state'], note: string) => void
  adminToggleMilestone: (listingId: string, milestoneId: string) => void
  markNotificationRead: (notificationId: string) => void
  createListing: (userId: string, values: ListingDraftInput) => void
}

function sanitizePersistedState(persistedState: unknown): AppState {
  const state = persistedState as AppState
  const rawUsers = (state.users ?? []) as Array<AppState['users'][number]>
  const rawDrafts = (state.onboardingDrafts ?? {}) as Record<
    string,
    AppState['onboardingDrafts'][string]
  >
  const users = rawUsers.filter((user) => (user as { role?: string }).role !== 'developer') as AppUser[]
  const validUserIds = new Set(users.map((user) => user.id))
  const listings = (state.listings ?? []).map((listing) => ({
    ...listing,
    ownerRole: 'seller' as const,
    ownerId: validUserIds.has(listing.ownerId) ? listing.ownerId : 'seller-1',
    sellerInfo: {
      ...listing.sellerInfo,
      verifiedLabel: listing.sellerInfo.verifiedLabel.replace(/developer/gi, 'seller'),
    },
  }))

  return {
    ...state,
    currentUserId: state.currentUserId && validUserIds.has(state.currentUserId) ? state.currentUserId : undefined,
    users,
    onboardingDrafts: Object.fromEntries(
      Object.entries(rawDrafts).filter(
        ([, draft]) => (draft as { role?: string }).role !== 'developer' && validUserIds.has(draft.userId),
      ),
    ),
    savingsAccounts: (state.savingsAccounts ?? []).filter((account) => validUserIds.has(account.userId)),
    notifications: (state.notifications ?? [])
      .filter((notification) => !notification.userId || validUserIds.has(notification.userId))
      .map((notification) => ({
        ...notification,
        href: notification.href === '/developer' ? '/seller' : notification.href,
        message: notification.message.replace(/developer/gi, 'seller'),
      })),
    listings,
    applications: (state.applications ?? []).map((application) => ({
      ...application,
      notes: application.notes.map((note) => note.replace(/developer/gi, 'project')),
    })),
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createSeedState(),
      login: (email, password) => {
        const user = get().users.find((item) => item.email.toLowerCase() === email.toLowerCase())
        if (!user || user.password !== password) return { ok: false, message: 'Invalid demo credentials.' }
        set({ currentUserId: user.id })
        return { ok: true, message: 'Signed in successfully.' }
      },
      demoLogin: (userId) => set({ currentUserId: userId }),
      logout: () => set({ currentUserId: undefined }),
      registerUser: (payload) => {
        const user: AppUser = {
          id: uniqueId('user'),
          role: payload.role,
          fullName: payload.fullName,
          email: payload.email,
          password: payload.password,
          phone: payload.phone,
          residentialAddress: payload.residentialAddress,
          nin: payload.nin,
          bvn: payload.bvn,
          employmentType: payload.employmentType,
          accountState: 'registered',
          savedListingIds: [],
          applicationIds: [],
          listingIds: [],
        }
        const draft: OnboardingDraft = {
          userId: user.id,
          role: payload.role,
          currentStep: 0,
          completed: false,
          fullLegalName: payload.fullName,
          phone: payload.phone,
          email: payload.email,
          residentialAddress: payload.residentialAddress,
          nin: payload.nin,
          bvn: payload.bvn,
          employmentType: payload.employmentType,
          consents: { terms: false, privacy: false, dataSharing: false },
          documents: getOnboardingRequirements({ role: payload.role, employmentType: payload.employmentType }).map((label) => ({
            id: uniqueId('doc'),
            name: '',
            type: label,
            status: 'missing',
            required: true,
          })),
        }
        set((state) => ({
          users: [...state.users, user],
          onboardingDrafts: { ...state.onboardingDrafts, [user.id]: draft },
          currentUserId: user.id,
        }))
        return user
      },
      upsertOnboardingDraft: (userId, values) =>
        set((state) => ({
          onboardingDrafts: {
            ...state.onboardingDrafts,
            [userId]: {
              ...state.onboardingDrafts[userId],
              ...values,
            },
          },
        })),
      uploadOnboardingDocument: (userId, docType, fileName) =>
        set((state) => ({
          onboardingDrafts: {
            ...state.onboardingDrafts,
            [userId]: {
              ...state.onboardingDrafts[userId],
              documents: state.onboardingDrafts[userId].documents.map((doc) =>
                doc.type === docType
                  ? { ...doc, name: fileName, status: 'uploaded', uploadedAt: new Date().toISOString() }
                  : doc,
              ),
            },
          },
        })),
      submitOnboarding: (userId) =>
        set((state) => ({
          users: state.users.map((item) =>
            item.id === userId
              ? { ...item, accountState: 'kyc_pending', onboardingSubmittedAt: new Date().toISOString() }
              : item,
          ),
          onboardingDrafts: {
            ...state.onboardingDrafts,
            [userId]: { ...state.onboardingDrafts[userId], completed: true, currentStep: 4 },
          },
          notifications: [
            {
              id: uniqueId('notification'),
              type: 'onboarding_complete',
              title: 'Onboarding submitted',
              message: 'KYC package submitted for ops review.',
              href: '/auth/onboarding',
              userId,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        })),
      toggleSaveListing: (userId, listingId) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  savedListingIds: user.savedListingIds.includes(listingId)
                    ? user.savedListingIds.filter((id) => id !== listingId)
                    : [...user.savedListingIds, listingId],
                }
              : user,
          ),
        })),
      setMarketplaceFilters: (values) =>
        set((state) => ({ marketplaceFilters: { ...state.marketplaceFilters, ...values } })),
      createSavingsGoal: (userId, values) =>
        set((state) => ({
          savingsAccounts: state.savingsAccounts.map((account) =>
            account.userId === userId
              ? {
                  ...account,
                  goals: [
                    ...account.goals,
                    {
                      id: uniqueId('goal'),
                      name: values.name,
                      targetAmount: values.targetAmount,
                      currentAmount: 0,
                      targetDate: values.targetDate,
                    },
                  ],
                  activities: [
                    {
                      id: uniqueId('activity'),
                      type: 'goal_created',
                      description: `Created goal: ${values.name}`,
                      createdAt: new Date().toISOString(),
                    },
                    ...account.activities,
                  ],
                }
              : account,
          ),
        })),
      depositToGoal: (userId, values) =>
        set((state) => ({
          savingsAccounts: state.savingsAccounts.map((account) =>
            account.userId === userId
              ? {
                  ...account,
                  balance: account.balance + values.amount,
                  goals: account.goals.map((goal) =>
                    goal.id === values.goalId ? { ...goal, currentAmount: goal.currentAmount + values.amount } : goal,
                  ),
                  activities: [
                    {
                      id: uniqueId('activity'),
                      type: 'deposit',
                      goalId: values.goalId,
                      amount: values.amount,
                      description: 'Pay Now deposit credited instantly',
                      createdAt: new Date().toISOString(),
                    },
                    ...account.activities,
                  ],
                }
              : account,
          ),
        })),
      createApplicationDraft: (userId, listingId) => {
        const listing = get().listings.find((item) => item.id === listingId)
        const user = get().users.find((item) => item.id === userId)
        if (!listing || !user) throw new Error('Unable to start application.')
        const application: MortgageApplication = {
          id: uniqueId('application'),
          userId,
          listingId,
          propertySnapshot: {
            title: listing.title,
            price: listing.price,
            image: listing.images[0],
            location: `${listing.location.city}, ${listing.location.state}`,
            completionStatus: listing.completionStatus,
          },
          state: 'started',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          affordability: { monthlyIncome: 0, existingObligations: 0, preferredTermYears: 15 },
          mandate: { bankName: '', accountNumber: '', accountName: '', validated: false },
          documents: getApplicationRequirements(listing).map((type) => ({
            id: uniqueId('doc'),
            name: '',
            type,
            status: 'missing',
            required: true,
          })),
          notes: [],
          workflow: [
            {
              id: uniqueId('workflow'),
              fromState: null,
              toState: 'started',
              actor: user.fullName,
              actorRole: user.role,
              createdAt: new Date().toISOString(),
            },
          ],
          auditTrail: [
            {
              id: uniqueId('audit'),
              actorName: user.fullName,
              actorRole: user.role,
              action: 'Started mortgage application',
              createdAt: new Date().toISOString(),
            },
          ],
        }
        set((state) => ({
          applications: [...state.applications, application],
          users: state.users.map((item) =>
            item.id === userId ? { ...item, applicationIds: [...item.applicationIds, application.id] } : item,
          ),
        }))
        return application
      },
      updateApplication: (applicationId, values) =>
        set((state) => ({
          applications: state.applications.map((application) =>
            application.id === applicationId
              ? { ...application, ...values, updatedAt: new Date().toISOString() }
              : application,
          ),
        })),
      uploadApplicationDocument: (applicationId, docType, fileName) =>
        set((state) => ({
          applications: state.applications.map((application) =>
            application.id === applicationId
              ? {
                  ...application,
                  updatedAt: new Date().toISOString(),
                  documents: application.documents.map((document) =>
                    document.type === docType
                      ? { ...document, name: fileName, status: 'uploaded', uploadedAt: new Date().toISOString() }
                      : document,
                  ),
                }
              : application,
          ),
        })),
      submitApplication: (applicationId) =>
        set((state) => ({
          applications: state.applications.map((application) => {
            if (application.id !== applicationId) return application
            const allDocsPresent = application.documents.every((doc) => doc.status === 'uploaded' || doc.status === 'approved')
            const nextState = allDocsPresent ? 'under_verification' : 'docs_pending'
            return {
              ...application,
              state: nextState,
              updatedAt: new Date().toISOString(),
              workflow: [
                ...application.workflow,
                {
                  id: uniqueId('workflow'),
                  fromState: application.state,
                  toState: nextState,
                  actor: 'Applicant',
                  actorRole: 'buyer',
                  createdAt: new Date().toISOString(),
                },
              ],
              auditTrail: [
                ...application.auditTrail,
                {
                  id: uniqueId('audit'),
                  actorName: 'Applicant',
                  actorRole: 'buyer',
                  action: allDocsPresent ? 'Submitted complete package' : 'Submitted with missing documents',
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          }),
        })),
      decideOffer: (applicationId, decision, question) =>
        set((state) => ({
          applications: state.applications.map((application) =>
            application.id === applicationId && application.offer
              ? {
                  ...application,
                  state: decision === 'accepted' ? 'mandate_pending' : application.state,
                  offer: {
                    ...application.offer,
                    status: decision,
                    clarificationQuestion: question,
                  },
                  auditTrail: [
                    ...application.auditTrail,
                    {
                      id: uniqueId('audit'),
                      actorName: 'Buyer',
                      actorRole: 'buyer',
                      action: `Offer ${decision.replace('_', ' ')}`,
                      note: question,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : application,
          ),
        })),
      adminReviewOnboarding: (userId, decision, note) =>
        set((state) => {
          const user = state.users.find((item) => item.id === userId)
          if (!user) return state
          const notifications: NotificationItem[] =
            decision === 'reject'
              ? [buildNotificationsForRejection(userId), ...state.notifications]
              : [
                  {
                    id: uniqueId('notification'),
                    type: 'savings_account_created',
                    title: 'Savings account created',
                    message: note,
                    href: '/buyer',
                    userId,
                    read: false,
                    createdAt: new Date().toISOString(),
                  },
                  ...state.notifications,
                ]
          const existingSavings = state.savingsAccounts.find((account) => account.userId === userId)
          return {
            users: state.users.map((item) =>
              item.id === userId
                ? { ...item, accountState: decision === 'approve' ? 'verified' : 'restricted' }
                : item,
            ),
            savingsAccounts:
              decision === 'approve' && !existingSavings
                ? [
                    ...state.savingsAccounts,
                    {
                      userId,
                      status: 'created',
                      accountNumber: `90${Math.floor(Math.random() * 100000000)}`.padEnd(10, '1'),
                      accountName: `${user.fullName} - Onilé Savings`,
                      balance: 0,
                      goals: [],
                      activities: [
                        {
                          id: uniqueId('activity'),
                          type: 'account_created',
                          description: 'Savings account created by partner bank',
                          createdAt: new Date().toISOString(),
                        },
                      ],
                    },
                  ]
                : state.savingsAccounts,
            notifications,
          }
        }),
      adminReviewListing: (listingId, decision, note) =>
        set((state) => ({
          listings: state.listings.map((listing) =>
            listing.id === listingId
              ? {
                  ...listing,
                  status:
                    decision === 'approve'
                      ? 'live'
                      : decision === 'reject'
                        ? 'rejected'
                        : 'under_review',
                  verificationBadge: decision === 'approve',
                  reviewComments: [note, ...listing.reviewComments],
                }
              : listing,
          ),
        })),
      adminAdvanceApplication: (applicationId, nextState, note) =>
        set((state) => ({
          applications: state.applications.map((application) =>
            application.id === applicationId
              ? {
                  ...application,
                  state: nextState,
                  updatedAt: new Date().toISOString(),
                  repayment:
                    nextState === 'repayment_active'
                      ? {
                          nextDueDate: futureDate(30),
                          amount: application.offer?.monthlyRepayment ?? 0,
                          mandateStatus: 'active',
                        }
                      : application.repayment,
                  workflow: [
                    ...application.workflow,
                    {
                      id: uniqueId('workflow'),
                      fromState: application.state,
                      toState: nextState,
                      actor: 'Onilé Ops',
                      actorRole: 'admin',
                      note,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                  auditTrail: [
                    ...application.auditTrail,
                    {
                      id: uniqueId('audit'),
                      actorName: 'Onilé Ops',
                      actorRole: 'admin',
                      action: `Moved application to ${nextState}`,
                      note,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : application,
          ),
          notifications: [
            ...state.notifications,
            {
              id: uniqueId('notification'),
              type: nextState === 'disbursed' ? 'disbursement_confirmed' : 'application_state_change',
              title: nextState === 'disbursed' ? 'Disbursement confirmed' : 'Application state changed',
              message: note,
              href: '/buyer',
              userId: state.applications.find((application) => application.id === applicationId)?.userId,
              read: false,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      adminToggleMilestone: (listingId, milestoneId) =>
        set((state) => ({
          listings: state.listings.map((listing) =>
            listing.id === listingId && listing.milestoneChecklist
              ? {
                  ...listing,
                  milestoneChecklist: listing.milestoneChecklist.map((milestone) =>
                    milestone.id === milestoneId ? { ...milestone, done: !milestone.done } : milestone,
                  ),
                }
              : listing,
          ),
        })),
      markNotificationRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.id === notificationId ? { ...item, read: true } : item,
          ),
        })),
      createListing: (userId, values) =>
        set((state) => {
          const user = state.users.find((item) => item.id === userId)
          const listingId = uniqueId('listing')
          return {
            listings: [
              {
                id: listingId,
                ownerId: userId,
                ownerRole: 'seller',
                title: values.title,
                location: { state: values.state, city: values.city },
                price: values.price,
                propertyType: values.propertyType,
                completionStatus: values.completionStatus,
                mortgageEligible: values.mortgageEligible,
                verificationBadge: false,
                status: 'draft',
                description: values.description,
                images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'],
                documentsReady: false,
                sellerInfo: {
                  name: user?.fullName ?? 'Listing owner',
                  verifiedLabel: 'Pending verification',
                },
                reviewComments: ['Draft created'],
                buyerInterestCount: 0,
                activeFinancedTransactions: 0,
                milestoneChecklist:
                  values.completionStatus === 'off-plan'
                    ? [
                        { id: uniqueId('milestone'), label: 'Planning approval', done: false },
                        { id: uniqueId('milestone'), label: 'Structural milestone', done: false },
                      ]
                    : undefined,
                documentStatus: [],
              },
              ...state.listings,
            ],
            users: state.users.map((item) =>
              item.id === userId ? { ...item, listingIds: [...item.listingIds, listingId] } : item,
            ),
          }
        }),
    }),
    {
      name: 'onile-ng-store',
      version: 2,
      migrate: (persistedState) => sanitizePersistedState(persistedState),
    },
  ),
)

export const useCurrentUser = () =>
  useAppStore((state) => state.users.find((user) => user.id === state.currentUserId))
