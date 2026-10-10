import type {
  Bus,
  EventType,
  ReviewDecision,
  RouteChangeRequest,
  RouteStop,
  Student,
  SystemAlert,
  TapEvent,
  UserRole,
  VerificationEvidence,
} from '../types'
import { playNotificationPing } from '../sound'
import {
  SEED_ALERTS,
  SEED_BUSES,
  SEED_ROUTE_REQUESTS,
  SEED_ROUTES,
  SEED_STUDENTS,
  SEED_TAP_EVENTS,
  SEED_VERIFICATIONS,
} from './seed-data'
import { verifyGpsPresence } from './gps-verification'

interface DemoState {
  students: Student[]
  buses: Bus[]
  routes: typeof SEED_ROUTES
  tapEvents: TapEvent[]
  verifications: VerificationEvidence[]
  alerts: SystemAlert[]
  routeRequests: RouteChangeRequest[]
  isSimulationRunning: boolean
  simulationSpeed: number // 1x, 2x, 5x
  currentRole: UserRole
  activeStudentId: string
  lastProcessedTap: {
    event: TapEvent
    verification: VerificationEvidence
  } | null
  hasSelectedRole: boolean
}

const STORAGE_KEY = 'rakshatrack_demo_store_v1'

function getInitialState(): DemoState {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...parsed,
          isSimulationRunning: false, // Don't auto-run on reload
          routes: SEED_ROUTES, // Keep fresh coordinates
        }
      }
    } catch (e) {
      console.warn('Failed to load demo state from localStorage', e)
    }
  }

  return {
    students: [...SEED_STUDENTS],
    buses: [...SEED_BUSES],
    routes: SEED_ROUTES,
    tapEvents: [...SEED_TAP_EVENTS],
    verifications: [...SEED_VERIFICATIONS],
    alerts: [...SEED_ALERTS],
    routeRequests: [...SEED_ROUTE_REQUESTS],
    isSimulationRunning: false,
    simulationSpeed: 1,
    currentRole: 'admin',
    activeStudentId: 'student-1',
    lastProcessedTap: null,
    hasSelectedRole: false,
  }
}

class DemoStore {
  private state: DemoState
  private listeners: Set<() => void> = new Set()
  private simulationTimer: any = null
  private busStepIndices: Record<string, number> = {
    'bus-101': 3,
    'bus-102': 2,
    'bus-103': 3,
    'bus-104': 1,
  }

  constructor() {
    this.state = getInitialState()
  }

