'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useSearchParams, useRouter } from 'next/navigation'
import { Crown, ShieldCheck, Mail, LogOut, User, CreditCard, Loader2, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react'
import { isAdminUser } from '../../../src/lib/user-roles'
import { useSubscription } from '../../../src/lib/use-subscription'
import { Card } from '../../../src/components/ui'
import { trpc } from '../../../src/lib/trpc-client'
import { useState, useEffect } from 'react'

export default function AccountPage() {
  const { user, isLoaded } = useUser()
  const { signOut }        = useClerk()
  const searchParams       = useSearchParams()
  const router             = useRouter()

  // Poll after Stripe redirects back with ?checkout=success until Pro is confirmed.
  const checkoutSuccess = searchParams.get('checkout') === 'success'
  const [activating, setActivating] = useState(checkoutSuccess)

  const {
    plan, status, isPro, isTrialing, isPastDue,
    trialEndsAt, currentPeriodEnd, cancelAtPeriodEnd,
  } = useSubscription({ pollUntilPro: activating })

  // Stop polling once Pro status is confirmed; clean the URL param.
  useEffect(() => {
    if (activating && isPro) {
      setActivating(false)
      router.replace('/account')
    }
  }, [activating, isPro, router])

  // Safety timeout — stop polling after 45 s regardless.
  useEffect(() => {
    if (!activating) return
    const t = setTimeout(() => setActivating(false), 45_000)
    return () => clearTimeout(t)
  }, [activating])

  const portalMutation   = trpc.subscriptions.createPortal.useMutation()
  const checkoutMutation = trpc.subscriptions.createCheckout.useMutation()
  const [redirecting,    setRedirecting]    = useState(false)
  const [checkoutError,  setCheckoutError]  = useState<string | null>(null)

  if (!isLoaded) {
    return (
      <div className="px-7 md:px-10 py-10">
        <div className="space-y-3 max-w-sm">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse"
                 style={{ background: 'var(--stable-card-border)' }} />
          ))}
        </div>
      </div>
    )
  }

  const email   = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const name    = user?.firstName ?? user?.lastName ?? email.split('@')[0] ?? 'Account'
  const initial = (user?.firstName?.[0] ?? email[0] ?? '?').toUpperCase()
  const admin   = isAdminUser(email)

  async function handleBillingPortal() {
    setRedirecting(true)
    try {
      const { url } = await portalMutation.mutateAsync()
      if (url) window.location.href = url
    } catch { setRedirecting(false) }
  }

  async function handleUpgrade() {
    setRedirecting(true)
    setCheckoutError(null)
    try {
      const { url } = await checkoutMutation.mutateAsync()
      if (url) window.location.href = url
      else setRedirecting(false)
    } catch (err: unknown) {
      setRedirecting(false)
      setCheckoutError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null

  const trialEnd  = formatDate(trialEndsAt)
  const periodEnd = formatDate(currentPeriodEnd)

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden" style={{ background: 'var(--stable-hero-bg)' }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 280, height: 280,
          borderRadius: '50%', background: 'rgba(74,122,95,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div className="relative px-7 md:px-10 pt-10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3"
             style={{ color: 'var(--stable-t3)' }}>ACCOUNT</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black shrink-0"
                 style={{ background: 'var(--stable-cta)' }}>
              {initial}
            </div>
            <div>
              <h1 className="text-[28px] md:text-[36px] font-black leading-[1.1]"
                  style={{ color: 'var(--stable-t1)' }}>{name}</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--stable-t2)' }}>{email}</p>
            </div>
          </div>
          {admin && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
                 style={{ background: 'var(--sage-soft)', color: 'var(--cat-work)' }}>
              <ShieldCheck size={11} /> Admin account
            </div>
          )}
        </div>
      </section>

      {/* Post-checkout activation banner */}
      {activating && !isPro && (
        <div className="px-7 md:px-10 pt-6">
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
               style={{ background: 'rgba(74,122,95,0.08)', border: '1px solid rgba(74,122,95,0.2)' }}>
            <Loader2 size={16} className="animate-spin shrink-0" style={{ color: 'var(--cat-work)' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--stable-t1)' }}>
                Activating your Pro subscription…
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--stable-t2)' }}>
                This usually takes a few seconds. The page will update automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {activating && isPro && (
        <div className="px-7 md:px-10 pt-6">
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
               style={{ background: 'rgba(74,122,95,0.1)', border: '1px solid rgba(74,122,95,0.3)' }}>
            <CheckCircle2 size={16} className="shrink-0" style={{ color: 'var(--cat-work)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--stable-t1)' }}>
              Welcome to Stable Pro! Your trial is now active.
            </p>
          </div>
        </div>
      )}

      <div className="px-7 md:px-10 py-8 max-w-2xl space-y-5">

        {/* Profile */}
        <Card className="p-6">
          <p className="text-[10px] font-black uppercase tracking-widest mb-4"
             style={{ color: 'var(--stable-t3)' }}>Profile</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                 style={{ background: 'var(--stable-bg)' }}>
              <User size={14} style={{ color: 'var(--stable-t3)' }} />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider"
                   style={{ color: 'var(--stable-t3)' }}>Name</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--stable-t1)' }}>{name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                 style={{ background: 'var(--stable-bg)' }}>
              <Mail size={14} style={{ color: 'var(--stable-t3)' }} />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider"
                   style={{ color: 'var(--stable-t3)' }}>Email</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--stable-t1)' }}>{email}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Subscription */}
        <Card className="p-6">
          <p className="text-[10px] font-black uppercase tracking-widest mb-4"
             style={{ color: 'var(--stable-t3)' }}>Subscription</p>

          {/* Plan header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                 style={{ background: isPro ? 'rgba(74,122,95,0.1)' : 'var(--sage-soft)' }}>
              <Crown size={18} style={{ color: 'var(--cat-work)' }} strokeWidth={1.7} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm" style={{ color: 'var(--stable-t1)' }}>
                  {isPro ? 'stable. Pro' : 'Free Plan'}
                </p>
                {isTrialing && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(196,165,90,0.15)', color: '#C4A55A' }}>
                    Trial
                  </span>
                )}
                {isPastDue && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(192,85,112,0.1)', color: '#C05570' }}>
                    Payment failed
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: 'var(--stable-t3)' }}>
                {isPro ? '£4.99/month · All features included' : 'Core features · Always free'}
              </p>
            </div>
          </div>

          {/* Subscription details */}
          <div className="space-y-2 mb-4">
            {isTrialing && trialEnd && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                   style={{ background: 'rgba(196,165,90,0.06)', border: '1px solid rgba(196,165,90,0.2)' }}>
                <Crown size={13} style={{ color: '#C4A55A' }} />
                <p className="text-xs" style={{ color: 'var(--stable-t1)' }}>
                  Trial ends <strong>{trialEnd}</strong>. You won't be charged until then.
                </p>
              </div>
            )}
            {isPastDue && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                   style={{ background: 'rgba(192,85,112,0.08)', border: '1px solid rgba(192,85,112,0.2)' }}>
                <AlertCircle size={13} style={{ color: '#C05570' }} />
                <p className="text-xs" style={{ color: 'var(--stable-t1)' }}>
                  Payment failed. Update your card to keep Pro access.
                </p>
              </div>
            )}
            {isPro && !isTrialing && periodEnd && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                   style={{ background: 'var(--stable-bg)' }}>
                <CreditCard size={13} style={{ color: 'var(--stable-t3)' }} />
                <p className="text-xs" style={{ color: 'var(--stable-t2)' }}>
                  {cancelAtPeriodEnd
                    ? <>Cancels on <strong>{periodEnd}</strong>. Access until then.</>
                    : <>Renews on <strong>{periodEnd}</strong>.</>}
                </p>
              </div>
            )}
            {!isPro && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                   style={{ background: 'var(--stable-bg)' }}>
                <CreditCard size={13} style={{ color: 'var(--stable-t3)' }} />
                <p className="text-xs" style={{ color: 'var(--stable-t2)' }}>
                  No billing — Free plan has no time limit.
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {isPro ? (
            <button
              onClick={handleBillingPortal}
              disabled={redirecting || portalMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)',
                color: 'var(--stable-t1)' }}
            >
              {redirecting ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
              Manage billing & subscription
            </button>
          ) : (
            <>
              <button
                onClick={handleUpgrade}
                disabled={redirecting || checkoutMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: 'var(--stable-cta)', color: '#fff', boxShadow: 'var(--shadow-cta)' }}
              >
                {redirecting ? <Loader2 size={14} className="animate-spin" /> : <Crown size={14} />}
                Start 7-day free trial
              </button>
              {checkoutError && (
                <p className="text-center text-xs mt-2 font-medium" style={{ color: '#e05252' }}>
                  {checkoutError}
                </p>
              )}
            </>
          )}
        </Card>

        {/* Preferences placeholder */}
        <Card className="p-6">
          <p className="text-[10px] font-black uppercase tracking-widest mb-4"
             style={{ color: 'var(--stable-t3)' }}>Preferences</p>
          <p className="text-sm" style={{ color: 'var(--stable-t2)' }}>
            Theme and notification settings are coming soon.
          </p>
        </Card>

        {/* Sign out */}
        <Card className="p-4">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-70"
            style={{ color: '#C05570' }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </Card>

      </div>
    </div>
  )
}
