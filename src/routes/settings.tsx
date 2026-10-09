import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
  Settings,
  Database,
  Key,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Sliders,
  Check,
  Sparkles,
  ArrowRight,
  Radio,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import { DEFAULT_PROXIMITY_THRESHOLD_METERS } from '@/lib/simulation/gps-verification'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const {
    students,
    buses,
    routes,
    tapEvents,
    verifications,
    simulationSpeed,
    setSimulationSpeed,
    resetToDefault,
  } = useDemoStore()

  const [threshold, setThreshold] = useState(DEFAULT_PROXIMITY_THRESHOLD_METERS)
  const [savedMsg, setSavedMsg] = useState(false)

  const handleSaveThreshold = () => {
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2000)
  }

  // Presentation Checklist
  const presentationSteps = [
    { num: 1, title: 'Open Dashboard', desc: 'Stats cards and interactive fleet telemetry map visible.', to: '/' },
    { num: 2, title: 'Inspect Fleet Map', desc: '4 buses positioned along Delhi, Gurugram, and Faridabad corridors.', to: '/fleet' },
    { num: 3, title: 'Start Bus Simulation', desc: 'Click Start Bus Sim to animate vehicle movement along route waypoints.', to: '/' },
    { num: 4, title: 'Open Attendance Simulator', desc: 'Select Priya Sharma, BUS-101, Boarding, Scenario A.', to: '/simulator' },
    { num: 5, title: 'Click SIMULATE CARD TAP', desc: 'Observe RFID reading animation and immediate VERIFIED outcome (~38m).', to: '/simulator' },
    { num: 6, title: 'Simulate Scenario B (Mismatch)', desc: 'Select Rahul Gupta, Scenario B (Far from Bus). Tapped card is FLAGGED.', to: '/simulator' },
    { num: 7, title: 'Verify Flag-Not-Block Policy', desc: 'Notice the card tap is recorded anyway! Attendance is not locked out.', to: '/attendance' },
    { num: 8, title: 'Open Verification Review Center', desc: 'Inspect spatial evidence, Haversine distance (~1.1km), mark reviewed.', to: '/reviews' },
    { num: 9, title: 'Check Updated Occupancy', desc: 'Dashboard stats and bus capacity counters reflect boarding increments.', to: '/' },
    { num: 10, title: 'Open Student Portal', desc: 'Inspect Priya Sharma\'s live bus location, seat availability, and pass status.', to: '/student-portal' },
    { num: 11, title: 'Open Guardian Portal', desc: 'Review real-time in-app boarding alerts sent to Rajesh Sharma.', to: '/guardian-portal' },
    { num: 12, title: 'Submit Route Change Request', desc: 'Submit petition to change corridor; approve as administrator.', to: '/route-requests' },
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
              System Configuration
            </span>
            <span className="text-xs text-slate-400 font-mono">Platform Telemetry Settings</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Settings & Presentation Demonstration Guide</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Platform runtime parameters, integration diagnostics, and step-by-step university demonstration itinerary.
          </p>
        </div>

        <div>
          <button
            onClick={() => {
              if (confirm('Reset all demo data back to clean SGT defaults?')) resetToDefault()
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Grid: Config Parameters + Integration Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Telemetry Parameters (6 cols) */}
        <div className="lg:col-span-6 bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Transport Algorithm Parameters</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* Proximity Threshold */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-semibold text-slate-200">
                  GPS Verification Proximity Threshold
                </label>
                <span className="font-mono text-emerald-400 font-bold">{threshold} meters</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Taps where the student phone is within this distance are classified as <b className="text-emerald-400">VERIFIED</b>. Distances beyond this trigger a <b className="text-amber-400">FLAGGED</b> outcome.
              </p>
            </div>

            {/* Simulation Speed */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1.5">
                Vehicle Movement Simulation Speed
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSimulationSpeed(spd)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      simulationSpeed === spd
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd}x Multiplier
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleSaveThreshold}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
              >
                Apply Parameters
              </button>
              {savedMsg && (
                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Database & Clerk Credentials Status (6 cols) */}
        <div className="lg:col-span-6 bg-[#101726] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Database className="w-4 h-4 text-sky-400" />
            <span>Persistence & Auth Runtime Health</span>
          </h3>

          <div className="space-y-3 text-xs">
            {/* Simulation Store */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Interactive In-Memory Engine (Active)</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {students.length} Students • {buses.length} Fleet Vehicles • {tapEvents.length} Tap Records
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded">
                OPERATIONAL
              </span>
            </div>

            {/* Neon PostgreSQL Status */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-sky-400" />
                  <span>Neon Serverless PostgreSQL</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Configurable via DATABASE_URL in .env. Drizzle schema pre-built.
                </div>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono font-bold px-2 py-0.5 rounded">
                DEMO READY
              </span>
            </div>

            {/* Clerk Authentication Status */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span>Clerk Multi-Role Authentication</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Active in Role Switcher mode (Admin, Student, Guardian).
                </div>
              </div>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono font-bold px-2 py-0.5 rounded">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* University Presentation Itinerary Checklist */}
      <div className="bg-[#101726] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Presentation Script</span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Recommended Live Demonstration Journey</span>
            </h3>
          </div>
          <Link
            to="/simulator"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
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
              className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/40 text-xs transition-all group"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-[10px]">
                  {step.num}
                </span>
                <span className="font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  {step.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pl-7">{step.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
