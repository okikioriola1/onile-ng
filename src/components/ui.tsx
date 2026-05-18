import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../lib/utils'

export function PageSection({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-[1.7rem] font-semibold tracking-[-0.03em] text-[var(--forest)]">{title}</h2>
          {subtitle ? <p className="max-w-2xl text-sm leading-6 text-[var(--body)]">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Card({
  className,
  children,
  ...props
}: {
  className?: string
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(250,250,248,0.96),rgba(250,250,248,0.92))] p-5 shadow-[0_20px_50px_rgba(31,74,53,0.08)] ring-1 ring-[rgba(255,255,255,0.45)] backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string
  value: string
  helper?: string
  icon?: ReactNode
}) {
  return (
    <Card className="relative overflow-hidden p-0">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(58,122,104,0.18),rgba(201,146,58,0.58),rgba(58,122,104,0.18))]" />
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--body)]">{label}</p>
          <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--forest)]">{value}</p>
          {helper ? <p className="max-w-[18rem] text-xs leading-5 text-[var(--muted-teal)]">{helper}</p> : null}
        </div>
        {icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(31,74,53,0.08)] text-[var(--forest)]">
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  )
}

export function Badge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-medium', className)}>
      {children}
    </span>
  )
}

export function ProgressBar({
  value,
}: {
  value: number
}) {
  return (
    <div className="h-2.5 rounded-full bg-[var(--surface)]">
      <div className="h-full rounded-full bg-[var(--gold)] transition-all" style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  )
}

export function Input({
  label,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; className?: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[var(--forest)]">{label}</span>
      <input
        {...props}
        className={cn(
          'w-full rounded-[20px] border border-[var(--surface-strong)] bg-white/92 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--muted-teal)] focus:ring-2 focus:ring-[rgba(58,122,104,0.15)]',
          className,
        )}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
}

export function Select({
  label,
  error,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[var(--forest)]">{label}</span>
      <select
        {...props}
        className={cn(
          'w-full rounded-[20px] border border-[var(--surface-strong)] bg-white/92 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--muted-teal)] focus:ring-2 focus:ring-[rgba(58,122,104,0.15)]',
          className,
        )}
      >
        {children}
      </select>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
}

export function TextArea({
  label,
  error,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; className?: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[var(--forest)]">{label}</span>
      <textarea
        {...props}
        className={cn(
          'min-h-32 w-full rounded-[20px] border border-[var(--surface-strong)] bg-white/92 px-4 py-3.5 text-sm outline-none transition focus:border-[var(--muted-teal)] focus:ring-2 focus:ring-[rgba(58,122,104,0.15)]',
          className,
        )}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
}

export function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; className?: string; children: ReactNode }) {
  const styles = {
    primary: 'bg-[var(--gold)] text-[var(--forest)] shadow-[0_12px_24px_rgba(201,146,58,0.22)] hover:bg-[#d7a24a]',
    secondary: 'bg-[var(--muted-teal)] text-white shadow-[0_12px_24px_rgba(58,122,104,0.18)] hover:bg-[#316d5d]',
    ghost: 'bg-white/88 text-[var(--forest)] hover:bg-[var(--surface)]',
    danger: 'bg-[#C0392B] text-white shadow-[0_12px_24px_rgba(192,57,43,0.2)] hover:bg-[#a83327]',
  }
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  )
}

export function EmptyState({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <Card className="border-dashed text-center">
      <p className="text-lg font-semibold text-[var(--forest)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--body)]">{body}</p>
    </Card>
  )
}

export function ShellNavLink({
  to,
  icon,
  label,
}: {
  to: string
  icon: ReactNode
  label: string
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'group flex w-full items-center gap-3 rounded-[22px] px-4 py-3.5 text-sm font-medium transition duration-200',
          isActive
            ? 'bg-[linear-gradient(90deg,rgba(232,240,236,0.18),rgba(232,240,236,0.1))] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]'
            : 'text-white hover:bg-white/10 hover:text-white',
        )
      }
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition group-hover:bg-white/14">
        {icon}
      </span>
      <span className="block flex-1 text-[15px] font-semibold tracking-[-0.01em] text-white">{label}</span>
    </NavLink>
  )
}
