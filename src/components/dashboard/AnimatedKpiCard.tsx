import React, { useLayoutEffect, useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

interface AnimatedKpiCardProps {
  title: string
  value: number
  subtitle: string
  icon: React.ReactNode
  index: number
  isAlert?: boolean
  linkTo?: string
}

export const AnimatedKpiCard: React.FC<AnimatedKpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  index,
  isAlert,
  linkTo
}) => {
  const numberRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [prevValue, setPrevValue] = useState(value)

  // 3A: GSAP Counter Animation on Mount
  useLayoutEffect(() => {
    if (numberRef.current) {
      gsap.fromTo(numberRef.current,
        { innerText: 0 },
        {
          innerText: value,
          snap: { innerText: 1 },
          duration: 1.2,
          delay: index * 0.08,
          ease: 'power3.out',
        }
      )
    }
  }, []) // Empty dep array for mount only

  // 3C: Live KPI Flash on Update
  useEffect(() => {
    if (value !== prevValue && cardRef.current && numberRef.current) {
      // Tick up
      gsap.to(numberRef.current, {
        innerText: value,
        snap: { innerText: 1 },
        duration: 0.4,
        ease: 'power2.out'
      })

      // Flash green glow border
      const glowColor = isAlert ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'
      
      gsap.fromTo(cardRef.current,
        { boxShadow: `0 0 0px ${glowColor}`, borderColor: glowColor },
        { 
          boxShadow: `0 0 20px 0px rgba(0,0,0,0)`, 
          borderColor: 'var(--color-border-subtle)',
          duration: 1, 
          ease: 'power2.out',
          clearProps: 'all'
        }
      )
      
      setPrevValue(value)
    }
  }, [value, isAlert, prevValue])

  // 3B: Framer Motion Card Entrance (y: 20 -> 0)
  const content = (
    <motion.div
      ref={cardRef}
      className={`stat-card p-4 h-full ${
        isAlert 
          ? 'hover:bg-[--color-surface-overlay] border-amber-500/30 group transition-colors' 
          : ''
      }`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[11px] font-medium uppercase tracking-widest ${isAlert ? 'text-amber-500' : 'text-[--color-text-secondary]'}`}>
          {title}
        </span>
        {icon}
      </div>
      <div 
        ref={numberRef}
        className={`text-3xl font-bold tabular-nums tracking-tight ${isAlert ? 'text-amber-500' : 'text-[--color-text-primary]'}`}
      >
        {value}
      </div>
      <div className={`text-xs mt-1 ${isAlert ? 'text-amber-500/80 underline' : 'text-[--color-text-secondary]'}`}>
        {subtitle}
      </div>
    </motion.div>
  )

  if (linkTo) {
    // If we use Link from tanstack-router, it needs to be injected from the parent or just use a standard a-tag for now.
    // We will let the parent pass it down or we just assume Link is handled outside.
    // Actually, for React Router or Tanstack Router, we shouldn't assume here. 
    // We'll let the parent wrap the card if it needs to be a link.
  }

  return content
}
