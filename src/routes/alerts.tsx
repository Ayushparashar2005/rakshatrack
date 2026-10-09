import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
  Bell,
  AlertTriangle,
  Info,
  AlertOctagon,
  CheckCircle2,
  Check,
  Clock,
  Shield,
  Bus as BusIcon,
  User,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import { formatRelativeTime } from '@/lib/utils'

export const Route = createFileRoute('/alerts')({
  component: AlertsCenterPage,
})

function AlertsCenterPage() {
  const { alerts, markAlertRead, markAllAlertsRead } = useDemoStore()
  const [filterSeverity, setFilterSeverity] = useState<string>('all')

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'all') return true
    return a.severity === filterSeverity
  })

  const unreadCount = alerts.filter((a) => !a.isRead).length

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-mono">
              Transit Safety Dispatch
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-Time Incident Stream</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Safety Alerts & Incident Feed</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated notifications for GPS proximity flags, capacity violations, and sensor connectivity alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAlertsRead()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {['all', 'warning', 'critical', 'info'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-colors ${
              filterSeverity === sev
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {sev} ({sev === 'all' ? alerts.length : alerts.filter((a) => a.severity === sev).length})
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[#101726] p-12 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
            No incident alerts logged under this category.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                !alert.isRead
                  ? 'bg-[#151c2d] border-emerald-500/30 shadow-lg'
                  : 'bg-[#101726] border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    alert.severity === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : alert.severity === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  }`}
                >
                  {alert.severity === 'warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : alert.severity === 'critical' ? (
                    <AlertOctagon className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                    {!alert.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{alert.message}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                    <span>{formatRelativeTime(alert.timestamp)}</span>
                    {alert.busNumber && <span>Vehicle: {alert.busNumber}</span>}
                    {alert.studentName && <span>Student: {alert.studentName}</span>}
                  </div>
                </div>
              </div>

              {!alert.isRead && (
                <button
                  onClick={() => markAlertRead(alert.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold self-start md:self-center flex-shrink-0"
                >
                  Acknowledge
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
