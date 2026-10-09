import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { syncUserOnSignIn } from '@/lib/auth'
import { useDemoStore } from '@/lib/simulation/use-demo-store'

export function useAuthSync() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { setRole } = useDemoStore()

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Sync to Neon DB + get role
      syncUserOnSignIn(user).then((res) => {
        if (res && res.role) {
          // Update local demo store role based on Clerk/DB role
          setRole(res.role as any)
        }
      })
    }
  }, [isLoaded, isSignedIn, user, setRole])
}
