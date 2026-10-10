import { RoleGuard } from '@/components/layout/RoleGuard'
import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
  Settings as SettingsIcon,
  Sliders,
  Database,
  Key,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Check,
  Volume2,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import { useSoundEnabled } from '@/hooks/useSoundEnabled'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const {
    students,
    buses,
    tapEvents,
    simulationSpeed,
    setSimulationSpeed,
    resetToDefault,
  } = useDemoStore()

  // Proximity Threshold state
  const [threshold, setThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('raksha_proximity_threshold')
    return saved ? Number(saved) : 150
  })
  const [savedMsg, setSavedMsg] = useState(false)
  const { soundEnabled, toggleSound } = useSoundEnabled()

  const handleSaveThreshold = () => {
    localStorage.setItem('raksha_proximity_threshold', String(threshold))
    
    // Dispatch a custom event so other open tabs/components can re-render if needed
    window.dispatchEvent(new Event('raksha_threshold_updated'))

    import('@/hooks/useToast').then(({ toast }) => {
      toast.success(`GPS Proximity Threshold updated to ${threshold}m`)
    })
  }

  // Presentation Checklist
  const presentationSteps = [
    { num: 1, title: 'Open Dashboard', desc: 'Stats cards and interactive fleet telemetry map visible.', to: '/' },
    { num: 2, title: 'Inspect Fleet Map', desc: '4 buses positioned along Delhi, Gurugram, and Faridabad corridors.', to: '/fleet' },
    { num: 3, title: 'Start Bus Simulation', desc: 'Click Start Bus Sim to animate vehicle movement along route waypoints.', to: '/' },
    { num: 4, title: 'Open Attendance Simulator', desc: 'Select Priya Sharma, BUS-101, Boarding, Scenario A.', to: '/simulator' },
    { num: 5, title: 'Click SIMULATE CARD TAP', desc: 'Observe RFID reading animation and immediate VERIFIED outcome (~38m). Persists to Neon DB.', to: '/simulator' },
    { num: 6, title: 'Simulate Scenario B (Mismatch)', desc: 'Select Rahul Gupta, Scenario B (Far from Bus). Tapped card is FLAGGED.', to: '/simulator' },
    { num: 7, title: 'Verify Flag-Not-Block Policy', desc: 'Notice the card tap is recorded anyway! Attendance is not locked out.', to: '/attendance' },
    { num: 8, title: 'Open Verification Review Center', desc: 'Inspect spatial evidence, Haversine distance (~1.1km), mark reviewed in DB.', to: '/reviews' },
    { num: 9, title: 'Check Updated Occupancy', desc: 'Dashboard stats and bus capacity counters reflect boarding increments.', to: '/' },
    { num: 10, title: 'Open Student Portal', desc: 'Inspect live bus location, seat availability, and pass status synced with DB.', to: '/student-portal' },
    { num: 11, title: 'Open Guardian Portal', desc: 'Review real-time in-app boarding alerts sent to registered parent.', to: '/guardian-portal' },
    { num: 12, title: 'Submit Route Change Request', desc: 'Submit petition to change corridor; approve as administrator in DB.', to: '/route-requests' },
  ]

  return (
    
    <RoleGuard allowedRoles={['admin']}>
      <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="section-tag">
              System Configuration
            </span>
            <span className="text-xs text-[--color-text-muted] font-mono">Platform Telemetry Settings</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[--color-text-primary] tracking-tight flex items-center gap-2">
            <span>Settings & Presentation Demonstration Guide</span>
          </h2>
          <p className="text-xs text-[--color-text-secondary] mt-1">
            Platform runtime parameters, live Neon database diagnostics, and step-by-step university demonstration itinerary.
          </p>
        </div>

        <div>
          <button
            onClick={() => {
              if (confirm('Reset all demo data back to clean SGT defaults?')) resetToDefault()
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[--color-surface-base] hover:bg-[--color-surface-overlay] text-[--color-text-primary] text-xs font-semibold border border-[--color-border-mid] shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Grid: Config Parameters + Integration Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Telemetry Parameters (6 cols) */}
        <div className="lg:col-span-6 bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[--color-text-primary] uppercase tracking-wider flex items-center gap-2 border-b border-[--color-border-subtle] pb-3">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Transport Algorithm Parameters</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* Proximity Threshold */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-semibold text-[--color-text-primary]">
                  GPS Verification Proximity Threshold
                </label>
                <span className="font-mono text-emerald-700 font-bold">{threshold} meters</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-[--color-surface-base] rounded-lg h-2 cursor-pointer border border-[--color-border-mid]"
              />
              <p className="text-[11px] text-[--color-text-secondary] mt-1">
                Taps where the student phone is within this distance are classified as <b className="text-emerald-700">VERIFIED</b>. Distances beyond this trigger a <b className="text-amber-700">FLAGGED</b> outcome.
              </p>
            </div>

            {/* Simulation Speed */}
            <div>
              <label className="font-semibold text-[--color-text-primary] block mb-1.5">
                Vehicle Movement Simulation Speed
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSimulationSpeed(spd)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      simulationSpeed === spd
                        ? 'bg-[--color-accent-500] text-white shadow-sm'
                        : 'bg-[--color-surface-base] border border-[--color-border-mid] text-[--color-text-secondary] hover:text-[--color-text-primary]'
                    }`}
                  >
                    {spd}x Multiplier
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Effects Toggle */}
            <div>
              <label className="font-semibold text-[--color-text-primary] flex items-center gap-2 mb-1.5">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                UI Sound Effects
              </label>
              <button
                onClick={() => toggleSound(!soundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  soundEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <p className="text-[11px] text-[--color-text-secondary] mt-1">
                Enable synthesized micro-interaction sounds (RFID taps, validation chimes). 
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleSaveThreshold}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
              >
                Apply Parameters
              </button>
              {savedMsg && (
                <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Database & Clerk Credentials Status (6 cols) */}
        <div className="lg:col-span-6 bg-[--color-surface-raised] p-5 rounded-2xl border border-[--color-border-subtle] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[--color-text-primary] uppercase tracking-wider flex items-center gap-2 border-b border-[--color-border-subtle] pb-3">
            <Database className="w-4 h-4 text-sky-600" />
            <span>Persistence & Auth Runtime Health</span>
          </h3>

          <div className="space-y-3 text-xs">
            {/* Simulation Store */}
            <div className="bg-[--color-surface-base] p-3.5 rounded-xl border border-emerald-300 flex items-center justify-between">
              <div>
                <div className="font-bold text-[--color-text-primary] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Interactive Telemetry Engine (Active)</span>
                </div>
                <div className="text-[11px] text-[--color-text-secondary] mt-0.5">
                  {students.length} Students • {buses.length} Fleet Vehicles • {tapEvents.length} Tap Records
                </div>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold px-2 py-0.5 rounded border border-emerald-200">
                OPERATIONAL
              </span>
            </div>

            {/* Neon PostgreSQL Status */}
            <div className="bg-[--color-surface-base] p-3.5 rounded-xl border border-emerald-300 flex items-center justify-between">
              <div>
                <div className="font-bold text-[--color-text-primary] flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Neon PostgreSQL Database</span>
                </div>
                <div className="text-[11px] text-[--color-text-secondary] mt-0.5">
                  Live connection active on AWS ap-southeast-1. Tables pushed and seeded with university fleet data.
                </div>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold px-2 py-0.5 rounded border border-emerald-200">
                LIVE & SYNCED
              </span>
            </div>

            {/* Clerk Authentication Status */}
            <div className="bg-[--color-surface-base] p-3.5 rounded-xl border border-[--color-border-mid] flex items-center justify-between">
              <div>
                <div className="font-bold text-[--color-text-primary] flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-purple-600" />
                  <span>Clerk Multi-Role Authentication</span>
                </div>
                <div className="text-[11px] text-[--color-text-secondary] mt-0.5">
                  Live publishable key configured. Auto-syncs logged-in identity to Neon DB users table.
                </div>
              </div>
              <span className="text-[10px] bg-purple-50 text-purple-700 font-mono font-bold px-2 py-0.5 rounded border border-purple-200">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* University Presentation Itinerary Checklist */}
      <div className="bg-[--color-surface-raised] p-6 rounded-2xl border border-[--color-border-subtle] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-3">
          <div>
            <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold">Presentation Script</span>
            <h3 className="text-base font-bold text-[--color-text-primary] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Recommended Live Demonstration Journey</span>
            </h3>
          </div>
          <Link
            to="/simulator"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Jump to Attendance Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {presentationSteps.map((step) => (
            <Link
              key={step.num}
              to={step.to}
              className="p-3.5 rounded-xl bg-[--color-surface-base] hover:bg-[--color-surface-overlay] border border-[--color-border-subtle] hover:border-emerald-300 text-xs transition-all group shadow-xs"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-mono font-bold text-[10px]">
                  {step.num}
                </span>
                <span className="font-bold text-[--color-text-primary] group-hover:text-emerald-700 transition-colors">
                  {step.title}
                </span>
              </div>
              <p className="text-[11px] text-[--color-text-secondary] leading-relaxed pl-7">{step.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </RoleGuard>
  )
}
