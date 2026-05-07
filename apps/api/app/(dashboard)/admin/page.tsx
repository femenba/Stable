'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import {
  Users, UserPlus, Crown, TrendingUp,
  ShieldCheck, CreditCard, UserCheck, ArrowRight, Lock, Mail,
  RefreshCw, CheckCircle, XCircle, AlertCircle, Wrench,
} from 'lucide-react'
import { isAdminUser } from '../../../src/lib/user-roles'
import { Card } from '../../../src/components/ui'
import { trpc } from '../../../src/lib/trpc-client'

// ── Access denied ──────────────────────────────────────────────────────────────

function AccessDenied() {
  return (
    <div>
      <section className="relative overflow-hidden" style={{ background: 'var(--stable-hero-bg)' }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(192,85,112,0.07)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div className="relative px-7 md:px-10 pt-10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>ADMIN</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(192,85,112,0.10)' }}>
              <Lock size={18} style={{ color: '#C05570' }} strokeWidth={1.8} />
            </div>
            <h1 className="text-[28px] font-black leading-[1.1]" style={{ color: 'var(--stable-t1)' }}>
              Access Restricted
            </h1>
          </div>
          <p className="text-sm max-w-sm" style={{ color: 'var(--stable-t2)' }}>
            The admin area is only accessible to authorised accounts.
          </p>
        </div>
      </section>
      <div className="px-7 md:px-10 py-8 max-w-lg">
        <Card className="p-6 space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--stable-t1)' }}>Looking for something?</p>
          <div className="space-y-2">
            {[
              { href: '/pricing',                      icon: Crown,      label: 'View plans & pricing' },
              { href: '/dashboard',                    icon: TrendingUp, label: 'Go to your dashboard'  },
              { href: 'mailto:support@stableadhd.com', icon: Mail,       label: 'Contact support'       },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all hover:opacity-80"
                style={{ background: 'var(--stable-bg)', color: 'var(--stable-t1)' }}
              >
                <item.icon size={15} style={{ color: 'var(--stable-t3)' }} />
                <span>{item.label}</span>
                <ArrowRight size={13} className="ml-auto" style={{ color: 'var(--stable-t3)' }} />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── Inline feedback ────────────────────────────────────────────────────────────

function Feedback({ ok, message }: { ok: boolean; message: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: ok ? '#5E8B71' : '#C05570' }}>
      {ok ? <CheckCircle size={11} /> : <XCircle size={11} />}
      {message}
    </span>
  )
}

// ── User row ───────────────────────────────────────────────────────────────────

type UserData = {
  id: string
  email: string
  name: string | null
  clerk_id: string
  created_at: string
  updated_at: string
  subscriptions: Array<{
    plan: string
    status: string
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    trial_ends_at: string | null
    current_period_end: string | null
    updated_at: string
  }>
}

function UserRow({ user, onRefetch }: { user: UserData; onRefetch: () => void }) {
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)
  const sub = user.subscriptions?.[0] ?? null
  const plan   = sub?.plan   ?? 'free'
  const status = sub?.status ?? '—'

  const setPlan = trpc.admin.setUserPlan.useMutation({
    onSuccess: () => {
      setFeedback({ ok: true, msg: 'Updated' })
      onRefetch()
      setTimeout(() => setFeedback(null), 3000)
    },
    onError: (err) => setFeedback({ ok: false, msg: err.message }),
  })

  const reset = trpc.admin.resetUserSubscription.useMutation({
    onSuccess: () => {
      setFeedback({ ok: true, msg: 'Reset — user is now free with no Stripe data' })
      onRefetch()
      setTimeout(() => setFeedback(null), 4000)
    },
    onError: (err) => setFeedback({ ok: false, msg: err.message }),
  })

  const isPending = setPlan.isPending || reset.isPending
  const isPro     = plan === 'pro' && status !== 'canceled'

  return (
    <div className="border rounded-xl px-4 py-3 space-y-1" style={{ borderColor: 'var(--stable-card-border)', background: 'var(--stable-card)' }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold truncate" style={{ color: 'var(--stable-t1)' }}>
              {user.name ?? user.email.split('@')[0]}
            </p>
            <span
              className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={isPro
                ? { background: 'rgba(139,126,200,0.12)', color: '#8B7EC8' }
                : { background: 'var(--sage-soft)', color: 'var(--cat-work)' }}
            >
              {isPro && <Crown size={8} />}
              {isPro ? `pro · ${status}` : 'free'}
            </span>
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--stable-t3)' }}>{user.email}</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--stable-t3)' }}>
            Joined {new Date(user.created_at).toLocaleDateString()}
            {sub?.stripe_customer_id && (
              <> · Stripe: <code className="text-[9px]">{sub.stripe_customer_id}</code></>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          <button
            onClick={() => setPlan.mutate({ userId: user.id, plan: 'pro' })}
            disabled={isPending || isPro}
            className="text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'rgba(139,126,200,0.12)', color: '#8B7EC8' }}
          >
            {setPlan.isPending ? '…' : 'Pro'}
          </button>
          <button
            onClick={() => setPlan.mutate({ userId: user.id, plan: 'free' })}
            disabled={isPending || !isPro}
            className="text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'var(--sage-soft)', color: 'var(--cat-work)' }}
          >
            Free
          </button>
          <button
            onClick={() => {
              if (confirm(`Reset ${user.email} to clean free state? This deletes their subscription row and clears all caches.`)) {
                reset.mutate({ userId: user.id })
              }
            }}
            disabled={isPending}
            title="Delete subscription row + clear all caches — user keeps their Clerk login"
            className="text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'rgba(192,85,112,0.08)', color: '#C05570' }}
          >
            {reset.isPending ? '…' : 'Reset'}
          </button>
        </div>
      </div>

      {feedback && <Feedback ok={feedback.ok} message={feedback.msg} />}
    </div>
  )
}

// ── Stripe repair panel ────────────────────────────────────────────────────────

type RepairResult = {
  customerId: string
  clerkId: string | null
  oldEmail: string
  newEmail: string
  stripeUpdated: boolean
  supabaseUpdated: boolean
  error?: string
}

function StripeRepairPanel() {
  const [result, setResult] = useState<{
    stripeCustomersChecked: number
    stripeCustomersFixed: number
    stripeCustomersFailed: number
    supabaseUsersStillBroken: number
    details: RepairResult[]
  } | null>(null)

  const repair = trpc.admin.repairStripeEmails.useMutation({
    onSuccess: (d) => setResult(d),
    onError:   (e) => alert('Repair failed: ' + e.message),
  })

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(192,85,112,0.08)' }}>
          <Wrench size={16} style={{ color: '#C05570' }} strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--stable-t1)' }}>Stripe Email Repair</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--stable-t2)' }}>
            Finds Stripe customers created with <code className="px-1 rounded" style={{ background: 'var(--stable-bg)' }}>unknown@stableadhd.com</code> and updates them to the user's real email.
          </p>
        </div>
      </div>

      <button
        onClick={() => repair.mutate()}
        disabled={repair.isPending}
        className="w-full rounded-xl py-2.5 text-xs font-black uppercase tracking-wide transition-all hover:opacity-80 disabled:opacity-40"
        style={{ background: 'rgba(192,85,112,0.10)', color: '#C05570' }}
      >
        {repair.isPending ? 'Repairing…' : 'Run Stripe Email Repair'}
      </button>

      {result && (
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Checked',           value: result.stripeCustomersChecked,    color: 'var(--stable-t2)' },
              { label: 'Fixed',             value: result.stripeCustomersFixed,      color: '#5E8B71' },
              { label: 'Failed',            value: result.stripeCustomersFailed,     color: '#C05570' },
              { label: 'Still broken in DB', value: result.supabaseUsersStillBroken, color: result.supabaseUsersStillBroken > 0 ? '#C05570' : 'var(--stable-t2)' },
            ].map((s) => (
              <div key={s.label} className="px-3 py-2 rounded-xl" style={{ background: 'var(--stable-bg)' }}>
                <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--stable-t3)' }}>{s.label}</p>
                <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {result.details.length > 0 && (
            <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
              {result.details.map((r) => (
                <div key={r.customerId} className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px]" style={{ background: 'var(--stable-bg)' }}>
                  {r.stripeUpdated
                    ? <CheckCircle size={11} style={{ color: '#5E8B71', flexShrink: 0 }} />
                    : <XCircle    size={11} style={{ color: '#C05570', flexShrink: 0 }} />}
                  <span className="truncate" style={{ color: 'var(--stable-t2)' }}>
                    <code>{r.customerId}</code>
                    {r.newEmail ? ` → ${r.newEmail}` : r.error ? ` · ${r.error}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ── Admin dashboard ────────────────────────────────────────────────────────────

function AdminDashboard({ email }: { email: string }) {
  const { data: stats, refetch: refetchStats, isLoading: statsLoading } = trpc.admin.getStats.useQuery()
  const { data: users, refetch: refetchUsers, isLoading: usersLoading } = trpc.admin.listUsers.useQuery()

  function refetchAll() {
    refetchStats()
    refetchUsers()
  }

  const STAT_CARDS = [
    { icon: Users,      label: 'Total Users',   value: statsLoading ? '…' : String(stats?.totalUsers ?? 0),          color: '#4A7A5F', bg: 'rgba(74,122,95,0.08)' },
    { icon: UserCheck,  label: 'Free Users',    value: statsLoading ? '…' : String(stats?.freeCount ?? 0),            color: '#4A8FAF', bg: 'rgba(74,143,175,0.08)' },
    { icon: Crown,      label: 'Pro Users',     value: statsLoading ? '…' : String(stats?.proCount ?? 0),             color: '#8B7EC8', bg: 'rgba(139,126,200,0.08)' },
    { icon: TrendingUp, label: 'MRR',           value: statsLoading ? '…' : `£${stats?.mrr?.toFixed(2) ?? '0.00'}`,  color: '#5E8B71', bg: 'rgba(94,139,113,0.08)' },
    { icon: UserPlus,   label: 'New this week', value: statsLoading ? '…' : String(stats?.newThisWeek ?? 0),          color: '#C05570', bg: 'rgba(192,85,112,0.08)' },
    { icon: CreditCard, label: 'Trialing',      value: statsLoading ? '…' : String(stats?.proTrialing ?? 0),          color: '#7A8F82', bg: 'rgba(122,143,130,0.08)' },
  ]

  return (
    <div>
      <section className="relative overflow-hidden" style={{ background: 'var(--stable-hero-bg)' }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(74,122,95,0.07)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div className="relative px-7 md:px-10 pt-10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>ADMIN</p>
          <div className="flex items-start gap-4 mb-2">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(74,122,95,0.10)' }}>
              <ShieldCheck size={20} style={{ color: 'var(--cat-work)' }} strokeWidth={1.7} />
            </div>
            <div>
              <h1 className="text-[32px] md:text-[40px] font-black leading-[1.1]" style={{ color: 'var(--stable-t1)' }}>
                Admin Dashboard
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--stable-t2)' }}>
                Overview of users, subscriptions, and support.
              </p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
            style={{ background: 'var(--sage-soft)', color: 'var(--cat-work)' }}>
            <ShieldCheck size={11} /> Admin · {email}
          </div>
        </div>
      </section>

      <div className="px-7 md:px-10 py-8">
        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--stable-t3)' }}>Overview</p>
          <button
            onClick={refetchAll}
            className="flex items-center gap-1.5 text-[10px] font-bold transition-opacity hover:opacity-70"
            style={{ color: 'var(--stable-t3)' }}
          >
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {STAT_CARDS.map((s) => (
            <Card key={s.label} className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                  <s.icon size={16} style={{ color: s.color }} strokeWidth={1.8} />
                </div>
                <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--stable-t2)' }}>{s.label}</p>
              </div>
              <p className="text-2xl font-black leading-none mb-1" style={{ color: 'var(--stable-t1)' }}>{s.value}</p>
            </Card>
          ))}
        </div>

        {/* User management */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--stable-t3)' }}>
            User Management
            {users && <span className="ml-2 font-normal normal-case tracking-normal">({users.length} users)</span>}
          </p>
          <button
            onClick={refetchAll}
            className="flex items-center gap-1.5 text-[10px] font-bold transition-opacity hover:opacity-70"
            style={{ color: 'var(--stable-t3)' }}
          >
            <RefreshCw size={11} /> Refresh list
          </button>
        </div>

        <div className="space-y-2 mb-10 max-w-4xl">
          {usersLoading && (
            [0, 1, 2].map((i) => (
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--stable-card-border)' }} />
            ))
          )}
          {!usersLoading && !users?.length && (
            <p className="text-sm" style={{ color: 'var(--stable-t3)' }}>No users found. Check Supabase connection.</p>
          )}
          {users?.map((u: UserData) => (
            <UserRow key={u.id} user={u} onRefetch={refetchAll} />
          ))}
        </div>

        {/* Stripe repair */}
        <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'var(--stable-t3)' }}>Maintenance</p>
        <div className="max-w-lg mb-10">
          <StripeRepairPanel />
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, isLoaded } = useUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const admin = isAdminUser(email)

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

  if (!admin) return <AccessDenied />
  return <AdminDashboard email={email} />
}
