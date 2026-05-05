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

  const initial   = (user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? '?').toUpperCase()
  const name      = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? 'Account'
  const email     = user?.emailAddresses?.[0]?.emailAddress ?? ''

  return (
    <div className="min-h-svh bg-stable-bg">

      {/* ── Desktop sidebar (md+) ─────────────────────────── */}
      <aside
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-56 md:border-r"
        style={{ background: 'var(--stable-nav)', borderColor: 'var(--stable-nav-border)', zIndex: 40 }}
      >
        {/* Logo */}
        <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--stable-nav-border)' }}>
          <p className="text-xl font-black" style={{ color: 'var(--cat-work)' }}>stable.</p>
          <p className="text-[10px] font-medium mt-0.5 uppercase tracking-widest" style={{ color: 'var(--stable-t3)' }}>
            Focus companion
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
                  background: isActive ? 'rgba(79,58,255,0.1)' : 'transparent',
                  color:      isActive ? 'var(--cat-work)' : 'var(--stable-t2)',
                }}
              >
                <span className="text-base leading-none w-5 text-center">{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'var(--cat-work)' }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        {user && (
          <div className="px-4 py-4" style={{ borderTop: '1px solid var(--stable-nav-border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
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
            <span className="text-xs font-medium" style={{ color: 'var(--stable-t3)' }}>
              Appearance
            </span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Page content ──────────────────────────────────── */}
      <main className="md:ml-56 min-h-svh">
        {/* Mobile: 480px centred  |  Desktop: max-w-7xl centred in remaining space */}
        <div className="max-w-[480px] mx-auto pb-[72px] md:max-w-7xl md:mx-auto md:pb-12">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom tab bar (hidden md+) ──────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 border-t"
        style={{ background: 'var(--stable-nav)', borderColor: 'var(--stable-nav-border)', zIndex: 50 }}
      >
        <div className="max-w-[480px] mx-auto flex justify-around py-2 px-1">
          {TABS.map((tab) => {
            const isActive = tab.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === tab.href || pathname.startsWith(tab.href + '/')
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center gap-0.5 py-1 px-3"
              >
                <span className="text-xl leading-none">{tab.icon}</span>
                {isActive && (
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ background: 'var(--cat-work)' }}
                  />
                )}
                <span
                  className="text-[9px] font-semibold uppercase tracking-wide"
                  style={{ color: isActive ? 'var(--cat-work)' : 'var(--stable-t3)' }}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
          {/* Mobile sign-out */}
          <button
            onClick={() => signOut()}
            className="flex flex-col items-center gap-0.5 py-1 px-3"
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold leading-none"
              style={{ background: 'var(--cat-work)' }}
            >
              {initial}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'var(--stable-t3)' }}>
              Sign out
            </span>
          </button>
        </div>
      </nav>

    </div>
  )
}
