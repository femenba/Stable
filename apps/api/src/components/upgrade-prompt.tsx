'use client'

import Link from 'next/link'
import { Crown, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSubscription } from '../lib/use-subscription'

interface UpgradeGateProps {
  children: ReactNode
  feature?: string   // short feature name shown in the locked state
  compact?: boolean  // smaller locked UI for inline use
}

// Wraps any feature — renders children for Pro users, locked prompt for Free users.
export function UpgradeGate({ children, feature, compact }: UpgradeGateProps) {
  const { isPro, isLoading } = useSubscription()

  if (isLoading) return null

  if (isPro) return <>{children}</>

  if (compact) {
    return (
      <div className="relative">
        <div className="opacity-40 pointer-events-none select-none">
          {children}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center rounded-[20px]"
          style={{ background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(2px)' }}
        >
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{ background: 'var(--stable-cta)', color: '#fff' }}
          >
            <Crown size={11} />
            Pro
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-[28px] p-6 flex flex-col items-center text-center gap-4"
      style={{
        background:   'var(--stable-card)',
        border:       '1px solid var(--stable-card-border)',
        boxShadow:    'var(--shadow-card)',
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--sage-soft)' }}
      >
        <Lock size={20} style={{ color: 'var(--cat-work)' }} strokeWidth={1.8} />
      </div>
      <div>
        <p className="font-black text-sm mb-1" style={{ color: 'var(--stable-t1)' }}>
          {feature ?? 'Pro feature'}
        </p>
        <p className="text-xs" style={{ color: 'var(--stable-t2)' }}>
          Unlock with stable. Pro — 7-day free trial, cancel anytime.
        </p>
      </div>
      <Link
        href="/pricing"
        className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-full transition-opacity hover:opacity-80"
        style={{ background: 'var(--stable-cta)', color: '#fff', boxShadow: 'var(--shadow-cta)' }}
      >
        <Crown size={13} />
        Start free trial
      </Link>
    </div>
  )
}

// Inline badge shown next to Pro-only feature labels
export function ProBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ml-1.5"
      style={{ background: 'var(--sage-soft)', color: 'var(--cat-work)' }}
    >
      <Crown size={8} />
      Pro
    </span>
  )
}
