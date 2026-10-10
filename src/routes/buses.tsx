import { RoleGuard } from '@/components/layout/RoleGuard'
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
  const { buses, routes, updateBus } = useDemoStore()
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

  const saveBus = async () => {
    if (!editingBus) return
    updateBus(editingBus.id, {
      driverName,
      driverPhone,
      capacity
    })
    
    // Live persistence to Neon DB
    import('@/lib/db/actions').then(({ updateBusInDB }) => {
      updateBusInDB({
        data: {
          id: editingBus.id,
          driverName,
          driverPhone,
          capacity
        }
      }).then((res) => {
        if (!res.success) {
          console.warn('Failed to persist bus update to DB')
        }
      })
    })

    import('@/hooks/useToast').then(({ toast }) => {
      toast.success(`${editingBus.busNumber} crew & capacity updated`)
    })
    
    setEditingBus(null)
  }

  return (
    
    <RoleGuard allowedRoles={['admin']}>
      <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="section-tag">
              Fleet Operations & Hardware
            </span>
            <span className="text-xs text-[--color-text-muted] font-mono">Vehicle Sensor Diagnostic</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[--color-text-primary] tracking-tight flex items-center gap-2">
            <span>Bus Fleet & Telemetry Units</span>
          </h2>
          <p className="text-xs text-[--color-text-secondary] mt-1">
            4 commercial passenger vehicles equipped with simulated RFID gateway readers and GPS units.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[--color-text-primary] bg-[--color-surface-base] border border-[--color-border-mid] px-3 py-1.5 rounded-xl font-semibold">
            Fleet: <b className="text-emerald-600">{buses.length} Active Vehicles</b>
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
              className="bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[--color-surface-base] border border-[--color-border-mid] flex items-center justify-center font-bold text-emerald-600">
                    <BusIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[--color-text-primary] font-mono flex items-center gap-2">
                      <span>{bus.busNumber}</span>
                      <span className="text-xs font-normal text-[--color-text-muted]">({bus.plateNumber})</span>
                    </h3>
                    <p className="text-xs text-[--color-text-secondary]">{bus.model}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      bus.deviceStatus === 'online'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    ● {bus.deviceStatus}
                  </span>
                  <span className="text-[10px] text-[--color-text-muted] block font-mono mt-0.5">
                    Sensor: Heartbeat OK
                  </span>
                </div>
              </div>

              {/* Live Occupancy Gauge */}
              <div className="bg-[--color-surface-base] p-3.5 rounded-xl border border-[--color-border-subtle] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[--color-text-secondary]">Passenger Occupancy:</span>
                  <span className="font-mono font-bold text-[--color-text-primary]">
                    {bus.currentOccupancy} / {bus.capacity} seats ({occupancyPercent}%)
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-[--color-border-subtle] overflow-hidden">
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
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[--color-surface-base] p-2.5 rounded-lg border border-[--color-border-subtle]">
                <div>
                  <span className="text-[10px] text-[--color-text-muted] block">SIMULATED VELOCITY</span>
                  <span className="text-[--color-text-primary] font-bold">{bus.speed} km/h</span>
                </div>
                <div>
                  <span className="text-[10px] text-[--color-text-muted] block">COORDINATES</span>
                  <span className="text-emerald-700 text-[11px] truncate block font-semibold">
                    {bus.currentLat}, {bus.currentLng}
                  </span>
                </div>
              </div>

              {/* Crew Details */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[--color-text-muted]">Assigned Route:</span>
                  <span className="font-semibold text-[--color-text-primary]">{route?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[--color-text-muted]">Primary Driver:</span>
                  <span className="font-semibold text-[--color-text-primary]">{bus.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[--color-text-muted]">Driver Contact:</span>
                  <span className="font-mono text-[--color-text-secondary]">{bus.driverPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[--color-text-muted]">Bus Conductor:</span>
                  <span className="text-[--color-text-primary]">{bus.conductorName}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[--color-border-subtle] flex justify-end">
                <button
                  onClick={() => openEdit(bus)}
                  className="px-3 py-1.5 rounded-lg bg-[--color-surface-base] hover:bg-[--color-surface-overlay] text-[--color-text-primary] border border-[--color-border-mid] text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Edit className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Edit Crew & Capacity</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Modal */}
      {editingBus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[--color-surface-overlay] border border-[--color-border-mid] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-3">
              <div>
                <h3 className="text-base font-bold text-[--color-text-primary]">Edit Bus Configuration</h3>
                <p className="text-xs text-[--color-text-muted]">{editingBus.busNumber} ({editingBus.plateNumber})</p>
              </div>
              <button onClick={() => setEditingBus(null)} className="text-[--color-text-muted] hover:text-[--color-text-primary]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[--color-text-secondary] font-semibold mb-1">Driver Full Name</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-[--color-surface-base] border border-[--color-border-mid] rounded-xl px-3 py-2 text-[--color-text-primary] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[--color-text-secondary] font-semibold mb-1">Driver Phone Number</label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full bg-[--color-surface-base] border border-[--color-border-mid] rounded-xl px-3 py-2 text-[--color-text-primary] font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[--color-text-secondary] font-semibold mb-1">Seating Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full bg-[--color-surface-base] border border-[--color-border-mid] rounded-xl px-3 py-2 text-[--color-text-primary] font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[--color-border-subtle]">
              <button
                onClick={() => setEditingBus(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[--color-text-secondary] hover:text-[--color-text-primary]"
              >
                Cancel
              </button>
              <button
                onClick={saveBus}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
              >
                Save Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </RoleGuard>
  )
}
