import React, { useEffect } from 'react'
import * as d3 from 'd3'
import * as L from 'leaflet'
import { useDemoStore } from '@/lib/simulation/use-demo-store'

interface VerificationOverlayProps {
  map: any // L.Map instance
}

export const VerificationOverlay: React.FC<VerificationOverlayProps> = ({ map }) => {
  const { lastProcessedTap, buses } = useDemoStore()

  useEffect(() => {
    if (!map || !lastProcessedTap) return

    const { verification, event } = lastProcessedTap
    
    // We only show visual if we have student coordinates
    if (!verification.studentLat || !verification.studentLng) return

    // Find current bus position
    const bus = buses.find(b => b.id === event.busId)
    if (!bus) return

    const isVerified = verification.status === 'verified'
    const color = isVerified ? '#10b981' : '#f59e0b' // emerald-500 : amber-500

    // Get leaflet overlay pane to append our SVG
    const overlayPane = d3.select(map.getPanes().overlayPane)
    
    // Create an SVG layer if it doesn't exist
    let svg = overlayPane.select<SVGSVGElement>('svg.d3-verification-overlay')
    if (svg.empty()) {
      svg = overlayPane.append('svg')
        .attr('class', 'd3-verification-overlay leaflet-zoom-hide')
        .style('position', 'absolute')
        .style('top', '0')
        .style('left', '0')
        .style('width', '100%')
        .style('height', '100%')
        .style('pointer-events', 'none')
    }

    const g = svg.append('g').attr('class', `verification-event-${event.id}`)

    // We need to convert LatLng to pixel coordinates
    const updatePositions = () => {
      if (!map) return

      const busPt = map.latLngToLayerPoint([bus.currentLat, bus.currentLng])
      const studentPt = map.latLngToLayerPoint([verification.studentLat, verification.studentLng])

      // Clear previous drawings in this group
      g.selectAll('*').remove()

      // 1. Draw 150m Threshold Circle around Bus
      // We calculate pixel radius by finding distance between bus center and a point 150m away
      const centerLatLng = L.latLng(bus.currentLat, bus.currentLng)
      // Approximate: 1 deg lat ~ 111km, so 150m is roughly 0.00135 degrees
      const edgeLatLng = L.latLng(bus.currentLat + 0.00135, bus.currentLng)
      const centerPt = map.latLngToLayerPoint(centerLatLng)
      const edgePt = map.latLngToLayerPoint(edgeLatLng)
      const pixelRadius = Math.max(15, Math.abs(edgePt.y - centerPt.y))

      g.append('circle')
        .attr('cx', busPt.x)
        .attr('cy', busPt.y)
        .attr('r', pixelRadius)
        .style('fill', color)
        .style('fill-opacity', 0.05)
        .style('stroke', color)
        .style('stroke-width', 1)
        .style('stroke-dasharray', '4,4')
        .style('opacity', 0)
        .transition().duration(600).style('opacity', 1)

      // 2. Draw Student Dot
      g.append('circle')
        .attr('cx', studentPt.x)
        .attr('cy', studentPt.y)
        .attr('r', 0)
        .style('fill', '#3b82f6') // blue-500
        .style('stroke', '#fff')
        .style('stroke-width', 2)
        .style('box-shadow', '0 0 10px #3b82f6')
        .transition().duration(600).ease(d3.easeElasticOut)
        .attr('r', 6)

      // 3. Draw connecting line with D3 line generator
      const lineGen = d3.line()([
        [busPt.x, busPt.y],
        [studentPt.x, studentPt.y]
      ])

      const path = g.append('path')
        .attr('d', lineGen)
        .style('fill', 'none')
        .style('stroke', color)
        .style('stroke-width', 2)
        .style('stroke-dasharray', '6,6')
        .style('opacity', 0.7)

      // Animate line drawing
      const length = path.node()?.getTotalLength() || 0
      path.attr('stroke-dasharray', `${length} ${length}`)
        .attr('stroke-dashoffset', length)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0)
        .on('end', () => {
          path.attr('stroke-dasharray', '6,6')
        })

      // 4. Draw distance label
      const midX = (busPt.x + studentPt.x) / 2
      const midY = (busPt.y + studentPt.y) / 2
      
      const labelGroup = g.append('g')
        .attr('transform', `translate(${midX}, ${midY - 10})`)
        .style('opacity', 0)

      labelGroup.append('rect')
        .attr('x', -24)
        .attr('y', -12)
        .attr('width', 48)
        .attr('height', 24)
        .attr('rx', 4)
        .style('fill', '#0f172a')
        .style('stroke', color)
        .style('stroke-width', 1)

      labelGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .style('fill', '#fff')
        .style('font-size', '10px')
        .style('font-family', 'monospace')
        .style('font-weight', 'bold')
        .text(`${verification.distanceMeters}m`)

      labelGroup.transition().delay(400).duration(400).style('opacity', 1)

      // Auto-cleanup after 5 seconds
      setTimeout(() => {
        g.transition().duration(800).style('opacity', 0).remove()
      }, 5000)
    }

    // Attach to map events to redraw on zoom/pan
    map.on('viewreset moveend', updatePositions)
    updatePositions()

    return () => {
      map.off('viewreset moveend', updatePositions)
      g.remove()
    }
  }, [map, lastProcessedTap])

  return null
}
