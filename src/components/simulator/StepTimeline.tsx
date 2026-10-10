import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RefreshCw, Radio, FileCheck, MapPin, Database } from 'lucide-react'

export type StepStatus = 'pending' | 'processing' | 'completed'

interface Step {
  id: string
  title: string
  icon: React.ElementType
}

const STEPS: Step[] = [
  { id: '1', title: 'RFID Read', icon: Radio },
  { id: '2', title: 'Registry', icon: FileCheck },
  { id: '3', title: 'GPS Verify', icon: MapPin },
  { id: '4', title: 'Ledger', icon: Database },
]

interface StepTimelineProps {
  currentStepIndex: number // 0 to 4 (4 means all done)
}

export const StepTimeline: React.FC<StepTimelineProps> = ({ currentStepIndex }) => {
  return (
    <div className="flex items-center justify-between w-full relative pt-4">
      {/* Background connector line */}
      <div className="absolute top-8 left-4 right-4 h-0.5 bg-[--color-border-subtle] -z-10" />
      
      {/* Active connector line */}
      <motion.div 
        className="absolute top-8 left-4 h-0.5 bg-emerald-500 -z-10"
        initial={{ width: '0%' }}
        animate={{ width: `${Math.min(100, Math.max(0, (currentStepIndex / (STEPS.length - 1)) * 100))}%` }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />

      {STEPS.map((step, index) => {
        const isCompleted = index < currentStepIndex
        const isCurrent = index === currentStepIndex
        const isPending = index > currentStepIndex

        const Icon = step.icon

        return (
          <motion.div
            key={step.id}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center gap-2 relative"
          >
            {/* Step Circle */}
            <div className="relative">
              {/* Breathing glow for active step */}
              <AnimatePresence>
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 bg-emerald-500 rounded-full blur-md opacity-40"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                className={`w-9 h-9 rounded-full flex items-center justify-center relative z-10 border-2 transition-colors duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : isCurrent
                      ? 'bg-[--color-surface-base] border-emerald-500 text-emerald-500'
                      : 'bg-[--color-surface-base] border-[--color-border-mid] text-[--color-text-muted]'
                }`}
                layout
              >
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div
                      key="spinner"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="icon"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
            
            {/* Step Label */}
            <span className={`text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 ${
              isCurrent ? 'text-emerald-600' : isCompleted ? 'text-[--color-text-primary]' : 'text-[--color-text-muted]'
            }`}>
              {step.title}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
