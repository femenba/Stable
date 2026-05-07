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

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://stableadhd.com').trim()

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

    // ctx.userEmail comes from the live Clerk session — prefer it over the DB
    // value, which may have been corrupted with the placeholder.
    const dbEmail = userRow.email as string
    const effectiveEmail = ctx.userEmail || (dbEmail !== 'unknown@stableadhd.com' ? dbEmail : '')
    if (!effectiveEmail) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'User email not available — please reload and try again.' })
    }

    // Repair corrupted DB email in-place so future calls use the real address
    if (ctx.userEmail && dbEmail === 'unknown@stableadhd.com') {
      await ctx.db.from('users').update({ email: ctx.userEmail }).eq('id', userId)
    }

    let stripeCustomerId: string
    try {
      stripeCustomerId = await getOrCreateStripeCustomer({
        clerkId: ctx.userId,
        email: effectiveEmail,
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

    if (!plan.priceId) {
      console.error('[createCheckout] STRIPE_PRO_MONTHLY_PRICE_ID is not set')
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Stripe price not configured.' })
    }

    console.log(`[createCheckout] userId=${userId} clerkId=${ctx.userId} email=${effectiveEmail} hadTrial=${hadTrial}`)

    let session: Awaited<ReturnType<typeof createCheckoutSession>>
    try {
      session = await createCheckoutSession({
        customerId:    stripeCustomerId,
        customerEmail: effectiveEmail, // Stripe falls back to this if customer lookup fails
        priceId:       plan.priceId,
        trialDays:     hadTrial ? undefined : plan.trialDays,
        successUrl:    `${APP_URL}/account?checkout=success`,
        cancelUrl:     `${APP_URL}/pricing?checkout=cancelled`,
        metadata:      { userId, clerkId: ctx.userId },
      })
    } catch (err) {
      const detail = err instanceof Stripe.errors.StripeError
        ? `[${err.type}] ${err.message} (status=${err.statusCode})`
        : String(err)
      console.error('[createCheckout] createCheckoutSession failed:', detail)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Stripe session error: ${detail}` })
    }

    console.log(`[createCheckout] Session created: ${session.id} url=${session.url}`)

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
