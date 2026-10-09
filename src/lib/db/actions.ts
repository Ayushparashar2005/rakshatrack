import { createServerFn } from '@tanstack/react-start'
import { eq, desc } from 'drizzle-orm'
import { db } from './client'
import {
  usersTable,
  routesTable,
  routeStopsTable,
  busesTable,
  studentsTable,
  tapEventsTable,
  verificationResultsTable,
  routeChangeRequestsTable,
  systemAlertsTable,
} from './schema'

// 1. Sync Clerk user to Neon DB users table
export const syncUserToDB = createServerFn()
  .validator(
    (data: {
      clerkId: string
      email: string
      fullName: string
      role?: string
    }) => data
  )
  .handler(async ({ data }) => {
    if (!db) return { success: false, reason: 'db_not_initialized' }
    try {
      const existing = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.clerkId, data.clerkId))
        .limit(1)

      if (existing.length > 0) {
        // Update user
        await db
          .update(usersTable)
          .set({
            email: data.email,
            fullName: data.fullName,
            role: data.role || existing[0].role,
          })
          .where(eq(usersTable.clerkId, data.clerkId))
        return { success: true, user: existing[0] }
      } else {
        const id = `user-${Date.now()}`
        await db.insert(usersTable).values({
          id,
          clerkId: data.clerkId,
          email: data.email,
          fullName: data.fullName,
          role: data.role || 'student',
        })
        return { success: true, user: { id, ...data } }
      }
    } catch (err) {
      console.warn('syncUserToDB error:', err)
      return { success: false, error: String(err) }
    }
  })

// 2. Persist Tap Event into Neon DB
export const persistTapEvent = createServerFn()
  .validator(
    (data: {
      id: string
      cardUid: string
      studentId: string
      busId: string
      tripId?: string
      type: string
      timestamp?: string
      simulated?: boolean
      verificationStatus: string
      stopName?: string
    }) => data
  )
  .handler(async ({ data }) => {
    if (!db) return { success: false, reason: 'db_not_initialized' }
    try {
      await db
        .insert(tapEventsTable)
        .values({
          id: data.id,
          cardUid: data.cardUid,
          studentId: data.studentId,
          busId: data.busId,
          tripId: data.tripId || null,
          type: data.type,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
          simulated: data.simulated ?? true,
          verificationStatus: data.verificationStatus,
          stopName: data.stopName || null,
        })
        .onConflictDoNothing()

      // Also update student's boarding state in DB
      const newState = data.type === 'boarding' ? 'boarded' : 'alighted'
      await db
        .update(studentsTable)
        .set({ currentBoardingState: newState })
        .where(eq(studentsTable.id, data.studentId))

      return { success: true }
    } catch (err) {
      console.warn('persistTapEvent error:', err)
      return { success: false, error: String(err) }
    }
  })

// 3. Persist Verification Evidence into Neon DB
export const persistVerification = createServerFn()
  .validator(
    (data: {
      id: string
      tapEventId: string
      status: string
      distanceMeters?: number
      studentLat?: number | null
      studentLng?: number | null
      busLat: number
      busLng: number
      scenario?: string
      evidenceQuality?: string
      explanation: string
      reviewStatus?: string
      adminNotes?: string
    }) => data
  )
  .handler(async ({ data }) => {
    if (!db) return { success: false, reason: 'db_not_initialized' }
    try {
      await db
        .insert(verificationResultsTable)
        .values({
          id: data.id,
          tapEventId: data.tapEventId,
          status: data.status,
          distanceMeters: data.distanceMeters ?? null,
          studentLat: data.studentLat?.toString() ?? null,
          studentLng: data.studentLng?.toString() ?? null,
          busLat: data.busLat.toString(),
          busLng: data.busLng.toString(),
          scenario: data.scenario || null,
          evidenceQuality: data.evidenceQuality || null,
          explanation: data.explanation,
          reviewStatus: data.reviewStatus || 'pending',
          adminNotes: data.adminNotes || null,
        })
        .onConflictDoNothing()

      // If status is flagged, also insert an alert
      if (data.status === 'flagged') {
        const alertId = `ALERT-${Date.now()}`
        await db
          .insert(systemAlertsTable)
          .values({
            id: alertId,
            type: 'gps_mismatch',
            severity: 'warning',
            title: `GPS Flagged Tap: ${data.distanceMeters ?? 'Unknown'}m discrepancy`,
            message: data.explanation,
            timestamp: new Date(),
            isRead: false,
          })
          .onConflictDoNothing()
      }

      return { success: true }
    } catch (err) {
      console.warn('persistVerification error:', err)
      return { success: false, error: String(err) }
    }
  })

