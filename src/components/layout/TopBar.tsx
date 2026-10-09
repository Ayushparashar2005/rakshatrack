import React, { useState, useEffect } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/tanstack-react-start'
import {
  Menu,
  Bell,
  Radio,
  Clock,
  Sparkles,
  ExternalLink,
  Shield,
  Activity,
  CheckCircle,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'

interface TopBarProps {
  onToggleMobileMenu: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu }) => {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname
  const { isSimulationRunning, alerts, currentRole } = useDemoStore()
  const [timeStr, setTimeStr] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Get Page Title
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Transport Operations Command Center'
      case '/fleet':
        return 'Interactive Fleet Tracking & Telemetry'
      case '/simulator':
        return 'RFID Card Tap & GPS Simulator'
      case '/attendance':
        return 'Real-Time Attendance Audit Ledger'
      case '/reviews':
        return 'Administrative Verification Review Center'
      case '/students':
        return 'Student Directory & Pass Management'
      case '/buses':
        return 'Fleet Management & Sensor Diagnostics'
      case '/routes':
        return 'Routes, Corridors & Stoppage Management'
      case '/route-requests':
        return 'Student Route-Change Requests'
      case '/alerts':
        return 'System Incident & Safety Alerts'
      case '/student-portal':
        return 'Student Mobile Transport Portal'
      case '/guardian-portal':
        return 'Guardian Safety & Transit Portal'
      case '/settings':
        return 'System Configuration & Persist Engine'
      default:
        return 'RakshaTrack Operations'
    }
  }

  const unreadAlerts = alerts.filter((a) => !a.isRead).length

  return (
    <header className="h-14 bg-[--color-sidebar] border-b border-[--color-border-subtle] px-4 flex items-center justify-between gap-4 flex-shrink-0">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-[--color-text-muted] [@media(hover:hover)]:hover:text-[--color-text-primary] [@media(hover:hover)]:hover:bg-[--color-surface-raised] focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-[--color-text-primary] flex items-center gap-2">
            <span>{getPageTitle(pathname)}</span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] bg-[--color-accent-500]/10 text-[--color-accent-500] border border-[--color-accent-500]/20 px-2 py-0.5 rounded-full font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[--color-accent-500] animate-ping"></span>
              LIVE FEED
            </span>
          </h1>
        </div>
      </div>

      {/* Right: Live stats & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[--color-text-secondary] font-mono bg-[--color-surface-overlay] px-2.5 py-1 rounded border border-[--color-border-mid]">
          <Clock className="w-3.5 h-3.5 text-[--color-accent-500]" />
          <span>{timeStr || '19:45:00'}</span>
        </div>

        {/* Bus Movement Status */}
        <div className="hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border border-[--color-border-mid] bg-[--color-surface-overlay]">
          <Activity
            className={`w-3.5 h-3.5 ${
              isSimulationRunning ? 'text-[--color-accent-500] animate-spin' : 'text-[--color-text-muted]'
            }`}
          />
          <span className="text-[--color-text-secondary] text-[11px]">
            {isSimulationRunning ? 'Bus Telemetry Active' : 'Bus Sim Paused'}
          </span>
        </div>

        {/* Quick Simulator CTA Button */}
        <Link
          to="/simulator"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[--color-accent-500] [@media(hover:hover)]:hover:bg-[--color-accent-400] text-slate-950 rounded-lg text-xs font-bold transition-[background-color,transform] duration-150 active:scale-[0.98]"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <Radio className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Simulate Card Tap</span>
          <span className="sm:hidden">Tap Sim</span>
        </Link>

        {/* Alerts Bell */}
        <Link
          to="/alerts"
          className="relative p-2 rounded-lg text-[--color-text-muted] [@media(hover:hover)]:hover:text-[--color-text-primary] [@media(hover:hover)]:hover:bg-[--color-surface-raised] transition-colors"
          title="System Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[--color-danger] text-[9px] font-bold text-white">
              {unreadAlerts}
            </span>
          )}
        </Link>

        {/* Auth Controls */}
        <div className="flex items-center gap-2 pl-2 border-l border-[--color-border-subtle]">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="px-3 py-1.5 text-xs font-semibold text-[--color-text-primary] hover:text-[--color-accent-500] transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-3 py-1.5 text-xs font-bold bg-[--color-surface-raised] border border-[--color-border-mid] rounded-lg hover:bg-[--color-surface-float] transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  )
}
