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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
              NCR Transport Network
            </span>
            <span className="text-xs text-slate-400 font-mono">Budhera Campus Corridors</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Routes & Stoppage Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            3 scheduled corridors connecting Gurugram, Delhi Metro, and Faridabad to SGT University Campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl">
            Corridors: <b className="text-emerald-400">{routes.length} Active Routes</b>
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
                  ? 'bg-[#151f33] border-emerald-500 shadow-xl shadow-emerald-500/10'
                  : 'bg-[#101726] border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{ backgroundColor: `${route.color}22`, color: route.color }}
                >
                  {route.code}
                </span>
                <span className="text-xs text-slate-400 font-mono">{route.estimatedMinutes} mins transit</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">{route.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">{route.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
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
        <div className="lg:col-span-8 bg-[#101726] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Active Corridor</span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span style={{ color: activeRoute.color }}>●</span>
                <span>{activeRoute.name} ({activeRoute.code})</span>
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
              Est. Transit: {activeRoute.estimatedMinutes} Minutes
            </span>
          </div>

          {/* Stops List */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
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
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                        style={{
                          backgroundColor: `${activeRoute.color}22`,
                          color: activeRoute.color,
                          border: `1px solid ${activeRoute.color}`,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          <span>{stop.stopName}</span>
                          {isFinal && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.2 rounded font-bold">
                              CAMPUS TERMINUS
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          GPS: {stop.lat}° N, {stop.lng}° E
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-300 font-mono text-[11px] sm:text-right">
                      <div>
                        <span className="text-[9px] text-slate-500 block">MORNING PICKUP</span>
                        <span className="text-emerald-400 font-bold">{stop.expectedMorningTime}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">EVENING DROP</span>
                        <span className="text-slate-300">{stop.expectedEveningTime}</span>
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
          <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BusIcon className="w-4 h-4 text-emerald-400" />
              <span>Assigned Fleet Vehicles ({assignedBuses.length})</span>
            </h4>

            <div className="space-y-2">
              {assignedBuses.map((bus) => (
                <div
                  key={bus.id}
                  className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 font-mono">{bus.busNumber}</span>
                    <span className="text-emerald-400 font-mono">{bus.currentOccupancy}/{bus.capacity} seats</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Driver: {bus.driverName} ({bus.driverPhone})
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Speed: {bus.speed} km/h • GPS: {bus.currentLat}, {bus.currentLng}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Passenger Demographics */}
          <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2 text-xs">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Passenger Allocation</span>
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Total Enrolled:</span>
              <span className="font-bold text-slate-200 font-mono">{assignedStudents.length} Students</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Fleet Seating:</span>
              <span className="font-bold text-slate-200 font-mono">
                {assignedBuses.reduce((a, b) => a + b.capacity, 0)} Seats
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Buffer Surplus:</span>
              <span className="font-bold text-emerald-400 font-mono">
                +{assignedBuses.reduce((a, b) => a + b.capacity, 0) - assignedStudents.length} Seats
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