  public getState(): DemoState {
    return this.state
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.state = { ...this.state }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
      } catch (e) {
        // storage overflow fallback
      }
    }
    this.listeners.forEach((listener) => listener())
  }

  public setRole(role: UserRole) {
    this.state.currentRole = role
    this.notify()
  }

  public completeOnboarding(role: UserRole) {
    this.state.currentRole = role
    this.state.hasSelectedRole = true
    this.notify()
  }

  public setActiveStudent(studentId: string) {
    this.state.activeStudentId = studentId
    this.notify()
  }

  public updateStudent(studentId: string, patch: Partial<Student>) {
    this.state.students = this.state.students.map((s) =>
      s.id === studentId ? { ...s, ...patch } : s
    )
    this.notify()
  }

  public updateBus(busId: string, patch: Partial<Bus>) {
    this.state.buses = this.state.buses.map((b) =>
      b.id === busId ? { ...b, ...patch } : b
    )
    this.notify()
  }

  public setSimulationSpeed(speed: number) {
    this.state.simulationSpeed = speed
    if (this.state.isSimulationRunning) {
      this.stopSimulationLoop()
      this.startSimulationLoop()
    }
    this.notify()
  }

  public toggleSimulation(run?: boolean) {
    const shouldRun = run !== undefined ? run : !this.state.isSimulationRunning
    this.state.isSimulationRunning = shouldRun
    if (shouldRun) {
      this.startSimulationLoop()
    } else {
      this.stopSimulationLoop()
    }
    this.notify()
  }

  private startSimulationLoop() {
    this.stopSimulationLoop()
    const intervalMs = Math.max(800, Math.floor(2400 / this.state.simulationSpeed))
    this.simulationTimer = setInterval(() => {
      this.stepBuses()
    }, intervalMs)
  }

  private stopSimulationLoop() {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer)
      this.simulationTimer = null
    }
  }

  /**
   * Advances buses along their respective route stops smoothly
   */
  public stepBuses() {
    const updatedBuses = this.state.buses.map((bus) => {
      const route = this.state.routes.find((r) => r.id === bus.currentRouteId)
      if (!route || route.stops.length === 0) return bus

      const currentIndex = this.busStepIndices[bus.id] ?? 0
      const nextIndex = (currentIndex + 1) % route.stops.length
      this.busStepIndices[bus.id] = nextIndex

      const targetStop = route.stops[nextIndex]
      // Add slight jitter to simulate live GPS drift
      const latJitter = (Math.random() - 0.5) * 0.0004
      const lngJitter = (Math.random() - 0.5) * 0.0004

      return {
        ...bus,
        currentLat: Number((targetStop.lat + latJitter).toFixed(6)),
        currentLng: Number((targetStop.lng + lngJitter).toFixed(6)),
        speed: Math.floor(25 + Math.random() * 25),
        lastHeartbeat: new Date().toISOString(),
      }
    })

    this.state.buses = updatedBuses
    this.notify()
  }

  /**
   * Core Software-Only RFID Tap Simulator
   * Adheres strictly to the "FLAG, NOT BLOCK" rule.
   */
  public simulateCardTap(params: {
    studentId: string
    busId: string
    type: EventType
    scenario: 'A' | 'B' | 'C'
    customStopName?: string
  }): {
    success: boolean
    tapEvent: TapEvent
    verification: VerificationEvidence
    message: string
  } {
    const student = this.state.students.find((s) => s.id === params.studentId)
    if (!student) {
      throw new Error(`Student ${params.studentId} not found`)
    }

    const bus = this.state.buses.find((b) => b.id === params.busId)
    if (!bus) {
      throw new Error(`Bus ${params.busId} not found`)
    }

    // Determine stop name
    const route = this.state.routes.find((r) => r.id === bus.currentRouteId)
    const currentStop = params.customStopName || route?.stops[0]?.stopName || 'SGT Campus Main Gate'

    // Prevent duplicate invalid transitions
    if (params.type === 'boarding' && student.currentBoardingState === 'boarded') {
      // Allow it but flag notification
    }

    const tapEventId = `TAP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`

    // Run GPS Verification Engine
    const verification = verifyGpsPresence({
      tapEventId,
      busLat: bus.currentLat,
      busLng: bus.currentLng,
      scenario: params.scenario,
    })

    const tapEvent: TapEvent = {
      id: tapEventId,
      cardUid: student.cardUid,
      studentId: student.id,
      busId: bus.id,
      tripId: bus.activeTripId || 'trip-demo-active',
      type: params.type,
      timestamp: new Date().toISOString(),
      simulated: true,
      verificationStatus: verification.status,
      stopName: currentStop,
    }

    // Update Occupancy:
    // Boarding increases occupancy (capped at physical capacity with alert if exceeded)
    // Alighting decreases occupancy (floor at 0)
    let newOccupancy = bus.currentOccupancy
    if (params.type === 'boarding') {
      // Notification Sound on Boarding
      playNotificationPing()
      
      newOccupancy = Math.min(bus.capacity + 5, bus.currentOccupancy + 1)
      if (newOccupancy > bus.capacity) {
        // Raise Capacity Alert
        this.state.alerts.unshift({
          id: `ALERT-CAP-${Date.now()}`,
          type: 'capacity_warning',
          severity: 'warning',
          title: `Capacity Overload Warning — ${bus.busNumber}`,
          message: `Bus occupancy (${newOccupancy}/${bus.capacity}) exceeded authorized seating limit during boarding at ${currentStop}.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          busId: bus.id,
          busNumber: bus.busNumber,
        })
      }
    } else {
      newOccupancy = Math.max(0, bus.currentOccupancy - 1)
    }

    // Update student state
    const updatedStudents = this.state.students.map((s) => {
      if (s.id === student.id) {
        return {
          ...s,
          currentBoardingState: params.type === 'boarding' ? ('boarded' as const) : ('alighted' as const),
        }
      }
      return s
    })

    // Update bus state
    const updatedBuses = this.state.buses.map((b) => {
      if (b.id === bus.id) {
        return {
          ...b,
          currentOccupancy: newOccupancy,
        }
      }
      return b
    })

    // If FLAGGED, generate a System Alert for Guardians and Transport Admin
    if (verification.status === 'flagged') {
      this.state.alerts.unshift({
        id: `ALERT-FLAG-${Date.now()}`,
        type: 'gps_mismatch',
        severity: 'warning',
        title: `GPS Verification Flagged — ${student.name}`,
        message: `Student phone registered ${verification.distanceMeters}m away from ${bus.busNumber} at tap. Boarding recorded under administrative review.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        studentId: student.id,
        studentName: student.name,
        busId: bus.id,
        busNumber: bus.busNumber,
      })
    } else if (verification.status === 'unverified') {
      this.state.alerts.unshift({
        id: `ALERT-UNVERIF-${Date.now()}`,
        type: 'unverified_tap',
        severity: 'info',
        title: `Unverified Tap — ${student.name}`,
        message: `Card tapped on ${bus.busNumber} without GPS confirmation (device offline). Protocol logged.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        studentId: student.id,
        studentName: student.name,
        busId: bus.id,
        busNumber: bus.busNumber,
      })
    }

    // Save to records
    this.state.tapEvents.unshift(tapEvent)
    this.state.verifications.unshift(verification)
    this.state.students = updatedStudents
    this.state.buses = updatedBuses
    this.state.lastProcessedTap = { event: tapEvent, verification }

    this.notify()

    return {
      success: true,
      tapEvent,
      verification,
      message:
        verification.status === 'verified'
          ? `Card tap verified! ${student.name} logged as ${params.type}.`
          : `Card tap recorded as ${verification.status.toUpperCase()}. Action preserved per Flag-Not-Block policy.`,
    }
  }

  /**
   * Administrative Verification Review
   */
  public updateReview(reviewId: string, status: ReviewDecision, adminNotes?: string) {
    this.state.verifications = this.state.verifications.map((v) => {
      if (v.id === reviewId) {
        return {
          ...v,
          reviewStatus: status,
          adminNotes: adminNotes || v.adminNotes,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'Transport Supervisor (Office)',
        }
      }
      return v
    })
    this.notify()
  }

  /**
   * Route-Change Request Workflow
   */
  public submitRouteChangeRequest(studentId: string, requestedRouteId: string, reason: string) {
    const student = this.state.students.find((s) => s.id === studentId)
    const currentRoute = this.state.routes.find((r) => r.id === student?.assignedRouteId)
    const requestedRoute = this.state.routes.find((r) => r.id === requestedRouteId)

    if (!student || !requestedRoute) return

    const newRequest: RouteChangeRequest = {
      id: `REQ-${Date.now().toString(36).toUpperCase()}`,
      studentId: student.id,
      studentName: student.name,
      studentReg: student.regNumber,
      currentRouteId: currentRoute?.id || 'route-a',
      currentRouteName: currentRoute?.name || 'Unassigned',
      requestedRouteId: requestedRoute.id,
      requestedRouteName: requestedRoute.name,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    this.state.routeRequests.unshift(newRequest)
    this.notify()
  }

  public reviewRouteChangeRequest(requestId: string, status: 'approved' | 'rejected', adminComments?: string) {
    const request = this.state.routeRequests.find((r) => r.id === requestId)
    if (!request) return

    this.state.routeRequests = this.state.routeRequests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          adminComments,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'Campus Transport Controller',
        }
      }
      return r
    })

    // If approved, update student route and bus
    if (status === 'approved') {
      const targetBus = this.state.buses.find((b) => b.currentRouteId === request.requestedRouteId)
      this.state.students = this.state.students.map((s) => {
        if (s.id === request.studentId) {
          return {
            ...s,
            assignedRouteId: request.requestedRouteId,
            assignedBusId: targetBus ? targetBus.id : s.assignedBusId,
          }
        }
        return s
      })
    }

    this.notify()
  }

  public markAlertRead(alertId: string) {
    this.state.alerts = this.state.alerts.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    this.notify()
  }

  public markAllAlertsRead() {
    this.state.alerts = this.state.alerts.map((a) => ({ ...a, isRead: true }))
    this.notify()
  }

  public resetToDefault() {
    this.stopSimulationLoop()
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    this.state = {
      students: [...SEED_STUDENTS],
      buses: [...SEED_BUSES],
      routes: SEED_ROUTES,
      tapEvents: [...SEED_TAP_EVENTS],
      verifications: [...SEED_VERIFICATIONS],
      alerts: [...SEED_ALERTS],
      routeRequests: [...SEED_ROUTE_REQUESTS],
      isSimulationRunning: false,
      simulationSpeed: 1,
      currentRole: 'admin',
      activeStudentId: 'student-1',
      lastProcessedTap: null,
      hasSelectedRole: false,
    }
    this.busStepIndices = {
      'bus-101': 3,
      'bus-102': 2,
      'bus-103': 3,
      'bus-104': 1,
    }
    this.notify()
  }
}

export const demoStore = new DemoStore()
