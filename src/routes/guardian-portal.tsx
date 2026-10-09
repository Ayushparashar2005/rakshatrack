import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
import {
  HeartHandshake,
  ShieldCheck,
  Bell,
  Clock,
  Bus as BusIcon,
  Phone,
  AlertTriangle,
  User,
  CheckCircle2,
  MapPin,
  Calendar,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import { formatRelativeTime, formatDate, formatTime } from '@/lib/utils'
import { getStudentTapHistory, markAlertReadInDB } from '@/lib/db/actions'

export const Route = createFileRoute('/guardian-portal')({
  component: GuardianPortalPage,
})

function GuardianPortalPage() {
  const {
    students,
    buses,
    routes,
    tapEvents,
    alerts,
    activeStudentId,
    setActiveStudent,
    markAlertRead,
  } = useDemoStore()

  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0]
  const assignedBus = buses.find((b) => b.id === currentStudent?.assignedBusId) || buses[0]
  const assignedRoute = routes.find((r) => r.id === currentStudent?.assignedRouteId) || routes[0]

  // Live tap history from DB
  const [dbTaps, setDbTaps] = useState<any[]>([])

  useEffect(() => {
    if (!currentStudent?.id) return
    getStudentTapHistory({ data: { studentId: currentStudent.id } })
      .then((records) => {
        if (Array.isArray(records)) {
          setDbTaps(records)
        }
      })
      .catch((err) => console.warn('Failed to load DB tap history for guardian:', err))
  }, [currentStudent?.id, tapEvents.length])

  // Merge in-memory and DB taps
  const inMemTaps = tapEvents.filter((t) => t.studentId === currentStudent?.id)
  const wardTaps = [...inMemTaps]
  for (const dbTap of dbTaps) {
    if (!wardTaps.some((t) => t.id === dbTap.id)) {
      wardTaps.push(dbTap)
    }
  }

  const wardAlerts = alerts.filter(
    (a) => a.studentId === currentStudent?.id || a.busId === currentStudent?.assignedBusId
  )

  const isBoarded = currentStudent?.currentBoardingState === 'boarded'

  const handleAcknowledgeAlert = (alertId: string) => {
    markAlertRead(alertId)
    markAlertReadInDB({ data: { alertId } }).catch(console.warn)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Ward Selector */}
      <div className="bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-mono">
              Guardian Child Safety Portal
            </span>
            <span className="text-xs text-[--color-text-muted] font-mono">In-App Live Telemetry</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[--color-text-primary] tracking-tight flex items-center gap-2">
            <span>Parent & Guardian Transit Sentinel</span>
          </h2>
          <p className="text-xs text-[--color-text-secondary] mt-1">
            Live transit tracking for <b className="text-[--color-text-primary]">{currentStudent.name}</b>. Automated notifications upon bus boarding and alighting.
          </p>
        </div>

        {/* Ward switcher */}
        <div className="flex items-center gap-2 bg-[--color-surface-base] p-2 rounded-xl border border-[--color-border-mid]">
          <User className="w-4 h-4 text-[--color-text-muted]" />
          <span className="text-xs text-[--color-text-secondary]">Select Ward:</span>
          <select
            value={currentStudent.id}
            onChange={(e) => setActiveStudent(e.target.value)}
            className="bg-transparent text-emerald-700 font-bold text-xs focus:outline-none cursor-pointer"
          >
            {students.slice(0, 15).map((s) => (
              <option key={s.id} value={s.id} className="bg-[--color-surface-raised] text-[--color-text-primary]">
                {s.name} ({s.guardianName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ward Status Hero Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isBoarded
            ? 'bg-gradient-to-r from-emerald-50 via-emerald-100/40 to-teal-50 border-emerald-300 shadow-sm'
            : 'bg-[--color-surface-raised] border-[--color-border-subtle] shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl ${
                isBoarded
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-[--color-surface-base] text-[--color-text-muted] border border-[--color-border-mid]'
              }`}
            >
              {isBoarded ? '🚌' : '🏠'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[--color-text-muted] uppercase">Live Child Status</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isBoarded ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                  }`}
                />
              </div>
              <h3 className="text-lg font-bold text-[--color-text-primary]">
                {isBoarded
                  ? `${currentStudent.name} is currently ONBOARD ${assignedBus.busNumber}`
                  : `${currentStudent.name} is currently ALIGHTED / OFF BUS`}
              </h3>
              <p className="text-xs text-[--color-text-secondary]">
                {isBoarded
                  ? `Traveling via ${assignedRoute.name} towards Campus. Estimated velocity: ${assignedBus.speed} km/h.`
                  : `Last recorded stoppage: ${wardTaps[0]?.stopName || currentStudent.homeStop}.`}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs font-mono bg-[--color-surface-base] p-3 rounded-xl border border-[--color-border-mid]">
            <span className="text-[--color-text-muted] block text-[10px]">REGISTERED GUARDIAN</span>
            <span className="text-[--color-text-primary] font-bold block">{currentStudent.guardianName}</span>
            <span className="text-emerald-700 block font-semibold">{currentStudent.guardianPhone}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Events Feed + Bus Driver Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Boarding/Alighting Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-mono font-bold text-[--color-text-primary] uppercase">
                In-App Attendance Push Ledger
              </h3>
            </div>
            <span className="text-[10px] text-[--color-text-muted] font-mono">Real-Time In-App Stream</span>
          </div>

          {wardTaps.length === 0 ? (
            <div className="p-10 text-center text-xs text-[--color-text-muted]">
              No boarding or alighting events registered today yet for {currentStudent.name}.
            </div>
          ) : (
            <div className="space-y-3">
              {wardTaps.map((tap) => {
                const bus = buses.find((b) => b.id === tap.busId)
                const isBoarding = tap.type === 'boarding'

                return (
                  <div
                    key={tap.id}
                    className="p-3.5 rounded-xl bg-[--color-surface-base] border border-[--color-border-subtle] text-xs flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                          isBoarding
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isBoarding ? 'IN' : 'OUT'}
                      </div>
                      <div>
                        <div className="font-bold text-[--color-text-primary]">
                          {isBoarding ? 'Boarded University Bus' : 'Safely Alighted from Bus'}
                        </div>
                        <div className="text-[--color-text-secondary] text-[11px] mt-0.5">
                          Vehicle: <b className="text-[--color-text-primary]">{bus?.busNumber}</b> • Stoppage: {tap.stopName || 'Transit Stop'}
                        </div>
                        <div className="text-[10px] text-[--color-text-muted] font-mono mt-1">
                          RFID Tag: {tap.cardUid} • Verification: <span className="uppercase text-emerald-700 font-semibold">{tap.verificationStatus}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-[--color-text-muted] flex-shrink-0">
                      <div>{formatTime(tap.timestamp)}</div>
                      <div className="text-[9px] text-[--color-text-muted]">{formatRelativeTime(tap.timestamp)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Driver Contact & Safety Alerts (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Driver Emergency Contact */}
          <div className="bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-[--color-text-primary] uppercase tracking-wider flex items-center gap-1.5 border-b border-[--color-border-subtle] pb-3">
              <BusIcon className="w-4 h-4 text-emerald-600" />
              <span>Assigned Vehicle & Crew</span>
            </h4>

            <div className="bg-[--color-surface-base] p-3 rounded-xl border border-[--color-border-mid] space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-[--color-text-muted]">Vehicle:</span>
                <span className="text-[--color-text-primary] font-bold">{assignedBus.busNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--color-text-muted]">Plate Number:</span>
                <span className="text-[--color-text-secondary]">{assignedBus.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--color-text-muted]">Driver Name:</span>
                <span className="text-[--color-text-primary] font-sans font-semibold">{assignedBus.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--color-text-muted]">Driver Phone:</span>
                <span className="text-emerald-700 font-bold">{assignedBus.driverPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--color-text-muted]">Conductor:</span>
                <span className="text-[--color-text-secondary] font-sans">{assignedBus.conductorName}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800">
              Campus Transport Helpdesk Hotline: <b>+91 (0124) 2278-183</b>
            </div>
          </div>

          {/* Ward Safety In-App Alerts */}
          <div className="bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-[--color-text-primary] uppercase tracking-wider flex items-center gap-1.5 border-b border-[--color-border-subtle] pb-3">
              <Bell className="w-4 h-4 text-teal-600" />
              <span>Guardian Notification Ledger</span>
            </h4>

            {wardAlerts.length === 0 ? (
              <div className="p-6 text-center text-[--color-text-muted] text-[11px]">
                No safety alerts or warnings issued for this passenger.
              </div>
            ) : (
              <div className="space-y-2">
                {wardAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 rounded-xl bg-[--color-surface-base] border border-[--color-border-subtle] space-y-1 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[--color-text-primary]">{alt.title}</span>
                      <span className="text-[9px] font-mono text-[--color-text-muted]">
                        {formatRelativeTime(alt.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[--color-text-secondary]">{alt.message}</p>
                    {!alt.isRead && (
                      <button
                        onClick={() => handleAcknowledgeAlert(alt.id)}
                        className="text-[10px] font-semibold text-emerald-700 hover:underline pt-1 block"
                      >
                        Acknowledge Alert
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
