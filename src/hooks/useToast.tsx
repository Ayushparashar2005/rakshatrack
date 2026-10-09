import React, { useState, useEffect } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

let toasts: Toast[] = []
let listeners: (() => void)[] = []

const notifyListeners = () => {
  for (const listener of listeners) {
    listener()
  }
}

export const toast = {
  success: (message: string) => addToast(message, 'success'),
  error: (message: string) => addToast(message, 'error'),
  info: (message: string) => addToast(message, 'info'),
}

function addToast(message: string, type: ToastType) {
  const id = Math.random().toString(36).substring(2, 9)
  toasts = [...toasts, { id, message, type }]
  notifyListeners()

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    notifyListeners()
  }, 3000)
}

export function useToastStore() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts)

  useEffect(() => {
    const listener = () => setCurrentToasts(toasts)
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  return currentToasts
}

export function Toaster() {
  const activeToasts = useToastStore()

  if (activeToasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {activeToasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-semibold transition-all animate-in fade-in slide-in-from-bottom-4 ${
            t.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : t.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-[--color-surface-raised] text-[--color-text-primary] border-[--color-border-subtle]'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {t.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-sky-600" />}
          <span>{t.message}</span>
          <button
            onClick={() => {
              toasts = toasts.filter((toast) => toast.id !== t.id)
              notifyListeners()
            }}
            className="ml-2 text-[--color-text-muted] hover:text-[--color-text-primary]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
