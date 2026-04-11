import { initTRPC } from '@trpc/server'
import type { Context } from '@/context'
import { createDbClient } from '@steady/db'

// Test context uses real Supabase with a dedicated test user
export const TEST_CLERK_ID = 'test_clerk_user_001'
export const TEST_USER_EMAIL = 'test@steady.app'

const t = initTRPC.context<Context>().create()
export const testRouter = t.router
export const testProcedure = t.procedure

export function createTestContext(overrides?: Partial<Context>): Context {
  return {
    userId: TEST_CLERK_ID,
    db: createDbClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    ),
    ...overrides,
  }
}

// Ensure test user exists in DB before tests run
// Run this in beforeAll blocks
export async function ensureTestUser(ctx: Context) {
  const { data: existing } = await ctx.db
    .from('users')
    .select('id')
    .eq('clerk_id', TEST_CLERK_ID)
    .single()

  if (existing) return existing.id

  const { data, error } = await ctx.db
    .from('users')
    .insert({
      clerk_id: TEST_CLERK_ID,
      email: TEST_USER_EMAIL,
      name: 'Test User',
      timezone: 'UTC',
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create test user: ${error.message}`)
  return data.id
}

// Clean up all test data for a user
export async function cleanTestData(ctx: Context) {
  const { data: user } = await ctx.db
    .from('users')
    .select('id')
    .eq('clerk_id', TEST_CLERK_ID)
    .single()

  if (!user) return

  await ctx.db.from('focus_sessions').delete().eq('user_id', user.id)
  await ctx.db.from('reminders').delete().eq('user_id', user.id)
  await ctx.db.from('tasks').delete().eq('user_id', user.id)
}
