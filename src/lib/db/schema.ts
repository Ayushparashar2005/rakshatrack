import { boolean, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const usersTable = pgTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  clerkId: varchar('clerk_id', { length: 128 }).unique(),
  email: varchar('email', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  role: varchar('role', { length: 32 }).notNull().default('student'), // admin, student, guardian
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const routesTable = pgTable('routes', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  description: text('description'),
  color: varchar('color', { length: 16 }).default('#10B981'),
  totalStops: integer('total_stops').default(0),
  estimatedMinutes: integer('estimated_minutes').default(45),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const routeStopsTable = pgTable('route_stops', {
  id: varchar('id', { length: 64 }).primaryKey(),
  routeId: varchar('route_id', { length: 64 }).references(() => routesTable.id).notNull(),
  stopName: varchar('stop_name', { length: 128 }).notNull(),
  sequence: integer('sequence').notNull(),
  lat: text('lat').notNull(),
  lng: text('lng').notNull(),
  expectedMorningTime: varchar('expected_morning_time', { length: 16 }),
  expectedEveningTime: varchar('expected_evening_time', { length: 16 }),
})

export const busesTable = pgTable('buses', {
  id: varchar('id', { length: 64 }).primaryKey(),
  busNumber: varchar('bus_number', { length: 32 }).notNull().unique(),
  plateNumber: varchar('plate_number', { length: 32 }).notNull(),
  model: varchar('model', { length: 128 }),
  capacity: integer('capacity').notNull().default(45),
  currentOccupancy: integer('current_occupancy').notNull().default(0),
  driverName: varchar('driver_name', { length: 128 }),
  driverPhone: varchar('driver_phone', { length: 32 }),
  conductorName: varchar('conductor_name', { length: 128 }),
  deviceStatus: varchar('device_status', { length: 32 }).default('online'),
  currentRouteId: varchar('current_route_id', { length: 64 }).references(() => routesTable.id),
  currentLat: text('current_lat'),
  currentLng: text('current_lng'),
  lastHeartbeat: timestamp('last_heartbeat'),
})

export const studentsTable = pgTable('students', {
  id: varchar('id', { length: 64 }).primaryKey(),
  regNumber: varchar('reg_number', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 32 }),
  department: varchar('department', { length: 128 }),
  year: varchar('year', { length: 32 }),
  assignedBusId: varchar('assigned_bus_id', { length: 64 }).references(() => busesTable.id),
  assignedRouteId: varchar('assigned_route_id', { length: 64 }).references(() => routesTable.id),
  cardUid: varchar('card_uid', { length: 64 }).unique(),
  isEligible: boolean('is_eligible').default(true).notNull(),
  currentBoardingState: varchar('current_boarding_state', { length: 32 }).default('alighted'),
  guardianName: varchar('guardian_name', { length: 128 }),
  guardianPhone: varchar('guardian_phone', { length: 32 }),
  homeStop: varchar('home_stop', { length: 128 }),
  photoUrl: text('photo_url'),
})

export const tapEventsTable = pgTable('tap_events', {
  id: varchar('id', { length: 64 }).primaryKey(),
  cardUid: varchar('card_uid', { length: 64 }).notNull(),
  studentId: varchar('student_id', { length: 64 }).references(() => studentsTable.id).notNull(),
  busId: varchar('bus_id', { length: 64 }).references(() => busesTable.id).notNull(),
  tripId: varchar('trip_id', { length: 64 }),
  type: varchar('type', { length: 32 }).notNull(), // boarding, alighting
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  simulated: boolean('simulated').default(true).notNull(),
  verificationStatus: varchar('verification_status', { length: 32 }).notNull(),
  stopName: varchar('stop_name', { length: 128 }),
})

export const verificationResultsTable = pgTable('verification_results', {
  id: varchar('id', { length: 64 }).primaryKey(),
  tapEventId: varchar('tap_event_id', { length: 64 }).references(() => tapEventsTable.id).notNull(),
  status: varchar('status', { length: 32 }).notNull(), // verified, flagged, unverified
  distanceMeters: integer('distance_meters'),
  studentLat: text('student_lat'),
  studentLng: text('student_lng'),
  busLat: text('bus_lat').notNull(),
  busLng: text('bus_lng').notNull(),
  scenario: varchar('scenario', { length: 64 }),
  evidenceQuality: varchar('evidence_quality', { length: 32 }),
  explanation: text('explanation').notNull(),
  reviewStatus: varchar('review_status', { length: 32 }).default('pending'),
  adminNotes: text('admin_notes'),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: varchar('reviewed_by', { length: 128 }),
})

export const routeChangeRequestsTable = pgTable('route_change_requests', {
  id: varchar('id', { length: 64 }).primaryKey(),
  studentId: varchar('student_id', { length: 64 }).references(() => studentsTable.id).notNull(),
  currentRouteId: varchar('current_route_id', { length: 64 }).notNull(),
  requestedRouteId: varchar('requested_route_id', { length: 64 }).notNull(),
  reason: text('reason').notNull(),
  status: varchar('status', { length: 32 }).default('pending'), // pending, approved, rejected
  adminComments: text('admin_comments'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: varchar('reviewed_by', { length: 128 }),
})

export const systemAlertsTable = pgTable('system_alerts', {
  id: varchar('id', { length: 64 }).primaryKey(),
  type: varchar('type', { length: 64 }).notNull(),
  severity: varchar('severity', { length: 32 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  isRead: boolean('is_read').default(false),
  studentId: varchar('student_id', { length: 64 }),
  busId: varchar('bus_id', { length: 64 }),
})
