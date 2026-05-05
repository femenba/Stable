'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { useUser, useClerk } from '@clerk/nextjs'

const NAV = [
  { href: '/dashboard', icon: '⊞',  label: 'Today'     },
  { href: '/tasks',     icon: '✓',   label: 'Tasks'     },
  { href: '/focus',     icon: '⏱',  label: 'Focus'     },
  { href: '/reminders', icon: '🔔',  label: 'Reminders' },
  { href: '/mind',      icon: '🧘',  label: 'Mind'      },
] as const

function isActiveRoute(href: string, pathname: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(href + '/')
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname()
  const { user }    = useUser()
  const { signOut } = useClerk()

  const initial = (
    user?.firstName?.[0] ??
    user?.emailAddresses?.[0]?.emailAddress?.[0] ??
    '?'
  ).toUpperCase()

  return (
    <div className="min-h-svh" style={{ background: 'var(--stable-bg)' }}>

      {/* ────────────────────────────────────────────────
          Desktop sidebar — slim 72 px icon rail
      ──────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0"
        style={{
          width:       72,
          background:  'var(--stable-card)',
          borderRight: '1px solid var(--stable-card-border)',
          boxShadow:   '2px 0 20px rgba(0,0,0,0.04)',
          zIndex:      40,
        }}
      >
        {/* Brand mark */}
        <div className="flex items-center justify-center" style={{ paddingTop: 24, paddingBottom: 20 }}>
          <div
            className="w-10 h-10 rounded-[14px] flex items-center justify-center text-white font-black text-[15px]"
            style={{ background: 'var(--stable-cta)', boxShadow: '0 6px 18px rgba(94,139,113,0.45)' }}
          >
            S
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--stable-card-border)', margin: '0 12px' }} />

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col items-center gap-1.5 px-2 py-4">
          {NAV.map((item) => {
            const active = isActiveRoute(item.href, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center text-[19px] transition-all"
                style={{
                  background: active ? 'rgba(94,139,113,0.12)' : 'transparent',
                  color:      active ? 'var(--cat-work)' : 'var(--stable-t3)',
                }}
              >
                {active && (
                  <span
                    className="absolute top-1/2 -translate-y-1/2 -left-2 w-[3px] h-5 rounded-r-full"
                    style={{ background: 'var(--cat-work)' }}
                  />
                )}
                {item.icon}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div
          className="flex flex-col items-center gap-3 px-2 py-4"
          style={{ borderTop: '1px solid var(--stable-card-border)' }}
        >
          <ThemeToggle />
          {user && (
            <button
              onClick={() => signOut()}
              title="Sign out"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-black transition-opacity hover:opacity-75"
              style={{ background: 'var(--stable-cta)' }}
            >
              {initial}
            </button>
          )}
        </div>
      </aside>

      {/* ────────────────────────────────────────────────
          Main content area (shifted right of sidebar)
      ──────────────────────────────────────────────── */}
      <main className="md:ml-[72px] pb-[80px] md:pb-0 min-h-svh">
        {children}
      </main>

      {/* ────────────────────────────────────────────────
          Mobile bottom nav — pill tab bar
      ──────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-stretch"
        style={{
          background:  'var(--stable-card)',
          borderTop:   '1px solid var(--stable-card-border)',
          boxShadow:   '0 -8px 28px rgba(0,0,0,0.07)',
          zIndex:      50,
          height:      68,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex justify-around items-center w-full px-2">
          {NAV.map((item) => {
            const active = isActiveRoute(item.href, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 pt-2 pb-1"
              >
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
                    style={{ width: 28, height: 3, background: 'var(--cat-work)' }}
                  />
                )}
                <span
                  className="w-9 h-9 rounded-[14px] flex items-center justify-center text-[18px] transition-all"
                  style={{
                    background: active ? 'rgba(94,139,113,0.12)' : 'transparent',
                    color:      active ? 'var(--cat-work)' : 'var(--stable-t3)',
                  }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.06em]"
                  style={{ color: active ? 'var(--cat-work)' : 'var(--stable-t3)' }}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
          {/* Me / sign-out */}
          <button
            onClick={() => signOut()}
            className="flex flex-col items-center justify-center gap-1 flex-1 pt-2 pb-1"
          >
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-black"
              style={{ background: 'var(--stable-cta)' }}
            >
              {initial}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--stable-t3)' }}>Me</span>
          </button>
        </div>
      </nav>

    </div>
  )
}
