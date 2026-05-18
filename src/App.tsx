import { lazy, Suspense, useEffect } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { PublicShell } from './components/PublicShell'
import { getRoleDashboardPath } from './lib/business'
import { useCurrentUser } from './store/useAppStore'

const HomePage = lazy(() => import('./pages/PublicPages').then((module) => ({ default: module.HomePage })))
const MarketplacePage = lazy(() => import('./pages/PublicPages').then((module) => ({ default: module.MarketplacePage })))
const ListingDetailPage = lazy(() => import('./pages/PublicPages').then((module) => ({ default: module.ListingDetailPage })))
const AuthPage = lazy(() => import('./pages/AuthPages').then((module) => ({ default: module.AuthPage })))
const OnboardingPage = lazy(() => import('./pages/AuthPages').then((module) => ({ default: module.OnboardingPage })))
const BuyerDashboardPage = lazy(() => import('./pages/BuyerPages').then((module) => ({ default: module.BuyerDashboardPage })))
const MortgageApplicationPage = lazy(() => import('./pages/BuyerPages').then((module) => ({ default: module.MortgageApplicationPage })))
const PartnerDashboardPage = lazy(() => import('./pages/PartnerPages').then((module) => ({ default: module.PartnerDashboardPage })))
const AdminDashboardPage = lazy(() => import('./pages/AdminPages').then((module) => ({ default: module.AdminDashboardPage })))

export function Guard({
  children,
  allowedRoles,
}: {
  children: ReactNode
  allowedRoles?: string[]
}) {
  const user = useCurrentUser()
  if (!user) return <Navigate to="/auth" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={getRoleDashboardPath(user)} replace />
  return <>{children}</>
}

function AppRoutes() {
  const user = useCurrentUser()
  useEffect(() => {
    document.title = 'Onilé'
  }, [])

  return (
    <Suspense fallback={<div className="mx-auto max-w-[1320px] rounded-[28px] bg-[var(--card)] p-6 text-sm text-[var(--body)]">Loading workspace...</div>}>
      <Routes>
        <Route
          path="/"
          element={
            <PublicShell>
              <HomePage />
            </PublicShell>
          }
        />
        <Route
          path="/marketplace"
          element={
            <PublicShell>
              <MarketplacePage />
            </PublicShell>
          }
        />
        <Route
          path="/listing/:listingId"
          element={
            <PublicShell>
              <ListingDetailPage />
            </PublicShell>
          }
        />
        <Route
          path="/auth"
          element={
            <PublicShell>
              {user ? <Navigate to={getRoleDashboardPath(user)} replace /> : <AuthPage />}
            </PublicShell>
          }
        />
        <Route
          path="/auth/onboarding"
          element={
            <AppShell>
              <Guard allowedRoles={['buyer', 'seller']}><OnboardingPage /></Guard>
            </AppShell>
          }
        />
        <Route
          path="/buyer"
          element={
            <AppShell>
              <Guard allowedRoles={['buyer']}><BuyerDashboardPage /></Guard>
            </AppShell>
          }
        />
        <Route
          path="/buyer/apply/:listingId"
          element={
            <AppShell>
              <Guard allowedRoles={['buyer']}><MortgageApplicationPage /></Guard>
            </AppShell>
          }
        />
        <Route
          path="/seller"
          element={
            <AppShell>
              <Guard allowedRoles={['seller']}><PartnerDashboardPage /></Guard>
            </AppShell>
          }
        />
        <Route
          path="/admin"
          element={
            <AppShell>
              <Guard allowedRoles={['admin']}><AdminDashboardPage /></Guard>
            </AppShell>
          }
        />
        <Route path="/developer" element={<Navigate to="/seller" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
