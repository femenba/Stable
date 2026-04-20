import { TRPCError } from '@trpc/server'
import type { Context } from '@/context'
import { getCachedUserId, setCachedUserId } from '@/lib/redis'

export async function getUserId(ctx: Context): Promise<string> {
  try {
    const cached = await getCachedUserId(ctx.redis, ctx.userId)
    if (cached) return cached
  } catch {
    // Redis unavailable — fall through to DB
  }

  const { data, error } = await ctx.db
    .from('users')
    .select('id')
    .eq('clerk_id', ctx.userId)
    .single()

  if (error || !data) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })

  try {
    await setCachedUserId(ctx.redis, ctx.userId, data.id as string)
  } catch {
    // Cache write failed — not fatal, DB result is still valid
  }

  return data.id as string
}
