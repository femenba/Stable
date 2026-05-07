import { TRPCError } from '@trpc/server'
import type { Context } from '@/context'
import { getCachedUserId, setCachedUserId } from '@/lib/redis'

export async function getUserId(ctx: Context): Promise<string> {
  // 1. Redis fast-path
  if (ctx.redis) {
    try {
      const cached = await getCachedUserId(ctx.redis, ctx.userId)
      if (cached) return cached
    } catch {}
  }

  console.log(`[getUserId] clerk_id=${ctx.userId} email=${ctx.userEmail || '(none)'}`)

  // 2. SELECT by clerk_id — handles all returning users
  const { data: existing } = await ctx.db
    .from('users')
    .select('id, email')
    .eq('clerk_id', ctx.userId)
    .maybeSingle()

  if (existing?.id) {
    const id = existing.id as string
    console.log(`[getUserId] Found existing user id=${id} email=${existing.email}`)

    // Opportunistically repair placeholder email if we now have a real one
    if (ctx.userEmail && existing.email === 'unknown@stableadhd.com') {
      await ctx.db.from('users').update({ email: ctx.userEmail }).eq('id', id)
      console.log(`[getUserId] Repaired placeholder email → ${ctx.userEmail}`)
    }

    if (ctx.redis) {
      try { await setCachedUserId(ctx.redis, ctx.userId, id) } catch {}
    }
    return id
  }

  // 3. No row yet — INSERT new user
  const email = ctx.userEmail || 'unknown@stableadhd.com'
  console.log(`[getUserId] Creating new user clerk_id=${ctx.userId} email=${email}`)

  const { data: created, error: insertError } = await ctx.db
    .from('users')
    .insert({ clerk_id: ctx.userId, email })
    .select('id')
    .single()

  if (created?.id) {
    const id = created.id as string
    console.log(`[getUserId] Created user id=${id}`)
    if (ctx.redis) {
      try { await setCachedUserId(ctx.redis, ctx.userId, id) } catch {}
    }
    return id
  }

  // 4. Race condition: another concurrent request may have inserted first
  if (insertError) {
    console.warn(`[getUserId] Insert failed (${insertError.code}), retrying SELECT`)
    const { data: retry } = await ctx.db
      .from('users')
      .select('id')
      .eq('clerk_id', ctx.userId)
      .maybeSingle()

    if (retry?.id) {
      const id = retry.id as string
      if (ctx.redis) {
        try { await setCachedUserId(ctx.redis, ctx.userId, id) } catch {}
      }
      return id
    }

    console.error(`[getUserId] All paths failed clerk_id=${ctx.userId} error=${JSON.stringify(insertError)}`)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to resolve user (${insertError.code ?? 'unknown'})`,
    })
  }

  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to resolve user' })
}
