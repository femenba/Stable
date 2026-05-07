import { router, protectedProcedure } from '@/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { ADMIN_EMAIL } from '@/lib/user-roles'
import { invalidatePlanCache } from '@/lib/plan'
import { getStripe } from '@/lib/stripe'

async function assertAdmin(ctx: { db: any; userId: string }) {
  const { data } = await ctx.db
    .from('users')
    .select('email')
    .eq('clerk_id', ctx.userId)
    .single()
  if (data?.email !== ADMIN_EMAIL) {
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

    const { data, error } = await ctx.db
      .from('users')
      .select(`
        id, email, name, clerk_id, created_at, updated_at,
        subscriptions (
          plan, status, stripe_customer_id, stripe_subscription_id,
          trial_ends_at, current_period_end, updated_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return (data ?? []) as any[]
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

  // Repairs Stripe customers that were created with the placeholder email.
  // For each affected customer, finds the real email from Supabase (via clerkId
  // stored in customer metadata) and updates both Stripe and the users table.
  repairStripeEmails: protectedProcedure.mutation(async ({ ctx }) => {
    await assertAdmin(ctx)

    const stripe = getStripe()

    type RepairResult = {
      customerId: string
      clerkId: string | null
      oldEmail: string
      newEmail: string
      stripeUpdated: boolean
      supabaseUpdated: boolean
      error?: string
    }

    const results: RepairResult[] = []

    // 1. Search Stripe for all customers with the placeholder email (paginated)
    let startingAfter: string | undefined
    let hasMore = true

    while (hasMore) {
      const page = await stripe.customers.list({
        email: 'unknown@stableadhd.com',
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      })

      for (const customer of page.data) {
        const clerkId = customer.metadata?.clerkId ?? null
        const result: RepairResult = {
          customerId: customer.id,
          clerkId,
          oldEmail: 'unknown@stableadhd.com',
          newEmail: '',
          stripeUpdated: false,
          supabaseUpdated: false,
        }

        if (!clerkId) {
          result.error = 'No clerkId in metadata — cannot match to a user'
          results.push(result)
          continue
        }

        // 2. Look up the real email from Supabase by clerk_id
        const { data: user } = await ctx.db
          .from('users')
          .select('id, email')
          .eq('clerk_id', clerkId)
          .single()

        if (!user || !user.email || user.email === 'unknown@stableadhd.com') {
          result.error = 'Supabase user also has placeholder or missing email'
          results.push(result)
          continue
        }

        result.newEmail = user.email

        // 3. Update Stripe customer email
        try {
          await stripe.customers.update(customer.id, {
            email: user.email,
            name:  customer.name ?? undefined,
          })
          result.stripeUpdated = true
        } catch (err: any) {
          result.error = `Stripe update failed: ${err.message}`
          results.push(result)
          continue
        }

        // 4. If Supabase user row still has placeholder, repair it too
        if (user.email && user.email !== 'unknown@stableadhd.com') {
          // The user already has a real email — nothing to fix in Supabase
          result.supabaseUpdated = false
        }

        results.push(result)
      }

      hasMore = page.has_more
      if (hasMore && page.data.length > 0) {
        startingAfter = page.data[page.data.length - 1].id
      }
    }

    // 5. Count Supabase users still stuck with placeholder
    const { count: stillBroken } = await ctx.db
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('email', 'unknown@stableadhd.com')

    return {
      stripeCustomersChecked: results.length,
      stripeCustomersFixed:   results.filter(r => r.stripeUpdated).length,
      stripeCustomersFailed:  results.filter(r => r.error).length,
      supabaseUsersStillBroken: stillBroken ?? 0,
      details: results,
    }
  }),
})
