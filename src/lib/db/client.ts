import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

export const isDatabaseConfigured = Boolean(databaseUrl && databaseUrl.startsWith('postgres'))

let dbInstance: ReturnType<typeof drizzle> | null = null

if (isDatabaseConfigured && databaseUrl) {
  try {
    const sql = neon(databaseUrl)
    dbInstance = drizzle(sql, { schema })
  } catch (err) {
    console.warn('Failed to initialize Neon PostgreSQL connection:', err)
  }
}

export const db = dbInstance
