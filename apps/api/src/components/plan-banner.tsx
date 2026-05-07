'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Crown, AlertCircle, X, CheckCircle2 } from 'lucide-react'
import { useSubscription } from '../lib/use-subscription'

// ── Checkout success toast ────────────────────────────────────────────────────

function CheckoutSuccessInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setVisible(true)
      // Clean the URL without re-rendering
      const url = new URL(window.location.href)
      url.searchParams.delete('checkout')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{
        background:   'var(--stable-cta)',
        boxShadow:    '0 8px 32px rgba(74,122,95,0.4)',
        minWidth:     260,
        maxWidth:     '90vw',
      }}
    >
      <CheckCircle2 size={18} className="text-white shrink-0" />
      <div className="flex-1">
        <p className="text-white font-black text-sm">Welcome to Pro 🎉</p>
        <p className="text-white/70 text-xs">All features unlocked. Trial starts today.</p>
      </div>
      <button onClick={() => setVisible(false)} className="shrink-0 hover:opacity-60 transition-opacity">
        <X size={14} className="text-white" />
      </button>
    </div>
  )
}

export function CheckoutSuccessToast() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessInner />
    </Suspense>
  )
}

// ── Trial expiry warning ──────────────────────────────────────────────────────

export function TrialBanner() {
  const { isTrialing, trialEndsAt } = useSubscription()
  const [dismissed, setDismissed]   = useState(false)

  if (!isTrialing || !trialEndsAt || dismissed) return null

  const daysLeft = Math.ceil(
    (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  if (daysLeft > 3) return null // only show when ≤3 days remain

  return (
    <div
      className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: 'rgba(196,165,90,0.12)',
        border:     '1px solid rgba(196,165,90,0.3)',
      }}
    >
      <Crown size={15} style={{ color: '#C4A55A' }} className="shrink-0" />
      <p className="text-xs flex-1" style={{ color: 'var(--stable-t1)' }}>
        <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left in your trial.</strong>{' '}
        <Link href="/pricing" className="underline" style={{ color: 'var(--cat-work)' }}>
          Continue with Pro
        </Link>
      </p>
      <button onClick={() => setDismissed(true)} className="hover:opacity-60 transition-opacity">
        <X size={13} style={{ color: 'var(--stable-t3)' }} />
      </button>
    </div>
  )
}

// ── Past-due / payment failed warning ────────────────────────────────────────

export function PastDueBanner() {
  const { isPastDue }         = useSubscription()
  const portalMutation        = { isPending: false } // placeholder — portal called from account page
  const [dismissed, setDis]   = useState(false)

  if (!isPastDue || dismissed) return null

  return (
    <div
      className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: 'rgba(192,85,112,0.1)',
        border:     '1px solid rgba(192,85,112,0.25)',
      }}
    >
      <AlertCircle size={15} style={{ color: '#C05570' }} className="shrink-0" />
      <p className="text-xs flex-1" style={{ color: 'var(--stable-t1)' }}>
        <strong>Payment failed.</strong> Update your card to keep Pro access.{' '}
        <Link href="/account" className="underline" style={{ color: '#C05570' }}>
          Fix now
        </Link>
      </p>
      <button onClick={() => setDis(true)} className="hover:opacity-60 transition-opacity">
        <X size={13} style={{ color: 'var(--stable-t3)' }} />
      </button>
    </div>
  )
}
