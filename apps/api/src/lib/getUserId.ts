import { TRPCError } from '@trpc/server'
import type { Context } from '@/context'
import { getCachedUserId, setCachedUserId } from '@/lib/redis'

export async function getUserId(ctx: Context): Promise<string> {
  if (ctx.redis) {
    try {
      const cached = await getCachedUserId(ctx.redis, ctx.userId)
      if (cached) return cached
    } catch {
      // Redis unavailable — fall through to DB
    }
  }

  // If we have a real email, update on conflict so the email stays current.
  // If we don't, use ignoreDuplicates:true so we never overwrite a good email
  // with the placeholder on subsequent calls.
  const hasRealEmail = !!ctx.userEmail
  const { data: upserted, error } = await ctx.db
    .from('users')
    .upsert(
      { clerk_id: ctx.userId, email: hasRealEmail ? ctx.userEmail : 'unknown@stableadhd.com' },
      { onConflict: 'clerk_id', ignoreDuplicates: !hasRealEmail },
    )
    .select('id')
    .single()

  // When ignoreDuplicates fires (user existed, no real email to write),
  // the upsert returns no rows — fall back to a plain SELECT.
  let data: { id: unknown } | null = upserted
  if (!data && !error) {
    const sel = await ctx.db.from('users').select('id').eq('clerk_id', ctx.userId).single()
    if (sel.data) data = sel.data
  }

  if (error || !data) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to resolve user' })

  if (ctx.redis) {
    try {
      await setCachedUserId(ctx.redis, ctx.userId, data.id as string)
    } catch {
      // Cache write failed — not fatal
    }
  }

  return data.id as string
}