// 4. Get Student Tap History
export const getStudentTapHistory = createServerFn()
  .validator((data: { studentId: string }) => data)
  .handler(async ({ data }) => {
    if (!db) return []
    try {
      const taps = await db
        .select()
        .from(tapEventsTable)
        .where(eq(tapEventsTable.studentId, data.studentId))
        .orderBy(desc(tapEventsTable.timestamp))
        .limit(20)

      return taps.map((t) => ({
        ...t,
        timestamp: t.timestamp.toISOString(),
      }))
    } catch (err) {
      console.warn('getStudentTapHistory error:', err)
      return []
    }
  })

// 5. Get System Alerts
export const getSystemAlertsFromDB = createServerFn().handler(async () => {
  if (!db) return []
  try {
    const alerts = await db
      .select()
      .from(systemAlertsTable)
      .orderBy(desc(systemAlertsTable.timestamp))
      .limit(50)

    return alerts.map((a) => ({
      ...a,
      timestamp: a.timestamp.toISOString(),
    }))
  } catch (err) {
    console.warn('getSystemAlertsFromDB error:', err)
    return []
  }
})

// 6. Mark Alert as Read in DB
export const markAlertReadInDB = createServerFn()
  .validator((data: { alertId: string }) => data)
  .handler(async ({ data }) => {
    if (!db) return { success: false }
    try {
      await db
        .update(systemAlertsTable)
        .set({ isRead: true })
        .where(eq(systemAlertsTable.id, data.alertId))
      return { success: true }
    } catch (err) {
      console.warn('markAlertReadInDB error:', err)
      return { success: false }
    }
  })

// 7. Get Route Change Requests
export const getRouteRequestsFromDB = createServerFn().handler(async () => {
  if (!db) return []
  try {
    const requests = await db
      .select()
      .from(routeChangeRequestsTable)
      .orderBy(desc(routeChangeRequestsTable.createdAt))

    return requests.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : undefined,
    }))
  } catch (err) {
    console.warn('getRouteRequestsFromDB error:', err)
    return []
  }
})

// 8. Insert Route Change Request
export const insertRouteChangeRequest = createServerFn()
  .validator(
    (data: {
      id: string
      studentId: string
      currentRouteId: string
      requestedRouteId: string
      reason: string
    }) => data
  )
  .handler(async ({ data }) => {
    if (!db) return { success: false, reason: 'db_not_initialized' }
    try {
      await db.insert(routeChangeRequestsTable).values({
        id: data.id,
        studentId: data.studentId,
        currentRouteId: data.currentRouteId,
        requestedRouteId: data.requestedRouteId,
        reason: data.reason,
        status: 'pending',
        createdAt: new Date(),
      })
      return { success: true }
    } catch (err) {
      console.warn('insertRouteChangeRequest error:', err)
      return { success: false, error: String(err) }
    }
  })

