import { RoleGuard } from '@/components/layout/RoleGuard'
import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  X,
  ExternalLink,
  MapPin,
  Clock,
  Shield,
  User,
  Bus as BusIcon,
  Download,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import type { TapEvent, VerificationEvidence, VerificationStatus, EventType } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/utils'
import { useThreshold } from '@/hooks/useThreshold'

export const Route = createFileRoute('/attendance')({
  component: AttendanceHistoryPage,
})

function AttendanceHistoryPage() {
  const { students, buses, routes, tapEvents, verifications } = useDemoStore()

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBusFilter, setSelectedBusFilter] = useState<string>('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all')

  // Selected row for detail drawer
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // Filtered tap events
  const filteredEvents = tapEvents.filter((tap) => {
    const student = students.find((s) => s.id === tap.studentId)
    const bus = buses.find((b) => b.id === tap.busId)

    const matchesSearch =
      !searchTerm ||
      student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tap.cardUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tap.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesBus = selectedBusFilter === 'all' || tap.busId === selectedBusFilter
    const matchesStatus = selectedStatusFilter === 'all' || tap.verificationStatus === selectedStatusFilter
    const matchesType = selectedTypeFilter === 'all' || tap.type === selectedTypeFilter

    return matchesSearch && matchesBus && matchesStatus && matchesType
  })

  // Selected event & verification detail
  const selectedTap = tapEvents.find((t) => t.id === selectedEventId)
  const selectedVerification = verifications.find((v) => v.tapEventId === selectedEventId)
  const selectedStudent = students.find((s) => s.id === selectedTap?.studentId)
  const selectedBus = buses.find((b) => b.id === selectedTap?.busId)
  const selectedRoute = routes.find((r) => r.id === selectedBus?.currentRouteId)

  const activeThreshold = useThreshold()

  const handleExportCsv = () => {
    import('@/lib/utils').then(({ exportToCsv }) => {
      const exportData = filteredEvents.map(tap => {
        const student = students.find((s) => s.id === tap.studentId)
        const bus = buses.find((b) => b.id === tap.busId)
        return {
          'Event ID': tap.id,
          'Student Name': student?.name || 'Unknown',
          'Reg Number': student?.regNumber || 'Unknown',
          'Card UID': tap.cardUid,
          'Bus Number': bus?.busNumber || 'Unknown',
          'Stop Name': tap.stopName || '',
          'Event Type': tap.type,
          'Timestamp': tap.timestamp,
          'Verification Status': tap.verificationStatus
        }
      })
      exportToCsv(`attendance_export_${new Date().getTime()}.csv`, exportData)
    })
  }

  return (
    
    <RoleGuard allowedRoles={['admin', 'student']}>
      <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="section-tag">
              Immutable Transit Ledger
            </span>
            <span className="text-xs text-[--color-text-muted] font-mono">SGT University Bus RFID</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[--color-text-primary] tracking-tight flex items-center gap-2">
            <span>Attendance Audit Ledger & History</span>
          </h2>
          <p className="text-xs text-[--color-text-muted] mt-1">
            Complete record of boarding and alighting transitions with mobile GPS cross-verification outcomes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[--color-text-secondary] bg-[--color-surface-sunken] border border-[--color-border-subtle] px-3 py-1.5 rounded-xl">
            Total Records: <b className="text-emerald-700">{tapEvents.length}</b>
          </span>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[--color-surface-raised] p-4 rounded-[--radius-lg] border border-[--color-border-subtle] flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name, reg#, or card UID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[--color-surface-overlay] border border-[--color-border-mid] rounded-[--radius-md] pl-9 pr-3 py-2 text-[--color-text-primary] placeholder:text-[--color-text-muted] focus:outline-none focus:border-[--color-accent-500]"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Bus Filter */}
          <select
            value={selectedBusFilter}
            onChange={(e) => setSelectedBusFilter(e.target.value)}
            className="bg-[--color-surface-overlay] border border-[--color-border-mid] rounded-[--radius-md] px-3 py-2 text-[--color-text-primary] focus:outline-none focus:border-[--color-accent-500]"
          >
            <option value="all">All Fleet Buses</option>
            {buses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.busNumber} ({b.plateNumber})
              </option>
            ))}
          </select>

          {/* Verification Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-[--color-surface-overlay] border border-[--color-border-mid] rounded-[--radius-md] px-3 py-2 text-[--color-text-primary] focus:outline-none focus:border-[--color-accent-500]"
          >
            <option value="all">All Verification Statuses</option>
            <option value="verified">Verified Only</option>
            <option value="flagged">Flagged Only</option>
            <option value="unverified">Unverified Only</option>
          </select>

          {/* Event Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-[--color-surface-overlay] border border-[--color-border-mid] rounded-[--radius-md] px-3 py-2 text-[--color-text-primary] focus:outline-none focus:border-[--color-accent-500]"
          >
            <option value="all">All Event Types</option>
            <option value="boarding">Boarding (In)</option>
            <option value="alighting">Alighting (Out)</option>
          </select>
        </div>
      </div>

      {/* Main Table & Detail Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Container (takes full width or 8 cols if drawer open) */}
        <div className={selectedEventId ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <div className="bg-[--color-surface-raised] rounded-[--radius-lg] border border-[--color-border-subtle] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[--color-border-subtle] bg-[--color-surface-float] text-[--color-text-muted] font-mono text-[11px]">
                    <th className="py-3 px-3.5">EVENT ID</th>
                    <th className="py-3 px-3.5">STUDENT & REG#</th>
                    <th className="py-3 px-3.5">BUS & ROUTE</th>
                    <th className="py-3 px-3.5">TYPE</th>
                    <th className="py-3 px-3.5">TIMESTAMP</th>
                    <th className="py-3 px-3.5">GPS VERIFICATION</th>
                    <th className="py-3 px-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--color-border-subtle] font-sans">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[--color-text-muted] italic">
                        No attendance events matching selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((tap) => {
                      const student = students.find((s) => s.id === tap.studentId)
                      const bus = buses.find((b) => b.id === tap.busId)
                      const isSelected = selectedEventId === tap.id

                      return (
                        <tr
                          key={tap.id}
                          onClick={() => setSelectedEventId(tap.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[--color-surface-overlay] border-l-4 border-l-[--color-accent-500]'
                              : 'hover:bg-[--color-surface-overlay]'
                          }`}
                        >
                          <td className="py-3 px-3.5 font-mono text-[--color-text-muted] font-medium">
                            {tap.id}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="font-semibold text-[--color-text-primary]">{student?.name}</div>
                            <div className="text-[10px] text-[--color-text-muted] font-mono">
                              {student?.regNumber} • Card: {tap.cardUid}
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="font-semibold text-[--color-text-primary]">{bus?.busNumber}</div>
                            <div className="text-[10px] text-[--color-text-muted] truncate max-w-[130px]">
                              {tap.stopName}
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                tap.type === 'boarding'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                  : 'bg-[--color-surface-sunken] text-[--color-text-secondary] border border-[--color-border-subtle]'
                              }`}
                            >
                              {tap.type}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 font-mono text-[--color-text-secondary] text-[11px]">
                            <div>{formatTime(tap.timestamp)}</div>
                            <div className="text-[9px] text-[--color-text-muted]">{formatDate(tap.timestamp)}</div>
                          </td>
                          <td className="py-3 px-3.5">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                tap.verificationStatus === 'verified'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                  : tap.verificationStatus === 'flagged'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-300'
                                  : 'bg-purple-50 text-purple-700 border border-purple-300'
                              }`}
                            >
                              {tap.verificationStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedEventId(tap.id)
                              }}
                              className="text-xs text-[--color-accent-600] hover:text-[--color-accent-700] font-semibold"
                            >
                              Inspect →
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Evidence Drawer (4 cols when open) */}
        {selectedEventId && selectedTap && (
          <div className="lg:col-span-4 bg-[--color-surface-raised] p-5 rounded-[--radius-lg] border border-[--color-border-subtle] shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-mono font-bold text-[--color-text-primary] uppercase">
                  Event Verification Evidence
                </h3>
              </div>
              <button
                onClick={() => setSelectedEventId(null)}
                className="text-[--color-text-muted] hover:text-[--color-text-primary] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Event Summary Pill */}
            <div className="bg-[--color-surface-sunken] p-3 rounded-[--radius-md] border border-[--color-border-subtle] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[--color-text-muted]">Event ID:</span>
                <span className="font-mono text-[--color-text-primary] font-bold">{selectedTap.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--color-text-muted]">Student:</span>
                <span className="text-[--color-text-primary] font-semibold">{selectedStudent?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--color-text-muted]">Registration:</span>
                <span className="font-mono text-[--color-text-primary]">{selectedStudent?.regNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--color-text-muted]">Card UID:</span>
                <span className="font-mono text-emerald-700 font-semibold">{selectedTap.cardUid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--color-text-muted]">Action:</span>
                <span className="font-bold uppercase text-[--color-text-primary]">{selectedTap.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--color-text-muted]">Bus & Stoppage:</span>
                <span className="text-[--color-text-primary]">{selectedBus?.busNumber} ({selectedTap.stopName})</span>
              </div>
            </div>

            {/* Verification Engine Outcome */}
            {selectedVerification && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                  selectedVerification.status === 'verified'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                    : selectedVerification.status === 'flagged'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                    : 'bg-purple-50/80 border-purple-200 text-purple-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm">
                  <div className="flex items-center gap-1.5">
                    {selectedVerification.status === 'verified' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="uppercase">{selectedVerification.status}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 border border-black/10">
                    {selectedVerification.scenario}
                  </span>
                </div>

                <div className="text-[11px] leading-relaxed text-[--color-text-secondary]">
                  {selectedVerification.explanation}
                </div>

                {/* Haversine distance math display */}
                <div className="pt-2 border-t border-[--color-border-subtle] space-y-1 font-mono text-[10px] text-[--color-text-secondary]">
                  <div className="flex justify-between">
                    <span>Haversine Distance:</span>
                    <span className="font-bold text-[--color-text-primary]">
                      {selectedVerification.distanceMeters >= 0
                        ? `${selectedVerification.distanceMeters} meters`
                        : 'No GPS stream'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Configured Max Threshold:</span>
                    <span className="text-[--color-text-primary]">{activeThreshold} meters</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Student Phone Telemetry:</span>
                    <span className="text-[--color-text-primary]">
                      {selectedVerification.studentLat
                        ? `${selectedVerification.studentLat}, ${selectedVerification.studentLng}`
                        : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicle Reader GPS:</span>
                    <span className="text-[--color-text-primary]">
                      {selectedVerification.busLat}, {selectedVerification.busLng}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </RoleGuard>
  )
}
