'use client'

import { trpc } from './trpc-client'
import { useUser } from '@clerk/nextjs'
import { getUserPlanFromUser } from './user-roles'

export function useSubscription({ pollUntilPro = false }: { pollUntilPro?: boolean } = {}) {
  const { user } = useUser()

  // Optimistic plan from Clerk user data (admin override, instant)
  const optimisticPlan = getUserPlanFromUser(user)

  const { data: sub, isLoading } = trpc.subscriptions.getStatus.useQuery(undefined, {
    // Poll every 2 s after checkout success; otherwise use normal 5-min stale window.
    staleTime:      pollUntilPro ? 0 : 5 * 60 * 1000,
    refetchInterval: pollUntilPro ? 2000 : false,
    retry: false,
  })

  const plan   = (isLoading ? optimisticPlan : (sub?.plan ?? 'free')) as 'pro' | 'free'
  const status = sub?.status ?? 'active'

  return {
    plan,
    status,
    isPro:             plan === 'pro',
    isTrialing:        status === 'trialing',
    isPastDue:         status === 'past_due',
    isCanceled:        status === 'canceled',
    trialEndsAt:       sub?.trialEndsAt ?? null,
    currentPeriodEnd:  sub?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
    stripeCustomerId:  sub?.stripeCustomerId ?? null,
    isLoading,
  }
}
