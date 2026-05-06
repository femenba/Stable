'use client'

import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import {
  Users, UserPlus, Crown, MessageSquare, TrendingUp,
  ShieldCheck, CreditCard, UserCheck, ArrowRight, Lock, Mail,
} from 'lucide-react'
import { isAdminUser, getUserPlan } from '../../../src/lib/user-roles'
import { Card } from '../../../src/components/ui'

const STATS = [
  { icon: Users,      label: 'Total Users',    value: '—', sub: 'awaiting data',    color: '#4A7A5F', bg: 'rgba(74,122,95,0.08)'   },
  { icon: UserCheck,  label: 'Free Users',     value: '—', sub: 'on free plan',     color: '#4A8FAF', bg: 'rgba(74,143,175,0.08)' },
  { icon: Crown,      label: 'Pro Users',      value: '—', sub: 'on pro plan',      color: '#8B7EC8', bg: 'rgba(139,126,200,0.08)' },
  { icon: TrendingUp, label: 'MRR',            value: '£—', sub: 'monthly recurring', color: '#5E8B71', bg: 'rgba(94,139,113,0.08)'  },
  { icon: UserPlus,   label: 'New this week',  value: '—', sub: 'recent signups',   color: '#C05570', bg: 'rgba(192,85,112,0.08)'  },
  { icon: CreditCard, label: 'Churn rate',     value: '—', sub: 'this month',       color: '#7A8F82', bg: 'rgba(122,143,130,0.08)' },
]

const SECTIONS = [
  {
    icon:  MessageSquare,
    label: 'Support Messages',
    desc:  'Incoming contact form submissions and support requests.',
    color: '#4A8FAF',
    bg:    'rgba(74,143,175,0.08)',
    rows:  ['No messages yet', 'Connect backend to display', 'Supabase table: contact_messages'],
  },
  {
    icon:  Users,
    label: 'User Management',
    desc:  'Registered accounts, roles, and activity overview.',
    color: '#4A7A5F',
    bg:    'rgba(74,122,95,0.08)',
    rows:  ['No users loaded', 'Connect to Clerk user API', 'Requires server-side query'],
  },
  {
    icon:  CreditCard,
    label: 'Subscriptions',
    desc:  'Plan upgrades, billing status, and MRR tracking.',
    color: '#8B7EC8',
    bg:    'rgba(139,126,200,0.08)',
    rows:  ['0 Pro accounts', '0 Free accounts', 'Connect Stripe for billing data'],
  },
  {
    icon:  UserPlus,
    label: 'Recent Sign-ups',
    desc:  'Newest users who joined the platform.',
    color: '#C05570',
    bg:    'rgba(192,85,112,0.08)',
    rows:  ['No recent signups', 'Connect to Clerk user list API', 'Sync via webhook or cron'],
  },
]

// ── Access denied for non-admins ──────────────────────────────────────────────

function AccessDenied({ plan }: { plan: 'pro' | 'free' }) {
  return (
    <div>
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--stable-hero-bg)' }}
      >
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
            The admin area is only accessible to authorised accounts. Your current plan: <strong>{plan === 'pro' ? 'Pro' : 'Free'}</strong>.
          </p>
        </div>
      </section>
      <div className="px-7 md:px-10 py-8 max-w-lg">
        <Card className="p-6 space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--stable-t1)' }}>Looking for something?</p>
          <div className="space-y-2">
            {[
              { href: '/pricing', icon: Crown,        label: 'View plans & pricing' },
              { href: '/dashboard', icon: TrendingUp, label: 'Go to your dashboard'  },
              { href: 'mailto:support@stableadhd.com', icon: Mail, label: 'Contact support' },
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

// ── Admin dashboard ───────────────────────────────────────────────────────────

function AdminDashboard({ email }: { email: string }) {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--stable-hero-bg)' }}
      >
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

      {/* Stats grid */}
      <div className="px-7 md:px-10 py-8">
        <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'var(--stable-t3)' }}>Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {STATS.map((s) => (
            <Card key={s.label} className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                  <s.icon size={16} style={{ color: s.color }} strokeWidth={1.8} />
                </div>
                <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--stable-t2)' }}>{s.label}</p>
              </div>
              <p className="text-2xl font-black leading-none mb-1" style={{ color: 'var(--stable-t1)' }}>{s.value}</p>
              <p className="text-[10px]" style={{ color: 'var(--stable-t3)' }}>{s.sub}</p>
            </Card>
          ))}
        </div>

        {/* Sections */}
        <div className="grid md:grid-cols-2 gap-5 max-w-4xl">
          {SECTIONS.map((s) => (
            <Card key={s.label} className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                  <s.icon size={18} style={{ color: s.color }} strokeWidth={1.7} />
                </div>
                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: 'var(--stable-t1)' }}>{s.label}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--stable-t2)' }}>{s.desc}</p>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {s.rows.map((row) => (
                  <div
                    key={row}
                    className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: 'var(--stable-bg)' }}
                  >
                    <span className="text-xs" style={{ color: 'var(--stable-t2)' }}>{row}</span>
                  </div>
                ))}
              </div>

              <button
                className="flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-70"
                style={{ color: s.color }}
              >
                View details <ArrowRight size={12} />
              </button>
            </Card>
          ))}
        </div>

        {/* Note */}
        <p className="mt-8 text-xs" style={{ color: 'var(--stable-t3)' }}>
          Placeholder data — connect Supabase queries and Clerk API to populate live stats.
        </p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, isLoaded } = useUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const admin = isAdminUser(email)
  const plan  = getUserPlan(email)

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

  if (!admin) return <AccessDenied plan={plan} />
  return <AdminDashboard email={email} />
}
