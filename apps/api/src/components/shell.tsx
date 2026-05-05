'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { useUser, useClerk } from '@clerk/nextjs'

const TABS = [
  { href: '/dashboard', label: 'Today',     icon: '🏠' },
  { href: '/tasks',     label: 'Tasks',     icon: '✓'  },
  { href: '/focus',     label: 'Focus',     icon: '⏱' },
  { href: '/reminders', label: 'Reminders', icon: '🔔' },
  { href: '/mind',      label: 'Mind',      icon: '🧘' },
] as const

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const { user }  = useUser()
  const { signOut } = useClerk()

  const initial = (user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? '?').toUpperCase()
  const name    = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? 'Account'
  const email   = user?.emailAddresses?.[0]?.emailAddress ?? ''

  return (
    <div className="min-h-svh bg-stable-bg">

      {/* ── Desktop sidebar (md+) ─────────────────────────── */}
      <aside
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-60"
        style={{
          background:  'var(--stable-nav)',
          borderRight: '1px solid var(--stable-nav-border)',
          boxShadow:   '2px 0 16px rgba(99,102,241,0.06)',
          zIndex:      40,
        }}
      >
        {/* Logo */}
        <div className="px-6 py-6" style={{ borderBottom: '1px solid var(--stable-nav-border)' }}>
          <p className="text-2xl font-black" style={{ color: 'var(--cat-work)' }}>stable.</p>
          <p className="text-[10px] font-semibold mt-0.5 uppercase tracking-widest" style={{ color: 'var(--stable-t3)' }}>
            Your focus companion
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {TABS.map((tab) => {
            const isActive = tab.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === tab.href || pathname.startsWith(tab.href + '/')
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  background:  isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                  color:       isActive ? 'var(--cat-work)' : 'var(--stable-t2)',
                  borderLeft:  isActive ? '3px solid var(--cat-work)' : '3px solid transparent',
                }}
              >
                <span className="text-base leading-none w-5 text-center">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        {user && (
          <div className="px-4 py-4" style={{ borderTop: '1px solid var(--stable-nav-border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: 'var(--stable-cta)' }}
              >
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--stable-t1)' }}>{name}</p>
                {email && (
                  <p className="text-[11px] truncate" style={{ color: 'var(--stable-t3)' }}>{email}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full text-xs font-semibold py-2 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: 'var(--stable-t2)', background: 'var(--stable-card-border)' }}
            >
              Sign out
            </button>
          </div>
        )}

        {/* Theme toggle */}
        <div className="px-6 py-5" style={{ borderTop: '1px solid var(--stable-nav-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--stable-t3)' }}>Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Page content ──────────────────────────────────── */}
      <main className="md:ml-60 min-h-svh">
        <div className="max-w-[480px] mx-auto pb-[76px] md:max-w-7xl md:mx-auto md:pb-12">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom tab bar (hidden md+) ──────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0"
        style={{
          background: 'var(--stable-nav)',
          borderTop:  '1px solid var(--stable-nav-border)',
          boxShadow:  '0 -4px 20px rgba(99,102,241,0.08)',
          zIndex:     50,
        }}
      >
        <div className="max-w-[480px] mx-auto flex justify-around">
          {TABS.map((tab) => {
            const isActive = tab.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === tab.href || pathname.startsWith(tab.href + '/')
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center pt-1 pb-3 px-3"
                style={{ minWidth: 56 }}
              >
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full"
                    style={{ background: 'var(--cat-work)' }}
                  />
                )}
                <span className="text-xl leading-none mt-2">{tab.icon}</span>
                <span
                  className="text-[9px] font-semibold uppercase tracking-wide mt-1"
                  style={{ color: isActive ? 'var(--cat-work)' : 'var(--stable-t3)' }}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
          <button
            onClick={() => signOut()}
            className="flex flex-col items-center pt-1 pb-3 px-3"
            style={{ minWidth: 56 }}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold leading-none mt-2"
              style={{ background: 'var(--cat-work)' }}
            >
              {initial}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wide mt-1" style={{ color: 'var(--stable-t3)' }}>
              Sign out
            </span>
          </button>
        </div>
      </nav>

    </div>
  )
}
