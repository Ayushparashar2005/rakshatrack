import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ArrowRight,
  Route as RouteIcon,
  Plus,
  X,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import { formatDate, formatRelativeTime } from '@/lib/utils'

export const Route = createFileRoute('/route-requests')({
  component: RouteRequestsPage,
})

function RouteRequestsPage() {
  const {
    routeRequests,
    students,
    routes,
    submitRouteChangeRequest,
    reviewRouteChangeRequest,
  } = useDemoStore()

  // New Request Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [studentId, setStudentId] = useState(students[0]?.id || '')
  const [targetRouteId, setTargetRouteId] = useState(routes[1]?.id || '')
  const [reason, setReason] = useState('')

  // Admin comments state for review
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null)
  const [adminComment, setAdminComment] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      alert('Please state a reason for the route-change request.')
      return
    }
    submitRouteChangeRequest(studentId, targetRouteId, reason)
    setReason('')
    setIsModalOpen(false)
  }

  const handleReview = (id: string, status: 'approved' | 'rejected') => {
    reviewRouteChangeRequest(id, status, adminComment || undefined)
    setSelectedReqId(null)
    setAdminComment('')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 rounded-full font-mono">
              Student Transit Services
            </span>
            <span className="text-xs text-slate-400 font-mono">Route Reassignment Desk</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Route-Change Requests & Allocations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Process student corridor reassignment petitions. Approving a request updates the student's live bus and route credentials immediately.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New Request</span>
          </button>
        </div>
      </div>

      {/* Requests Table / Cards */}
      <div className="bg-[#101726] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0d121f] text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4">REQUEST ID</th>
                <th className="py-3 px-4">STUDENT & REG#</th>
                <th className="py-3 px-4">CORRIDOR REASSIGNMENT</th>
                <th className="py-3 px-4">JUSTIFICATION / REASON</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ADMIN AUDIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {routeRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400 font-medium">
                    {req.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{req.studentName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{req.studentReg}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="text-slate-400">{req.currentRouteName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-emerald-400 font-bold">{req.requestedRouteName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-300 line-clamp-2">{req.reason}</p>
                    {req.adminComments && (
                      <p className="text-[10px] text-slate-400 mt-1 italic">
                        Note: {req.adminComments}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : req.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {req.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleReview(req.id, 'approved')}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReview(req.id, 'rejected')}
                          className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 font-bold text-[11px]"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        {req.reviewedBy || 'Finalized'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleCreate}
            className="bg-[#101726] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Submit Route-Change Request</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Student</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.regNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Requested Target Route
                </label>
                <select
                  value={targetRouteId}
                  onChange={(e) => setTargetRouteId(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reason for Route Change
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Relocation of residence, hostel shift, or change of pickup stop…"
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl p-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20"
              >
                Submit Petition
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
