import { router, protectedProcedure } from '@/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { ADMIN_EMAIL } from '@/lib/user-roles'
import { invalidatePlanCache } from '@/lib/plan'
import {
  sendWelcomePro,
  sendWelcomeTrial,
  sendTrialEnding,
  sendPaymentSucceeded,
  sendPaymentFailed,
  sendCancellation,
} from '@/lib/email'

async function assertAdmin(ctx: { userEmail: string }) {
  if (ctx.userEmail !== ADMIN_EMAIL) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required.' })
  }
}

export const adminRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    await assertAdmin(ctx)

    const [usersRes, subsRes, weekRes] = await Promise.all([
      ctx.db.from('users').select('*', { count: 'exact', head: true }),
      ctx.db.from('subscriptions').select('plan, status'),
      ctx.db.from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ])

    const totalUsers  = usersRes.count ?? 0
    const newThisWeek = weekRes.count ?? 0
    const subs        = subsRes.data ?? []
    const proActive   = subs.filter((s: any) => s.plan === 'pro' && s.status === 'active').length
    const proTrialing = subs.filter((s: any) => s.plan === 'pro' && s.status === 'trialing').length
    const proCount    = proActive + proTrialing
    const freeCount   = totalUsers - proCount
    const mrr         = +(proActive * 4.99).toFixed(2)

    return { totalUsers, proCount, freeCount, newThisWeek, mrr, proActive, proTrialing }
  }),

  listUsers: protectedProcedure.query(async ({ ctx }) => {
    await assertAdmin(ctx)

    const { data: users, error: usersError } = await ctx.db
      .from('users')
      .select('id, email, name, clerk_id, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(200)

    if (usersError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: usersError.message })
    if (!users?.length) return []

    // Fetch subscriptions separately — avoids PostgREST FK schema cache issues
    const userIds = users.map((u: any) => u.id)
    const { data: subs } = await ctx.db
      .from('subscriptions')
      .select('user_id, plan, status, stripe_customer_id, stripe_subscription_id, trial_ends_at, current_period_end, updated_at')
      .in('user_id', userIds)

    const subsByUserId = Object.fromEntries((subs ?? []).map((s: any) => [s.user_id, s]))

    return users.map((u: any) => ({
      ...u,
      subscriptions: subsByUserId[u.id] ? [subsByUserId[u.id]] : [],
    })) as any[]
  }),

  setUserPlan: protectedProcedure
    .input(z.object({
      userId: z.string(),
      plan:   z.enum(['free', 'pro']),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx)

      if (input.plan === 'pro') {
        const { error } = await ctx.db.from('subscriptions').upsert(
          { user_id: input.userId, plan: 'pro', status: 'active' },
          { onConflict: 'user_id' },
        )
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      } else {
        const { error } = await ctx.db.from('subscriptions')
          .update({ plan: 'free', status: 'canceled' })
          .eq('user_id', input.userId)
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      await invalidatePlanCache(input.userId, ctx.redis)
      return { ok: true }
    }),

  // Wipes a user's subscription row and all caches so they can re-test checkout.
  // Clerk login is untouched; only subscription + cache state is cleared.
  resetUserSubscription: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx)

      // Look up clerk_id so we can also purge the userId cache
      const { data: user } = await ctx.db
        .from('users')
        .select('id, clerk_id')
        .eq('id', input.userId)
        .single()

      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })

      // Delete subscription row entirely — cleanest reset
      const { error } = await ctx.db
        .from('subscriptions')
        .delete()
        .eq('user_id', input.userId)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      // Purge both Redis caches
      if (ctx.redis) {
        await Promise.allSettled([
          ctx.redis.del(`plan:user:${input.userId}`),
          ctx.redis.del(`user:clerk:${user.clerk_id}`),
        ])
      }

      return { ok: true, userId: input.userId, clerkId: user.clerk_id }
    }),

  // Sends a real production lifecycle email to any user without touching subscription state.
  sendLifecycleEmail: protectedProcedure
    .input(z.object({
      userId:    z.string(),
      emailType: z.enum([
        'welcome_pro',
        'welcome_trial',
        'trial_ending',
        'payment_succeeded',
        'payment_failed',
        'cancellation',
      ]),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx)

      const { data: user } = await ctx.db
        .from('users')
        .select('email')
        .eq('id', input.userId)
        .single()

      if (!user?.email) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found or has no email' })
      }

      const to   = user.email as string
      const base = { db: ctx.db, userId: input.userId }

      console.log(`[admin.sendLifecycleEmail] type=${input.emailType} to=${to}`)

      switch (input.emailType) {
        case 'welcome_pro':
          await sendWelcomePro(to, { ...base, emailType: 'welcome_pro' })
          break
        case 'welcome_trial':
          await sendWelcomeTrial(to, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), { ...base, emailType: 'welcome_trial' })
          break
        case 'trial_ending':
          await sendTrialEnding(to, new Date(Date.now() + 24 * 60 * 60 * 1000), { ...base, emailType: 'trial_ending' })
          break
        case 'payment_succeeded':
          await sendPaymentSucceeded(to, { ...base, emailType: 'payment_succeeded' })
          break
        case 'payment_failed':
          await sendPaymentFailed(to, { ...base, emailType: 'payment_failed' })
          break
        case 'cancellation':
          await sendCancellation(to, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), { ...base, emailType: 'cancellation' })
          break
      }

      return { ok: true, to, emailType: input.emailType }
    }),

  listFeedback: protectedProcedure
    .input(z.object({ status: z.enum(['pending', 'approved', 'rejected', 'all']).default('pending') }))
    .query(async ({ ctx, input }) => {
      await assertAdmin(ctx)
      let query = ctx.db
        .from('feedback_submissions')
        .select('*')
        .order('created_at', { ascending: false })
      if (input.status !== 'all') query = query.eq('status', input.status)
      const { data, error } = await query
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data ?? []
    }),

  moderateFeedback: protectedProcedure
    .input(z.object({ id: z.string().uuid(), status: z.enum(['approved', 'rejected']) }))
    .mutation(async ({ ctx, input }) => {
      await assertAdmin(ctx)
      const { error } = await ctx.db
        .from('feedback_submissions')
        .update({ status: input.status })
        .eq('id', input.id)
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return { ok: true }
    }),
})
