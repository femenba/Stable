import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createDbClient } from '@stable/db'
import { getRedis, invalidateCachedUserId } from '@/lib/redis'
import { invalidatePlanCache } from '@/lib/plan'
import {
  sendWelcomeTrial,
  sendWelcomePro,
  sendTrialEnding,
  sendPaymentSucceeded,
  sendPaymentFailed,
  sendCancellation,
} from '@/lib/email'
import type { SendOpts } from '@/lib/email'

export const runtime = 'nodejs'

// ── Logger ────────────────────────────────────────────────────────────────────

function wlog(event: string, msg: string, data?: Record<string, unknown>) {
  const payload = data ? ` ${JSON.stringify(data)}` : ''
  console.log(`[stripe-webhook][${event}] ${msg}${payload}`)
}

function werr(event: string, msg: string, err?: unknown) {
  const detail = err instanceof Error ? err.message : String(err ?? '')
  console.error(`[stripe-webhook][${event}] ERROR: ${msg}${detail ? ` — ${detail}` : ''}`)
}

// ── DB / Redis factories ──────────────────────────────────────────────────────

function getDb() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error(`Missing Supabase env vars — SUPABASE_URL=${!!url} SUPABASE_SERVICE_ROLE_KEY=${!!key}`)
  return createDbClient(url, key)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getUserIdByStripeCustomer(
  customerId: string,
  db: ReturnType<typeof getDb>,
): Promise<string | null> {
  const { data } = await db
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()
  return (data?.user_id as string) ?? null
}

async function getUserEmail(
  userId: string | null,
  customerId: string | null,
  db: ReturnType<typeof getDb>,
): Promise<string> {
  if (userId) {
    const { data } = await db.from('users').select('email').eq('id', userId).single()
    if (data?.email && data.email !== 'unknown@stableadhd.com') return data.email as string
  }
  // Fallback: read email directly from Stripe customer object
  if (customerId) {
    try {
      const customer = await getStripe().customers.retrieve(customerId)
      if (!customer.deleted && customer.email && customer.email !== 'unknown@stableadhd.com') {
        return customer.email
      }
    } catch {}
  }
  return ''
}

