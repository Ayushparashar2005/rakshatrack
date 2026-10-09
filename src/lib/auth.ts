import { syncUserToDB } from './db/actions'
import type { UserRole } from './types'

export function getRoleFromUser(user: any): UserRole {
  if (!user) return 'student'

  // 1. Check Clerk publicMetadata
  const metaRole = user.publicMetadata?.role as string | undefined
  if (metaRole === 'admin' || metaRole === 'guardian' || metaRole === 'student') {
    return metaRole
  }

  // 2. Derive from email address for ease of demoing multiple roles
  const email = (user.primaryEmailAddress?.emailAddress || user.email || '').toLowerCase()
  if (email.includes('admin') || email.includes('officer') || email.includes('transport')) {
    return 'admin'
  }
  if (email.includes('guardian') || email.includes('parent') || email.includes('sharma')) {
    return 'guardian'
  }

  return 'student'
}

export async function syncUserOnSignIn(user: any) {
  if (!user || !user.id) return null

  const role = getRoleFromUser(user)
  const email = user.primaryEmailAddress?.emailAddress || ''
  const fullName = user.fullName || user.firstName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User'

  try {
    const res = await syncUserToDB({
      data: {
        clerkId: user.id,
        email,
        fullName: fullName || 'User',
        role,
      },
    })
    return { role, ...res }
  } catch (err) {
    console.warn('Failed to sync Clerk user with Neon DB:', err)
    return { role }
  }
}
