import React, { useState, useEffect } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/tanstack-react-start'
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
  UserCheck,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import { getRoleFromUser, syncUserOnSignIn } from '@/lib/auth'

interface TopBarProps {
  onToggleMobileMenu: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu }) => {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname
  const { isSimulationRunning, alerts, currentRole, setRole } = useDemoStore()
  const { user, isLoaded, isSignedIn } = useUser()
  const [timeStr, setTimeStr] = useState<string>('')

  // Sync Clerk authenticated user with Neon DB and role state
  useEffect(() => {
    if (isSignedIn && user) {
      const activeRole = getRoleFromUser(user)
      setRole(activeRole)
      syncUserOnSignIn(user)
    }
  }, [isSignedIn, user?.id])

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
    <header
      className="h-14 px-4 flex items-center justify-between gap-4 flex-shrink-0 border-b"
      style={{
        background: 'linear-gradient(to right, oklch(1 0 0 / 0.55), oklch(1 0 0 / 0.45))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'var(--color-border-subtle)',
        boxShadow: '0 1px 0 oklch(1 0 0 / 0.60)',
      }}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl transition-all"
          style={{ color: 'var(--color-text-muted)', boxShadow: 'var(--nm-raised)', background: 'var(--color-surface-raised)', border: '1px solid oklch(1 0 0 / 0.70)' }}
        >
          <Menu className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span>{getPageTitle(pathname)}</span>
            <span
              className="hidden md:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-mono"
              style={{
                background: 'oklch(0.63 0.188 155 / 0.12)',
                color: 'var(--color-accent-600)',
                border: '1px solid oklch(0.63 0.188 155 / 0.22)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: 'var(--color-accent-500)' }}></span>
              LIVE
            </span>
          </h1>
        </div>
      </div>

      {/* Right: Live stats & Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Live Clock */}
        <div
          className="hidden sm:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-xl"
          style={{
            boxShadow: 'var(--nm-inset)',
            background: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-accent-500)' }} />
          <span>{timeStr || '—'}</span>
        </div>

        {/* Bus Telemetry Status */}
        <div
          className="hidden md:flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-xl"
          style={{
            boxShadow: 'var(--nm-inset)',
            background: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <Activity
            className={`w-3.5 h-3.5 ${isSimulationRunning ? 'animate-spin' : ''}`}
            style={{ color: isSimulationRunning ? 'var(--color-accent-500)' : 'var(--color-text-muted)' }}
          />
          <span>{isSimulationRunning ? 'Telemetry Active' : 'Sim Paused'}</span>
        </div>

        {/* Quick Simulator CTA */}
        <Link
          to="/simulator"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.97]"
          style={{
            background: 'var(--color-accent-500)',
            color: 'white',
            boxShadow: '3px 3px 8px oklch(0.63 0.188 155 / 0.30), -1px -1px 4px oklch(1 0 0 / 0.50)',
            border: '1px solid oklch(0.63 0.188 155 / 0.35)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-accent-600)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-accent-500)' }}
        >
          <Radio className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Simulate Tap</span>
          <span className="sm:hidden">Tap</span>
        </Link>

        {/* Alerts Bell */}
        <Link
          to="/alerts"
          className="relative p-2 rounded-xl transition-all"
          style={{ color: 'var(--color-text-muted)', boxShadow: 'var(--nm-raised)', background: 'var(--color-surface-raised)', border: '1px solid oklch(1 0 0 / 0.70)' }}
          title="System Alerts"
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--nm-raised-lg)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--nm-raised)' }}
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ background: 'var(--color-danger)' }}
            >
              {unreadAlerts}
            </span>
          )}
        </Link>

        {/* Auth Controls */}
        <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all"
                style={{ color: 'var(--color-text-primary)', boxShadow: 'var(--nm-raised)', background: 'var(--color-surface-raised)', border: '1px solid oklch(1 0 0 / 0.70)' }}
              >
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                className="px-3 py-1.5 text-xs font-bold rounded-xl text-white transition-all"
                style={{ background: 'var(--color-accent-500)', boxShadow: '3px 3px 8px oklch(0.63 0.188 155 / 0.25)' }}
              >
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
                style={
                  currentRole === 'admin'
                    ? { background: 'oklch(0.72 0.18 55 / 0.12)', color: 'oklch(0.52 0.18 55)', border: '1px solid oklch(0.72 0.18 55 / 0.25)' }
                    : currentRole === 'guardian'
                    ? { background: 'oklch(0.65 0.17 290 / 0.12)', color: 'oklch(0.45 0.17 290)', border: '1px solid oklch(0.65 0.17 290 / 0.25)' }
                    : { background: 'oklch(0.63 0.188 155 / 0.10)', color: 'oklch(0.43 0.188 155)', border: '1px solid oklch(0.63 0.188 155 / 0.22)' }
                }
                title={`Logged in role: ${currentRole}`}
              >
                {currentRole}
              </span>
              <UserButton />
            </div>
          </Show>
        </div>
      </div>
    </header>
  )
}

