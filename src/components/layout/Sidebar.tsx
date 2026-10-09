import React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  MapPin,
  Radio,
  History,
  ShieldAlert,
  Users,
  Bus as BusIcon,
  Route as RouteIcon,
  GitPullRequest,
  Bell,
  GraduationCap,
  HeartHandshake,
  Settings,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'

interface SidebarProps {
  onCloseMobile?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const { verifications, alerts, routeRequests } = useDemoStore()

  const pendingReviewsCount = verifications.filter(
    (v) => v.status === 'flagged' && v.reviewStatus === 'pending'
  ).length

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length
  const pendingRequestsCount = routeRequests.filter((r) => r.status === 'pending').length

  const navSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        {
          name: 'Dashboard',
          to: '/',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          name: 'Fleet Tracking',
          to: '/fleet',
          icon: MapPin,
          badge: 'Live Map',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          name: 'Attendance Simulator',
          to: '/simulator',
          icon: Radio,
          badge: 'Demo RFID',
          badgeColor: 'bg-emerald-500 text-slate-950 font-bold',
        },
        {
          name: 'Attendance History',
          to: '/attendance',
          icon: History,
          badge: null,
        },
        {
          name: 'Verification Reviews',
          to: '/reviews',
          icon: ShieldAlert,
          badge: pendingReviewsCount > 0 ? `${pendingReviewsCount}` : null,
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold',
        },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        {
          name: 'Students',
          to: '/students',
          icon: Users,
          badge: '50',
          badgeColor: 'bg-slate-800 text-slate-400',
        },
        {
          name: 'Buses',
          to: '/buses',
          icon: BusIcon,
          badge: '4 Active',
          badgeColor: 'bg-slate-800 text-slate-400',
        },
        {
          name: 'Routes & Stops',
          to: '/routes',
          icon: RouteIcon,
          badge: '3 Routes',
          badgeColor: 'bg-slate-800 text-slate-400',
        },
        {
          name: 'Route Requests',
          to: '/route-requests',
          icon: GitPullRequest,
          badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : null,
          badgeColor: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
        },
        {
          name: 'Alerts',
          to: '/alerts',
          icon: Bell,
          badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : null,
          badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
        },
      ],
    },
    {
      title: 'PORTALS',
      items: [
        {
          name: 'Student Portal',
          to: '/student-portal',
          icon: GraduationCap,
          badge: null,
        },
        {
          name: 'Guardian Portal',
          to: '/guardian-portal',
          icon: HeartHandshake,
          badge: null,
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          name: 'Settings & Status',
          to: '/settings',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ]

  return (
    <aside className="w-64 h-full bg-[--color-sidebar] border-r border-[--color-border-subtle] flex flex-col flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[--color-border-subtle] bg-[--color-surface-base]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[--color-accent-500] flex items-center justify-center shadow-sm">
            <div className="h-[36px] w-[36px] bg-[--color-surface-base] rounded-[8px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[--color-accent-500]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-[--color-text-primary]">
                Raksha<span className="text-[--color-accent-500]">Track</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-[--color-accent-500]/10 text-[--color-accent-500] border border-[--color-accent-500]/20 rounded font-semibold uppercase tracking-wide">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-[--color-text-muted] font-medium truncate">
              SGT University Transport
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-[--color-text-muted] uppercase">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = currentPath === item.to
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors border-l-[3px] ${
                    isActive
                      ? 'bg-[--color-surface-overlay] text-[--color-accent-500] font-semibold border-[--color-accent-500] pl-[calc(theme(spacing.3)-3px)]'
                      : 'text-[--color-text-secondary] border-transparent [@media(hover:hover)]:hover:text-[--color-text-primary] [@media(hover:hover)]:hover:bg-[--color-surface-raised]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-[--color-accent-500]' : 'text-[--color-text-muted] group-hover:text-[--color-text-secondary]'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        item.badgeColor || 'bg-[--color-surface-overlay] text-[--color-text-muted]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Bottom Status Card */}
      <div className="p-3 border-t border-[--color-border-subtle] bg-[--color-surface-base]">
        <div className="bg-[--color-surface-overlay] rounded-lg p-2.5 border border-[--color-border-mid] text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[--color-text-muted]">Policy:</span>
            <span className="text-[--color-accent-500] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[--color-accent-500]" /> Flag, Not Block
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[--color-text-muted]">Simulation:</span>
            <span className="text-[--color-text-secondary] font-mono">In-Memory Engine</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[--color-text-muted]">Campus:</span>
            <span className="text-[--color-text-secondary]">SGT Budhera (HR)</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