// 9. Update Route Change Request (Approve / Reject)
export const updateRouteChangeRequest = createServerFn()
  .validator(
    (data: {
      requestId: string
      status: 'approved' | 'rejected'
      adminComments?: string
      reviewedBy?: string
      studentId?: string
      newRouteId?: string
    }) => data
  )
  .handler(async ({ data }) => {
    if (!db) return { success: false }
    try {
      await db
        .update(routeChangeRequestsTable)
        .set({
          status: data.status,
          adminComments: data.adminComments || null,
          reviewedAt: new Date(),
          reviewedBy: data.reviewedBy || 'Transport Admin',
        })
        .where(eq(routeChangeRequestsTable.id, data.requestId))

      // If approved and route provided, update student's assigned route
      if (data.status === 'approved' && data.studentId && data.newRouteId) {
        await db
          .update(studentsTable)
          .set({ assignedRouteId: data.newRouteId })
          .where(eq(studentsTable.id, data.studentId))
      }

      return { success: true }
    } catch (err) {
      console.warn('updateRouteChangeRequest error:', err)
      return { success: false, error: String(err) }
    }
  })

// 10. Update Verification Review in DB
export const updateVerificationReviewInDB = createServerFn()
  .validator(
    (data: {
      verificationId: string
      reviewStatus: string
      adminNotes?: string
      reviewedBy?: string
    }) => data
  )
  .handler(async ({ data }) => {
    if (!db) return { success: false }
    try {
      await db
        .update(verificationResultsTable)
        .set({
          reviewStatus: data.reviewStatus,
          adminNotes: data.adminNotes || null,
          reviewedAt: new Date(),
          reviewedBy: data.reviewedBy || 'Supervisor',
        })
        .where(eq(verificationResultsTable.id, data.verificationId))
      return { success: true }
    } catch (err) {
      console.warn('updateVerificationReviewInDB error:', err)
      return { success: false }
    }
  })

// 11. Get Students from DB
export const getStudentsFromDB = createServerFn().handler(async () => {
  if (!db) return []
  try {
    const students = await db.select().from(studentsTable)
    return students
  } catch (err) {
    console.warn('getStudentsFromDB error:', err)
    return []
  }
})

// 12. Update Student In DB
export const updateStudentInDB = createServerFn()
  .validator(
    (data: {
      id: string
      cardUid?: string
      assignedBusId?: string
      assignedRouteId?: string
      isEligible?: boolean
    }) => data
  )
  .handler(async ({ data }) => {
    if (!db) return { success: false }
    try {
      const updateData: Record<string, any> = {}
      if (data.cardUid !== undefined) updateData.cardUid = data.cardUid
      if (data.assignedBusId !== undefined) updateData.assignedBusId = data.assignedBusId
      if (data.assignedRouteId !== undefined) updateData.assignedRouteId = data.assignedRouteId
      if (data.isEligible !== undefined) updateData.isEligible = data.isEligible

      await db
        .update(studentsTable)
        .set(updateData)
        .where(eq(studentsTable.id, data.id))
      return { success: true }
    } catch (err) {
      console.warn('updateStudentInDB error:', err)
      return { success: false }
    }
  })

// 13. Update Bus In DB
export const updateBusInDB = createServerFn()
  .validator(
    (data: {
      id: string
      busNumber?: string
      plateNumber?: string
      capacity?: number
      driverName?: string
      driverPhone?: string
      status?: 'active' | 'maintenance' | 'offline'
      currentRouteId?: string
    }) => data
  )
  .handler(async ({ data }) => {
    if (!db) return { success: false }
    try {
      const updateData: Record<string, any> = {}
      if (data.busNumber !== undefined) updateData.busNumber = data.busNumber
      if (data.plateNumber !== undefined) updateData.plateNumber = data.plateNumber
      if (data.capacity !== undefined) updateData.capacity = data.capacity
      if (data.driverName !== undefined) updateData.driverName = data.driverName
      if (data.driverPhone !== undefined) updateData.driverPhone = data.driverPhone
      if (data.status !== undefined) updateData.status = data.status
      if (data.currentRouteId !== undefined) updateData.currentRouteId = data.currentRouteId

      await db
        .update(busesTable)
        .set(updateData)
        .where(eq(busesTable.id, data.id))
      return { success: true }
    } catch (err) {
      console.warn('updateBusInDB error:', err)
      return { success: false }
    }
  })
