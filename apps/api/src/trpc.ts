import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from './context'
import { getActivePlan } from './lib/plan'
import { getUserId } from './lib/getUserId'

const t = initTRPC.context<Context>().create()

export const router          = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure

// Throws FORBIDDEN if caller is not on an active Pro subscription
export const proProcedure = t.procedure.use(async ({ ctx, next }) => {
  const supabaseUserId = await getUserId(ctx)
  const plan = await getActivePlan(supabaseUserId, ctx.userEmail, ctx.db, ctx.redis)
  if (plan !== 'pro') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This feature requires a Pro subscription.',
    })
  }
  return next({ ctx: { ...ctx, plan: 'pro' as const } })
})
