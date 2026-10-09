import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Bus as BusIcon,
  User,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  MapPin,
  RefreshCw,
  Clock,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import type { EventType, VerificationEvidence, TapEvent } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'

export const Route = createFileRoute('/simulator')({
  component: AttendanceSimulatorPage,
})

function AttendanceSimulatorPage() {
  const {
    students,
    buses,
    routes,
    tapEvents,
    verifications,
    simulateCardTap,
  } = useDemoStore()

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'student-1')
  const [selectedBusId, setSelectedBusId] = useState<string>(buses[0]?.id || 'bus-101')
  const [eventType, setEventType] = useState<EventType>('boarding')
  const [scenario, setScenario] = useState<'A' | 'B' | 'C'>('A')
  const [customStop, setCustomStop] = useState<string>('')

  // Processing animation states
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState<string>('')
  const [lastResult, setLastResult] = useState<{
    tap: TapEvent
    verification: VerificationEvidence
    message: string
  } | null>(null)

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0]
  const selectedBus = buses.find((b) => b.id === selectedBusId) || buses[0]
  const assignedRoute = routes.find((r) => r.id === selectedBus.currentRouteId)

  // Trigger simulated card tap
  const handleSimulateTap = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    setLastResult(null)

    // Step 1: RFID Antenna Reading
    setProcessingStep('1/4: Scanning RFID Antenna & Reading Card UID…')
    await new Promise((r) => setTimeout(r, 450))

    // Step 2: University Registry Validation
    setProcessingStep('2/4: Validating Transport Enrollment & Pass Eligibility…')
    await new Promise((r) => setTimeout(r, 500))

    // Step 3: Mobile GPS Cross-Verification
    setProcessingStep('3/4: Querying Companion Mobile GPS & Calculating Distance…')
    await new Promise((r) => setTimeout(r, 550))

    // Step 4: Ledger Recording & Occupancy Update
    setProcessingStep('4/4: Committing Event to Transit Audit Ledger…')
    await new Promise((r) => setTimeout(r, 400))

    try {
      const outcome = simulateCardTap({
        studentId: selectedStudent.id,
        busId: selectedBus.id,
        type: eventType,
        scenario,
        customStopName: customStop || undefined,
      })

      setLastResult({
        tap: outcome.tapEvent,
        verification: outcome.verification,
        message: outcome.message,
      })
    } catch (err: any) {
      alert(`Simulation Error: ${err.message}`)
    } finally {
      setIsProcessing(false)
      setProcessingStep('')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-[--color-surface-raised] p-5 rounded-[--radius-lg] border border-[--color-border-subtle]" style={{ boxShadow: 'var(--shadow-sm)', borderLeft: '3px solid var(--color-accent-500)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
                Hardware-Free Simulation Console
              </span>
              <span className="text-xs text-slate-400 font-mono">ISO 14443-A Emulation</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Software-Only RFID Attendance Simulator</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-3xl mt-1">
              This interactive console replicates vehicle-mounted contactless RFID card readers and automated student phone GPS telemetry.
              All business logic, transitions, and verification policies run through the live production engine.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Reader Online: BUS-MOUNTED-V3
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Simulator Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[--color-surface-raised] p-5 rounded-[--radius-lg] border border-[--color-border-subtle] space-y-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>1. Configure Simulated Tap Scenario</span>
            </h3>

            {/* Student Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Student & RFID Card
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id} className="bg-slate-900 text-white">
                    {student.name} ({student.regNumber}) — Card: {student.cardUid} [{student.currentBoardingState.toUpperCase()}]
                  </option>
                ))}
              </select>

              {/* Student Details Card */}
              {selectedStudent && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Department</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {selectedStudent.department.split(' ')[0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">RFID UID</span>
                    <span className="font-mono text-emerald-400 font-bold block">
                      {selectedStudent.cardUid}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Boarding State</span>
                    <span
                      className={`font-semibold block ${
                        selectedStudent.currentBoardingState === 'boarded'
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {selectedStudent.currentBoardingState === 'boarded'
                        ? '● Onboard Vehicle'
                        : '○ Alighted / Off'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Assigned Bus</span>
                    <span className="font-semibold text-slate-200 block">
                      {buses.find((b) => b.id === selectedStudent.assignedBusId)?.busNumber || 'BUS-101'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bus Selector & Event Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bus Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Vehicle & RFID Reader
                </label>
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
                >
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id} className="bg-slate-900 text-white">
                      {bus.busNumber} ({bus.plateNumber}) — {bus.currentOccupancy}/{bus.capacity} seats
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Route: {assignedRoute?.name} ({selectedBus.speed} km/h)
                </span>
              </div>

              {/* Event Type: Boarding or Alighting */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Transit Event Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEventType('boarding')}
                    className={`py-2 px-3 rounded-[--radius-md] border text-xs font-bold transition-colors duration-150 ${
                      eventType === 'boarding'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ↑ BOARDING (IN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventType('alighting')}
                    className={`py-2 px-3 rounded-[--radius-md] border text-xs font-bold transition-colors duration-150 ${
                      eventType === 'alighting'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-md shadow-sky-950'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ↓ ALIGHTING (OUT)
                  </button>
                </div>
              </div>
            </div>

            {/* GPS Verification Scenario Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                GPS Cross-Verification Test Scenario
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Scenario A */}
                <button
                  type="button"
                  onClick={() => setScenario('A')}
                  className={`p-3 rounded-[--radius-md] border text-left transition-colors duration-150 ${
                    scenario === 'A'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Scenario A</span>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-300 mt-0.5">
                    Student Near Bus
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Phone GPS ~38m from bus. Result: <b className="text-emerald-400">VERIFIED</b>
                  </div>
                </button>

                {/* Scenario B */}
                <button
                  type="button"
                  onClick={() => setScenario('B')}
                  className={`p-3 rounded-[--radius-md] border text-left transition-colors duration-150 ${
                    scenario === 'B'
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Scenario B</span>
                  </div>
                  <div className="text-[11px] font-semibold text-amber-300 mt-0.5">
                    Student Far from Bus
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Phone GPS ~1.1km away. Result: <b className="text-amber-400">FLAGGED</b>
                  </div>
                </button>

                {/* Scenario C */}
                <button
                  type="button"
                  onClick={() => setScenario('C')}
                  className={`p-3 rounded-[--radius-md] border text-left transition-colors duration-150 ${
                    scenario === 'C'
                      ? 'bg-purple-950/40 border-purple-500 text-purple-300 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Scenario C</span>
                  </div>
                  <div className="text-[11px] font-semibold text-purple-300 mt-0.5">
                    GPS Unavailable
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Phone offline / stale. Result: <b className="text-purple-400">UNVERIFIED</b>
                  </div>
                </button>
              </div>

              {/* Scenario Explanation alert */}
              <div className="mt-2.5 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300">Policy Reminder:</span> Regardless of whether
                  GPS returns <span className="text-emerald-400 font-bold">VERIFIED</span>,{' '}
                  <span className="text-amber-400 font-bold">FLAGGED</span>, or{' '}
                  <span className="text-purple-400 font-bold">UNVERIFIED</span>, the attendance event is{' '}
                  <span className="text-white font-semibold">always registered</span>. The student is not locked out;
                  flags are routed to the administrative audit queue.
                </div>
              </div>
            </div>

            {/* Giant SIMULATE CARD TAP Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSimulateTap}
                disabled={isProcessing}
                className={`w-full py-4 px-6 rounded-[--radius-lg] font-black text-sm md:text-base tracking-wider uppercase transition-[background-color,transform,box-shadow,border-color,opacity] duration-150 flex items-center justify-center gap-3 active:scale-[0.98] ${
                  isProcessing
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-[--color-border-subtle]'
                    : 'bg-[--color-accent-500] hover:bg-[--color-accent-400] text-slate-950 cursor-pointer'
                }`}
                style={{ boxShadow: isProcessing ? 'none' : 'var(--shadow-sm)' }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                    <span>Processing RFID Radio Frequency Event…</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
                    <span>SIMULATE CARD TAP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated RFID Hardware Device Faceplate (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Hardware Reader Unit Simulation */}
          <div className="bg-[--color-surface-overlay] p-6 rounded-[--radius-lg] border border-[--color-border-subtle] relative overflow-hidden scanline-effect" style={{ boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.05), var(--shadow-md)' }}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                  RakshaTrack RFID Reader Panel
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                13.56 MHz NFC
              </span>
            </div>

            {/* Card Tap Target Visual */}
            <div className="my-4 flex flex-col items-center justify-center py-6 px-4 bg-[#070b14] rounded-2xl border-2 border-dashed border-slate-700/80 relative">
              {/* Antenna Glow Ring */}
              <div
                className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                  isProcessing
                    ? 'border-emerald-400 bg-emerald-500/15 animate-ping'
                    : 'border-slate-700 bg-slate-900/40'
                }`}
              >
                <div className="w-20 h-20 rounded-full border border-emerald-500/40 flex items-center justify-center">
                  <Radio
                    className={`w-8 h-8 ${
                      isProcessing ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
                    }`}
                  />
                </div>
              </div>

              <div className="text-center mt-3">
                <span className="text-xs font-mono font-bold text-slate-300 block">
                  CONTACTLESS SENSOR FIELD
                </span>
                <span className="text-[10px] text-slate-400">
                  {isProcessing ? processingStep : 'Awaiting software tap trigger'}
                </span>
              </div>
            </div>

            {/* Reader Diagnostics Box */}
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 font-mono text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle Target:</span>
                <span className="text-slate-200">{selectedBus.busNumber} ({selectedBus.plateNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reader Telemetry:</span>
                <span className="text-emerald-400">Lat {selectedBus.currentLat}, Lng {selectedBus.currentLng}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Occupancy:</span>
                <span className="text-slate-200 font-bold">{selectedBus.currentOccupancy} / {selectedBus.capacity} seats</span>
              </div>
            </div>

            {/* Live Tap Result Banner */}
            {lastResult && (
              <div
                className={`mt-4 p-4 rounded-xl border text-xs space-y-2 animate-in fade-in slide-in-from-bottom-2 ${
                  lastResult.verification.status === 'verified'
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                    : lastResult.verification.status === 'flagged'
                    ? 'bg-amber-950/50 border-amber-500/50 text-amber-200'
                    : 'bg-purple-950/50 border-purple-500/50 text-purple-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    {lastResult.verification.status === 'verified' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="uppercase">
                      RESULT: {lastResult.verification.status}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40">
                    ID: {lastResult.tap.id}
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed opacity-90">
                  {lastResult.verification.explanation}
                </p>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <span>Distance: {lastResult.verification.distanceMeters >= 0 ? `${lastResult.verification.distanceMeters}m` : 'N/A'}</span>
                  <span>Occupancy Updated: {selectedBus.currentOccupancy}/{selectedBus.capacity}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Tap Events Table */}
      <div className="bg-[--color-surface-raised] p-5 rounded-[--radius-lg] border border-[--color-border-subtle] space-y-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase">
              Recent Simulated Tap Log
            </h3>
          </div>
          <Link
            to="/attendance"
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
          >
            <span>Full Attendance Audit Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-300 font-mono text-[11px]">
                <th className="py-2.5 px-3">TAP ID</th>
                <th className="py-2.5 px-3">STUDENT</th>
                <th className="py-2.5 px-3">RFID CARD</th>
                <th className="py-2.5 px-3">BUS & ROUTE</th>
                <th className="py-2.5 px-3">EVENT</th>
                <th className="py-2.5 px-3">VERIFICATION</th>
                <th className="py-2.5 px-3 text-right">TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {tapEvents.slice(0, 8).map((tap) => {
                const student = students.find((s) => s.id === tap.studentId)
                const bus = buses.find((b) => b.id === tap.busId)
                const verif = verifications.find((v) => v.tapEventId === tap.id)

                return (
                  <tr key={tap.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400 font-medium">{tap.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-200">{student?.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{student?.regNumber}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">{tap.cardUid}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-300">{bus?.busNumber}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{tap.stopName}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tap.type === 'boarding'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {tap.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tap.verificationStatus === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : tap.verificationStatus === 'flagged'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}
                      >
                        {tap.verificationStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400 text-[11px]">
                      {formatRelativeTime(tap.timestamp)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
