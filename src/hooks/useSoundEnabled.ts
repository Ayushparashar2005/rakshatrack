import { useState, useEffect } from 'react'

export function useSoundEnabled() {
  const [soundEnabled, setSoundEnabled] = useState(false)

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    // Check local storage
    const stored = localStorage.getItem('rakshatrack_sound_enabled')
    if (stored !== null) {
      // Respect user setting over reduced motion if they explicitly set it, but ideally we default to off
      setSoundEnabled(stored === 'true')
    } else {
      // Default to off
      setSoundEnabled(false)
    }
  }, [])

  const toggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled)
    localStorage.setItem('rakshatrack_sound_enabled', enabled.toString())
  }

  return { soundEnabled, toggleSound }
}
