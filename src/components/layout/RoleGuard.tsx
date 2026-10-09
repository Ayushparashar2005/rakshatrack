import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { useDemoStore } from '@/lib/simulation/use-demo-store'
import { ShieldAlert, Loader2 } from 'lucide-react'
import { Redirect } from '@tanstack/react-router'

type AllowedRoles = 'admin' | 'student' | 'guardian'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: AllowedRoles[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { isLoaded, isSignedIn } = useUser()
  const { currentRole } = useDemoStore()

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-emerald-600 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="font-mono text-sm">Authenticating session...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Redirect to="/sign-in" />
  }

  if (allowedRoles && !allowedRoles.includes(currentRole as AllowedRoles)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-rose-50 text-rose-700 p-6 rounded-2xl border border-rose-200 max-w-md shadow-sm">
          <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-rose-500" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-sm opacity-90 mb-4">
            Your current role ({currentRole.toUpperCase()}) does not have permission to view this section of the transit system.
          </p>
          <a href="/" className="inline-block px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs transition-colors">
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
