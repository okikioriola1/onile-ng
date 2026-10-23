import { Home, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'For Buyers', href: '/#for-buyers' },
  { label: 'For Sellers', href: '/#for-sellers' },
]

export function PublicShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const [menuLocation, setMenuLocation] = useState(location.pathname + location.hash)

  // Reset navigation state as the route changes, before rendering the new page.
  const currentLocation = location.pathname + location.hash
  if (menuLocation !== currentLocation) {
    setMenuLocation(currentLocation)
    setMobileOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-sage-50 text-sage-900">
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 border-b border-sage-100/80 bg-warm-white/85 backdrop-blur-xl transition-shadow duration-300',
          scrolled ? 'shadow-md' : 'shadow-none',
        )}
      >
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-900/6 text-gold-500">
              <Home size={20} />
            </div>
            <span className="text-2xl font-bold text-sage-900">Onilé</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-body transition-colors duration-200 hover:text-sage-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/auth"
              className="rounded-full border border-sage-500/50 px-5 py-2.5 text-sm font-semibold text-sage-900 transition-colors hover:bg-sage-50"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              className="rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-sage-900 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-gold-400"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sage-100 bg-white text-sage-900 lg:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div
          className={cn(
            'overflow-hidden border-t border-sage-100 bg-warm-white transition-[max-height,opacity] duration-300 ease-out lg:hidden',
            mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-2xl px-2 py-2 text-sm font-medium text-sage-900 transition-colors hover:bg-sage-50"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-3">
              <Link
                to="/auth"
                className="rounded-full border border-sage-500/50 px-5 py-3 text-center text-sm font-semibold text-sage-900"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="rounded-full bg-gold-500 px-5 py-3 text-center text-sm font-semibold text-sage-900"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24">{children}</main>
    </div>
  )
}
