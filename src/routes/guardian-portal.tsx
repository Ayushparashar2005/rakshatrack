import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
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

export const Route = createFileRoute('/guardian-portal')({
  component: GuardianPortalPage,
})

function GuardianPortalPage() {
  const { students, buses, routes, tapEvents, alerts, verifications, activeStudentId, setActiveStudent } =
    useDemoStore()

  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0]
  const assignedBus = buses.find((b) => b.id === currentStudent?.assignedBusId) || buses[0]
  const assignedRoute = routes.find((r) => r.id === currentStudent?.assignedRouteId) || routes[0]

  // Events & Alerts related to this student
  const wardTaps = tapEvents.filter((t) => t.studentId === currentStudent?.id)
  const wardAlerts = alerts.filter(
    (a) => a.studentId === currentStudent?.id || a.busId === currentStudent?.assignedBusId
  )

  const isBoarded = currentStudent?.currentBoardingState === 'boarded'

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Ward Selector */}
      <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2.5 py-0.5 rounded-full font-mono">
              Guardian Child Safety Portal
            </span>
            <span className="text-xs text-slate-400 font-mono">In-App Live Telemetry</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Parent & Guardian Transit Sentinel</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Live transit tracking for <b className="text-white">{currentStudent.name}</b>. Automated notifications upon bus boarding and alighting.
          </p>
        </div>

        {/* Ward switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Select Ward:</span>
          <select
            value={currentStudent.id}
            onChange={(e) => setActiveStudent(e.target.value)}
            className="bg-transparent text-emerald-400 font-bold text-xs focus:outline-none cursor-pointer"
          >
            {students.slice(0, 10).map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
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
            ? 'bg-gradient-to-r from-emerald-950/60 via-[#101c2a] to-emerald-950/40 border-emerald-500/40 shadow-xl shadow-emerald-950/40'
            : 'bg-gradient-to-r from-[#121824] via-[#101622] to-[#121824] border-slate-800 shadow-lg'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl ${
                isBoarded
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isBoarded ? '🚌' : '🏠'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 uppercase">Live Child Status</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isBoarded ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                  }`}
                />
              </div>
              <h3 className="text-lg font-bold text-white">
                {isBoarded
                  ? `${currentStudent.name} is currently ONBOARD ${assignedBus.busNumber}`
                  : `${currentStudent.name} is currently ALIGHTED / OFF BUS`}
              </h3>
              <p className="text-xs text-slate-400">
                {isBoarded
                  ? `Traveling via ${assignedRoute.name} towards Campus. Estimated velocity: ${assignedBus.speed} km/h.`
                  : `Last recorded stoppage: ${wardTaps[0]?.stopName || currentStudent.homeStop}.`}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs font-mono bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">REGISTERED GUARDIAN</span>
            <span className="text-slate-200 font-bold block">{currentStudent.guardianName}</span>
            <span className="text-emerald-400 block">{currentStudent.guardianPhone}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Events Feed + Bus Driver Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Boarding/Alighting Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase">
                In-App Attendance Push Ledger
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Real-Time In-App Stream</span>
          </div>

          {wardTaps.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
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
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                          isBoarding
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {isBoarding ? 'IN' : 'OUT'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100">
                          {isBoarding ? 'Boarded University Bus' : 'Safely Alighted from Bus'}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          Vehicle: <b className="text-slate-200">{bus?.busNumber}</b> • Stoppage: {tap.stopName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          RFID Tag: {tap.cardUid} • Verification: <span className="uppercase text-emerald-400">{tap.verificationStatus}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-slate-400 flex-shrink-0">
                      <div>{formatTime(tap.timestamp)}</div>
                      <div className="text-[9px] text-slate-500">{formatRelativeTime(tap.timestamp)}</div>
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
          <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3 text-xs">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-3">
              <BusIcon className="w-4 h-4 text-emerald-400" />
              <span>Assigned Vehicle & Crew</span>
            </h4>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle:</span>
                <span className="text-white font-bold">{assignedBus.busNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plate Number:</span>
                <span className="text-slate-300">{assignedBus.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Driver Name:</span>
                <span className="text-slate-200 font-sans font-semibold">{assignedBus.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Driver Phone:</span>
                <span className="text-emerald-400 font-bold">{assignedBus.driverPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Conductor:</span>
                <span className="text-slate-300 font-sans">{assignedBus.conductorName}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300">
              Campus Transport Helpdesk Hotline: <b>+91 (0124) 2278-183</b>
            </div>
          </div>

          {/* Ward Safety In-App Alerts */}
          <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3 text-xs">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-3">
              <Bell className="w-4 h-4 text-teal-400" />
              <span>Guardian Notification Ledger</span>
            </h4>

            {wardAlerts.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-[11px]">
                No safety alerts or warnings issued for this passenger.
              </div>
            ) : (
              <div className="space-y-2">
                {wardAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">{alt.title}</span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {formatRelativeTime(alt.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{alt.message}</p>
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
