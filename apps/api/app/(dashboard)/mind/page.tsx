'use client'

import { trpc } from '../../../src/lib/trpc-client'
import Link from 'next/link'
import { ThemeToggle } from '../../../src/components/theme-toggle'

const MOOD_EMOJIS = ['😔', '😕', '😐', '🙂', '😊']
const MOOD_LABELS = ['Very low', 'Low', 'Okay', 'Good', 'Great']

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
    <div className="flex gap-2 items-end" style={{ height: 64 }}>
      {days.map(({ key, label, entry }) => (
        <div key={key} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-lg transition-all"
            style={{
              height:     entry ? `${(entry.rating / 5) * 52 + 8}px` : '6px',
              background: entry ? 'var(--cat-work)' : 'var(--stable-card-border)',
              opacity:    entry ? 1 : 0.4,
              minHeight:  6,
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

  const dayLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long' }).toUpperCase()

  return (
    <div>
      {/* ═══ MOBILE ═══ */}
      <div className="md:hidden">
        {/* Hero header */}
        <div className="relative overflow-hidden" style={{ background: 'var(--stable-header)' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div className="px-5 pt-14 pb-8">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {dayLabel} · MIND
              </p>
              <ThemeToggle />
            </div>
            <h1 className="text-[28px] font-black text-white leading-[1.15] mb-1.5">Take a moment.<br />Be present.</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.58)' }}>
              Small check-ins and guided tools.
            </p>
          </div>
        </div>

        <div className="px-4 py-5 space-y-3">
          {/* Mood card */}
          <Link
            href="/mind/mood"
            className="flex items-center justify-between rounded-2xl px-5 py-4"
            style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', boxShadow: 'var(--shadow-card)' }}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--stable-t3)' }}>Mood check-in</p>
              <p className="text-base font-bold" style={{ color: 'var(--stable-t1)' }}>
                {todayMood
                  ? `${MOOD_EMOJIS[todayMood.rating - 1]} ${MOOD_LABELS[todayMood.rating - 1]}`
                  : 'How are you feeling?'}
              </p>
            </div>
            <span className="text-2xl">{todayMood ? MOOD_EMOJIS[todayMood.rating - 1] : '→'}</span>
          </Link>

          {/* Support card */}
          <Link
            href="/mind/support"
            className="flex items-center justify-between rounded-2xl px-5 py-4"
            style={{ background: 'var(--stable-cta)', boxShadow: 'var(--shadow-cta)' }}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Support tools</p>
              <p className="text-base font-black text-white">Take a moment</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.58)' }}>Breathing, grounding & more</p>
            </div>
            <span className="text-white text-xl">→</span>
          </Link>

          {/* History */}
          {history.length > 0 && (
            <div
              className="rounded-2xl px-5 py-4"
              style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', boxShadow: 'var(--shadow-card)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--stable-t3)' }}>
                Last 7 days
              </p>
              <MoodHistoryBar entries={history} />
            </div>
          )}
        </div>
      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden md:block">
        {/* Hero */}
        <div className="relative overflow-hidden" style={{ background: 'var(--stable-header)' }}>
          <div style={{ position: 'absolute', top: -80, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div className="px-10 lg:px-12 pt-12 pb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {dayLabel} · MIND
            </p>
            <h1 className="text-[44px] font-black text-white leading-[1.1] mb-2">
              Take a moment.{' '}
              <span style={{ opacity: 0.65 }}>Be present.</span>
            </h1>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Small check-ins and guided tools to help you stay grounded.
            </p>
          </div>
        </div>

        <div className="px-10 lg:px-12 py-8">
          <div className="grid grid-cols-3 gap-6 items-start">

            {/* Left 2/3: Mood + History */}
            <div className="col-span-2 space-y-5">

              {/* Mood check-in card */}
              <div
                className="rounded-2xl p-6"
                style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--stable-t3)' }}>
                      Mood check-in
                    </p>
                    {todayMood ? (
                      <p className="text-2xl font-black" style={{ color: 'var(--stable-t1)' }}>
                        {MOOD_EMOJIS[todayMood.rating - 1]}{' '}
                        <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                          {MOOD_LABELS[todayMood.rating - 1]}
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
                    className="text-xs font-black px-4 py-2.5 rounded-xl transition-opacity hover:opacity-85"
                    style={{ background: 'var(--stable-cta)', color: '#fff', boxShadow: 'var(--shadow-cta)' }}
                  >
                    {todayMood ? 'Update →' : 'Check in →'}
                  </Link>
                </div>
                {todayMood?.energy && (
                  <p className="text-sm" style={{ color: 'var(--stable-t2)' }}>
                    Energy: {todayMood.energy <= 1 ? '🪫 Low' : todayMood.energy <= 3 ? '🔋 Medium' : '⚡ Full'}
                    {todayMood.tags.length > 0 && <> · {todayMood.tags.join(', ')}</>}
                  </p>
                )}
              </div>

              {/* Mood history */}
              {history.length > 0 && (
                <div
                  className="rounded-2xl p-6"
                  style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', boxShadow: 'var(--shadow-card)' }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--stable-t3)' }}>
                    Mood this week
                  </p>
                  <MoodHistoryBar entries={history} />
                </div>
              )}
            </div>

            {/* Right 1/3: Support tools */}
            <div className="col-span-1 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--stable-t3)' }}>
                Support tools
              </p>
              {QUICK_TOOLS.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all hover:opacity-80"
                  style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', boxShadow: 'var(--shadow-card)' }}
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: 'rgba(94,139,113,0.08)' }}
                  >
                    {tool.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--stable-t1)' }}>{tool.label}</p>
                    <p className="text-xs" style={{ color: 'var(--stable-t3)' }}>{tool.desc}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-sm" style={{ color: 'var(--stable-t3)' }}>→</span>
                </Link>
              ))}
              <Link
                href="/mind/support"
                className="block text-center text-xs font-bold py-2.5 transition-opacity hover:opacity-70"
                style={{ color: 'var(--cat-work)' }}
              >
                View all tools →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
