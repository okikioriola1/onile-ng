import { StrictMode } from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { PublicShell } from './components/PublicShell'
import { MortgageApplicationPage } from './pages/BuyerPages'
import { useAppStore } from './store/useAppStore'

beforeEach(() => {
  localStorage.clear()
  useAppStore.setState(useAppStore.getInitialState(), true)
})

function renderApplication() {
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={['/buyer/apply/listing-1']}>
        <Routes>
          <Route path="/buyer/apply/:listingId" element={<MortgageApplicationPage />} />
        </Routes>
      </MemoryRouter>
    </StrictMode>,
  )
}

describe('mortgage draft lifecycle', () => {
  it('creates one draft under Strict Mode and keeps it selected after submission', async () => {
    useAppStore.setState({ currentUserId: 'buyer-1', applications: [] })
    renderApplication()

    expect(await screen.findByText('Mortgage application flow')).toBeInTheDocument()
    const applications = useAppStore.getState().applications
    expect(applications).toHaveLength(1)
    const applicationId = applications[0].id

    act(() => useAppStore.getState().submitApplication(applicationId))

    expect(screen.getByText('Mortgage application flow')).toBeInTheDocument()
    expect(useAppStore.getState().applications).toHaveLength(1)
    expect(useAppStore.getState().applications[0].id).toBe(applicationId)
    expect(useAppStore.getState().applications[0].state).toBe('docs_pending')
  })

  it('resumes an existing draft without creating another application', async () => {
    useAppStore.setState({ currentUserId: 'buyer-1', applications: [] })
    const draft = useAppStore.getState().createApplicationDraft('buyer-1', 'listing-1')
    renderApplication()

    expect(await screen.findByText('Mortgage application flow')).toBeInTheDocument()
    expect(useAppStore.getState().applications.map((application) => application.id)).toEqual([draft.id])
  })
})

function NavigationExample() {
  const navigate = useNavigate()
  return <PublicShell><button onClick={() => navigate('/marketplace')}>Change route</button></PublicShell>
}

it('closes the mobile menu when the route changes', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><NavigationExample /></MemoryRouter>)

  await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
  expect(screen.getByRole('button', { name: 'Close navigation menu' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Change route' }))
  expect(screen.getByRole('button', { name: 'Open navigation menu' })).toBeInTheDocument()
})
