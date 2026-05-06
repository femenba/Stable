'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, CheckSquare, Timer, Bell, Leaf,
  Sun, Moon, Crown, Settings, Mail, LogOut, X, ChevronRight,
} from 'lucide-react'
import { useUser, useClerk } from '@clerk/nextjs'
import { ThemeToggle } from './theme-toggle'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Today'     },
  { href: '/tasks',     icon: CheckSquare,     label: 'Tasks'     },
  { href: '/focus',     icon: Timer,           label: 'Focus'     },
  { href: '/reminders', icon: Bell,            label: 'Reminders' },
  { href: '/mind',      icon: Leaf,            label: 'Mind'      },
] as const

function isActive(href: string, pathname: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(href + '/')
}

// ── Profile panel ─────────────────────────────────────────────────────────────

function ProfilePanel({
  open,
  onClose,
  initial,
  name,
  email,
  onSignOut,
}: {
  open: boolean
  onClose: () => void
  initial: string
  name: string
  email: string
  onSignOut: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="md:hidden fixed inset-0 bg-black/30 z-[48] fade-in"
        onClick={onClose}
      />
      <div
        ref={ref}
        className="panel-in fixed z-[49] rounded-2xl overflow-hidden"
        style={{
          background:  'var(--stable-card)',
          border:      '1px solid var(--stable-card-border)',
          boxShadow:   'var(--shadow-panel)',
          // desktop: anchored to sidebar right edge, bottom
          left: 'clamp(80px, 80px, 80px)',
          bottom: 16,
          width: 280,
          // mobile: full-width above bottom nav
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--stable-card-border)' }}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
            style={{ background: 'var(--stable-cta)' }}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: 'var(--stable-t1)' }}>{name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--stable-t3)' }}>{email}</p>
          </div>
          <button onClick={onClose} className="shrink-0 hover:opacity-60 transition-opacity">
            <X size={15} style={{ color: 'var(--stable-t3)' }} />
          </button>
        </div>

        {/* Plan */}
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--stable-card-border)' }}>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: 'var(--sage-soft)', color: 'var(--cat-work)' }}
            >
              Free plan
            </span>
          </div>
          <Link
            href="/pricing"
            onClick={onClose}
            className="flex items-center gap-1 text-xs font-bold transition-opacity hover:opacity-70"
            style={{ color: 'var(--cat-work)' }}
          >
            <Crown size={11} />
            Upgrade
          </Link>
        </div>

        {/* Links */}
        <div className="py-1.5">
          {[
            { href: '/pricing',  icon: Crown,    label: 'Pricing & Plans'   },
            { href: '/admin',    icon: Settings, label: 'Account Settings'  },
            { href: '/admin',    icon: Mail,     label: 'Contact Support'   },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-all hover:opacity-70"
              style={{ color: 'var(--stable-t1)' }}
            >
              <item.icon size={15} style={{ color: 'var(--stable-t3)' }} />
              <span>{item.label}</span>
              <ChevronRight size={13} className="ml-auto" style={{ color: 'var(--stable-t3)' }} />
            </Link>
          ))}
        </div>

        {/* Sign out */}
        <div style={{ borderTop: '1px solid var(--stable-card-border)' }} className="p-2">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-70"
            style={{ color: '#C05570' }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}

// ── AppShell ──────────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname            = usePathname()
  const { user }            = useUser()
  const { signOut }         = useClerk()
  const [profileOpen, setProfileOpen] = useState(false)

  const name    = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ?? 'Account'
  const email   = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const initial = (user?.firstName?.[0] ?? email[0] ?? '?').toUpperCase()

  return (
    <div className="min-h-svh" style={{ background: 'var(--stable-bg)' }}>

      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0"
        style={{
          width:       72,
          background:  'var(--stable-nav)',
          borderRight: '1px solid var(--stable-nav-border)',
          boxShadow:   '1px 0 12px rgba(0,0,0,0.04)',
          zIndex:      40,
        }}
      >
        {/* Brand — clickable → /dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ paddingTop: 22, paddingBottom: 18 }}
          title="stable. — Home"
        >
          <div
            className="w-9 h-9 rounded-[12px] flex items-center justify-center text-white font-black text-[14px]"
            style={{ background: 'var(--stable-cta)', boxShadow: '0 4px 14px rgba(74,122,95,0.45)' }}
          >
            S
          </div>
        </Link>

        <div style={{ height: 1, background: 'var(--stable-nav-border)', margin: '0 14px 8px' }} />

        {/* Nav */}
        <nav className="flex-1 flex flex-col items-center gap-0.5 px-2 py-2">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = isActive(href, pathname)
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-150 hover:opacity-80"
                style={{
                  background: active ? 'var(--sage-soft)' : 'transparent',
                  color:      active ? 'var(--cat-work)' : 'var(--stable-t3)',
                }}
              >
                {active && (
                  <span
                    className="nav-indicator absolute top-1/2 -translate-y-1/2 -left-2 rounded-r-full"
                    style={{ width: 3, height: 20, background: 'var(--cat-work)' }}
                  />
                )}
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div
          className="flex flex-col items-center gap-2.5 px-2 py-4"
          style={{ borderTop: '1px solid var(--stable-nav-border)' }}
        >
          <ThemeToggle compact />
          <button
            onClick={() => setProfileOpen((v) => !v)}
            title={name}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-black transition-all hover:opacity-80 hover:scale-105"
            style={{
              background: 'var(--stable-cta)',
              outline: profileOpen ? `2px solid var(--cat-work)` : 'none',
              outlineOffset: 2,
            }}
          >
            {initial}
          </button>
        </div>
      </aside>

      {/* ── Profile panel ─────────────────────────────── */}
      <ProfilePanel
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        initial={initial}
        name={name}
        email={email}
        onSignOut={() => { setProfileOpen(false); signOut() }}
      />

      {/* ── Main content ──────────────────────────────── */}
      <main className="md:ml-[72px] pb-[72px] md:pb-0 min-h-svh">
        {children}
      </main>

      {/* ── Mobile bottom nav ─────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0"
        style={{
          height:      68,
          background:  'var(--stable-nav)',
          borderTop:   '1px solid var(--stable-nav-border)',
          boxShadow:   '0 -4px 20px rgba(0,0,0,0.06)',
          zIndex:      50,
        }}
      >
        <div className="flex items-stretch justify-around h-full px-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = isActive(href, pathname)
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 transition-opacity"
              >
                {active && (
                  <span
                    className="nav-indicator absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
                    style={{ width: 24, height: 2.5, background: 'var(--cat-work)' }}
                  />
                )}
                <span
                  className="w-9 h-8 rounded-[14px] flex items-center justify-center transition-all duration-150"
                  style={{
                    background: active ? 'var(--sage-soft)' : 'transparent',
                    color:      active ? 'var(--cat-work)' : 'var(--stable-t3)',
                  }}
                >
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.7} />
                </span>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.06em]"
                  style={{ color: active ? 'var(--cat-work)' : 'var(--stable-t3)' }}
                >
                  {label}
                </span>
              </Link>
            )
          })}
          {/* Me */}
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex flex-col items-center justify-center gap-1 flex-1 transition-opacity"
          >
            <span
              className="w-9 h-8 rounded-[14px] flex items-center justify-center"
              style={{ background: profileOpen ? 'var(--sage-soft)' : 'transparent' }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                style={{ background: 'var(--stable-cta)' }}
              >
                {initial}
              </span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--stable-t3)' }}>Me</span>
          </button>
        </div>
      </nav>

    </div>
  )
}
