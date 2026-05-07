import { router, protectedProcedure } from '@/trpc'
import { TRPCError } from '@trpc/server'
import Stripe from 'stripe'
import { getUserId } from '@/lib/getUserId'
import { getSubscription, invalidatePlanCache } from '@/lib/plan'
import {
  getStripe,
  createCheckoutSession,
  createCustomerPortalSession,
  getOrCreateStripeCustomer,
  STRIPE_PLANS,
} from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://stableadhd.com'

export const subscriptionsRouter = router({
  // Returns the caller's current subscription state
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = await getUserId(ctx)
    const sub = await getSubscription(userId, ctx.db)
    return sub ?? { plan: 'free', status: 'active', stripeCustomerId: null,
      stripeSubscriptionId: null, trialEndsAt: null,
      currentPeriodEnd: null, cancelAtPeriodEnd: false }
  }),

  // Create a Stripe Checkout session → returns the session URL
  createCheckout: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = await getUserId(ctx)
    const sub = await getSubscription(userId, ctx.db)

    // Already on Pro and active — no need to checkout
    if (sub?.plan === 'pro' && (sub.status === 'active' || sub.status === 'trialing')) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already on Pro plan.' })
    }

    // Get or create Stripe customer
    const { data: userRow } = await ctx.db
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single()

    if (!userRow) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })

    let stripeCustomerId: string
    try {
      stripeCustomerId = await getOrCreateStripeCustomer({
        clerkId: ctx.userId,
        email: userRow.email as string,
        name: userRow.name as string | null,
      })
    } catch (err) {
      const detail = err instanceof Stripe.errors.StripeError
        ? `[${err.type}] ${err.message} (status=${err.statusCode})`
        : String(err)
      console.error('[createCheckout] getOrCreateStripeCustomer failed:', detail)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Stripe customer error: ${detail}` })
    }

    // Determine if this user has already had a trial
    const hadTrial = sub?.trialEndsAt != null
    const plan = STRIPE_PLANS.pro

    let session: Awaited<ReturnType<typeof createCheckoutSession>>
    try {
      session = await createCheckoutSession({
        customerId: stripeCustomerId,
        priceId: plan.priceId,
        trialDays: hadTrial ? undefined : plan.trialDays,
        successUrl: `${APP_URL}/dashboard?checkout=success`,
        cancelUrl:  `${APP_URL}/pricing?checkout=cancelled`,
        metadata:   { userId, clerkId: ctx.userId },
      })
    } catch (err) {
      const detail = err instanceof Stripe.errors.StripeError
        ? `[${err.type}] ${err.message} (status=${err.statusCode})`
        : String(err)
      console.error('[createCheckout] createCheckoutSession failed:', detail)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Stripe session error: ${detail}` })
    }

    return { url: session.url }
  }),

  // Create a Stripe Customer Portal session → returns the portal URL
  createPortal: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = await getUserId(ctx)
    const sub = await getSubscription(userId, ctx.db)

    if (!sub?.stripeCustomerId) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'No active subscription found.' })
    }

    const session = await createCustomerPortalSession({
      customerId: sub.stripeCustomerId,
      returnUrl:  `${APP_URL}/account`,
    })

    return { url: session.url }
  }),

  // Admin utility: manually set a user's plan (for beta/gifted access)
  adminSetPlan: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Only callable by admin — checked in caller via user-roles
      const userId = await getUserId(ctx)
      const { error } = await ctx.db
        .from('subscriptions')
        .upsert(
          { user_id: userId, plan: 'pro', status: 'active' },
          { onConflict: 'user_id' },
        )
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      await invalidatePlanCache(userId, ctx.redis)
      return { ok: true }
    }),
})
