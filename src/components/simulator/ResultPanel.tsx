import React, { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { CheckCircle2, AlertTriangle, User, Bus as BusIcon, Info } from 'lucide-react'
import type { TapEvent, VerificationEvidence } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'

interface ResultPanelProps {
  tap: TapEvent
  verification: VerificationEvidence
  message: string
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ tap, verification, message }) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)

  const isVerified = verification.status === 'verified'

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Panel entrance animation
      gsap.fromTo(
        panelRef.current,
        { y: 40, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)' }
      )

      // Distance counter animation
      if (counterRef.current) {
        gsap.to(counterRef.current, {
          innerText: verification.distanceMeters,
          snap: { innerText: 1 },
          duration: 0.8,
          ease: 'power2.out',
        })
      }
    }, panelRef)

    return () => ctx.revert()
  }, [verification.distanceMeters, tap.id])

  return (
    <div ref={panelRef} className="mt-4 border border-[--color-border-mid] rounded-xl overflow-hidden shadow-sm bg-[--color-surface-base]">
      <div
        className={`p-3 flex items-start gap-3 border-b ${
          isVerified
            ? 'bg-emerald-50 border-emerald-100 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        {isVerified ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <div className="font-bold text-sm">{message}</div>
          <div className={`text-xs mt-1 ${isVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
            ID: <span className="font-mono">{tap.id.slice(0, 8)}</span> • {formatRelativeTime(tap.timestamp)}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Verification Stats */}
        <div>
          <div className="text-[10px] font-bold text-[--color-text-muted] uppercase tracking-wider mb-2">
            Verification Engine Result
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 rounded-lg bg-[--color-surface-raised] border border-[--color-border-subtle]">
              <div className="text-[10px] text-[--color-text-secondary] mb-1">GPS Distance</div>
              <div className="font-mono text-sm font-bold flex items-baseline gap-1 text-[--color-text-primary]">
                <span ref={counterRef}>0</span><span>m</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[--color-surface-raised] border border-[--color-border-subtle]">
              <div className="text-[10px] text-[--color-text-secondary] mb-1">Confidence</div>
              <div className="font-mono text-sm font-bold text-[--color-text-primary]">
                {Math.round(verification.evidenceQuality * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log Hint */}
        <div className="flex items-start gap-2 p-2 rounded bg-[--color-surface-sunken] border border-[--color-border-subtle] text-[10px] text-[--color-text-secondary]">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>
            {isVerified
              ? 'Event securely logged to immutable ledger.'
              : 'Flagged for review. Awaiting administrative clearance.'}
          </span>
        </div>
      </div>
    </div>
  )
}
