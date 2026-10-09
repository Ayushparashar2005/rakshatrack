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
  const { verifications, alerts, routeRequests, currentRole } = useDemoStore()

  const pendingReviewsCount = verifications.filter(
    (v) => v.status === 'flagged' && v.reviewStatus === 'pending'
  ).length

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length
  const pendingRequestsCount = routeRequests.filter((r) => r.status === 'pending').length

  const allNavSections = [
    {
      title: 'CORE PLATFORM',
      roles: ['admin', 'student', 'guardian'],
      items: [
        { name: 'Dashboard',     to: '/',      icon: LayoutDashboard, badge: null, roles: ['admin', 'student', 'guardian'] },
        { name: 'Fleet Tracking',to: '/fleet', icon: MapPin,           badge: 'Live', badgeColor: 'emerald', roles: ['admin'] },
      ],
    },
    {
      title: 'OPERATIONS',
      roles: ['admin', 'student'],
      items: [
        { name: 'Attendance Simulator', to: '/simulator',  icon: Radio,        badge: 'RFID',  badgeColor: 'accent', roles: ['admin'] },
        { name: 'Attendance History',   to: '/attendance', icon: History,       badge: null, roles: ['admin', 'student'] },
        { name: 'Verification Reviews', to: '/reviews',    icon: ShieldAlert,   badge: pendingReviewsCount > 0 ? `${pendingReviewsCount}` : null, badgeColor: 'amber', roles: ['admin'] },
      ],
    },
    {
      title: 'MANAGEMENT',
      roles: ['admin', 'student'],
      items: [
        { name: 'Students',       to: '/students',       icon: Users,          badge: '50',      badgeColor: 'neutral', roles: ['admin'] },
        { name: 'Buses',          to: '/buses',          icon: BusIcon,        badge: '4',       badgeColor: 'neutral', roles: ['admin'] },
        { name: 'Routes & Stops', to: '/routes',         icon: RouteIcon,      badge: '3',       badgeColor: 'neutral', roles: ['admin'] },
        { name: 'Route Requests', to: '/route-requests', icon: GitPullRequest, badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : null, badgeColor: 'sky', roles: ['admin', 'student'] },
        { name: 'Alerts',         to: '/alerts',         icon: Bell,           badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : null, badgeColor: 'rose', roles: ['admin'] },
      ],
    },
    {
      title: 'PORTALS',
      roles: ['admin', 'student', 'guardian'],
      items: [
        { name: 'Student Portal',  to: '/student-portal',  icon: GraduationCap,  badge: null, roles: ['admin', 'student'] },
        { name: 'Guardian Portal', to: '/guardian-portal', icon: HeartHandshake, badge: null, roles: ['admin', 'guardian'] },
      ],
    },
    {
      title: 'SYSTEM',
      roles: ['admin'],
      items: [
        { name: 'Settings & Status', to: '/settings', icon: Settings, badge: null, roles: ['admin'] },
      ],
    },
  ]

  const navSections = allNavSections
    .filter(section => section.roles.includes(currentRole))
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(currentRole))
    }))
    .filter(section => section.items.length > 0)

  const badgeStyles: Record<string, string> = {
    emerald:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
    accent:   'bg-emerald-600 text-white',
    amber:    'bg-amber-100 text-amber-700 border border-amber-200',
    neutral:  'bg-[--color-surface-sunken] text-[--color-text-muted] border border-[--color-border-subtle]',
    sky:      'bg-sky-100 text-sky-700 border border-sky-200',
    rose:     'bg-rose-100 text-rose-700 border border-rose-200',
  }

  return (
    <aside
      className="w-64 h-full flex flex-col flex-shrink-0 select-none border-r"
      style={{
        background: 'var(--color-sidebar)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      {/* Brand Header — glass pill */}
      <div
        className="p-4 border-b"
        style={{
          borderColor: 'var(--color-border-subtle)',
          background: 'linear-gradient(145deg, oklch(1 0 0 / 0.60), oklch(1 0 0 / 0.30))',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Logo mark — neumorphic circle */}
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: 'var(--nm-raised)', background: 'var(--color-surface-raised)', border: '1px solid oklch(1 0 0 / 0.72)' }}
          >
            <ShieldCheck className="w-5 h-5" style={{ color: 'var(--color-accent-500)' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[15px] tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                Raksha<span style={{ color: 'var(--color-accent-500)' }}>Track</span>
              </span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider"
                style={{ background: 'var(--color-accent-500)', color: 'white' }}
              >
                v2
              </span>
            </div>
            <p className="text-[11px] font-medium truncate" style={{ color: 'var(--color-text-muted)' }}>
              SGT University Transport
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <div
              className="px-3 pb-2 text-[10px] font-bold tracking-widest uppercase"
              style={{ color: 'var(--color-text-ghost)' }}
            >
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
                  className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
                  style={isActive ? {
                    background: 'var(--color-surface-raised)',
                    boxShadow: 'var(--nm-inset)',
                    color: 'var(--color-accent-500)',
                    fontWeight: 600,
                  } : {
                    color: 'var(--color-text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'oklch(1 0 0 / 0.55)'
                      ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--nm-flat)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = ''
                      ;(e.currentTarget as HTMLElement).style.boxShadow = ''
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: isActive ? 'var(--color-accent-500)' : 'var(--color-text-muted)' }}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-semibold ${badgeStyles[item.badgeColor || 'neutral']}`}
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

      {/* Bottom status — glass card */}
      <div
        className="p-3 border-t"
        style={{ borderColor: 'var(--color-border-subtle)', background: 'oklch(1 0 0 / 0.35)' }}
      >
        <div
          className="rounded-xl p-3 text-[11px] space-y-2"
          style={{ boxShadow: 'var(--nm-inset)', background: 'var(--color-surface-sunken)', border: '1px solid var(--color-border-subtle)' }}
        >
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--color-text-muted)' }}>Policy:</span>
            <span className="font-semibold flex items-center gap-1" style={{ color: 'var(--color-accent-600)' }}>
              <CheckCircle2 className="w-3 h-3" />
              Flag, Not Block
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--color-text-muted)' }}>Engine:</span>
            <span className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>Haversine GPS</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--color-text-muted)' }}>Campus:</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>Budhera, HR</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
