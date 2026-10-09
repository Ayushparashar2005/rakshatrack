import type { VerificationEvidence, VerificationStatus } from '../types'

export const DEFAULT_PROXIMITY_THRESHOLD_METERS = 150

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 * @returns distance in meters
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Generates an offset coordinate roughly distanceMeters away from (lat, lng)
 */
export function offsetCoordinates(
  lat: number,
  lng: number,
  distanceMeters: number,
  bearingDegrees: number = 45
): { lat: number; lng: number } {
  const R = 6371000
  const brng = toRadians(bearingDegrees)
  const d = distanceMeters
  const lat1 = toRadians(lat)
  const lon1 = toRadians(lng)

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d / R) +
      Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng)
  )
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1),
      Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2)
    )

  return {
    lat: Number(((lat2 * 180) / Math.PI).toFixed(6)),
    lng: Number(((lon2 * 180) / Math.PI).toFixed(6)),
  }
}

export interface VerificationInput {
  tapEventId: string
  busLat: number
  busLng: number
  scenario: 'A' | 'B' | 'C'
  customStudentLat?: number
  customStudentLng?: number
  proximityThresholdMeters?: number
}

/**
 * Runs the GPS Verification Engine for a simulated RFID tap.
 * Follows the core principle: FLAG, NOT BLOCK.
 */
export function verifyGpsPresence(input: VerificationInput): VerificationEvidence {
  const defaultThreshold = input.proximityThresholdMeters ?? DEFAULT_PROXIMITY_THRESHOLD_METERS
  const threshold = typeof window !== 'undefined'
    ? Number(localStorage.getItem('raksha_proximity_threshold') || defaultThreshold)
    : defaultThreshold
    
  const { busLat, busLng, scenario, tapEventId } = input

  let studentLat: number | null = null
  let studentLng: number | null = null
  let distanceMeters = 0
  let status: VerificationStatus = 'unverified'
  let scenarioLabel: VerificationEvidence['scenario'] = 'Scenario A — Near Bus'
  let evidenceQuality: VerificationEvidence['evidenceQuality'] = 'high'
  let explanation = ''

  if (scenario === 'A') {
    // Scenario A: Student near bus (e.g. 15 to 45 meters)
    const simulatedOffset = 38
    const coords = offsetCoordinates(busLat, busLng, simulatedOffset, 30)
    studentLat = input.customStudentLat ?? coords.lat
    studentLng = input.customStudentLng ?? coords.lng
    distanceMeters = calculateHaversineDistance(busLat, busLng, studentLat, studentLng)

    status = 'verified'
    scenarioLabel = 'Scenario A — Near Bus'
    evidenceQuality = 'high'
    explanation = `Student mobile GPS confirmed within ${distanceMeters}m of bus reader (threshold: ${threshold}m). Telemetry timestamp synchronized within 4s. High positional confidence (CEP: ±5m).`
  } else if (scenario === 'B') {
    // Scenario B: Student far from bus (e.g. 750 to 1800 meters)
    const simulatedOffset = 1120
    const coords = offsetCoordinates(busLat, busLng, simulatedOffset, 120)
    studentLat = input.customStudentLat ?? coords.lat
    studentLng = input.customStudentLng ?? coords.lng
    distanceMeters = calculateHaversineDistance(busLat, busLng, studentLat, studentLng)

    status = 'flagged'
    scenarioLabel = 'Scenario B — Far from Bus'
    evidenceQuality = 'high'
    explanation = `Proximity mismatch detected. Student phone recorded ${distanceMeters}m away from bus reader, exceeding safety threshold of ${threshold}m. Card tap recorded per "Flag, Not Block" policy. Case dispatched for administrative audit.`
  } else {
    // Scenario C: GPS Unavailable or Stale
    studentLat = null
    studentLng = null
    distanceMeters = -1

    status = 'unverified'
    scenarioLabel = 'Scenario C — GPS Unavailable'
    evidenceQuality = 'unavailable'
    explanation = `No active student GPS telemetry received (device offline, battery saver, or location permissions denied). Tap logged as Unverified. Attendance permitted per "Flag, Not Block" university protocol.`
  }

  return {
    id: `VERIF-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    tapEventId,
    status,
    distanceMeters,
    studentLat,
    studentLng,
    busLat,
    busLng,
    scenario: scenarioLabel,
    evidenceQuality,
    explanation,
    reviewStatus: status === 'verified' ? 'reviewed' : 'pending',
  }
}
