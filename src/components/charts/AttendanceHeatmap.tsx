import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface HeatmapData {
  date: string
  count: number
}

interface AttendanceHeatmapProps {
  data: HeatmapData[]
}

export const AttendanceHeatmap: React.FC<AttendanceHeatmapProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = 150
    const margin = { top: 20, right: 20, bottom: 20, left: 40 }
    
    // Clear previous
    d3.select(container).selectAll('*').remove()

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('font-family', 'monospace')

    const cellSize = 14
    const cellPadding = 3
    
    // Group by week
    const parseDate = d3.timeParse('%Y-%m-%d')
    
    // We assume data is sorted by date ascending
    const processedData = data.map(d => {
      const parsed = parseDate(d.date)
      return {
        ...d,
        parsedDate: parsed || new Date(),
        dayOfWeek: parsed ? parsed.getDay() : 0
      }
    })

    const startDate = processedData[0]?.parsedDate || new Date()
    
    // Determine week index (columns)
    processedData.forEach(d => {
      d.weekIndex = d3.timeWeek.count(d3.timeWeek(startDate), d.parsedDate)
    })

    const colorScale = d3.scaleThreshold<number, string>()
      .domain([1, 3, 6, 9])
      .range(['#1e293b', '#064e3b', '#047857', '#10b981', '#34d399']) // slate-800, emerald-900...

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // Draw cells
    const cells = g.selectAll('rect')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('x', d => (d.weekIndex || 0) * (cellSize + cellPadding))
      .attr('y', d => d.dayOfWeek * (cellSize + cellPadding))
      .attr('rx', 3)
      .style('fill', '#0f172a') // initial state (empty)
      .style('stroke', 'rgba(255,255,255,0.05)')

    // Tooltip
    const tooltip = d3.select(container)
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', '#0f172a')
      .style('color', '#fff')
      .style('padding', '6px 10px')
      .style('border-radius', '6px')
      .style('font-size', '11px')
      .style('border', '1px solid #334155')
      .style('pointer-events', 'none')
      .style('z-index', 100)

    cells
      .on('mouseover', function(event, d) {
        d3.select(this).style('stroke', '#34d399')
        tooltip
          .style('visibility', 'visible')
          .html(`<strong>${d.date}</strong><br/>${d.count} taps`)
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 40) + 'px')
          .style('left', (event.pageX + 15) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this).style('stroke', 'rgba(255,255,255,0.05)')
        tooltip.style('visibility', 'hidden')
      })

    // Animate color fill
    cells.transition()
      .duration(800)
      .delay((d, i) => i * 15) // sweep left to right
      .ease(d3.easeCubicOut)
      .style('fill', d => d.count === 0 ? '#0f172a' : colorScale(d.count))

    // Day labels
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    g.selectAll('.day-label')
      .data(days)
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', -25)
      .attr('y', (d, i) => i * (cellSize + cellPadding) + 10)
      .style('font-size', '9px')
      .style('fill', '#64748b')

  }, [data])

  return (
    <div className="relative w-full">
      <div ref={containerRef} className="w-full h-[150px]" />
    </div>
  )
}
