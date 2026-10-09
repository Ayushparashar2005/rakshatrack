import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  ArrowRight,
  Shield,
  User,
  Bus as BusIcon,
  MapPin,
  Check,
  AlertOctagon,
  Ban,
  FileText,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import type { ReviewDecision, VerificationEvidence } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'

export const Route = createFileRoute('/reviews')({
  component: VerificationReviewCenterPage,
})

function VerificationReviewCenterPage() {
  const { verifications, tapEvents, students, buses, updateReview } = useDemoStore()

  const [selectedVerifId, setSelectedVerifId] = useState<string | null>(null)
  const [filterDecision, setFilterDecision] = useState<string>('all')
  const [dismissReason, setDismissReason] = useState<string>('')
  const [adminNotes, setAdminNotes] = useState<string>('')

  // Cases that require review (status is flagged or unverified)
  const reviewCases = verifications.filter((v) => {
    const isFlagOrUnverif = v.status === 'flagged' || v.status === 'unverified'
    if (!isFlagOrUnverif) return false
    if (filterDecision === 'all') return true
    return v.reviewStatus === filterDecision
  })

  // Selected case
  const activeVerif = verifications.find((v) => v.id === selectedVerifId) || reviewCases[0]
  const activeTap = tapEvents.find((t) => t.id === activeVerif?.tapEventId)
  const activeStudent = students.find((s) => s.id === activeTap?.studentId)
  const activeBus = buses.find((b) => b.id === activeTap?.busId)

  const handleUpdate = (status: ReviewDecision) => {
    if (!activeVerif) return
    const note = status === 'dismissed' ? dismissReason || 'Dismissed by transport administrator' : adminNotes
    updateReview(activeVerif.id, status, note)
    setDismissReason('')
    setAdminNotes('')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[--color-surface-raised] p-5 rounded-[--radius-lg] border border-[--color-border-subtle] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ boxShadow: 'var(--shadow-sm)', borderLeft: '3px solid var(--color-flagged)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
              Administrative Safety Audit Queue
            </span>
            <span className="text-xs text-slate-400 font-mono">Campus Security Operations</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Verification Review Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Human audit console for flagged GPS discrepancies and unverified sensor events.
            Per university policy, boardings are preserved while anomalies are inspected.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-2">
          <div className="bg-[--color-surface-overlay] border border-amber-500/40 px-3.5 py-1.5 rounded-[--radius-md] text-xs font-mono">
            <span className="text-[--color-text-muted]">Pending Review: </span>
            <span className="text-amber-500 font-bold">
              {verifications.filter((v) => v.status === 'flagged' && v.reviewStatus === 'pending').length} Cases
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Review Cases List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[--color-surface-raised] p-1 rounded-[--radius-md] border border-[--color-border-subtle] text-xs" style={{ boxShadow: 'var(--shadow-sm)' }}>
            {['all', 'pending', 'under_review', 'reviewed', 'escalated', 'dismissed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterDecision(status)}
                className={`px-2.5 py-1 rounded-[--radius-sm] capitalize transition-colors ${
                  filterDecision === status
                    ? 'bg-amber-500/20 text-amber-500 font-bold border border-amber-500/40'
                    : 'text-[--color-text-muted] hover:text-[--color-text-primary]'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Cases Stream */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {reviewCases.length === 0 ? (
              <div className="bg-[--color-surface-raised] p-8 rounded-[--radius-lg] border border-[--color-border-subtle] text-center text-xs text-[--color-text-muted]">
                No cases matching current filter status.
              </div>
            ) : (
              reviewCases.map((verif) => {
                const tap = tapEvents.find((t) => t.id === verif.tapEventId)
                const student = students.find((s) => s.id === tap?.studentId)
                const bus = buses.find((b) => b.id === tap?.busId)
                const isSelected = activeVerif?.id === verif.id

                return (
                  <div
                    key={verif.id}
                    onClick={() => setSelectedVerifId(verif.id)}
                    className={`p-3.5 rounded-[--radius-md] border text-xs cursor-pointer transition-colors duration-150 ${
                      isSelected
                        ? 'bg-[--color-surface-overlay] border-amber-500/80 shadow-lg'
                        : 'bg-[--color-surface-raised] border-[--color-border-subtle] hover:bg-[--color-surface-overlay]'
                    }`}
                    style={isSelected ? { boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.06), var(--shadow-sm)' } : {}}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-[--color-text-primary]">
                        <span>{student?.name}</span>
                        <span className="text-[10px] text-[--color-text-muted] font-mono">
                          ({student?.regNumber})
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-[--radius-sm] uppercase font-bold ${
                          verif.status === 'flagged'
                            ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {verif.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-[--color-text-secondary] line-clamp-2 mb-2">
                      {verif.explanation}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[--color-border-subtle] text-[10px] text-[--color-text-muted]">
                      <span>Vehicle: {bus?.busNumber}</span>
                      <span className="capitalize font-semibold text-amber-500">
                        Status: {verif.reviewStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Case Deep-Dive & Action Console (7 cols) */}
        {activeVerif && (
          <div className="lg:col-span-7 bg-[--color-surface-raised] p-6 rounded-[--radius-lg] border border-[--color-border-subtle] space-y-5" style={{ boxShadow: 'var(--shadow-md)' }}>
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-4">
              <div>
                <span className="text-[10px] font-mono text-[--color-text-muted] uppercase">Case Reference</span>
                <h3 className="text-base font-bold text-[--color-text-primary] font-mono flex items-center gap-2">
                  <span>{activeVerif.id}</span>
                  <span className="text-xs font-normal text-[--color-text-muted]">
                    (Tap ID: {activeVerif.tapEventId})
                  </span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[--color-text-muted] block font-mono">Current Audit State</span>
                <span className="text-xs font-bold text-amber-500 uppercase">
                  ● {activeVerif.reviewStatus.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Student & Vehicle Context */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[--color-surface-overlay] p-3.5 rounded-[--radius-md] border border-[--color-border-subtle]">
              <div>
                <span className="text-[10px] text-slate-400 block">Student</span>
                <span className="font-semibold text-slate-200">{activeStudent?.name}</span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {activeStudent?.regNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Guardian Phone</span>
                <span className="font-mono text-slate-200">{activeStudent?.guardianPhone}</span>
                <span className="text-[10px] text-slate-400 block">{activeStudent?.guardianName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Bus & Plate</span>
                <span className="font-semibold text-slate-200">{activeBus?.busNumber}</span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {activeBus?.plateNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Action</span>
                <span className="font-bold text-emerald-400 uppercase block">
                  {activeTap?.type}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {formatRelativeTime(activeTap?.timestamp || '')}
                </span>
              </div>
            </div>

            {/* Geographic Calculation & Haversine Breakdown */}
            <div className="bg-[--color-surface-overlay] p-4 rounded-[--radius-md] border border-[--color-border-subtle] space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[--color-text-primary] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>Haversine Spatial Telemetry Evidence</span>
                </span>
                <span className="text-[10px] font-mono text-[--color-text-muted]">
                  Confidence: {activeVerif.evidenceQuality.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-[--radius-sm] bg-slate-900/90 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Bus Reader Coordinates:</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {activeVerif.busLat}° N, {activeVerif.busLng}° E
                  </span>
                </div>
                <div className="p-2.5 rounded-[--radius-sm] bg-slate-900/90 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Student Mobile Coordinates:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {activeVerif.studentLat
                      ? `${activeVerif.studentLat}° N, ${activeVerif.studentLng}° E`
                      : 'Telemetry Unavailable'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-[--radius-sm] bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs">
                <div className="font-bold mb-1">Calculation Reason:</div>
                <p className="text-[11px] leading-relaxed">{activeVerif.explanation}</p>
                <div className="mt-2 text-[10px] font-mono text-amber-400">
                  Calculated Distance: <b>{activeVerif.distanceMeters >= 0 ? `${activeVerif.distanceMeters}m` : 'N/A'}</b> | Threshold: <b>150m</b>
                </div>
              </div>
            </div>

            {/* Administrative Action Bar */}
            <div className="space-y-3 pt-2 border-t border-[--color-border-subtle]">
              <span className="text-xs font-bold text-[--color-text-primary] uppercase tracking-wider block">
                Administrative Audit Decisions
              </span>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleUpdate('under_review')}
                  className="px-3 py-2 rounded-[--radius-md] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
                >
                  Mark Under Review
                </button>
                <button
                  onClick={() => handleUpdate('reviewed')}
                  className="px-3 py-2 rounded-[--radius-md] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Mark Reviewed
                </button>
                <button
                  onClick={() => handleUpdate('escalated')}
                  className="px-3 py-2 rounded-[--radius-md] bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Escalate Case
                </button>
                <button
                  onClick={() => handleUpdate('dismissed')}
                  className="px-3 py-2 rounded-[--radius-md] bg-slate-800 hover:bg-rose-950/60 text-[--color-danger] border border-[--color-danger]/30 text-xs font-bold transition-colors"
                >
                  Dismiss Anomaly
                </button>
              </div>

              {/* Note input */}
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Optional audit notes / explanation for record…"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {activeVerif.adminNotes && (
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Previous Note: </span>
                  {activeVerif.adminNotes} (Reviewed by {activeVerif.reviewedBy})
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
