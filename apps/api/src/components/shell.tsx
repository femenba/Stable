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
  const pathname    = usePathname()
  const { user }    = useUser()
  const { signOut } = useClerk()

  const initial = (user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? '?').toUpperCase()
  const name    = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? 'Account'
  const email   = user?.emailAddresses?.[0]?.emailAddress ?? ''

  return (
    <div className="min-h-svh" style={{ background: 'var(--stable-bg)' }}>

      {/* ── Desktop sidebar ──────────────────────────────── */}
      <aside
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-60"
        style={{
          background:  'var(--stable-nav)',
          borderRight: '1px solid var(--stable-nav-border)',
          boxShadow:   '4px 0 24px rgba(94,139,113,0.06)',
          zIndex:      40,
        }}
      >
        {/* Brand */}
        <div className="px-5 py-6" style={{ borderBottom: '1px solid var(--stable-nav-border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
              style={{ background: 'var(--stable-cta)', boxShadow: '0 4px 12px rgba(94,139,113,0.4)' }}
            >
              S
            </div>
            <div>
              <p className="text-[17px] font-black leading-none" style={{ color: 'var(--stable-t1)' }}>stable.</p>
              <p className="text-[10px] font-medium mt-0.5 uppercase tracking-widest" style={{ color: 'var(--stable-t3)' }}>
                Focus companion
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {TABS.map((tab) => {
            const isActive = tab.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === tab.href || pathname.startsWith(tab.href + '/')
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: isActive ? 'rgba(94,139,113,0.1)' : 'transparent',
                  color:      isActive ? 'var(--cat-work)' : 'var(--stable-t2)',
                }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 transition-all"
                  style={{
                    background: isActive ? 'rgba(94,139,113,0.15)' : 'rgba(0,0,0,0.03)',
                    fontSize:   '15px',
                  }}
                >
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-4 rounded-full shrink-0"
                    style={{ background: 'var(--cat-work)', opacity: 0.6 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        {user && (
          <div className="px-4 py-4" style={{ borderTop: '1px solid var(--stable-nav-border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0"
                style={{ background: 'var(--stable-cta)', boxShadow: '0 2px 8px rgba(94,139,113,0.35)' }}
              >
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--stable-t1)' }}>{name}</p>
                {email && <p className="text-[11px] truncate" style={{ color: 'var(--stable-t3)' }}>{email}</p>}
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full text-xs font-semibold py-2 rounded-xl transition-opacity hover:opacity-70"
              style={{ color: 'var(--stable-t2)', background: 'var(--stable-bg)', border: '1px solid var(--stable-card-border)' }}
            >
              Sign out
            </button>
          </div>
        )}

        {/* Theme */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid var(--stable-nav-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--stable-t3)' }}>Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Page content ─────────────────────────────────── */}
      <main className="md:ml-60 min-h-svh">
        <div className="max-w-[480px] mx-auto pb-[80px] md:max-w-none md:pb-12">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom nav ────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0"
        style={{
          background: 'var(--stable-nav)',
          borderTop:  '1px solid var(--stable-nav-border)',
          boxShadow:  '0 -4px 24px rgba(94,139,113,0.08)',
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
                className="relative flex flex-col items-center pt-1 pb-3 px-2"
                style={{ minWidth: 52 }}
              >
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full"
                    style={{ background: 'var(--cat-work)' }}
                  />
                )}
                <span
                  className="mt-2 w-8 h-8 rounded-xl flex items-center justify-center text-[17px] transition-all"
                  style={{
                    background: isActive ? 'rgba(94,139,113,0.1)' : 'transparent',
                  }}
                >
                  {tab.icon}
                </span>
                <span
                  className="text-[9px] font-semibold uppercase tracking-wide mt-0.5"
                  style={{ color: isActive ? 'var(--cat-work)' : 'var(--stable-t3)' }}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
          <button
            onClick={() => signOut()}
            className="flex flex-col items-center pt-1 pb-3 px-2"
            style={{ minWidth: 52 }}
          >
            <span
              className="mt-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-black"
              style={{ background: 'var(--stable-cta)' }}
            >
              {initial}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: 'var(--stable-t3)' }}>
              Me
            </span>
          </button>
        </div>
      </nav>

    </div>
  )
}
