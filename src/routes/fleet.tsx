import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
  MapPin,
  Bus as BusIcon,
  Navigation,
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Users,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import { FleetMap } from '@/components/map/FleetMap'

export const Route = createFileRoute('/fleet')({
  component: FleetTrackingPage,
})

function FleetTrackingPage() {
  const {
    buses,
    routes,
    isSimulationRunning,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
    resetToDefault,
  } = useDemoStore()

  const [selectedBusId, setSelectedBusId] = useState<string>(buses[0]?.id || 'bus-101')
  const selectedBus = buses.find((b) => b.id === selectedBusId) || buses[0]
  const currentRoute = routes.find((r) => r.id === selectedBus.currentRouteId)

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[--color-surface-raised] p-5 rounded-[--radius-lg] border border-[--color-border-subtle] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono">
              GPS Telemetry Feed
            </span>
            <span className="text-xs text-[--color-text-muted] font-mono">Simulated Coordinates</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[--color-text-primary] tracking-tight flex items-center gap-2">
            <span>Fleet Tracking & Vehicle Telemetry Console</span>
          </h2>
          <p className="text-xs text-[--color-text-muted] mt-1">
            Real-time tracking of all 4 SGT University transport buses along NCR corridors.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => toggleSimulation()}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-[--radius-md] text-xs font-bold transition-colors duration-150 shadow-sm ${
              isSimulationRunning
                ? 'bg-[--color-accent-600] text-white'
                : 'bg-[--color-surface-overlay] text-[--color-text-primary] border border-[--color-border-mid] hover:bg-[--color-surface-float]'
            }`}
          >
            {isSimulationRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause Movement</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Bus Movement</span>
              </>
            )}
          </button>

          <div className="flex items-center bg-[--color-surface-overlay] rounded-[--radius-md] border border-[--color-border-mid] p-1">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2.5 py-1 rounded-[--radius-sm] text-xs font-mono font-bold transition-colors ${
                  simulationSpeed === spd
                    ? 'bg-[--color-accent-600] text-white'
                    : 'text-[--color-text-muted] hover:text-[--color-text-primary]'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={() => resetToDefault()}
            className="p-2 rounded-[--radius-md] bg-[--color-surface-overlay] text-[--color-text-muted] hover:text-[--color-danger] border border-[--color-border-mid] transition-colors"
            title="Reset Simulation Positions"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Selected Vehicle Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Container (8 cols) */}
        <div className="lg:col-span-8">
          <FleetMap
            height="580px"
            selectedBusId={selectedBusId}
            onSelectBus={(id) => setSelectedBusId(id)}
            showControls={true}
          />
        </div>

        {/* Selected Bus Telemetry Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[--color-surface-raised] p-5 rounded-[--radius-lg] border border-[--color-border-subtle] shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[--color-text-muted] uppercase">Selected Vehicle</span>
                <h3 className="text-lg font-bold text-[--color-text-primary] font-mono flex items-center gap-2">
                  <span>{selectedBus.busNumber}</span>
                  <span className="text-xs font-normal text-[--color-text-muted]">({selectedBus.plateNumber})</span>
                </h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded-[--radius-sm] text-[10px] font-bold uppercase ${
                  selectedBus.deviceStatus === 'online'
                    ? 'bg-[--color-accent-500]/20 text-[--color-accent-500] border border-[--color-accent-500]/30'
                    : 'bg-[--color-flagged]/20 text-[--color-flagged] border border-[--color-flagged]/30'
                }`}
              >
                {selectedBus.deviceStatus}
              </span>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-[--color-surface-overlay] p-2.5 rounded-[--radius-md] border border-[--color-border-subtle]">
                <span className="text-[10px] text-[--color-text-muted] block">Occupancy</span>
                <span className="text-base font-bold text-[--color-accent-500] font-mono">
                  {selectedBus.currentOccupancy} / {selectedBus.capacity}
                </span>
                <span className="text-[10px] text-[--color-text-secondary] block mt-0.5">
                  {Math.round((selectedBus.currentOccupancy / selectedBus.capacity) * 100)}% Capacity
                </span>
              </div>

              <div className="bg-[--color-surface-overlay] p-2.5 rounded-[--radius-md] border border-[--color-border-subtle]">
                <span className="text-[10px] text-[--color-text-muted] block">Current Velocity</span>
                <span className="text-base font-bold text-sky-400 font-mono">
                  {selectedBus.speed} km/h
                </span>
                <span className="text-[10px] text-[--color-text-secondary] block mt-0.5">
                  Heading {selectedBus.heading}° NW
                </span>
              </div>
            </div>

            {/* Current Coordinates */}
            <div className="bg-[--color-surface-overlay] p-3 rounded-[--radius-md] border border-[--color-border-subtle] text-xs space-y-1">
              <span className="text-[10px] text-[--color-text-muted] uppercase font-mono block">Simulated GPS Coordinates</span>
              <div className="font-mono text-[--color-text-primary] flex justify-between">
                <span>Latitude:</span>
                <span className="text-[--color-accent-500] font-bold">{selectedBus.currentLat}° N</span>
              </div>
              <div className="font-mono text-[--color-text-primary] flex justify-between">
                <span>Longitude:</span>
                <span className="text-[--color-accent-500] font-bold">{selectedBus.currentLng}° E</span>
              </div>
              <div className="font-mono text-[--color-text-primary] flex justify-between text-[11px] pt-1 border-t border-[--color-border-subtle]">
                <span>Last Telemetry Heartbeat:</span>
                <span className="text-[--color-text-muted]">Just now</span>
              </div>
            </div>

            {/* Route & Crew details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[--color-border-subtle]">
                <span className="text-[--color-text-muted]">Assigned Route:</span>
                <span className="font-semibold text-[--color-text-primary]">{currentRoute?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[--color-border-subtle]">
                <span className="text-[--color-text-muted]">Assigned Driver:</span>
                <span className="font-semibold text-[--color-text-primary]">{selectedBus.driverName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[--color-border-subtle]">
                <span className="text-[--color-text-muted]">Driver Phone:</span>
                <span className="font-mono text-[--color-text-secondary]">{selectedBus.driverPhone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[--color-text-muted]">Conductor:</span>
                <span className="font-semibold text-[--color-text-primary]">{selectedBus.conductorName}</span>
              </div>
            </div>

            {/* Stoppages Mini List */}
            <div>
              <span className="text-xs font-bold text-[--color-text-primary] uppercase tracking-wider block mb-2">
                Route Stoppages ({currentRoute?.stops.length})
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {currentRoute?.stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="flex items-center justify-between p-2 rounded-[--radius-sm] bg-[--color-surface-float] border border-[--color-border-subtle] text-[11px]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-4 h-4 rounded-full bg-[--color-surface-overlay] text-[--color-text-muted] flex items-center justify-center font-mono text-[9px] border border-[--color-border-mid]">
                        {idx + 1}
                      </span>
                      <span className="text-[--color-text-primary] font-medium truncate">{stop.stopName}</span>
                    </div>
                    <span className="text-[--color-text-muted] font-mono text-[10px] flex-shrink-0">
                      {stop.expectedMorningTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
