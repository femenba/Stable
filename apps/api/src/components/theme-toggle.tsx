'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

type Props = { compact?: boolean }

export function ThemeToggle({ compact = false }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('stable-theme') as 'light' | 'dark' | null
    if (saved) setTheme(saved)
  }, [])

  function apply(next: 'light' | 'dark') {
    setTheme(next)
    localStorage.setItem('stable-theme', next)
    if (next === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
    else document.documentElement.removeAttribute('data-theme')
  }

  function toggle() { apply(theme === 'light' ? 'dark' : 'light') }

  if (compact) {
    return (
      <button
        onClick={toggle}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all hover:opacity-70"
        style={{ background: 'var(--sage-soft)', color: 'var(--cat-work)' }}
      >
        {theme === 'light'
          ? <Moon size={15} strokeWidth={2} />
          : <Sun size={15} strokeWidth={2} />}
      </button>
    )
  }

  return (
    <div
      className="inline-flex items-center rounded-full p-0.5 gap-0.5"
      style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}
    >
      <button
        onClick={() => apply('light')}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all"
        style={{
          background: theme === 'light' ? 'var(--stable-card)' : 'transparent',
          color:      theme === 'light' ? 'var(--stable-t1)' : 'var(--stable-t3)',
          boxShadow:  theme === 'light' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <Sun size={11} /> Light
      </button>
      <button
        onClick={() => apply('dark')}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all"
        style={{
          background: theme === 'dark' ? 'var(--stable-card)' : 'transparent',
          color:      theme === 'dark' ? 'var(--stable-t1)' : 'var(--stable-t3)',
          boxShadow:  theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
        }}
      >
        <Moon size={11} /> Dark
      </button>
    </div>
  )
}
