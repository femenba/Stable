'use client'

import { trpc } from '../../../src/lib/trpc-client'
import Link from 'next/link'
import { ThemeToggle } from '../../../src/components/theme-toggle'

const MOOD_EMOJIS = ['😔', '😕', '😐', '🙂', '😊']

const QUICK_TOOLS = [
  { href: '/mind/support?tool=breathe',   icon: '🌬️', label: 'Breathe With Me',           desc: '~1 minute' },
  { href: '/mind/support?tool=stop',      icon: '🛑', label: 'Pause Before Reacting',      desc: '4 steps'   },
  { href: '/mind/support?tool=grounding', icon: '🖐',  label: 'Come Back to Now',          desc: '5 senses'  },
  { href: '/mind/support?tool=urge',      icon: '🌊', label: 'Ride the Wave',              desc: '~1 minute' },
  { href: '/mind/support?tool=opposite',  icon: '🔄', label: 'Choose a Helpful Next Step', desc: '3 steps'   },
  { href: '/mind/support?tool=wise',      icon: '🧘', label: 'Find Your Calm Self',        desc: '3 steps'   },
]

function MoodHistoryBar({ entries }: { entries: { rating: number; createdAt: string }[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const entry = entries.find((e) => e.createdAt.slice(0, 10) === key)
    return { key, label: d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 1), entry }
  })

  return (
    <div className="flex gap-2 items-end">
      {days.map(({ key, label, entry }) => (
        <div key={key} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-md"
            style={{
              height: entry ? `${(entry.rating / 5) * 48 + 8}px` : '8px',
              background: entry ? 'var(--cat-work)' : 'var(--stable-card-border)',
              opacity: entry ? 1 : 0.5,
            }}
          />
          <span className="text-[10px] font-semibold" style={{ color: 'var(--stable-t3)' }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

export default function MindPage() {
  const today = new Date().toISOString().slice(0, 10)
  const { data: todayMood } = trpc.moodEntries.today.useQuery({ date: today })
  const { data: history = [] } = trpc.moodEntries.history.useQuery({ limit: 7 })

  const dayLabel = new Date()
    .toLocaleDateString('en-GB', { weekday: 'long' })
    .toUpperCase()

  return (
    <div>

      {/* ═══════════════════════════════════════════════════════
          MOBILE layout — hidden on md+
      ═══════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        {/* Gradient header */}
        <div className="px-4 pt-12 pb-6" style={{ background: 'var(--stable-header)' }}>
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {dayLabel} · MIND
            </p>
            <ThemeToggle />
          </div>
          <h1 className="text-[26px] font-extrabold text-white leading-tight">
            Take a moment.<br />Be present.
          </h1>
        </div>

        <div className="px-4 py-4 space-y-3">
          {/* Mood card */}
          <Link
            href="/mind/mood"
            className="flex items-center justify-between rounded-xl px-5 py-4"
            style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--stable-t3)' }}>Mood</p>
              <p className="text-base font-bold" style={{ color: 'var(--stable-t1)' }}>
                {todayMood ? `Today: ${MOOD_EMOJIS[todayMood.rating - 1]}` : 'How are you feeling?'}
              </p>
            </div>
            <span className="text-2xl">{todayMood ? MOOD_EMOJIS[todayMood.rating - 1] : '+'}</span>
          </Link>

          {/* Support card */}
          <Link
            href="/mind/support"
            className="flex items-center justify-between rounded-xl px-5 py-4"
            style={{ background: 'var(--stable-cta)' }}
          >
            <div>
              <p className="text-sm font-bold text-white">Take a moment</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Breathing, grounding & more
              </p>
            </div>
            <span className="text-white text-xl">→</span>
          </Link>

          {/* 7-day history */}
          {history.length > 0 && (
            <div
              className="rounded-xl px-5 py-4"
              style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>
                Last 7 days
              </p>
              <MoodHistoryBar entries={history} />
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP layout — hidden on mobile
      ═══════════════════════════════════════════════════════ */}
      <div className="hidden md:block px-10 lg:px-14 pt-10 pb-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>
            {dayLabel} · MIND
          </p>
          <h1 className="text-[40px] font-extrabold leading-tight" style={{ color: 'var(--stable-t1)' }}>
            Take a moment.{' '}
            <span style={{ color: 'var(--cat-work)' }}>Be present.</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--stable-t2)' }}>
            Small check-ins and guided tools to help you stay grounded.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 items-start">

          {/* ── Left 2/3: Mood + History ───────────────────────── */}
          <div className="col-span-2 space-y-6">

            {/* Mood check-in card */}
            <div
              className="rounded-2xl p-6"
              style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--stable-t3)' }}>
                    Mood check-in
                  </p>
                  {todayMood ? (
                    <p className="text-2xl font-extrabold" style={{ color: 'var(--stable-t1)' }}>
                      {MOOD_EMOJIS[todayMood.rating - 1]}{' '}
                      <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                        {['Very low', 'Low', 'Okay', 'Good', 'Great'][todayMood.rating - 1]}
                      </span>
                    </p>
                  ) : (
                    <p className="text-xl font-bold" style={{ color: 'var(--stable-t1)' }}>
                      How are you feeling today?
                    </p>
                  )}
                </div>
                <Link
                  href="/mind/mood"
                  className="text-xs font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
                  style={{ background: 'var(--stable-cta)', color: '#fff' }}
                >
                  {todayMood ? 'Update →' : 'Check in →'}
                </Link>
              </div>

              {todayMood?.energy && (
                <p className="text-sm" style={{ color: 'var(--stable-t2)' }}>
                  Energy: {todayMood.energy <= 1 ? '🪫 Low' : todayMood.energy <= 3 ? '🔋 Medium' : '⚡ Full'}
                  {todayMood.tags.length > 0 && (
                    <> · {todayMood.tags.join(', ')}</>
                  )}
                </p>
              )}
            </div>

            {/* Mood history chart */}
            {history.length > 0 && (
              <div
                className="rounded-2xl p-6"
                style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--stable-t3)' }}>
                  Mood this week
                </p>
                <MoodHistoryBar entries={history} />
                <div className="flex justify-between mt-2">
                  {['Low', '', '', 'Okay', '', '', 'Great'].map((l, i) => (
                    <span key={i} className="text-[9px]" style={{ color: 'var(--stable-t3)' }}>{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right 1/3: support tools ────────────────────────── */}
          <div className="col-span-1 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--stable-t3)' }}>
              Support tools
            </p>
            {QUICK_TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-opacity hover:opacity-80"
                style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
              >
                <span className="text-xl w-8 text-center shrink-0">{tool.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--stable-t1)' }}>{tool.label}</p>
                  <p className="text-xs" style={{ color: 'var(--stable-t3)' }}>{tool.desc}</p>
                </div>
                <span className="ml-auto shrink-0 text-sm" style={{ color: 'var(--stable-t3)' }}>→</span>
              </Link>
            ))}
            <Link
              href="/mind/support"
              className="block text-center text-xs font-semibold py-2 transition-opacity hover:opacity-70"
              style={{ color: 'var(--cat-work)' }}
            >
              View all tools →
            </Link>
          </div>

        </div>
      </div>

    </div>
  )
}
