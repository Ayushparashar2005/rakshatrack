import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
  Bus as BusIcon,
  Gauge,
  Users,
  ShieldCheck,
  AlertTriangle,
  Phone,
  User,
  Activity,
  Edit,
  X,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import type { Bus } from '@/lib/types'

export const Route = createFileRoute('/buses')({
  component: BusesManagementPage,
})

function BusesManagementPage() {
  const { buses, routes } = useDemoStore()
  const [editingBus, setEditingBus] = useState<Bus | null>(null)
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [capacity, setCapacity] = useState(50)

  const openEdit = (bus: Bus) => {
    setEditingBus(bus)
    setDriverName(bus.driverName)
    setDriverPhone(bus.driverPhone)
    setCapacity(bus.capacity)
  }

  const saveBus = () => {
    if (!editingBus) return
    editingBus.driverName = driverName
    editingBus.driverPhone = driverPhone
    editingBus.capacity = capacity
    setEditingBus(null)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
              Fleet Operations & Hardware
            </span>
            <span className="text-xs text-slate-400 font-mono">Vehicle Sensor Diagnostic</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Bus Fleet & Telemetry Units</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            4 commercial passenger vehicles equipped with simulated RFID gateway readers and GPS units.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl">
            Fleet: <b className="text-emerald-400">{buses.length} Active Vehicles</b>
          </span>
        </div>
      </div>

      {/* Bus Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buses.map((bus) => {
          const route = routes.find((r) => r.id === bus.currentRouteId)
          const occupancyPercent = Math.round((bus.currentOccupancy / bus.capacity) * 100)

          return (
            <div
              key={bus.id}
              className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-emerald-400">
                    <BusIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                      <span>{bus.busNumber}</span>
                      <span className="text-xs font-normal text-slate-400">({bus.plateNumber})</span>
                    </h3>
                    <p className="text-xs text-slate-400">{bus.model}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      bus.deviceStatus === 'online'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    ● {bus.deviceStatus}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                    Sensor: Heartbeat OK
                  </span>
                </div>
              </div>

              {/* Live Occupancy Gauge */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Passenger Occupancy:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {bus.currentOccupancy} / {bus.capacity} seats ({occupancyPercent}%)
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      occupancyPercent > 90
                        ? 'bg-rose-500'
                        : occupancyPercent > 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                  />
                </div>
              </div>

              {/* Telemetry info */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">SIMULATED VELOCITY</span>
                  <span className="text-slate-200 font-bold">{bus.speed} km/h</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">COORDINATES</span>
                  <span className="text-emerald-400 text-[11px] truncate block">
                    {bus.currentLat}, {bus.currentLng}
                  </span>
                </div>
              </div>

              {/* Crew Details */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Route:</span>
                  <span className="font-semibold text-slate-200">{route?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Driver:</span>
                  <span className="font-semibold text-slate-200">{bus.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Driver Contact:</span>
                  <span className="font-mono text-slate-300">{bus.driverPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bus Conductor:</span>
                  <span className="text-slate-200">{bus.conductorName}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => openEdit(bus)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Edit Crew & Capacity</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Modal */}
      {editingBus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#101726] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Edit Bus Configuration</h3>
                <p className="text-xs text-slate-400">{editingBus.busNumber} ({editingBus.plateNumber})</p>
              </div>
              <button onClick={() => setEditingBus(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Driver Full Name</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Driver Phone Number</label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Seating Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingBus(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={saveBus}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
              >
                Save Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
