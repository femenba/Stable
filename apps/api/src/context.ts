import { createDbClient, DbClient } from '@steady/db'
import { getAuth } from '@clerk/nextjs/server'
import { TRPCError } from '@trpc/server'
import type { NextRequest } from 'next/server'

export interface Context {
  userId: string      // Clerk user ID
  db: DbClient
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

  if (!userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  }

  return { userId, db: getDb() }
}
