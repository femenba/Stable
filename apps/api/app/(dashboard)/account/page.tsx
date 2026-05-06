'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import Link from 'next/link'
import { Crown, ShieldCheck, Mail, LogOut, User, CreditCard } from 'lucide-react'
import { getUserPlan, isAdminUser } from '../../../src/lib/user-roles'
import { Card } from '../../../src/components/ui'

export default function AccountPage() {
  const { user, isLoaded } = useUser()
  const { signOut }        = useClerk()

  if (!isLoaded) {
    return (
      <div className="px-7 md:px-10 py-10">
        <div className="space-y-3 max-w-sm">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'var(--stable-card-border)' }} />
          ))}
        </div>
      </div>
    )
  }

  const email   = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const name    = user?.firstName ?? user?.lastName ?? email.split('@')[0] ?? 'Account'
  const initial = (user?.firstName?.[0] ?? email[0] ?? '?').toUpperCase()
  const plan    = getUserPlan(email)
  const admin   = isAdminUser(email)

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden" style={{ background: 'var(--stable-hero-bg)' }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(74,122,95,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div className="relative px-7 md:px-10 pt-10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>ACCOUNT</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black shrink-0" style={{ background: 'var(--stable-cta)' }}>
              {initial}
            </div>
            <div>
              <h1 className="text-[28px] md:text-[36px] font-black leading-[1.1]" style={{ color: 'var(--stable-t1)' }}>
                {name}
              </h1>
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

      <div className="px-7 md:px-10 py-8 max-w-2xl space-y-5">

        {/* Profile details */}
        <Card className="p-6">
          <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'var(--stable-t3)' }}>Profile</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'var(--stable-bg)' }}>
              <User size={14} style={{ color: 'var(--stable-t3)' }} />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--stable-t3)' }}>Name</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--stable-t1)' }}>{name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'var(--stable-bg)' }}>
              <Mail size={14} style={{ color: 'var(--stable-t3)' }} />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--stable-t3)' }}>Email</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--stable-t1)' }}>{email}</p>
              </div>
            </div>
            {admin && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'var(--stable-bg)' }}>
                <ShieldCheck size={14} style={{ color: 'var(--cat-work)' }} />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--stable-t3)' }}>Role</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--cat-work)' }}>Admin</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Subscription */}
        <Card className="p-6">
          <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'var(--stable-t3)' }}>Subscription</p>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: plan === 'pro' ? 'rgba(74,122,95,0.10)' : 'var(--sage-soft)' }}>
                <Crown size={18} style={{ color: 'var(--cat-work)' }} strokeWidth={1.7} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--stable-t1)' }}>{plan === 'pro' ? 'Pro Plan' : 'Free Plan'}</p>
                <p className="text-xs" style={{ color: 'var(--stable-t3)' }}>
                  {plan === 'pro' ? '£4.99/month · All features included' : 'Core features · Always free'}
                </p>
              </div>
            </div>
            {plan === 'free' && (
              <Link
                href="/pricing"
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-opacity hover:opacity-70"
                style={{ background: 'var(--sage-soft)', color: 'var(--cat-work)' }}
              >
                <Crown size={11} /> Upgrade
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'var(--stable-bg)' }}>
            <CreditCard size={14} style={{ color: 'var(--stable-t3)' }} />
            <p className="text-xs" style={{ color: 'var(--stable-t2)' }}>
              {plan === 'pro'
                ? 'Billing managed via Stripe · Cancel anytime'
                : 'No billing — Free plan has no time limit'}
            </p>
          </div>
        </Card>

        {/* Preferences placeholder */}
        <Card className="p-6">
          <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'var(--stable-t3)' }}>Preferences</p>
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
