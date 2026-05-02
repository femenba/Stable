'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'

const TABS = [
  { href: '/dashboard', label: 'Today',     icon: '🏠' },
  { href: '/tasks',     label: 'Tasks',     icon: '✓'  },
  { href: '/focus',     label: 'Focus',     icon: '⏱' },
  { href: '/reminders', label: 'Reminders', icon: '🔔' },
] as const

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

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
            const isActive = pathname === tab.href
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
        {/* Mobile: 480px centred  |  Desktop: up to 760px, left-padded */}
        <div className="max-w-[480px] mx-auto pb-[72px] md:max-w-[760px] md:mx-0 md:pb-10">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom tab bar (hidden md+) ──────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 border-t"
        style={{ background: 'var(--stable-nav)', borderColor: 'var(--stable-nav-border)', zIndex: 50 }}
      >
        <div className="max-w-[480px] mx-auto flex justify-around py-2">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center gap-0.5 py-1 px-5"
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
        </div>
      </nav>

    </div>
  )
}
