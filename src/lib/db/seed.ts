import { db } from './client'
import {
  routesTable,
  routeStopsTable,
  busesTable,
  studentsTable,
  systemAlertsTable,
  routeChangeRequestsTable,
} from './schema'
import {
  SEED_ROUTES,
  SEED_BUSES,
  SEED_STUDENTS,
  SEED_ALERTS,
  SEED_ROUTE_REQUESTS,
} from '../simulation/seed-data'

export async function seedDatabase() {
  if (!db) {
    console.error('Database is not initialized')
    return
  }

  console.log('Seeding Neon database...')

  // 1. Routes
  for (const r of SEED_ROUTES) {
    await db
      .insert(routesTable)
      .values({
        id: r.id,
        name: r.name,
        code: r.code,
        description: r.description,
        color: r.color,
        totalStops: r.totalStops,
        estimatedMinutes: r.estimatedMinutes,
      })
      .onConflictDoNothing()

    // Route stops
    for (const stop of r.stops) {
      await db
        .insert(routeStopsTable)
        .values({
          id: stop.id,
          routeId: r.id,
          stopName: stop.stopName,
          sequence: stop.sequence,
          lat: stop.lat.toString(),
          lng: stop.lng.toString(),
          expectedMorningTime: stop.expectedMorningTime,
          expectedEveningTime: stop.expectedEveningTime,
        })
        .onConflictDoNothing()
    }
  }
  console.log(`✓ Inserted ${SEED_ROUTES.length} routes & stops`)

  // 2. Buses
  for (const b of SEED_BUSES) {
    await db
      .insert(busesTable)
      .values({
        id: b.id,
        busNumber: b.busNumber,
        plateNumber: b.plateNumber,
        model: b.model,
        capacity: b.capacity,
        currentOccupancy: b.currentOccupancy,
        driverName: b.driverName,
        driverPhone: b.driverPhone,
        conductorName: b.conductorName,
        deviceStatus: b.deviceStatus,
        currentRouteId: b.currentRouteId,
        currentLat: b.currentLat.toString(),
        currentLng: b.currentLng.toString(),
        lastHeartbeat: new Date(b.lastHeartbeat),
      })
      .onConflictDoNothing()
  }
  console.log(`✓ Inserted ${SEED_BUSES.length} buses`)

  // 3. Students
  for (const s of SEED_STUDENTS) {
    await db
      .insert(studentsTable)
      .values({
        id: s.id,
        regNumber: s.regNumber,
        name: s.name,
        email: s.email,
        phone: s.phone,
        department: s.department,
        year: s.year,
        assignedBusId: s.assignedBusId,
        assignedRouteId: s.assignedRouteId,
        cardUid: s.cardUid,
        isEligible: s.isEligible,
        currentBoardingState: s.currentBoardingState,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
        homeStop: s.homeStop,
        photoUrl: s.photoUrl,
      })
      .onConflictDoNothing()
  }
  console.log(`✓ Inserted ${SEED_STUDENTS.length} students`)

  // 4. Alerts
  for (const a of SEED_ALERTS) {
    await db
      .insert(systemAlertsTable)
      .values({
        id: a.id,
        type: a.type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        timestamp: new Date(a.timestamp),
        isRead: a.isRead,
        studentId: a.studentId,
        busId: a.busId,
      })
      .onConflictDoNothing()
  }
  console.log(`✓ Inserted ${SEED_ALERTS.length} system alerts`)

  // 5. Route Requests
  for (const req of SEED_ROUTE_REQUESTS) {
    await db
      .insert(routeChangeRequestsTable)
      .values({
        id: req.id,
        studentId: req.studentId,
        currentRouteId: req.currentRouteId,
        requestedRouteId: req.requestedRouteId,
        reason: req.reason,
        status: req.status,
        adminComments: req.adminComments,
        createdAt: new Date(req.createdAt),
        reviewedAt: req.reviewedAt ? new Date(req.reviewedAt) : null,
        reviewedBy: req.reviewedBy,
      })
      .onConflictDoNothing()
  }
  console.log(`✓ Inserted ${SEED_ROUTE_REQUESTS.length} route change requests`)

  console.log('Database seeding complete!')
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding error:', err)
    process.exit(1)
  })
