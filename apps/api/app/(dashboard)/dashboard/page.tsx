'use client'

import { trpc } from '../../../src/lib/trpc-client'
import Link from 'next/link'
import { ThemeToggle } from '../../../src/components/theme-toggle'
import { TaskCard } from '../../../src/components/task-card'

const MOOD_EMOJIS = ['😔', '😕', '😐', '🙂', '😊']
const MOOD_LABELS = ['Very low', 'Low', 'Okay', 'Good', 'Great']

function StatPill({ icon, label }: { icon: string; label: string }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
      style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)' }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  )
}

function Card({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', boxShadow: 'var(--shadow-card)', ...style }}
    >
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--stable-t3)' }}>
      {children}
    </p>
  )
}

export default function DashboardPage() {
  const { data: topTasks, isLoading } = trpc.tasks.listTopThree.useQuery()
  const { data: todayMood } = trpc.moodEntries.today.useQuery({ date: new Date().toISOString().slice(0, 10) })
  const utils = trpc.useUtils()

  const todayLong  = new Date().toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })
  const todayShort = new Date().toLocaleDateString('en-GB', { weekday: 'long' }).toUpperCase()
  const handleUpdate = () => utils.tasks.listTopThree.invalidate()

  const pendingCount = isLoading ? null : (topTasks ?? []).filter((t) => t.status !== 'completed').length

  const skeletons = [0, 1, 2].map((i) => (
    <div key={i} className="h-[68px] rounded-2xl animate-pulse" style={{ background: 'var(--stable-card-border)' }} />
  ))

  const emptyState = (
    <Card key="empty" className="px-5 py-10 text-center">
      <p className="text-sm mb-2" style={{ color: 'var(--stable-t3)' }}>No active tasks yet</p>
      <Link
        href="/tasks"
        className="text-xs font-bold inline-block px-4 py-2 rounded-xl"
        style={{ background: 'rgba(94,139,113,0.1)', color: 'var(--cat-work)' }}
      >
        Add your first task →
      </Link>
    </Card>
  )

  const taskNodes = isLoading
    ? skeletons
    : (topTasks ?? []).length > 0
      ? (topTasks ?? []).map((task) => <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />)
      : [emptyState]

  return (
    <div>
      {/* ═══════════════════════════════════ MOBILE ══ */}
      <div className="md:hidden">

        {/* Hero */}
        <div className="relative overflow-hidden" style={{ background: 'var(--stable-header)' }}>
          <div style={{ position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(48px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', filter: 'blur(36px)', pointerEvents: 'none' }} />

          <div className="px-5 pt-14 pb-8">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {todayShort} · TODAY
              </span>
              <ThemeToggle />
            </div>
            <h1 className="text-[30px] font-black text-white leading-[1.15] mb-2">
              Three things.<br />That&apos;s it.
            </h1>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              One at a time. Go deep.
            </p>
            <div className="flex gap-2 flex-wrap">
              {todayMood
                ? <StatPill icon={MOOD_EMOJIS[todayMood.rating - 1]} label={MOOD_LABELS[todayMood.rating - 1]} />
                : <StatPill icon="🌟" label="Check in mood" />}
              {pendingCount !== null && (
                <StatPill icon="✓" label={`${pendingCount} task${pendingCount !== 1 ? 's' : ''}`} />
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-5 space-y-3">

          {/* AI insight */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(94,139,113,0.12)', color: 'var(--cat-work)', border: '1px solid rgba(94,139,113,0.2)' }}
              >
                ⬡ Stable AI
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--stable-t2)' }}>
              Focus on{' '}
              <strong style={{ color: 'var(--stable-t1)' }}>one task at a time</strong>.
              Your attention is sharpest{' '}
              <strong style={{ color: 'var(--stable-t1)' }}>before noon</strong>.
            </p>
          </Card>

          {/* Tasks */}
          <SectionLabel>Today&apos;s tasks</SectionLabel>
          <div className="space-y-2">{taskNodes}</div>

          {/* Focus CTA */}
          <Link
            href="/focus"
            className="block rounded-2xl overflow-hidden"
            style={{ background: 'var(--stable-cta)', boxShadow: 'var(--shadow-cta)' }}
          >
            <div className="px-5 py-5 flex items-center justify-between">
              <div>
                <p className="text-white font-black text-[16px] mb-0.5">Start focus session</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Ready when you are</p>
              </div>
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <span className="text-white text-base">▶</span>
              </div>
            </div>
          </Link>

        </div>
      </div>

      {/* ═══════════════════════════════════ DESKTOP ══ */}
      <div className="hidden md:block">

        {/* Hero */}
        <div className="relative overflow-hidden" style={{ background: 'var(--stable-header)' }}>
          <div style={{ position: 'absolute', top: -120, right: -80, width: 380, height: 380, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: 320, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 20, left: 520, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', filter: 'blur(30px)', pointerEvents: 'none' }} />

          <div className="px-10 lg:px-12 pt-14 pb-12">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest mb-5"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              {todayLong}
            </p>
            <div className="flex items-end justify-between gap-8">
              <div>
                <h1 className="text-[52px] font-black text-white leading-[1.1] mb-3">
                  Three things.{' '}
                  <span style={{ opacity: 0.65 }}>That&apos;s it.</span>
                </h1>
                <p className="text-base mb-6" style={{ color: 'rgba(255,255,255,0.58)' }}>
                  One at a time. Pick three. Go deep.
                </p>
                <div className="flex gap-2">
                  {todayMood
                    ? <StatPill icon={MOOD_EMOJIS[todayMood.rating - 1]} label={MOOD_LABELS[todayMood.rating - 1]} />
                    : <StatPill icon="🌟" label="Mood not logged" />}
                  {pendingCount !== null && (
                    <StatPill icon="✓" label={`${pendingCount} task${pendingCount !== 1 ? 's' : ''} today`} />
                  )}
                </div>
              </div>

              {/* Quick start button in hero */}
              <Link
                href="/focus"
                className="shrink-0 flex items-center gap-4 rounded-2xl px-5 py-4 transition-opacity hover:opacity-90"
                style={{
                  background:     'rgba(255,255,255,0.1)',
                  border:         '1px solid rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.18)' }}
                >
                  <span className="text-white text-xl">⏱</span>
                </div>
                <div>
                  <p className="text-white font-black text-sm">Start focusing</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Ready when you are</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="px-10 lg:px-12 py-8">
          <div className="grid grid-cols-3 gap-6 items-start">

            {/* ── Main column (2/3): AI + tasks ── */}
            <div className="col-span-2 space-y-5">

              {/* AI insight */}
              <Card className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(94,139,113,0.1)' }}
                  >
                    <span className="text-[17px]">⬡</span>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mb-2"
                      style={{ color: 'var(--cat-work)' }}
                    >
                      Stable AI
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--stable-t2)' }}>
                      Pick your three most important tasks and focus on{' '}
                      <strong style={{ color: 'var(--stable-t1)' }}>one at a time</strong>.{' '}
                      Your focus is sharpest{' '}
                      <strong style={{ color: 'var(--stable-t1)' }}>before noon</strong>.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Tasks */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <SectionLabel>Today&apos;s tasks</SectionLabel>
                    {pendingCount !== null && pendingCount > 0 && (
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(94,139,113,0.1)', color: 'var(--cat-work)' }}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/tasks"
                    className="text-xs font-semibold transition-opacity hover:opacity-70"
                    style={{ color: 'var(--cat-work)' }}
                  >
                    Manage →
                  </Link>
                </div>
                <div className="space-y-2">{taskNodes}</div>
              </div>
            </div>

            {/* ── Widget column (1/3) ── */}
            <div className="col-span-1 space-y-4">

              {/* Focus session */}
              <Link
                href="/focus"
                className="block rounded-2xl overflow-hidden transition-opacity hover:opacity-95"
                style={{ background: 'var(--stable-cta)', boxShadow: 'var(--shadow-cta)' }}
              >
                <div className="p-5">
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-4"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Focus session
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-black text-[18px] leading-tight">Start session</p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.58)' }}>Ready when you are</p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.18)' }}
                    >
                      <span className="text-white text-lg">▶</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Mood */}
              <Link href="/mind/mood" className="block rounded-2xl transition-all hover:opacity-90" style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', boxShadow: 'var(--shadow-card)' }}>
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>Mood</p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: 'var(--stable-t1)' }}>
                        {todayMood
                          ? `${MOOD_EMOJIS[todayMood.rating - 1]} ${MOOD_LABELS[todayMood.rating - 1]}`
                          : 'How are you feeling?'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--stable-t2)' }}>
                        {todayMood ? 'Tap to update' : 'Check in now'}
                      </p>
                    </div>
                    <span className="text-lg shrink-0" style={{ color: 'var(--stable-t3)' }}>→</span>
                  </div>
                </div>
              </Link>

              {/* Support */}
              <Link href="/mind/support" className="block rounded-2xl transition-all hover:opacity-90" style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', boxShadow: 'var(--shadow-card)' }}>
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>Take a moment</p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--stable-t1)' }}>Support tools</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--stable-t2)' }}>Breathing, grounding & more</p>
                    </div>
                    <span className="text-lg shrink-0" style={{ color: 'var(--stable-t3)' }}>→</span>
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
