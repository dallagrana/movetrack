import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, format, parseISO, isValid } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = parseISO(dateStr)
  return isValid(date) ? format(date, 'MMM d, yyyy') : '—'
}

export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  const date = parseISO(dateStr)
  if (!isValid(date)) return null
  return differenceInDays(date, new Date())
}

export function countdownLabel(days: number | null): string {
  if (days === null) return 'No move date set'
  if (days < 0) return `${Math.abs(days)} days ago`
  if (days === 0) return 'Moving day!'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

export function getCategoryColor(categoryName: string | undefined): string {
  const colors: Record<string, string> = {
    Utilities: '#3B82F6',
    Packing: '#F59E0B',
    Legal: '#8B5CF6',
    Moving: '#10B981',
    Administrative: '#6B7280',
  }
  return categoryName ? (colors[categoryName] ?? '#6B7280') : '#6B7280'
}
