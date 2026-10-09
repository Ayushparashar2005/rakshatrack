import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
  GraduationCap,
  Bus as BusIcon,
  MapPin,
  Clock,
  Calendar,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  User,
  Radio,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import { formatRelativeTime } from '@/lib/utils'

export const Route = createFileRoute('/student-portal')({
  component: StudentPortalPage,
})

function StudentPortalPage() {
  const { students, buses, routes, tapEvents, activeStudentId, setActiveStudent } = useDemoStore()

  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0]
  const assignedBus = buses.find((b) => b.id === currentStudent?.assignedBusId) || buses[0]
  const assignedRoute = routes.find((r) => r.id === currentStudent?.assignedRouteId) || routes[0]

  // Personal tap history
  const personalTaps = tapEvents.filter((t) => t.studentId === currentStudent?.id)
  const availableSeats = Math.max(0, assignedBus.capacity - assignedBus.currentOccupancy)

  return (
    <div className="space-y-6 pb-12">
      {/* Student Profile Switcher Header */}
      <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-emerald-400 text-lg">
              {currentStudent.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded font-bold uppercase">
                Student Transport Pass
              </span>
              <span className="text-xs text-slate-400 font-mono">AY 2026-27</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{currentStudent.name}</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                ({currentStudent.regNumber})
              </span>
            </h2>
            <p className="text-xs text-slate-400">{currentStudent.department} • {currentStudent.year}</p>
          </div>
        </div>

        {/* Switch Student for presentation */}
        <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Switch Demo Student:</span>
          <select
            value={currentStudent.id}
            onChange={(e) => setActiveStudent(e.target.value)}
            className="bg-transparent text-emerald-400 font-bold text-xs focus:outline-none cursor-pointer"
          >
            {students.slice(0, 10).map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                {s.name} ({s.regNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: My Bus Card & Seat Meter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Assigned Vehicle */}
        <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold">Assigned Bus</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
              ● IN TRANSIT
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-white font-mono flex items-center gap-2">
              <BusIcon className="w-6 h-6 text-emerald-400" />
              <span>{assignedBus.busNumber}</span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">Plate: {assignedBus.plateNumber}</div>
          </div>

          <div className="space-y-1.5 text-xs pt-1 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span className="text-slate-400">Driver:</span>
              <span className="text-slate-200 font-medium">{assignedBus.driverName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Driver Phone:</span>
              <span className="text-emerald-400 font-mono">{assignedBus.driverPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Simulated Velocity:</span>
              <span className="text-slate-200 font-mono">{assignedBus.speed} km/h</span>
            </div>
          </div>
        </div>

        {/* Card 2: Seating & Occupancy */}
        <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold">Live Seat Availability</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">{availableSeats} Seats Free</span>
          </div>

          <div>
            <div className="text-2xl font-black text-white font-mono">
              {assignedBus.currentOccupancy} <span className="text-sm font-normal text-slate-400">/ {assignedBus.capacity} Occupied</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden mt-3">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.round((assignedBus.currentOccupancy / assignedBus.capacity) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span>Current Status:</span>
            <span
              className={`font-bold ${
                currentStudent.currentBoardingState === 'boarded' ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {currentStudent.currentBoardingState === 'boarded'
                ? '● You are currently ONBOARD'
                : '○ You are currently ALIGHTED'}
            </span>
          </div>
        </div>

        {/* Card 3: Digital Pass & Quick Actions */}
        <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">RFID Smart Pass</span>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">NFC ACTIVE</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] text-slate-400 block font-mono">LINKED CARD UID</span>
              <span className="text-base font-bold text-emerald-400 font-mono block">
                {currentStudent.cardUid}
              </span>
              <span className="text-[11px] text-slate-400 block pt-1">
                Home Pickup: {currentStudent.homeStop}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <Link
              to="/route-requests"
              className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
            >
              <span>Change Route Petition</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Route Schedule & Stoppages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">My Corridor</span>
              <h3 className="text-base font-bold text-white">{assignedRoute.name}</h3>
            </div>
            <span className="text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              {assignedRoute.estimatedMinutes} Minutes to Campus
            </span>
          </div>

          <div className="space-y-2">
            {assignedRoute.stops.map((stop, idx) => {
              const isHome = stop.stopName.includes(currentStudent.homeStop.slice(0, 10))
              return (
                <div
                  key={stop.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isHome
                      ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        <span>{stop.stopName}</span>
                        {isHome && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded font-mono">
                            YOUR STOP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-slate-300 text-[11px]">
                    <span className="text-emerald-400 font-bold block">{stop.expectedMorningTime}</span>
                    <span className="text-[9px] text-slate-400">Pickup</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Personal Tap History (4 cols) */}
        <div className="lg:col-span-4 bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>My Recent RFID Taps ({personalTaps.length})</span>
          </h4>

          {personalTaps.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
              No recent tap activity for {currentStudent.name}.
              <Link to="/simulator" className="text-emerald-400 font-bold block mt-2 hover:underline">
                Simulate a tap now →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {personalTaps.map((tap) => (
                <div
                  key={tap.id}
                  className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase text-slate-200">{tap.type}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        tap.verificationStatus === 'verified'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {tap.verificationStatus}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] truncate">{tap.stopName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {formatRelativeTime(tap.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
