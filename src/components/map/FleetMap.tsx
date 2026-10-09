import React, { useEffect, useRef, useState } from 'react'
import type { Bus, Route, RouteStop } from '@/lib/types'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import { Play, Pause, RotateCcw, Navigation, Layers, ShieldCheck, MapPin, Gauge } from 'lucide-react'

interface FleetMapProps {
  selectedBusId?: string | null
  onSelectBus?: (busId: string) => void
  height?: string
  showControls?: boolean
}

export const FleetMap: React.FC<FleetMapProps> = ({
  selectedBusId = null,
  onSelectBus,
  height = '540px',
  showControls = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const busMarkersRef = useRef<Record<string, any>>({})
  const routePolylinesRef = useRef<any[]>([])

  const { buses, routes, isSimulationRunning, toggleSimulation, resetToDefault } = useDemoStore()
  const [mapReady, setMapReady] = useState(false)
  const [activeLayer, setActiveLayer] = useState<'all' | 'route-a' | 'route-b' | 'route-c'>('all')

  // Initialize Leaflet client-side only
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return

    let isMounted = true

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return

      // Cleanup existing map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      // Campus center: SGT University Budhera
      const map = L.map(mapContainerRef.current, {
        center: [28.4736, 76.965],
        zoom: 12,
        zoomControl: false,
      })

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // High-contrast OpenStreetMap Dark Basemap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | RakshaTrack Simulation',
        maxZoom: 18,
      }).addTo(map)

      mapInstanceRef.current = map

      // Draw Route Polylines and Stop Markers
      routes.forEach((route) => {
        const latLngs = route.stops.map((stop) => [stop.lat, stop.lng] as [number, number])
        
        // Polyline
        const polyline = L.polyline(latLngs, {
          color: route.color,
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
        }).addTo(map)

        routePolylinesRef.current.push(polyline)

        // Stop circles
        route.stops.forEach((stop, idx) => {
          const isCampus = idx === route.stops.length - 1
          const stopIcon = L.divIcon({
            className: 'custom-stop-marker',
            html: `
              <div style="
                background: ${isCampus ? '#10B981' : '#0F172A'};
                border: 2px solid ${route.color};
                width: ${isCampus ? '18px' : '12px'};
                height: ${isCampus ? '18px' : '12px'};
                border-radius: 50%;
                box-shadow: 0 0 8px ${route.color};
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 8px;
                font-weight: bold;
              ">${isCampus ? '★' : ''}</div>
            `,
            iconSize: [isCampus ? 18 : 12, isCampus ? 18 : 12],
            iconAnchor: [isCampus ? 9 : 6, isCampus ? 9 : 6],
          })

          L.marker([stop.lat, stop.lng], { icon: stopIcon })
            .bindTooltip(`<b>${stop.stopName}</b><br/><span style="color:#94a3b8">${route.name} (${stop.expectedMorningTime})</span>`, {
              direction: 'top',
              offset: [0, -6],
            })
            .addTo(map)
        })
      })

      // Add Campus Main Hub Marker
      const campusIcon = L.divIcon({
        className: 'campus-hub-marker',
        html: `
          <div style="
            background: rgba(16, 185, 129, 0.2);
            border: 2px solid #10B981;
            padding: 4px 8px;
            border-radius: 9999px;
            color: #10B981;
            font-size: 10px;
            font-weight: 700;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
            transform: translate(-50%, -100%);
          ">
            <span>🏛️ SGT University Main Campus</span>
          </div>
        `,
        iconSize: [0, 0],
      })
      L.marker([28.4736, 76.9249], { icon: campusIcon }).addTo(map)

      setMapReady(true)
    })

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [routes])

  // Update Bus Markers whenever buses positions update
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current
      if (!map) return

      buses.forEach((bus) => {
        const route = routes.find((r) => r.id === bus.currentRouteId)
        const isSelected = selectedBusId === bus.id
        const routeColor = route?.color || '#10B981'

        const busHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <!-- Radar ring if moving -->
            <div style="
              position: absolute;
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: ${routeColor}22;
              border: 1px solid ${routeColor};
              animation: radar-pulse 2s infinite;
              top: -5px;
            "></div>

            <!-- Bus badge -->
            <div style="
              background: #0f172a;
              border: 2px solid ${isSelected ? '#38BDF8' : routeColor};
              color: #f8fafc;
              padding: 3px 7px;
              border-radius: 6px;
              font-family: monospace;
              font-size: 10px;
              font-weight: bold;
              display: flex;
              align-items: center;
              gap: 4px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.8);
              z-index: 10;
              transition: transform 0.2s;
              ${isSelected ? 'transform: scale(1.15); border-color: #38bdf8;' : ''}
            ">
              <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10B981;"></span>
              <span>${bus.busNumber}</span>
            </div>

            <!-- Occupancy meter pill -->
            <div style="
              margin-top: 2px;
              background: #020617;
              border: 1px solid rgba(255,255,255,0.15);
              border-radius: 9999px;
              padding: 1px 5px;
              font-size: 8px;
              color: #94a3b8;
              font-family: monospace;
              white-space: nowrap;
            ">
              ${bus.currentOccupancy}/${bus.capacity} seats
            </div>
          </div>
        `

        const customIcon = L.divIcon({
          className: `bus-marker-${bus.id}`,
          html: busHtml,
          iconSize: [60, 40],
          iconAnchor: [30, 20],
        })

        if (busMarkersRef.current[bus.id]) {
          // Smoothly update existing marker position
          busMarkersRef.current[bus.id].setLatLng([bus.currentLat, bus.currentLng])
          busMarkersRef.current[bus.id].setIcon(customIcon)
        } else {
          // Create new marker
          const marker = L.marker([bus.currentLat, bus.currentLng], { icon: customIcon }).addTo(map)
          
          marker.on('click', () => {
            if (onSelectBus) onSelectBus(bus.id)
          })

          busMarkersRef.current[bus.id] = marker
        }

        // Popup content
        const popupContent = `
          <div style="padding: 10px 14px; min-width: 200px; font-size: 12px; background: #0f172a; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px; margin-bottom: 6px;">
              <span style="font-weight: bold; color: #fff; font-size: 13px;">${bus.busNumber}</span>
              <span style="color: #10B981; font-size: 10px; font-weight: 600; text-transform: uppercase;">● SIMULATED GPS</span>
            </div>
            <div style="color: #94a3b8; margin-bottom: 4px;">Route: <b style="color: #e2e8f0;">${route?.name || 'SGT Route'}</b></div>
            <div style="color: #94a3b8; margin-bottom: 4px;">Plate: <span style="color: #e2e8f0; font-family: monospace;">${bus.plateNumber}</span></div>
            <div style="color: #94a3b8; margin-bottom: 4px;">Occupancy: <b style="color: #10B981;">${bus.currentOccupancy}</b> / ${bus.capacity} (${Math.round((bus.currentOccupancy / bus.capacity) * 100)}%)</div>
            <div style="color: #94a3b8; margin-bottom: 4px;">Speed: <span style="color: #e2e8f0; font-family: monospace;">${bus.speed} km/h</span></div>
            <div style="color: #94a3b8;">Driver: <span style="color: #e2e8f0;">${bus.driverName}</span></div>
          </div>
        `
        busMarkersRef.current[bus.id].bindPopup(popupContent)
      })
    })
  }, [buses, routes, selectedBusId, mapReady, onSelectBus])

  // Center on selected bus
  const zoomToBus = (busId: string) => {
    const bus = buses.find((b) => b.id === busId)
    if (bus && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([bus.currentLat, bus.currentLng], 14, { duration: 1.2 })
      if (onSelectBus) onSelectBus(bus.id)
    }
  }

  const zoomToCampus = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([28.4736, 76.9249], 14, { duration: 1.2 })
    }
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#090d16] shadow-xl">
      {/* Map Header Overlay */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Top Left: Fleet Indicators */}
          <div className="flex items-center gap-2 pointer-events-auto bg-[#0d121f]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 shadow-lg">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-200">Live Campus Fleet</span>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded font-medium">
              SIMULATED TELEMETRY
            </span>
          </div>

          {/* Top Right: Map Controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-[#0d121f]/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-lg">
            <button
              onClick={() => toggleSimulation()}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                isSimulationRunning
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isSimulationRunning ? (
                <>
                  <Pause className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Pause Movement</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span>Move Buses</span>
                </>
              )}
            </button>

            <button
              onClick={zoomToCampus}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
              title="Focus on SGT Campus"
            >
              Campus HQ
            </button>
          </div>
        </div>
      )}

      {/* Map DOM Element */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />

      {/* Bottom Floating Bus Cards Selector */}
      {showControls && (
        <div className="absolute bottom-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto overflow-x-auto py-1 max-w-full">
            {buses.map((bus) => {
              const route = routes.find((r) => r.id === bus.currentRouteId)
              const isSelected = selectedBusId === bus.id
              return (
                <button
                  key={bus.id}
                  onClick={() => zoomToBus(bus.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all backdrop-blur-md ${
                    isSelected
                      ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/10'
                      : 'bg-[#0d121f]/85 border-slate-800 hover:bg-slate-800/90'
                  }`}
                >
                  <div
                    className="w-2 h-7 rounded-sm"
                    style={{ backgroundColor: route?.color || '#10B981' }}
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-100 font-mono flex items-center gap-1">
                      <span>{bus.busNumber}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({bus.speed} km/h)
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                      {bus.currentOccupancy}/{bus.capacity} seats • {bus.driverName.split(' ')[0]}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
