import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value?: string) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function uniqueId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

export function futureDate(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}
