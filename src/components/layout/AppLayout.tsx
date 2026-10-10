import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { DemoModeBanner } from './DemoModeBanner'
import { useAuthSync } from '@/hooks/useAuthSync'
import { Toaster } from '@/hooks/useToast'
import { useUser } from '@clerk/tanstack-react-start'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import { GraduationCap, ShieldCheck, HeartHandshake } from 'lucide-react'
import { syncUserOnSignIn } from '@/lib/auth'
import { useEffect } from 'react'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isSignedIn, user } = useUser()
  const { hasSelectedRole, completeOnboarding } = useDemoStore()
  useAuthSync()

  const handleSelectRole = async (role: 'admin' | 'student' | 'guardian') => {
    completeOnboarding(role)
    if (user) {
      try {
        await user.update({ unsafeMetadata: { ...user.unsafeMetadata, role } })
        await syncUserOnSignIn({ ...user, unsafeMetadata: { ...user.unsafeMetadata, role } } as any)
      } catch (err) {
        console.error('Failed to save role to Clerk:', err)
      }
    }
  }

  useEffect(() => {
    if (isSignedIn && !hasSelectedRole && user) {
      const pending = localStorage.getItem('pendingRole') as 'admin' | 'student' | 'guardian' | null
      if (pending && ['admin', 'student', 'guardian'].includes(pending)) {
        handleSelectRole(pending)
        localStorage.removeItem('pendingRole')
      }
    }
  }, [isSignedIn, hasSelectedRole, user])

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--color-surface-base)' }}>
      {/* 1. Global Demo Mode Banner */}
      <DemoModeBanner />

      {/* 2. Main Flex Container */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-37px)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full">
          <Sidebar />
        </div>

        {/* Mobile Drawer Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 backdrop-blur-md"
              style={{ background: 'oklch(0 0 0 / 0.25)' }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-64 h-full">
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: 'var(--color-surface-base)' }}>
          <TopBar onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-[1600px] mx-auto w-full">
              {children}
            </div>
          </main>
          <Toaster />
          
          {/* Role Onboarding Modal */}
          {isSignedIn && !hasSelectedRole && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-xl" style={{ background: 'oklch(0 0 0 / 0.4)' }}>
              <div className="p-8 max-w-lg w-full space-y-6 mx-4 text-center glass-panel">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Welcome to RakshaTrack</h2>
                  <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>Please select your role to continue testing the platform.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button onClick={() => handleSelectRole('admin')} className="flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer" style={{ background: 'oklch(0.72 0.18 55 / 0.1)', border: '1px solid oklch(0.72 0.18 55 / 0.3)', color: 'oklch(0.52 0.18 55)', boxShadow: 'var(--nm-raised)' }}>
                    <ShieldCheck className="w-8 h-8 mb-2" />
                    <span className="font-bold text-sm">ADMIN</span>
                  </button>
                  <button onClick={() => handleSelectRole('guardian')} className="flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer" style={{ background: 'oklch(0.65 0.17 290 / 0.1)', border: '1px solid oklch(0.65 0.17 290 / 0.3)', color: 'oklch(0.45 0.17 290)', boxShadow: 'var(--nm-raised)' }}>
                    <HeartHandshake className="w-8 h-8 mb-2" />
                    <span className="font-bold text-sm">GUARDIAN</span>
                  </button>
                  <button onClick={() => handleSelectRole('student')} className="flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer" style={{ background: 'oklch(0.63 0.188 155 / 0.1)', border: '1px solid oklch(0.63 0.188 155 / 0.3)', color: 'oklch(0.43 0.188 155)', boxShadow: 'var(--nm-raised)' }}>
                    <GraduationCap className="w-8 h-8 mb-2" />
                    <span className="font-bold text-sm">STUDENT</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

