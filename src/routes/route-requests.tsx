import { RoleGuard } from '@/components/layout/RoleGuard'
import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
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
import {
  getRouteRequestsFromDB,
  insertRouteChangeRequest,
  updateRouteChangeRequest,
} from '@/lib/db/actions'

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

  // DB requests sync
  const [dbRequests, setDbRequests] = useState<any[]>([])

  useEffect(() => {
    getRouteRequestsFromDB()
      .then((records) => {
        if (Array.isArray(records)) {
          setDbRequests(records)
        }
      })
      .catch((err) => console.warn('Failed to load DB route requests:', err))
  }, [routeRequests.length])

  // Merge in-memory and DB requests
  const combinedRequests = [...routeRequests]
  for (const dbr of dbRequests) {
    if (!combinedRequests.some((r) => r.id === dbr.id)) {
      const student = students.find((s) => s.id === dbr.studentId)
      const curRoute = routes.find((r) => r.id === dbr.currentRouteId)
      const reqRoute = routes.find((r) => r.id === dbr.requestedRouteId)
      combinedRequests.push({
        ...dbr,
        studentName: student?.name || 'Enrolled Student',
        studentReg: student?.regNumber || 'SGT-2026',
        currentRouteName: curRoute?.name || 'Current Route',
        requestedRouteName: reqRoute?.name || 'Requested Route',
      })
    }
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      alert('Please state a reason for the route-change request.')
      return
    }

    const student = students.find((s) => s.id === studentId) || students[0]
    const curRouteId = student.assignedRouteId || routes[0]?.id

    // Update in-memory store
    submitRouteChangeRequest(studentId, targetRouteId, reason)

    // Persist to Neon DB
    const reqId = `REQ-${Date.now().toString().slice(-4)}`
    insertRouteChangeRequest({
      data: {
        id: reqId,
        studentId,
        currentRouteId: curRouteId,
        requestedRouteId: targetRouteId,
        reason,
      },
    }).catch(console.warn)

    setReason('')
    setIsModalOpen(false)
  }

  const handleReview = (id: string, status: 'approved' | 'rejected') => {
    const targetReq = combinedRequests.find((r) => r.id === id)

    // Update in-memory store
    reviewRouteChangeRequest(id, status, adminComment || undefined)

    // Persist to Neon DB
    updateRouteChangeRequest({
      data: {
        requestId: id,
        status,
        adminComments: adminComment || undefined,
        reviewedBy: 'Transport Admin',
        studentId: targetReq?.studentId,
        newRouteId: targetReq?.requestedRouteId,
      },
    }).catch(console.warn)

    setSelectedReqId(null)
    setAdminComment('')
  }

  return (
    
    <RoleGuard allowedRoles={['admin', 'student']}>
      <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full font-mono">
              Student Transit Services
            </span>
            <span className="text-xs text-[--color-text-muted] font-mono">Route Reassignment Desk</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[--color-text-primary] tracking-tight flex items-center gap-2">
            <span>Route-Change Requests & Allocations</span>
          </h2>
          <p className="text-xs text-[--color-text-secondary] mt-1">
            Process student corridor reassignment petitions. Approving a request updates the student's live bus and route credentials immediately.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New Request</span>
          </button>
        </div>
      </div>

      {/* Requests Table / Cards */}
      <div className="bg-[--color-surface-raised] rounded-2xl border border-[--color-border-subtle] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[--color-border-subtle] bg-[--color-surface-base] text-[--color-text-secondary] font-mono text-[11px]">
                <th className="py-3 px-4">REQUEST ID</th>
                <th className="py-3 px-4">STUDENT & REG#</th>
                <th className="py-3 px-4">CORRIDOR REASSIGNMENT</th>
                <th className="py-3 px-4">JUSTIFICATION / REASON</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ADMIN AUDIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border-subtle] font-sans">
              {combinedRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[--color-surface-base] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[--color-text-muted] font-medium">
                    {req.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[--color-text-primary]">{req.studentName}</div>
                    <div className="text-[10px] text-[--color-text-muted] font-mono">{req.studentReg}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="text-[--color-text-secondary]">{req.currentRouteName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
                      <span className="text-emerald-700 font-bold">{req.requestedRouteName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-[--color-text-primary] line-clamp-2">{req.reason}</p>
                    {req.adminComments && (
                      <p className="text-[10px] text-[--color-text-muted] mt-1 italic">
                        Note: {req.adminComments}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
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
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReview(req.id, 'rejected')}
                          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-[--color-text-muted] font-mono">
                        Audited by {req.reviewedBy || 'Admin'}
                      </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <form
            onSubmit={handleCreate}
            className="bg-[--color-surface-overlay] border border-[--color-border-mid] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-3">
              <h3 className="text-base font-bold text-[--color-text-primary]">Submit Route-Change Request</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[--color-text-muted] hover:text-[--color-text-primary]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[--color-text-secondary] font-semibold mb-1">
                  Select Enrolled Student
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-[--color-surface-base] border border-[--color-border-mid] rounded-xl px-3 py-2 text-[--color-text-primary] focus:outline-none focus:border-emerald-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.regNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[--color-text-secondary] font-semibold mb-1">
                  Requested Transit Corridor
                </label>
                <select
                  value={targetRouteId}
                  onChange={(e) => setTargetRouteId(e.target.value)}
                  className="w-full bg-[--color-surface-base] border border-[--color-border-mid] rounded-xl px-3 py-2 text-[--color-text-primary] focus:outline-none focus:border-emerald-500"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[--color-text-secondary] font-semibold mb-1">
                  Reason for Route Reallocation
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Relocated to Sector 14, need early clinic batch drop, etc."
                  className="w-full bg-[--color-surface-base] border border-[--color-border-mid] rounded-xl p-3 text-[--color-text-primary] placeholder:text-[--color-text-muted] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[--color-border-subtle]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[--color-text-secondary] hover:text-[--color-text-primary]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20"
              >
                Submit Petition
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    </RoleGuard>
  )
}
