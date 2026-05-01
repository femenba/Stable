'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('stable-theme') as 'light' | 'dark' | null
    if (saved) setTheme(saved)
  }, [])

  function apply(next: 'light' | 'dark') {
    setTheme(next)
    localStorage.setItem('stable-theme', next)
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  return (
    <div
      className="flex items-center rounded-full p-1 shrink-0"
      style={{
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <button
        onClick={() => apply('light')}
        className="flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold transition-all"
        style={{
          background:  theme === 'light' ? '#fff' : 'transparent',
          color:       theme === 'light' ? '#111' : 'rgba(255,255,255,0.5)',
          boxShadow:   theme === 'light' ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        ☀️ Light
      </button>
      <button
        onClick={() => apply('dark')}
        className="flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold transition-all"
        style={{
          background: theme === 'dark' ? '#1a1535' : 'transparent',
          color:      theme === 'dark' ? '#a78bfa' : 'rgba(255,255,255,0.5)',
          boxShadow:  theme === 'dark' ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        🌙 Dark
      </button>
    </div>
  )
}
