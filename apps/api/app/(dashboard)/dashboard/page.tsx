'use client'

import { trpc } from '../../../src/lib/trpc-client'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Card, Btn, Label, PageHero, Chip, Empty } from '../../../src/components/ui'
import { TaskCard } from '../../../src/components/task-card'

const MOOD_EMOJIS = ['😔', '😕', '😐', '🙂', '😊']
const MOOD_LABELS = ['Very low', 'Low', 'Okay', 'Good', 'Great']

const SUPPORT_TOOLS = [
  { href: '/mind/support?tool=breathe',   icon: '🌬️', label: 'Breathe',    sub: '~1 min'  },
  { href: '/mind/support?tool=grounding', icon: '🖐',  label: 'Ground',     sub: '5 senses' },
  { href: '/mind/support?tool=stop',      icon: '🛑', label: 'Pause',      sub: '4 steps'  },
]

export default function DashboardPage() {
  const { user }   = useUser()
  const firstName  = user?.firstName ?? 'there'
  const hour       = new Date().getHours()
  const greeting   = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr    = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  const utils      = trpc.useUtils()
  const { data: topTasks, isLoading } = trpc.tasks.listTopThree.useQuery()
  const { data: todayMood }           = trpc.moodEntries.today.useQuery({ date: new Date().toISOString().slice(0, 10) })

  const pending = (topTasks ?? []).filter((t) => t.status !== 'completed')
  const handleUpdate = () => utils.tasks.listTopThree.invalidate()

  return (
    <div>
      {/* ══════════════════════════════════════ HERO ══ */}
      <PageHero
        eyebrow={dateStr}
        title={<>{greeting},<br />{firstName}.</>}
        subtitle="Three tasks. One at a time. That's it."
        chips={
          <>
            {todayMood ? (
              <Chip>{MOOD_EMOJIS[todayMood.rating - 1]} {MOOD_LABELS[todayMood.rating - 1]}</Chip>
            ) : (
              <Link href="/mind/mood">
                <Chip>🌟 Log your mood</Chip>
              </Link>
            )}
            {!isLoading && pending.length > 0 && (
              <Chip>✓ {pending.length} task{pending.length !== 1 ? 's' : ''} today</Chip>
            )}
          </>
        }
        actions={
          <Link href="/focus">
            <Btn variant="glass" size="lg" icon="⏱">Start focus</Btn>
          </Link>
        }
      />

      {/* ═════════════════════════════════════ CONTENT ══ */}
      <div className="px-6 md:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start max-w-6xl">

          {/* ── Left column: AI + Tasks ── */}
          <div className="space-y-5">

            {/* AI insight */}
            <Card className="p-7 flex gap-5 items-start">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: 'rgba(94,139,113,0.1)' }}
              >
                ⬡
              </div>
              <div>
                <Label className="mb-2">Stable AI</Label>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--stable-t2)' }}>
                  Focus on <strong style={{ color: 'var(--stable-t1)' }}>one task at a time</strong>.
                  Your attention is sharpest <strong style={{ color: 'var(--stable-t1)' }}>before noon</strong>.
                  Pick three. Go deep.
                </p>
              </div>
            </Card>

            {/* Task section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Today&apos;s tasks</Label>
                <Link href="/tasks">
                  <Btn variant="tonal" size="xs">Manage →</Btn>
                </Link>
              </div>

              <div className="space-y-2.5">
                {isLoading ? (
                  [0, 1, 2].map((i) => (
                    <div key={i} className="h-[72px] rounded-[24px] animate-pulse" style={{ background: 'var(--stable-card-border)' }} />
                  ))
                ) : (topTasks ?? []).length === 0 ? (
                  <Empty icon="📋" message="No tasks yet — add up to three for today."
                    action={<Link href="/tasks"><Btn variant="tonal" size="sm">Add tasks →</Btn></Link>}
                  />
                ) : (
                  (topTasks ?? []).map((task) => (
                    <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Right column: Widgets ── */}
          <div className="space-y-4">

            {/* Focus widget */}
            <Link href="/focus" className="block">
              <div
                className="rounded-[28px] p-7 transition-all hover:opacity-95"
                style={{ background: 'var(--stable-cta)', boxShadow: 'var(--shadow-cta)' }}
              >
                <Label><span style={{ color: 'rgba(255,255,255,0.55)' }}>Focus session</span></Label>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-white font-black text-xl leading-tight">Start now</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Ready when you are</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                  >
                    <span className="text-white text-lg">▶</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Mood widget */}
            <Link href="/mind/mood" className="block">
              <Card className="p-6 hover:opacity-90 transition-opacity">
                <Label className="mb-3">Mood</Label>
                <p className="font-bold text-base" style={{ color: 'var(--stable-t1)' }}>
                  {todayMood
                    ? `${MOOD_EMOJIS[todayMood.rating - 1]} ${MOOD_LABELS[todayMood.rating - 1]}`
                    : 'How are you feeling?'}
                </p>
                <p className="text-xs mt-1.5" style={{ color: 'var(--stable-t2)' }}>
                  {todayMood ? 'Tap to update' : 'Check in now'}
                </p>
              </Card>
            </Link>

            {/* Quick support tools */}
            <Card className="p-5">
              <Label className="mb-3">Take a moment</Label>
              <div className="space-y-1.5">
                {SUPPORT_TOOLS.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all hover:opacity-80"
                    style={{ background: 'var(--stable-bg)' }}
                  >
                    <span className="text-xl">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--stable-t1)' }}>{tool.label}</p>
                      <p className="text-[10px]" style={{ color: 'var(--stable-t3)' }}>{tool.sub}</p>
                    </div>
                    <span style={{ color: 'var(--stable-t3)' }}>›</span>
                  </Link>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}
