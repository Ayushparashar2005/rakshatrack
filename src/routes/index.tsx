import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SignInButton, SignUpButton, useUser, useClerk } from '@clerk/tanstack-react-start'
import { ShieldCheck, GraduationCap, HeartHandshake, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { isSignedIn } = useUser()
  const { openSignUp } = useClerk()
  const navigate = useNavigate()

  useEffect(() => {
    if (isSignedIn) {
      navigate({ to: '/dashboard' })
    }
  }, [isSignedIn, navigate])

  const handleRoleSelect = (role: string) => {
    // Save intended role so we can assign it after auth
    localStorage.setItem('pendingRole', role)
    openSignUp()
  }

  return (
    <div className="min-h-screen bg-[--color-surface-base] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold mb-6 font-mono">
            <ShieldCheck className="w-4 h-4" />
            RakshaTrack V2
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[--color-text-primary] tracking-tight mb-6">
            Next-Gen University <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
              Transport Safety
            </span>
          </h1>
          <p className="text-lg text-[--color-text-secondary] max-w-2xl mx-auto">
            Hardware-free anti-proxy verification & live fleet telemetry. Select your journey to experience the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Admin Role */}
          <button
            onClick={() => handleRoleSelect('admin')}
            className="group relative flex flex-col items-center p-8 rounded-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer glass-card hover:border-emerald-500/30"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[--color-text-primary] mb-2">Transport Admin</h3>
            <p className="text-sm text-[--color-text-secondary] text-center mb-6 flex-1">
              Manage fleet telemetry, audit flagged verifications, and monitor real-time spatial data.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              Continue as Admin <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Student Role */}
          <button
            onClick={() => handleRoleSelect('student')}
            className="group relative flex flex-col items-center p-8 rounded-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer glass-card hover:border-sky-500/30"
          >
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 mb-6 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300 shadow-inner">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[--color-text-primary] mb-2">University Student</h3>
            <p className="text-sm text-[--color-text-secondary] text-center mb-6 flex-1">
              View your live transport pass, check bus locations, and trigger software tap verifications.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-sky-600 group-hover:translate-x-1 transition-transform">
              Continue as Student <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Guardian Role */}
          <button
            onClick={() => handleRoleSelect('guardian')}
            className="group relative flex flex-col items-center p-8 rounded-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer glass-card hover:border-purple-500/30"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300 shadow-inner">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[--color-text-primary] mb-2">Parent / Guardian</h3>
            <p className="text-sm text-[--color-text-secondary] text-center mb-6 flex-1">
              Track your ward's transit status, receive boarding alerts, and monitor safe arrivals.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
              Continue as Guardian <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-[--color-text-muted] mb-4">Already have an account?</p>
          <SignInButton mode="modal">
            <button className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[--color-surface-raised] text-[--color-text-primary] border border-[--color-border-mid] hover:border-[--color-border-subtle] shadow-sm transition-all">
              Sign In to RakshaTrack
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  )
}
