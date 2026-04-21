import { createDbClient, DbClient } from '@stable/db'
import { getAuth } from '@clerk/nextjs/server'
import { TRPCError } from '@trpc/server'
import type { NextRequest } from 'next/server'
import { getRedis } from './lib/redis'
import type { Redis } from '@upstash/redis'

export interface Context {
  userId: string
  db: DbClient
  redis: Redis
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

export async function createContext({ req }: RawContext): Promise<Context> {
  const { userId } = getAuth(req)
  if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  return { userId, db: getDb(), redis: getRedis() }
}
