import { RoleGuard } from '@/components/layout/RoleGuard'
import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
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
import { getSystemAlertsFromDB, markAlertReadInDB } from '@/lib/db/actions'

export const Route = createFileRoute('/alerts')({
  component: AlertsCenterPage,
})

function AlertsCenterPage() {
  const { alerts, markAlertRead, markAllAlertsRead } = useDemoStore()
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [dbAlerts, setDbAlerts] = useState<any[]>([])

  useEffect(() => {
    getSystemAlertsFromDB()
      .then((records) => {
        if (Array.isArray(records)) {
          setDbAlerts(records)
        }
      })
      .catch((err) => console.warn('Failed to fetch DB alerts:', err))
  }, [alerts.length])

  // Merge in-memory and DB alerts
  const combinedAlerts = [...alerts]
  for (const da of dbAlerts) {
    if (!combinedAlerts.some((a) => a.id === da.id)) {
      combinedAlerts.push(da)
    }
  }

  const filteredAlerts = combinedAlerts.filter((a) => {
    if (filterSeverity === 'all') return true
    return a.severity === filterSeverity
  })

  const unreadCount = combinedAlerts.filter((a) => !a.isRead).length

  const handleMarkRead = (id: string) => {
    markAlertRead(id)
    markAlertReadInDB({ data: { alertId: id } }).catch(console.warn)
  }

  const handleMarkAllRead = () => {
    markAllAlertsRead()
    combinedAlerts.forEach((a) => {
      markAlertReadInDB({ data: { alertId: a.id } }).catch(console.warn)
    })
  }

  return (
    
    <RoleGuard allowedRoles={['admin']}>
      <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full font-mono">
              Transit Safety Dispatch
            </span>
            <span className="text-xs text-[--color-text-muted] font-mono">Real-Time Incident Stream</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[--color-text-primary] tracking-tight flex items-center gap-2">
            <span>Safety Alerts & Incident Feed</span>
          </h2>
          <p className="text-xs text-[--color-text-secondary] mt-1">
            Automated notifications for GPS proximity flags, capacity violations, and sensor connectivity alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[--color-surface-base] hover:bg-[--color-surface-overlay] text-[--color-text-primary] text-xs font-semibold border border-[--color-border-mid] shadow-xs"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
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
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-[--color-surface-raised] border border-[--color-border-subtle] text-[--color-text-secondary] hover:text-[--color-text-primary]'
            }`}
          >
            {sev} ({sev === 'all' ? combinedAlerts.length : combinedAlerts.filter((a) => a.severity === sev).length})
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[--color-surface-raised] p-12 rounded-2xl border border-[--color-border-subtle] text-center text-xs text-[--color-text-muted]">
            No incident alerts logged under this category.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                !alert.isRead
                  ? 'bg-[--color-surface-raised] border-emerald-400 shadow-sm'
                  : 'bg-[--color-surface-base] border-[--color-border-subtle] opacity-85'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    alert.severity === 'warning'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : alert.severity === 'critical'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-sky-50 text-sky-700 border border-sky-200'
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
                    <h4 className="text-sm font-bold text-[--color-text-primary]">{alert.title}</h4>
                    {!alert.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    )}
                  </div>
                  <p className="text-xs text-[--color-text-secondary]">{alert.message}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[--color-text-muted] font-mono pt-1">
                    <span>{formatRelativeTime(alert.timestamp)}</span>
                    {alert.busNumber && <span>Vehicle: {alert.busNumber}</span>}
                    {alert.studentName && <span>Student: {alert.studentName}</span>}
                  </div>
                </div>
              </div>

              {!alert.isRead && (
                <button
                  onClick={() => handleMarkRead(alert.id)}
                  className="px-3 py-1.5 rounded-lg bg-[--color-surface-base] hover:bg-[--color-surface-overlay] text-[--color-text-primary] border border-[--color-border-mid] text-xs font-semibold self-start md:self-center flex-shrink-0 shadow-xs"
                >
                  Acknowledge
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </RoleGuard>
  )
}
