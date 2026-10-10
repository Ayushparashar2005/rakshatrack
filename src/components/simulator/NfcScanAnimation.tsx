import React from 'react'
import { motion } from 'framer-motion'
import { Radio } from 'lucide-react'

interface NfcScanAnimationProps {
  status: 'idle' | 'scanning' | 'verified' | 'flagged'
}

export const NfcScanAnimation: React.FC<NfcScanAnimationProps> = ({ status }) => {
  const isScanning = status === 'scanning'
  const isVerified = status === 'verified'
  const isFlagged = status === 'flagged'

  const baseColor = isFlagged 
    ? '#b45309' // amber-700
    : isVerified 
      ? '#059669' // emerald-600
      : '#10b981' // emerald-500

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Expanding Concentric Rings (Scanning) */}
      {isScanning && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-[1.5px]"
              style={{ borderColor: baseColor }}
              initial={{ width: '40px', height: '40px', opacity: 1 }}
              animate={{ 
                width: '120px', 
                height: '120px', 
                opacity: 0,
                borderWidth: '0.5px' 
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      )}

      {/* Result Burst (Verified/Flagged) */}
      {(isVerified || isFlagged) && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: baseColor }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}

      {/* Center Device / Icon */}
      <motion.div
        className="relative z-10 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] border"
        style={{ borderColor: status === 'idle' ? '#e2e8f0' : baseColor }}
        animate={{
          scale: isScanning ? [1, 1.05, 1] : 1,
          boxShadow: isScanning 
            ? `0 0 20px ${baseColor}40` 
            : '0 4px 12px rgba(0,0,0,0.1)'
        }}
        transition={{
          duration: 1.5,
          repeat: isScanning ? Infinity : 0,
          ease: 'easeInOut'
        }}
      >
        <Radio 
          className="w-7 h-7 transition-colors duration-300"
          style={{ color: status === 'idle' ? '#94a3b8' : baseColor }}
        />
      </motion.div>
    </div>
  )
}
