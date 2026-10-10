import React from 'react'
import { Play, Pause, RotateCcw, Zap, Shield, User, Bell } from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import type { UserRole } from '@/lib/types'

export const DemoModeBanner: React.FC = () => {
  const {
    isSimulationRunning,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
    resetToDefault,
    currentRole,
    setRole,
    alerts,
    verifications,
  } = useDemoStore()

  const pendingReviews = verifications.filter((v) => v.status === 'flagged' && v.reviewStatus === 'pending').length
  const unreadAlerts = alerts.filter((a) => !a.isRead).length

  return (
    <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-b border-emerald-500/20 px-4 py-2 text-xs text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Indicator */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="flex items-center gap-1.5 font-semibold tracking-wide text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            <span>DEMO SIMULATION MODE</span>
          </div>
        </div>

        {/* Right: Simulation Controls */}
        <div className="flex items-center gap-2">
          {/* Simulation Toggle */}
          <button
            onClick={() => toggleSimulation()}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              isSimulationRunning
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
            title="Start or Pause Fleet Movement Simulation"
          >
            {isSimulationRunning ? (
              <>
                <Pause className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Sim Running</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Start Bus Sim</span>
              </>
            )}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-800/90 rounded border border-slate-700 p-0.5">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  simulationSpeed === speed
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-1 bg-slate-800/90 rounded border border-slate-700 px-2 py-0.5">
            <User className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] text-slate-400">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-slate-900 text-emerald-300 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="admin" className="bg-slate-900 text-white">Administrator</option>
              <option value="student" className="bg-slate-900 text-white">Student (Priya S.)</option>
              <option value="guardian" className="bg-slate-900 text-white">Guardian (Rajesh S.)</option>
            </select>
          </div>

          {/* Reset button */}
          <button
            onClick={() => {
              if (confirm('Reset simulation data back to initial SGT University defaults?')) {
                resetToDefault()
              }
            }}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Reset All Simulation Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
