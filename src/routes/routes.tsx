import { RoleGuard } from '@/components/layout/RoleGuard'
import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
  Route as RouteIcon,
  MapPin,
  Clock,
  Bus as BusIcon,
  Users,
  ChevronRight,
  Navigation,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'

export const Route = createFileRoute('/routes')({
  component: RoutesManagementPage,
})

function RoutesManagementPage() {
  const { routes, buses, students } = useDemoStore()
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || 'route-a')
  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0]

  const assignedBuses = buses.filter((b) => b.currentRouteId === activeRoute.id)
  const assignedStudents = students.filter((s) => s.assignedRouteId === activeRoute.id)

  return (
    
    <RoleGuard allowedRoles={['admin']}>
      <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono">
              NCR Transport Network
            </span>
            <span className="text-xs text-[--color-text-muted] font-mono">Budhera Campus Corridors</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[--color-text-primary] tracking-tight flex items-center gap-2">
            <span>Routes & Stoppage Management</span>
          </h2>
          <p className="text-xs text-[--color-text-secondary] mt-1">
            3 scheduled corridors connecting Gurugram, Delhi Metro, and Faridabad to SGT University Campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[--color-text-primary] bg-[--color-surface-base] border border-[--color-border-mid] px-3 py-1.5 rounded-xl font-semibold">
            Corridors: <b className="text-emerald-600">{routes.length} Active Routes</b>
          </span>
        </div>
      </div>

      {/* Routes Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id
          const bCount = buses.filter((b) => b.currentRouteId === route.id).length
          const sCount = students.filter((s) => s.assignedRouteId === route.id).length

          return (
            <button
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-[--color-surface-overlay] border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                  : 'bg-[--color-surface-raised] border-[--color-border-subtle] hover:bg-[--color-surface-base]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{ backgroundColor: `${route.color}15`, color: route.color }}
                >
                  {route.code}
                </span>
                <span className="text-xs text-[--color-text-muted] font-mono">{route.estimatedMinutes} mins transit</span>
              </div>
              <h3 className="text-base font-bold text-[--color-text-primary] mb-1">{route.name}</h3>
              <p className="text-xs text-[--color-text-secondary] line-clamp-2 mb-3">{route.description}</p>
              <div className="flex items-center justify-between text-xs text-[--color-text-muted] pt-2 border-t border-[--color-border-subtle]">
                <span>{route.stops.length} Stops</span>
                <span>{bCount} Buses • {sCount} Students</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Detailed Selected Route Info & Stops */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stops Timeline (8 cols) */}
        <div className="lg:col-span-8 bg-[--color-surface-raised] p-6 rounded-2xl border border-[--color-border-subtle] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-3">
            <div>
              <span className="text-[10px] font-mono text-[--color-text-muted] uppercase">Active Corridor</span>
              <h3 className="text-lg font-bold text-[--color-text-primary] flex items-center gap-2">
                <span style={{ color: activeRoute.color }}>●</span>
                <span>{activeRoute.name} ({activeRoute.code})</span>
              </h3>
            </div>
            <span className="text-xs font-mono text-[--color-text-secondary] bg-[--color-surface-base] border border-[--color-border-mid] px-3 py-1 rounded-lg">
              Est. Transit: {activeRoute.estimatedMinutes} Minutes
            </span>
          </div>

          {/* Stops List */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-[--color-text-primary] uppercase tracking-wider block">
              Sequential Route Stops ({activeRoute.stops.length})
            </span>

            <div className="space-y-2.5">
              {activeRoute.stops.map((stop, index) => {
                const isFinal = index === activeRoute.stops.length - 1

                return (
                  <div
                    key={stop.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      isFinal
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                        : 'bg-[--color-surface-base] border-[--color-border-subtle]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                        style={{
                          backgroundColor: `${activeRoute.color}15`,
                          color: activeRoute.color,
                          border: `1px solid ${activeRoute.color}40`,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-[--color-text-primary] flex items-center gap-2">
                          <span>{stop.stopName}</span>
                          {isFinal && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded font-bold">
                              CAMPUS TERMINUS
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[--color-text-muted] font-mono mt-0.5">
                          GPS: {stop.lat}° N, {stop.lng}° E
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[--color-text-secondary] font-mono text-[11px] sm:text-right">
                      <div>
                        <span className="text-[9px] text-[--color-text-muted] block">MORNING PICKUP</span>
                        <span className="text-emerald-700 font-bold">{stop.expectedMorningTime}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[--color-text-muted] block">EVENING DROP</span>
                        <span className="text-[--color-text-primary]">{stop.expectedEveningTime}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Fleet & Statistics (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Assigned Buses Card */}
          <div className="bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-[--color-text-primary] uppercase tracking-wider flex items-center gap-1.5">
              <BusIcon className="w-4 h-4 text-emerald-600" />
              <span>Assigned Fleet Vehicles ({assignedBuses.length})</span>
            </h4>

            <div className="space-y-2">
              {assignedBuses.map((bus) => (
                <div
                  key={bus.id}
                  className="bg-[--color-surface-base] p-3 rounded-xl border border-[--color-border-subtle] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[--color-text-primary] font-mono">{bus.busNumber}</span>
                    <span className="text-emerald-700 font-mono font-semibold">{bus.currentOccupancy}/{bus.capacity} seats</span>
                  </div>
                  <div className="text-[11px] text-[--color-text-secondary]">
                    Driver: {bus.driverName} ({bus.driverPhone})
                  </div>
                  <div className="text-[10px] text-[--color-text-muted] font-mono">
                    Speed: {bus.speed} km/h • GPS: {bus.currentLat}, {bus.currentLng}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Passenger Demographics */}
          <div className="bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm space-y-2 text-xs">
            <h4 className="text-xs font-bold text-[--color-text-primary] uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Passenger Allocation</span>
            </h4>
            <div className="flex justify-between py-1 border-b border-[--color-border-subtle]">
              <span className="text-[--color-text-muted]">Total Enrolled:</span>
              <span className="font-bold text-[--color-text-primary] font-mono">{assignedStudents.length} Students</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[--color-border-subtle]">
              <span className="text-[--color-text-muted]">Fleet Seating:</span>
              <span className="font-bold text-[--color-text-primary] font-mono">
                {assignedBuses.reduce((a, b) => a + b.capacity, 0)} Seats
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[--color-text-muted]">Buffer Surplus:</span>
              <span className="font-bold text-emerald-700 font-mono">
                +{assignedBuses.reduce((a, b) => a + b.capacity, 0) - assignedStudents.length} Seats
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </RoleGuard>
  )
}
