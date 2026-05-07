import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createDbClient } from '@stable/db'
import { getRedis, invalidateCachedUserId } from '@/lib/redis'
import { invalidatePlanCache } from '@/lib/plan'

// Stripe requires the raw body to verify webhook signatures
export const runtime = 'nodejs'

function getDb() {
  return createDbClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function getUserIdByStripeCustomer(
  stripeCustomerId: string,
  db: ReturnType<typeof getDb>,
): Promise<string | null> {
  const { data } = await db
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single()
  return (data?.user_id as string) ?? null
}

async function upsertSubscription(
  db: ReturnType<typeof getDb>,
  redis: ReturnType<typeof getRedis>,
  sub: Stripe.Subscription,
  extraFields: Record<string, unknown> = {},
) {
  const customerId = sub.customer as string
  const userId = await getUserIdByStripeCustomer(customerId, db)
  if (!userId) return // unknown customer — ignore

  const plan = sub.status === 'canceled' ? 'free' : 'pro'

  await db.from('subscriptions').upsert(
    {
      user_id:                userId,
      stripe_customer_id:     customerId,
      stripe_subscription_id: sub.id,
      plan,
      status:                 sub.status,
      trial_ends_at:          sub.trial_end
        ? new Date(sub.trial_end * 1000).toISOString()
        : null,
      current_period_end:     new Date((sub as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end:   sub.cancel_at_period_end,
      ...extraFields,
    },
    { onConflict: 'user_id' },
  )

  await invalidatePlanCache(userId, redis)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook signature failed: ${msg}` }, { status: 400 })
  }

  const db    = getDb()
  const redis = getRedis()

  switch (event.type) {
    // New checkout completed — first time customer subscribes
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const customerId = session.customer as string
      const userId     = session.metadata?.userId
      if (!userId) break

      // Link customer to user in subscriptions table (initial insert)
      await db.from('subscriptions').upsert(
        {
          user_id:            userId,
          stripe_customer_id: customerId,
          plan:               'free', // will be updated by subscription.updated event
          status:             'incomplete',
        },
        { onConflict: 'user_id' },
      )
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await upsertSubscription(db, redis, sub)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await upsertSubscription(db, redis, sub)
      break
    }

    case 'invoice.payment_failed': {
      const invoice    = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const userId     = await getUserIdByStripeCustomer(customerId, db)
      if (!userId) break

      await db.from('subscriptions')
        .update({ status: 'past_due' })
        .eq('user_id', userId)

      await invalidatePlanCache(userId, redis)
      break
    }

    case 'invoice.paid': {
      // Re-activate if previously past_due
      const invoice    = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const userId     = await getUserIdByStripeCustomer(customerId, db)
      if (!userId) break

      await db.from('subscriptions')
        .update({ status: 'active', plan: 'pro' })
        .eq('user_id', userId)
        .eq('status', 'past_due')

      await invalidatePlanCache(userId, redis)
      break
    }

    default:
      // Unhandled events — ignore silently
      break
  }

  return NextResponse.json({ received: true })
}