async function upsertSubscription(
  eventType: string,
  db: ReturnType<typeof getDb>,
  redis: ReturnType<typeof getRedis>,
  sub: Stripe.Subscription,
) {
  const customerId = sub.customer as string
  const userId     = await getUserIdByStripeCustomer(customerId, db)

  if (!userId) {
    werr(eventType, `No user found for Stripe customer ${customerId} — subscription not linked yet`)
    return
  }

  const plan   = sub.status === 'canceled' ? 'free' : 'pro'
  const status = sub.status

  wlog(eventType, 'Upserting subscription', { userId, customerId, plan, status, subId: sub.id })

  const rawPeriodEnd = (sub as any).current_period_end
  const { error } = await db.from('subscriptions').upsert(
    {
      user_id:                userId,
      stripe_customer_id:     customerId,
      stripe_subscription_id: sub.id,
      plan,
      status,
      trial_ends_at:        sub.trial_end
        ? new Date(sub.trial_end * 1000).toISOString()
        : null,
      current_period_end:   rawPeriodEnd ? new Date(rawPeriodEnd * 1000).toISOString() : null,
      cancel_at_period_end: sub.cancel_at_period_end,
    },
    { onConflict: 'user_id' },
  )

  if (error) {
    werr(eventType, `DB upsert failed for user ${userId}`, error)
    return
  }

  wlog(eventType, `User ${userId} → plan=${plan} status=${status}`)
  await invalidatePlanCache(userId, redis)
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: string
  try {
    body = await req.text()
  } catch (err) {
    console.error('[stripe-webhook] Failed to read request body:', err)
    return NextResponse.json({ error: 'Failed to read body' }, { status: 500 })
  }

  const sig           = req.headers.get('stripe-signature') ?? ''
  // Trim to guard against copy-paste whitespace/newline in the Vercel env var
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()

  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not set in environment')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  // Confirm the function is reachable and the env is loaded
  console.log(`[stripe-webhook] Hit — body_len=${body.length} sig_prefix=${sig.slice(0, 20)} secret_prefix=${webhookSecret.slice(0, 12)} secret_len=${webhookSecret.length}`)

  // Initialise Stripe client separately so an init failure has a clear error message
  let stripe: import('stripe').default
  try {
    stripe = getStripe()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[stripe-webhook] Stripe client init failed: ${msg}`)
    return NextResponse.json({ error: `Stripe init error: ${msg}` }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[stripe-webhook] Signature verification FAILED: ${msg}`)
    console.error(`[stripe-webhook] Ensure STRIPE_WEBHOOK_SECRET in Vercel (Production) matches the LIVE endpoint secret at Stripe Dashboard → Developers → Webhooks → ${process.env.NEXT_PUBLIC_APP_URL ?? 'your endpoint'}`)
    return NextResponse.json({ error: `Webhook signature failed: ${msg}` }, { status: 400 })
  }

  wlog(event.type, 'Received', { id: event.id, livemode: event.livemode })

  let db: ReturnType<typeof getDb>
  try {
    db = getDb()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[stripe-webhook] DB init failed: ${msg}`)
    return NextResponse.json({ error: `DB init error: ${msg}` }, { status: 500 })
  }
  const redis = getRedis()

  try {
    switch (event.type) {

      // ── Checkout completed ─────────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session        = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const customerId     = session.customer as string
        const userId         = session.metadata?.userId
        const subscriptionId = session.subscription as string | null

        wlog(event.type, 'Processing', { customerId, userId, subscriptionId })

        if (!userId) {
          werr(event.type, 'No userId in session metadata — cannot link subscription')
          break
        }

        let plan      = 'pro'
        let status    = 'active'
        let trialEnd: string | null  = null
        let periodEnd: string | null = null
        let resolvedSubId            = subscriptionId

        if (subscriptionId) {
          try {
            const sub = await getStripe().subscriptions.retrieve(subscriptionId)
            plan          = sub.status === 'canceled' ? 'free' : 'pro'
            status        = sub.status
            trialEnd      = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null
            const rawPE   = (sub as any).current_period_end
            periodEnd     = rawPE ? new Date(rawPE * 1000).toISOString() : null
            resolvedSubId = sub.id
            wlog(event.type, 'Fetched subscription', { status, trial_end: trialEnd })
          } catch (err) {
            werr(event.type, 'Failed to retrieve subscription from Stripe', err)
          }
        }

        const { error } = await db.from('subscriptions').upsert(
          {
            user_id:                userId,
            stripe_customer_id:     customerId,
            stripe_subscription_id: resolvedSubId,
            plan,
            status,
            trial_ends_at:      trialEnd,
            current_period_end: periodEnd,
          },
          { onConflict: 'user_id' },
        )

        if (error) {
          werr(event.type, `DB upsert failed for user ${userId}`, error)
          break
        }

        wlog(event.type, `User ${userId} upgraded to ${plan} (${status})`)
        await invalidatePlanCache(userId, redis)

        const email = await getUserEmail(userId, customerId, db)

        if (status === 'trialing' && trialEnd) {
          await sendWelcomeTrial(email, new Date(trialEnd), {
            db, userId, stripeEventId: event.id, emailType: 'welcome_trial',
          })
        } else if (status === 'active') {
          await sendWelcomePro(email, {
            db, userId, stripeEventId: event.id, emailType: 'welcome_pro',
          })
        }
        break
      }

      // ── Subscription lifecycle ─────────────────────────────────────────────
      case 'customer.subscription.created': {
        wlog(event.type, 'Subscription created')
        const sub = event.data.object as Stripe.Subscription
        await upsertSubscription(event.type, db, redis, sub)
        break
      }

      case 'customer.subscription.updated': {
        wlog(event.type, 'Subscription updated')
        const sub  = event.data.object as Stripe.Subscription
        const prev = (event.data.previous_attributes ?? {}) as Record<string, unknown>
        await upsertSubscription(event.type, db, redis, sub)

        // Trial → active: first charge just succeeded
        if (prev.status === 'trialing' && sub.status === 'active') {
          const customerId = sub.customer as string
          const userId     = await getUserIdByStripeCustomer(customerId, db)
          const email      = await getUserEmail(userId, customerId, db)
          wlog(event.type, 'Trial converted to active — sending payment confirmation', { userId })
          await sendPaymentSucceeded(email, {
            db, userId, stripeEventId: event.id, emailType: 'payment_succeeded_trial_converted',
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        wlog(event.type, 'Subscription deleted/cancelled')
        const sub        = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const userId     = await getUserIdByStripeCustomer(customerId, db)
        await upsertSubscription(event.type, db, redis, sub)

        const accessEndsAt = (sub as any).current_period_end
          ? new Date((sub as any).current_period_end * 1000)
          : new Date()
        const email = await getUserEmail(userId, customerId, db)
        await sendCancellation(email, accessEndsAt, {
          db, userId, stripeEventId: event.id, emailType: 'cancellation',
        })
        break
      }

      // ── Trial ending reminder ──────────────────────────────────────────────
      // Stripe fires this 3 days before trial ends by default.
      // To send at 24 hours: Stripe Dashboard → Settings → Subscriptions →
      // Manage trials → set trial_will_end notification to 1 day.
      case 'customer.subscription.trial_will_end': {
        const sub        = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const userId     = await getUserIdByStripeCustomer(customerId, db)
        wlog(event.type, 'Trial ending soon', { customerId, userId: userId ?? 'unknown' })
        if (sub.trial_end) {
          const email = await getUserEmail(userId, customerId, db)
          await sendTrialEnding(email, new Date(sub.trial_end * 1000), {
            db, userId, stripeEventId: event.id, emailType: 'trial_ending',
          })
        }
        break
      }

      // ── Invoice paid ───────────────────────────────────────────────────────
      case 'invoice.paid': {
        const invoice    = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const userId     = await getUserIdByStripeCustomer(customerId, db)
        if (!userId) { wlog(event.type, `No user for customer ${customerId}`); break }

        wlog(event.type, 'Invoice paid', { customerId, userId, amount: invoice.amount_paid })

        const { data: prevSub } = await db
          .from('subscriptions')
          .select('status')
          .eq('user_id', userId)
          .single()

        // Only update and email if previously past_due (payment recovery)
        if (prevSub?.status === 'past_due') {
          await db.from('subscriptions')
            .update({ status: 'active', plan: 'pro' })
            .eq('user_id', userId)
          await invalidatePlanCache(userId, redis)
          const email = await getUserEmail(userId, customerId, db)
          await sendPaymentSucceeded(email, {
            db, userId, stripeEventId: event.id, emailType: 'payment_succeeded_recovery',
          })
        }
        break
      }

      // ── Invoice payment failed ─────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice    = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const userId     = await getUserIdByStripeCustomer(customerId, db)
        if (!userId) { wlog(event.type, `No user for customer ${customerId}`); break }

        wlog(event.type, 'Payment failed', { customerId, userId })

        await db.from('subscriptions')
          .update({ status: 'past_due' })
          .eq('user_id', userId)

        const email = await getUserEmail(userId, customerId, db)
        await sendPaymentFailed(email, {
          db, userId, stripeEventId: event.id, emailType: 'payment_failed',
        })

        await invalidatePlanCache(userId, redis)
        break
      }

      default:
        wlog(event.type, 'Unhandled event — ignored')
        break
    }
  } catch (err) {
    werr(event.type, 'Unhandled exception in webhook handler', err)
    // Return 200 so Stripe does not retry — error is logged
  }

  return NextResponse.json({ received: true })
}
