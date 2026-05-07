import { createDbClient, DbClient } from '@stable/db'
import { clerkClient, getAuth } from '@clerk/nextjs/server'
import { TRPCError } from '@trpc/server'
import type { NextRequest } from 'next/server'
import { getRedis } from './lib/redis'
import type { Redis } from '@upstash/redis'

export interface Context {
  userId:    string
  userEmail: string
  db:        DbClient
  redis:     Redis | null
}

// Used in tests — pass a pre-built context directly
export interface RawContext {
  req: NextRequest
}

let _db: DbClient | null = null

function getDb(): DbClient {
  if (!_db) {
    _db = createDbClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return _db
}

// Fetch the user's primary email from the Clerk backend API.
// Cached in Redis for 1 hour to avoid repeated API calls.
async function resolveClerkEmail(userId: string, redis: Redis | null): Promise<string> {
  const cacheKey = `clerk:email:${userId}`
  if (redis) {
    try {
      const cached = await redis.get<string>(cacheKey)
      if (cached) return cached
    } catch {}
  }
  try {
    const clerk = await clerkClient()
    const user  = await clerk.users.getUser(userId)
    const email =
      user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
      ?? user.emailAddresses[0]?.emailAddress
      ?? ''
    console.log(`[context] Clerk API resolved email for ${userId}: ${email || '(none)'}`)
    if (email && redis) {
      try { await redis.set(cacheKey, email, { ex: 3600 }) } catch {}
    }
    return email
  } catch (err) {
    console.warn('[context] Clerk email lookup failed:', err instanceof Error ? err.message : err)
    return ''
  }
}

export async function createContext({ req }: RawContext): Promise<Context> {
  const auth = getAuth(req)
  if (!auth.userId) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })

  // Prefer email embedded in JWT session claims (requires Clerk JWT template configuration).
  // Fall back to Clerk backend API lookup so the email is always available.
  let userEmail =
    (auth.sessionClaims?.email as string | undefined) ??
    (auth.sessionClaims?.['emailAddress'] as string | undefined) ??
    ''

  const redis = getRedis()

  if (!userEmail) {
    userEmail = await resolveClerkEmail(auth.userId, redis)
  }

  return { userId: auth.userId, userEmail, db: getDb(), redis }
}
