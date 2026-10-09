import { RoleGuard } from '@/components/layout/RoleGuard'
import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
  Users,
  Bus as BusIcon,
  Navigation,
  UserCheck,
  UserMinus,
  AlertTriangle,
  ArrowRight,
  Radio,
  Clock,
  ShieldCheck,
  TrendingUp,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import { FleetMap } from '@/components/map/FleetMap'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import { formatRelativeTime } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const {
    students,
    buses,
    routes,
    tapEvents,
    verifications,
    alerts,
    lastProcessedTap,
  } = useDemoStore()

  const [selectedBusId, setSelectedBusId] = useState<string | null>(null)

  // Derived live metrics
  const totalStudents = students.length
  const totalBuses = buses.length
  const activeTrips = buses.filter((b) => b.status === 'in_transit').length
  const totalStudentsOnboard = buses.reduce((acc, b) => acc + b.currentOccupancy, 0)
  const totalCapacity = buses.reduce((acc, b) => acc + b.capacity, 0)
  const availableSeats = Math.max(0, totalCapacity - totalStudentsOnboard)
  
  const todayBoardings = tapEvents.filter((t) => t.type === 'boarding').length
  const todayAlightings = tapEvents.filter((t) => t.type === 'alighting').length
  
  const pendingVerificationAlerts = verifications.filter(
    (v) => v.status === 'flagged' && v.reviewStatus === 'pending'
  ).length

  // Bus Occupancy data for chart
  const occupancyChartData = buses.map((bus) => ({
    name: bus.busNumber,
    occupancy: bus.currentOccupancy,
    capacity: bus.capacity,
    available: Math.max(0, bus.capacity - bus.currentOccupancy),
    percent: Math.round((bus.currentOccupancy / bus.capacity) * 100),
  }))

  // Hourly transit activity distribution
  const activityData = [
    { hour: '07:00', boardings: 14, alightings: 0 },
    { hour: '07:30', boardings: 28, alightings: 2 },
    { hour: '08:00', boardings: 42, alightings: 6 },
    { hour: '08:30', boardings: Math.max(10, todayBoardings), alightings: Math.max(5, todayAlightings) },
    { hour: '09:00', boardings: 8, alightings: 12 },
    { hour: '16:00', boardings: 4, alightings: 18 },
  ]

  return (
    
    <RoleGuard allowedRoles={['admin', 'student', 'guardian']}>
      <div className="space-y-6 pb-12">
      {/* Hero Presentation Header */}
      <div className="nm-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-[--color-accent-600] border border-[--color-border-accent] px-2.5 py-0.5 rounded-full font-mono">
              University Transport HQ
            </span>
            <span className="text-xs text-[--color-text-muted] font-mono">
              Budhera Campus • AY 2026-27
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[--color-text-primary] tracking-tight">
            RakshaTrack Fleet & Attendance Command Center
          </h2>
          <p className="text-xs md:text-sm text-[--color-text-muted] max-w-2xl mt-1">
            Real-time telemetry, automated mobile GPS cross-verification, and occupancy monitoring.
            Operating under strict <span className="text-[--color-accent-600] font-semibold">Flag, Not Block</span> protocol.
          </p>
        </div>

        {/* Quick CTA to Simulator */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/simulator"
            className="nm-btn flex items-center gap-2 px-4 py-2.5 bg-[--color-accent-500] text-white font-bold rounded-xl text-xs md:text-sm"
          >
            <Radio className="w-4 h-4 text-white" />
            <span>Launch Attendance Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 8 Primary Live KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* Total Students */}
        <div className="stat-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[--color-text-muted] uppercase tracking-widest">Students</span>
            <Users className="w-4 h-4 text-[--color-text-muted]" />
          </div>
          <div className="text-3xl font-bold text-[--color-text-primary] tabular-nums tracking-tight">{totalStudents}</div>
          <div className="text-xs text-[--color-text-secondary] mt-1">Registered & Active</div>
        </div>

        {/* Total Buses */}
        <div className="stat-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[--color-text-muted] uppercase tracking-widest">Fleet Buses</span>
            <BusIcon className="w-4 h-4 text-[--color-text-muted]" />
          </div>
          <div className="text-3xl font-bold text-[--color-text-primary] tabular-nums tracking-tight">{totalBuses}</div>
          <div className="text-xs text-[--color-text-secondary] mt-1">3 City Routes</div>
        </div>

        {/* Active Trips */}
        <div className="stat-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[--color-text-muted] uppercase tracking-widest">Active Trips</span>
            <Navigation className="w-4 h-4 text-[--color-accent-500]" />
          </div>
          <div className="text-3xl font-bold text-[--color-accent-500] tabular-nums tracking-tight">{activeTrips}</div>
          <div className="text-xs text-[--color-text-secondary] mt-1">Morning Shifts</div>
        </div>

        {/* Students Onboard */}
        <div className="stat-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[--color-text-muted] uppercase tracking-widest">Onboard</span>
            <UserCheck className="w-4 h-4 text-[--color-accent-500]" />
          </div>
          <div className="text-3xl font-bold text-[--color-text-primary] tabular-nums tracking-tight">{totalStudentsOnboard}</div>
          <div className="text-xs text-[--color-accent-500] mt-1">In transit now</div>
        </div>

        {/* Available Seats */}
        <div className="stat-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[--color-text-muted] uppercase tracking-widest">Seats Avail</span>
            <TrendingUp className="w-4 h-4 text-[--color-text-muted]" />
          </div>
          <div className="text-3xl font-bold text-[--color-text-primary] tabular-nums tracking-tight">{availableSeats}</div>
          <div className="text-xs text-[--color-text-secondary] mt-1">Total Cap: {totalCapacity}</div>
        </div>

        {/* Today's Boardings */}
        <div className="stat-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[--color-text-muted] uppercase tracking-widest">Boardings</span>
            <UserCheck className="w-4 h-4 text-[--color-accent-500]" />
          </div>
          <div className="text-3xl font-bold text-[--color-accent-500] tabular-nums tracking-tight">{todayBoardings}</div>
          <div className="text-xs text-[--color-text-secondary] mt-1">Today's Taps</div>
        </div>

        {/* Today's Alightings */}
        <div className="stat-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[--color-text-muted] uppercase tracking-widest">Alightings</span>
            <UserMinus className="w-4 h-4 text-[--color-text-muted]" />
          </div>
          <div className="text-3xl font-bold text-[--color-text-primary] tabular-nums tracking-tight">{todayAlightings}</div>
          <div className="text-xs text-[--color-text-secondary] mt-1">Exited Vehicle</div>
        </div>

        {/* Pending Verification Alerts */}
        <Link
          to="/reviews"
          className="stat-card p-5 hover:bg-[--color-surface-overlay] border-amber-500/30 group block transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-amber-500 uppercase tracking-widest">GPS Flags</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-500 tabular-nums tracking-tight">
            {pendingVerificationAlerts}
          </div>
          <div className="text-xs text-amber-500/80 mt-1 underline">Review Cases →</div>
        </Link>
      </div>

      {/* Main Grid: Interactive Map + Occupancy by Bus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-[--color-text-primary] tracking-wide uppercase">
                Active Fleet Live Telemetry Map
              </h3>
            </div>
            <Link
              to="/fleet"
              className="text-xs text-[--color-accent-600] hover:text-[--color-accent-700] flex items-center gap-1 font-medium"
            >
              <span>Full Screen Fleet Operations</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <FleetMap
            height="460px"
            selectedBusId={selectedBusId}
            onSelectBus={(id) => setSelectedBusId(id)}
          />

          {/* Quick Route Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {routes.map((route) => {
              const assignedBuses = buses.filter((b) => b.currentRouteId === route.id)
              return (
                <div
                  key={route.id}
                  className="nm-card p-3 text-xs"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: route.color }}
                    />
                    <span className="font-bold text-[--color-text-primary]">{route.name}</span>
                  </div>
                  <p className="text-[11px] text-[--color-text-muted] truncate">{route.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[--color-text-secondary]">
                    <span>{route.totalStops} Stoppages</span>
                    <span className="font-mono text-[--color-accent-500]">
                      {assignedBuses.map((b) => b.busNumber).join(', ')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Fleet Occupancy & Transit Curves (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Occupancy Card */}
          <div className="nm-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[--color-text-primary] tracking-wide uppercase">
                Occupancy by Vehicle
              </h3>
              <span className="text-[10px] text-[--color-text-muted] font-mono">Capacity vs Occupied</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyChartData} layout="vertical" margin={{ left: -15, right: 10 }}>
                  <XAxis type="number" domain={[0, 55]} stroke="var(--color-border-mid)" fontSize={10} />
                  <YAxis type="category" dataKey="name" stroke="var(--color-text-muted)" fontSize={10} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-surface-float)', borderColor: 'var(--color-border-subtle)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-primary)' }}
                    formatter={(val: any, name: any) => [`${val} seats`, name === 'occupancy' ? 'Occupied' : 'Available']}
                  />
                  <Bar dataKey="occupancy" radius={[0, 4, 4, 0]}>
                    {occupancyChartData.map((entry, index) => (
                      <Cell
                         key={`cell-${index}`}
                         fill={entry.percent > 90 ? 'var(--color-danger)' : entry.percent > 70 ? 'var(--color-flagged)' : 'var(--color-accent-500)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List breakdown */}
            <div className="mt-3 space-y-2 border-t border-[--color-border-subtle] pt-3">
              {buses.map((bus) => {
                const percent = Math.round((bus.currentOccupancy / bus.capacity) * 100)
                return (
                  <div key={bus.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[--color-text-primary]">{bus.busNumber}</span>
                      <span className="text-[10px] text-[--color-text-muted]">({bus.plateNumber})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[--color-text-secondary]">
                        {bus.currentOccupancy}/{bus.capacity}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          percent > 90
                            ? 'bg-[--color-danger]/20 text-[--color-danger]'
                            : percent > 70
                            ? 'bg-[--color-flagged]/20 text-[--color-flagged]'
                            : 'bg-[--color-accent-500]/20 text-[--color-accent-500]'
                        }`}
                      >
                        {percent}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Transit Volume Curve */}
          <div className="nm-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[--color-text-primary] tracking-wide uppercase">
                Attendance Ingress Activity
              </h3>
              <span className="text-[10px] text-[--color-accent-500] font-mono">Today's Timeline</span>
            </div>

            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ left: -25, right: 10, top: 5, bottom: 0 }}>
                  <XAxis dataKey="hour" stroke="var(--color-border-mid)" fontSize={10} />
                  <YAxis stroke="var(--color-border-mid)" fontSize={10} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-surface-float)', borderColor: 'var(--color-border-subtle)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-primary)' }}
                  />
                  <Area type="monotone" dataKey="boardings" stroke="var(--color-accent-500)" fillOpacity={1} fill="oklch(0.65 0.195 155 / 0.12)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tap Events Feed & Pending Reviews Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Activity Ledger (7 cols) */}
        <div className="lg:col-span-7 nm-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[--color-accent-500]" />
              <h3 className="text-xs font-bold text-[--color-text-primary] tracking-wide uppercase">
                Live Attendance Event Stream
              </h3>
            </div>
            <Link
              to="/attendance"
              className="text-xs text-[--color-text-secondary] hover:text-[--color-text-primary] flex items-center gap-1 font-medium"
            >
              <span>View Full Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[--color-border-subtle]">
            {tapEvents.slice(0, 6).map((tap) => {
              const student = students.find((s) => s.id === tap.studentId)
              const bus = buses.find((b) => b.id === tap.busId)
              const verif = verifications.find((v) => v.tapEventId === tap.id)

              return (
                <div key={tap.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                        tap.type === 'boarding'
                          ? 'bg-[--color-accent-500]/20 text-[--color-accent-500] border border-[--color-accent-500]/30'
                          : 'bg-[--color-surface-overlay] text-[--color-text-muted] border border-[--color-border-mid]'
                      }`}
                    >
                      {tap.type === 'boarding' ? 'IN' : 'OUT'}
                    </div>
                    <div>
                      <div className="font-semibold text-[--color-text-primary] flex items-center gap-2">
                        <span>{student?.name || 'Student'}</span>
                        <span className="text-[10px] text-[--color-text-muted] font-mono">
                          ({student?.regNumber})
                        </span>
                      </div>
                      <div className="text-[11px] text-[--color-text-secondary] flex items-center gap-2">
                        <span className="font-mono text-[--color-accent-500]">{bus?.busNumber}</span>
                        <span>•</span>
                        <span>{tap.stopName || 'Campus Stop'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tap.verificationStatus === 'verified'
                            ? 'bg-[--color-accent-500]/20 text-[--color-accent-500] border border-[--color-accent-500]/40'
                            : tap.verificationStatus === 'flagged'
                            ? 'bg-[--color-flagged]/20 text-[--color-flagged] border border-[--color-flagged]/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}
                      >
                        {tap.verificationStatus}
                      </span>
                      <div className="text-[10px] text-[--color-text-muted] mt-0.5 font-mono">
                        {formatRelativeTime(tap.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Urgent Review Center Spotlight (5 cols) */}
        <div className="lg:col-span-5 nm-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-[--color-text-primary] tracking-wide uppercase">
                  Flagged GPS Verification Cases
                </h3>
              </div>
              <Link
                to="/reviews"
                className="text-xs text-[--color-flagged] hover:text-amber-400 font-semibold"
              >
                Review Center ({pendingVerificationAlerts}) →
              </Link>
            </div>

            <p className="text-xs text-[--color-text-secondary] mb-4">
              Events flagged by the Haversine distance engine where mobile GPS coordinates diverged from bus reader location.
            </p>

            <div className="space-y-2.5">
              {verifications
                .filter((v) => v.status === 'flagged')
                .slice(0, 3)
                .map((verif) => {
                  const tap = tapEvents.find((t) => t.id === verif.tapEventId)
                  const student = students.find((s) => s.id === tap?.studentId)
                  const bus = buses.find((b) => b.id === tap?.busId)

                  return (
                    <div
                      key={verif.id}
                      className="nm-inset p-3 border-[--color-flagged]/30 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[--color-text-primary]">{student?.name}</span>
                        <span className="text-[10px] bg-[--color-flagged]/20 text-[--color-flagged] font-mono px-1.5 py-0.5 rounded font-bold">
                          {verif.distanceMeters}m MISMATCH
                        </span>
                      </div>
                      <p className="text-[11px] text-[--color-text-secondary] line-clamp-2">
                        {verif.explanation}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-[--color-border-subtle] text-[10px] text-[--color-text-muted]">
                        <span>Vehicle: {bus?.busNumber}</span>
                        <Link
                          to="/reviews"
                          className="text-[--color-flagged] hover:underline font-semibold"
                        >
                          Audit Decision →
                        </Link>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[--color-border-subtle] bg-[--color-surface-overlay] p-2.5 rounded-lg flex items-center justify-between text-xs">
            <span className="text-[--color-text-muted]">Policy Compliance:</span>
            <span className="text-[--color-accent-500] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[--color-accent-500]" />
              100% Boardings Preserved
            </span>
          </div>
        </div>
      </div>
    </div>
    </RoleGuard>
  )
}
