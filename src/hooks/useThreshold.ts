import { useState, useEffect } from 'react'

export function useThreshold() {
  const [threshold, setThreshold] = useState<number>(() => {
    if (typeof window === 'undefined') return 150
    return Number(localStorage.getItem('raksha_proximity_threshold') || 150)
  })

  useEffect(() => {
    const handleUpdate = () => {
      setThreshold(Number(localStorage.getItem('raksha_proximity_threshold') || 150))
    }
    window.addEventListener('raksha_threshold_updated', handleUpdate)
    return () => window.removeEventListener('raksha_threshold_updated', handleUpdate)
  }, [])

  return threshold
}
