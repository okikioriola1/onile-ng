import { Bell, Building2, House, LayoutDashboard, LogOut, ShieldCheck, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { filterNotificationsForUser, getRoleDashboardPath, getUnreadNotificationCount } from '../lib/business'
import { formatDate } from '../lib/utils'
import { useAppStore, useCurrentUser } from '../store/useAppStore'
import { Card, ShellNavLink } from './ui'

export function AppShell({ children }: { children: ReactNode }) {
  const user = useCurrentUser()
  const logout = useAppStore((state) => state.logout)
  const notifications = useAppStore((state) => state.notifications)
  const markNotificationRead = useAppStore((state) => state.markNotificationRead)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const scopedNotifications = useMemo(() => filterNotificationsForUser(notifications, user), [notifications, user])
  const unread = getUnreadNotificationCount(scopedNotifications, user?.id)

  const navItems = useMemo(() => {
    const base = [{ label: 'Marketplace', to: '/marketplace', icon: <House size={18} /> }]
    if (!user) return base
    if (user.role === 'buyer') {
      return [
        { label: 'Buyer', to: '/buyer', icon: <LayoutDashboard size={18} /> },
        { label: 'Marketplace', to: '/marketplace', icon: <House size={18} /> },
        { label: 'Savings', to: '/buyer#savings', icon: <Wallet size={18} /> },
      ]
    }
    if (user.role === 'seller') {
      return [
        { label: 'Seller', to: '/seller', icon: <Building2 size={18} /> },
        { label: 'Marketplace', to: '/marketplace', icon: <House size={18} /> },
      ]
    }
    return [
      { label: 'Admin', to: '/admin', icon: <ShieldCheck size={18} /> },
      { label: 'Marketplace', to: '/marketplace', icon: <House size={18} /> },
    ]
  }, [user])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(201,146,58,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(58,122,104,0.12),transparent_28%),var(--surface)]">
      <div className="flex min-h-screen w-full">
        <aside className="sticky top-0 hidden h-screen w-[290px] shrink-0 flex-col overflow-hidden border-r border-white/8 bg-[linear-gradient(180deg,#234d39_0%,#1f4a35_52%,#183c2c_100%)] lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(201,146,58,0.12),transparent_28%)]" />
          <div className="relative flex h-full flex-col px-6 py-7">
            <Link to="/" className="rounded-[30px] border border-white/10 bg-white/[0.03] px-5 py-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="text-[11px] uppercase tracking-[0.34em] text-white/55">Onilé</p>
              <p className="mt-3 text-[1.85rem] font-semibold leading-tight tracking-[-0.04em]">Your verified path to home ownership.</p>
              <p className="mt-3 text-sm leading-6 text-white/68">Mortgage-ready discovery, bank-linked savings, and structured financing workflows.</p>
            </Link>

            <div className="mt-8">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Workspace</p>
              <nav className="mt-3 space-y-2">
                {navItems.map((item) => (
                  <ShellNavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
                ))}
              </nav>
            </div>

            <div className="mt-auto space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Current session</p>
                <p className="mt-3 text-lg font-semibold tracking-[-0.02em]">{user ? user.fullName : 'Public visitor'}</p>
                <p className="mt-1 text-sm capitalize text-white/72">{user ? user.role : 'Marketplace access only'}</p>
              </div>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              ) : null}
            </div>
          </div>
        </aside>

        <main className="relative min-w-0 flex-1 px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.46),transparent_68%)]" />
          <header className="relative mb-7 flex flex-col gap-4 rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,rgba(250,250,248,0.96),rgba(250,250,248,0.9))] px-5 py-5 shadow-[0_18px_45px_rgba(31,74,53,0.08)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted-teal)]">
                {location.pathname === '/' ? 'Public marketplace' : user ? `${user.role} workspace` : 'Guest flow'}
              </p>
              <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--forest)] sm:text-[2rem]">
                {user ? `Welcome back, ${user.fullName.split(' ')[0]}` : 'Explore verified residential listings'}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[var(--body)]">
                {user
                  ? 'Track savings, applications, documents, and next actions from one calm workspace.'
                  : 'Browse verified listings and move into the right flow when you are ready.'}
              </p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              {user ? (
                <Link
                  to={getRoleDashboardPath(user)}
                  className="hidden rounded-full bg-[var(--muted-teal)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(58,122,104,0.18)] sm:inline-flex"
                >
                  Dashboard
                </Link>
              ) : (
                <Link to="/auth" className="hidden rounded-full bg-[var(--gold)] px-4 py-2.5 text-sm font-semibold text-[var(--forest)] shadow-[0_10px_24px_rgba(201,146,58,0.22)] sm:inline-flex">
                  Sign in
                </Link>
              )}
              <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/72 text-[var(--forest)] shadow-[0_10px_26px_rgba(31,74,53,0.06)] backdrop-blur-sm"
              >
                <Bell size={18} />
                {unread ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[var(--gold)]" /> : null}
              </button>
            </div>
          </header>

          {open ? (
            <Card className="mb-6 max-h-80 overflow-auto">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-[var(--forest)]">Notifications</p>
                  <p className="text-sm text-[var(--body)]">{unread} unread</p>
                </div>
              </div>
              <div className="space-y-3">
                {scopedNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => {
                      markNotificationRead(notification.id)
                      navigate(notification.href)
                      setOpen(false)
                    }}
                    className="w-full rounded-2xl border border-[var(--surface-strong)] p-4 text-left transition hover:bg-[var(--surface)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-[var(--forest)]">{notification.title}</p>
                        <p className="mt-1 text-sm text-[var(--body)]">{notification.message}</p>
                      </div>
                      {!notification.read ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--gold)]" /> : null}
                    </div>
                    <p className="mt-2 text-xs text-[var(--body)]">{formatDate(notification.createdAt)}</p>
                  </button>
                ))}
              </div>
            </Card>
          ) : null}

          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--surface-strong)] bg-[var(--forest)]/98 px-3 py-2 lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={location.pathname.startsWith(item.to) ? 'rounded-2xl bg-white/12 px-4 py-3 text-xs font-medium text-white' : 'rounded-2xl px-4 py-3 text-xs font-medium text-white/82'}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
