import { RoleGuard } from '@/components/layout/RoleGuard'
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
import { StepTimeline } from '@/components/simulator/StepTimeline'
import { NfcScanAnimation } from '@/components/simulator/NfcScanAnimation'
import { ResultPanel } from '@/components/simulator/ResultPanel'
import { motion } from 'framer-motion'
import { playRfidTapSound, playVerifiedSound, playFlaggedSound } from '@/lib/sound'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import type { EventType, VerificationEvidence, TapEvent } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import { persistTapEvent, persistVerification } from '@/lib/db/actions'

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
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1)
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
    
    // Sound: RFID tap
    playRfidTapSound()

    // Step 1: RFID Antenna Reading
    setCurrentStepIndex(0)
    await new Promise((r) => setTimeout(r, 450))

    // Step 2: University Registry Validation
    setCurrentStepIndex(1)
    await new Promise((r) => setTimeout(r, 500))

    // Step 3: Mobile GPS Cross-Verification
    setCurrentStepIndex(2)
    await new Promise((r) => setTimeout(r, 550))

    // Step 4: Ledger Recording & Occupancy Update
    setCurrentStepIndex(3)
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

      // Wire live persistence to Neon PostgreSQL Database
      persistTapEvent({
        data: {
          id: outcome.tapEvent.id,
          cardUid: outcome.tapEvent.cardUid,
          studentId: outcome.tapEvent.studentId,
          busId: outcome.tapEvent.busId,
          tripId: outcome.tapEvent.tripId,
          type: outcome.tapEvent.type,
          timestamp: outcome.tapEvent.timestamp,
          simulated: outcome.tapEvent.simulated,
          verificationStatus: outcome.tapEvent.verificationStatus,
          stopName: outcome.tapEvent.stopName,
        },
      }).catch((err) => console.warn('Tap event Neon DB persistence notice:', err))

      if (outcome.verification) {
        persistVerification({
          data: {
            id: outcome.verification.id,
            tapEventId: outcome.verification.tapEventId,
            status: outcome.verification.status,
            distanceMeters: outcome.verification.distanceMeters,
            studentLat: outcome.verification.studentLat,
            studentLng: outcome.verification.studentLng,
            busLat: outcome.verification.busLat,
            busLng: outcome.verification.busLng,
            scenario: outcome.verification.scenario,
            evidenceQuality: outcome.verification.evidenceQuality,
            explanation: outcome.verification.explanation,
            reviewStatus: outcome.verification.reviewStatus,
          },
        }).catch((err) => console.warn('Verification Neon DB persistence notice:', err))
      }
      
      // Sound on result
      if (outcome.tapEvent.verificationStatus === 'verified') {
        playVerifiedSound()
      } else if (outcome.tapEvent.verificationStatus === 'flagged') {
        playFlaggedSound()
      }
      
    } catch (err: any) {
      alert(`Simulation Error: ${err.message}`)
    } finally {
      setCurrentStepIndex(4)
      setTimeout(() => {
        setIsProcessing(false)
        setCurrentStepIndex(-1)
      }, 600)
    }
  }

  return (
    
    <RoleGuard allowedRoles={['admin']}>
      <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="page-header border-l-4 border-l-[--color-accent-500]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="section-tag">
                Hardware-Free Simulation Console
              </span>
              <span className="text-xs text-[--color-text-muted] font-mono">ISO 14443-A Emulation</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[--color-text-primary] tracking-tight flex items-center gap-2.5">
              <span>Software-Only RFID Attendance Simulator</span>
            </h2>
            <p className="text-xs md:text-sm text-[--color-text-secondary] max-w-3xl mt-1">
              This interactive console replicates vehicle-mounted contactless RFID card readers and automated student phone GPS telemetry.
              All business logic, transitions, and verification policies run through the live production engine.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-[--color-surface-base] border border-[--color-border-mid] text-xs text-[--color-text-secondary] rounded-lg flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Reader Online: BUS-MOUNTED-V3
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Simulator Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="nm-card p-6 space-y-6">
            <h3 className="text-sm font-bold text-[--color-text-primary] uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600" />
              <span>1. Configure Simulated Tap Scenario</span>
            </h3>

            {/* Student Selector */}
            <div>
              <label className="block text-xs font-semibold text-[--color-text-secondary] mb-1.5">
                Select Student & RFID Card
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="nm-select w-full px-3.5 py-2.5 text-xs font-medium"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id} className="bg-[--color-surface-raised] text-[--color-text-primary]">
                    {student.name} ({student.regNumber}) — Card: {student.cardUid} [{student.currentBoardingState.toUpperCase()}]
                  </option>
                ))}
              </select>

              {/* Student Details Card */}
              {selectedStudent && (
                <div className="nm-inset mt-3 p-3.5 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[10px] text-[--color-text-muted] block">Department</span>
                    <span className="font-semibold text-[--color-text-primary] truncate block">
                      {selectedStudent.department.split(' ')[0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[--color-text-muted] block">RFID UID</span>
                    <span className="font-mono text-emerald-600 font-bold block">
                      {selectedStudent.cardUid}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[--color-text-muted] block">Boarding State</span>
                    <span
                      className={`font-semibold block ${
                        selectedStudent.currentBoardingState === 'boarded'
                          ? 'text-emerald-600'
                          : 'text-[--color-text-muted]'
                      }`}
                    >
                      {selectedStudent.currentBoardingState === 'boarded'
                        ? '● Onboard Vehicle'
                        : '○ Alighted / Off'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[--color-text-muted] block">Assigned Bus</span>
                    <span className="font-semibold text-[--color-text-primary] block">
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
                <label className="block text-xs font-semibold text-[--color-text-secondary] mb-1.5">
                  Select Vehicle & RFID Reader
                </label>
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  className="nm-select w-full px-3.5 py-2.5 text-xs font-medium"
                >
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id} className="bg-[--color-surface-raised] text-[--color-text-primary]">
                      {bus.busNumber} ({bus.plateNumber}) — {bus.currentOccupancy}/{bus.capacity} seats
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[--color-text-muted] mt-1 block">
                  Route: {assignedRoute?.name} ({selectedBus.speed} km/h)
                </span>
              </div>

              {/* Event Type: Boarding or Alighting */}
              <div>
                <label className="block text-xs font-semibold text-[--color-text-secondary] mb-1.5">
                  Transit Event Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEventType('boarding')}
                    className={`py-2 px-3 rounded-[--radius-md] border text-xs font-bold transition-colors duration-150 ${
                      eventType === 'boarding'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                        : 'bg-[--color-surface-sunken] border-[--color-border-mid] text-[--color-text-muted] hover:text-[--color-text-primary]'
                    }`}
                  >
                    ↑ BOARDING (IN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventType('alighting')}
                    className={`py-2 px-3 rounded-[--radius-md] border text-xs font-bold transition-colors duration-150 ${
                      eventType === 'alighting'
                        ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-sm'
                        : 'bg-[--color-surface-sunken] border-[--color-border-mid] text-[--color-text-muted] hover:text-[--color-text-primary]'
                    }`}
                  >
                    ↓ ALIGHTING (OUT)
                  </button>
                </div>
              </div>
            </div>

            {/* GPS Verification Scenario Selector */}
            <div>
              <label className="block text-xs font-semibold text-[--color-text-secondary] mb-1.5">
                GPS Cross-Verification Test Scenario
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Scenario A */}
                <button
                  type="button"
                  onClick={() => setScenario('A')}
                  className={`p-3 rounded-[--radius-md] border text-left transition-colors duration-150 ${
                    scenario === 'A'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                      : 'bg-[--color-surface-base] border-[--color-border-mid] text-[--color-text-secondary] hover:text-[--color-text-primary]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Scenario A</span>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                    Student Near Bus
                  </div>
                  <div className="text-[10px] text-[--color-text-muted] mt-1">
                    Phone GPS ~38m from bus. Result: <b className="text-emerald-700">VERIFIED</b>
                  </div>
                </button>

                {/* Scenario B */}
                <button
                  type="button"
                  onClick={() => setScenario('B')}
                  className={`p-3 rounded-[--radius-md] border text-left transition-colors duration-150 ${
                    scenario === 'B'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm'
                      : 'bg-[--color-surface-base] border-[--color-border-mid] text-[--color-text-secondary] hover:text-[--color-text-primary]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Scenario B</span>
                  </div>
                  <div className="text-[11px] font-semibold text-amber-700 mt-0.5">
                    Student Far from Bus
                  </div>
                  <div className="text-[10px] text-[--color-text-muted] mt-1">
                    Phone GPS ~1.1km away. Result: <b className="text-amber-700">FLAGGED</b>
                  </div>
                </button>

                {/* Scenario C */}
                <button
                  type="button"
                  onClick={() => setScenario('C')}
                  className={`p-3 rounded-[--radius-md] border text-left transition-colors duration-150 ${
                    scenario === 'C'
                      ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-sm'
                      : 'bg-[--color-surface-base] border-[--color-border-mid] text-[--color-text-secondary] hover:text-[--color-text-primary]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                    <span>Scenario C</span>
                  </div>
                  <div className="text-[11px] font-semibold text-purple-700 mt-0.5">
                    GPS Unavailable
                  </div>
                  <div className="text-[10px] text-[--color-text-muted] mt-1">
                    Phone offline / stale. Result: <b className="text-purple-700">UNVERIFIED</b>
                  </div>
                </button>
              </div>

              {/* Scenario Explanation alert */}
              <div className="mt-2.5 p-2.5 rounded-lg bg-[--color-surface-base] border border-[--color-border-mid] text-[11px] text-[--color-text-secondary] flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[--color-text-primary]">Policy Reminder:</span> Regardless of whether
                  GPS returns <span className="text-emerald-700 font-bold">VERIFIED</span>,{' '}
                  <span className="text-amber-700 font-bold">FLAGGED</span>, or{' '}
                  <span className="text-purple-700 font-bold">UNVERIFIED</span>, the attendance event is{' '}
                  <span className="text-[--color-text-primary] font-semibold">always registered</span>. The student is not locked out;
                  flags are routed to the administrative audit queue.
                </div>
              </div>
            </div>

            {/* Processing Progress Stepper */}
            {currentStepIndex >= 0 && (
              <div className="py-2 mb-2">
                <StepTimeline currentStepIndex={currentStepIndex} />
              </div>
            )}

            {/* Giant SIMULATE CARD TAP Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSimulateTap}
                disabled={isProcessing}
                className={`nm-btn w-full py-4 px-6 rounded-xl font-black text-sm tracking-widest uppercase flex items-center justify-center gap-3 ${
                  isProcessing
                    ? 'nm-btn-surface bg-[--color-surface-base] text-[--color-text-muted] cursor-not-allowed'
                    : 'nm-btn-accent bg-[--color-accent-500] text-white cursor-pointer'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                    <span>Processing RFID Radio Frequency Event…</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-white fill-white" />
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
          <div className="glass-card p-6 scanline-effect">
            <div className="flex items-center justify-between border-b border-[--color-border-subtle] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-mono font-bold tracking-wider text-[--color-text-primary] uppercase">
                  RakshaTrack RFID Reader Panel
                </span>
              </div>
              <span className="section-tag">
                13.56 MHz NFC
              </span>
            </div>

            {/* Card Tap Target Visual */}
            <div className="my-4 flex flex-col items-center justify-center py-6 px-4 bg-[--color-surface-base] rounded-2xl border-2 border-dashed border-[--color-border-mid] relative overflow-hidden">
              <NfcScanAnimation 
                status={isProcessing ? 'scanning' : lastResult ? (lastResult.verification?.status === 'verified' ? 'verified' : 'flagged') : 'idle'} 
              />

              <div className="text-center mt-6">
                <span className="text-xs font-mono font-bold text-[--color-text-primary] block z-10 relative">
                  CONTACTLESS SENSOR FIELD
                </span>
                <span className="text-[10px] text-[--color-text-secondary] z-10 relative">
                  {isProcessing ? 'Processing RFID Signal...' : 'Awaiting software tap trigger'}
                </span>
              </div>
            </div>

            {/* Reader Diagnostics Box */}
            <div className="bg-[--color-surface-base] rounded-xl p-3 border border-[--color-border-mid] font-mono text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[--color-text-muted]">Vehicle Target:</span>
                <span className="text-[--color-text-primary] font-semibold">{selectedBus.busNumber} ({selectedBus.plateNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--color-text-muted]">Reader Telemetry:</span>
                <span className="text-emerald-700 font-semibold">Lat {selectedBus.currentLat}, Lng {selectedBus.currentLng}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[--color-text-muted]">Current Occupancy:</span>
                <span className="text-[--color-text-primary] font-bold">{selectedBus.currentOccupancy} / {selectedBus.capacity} seats</span>
              </div>
            </div>

            {/* Live Tap Result Banner */}
            {lastResult && (
              <ResultPanel 
                tap={lastResult.tap} 
                verification={lastResult.verification} 
                message={lastResult.message} 
              />
            )}
          </div>
        </div>
      </div>

      {/* Recent Tap Events Table */}
      <div className="nm-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-[--color-text-primary] tracking-wide uppercase">
              Recent Simulated Tap Log
            </h3>
          </div>
          <Link
            to="/attendance"
            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
          >
            <span>Full Attendance Audit Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[--color-border-subtle] bg-[--color-surface-base] text-[--color-text-secondary] font-mono text-[11px]">
                <th className="py-2.5 px-3">TAP ID</th>
                <th className="py-2.5 px-3">STUDENT</th>
                <th className="py-2.5 px-3">RFID CARD</th>
                <th className="py-2.5 px-3">BUS & ROUTE</th>
                <th className="py-2.5 px-3">EVENT</th>
                <th className="py-2.5 px-3">VERIFICATION</th>
                <th className="py-2.5 px-3 text-right">TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border-subtle] font-sans">
              {tapEvents.slice(0, 8).map((tap) => {
                const student = students.find((s) => s.id === tap.studentId)
                const bus = buses.find((b) => b.id === tap.busId)

                return (
                  <tr key={tap.id} className="glass-table-row">
                    <td className="py-2.5 px-3 font-mono text-[--color-text-muted] font-medium">{tap.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[--color-text-primary]">{student?.name}</div>
                      <div className="text-[10px] text-[--color-text-muted] font-mono">{student?.regNumber}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">{tap.cardUid}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[--color-text-primary]">{bus?.busNumber}</div>
                      <div className="text-[10px] text-[--color-text-muted] truncate max-w-[120px]">{tap.stopName}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tap.type === 'boarding'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {tap.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tap.verificationStatus === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tap.verificationStatus === 'flagged'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {tap.verificationStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[--color-text-muted] text-[11px]">
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
    </RoleGuard>
  )
}
