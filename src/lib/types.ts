export type VerificationStatus = 'verified' | 'flagged' | 'unverified'
export type ReviewDecision = 'pending' | 'under_review' | 'reviewed' | 'dismissed' | 'escalated'
export type EventType = 'boarding' | 'alighting'
export type DeviceStatus = 'online' | 'degraded' | 'offline'
export type TripStatus = 'active' | 'completed' | 'scheduled'
export type ShiftType = 'morning_pickup' | 'evening_drop'
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type UserRole = 'admin' | 'student' | 'guardian'

export interface Student {
  id: string
  regNumber: string
  name: string
  email: string
  phone: string
  department: string
  year: string
  assignedBusId: string
  assignedRouteId: string
  cardUid: string
  isEligible: boolean
  currentBoardingState: 'alighted' | 'boarded'
  guardianName: string
  guardianPhone: string
  guardianRelationship: string
  homeStop: string
  photoUrl: string
}

export interface Bus {
  id: string
  busNumber: string
  plateNumber: string
  model: string
  capacity: number
  currentOccupancy: number
  driverName: string
  driverPhone: string
  conductorName: string
  deviceStatus: DeviceStatus
  lastHeartbeat: string
  currentLat: number
  currentLng: number
  speed: number
  heading: number
  status: 'in_transit' | 'idle' | 'delayed'
  currentRouteId: string
  activeTripId?: string
}

export interface RouteStop {
  id: string
  routeId: string
  stopName: string
  sequence: number
  lat: number
  lng: number
  expectedMorningTime: string
  expectedEveningTime: string
}

export interface Route {
  id: string
  name: string
  code: string
  description: string
  color: string
  totalStops: number
  estimatedMinutes: number
  stops: RouteStop[]
}

export interface Trip {
  id: string
  busId: string
  routeId: string
  shift: ShiftType
  status: TripStatus
  startTime: string
  endTime?: string
  totalBoarded: number
  totalAlighted: number
}

export interface TapEvent {
  id: string
  cardUid: string
  studentId: string
  busId: string
  tripId: string
  type: EventType
  timestamp: string
  simulated: boolean
  verificationStatus: VerificationStatus
  stopName?: string
}

export interface VerificationEvidence {
  id: string
  tapEventId: string
  status: VerificationStatus
  distanceMeters: number
  studentLat: number | null
  studentLng: number | null
  busLat: number
  busLng: number
  scenario: 'Scenario A — Near Bus' | 'Scenario B — Far from Bus' | 'Scenario C — GPS Unavailable'
  evidenceQuality: 'high' | 'medium' | 'low' | 'unavailable'
  explanation: string
  reviewStatus: ReviewDecision
  adminNotes?: string
  reviewedAt?: string
  reviewedBy?: string
}

export interface RouteChangeRequest {
  id: string
  studentId: string
  studentName: string
  studentReg: string
  currentRouteId: string
  currentRouteName: string
  requestedRouteId: string
  requestedRouteName: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  adminComments?: string
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export interface SystemAlert {
  id: string
  type: 'gps_mismatch' | 'capacity_warning' | 'unverified_tap' | 'device_offline' | 'missed_tap'
  severity: AlertSeverity
  title: string
  message: string
  timestamp: string
  isRead: boolean
  studentId?: string
  studentName?: string
  busId?: string
  busNumber?: string
}

export interface SimulationScenarioConfig {
  scenario: 'A' | 'B' | 'C'
  studentOffsetMeters?: number
  gpsAccuracyMeters?: number
}
