'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

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
      {/* Scrollable page content */}
      <div className="max-w-[480px] mx-auto min-h-svh pb-[72px]">
        {children}
      </div>

      {/* Fixed bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-stable-nav border-t border-stable-nav-border"
        style={{ zIndex: 50 }}
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
