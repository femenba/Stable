import type { DbClient } from '@stable/db'
import type { Redis } from '@upstash/redis'
import { ADMIN_EMAIL } from './user-roles'

export type Plan = 'free' | 'pro'
export type SubStatus = 'active' | 'trialing' | 'past_due' | 'canceled'

export interface Subscription {
  plan: Plan
  status: SubStatus
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

const PLAN_CACHE_TTL = 300 // 5 minutes

function planCacheKey(userId: string) {
  return `plan:user:${userId}`
}

export async function getActivePlan(
  userId: string,
  email: string,
  db: DbClient,
  redis: Redis | null,
): Promise<Plan> {
  // Admin always gets pro
  if (email === ADMIN_EMAIL) return 'pro'

  // Try Redis cache
  if (redis) {
    try {
      const cached = await redis.get<Plan>(planCacheKey(userId))
      if (cached) return cached
    } catch {
      // Redis unavailable — fall through
    }
  }

  const plan = await fetchPlanFromDb(userId, db)

  if (redis) {
    try {
      await redis.set(planCacheKey(userId), plan, { ex: PLAN_CACHE_TTL })
    } catch {
      // Cache write failed — not fatal
    }
  }

  return plan
}

async function fetchPlanFromDb(userId: string, db: DbClient): Promise<Plan> {
  const { data } = await db
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .single()

  if (!data) return 'free'
  if (data.plan !== 'pro') return 'free'
  if (data.status === 'canceled') return 'free'
  return 'pro'
}

export async function getSubscription(
  userId: string,
  db: DbClient,
): Promise<Subscription | null> {
  const { data } = await db
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!data) return null

  return {
    plan: data.plan as Plan,
    status: data.status as SubStatus,
    stripeCustomerId: data.stripe_customer_id ?? null,
    stripeSubscriptionId: data.stripe_subscription_id ?? null,
    trialEndsAt: data.trial_ends_at ?? null,
    currentPeriodEnd: data.current_period_end ?? null,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
  }
}

export async function invalidatePlanCache(
  userId: string,
  redis: Redis | null,
): Promise<void> {
  if (!redis) return
  try {
    await redis.del(planCacheKey(userId))
  } catch {
    // Not fatal
  }
}

export function isProActive(sub: Subscription | null): boolean {
  if (!sub) return false
  if (sub.plan !== 'pro') return false
  return sub.status === 'active' || sub.status === 'trialing'
}
