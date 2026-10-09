import { RoleGuard } from '@/components/layout/RoleGuard'
import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
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
  Sparkles,
} from 'lucide-react'
import { useUser } from '@clerk/tanstack-react-start'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import { formatRelativeTime } from '@/lib/utils'
import { getStudentTapHistory } from '@/lib/db/actions'

export const Route = createFileRoute('/student-portal')({
  component: StudentPortalPage,
})

function StudentPortalPage() {
  const { user, isSignedIn } = useUser()
  const { students, buses, routes, tapEvents, activeStudentId, setActiveStudent } = useDemoStore()

  // Match current student: if signed-in user matches a student email/name, use that, else activeStudentId
  const currentStudent =
    (isSignedIn && user?.primaryEmailAddress?.emailAddress
      ? students.find(
          (s) =>
            s.email.toLowerCase() ===
            user.primaryEmailAddress!.emailAddress.toLowerCase()
        )
      : null) ||
    students.find((s) => s.id === activeStudentId) ||
    students[0]

  const assignedBus = buses.find((b) => b.id === currentStudent?.assignedBusId) || buses[0]
  const assignedRoute = routes.find((r) => r.id === currentStudent?.assignedRouteId) || routes[0]

  // Live tap history from Neon DB
  const [dbTaps, setDbTaps] = useState<any[]>([])

  useEffect(() => {
    if (!currentStudent?.id) return
    getStudentTapHistory({ data: { studentId: currentStudent.id } })
      .then((records) => {
        if (Array.isArray(records)) {
          setDbTaps(records)
        }
      })
      .catch((err) => console.warn('Failed to load DB tap history:', err))
  }, [currentStudent?.id, tapEvents.length])

  // Merge in-memory recent taps with DB taps
  const inMemoryTaps = tapEvents.filter((t) => t.studentId === currentStudent?.id)
  const combinedTaps = [...inMemoryTaps]
  for (const dbTap of dbTaps) {
    if (!combinedTaps.some((t) => t.id === dbTap.id)) {
      combinedTaps.push(dbTap)
    }
  }

  const availableSeats = Math.max(0, assignedBus.capacity - assignedBus.currentOccupancy)

  return (
    
    <RoleGuard allowedRoles={['admin', 'student']}>
      <div className="space-y-6 pb-12">
      {/* Student Profile Switcher Header */}
      <div className="bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
            <div className="w-full h-full bg-[--color-surface-overlay] rounded-[14px] flex items-center justify-center font-bold text-emerald-600 text-lg">
              {currentStudent.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase">
                Student Transport Pass
              </span>
              <span className="text-xs text-[--color-text-muted] font-mono">AY 2026-27</span>
            </div>
            <h2 className="text-xl font-bold text-[--color-text-primary] tracking-tight flex items-center gap-2">
              <span>{currentStudent.name}</span>
              <span className="text-xs font-mono font-normal text-[--color-text-muted]">
                ({currentStudent.regNumber})
              </span>
            </h2>
            <p className="text-xs text-[--color-text-secondary]">
              {currentStudent.department} • {currentStudent.year}
            </p>
          </div>
        </div>

        {/* Switch Student for presentation */}
        <div className="flex items-center gap-2 bg-[--color-surface-base] p-2 rounded-xl border border-[--color-border-mid]">
          <User className="w-4 h-4 text-[--color-text-muted]" />
          <span className="text-xs text-[--color-text-secondary]">Student:</span>
          <select
            value={currentStudent.id}
            onChange={(e) => setActiveStudent(e.target.value)}
            className="bg-transparent text-emerald-600 font-bold text-xs focus:outline-none cursor-pointer"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id} className="bg-[--color-surface-raised] text-[--color-text-primary]">
                {s.name} ({s.regNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: My Bus Card & Seat Meter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Assigned Vehicle */}
        <div className="bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-3">
            <span className="text-xs font-mono text-[--color-text-secondary] uppercase font-bold">Assigned Bus</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
              ● IN TRANSIT
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-[--color-text-primary] font-mono flex items-center gap-2">
              <BusIcon className="w-6 h-6 text-emerald-600" />
              <span>{assignedBus.busNumber}</span>
            </div>
            <div className="text-xs text-[--color-text-muted] font-mono mt-0.5">Plate: {assignedBus.plateNumber}</div>
          </div>

          <div className="space-y-1.5 text-xs pt-1 border-t border-[--color-border-subtle]">
            <div className="flex justify-between">
              <span className="text-[--color-text-muted]">Driver:</span>
              <span className="text-[--color-text-primary] font-medium">{assignedBus.driverName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[--color-text-muted]">Driver Phone:</span>
              <span className="text-emerald-700 font-mono font-medium">{assignedBus.driverPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[--color-text-muted]">Live Speed:</span>
              <span className="text-[--color-text-primary] font-mono">{assignedBus.speed} km/h</span>
            </div>
          </div>
        </div>

        {/* Card 2: Seating & Occupancy */}
        <div className="bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-3">
            <span className="text-xs font-mono text-[--color-text-secondary] uppercase font-bold">Live Seat Availability</span>
            <span className="text-xs font-mono text-emerald-700 font-bold">{availableSeats} Seats Free</span>
          </div>

          <div>
            <div className="text-2xl font-black text-[--color-text-primary] font-mono">
              {assignedBus.currentOccupancy} <span className="text-sm font-normal text-[--color-text-muted]">/ {assignedBus.capacity} Occupied</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[--color-surface-base] overflow-hidden mt-3 border border-[--color-border-mid]">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.round((assignedBus.currentOccupancy / assignedBus.capacity) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="text-xs text-[--color-text-secondary] pt-2 border-t border-[--color-border-subtle] flex items-center justify-between">
            <span>Boarding Status:</span>
            <span
              className={`font-bold ${
                currentStudent.currentBoardingState === 'boarded' ? 'text-emerald-700' : 'text-[--color-text-muted]'
              }`}
            >
              {currentStudent.currentBoardingState === 'boarded'
                ? '● You are currently ONBOARD'
                : '○ You are currently ALIGHTED'}
            </span>
          </div>
        </div>

        {/* Card 3: Digital Pass & Quick Actions */}
        <div className="bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-3 mb-3">
              <span className="text-xs font-mono text-[--color-text-secondary] uppercase font-bold">RFID Smart Pass</span>
              <span className="text-[10px] text-emerald-700 font-bold font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                NFC ACTIVE
              </span>
            </div>
            <div className="bg-[--color-surface-base] p-3 rounded-xl border border-[--color-border-mid] text-xs space-y-1">
              <span className="text-[10px] text-[--color-text-muted] block font-mono">LINKED CARD UID</span>
              <span className="text-base font-bold text-emerald-700 font-mono block">
                {currentStudent.cardUid}
              </span>
              <span className="text-[11px] text-[--color-text-secondary] block pt-1">
                Home Pickup: {currentStudent.homeStop}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[--color-border-subtle] flex items-center justify-between">
            <Link
              to="/route-requests"
              className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
            >
              <span>Change Route Petition</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Route Schedule & Stoppages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-3">
            <div>
              <span className="text-[10px] font-mono text-[--color-text-muted] uppercase">My Corridor</span>
              <h3 className="text-base font-bold text-[--color-text-primary]">{assignedRoute.name}</h3>
            </div>
            <span className="text-xs font-mono text-[--color-text-secondary] bg-[--color-surface-base] px-3 py-1 rounded-lg border border-[--color-border-mid]">
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
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                      : 'bg-[--color-surface-base] border-[--color-border-subtle]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[--color-surface-overlay] text-[--color-text-primary] border border-[--color-border-mid] flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-[--color-text-primary] flex items-center gap-2">
                        <span>{stop.stopName}</span>
                        {isHome && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded font-mono">
                            YOUR STOP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[--color-text-secondary] text-[11px]">
                    <span className="text-emerald-700 font-bold block">{stop.expectedMorningTime}</span>
                    <span className="text-[9px] text-[--color-text-muted]">Pickup</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Personal Tap History (4 cols) */}
        <div className="lg:col-span-4 bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-[--color-text-primary] uppercase tracking-wider flex items-center gap-1.5 border-b border-[--color-border-subtle] pb-3">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>My RFID Taps ({combinedTaps.length})</span>
          </h4>

          {combinedTaps.length === 0 ? (
            <div className="p-8 text-center text-xs text-[--color-text-muted] bg-[--color-surface-base] rounded-xl border border-[--color-border-subtle]">
              No recent tap activity for {currentStudent.name}.
              <Link to="/simulator" className="text-emerald-600 font-bold block mt-2 hover:underline">
                Simulate a tap now →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {combinedTaps.map((tap) => (
                <div
                  key={tap.id}
                  className="bg-[--color-surface-base] p-3 rounded-xl border border-[--color-border-subtle] text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase text-[--color-text-primary]">{tap.type}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        tap.verificationStatus === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {tap.verificationStatus}
                    </span>
                  </div>
                  <div className="text-[--color-text-secondary] text-[11px] truncate">{tap.stopName || 'Transit Gateway'}</div>
                  <div className="text-[10px] text-[--color-text-muted] font-mono">
                    {formatRelativeTime(tap.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </RoleGuard>
  )
}
