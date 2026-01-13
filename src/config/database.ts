import 'dotenv/config'

import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

if (process.env.NODE_ENV === 'development') {
  neonConfig.fetchEndpoint = 'neon-local:5432'
  neonConfig.useSecureWebSocket = false
  neonConfig.poolQueryViaFetch = true
}

// The neon driver from @neondatabase/serverless works with both:
// - Neon Cloud URLs (uses HTTP proxy for serverless connections)
// - Standard Postgres URLs (uses Postgres protocol, e.g., Neon Local)
// It automatically detects the connection string type and uses the appropriate protocol.
const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

export { db, sql }
