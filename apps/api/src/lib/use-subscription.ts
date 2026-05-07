'use client'

import { trpc } from './trpc-client'
import { useUser } from '@clerk/nextjs'
import { getUserPlanFromUser } from './user-roles'

export function useSubscription() {
  const { user } = useUser()

  // Optimistic plan from Clerk user data (admin override, instant)
  const optimisticPlan = getUserPlanFromUser(user)

  const { data: sub, isLoading } = trpc.subscriptions.getStatus.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 min — matches Redis TTL
    retry: false,
  })

  // While loading, trust the optimistic value (admin stays pro immediately)
  const plan   = (isLoading ? optimisticPlan : (sub?.plan ?? 'free')) as 'pro' | 'free'
  const status = sub?.status ?? 'active'

  return {
    plan,
    status,
    isPro:              plan === 'pro',
    isTrialing:         status === 'trialing',
    isPastDue:          status === 'past_due',
    isCanceled:         status === 'canceled',
    trialEndsAt:        sub?.trialEndsAt ?? null,
    currentPeriodEnd:   sub?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd:  sub?.cancelAtPeriodEnd ?? false,
    stripeCustomerId:   sub?.stripeCustomerId ?? null,
    isLoading,
  }
}
