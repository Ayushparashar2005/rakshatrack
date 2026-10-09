import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return isoString
  }
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return isoString
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
    if (diff < 5) return 'just now'
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  } catch {
    return isoString
  }
}
