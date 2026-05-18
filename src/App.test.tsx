import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { Guard } from './App'
import { AuthPage } from './pages/AuthPages'
import { BuyerDashboardPage } from './pages/BuyerPages'
import { useAppStore } from './store/useAppStore'

function resetStore() {
  const initialState = useAppStore.getInitialState()
  useAppStore.setState(initialState, true)
}

describe('route guards', () => {
  beforeEach(() => {
    localStorage.clear()
    resetStore()
  })

  it('allows public auth route without login', () => {
    render(
      <MemoryRouter initialEntries={['/auth']}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText(/Sign in to a seeded role/i)).toBeInTheDocument()
  })

  it('blocks buyer route when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/buyer']}>
        <Routes>
          <Route path="/buyer" element={<Guard allowedRoles={['buyer']}><BuyerDashboardPage /></Guard>} />
          <Route path="/auth" element={<div>Auth route</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Auth route')).toBeInTheDocument()
  })

  it('redirects wrong role away from buyer route', () => {
    useAppStore.setState((state) => ({ ...state, currentUserId: 'seller-1' }))
    render(
      <MemoryRouter initialEntries={['/buyer']}>
        <Routes>
          <Route path="/buyer" element={<Guard allowedRoles={['buyer']}><BuyerDashboardPage /></Guard>} />
          <Route path="/seller" element={<div>Seller route</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Seller route')).toBeInTheDocument()
  })
})
