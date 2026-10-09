 # RakshaTrack 🛡️🚌
### Next-Generation University Transport Safety, Attendance & Anti-Proxy Verification Platform

[![TanStack Start](https://img.shields.io/badge/TanStack_Start-Full--Stack_React-blue?style=flat-square)](https://tanstack.com/start)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat-square)](https://clerk.com/)
[![Neon Database](https://img.shields.io/badge/Database-Neon_Serverless_Postgres-00E599?style=flat-square)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-C5F74F?style=flat-square)](https://orm.drizzle.team/)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38BDF8?style=flat-square)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet_GIS-199900?style=flat-square)](https://leafletjs.com/)

**RakshaTrack** is an enterprise-grade university transport safety and smart attendance platform. Engineered specifically to tackle "buddy punching" (proxy attendance) and student transit safety, RakshaTrack pairs vehicle-mounted RFID check-ins with real-time smartphone spatial cross-verification. 

The application is built as a **complete, hardware-independent, software-only prototype**. Transport administrators, faculty, and evaluators can interact with an interactive hardware simulator that emulates RFID card taps, live GPS telemetry, vehicle drift, and proxy fraud scenarios without needing physical microcontrollers or sensors.

---

## 📑 Table of Contents

- [Executive Summary & Core Philosophy](#-executive-summary--core-philosophy)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [The Anti-Proxy Verification Engine (Haversine Formula)](#-the-anti-proxy-verification-engine)
- [Interactive Hardware Simulator](#-interactive-hardware-simulator)
- [User Roles & Portal Experiences](#-user-roles--portal-experiences)
- [Database Schema & Data Models](#-database-schema--data-models)
- [Codebase & Directory Structure](#-codebase--directory-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Live Demo & Presentation Script](#-live-demo--presentation-script)
- [Hardware Roadmap (Production Transition)](#-hardware-roadmap-production-transition)
- [Design System & Engineering Standards](#-design-system--engineering-standards)

---

## 🛡️ Executive Summary & Core Philosophy

### The Problem
Traditional university bus systems face two chronic vulnerabilities:
1. **Proxy Attendance ("Buddy Punching")**: Students give their physical RFID card to a commuter friend while they skip class or sleep in, generating fraudulent attendance records.
2. **Curbside Safety Hazard (The "Block" Dilemma)**: Existing anti-fraud systems that lock or reject cards leave genuine students stranded at remote bus stops at 6:00 AM or late in the evening if their phone battery dies or their cellular signal drops.

### The Solution: "Flag, Not Block"
RakshaTrack solves this dilemma with our core engineering tenet: **"FLAG, NOT BLOCK"**.
- When an RFID card is tapped on an onboard reader, the student is **always permitted to board**. Student safety is paramount; no student is ever stranded at the curb.
- Simultaneously, the system executes an automated spatial audit comparing the bus reader's GPS coordinates with the student's mobile device GPS telemetry using the great-circle Haversine formula.
- If a spatial mismatch (>150m) or proxy pattern is detected, the event is immediately flagged with high-confidence cryptographic and spatial evidence into the **Administrative Verification Queue** for disciplinary review, and an alert is broadcast to guardians.

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer ["Client & Interactive Portals"]
        AdminUI["Command Center Dashboard\n(/, /attendance, /fleet, /reviews)"]
        SimulatorUI["Hardware Simulation Console\n(/simulator)"]
        StudentUI["Student & Guardian Portals\n(/student-portal, /guardian-portal)"]
    end

    subgraph AuthLayer ["Identity & Access Management"]
        ClerkAuth["Clerk Authentication\n(@clerk/tanstack-react-start)\nRole-Based Access Control"]
    end

    subgraph CoreEngine ["Full-Stack Engine (TanStack Start)"]
        Router["Type-Safe Router & SSR\n(TanStack Router)"]
        DemoStore["Reactive Simulator Store\n(State, GPS Stepper & Jitter)"]
        HaversineAudit["Spatial Verification Engine\n(Haversine Distance & Bearing)"]
    end

    subgraph DataLayer ["Data Persistence"]
        Drizzle["Drizzle ORM"]
        NeonDB[("Neon Database\nServerless PostgreSQL")]
    end

    subgraph PhysicalMap ["Geospatial & Visualization"]
        Leaflet["Leaflet GIS Telemetry Engine\n(Route Poly-lines & Vehicle Markers)"]
    end

    SimulatorUI -->|Emulates RFID Tap & Scenarios| DemoStore
    SimulatorUI -->|Bus Step Loop| DemoStore
    DemoStore -->|Coordinates & Routes| Leaflet
    DemoStore -->|Trigger Audit| HaversineAudit

    HaversineAudit -->|Flagged / Verified Status| DemoStore
    DemoStore -->|Syncs Telemetry| AdminUI
    DemoStore -->|Syncs Alerts| StudentUI

    AdminUI <-->|Session & RBAC| ClerkAuth
    StudentUI <-->|Session & RBAC| ClerkAuth

    DemoStore -.->|Optional Live Persistence| Drizzle
    Drizzle <--> NeonDB
    Router --> ClientLayer
```

---

## 🌟 Key Features

### 1. 🎛️ Mission Control Dashboard (`/`)
- **Fleet-Wide Telemetry**: Live operational metrics (total active buses, in-transit students, flagged proxy taps, open SOS alerts).
- **Embedded Live Map Preview**: Real-time vehicle positions, active routes, current passenger capacities, and live speedometer telemetry.
- **Recent Transit Stream**: Real-time ticker of boarding and alighting events with instant status badges.
- **Priority Alerts Banner**: High-visibility warning bar for emergency stops, capacity overloads, or location anomalies.

### 2. 🧪 Software-Only Hardware Simulator (`/simulator`)
- **Interactive RFID Card Tap Engine**: Select any enrolled student, assign them to a bus, pick a stop, and choose the boarding state (*Boarding* or *Alighting*).
- **Three Core Verification Scenarios**:
  - **Scenario A (Normal)**: Student phone within 15–45m of the bus reader $\rightarrow$ `VERIFIED`.
  - **Scenario B (Proxy Fraud)**: Student phone >1,000m away (e.g. at the dorms) $\rightarrow$ `FLAGGED`.
  - **Scenario C (Dead Phone / No GPS)**: No mobile telemetry detected $\rightarrow$ `UNVERIFIED` (logged without blocking).
- **Real-Time Fleet Motion Controller**: Toggle continuous route progression with speed multipliers (**1x**, **2x**, **5x**) and simulated GPS jitter.

### 3. 🗺️ Live Fleet Tracking Map (`/fleet`)
- **Leaflet GIS Integration**: Interactive maps detailing all university transit corridors.
- **Detailed Bus Telemetry Cards**: Inspect driver names, conductor contact info, passenger counts, vehicle registration plates, and onboard device heartbeats.
- **Dynamic Bus Capacity Visualizer**: Progress bars indicating seating capacity with automatic warnings when overloaded.

### 4. 📋 Live Attendance Ledger (`/attendance`)
- **Complete Transit History**: Tabular view of every swipe event across the network with millisecond timestamps.
- **Filter & Search Controls**: Filter by verification status (`Verified`, `Flagged`, `Unverified`), route, bus number, or student registration ID.
- **Tap Evidence Drawer**: Click any record to inspect exact GPS lat/lng coordinates, calculated distance delta, and student enrollment metadata.

### 5. 🔍 Anomaly & Fraud Audit Queue (`/reviews`)
- **Administrative Adjudication Center**: Dedicated interface for transport supervisors to inspect flagged "buddy punching" taps.
- **Haversine Distance Breakdown**: Visual distance gauge displaying meters between student device and bus reader.
- **Audit Actions**: Supervisors can **Verify & Dismiss**, **Confirm Fraud**, or **Add Investigation Notes** directly into the permanent record.

### 6. 🚨 Safety & Emergency Dispatch (`/alerts`)
- **Incident Feed**: Immediate triage for capacity overload warnings, SOS alerts, and geofence breaches.
- **One-Click Read/Resolve**: Mark alerts as acknowledged or resolved with timestamps.

### 7. 🎓 Student & Guardian Portals
- **Student Portal (`/student-portal`)**: Digital NFC/RFID transit pass, current assigned route, live bus ETA, and one-tap route change requests.
- **Guardian Portal (`/guardian-portal`)**: Peace-of-mind dashboard for parents displaying timestamped boarding/alighting events and live bus location for their child.

### 8. ⚙️ Administrative Registries & Settings
- **Students Registry (`/students`)**: Directory of enrolled students, RFID card UID bindings, route assignments, and transit eligibility toggles.
- **Buses Registry (`/buses`)**: Bus inventory, license plates, seating limits, driver assignments, and IoT device statuses.
- **Routes & Waypoints (`/routes`)**: Multi-stop route configurations, morning/evening schedules, and campus arrival estimates.
- **Route Requests (`/route-requests`)**: Student requests for route/stop transfers with approve/reject workflows.
- **System Settings (`/settings`)**: Configure proximity thresholds (default: 150m), simulation loop rates, and audit policies.

---

## 📐 The Anti-Proxy Verification Engine

The anti-proxy verification engine prevents fraudulent attendance by calculating the spatial distance between the bus's reader GPS and the student's smartphone GPS at the exact second the RFID card is tapped.

### The Haversine Formula
The system computes the great-circle distance over the Earth's spherical surface:

$$\Delta\phi = \phi_2 - \phi_1 \quad (\text{latitude difference in radians})$$
$$\Delta\lambda = \lambda_2 - \lambda_1 \quad (\text{longitude difference in radians})$$
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$c = 2 \cdot \operatorname{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$d = R \cdot c$$

*Where $R = 6,371,000\text{ m}$ (mean Earth radius).*

```typescript
// Located in: src/lib/simulation/gps-verification.ts
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth radius in meters
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
```

### Verification Triage Matrix

| Verification Status | Calculated Distance ($d$) | Action Taken | Operational Rationale |
| :--- | :--- | :--- | :--- |
| **`verified`** (Green) | $d \le 150\text{ m}$ | Tap Approved $\cdot$ Attendance Logged | Student phone confirmed adjacent to bus reader. High confidence. |
| **`flagged`** (Red) | $d > 150\text{ m}$ | Tap Approved $\cdot$ Dispatched to Audit | High probability of proxy attendance. Logged without stranding student. |
| **`unverified`** (Amber) | Mobile Telemetry Offline | Tap Approved $\cdot$ Logged as Offline | Student phone battery dead or permissions denied. Flagged for passive logging. |

---

## 🎮 Interactive Hardware Simulator

RakshaTrack includes a built-in simulation engine ([`src/lib/simulation/demo-store.ts`](file:///d:/rak/src/lib/simulation/demo-store.ts)) that replaces the need for physical hardware during presentations and evaluations:

1. **State Persistence**: Simulation state (buses, taps, verifications, alerts) is stored in a reactive in-memory singleton backed by `localStorage`, allowing smooth tab navigation without data loss.
2. **GPS Stepper**: Advances buses incrementally along waypoints with realistic GPS micro-jitter ($\pm 0.0004^\circ$ lat/lng).
3. **Simulation Speed Controls**: Toggle playback at **1x** (2.4s interval), **2x** (1.2s interval), or **5x** (0.8s interval).
4. **Instant Event Dispatcher**: Triggers full end-to-end updates across all tabs, charts, and maps within milliseconds.

---

## 👥 User Roles & Portal Experiences

RakshaTrack supports three distinct role views accessible via the navigation bar:

1. **Transport Administrator (`admin`)**:
   - Access to full mission control, live map, attendance logs, verification queue, fleet management, and system thresholds.
2. **Student Commuter (`student`)**:
   - Access to digital RFID transit pass, assigned route details, live bus tracker with real-time ETA, and route transfer requests.
3. **Guardian / Parent (`guardian`)**:
   - Access to the safety feed with real-time notifications whenever their child boards or alights, including timestamp, bus number, and exact stop location.

---

## 🗄️ Database Schema & Data Models

The persistence layer is defined via [Drizzle ORM](https://orm.drizzle.team/) for PostgreSQL ([`src/lib/db/schema.ts`](file:///d:/rak/src/lib/db/schema.ts)):

```mermaid
erDiagram
    USERS ||--o{ STUDENTS : "belongs to"
    ROUTES ||--|{ ROUTE_STOPS : "has stops"
    ROUTES ||--o{ BUSES : "assigned route"
    BUSES ||--o{ STUDENTS : "assigned bus"
    STUDENTS ||--o{ TAP_EVENTS : "swipes card"
    BUSES ||--o{ TAP_EVENTS : "records tap"
    TAP_EVENTS ||--|| VERIFICATION_RESULTS : "audited by"
    STUDENTS ||--o{ ROUTE_CHANGE_REQUESTS : "submits"
    SYSTEM_ALERTS }o--|| BUSES : "relates to"
```

### Table Definitions
- `users`: User identity and RBAC role mapping (linked with Clerk `clerk_id`).
- `routes`: Transit lines (e.g., North Express, Metro Feeder) with color codes and route durations.
- `route_stops`: Sequential geographic stops with coordinates and scheduled arrival times.
- `buses`: Fleet vehicles with capacity, driver credentials, live coordinates, and heartbeat timestamps.
- `students`: Enrolled students with registration IDs, linked RFID card UIDs, assigned routes, and boarding states.
- `tap_events`: Complete log of every RFID swipe (timestamp, stop, event type, simulated flag).
- `verification_results`: Spatial audit evidence containing computed distance, bus coordinates, phone coordinates, and review decisions.
- `route_change_requests`: Formal student transfer petitions with approval workflows.
- `system_alerts`: High-priority system dispatches (overloads, SOS triggers, fraud flags).

---

## 📁 Codebase & Directory Structure

```text
rak/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx         # Unified dashboard shell
│   │   │   ├── Sidebar.tsx           # Route navigation & role switchers
│   │   │   ├── TopBar.tsx            # Live alerts, user profile & Clerk integration
│   │   │   └── DemoModeBanner.tsx    # Live simulation status banner
│   │   ├── map/
│   │   │   └── FleetMap.tsx          # Leaflet GIS telemetry visualizer
│   │   ├── Footer.tsx                # Status and build info
│   │   ├── Header.tsx                # Context header
│   │   └── ThemeToggle.tsx           # Light / Dark mode toggle
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts             # Neon Serverless Postgres client
│   │   │   └── schema.ts             # Drizzle ORM PostgreSQL relational schema
│   │   ├── simulation/
│   │   │   ├── demo-store.ts         # In-memory reactive simulation state store
│   │   │   ├── gps-verification.ts   # Haversine distance & verification algorithm
│   │   │   ├── seed-data.ts          # Realistic campus routes, students & buses
│   │   │   └── use-demo-store.ts     # React hook for subscribed simulation state
│   │   ├── types.ts                  # Comprehensive TypeScript data interfaces
│   │   └── utils.ts                  # Date formatters, classnames & helpers
│   ├── routes/
│   │   ├── __root.tsx                # Root layout, Clerk provider & shell
│   │   ├── index.tsx                 # Mission Control Dashboard
│   │   ├── simulator.tsx             # Interactive Hardware Simulation Console
│   │   ├── attendance.tsx            # Real-Time RFID Attendance Ledger
│   │   ├── fleet.tsx                 # Live GPS Fleet Tracking Map
│   │   ├── reviews.tsx               # Fraud & Anomaly Verification Audit Queue
│   │   ├── alerts.tsx                # Incident & Emergency Dispatch Center
│   │   ├── students.tsx              # Student Directory & RFID Card Binding
│   │   ├── buses.tsx                 # Bus Fleet Registry & Capacity Tracker
│   │   ├── routes.tsx                # Campus Route & Stop Sequence Registry
│   │   ├── student-portal.tsx        # Student Digital Bus Pass & Self-Checkin
│   │   ├── guardian-portal.tsx       # Guardian Live Transit & Safety Feed
│   │   ├── route-requests.tsx        # Route Change & Transfer Requests
│   │   ├── settings.tsx              # Proximity Thresholds & System Policies
│   │   ├── sign-in.$.tsx             # Clerk Sign-In route
│   │   └── sign-up.$.tsx             # Clerk Sign-Up route
│   ├── routeTree.gen.ts              # Generated TanStack Route Tree
│   ├── router.tsx                    # TanStack Router configuration
│   ├── start.ts                      # TanStack Start SSR entrypoint
│   └── styles.css                    # Tailwind CSS v4 & OKLCH light-theme token system
├── drizzle.config.ts                 # Drizzle Kit migration configuration
├── package.json                      # Dependencies and run scripts
├── tsconfig.json                     # TypeScript compilation settings
├── vite.config.ts                    # Vite build & TanStack Start plugin setup
└── README.md                         # Project documentation
```

---

## 💻 Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | [TanStack Start](https://tanstack.com/start) (React 19) | Modern full-stack framework with type-safe routing, SSR, and client transitions. |
| **Authentication** | [Clerk](https://clerk.com/) | Secure identity management with role-based components and user buttons. |
| **Database** | [Neon Database](https://neon.tech/) | Serverless PostgreSQL with auto-scaling and connection pooling. |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) | Type-safe SQL schema definitions with near-zero runtime overhead. |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Vanilla CSS | Modern utility classes paired with custom OKLCH perceptual tokens. |
| **Maps & GIS** | [Leaflet](https://leafletjs.com/) | Lightweight, hardware-accelerated interactive map rendering. |
| **Charts** | [Recharts](https://recharts.org/) | Declarative charting for fleet occupancies and transit metrics. |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent icon set. |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) | Full-stack end-to-end type safety across client, server, and schema. |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or later)
- `npm` or `pnpm`
- *(Optional)* A [Clerk](https://clerk.com/) account for live authentication.
- *(Optional)* A [Neon](https://neon.tech/) Postgres database for persistent cloud storage.

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/rakshatrack.git
cd rakshatrack
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Mode: When true, in-memory reactive simulation is enabled (recommended for demos)
VITE_DEMO_MODE=true

# Database: Neon PostgreSQL Connection String (Optional)
DATABASE_URL=postgresql://neondb_owner:your_password@ep-divine-field-b398o39p-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# Authentication: Clerk Keys (Optional)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Transport Proximity Threshold (Meters)
VITE_PROXIMITY_THRESHOLD_METERS=150
```

### 3. Database Push (Optional)
If using a live Neon Postgres instance, push the schema:
```bash
npx drizzle-kit push
```

### 4. Start the Development Server
```bash
npm run dev
```
The application will launch on:
```
http://localhost:3000
```

---

## 🎬 Live Demo & Presentation Script

Follow this 3-minute presentation script during evaluations to showcase all major capabilities:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        3-MINUTE DEMO WORKFLOW                          │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Open Mission Control (/)                                            │
│    • Highlight the operational KPIs and live fleet telemetry.          │
│    • Point out the light-theme OKLCH styling.                          │
│                                                                        │
│ 2. Navigate to Hardware Simulator (/simulator)                         │
│    • Click "Run Simulation Loop" and set speed to 2x.                 │
│    • Observe buses stepping along their routes on the live map.        │
│                                                                        │
│ 3. Demonstrate Verification Scenarios:                                 │
│    • Scenario A: Select Student -> Tap "Board Bus" (Scenario A).       │
│      -> Result: Verified (Green). Student phone near bus.              │
│    • Scenario B: Select Student -> Tap "Board Bus" (Scenario B).       │
│      -> Result: Flagged (Red). Phone >1000m away!                      │
│      -> Highlight: Student still boards ("Flag, Not Block" safety rule)│
│                                                                        │
│ 4. Administrative Triage (/reviews)                                    │
│    • Open the Verification Queue.                                      │
│    • Inspect the flagged proxy tap with exact Haversine distance delta.│
│    • Enter admin notes and click "Confirm Proxy Incident".            │
│                                                                        │
│ 5. Guardian Experience (/guardian-portal)                              │
│    • Switch role to Guardian in the sidebar.                           │
│    • Show the real-time notification feed confirming safe transit.     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 Hardware Roadmap (Production Transition)

While RakshaTrack operates as a software prototype for presentations, the architecture maps directly to physical IoT hardware:

```mermaid
flowchart LR
    subgraph OnboardUnit ["Physical Vehicle Unit (Bus)"]
        RFID["RC522 / PN532\nRFID Reader (SPI)"] --> MCU["ESP32 / Raspberry Pi Pico W"]
        GPS["NEO-6M / NEO-M8N\nGPS GNSS Module (UART)"] --> MCU
        MCU --> Cellular["SIM7600 4G LTE /\nCampus Wi-Fi"]
    end

    subgraph StudentApp ["Student Mobile Device"]
        PhoneGPS["HTML5 Geolocation API /\nNative CoreLocation"] --> PhoneApp["RakshaTrack Progressive Web App"]
    end

    Cellular -->|MQTT / HTTPS POST /api/taps| Server["RakshaTrack Cloud Backend"]
    PhoneApp -->|Periodic Telemetry Stream| Server
```

- **RFID Reader**: ESP32 microcontroller with an MFRC522 or PN532 RFID sensor connected via SPI to read 13.56MHz Mifare Classic / DESFire student ID cards.
- **GPS Receiver**: u-blox NEO-6M or NEO-M8N GNSS module communicating over UART providing NMEA sentences for sub-2.5m CEP accuracy.
- **Telemetry Payload**: The ESP32 formats and posts the exact JSON payload already modeled in `TapEvent`:
  ```json
  {
    "cardUid": "A1B2C3D4",
    "busId": "bus-101",
    "type": "boarding",
    "timestamp": "2026-10-09T08:15:00Z",
    "lat": 28.4595,
    "lng": 77.0266
  }
  ```

---

## 🎨 Design System & Engineering Standards

RakshaTrack is built adhering to modern **Design Engineering** standards:

- **Perceptual OKLCH Color Space**: All surfaces and borders use OKLCH color tokens (`--color-surface-base`, `--color-surface-elevated`, `--color-brand-primary`), preventing the harshness of generic Tailwind palettes while maintaining crisp light-theme contrast.
- **Tabular Numerics**: Live data points, speedometers, timestamps, and registration IDs use `tabular-nums` and monospace styling to prevent layout shifts during live ticker updates.
- **Purposeful Micro-Interactions**: Hover, focus, and active states use scoped transitions (`transition-colors duration-150 ease-out`) rather than blanket `transition-all` declarations.
- **Accessible Contrast**: Meets WCAG AA standards across all text elements, status badges, and interactive controls.

---

## 📄 License & Academic Attribution

Developed as a modern university transport attendance and student safety platform.  
Designed and built for university technical demonstrations and transit evaluations.
