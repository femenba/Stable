'use client'

import { trpc } from '../../../src/lib/trpc-client'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Wind, Hand, PauseCircle, Waves, Brain, RotateCcw, Timer, ArrowRight } from 'lucide-react'
import { Card, Btn, Label, Empty } from '../../../src/components/ui'
import { TaskCard } from '../../../src/components/task-card'
import { ThemeToggle } from '../../../src/components/theme-toggle'
import { CheckoutSuccessToast, TrialBanner, PastDueBanner } from '../../../src/components/plan-banner'

const MOOD_EMOJIS = ['😔', '😕', '😐', '🙂', '😊']
const MOOD_LABELS = ['Very low', 'Low', 'Okay', 'Good', 'Great']

const SUPPORT_TOOLS = [
  { href: '/mind/support?tool=breathe',   icon: Wind,        label: 'Breathe',    sub: '~1 min',   color: '#4A7A5F' },
  { href: '/mind/support?tool=grounding', icon: Hand,        label: 'Ground',     sub: '5 senses', color: '#5BA4C8' },
  { href: '/mind/support?tool=stop',      icon: PauseCircle, label: 'Pause',      sub: '4 steps',  color: '#8B7EC8' },
  { href: '/mind/support?tool=urge',      icon: Waves,       label: 'Ride Wave',  sub: '~1 min',   color: '#5E8B71' },
  { href: '/mind/support?tool=wise',      icon: Brain,       label: 'Calm Self',  sub: '3 steps',  color: '#7B6DB8' },
  { href: '/mind/support?tool=opposite',  icon: RotateCcw,   label: 'Next Step',  sub: '3 steps',  color: '#4A8FAF' },
]

export default function DashboardPage() {
  const { user }   = useUser()
  const firstName  = user?.firstName ?? ''
  const hour       = new Date().getHours()
  const greeting   = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr    = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  const utils    = trpc.useUtils()
  const { data: topTasks, isLoading } = trpc.tasks.listTopThree.useQuery()
  const { data: todayMood }           = trpc.moodEntries.today.useQuery({ date: new Date().toISOString().slice(0, 10) })

  const pending      = (topTasks ?? []).filter((t) => t.status !== 'completed')
  const handleUpdate = () => utils.tasks.listTopThree.invalidate()

  return (
    <div>
      <CheckoutSuccessToast />
      <TrialBanner />
      <PastDueBanner />

      {/* ── CALM HERO — light, airy, not a banner ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--stable-hero-bg)' }}
      >
        {/* Soft organic blobs */}
        <div style={{ position: 'absolute', top: -80, right: -40, width: 340, height: 340, borderRadius: '50%', background: 'rgba(74,122,95,0.08)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(139,126,200,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 20, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(74,122,95,0.05)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div className="relative px-7 md:px-10 pt-10 pb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>
                {dateStr}
              </p>
              <h1 className="text-[32px] md:text-[44px] font-black leading-[1.1]" style={{ color: 'var(--stable-t1)' }}>
                {greeting}{firstName ? `,\n${firstName}` : '.'}<br />
                <span style={{ color: 'var(--stable-t2)', fontWeight: 400, fontSize: '0.7em' }}>
                  How are you feeling today?
                </span>
              </h1>
            </div>
            <div className="hidden md:block shrink-0">
              <ThemeToggle />
            </div>
          </div>

          {/* Status chips */}
          <div className="flex gap-2 flex-wrap">
            {todayMood ? (
              <Link href="/mind/mood" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', color: 'var(--stable-t1)', boxShadow: 'var(--shadow-card)' }}>
                {MOOD_EMOJIS[todayMood.rating - 1]} {MOOD_LABELS[todayMood.rating - 1]}
              </Link>
            ) : (
              <Link href="/mind/mood" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', color: 'var(--stable-t2)', boxShadow: 'var(--shadow-card)' }}>
                🌿 Log your mood
              </Link>
            )}
            {!isLoading && pending.length > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
                style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', color: 'var(--stable-t2)', boxShadow: 'var(--shadow-card)' }}>
                ✓ {pending.length} task{pending.length !== 1 ? 's' : ''} today
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── SUPPORT STRIP — prominent, emotionally central ── */}
      <section className="px-7 md:px-10 py-6" style={{ borderBottom: '1px solid var(--stable-card-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <Label>Take a moment</Label>
          <Link href="/mind">
            <Btn variant="tonal" size="xs">All tools <ArrowRight size={11} /></Btn>
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {SUPPORT_TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group block">
              <Card className="p-4 text-center transition-all hover:scale-[1.03] hover:shadow-lg cursor-pointer">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2.5 transition-all group-hover:scale-110"
                  style={{ background: `${tool.color}14` }}
                >
                  <tool.icon size={18} style={{ color: tool.color }} strokeWidth={1.8} />
                </div>
                <p className="text-xs font-bold" style={{ color: 'var(--stable-t1)' }}>{tool.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--stable-t3)' }}>{tool.sub}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="px-7 md:px-10 py-7">
        <div className="grid lg:grid-cols-[1fr_288px] gap-6 items-start">

          {/* ── Tasks column ── */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <Label>Today&apos;s tasks</Label>
              <Link href="/tasks">
                <Btn variant="tonal" size="xs">Manage <ArrowRight size={11} /></Btn>
              </Link>
            </div>

            <div className="space-y-2.5">
              {isLoading ? (
                [0, 1, 2].map((i) => (
                  <div key={i} className="h-[68px] rounded-[24px] animate-pulse" style={{ background: 'var(--stable-card-border)' }} />
                ))
              ) : (topTasks ?? []).length === 0 ? (
                <Empty icon="📋" message="No tasks set for today."
                  action={<Link href="/tasks"><Btn variant="tonal" size="sm">Add your tasks →</Btn></Link>}
                />
              ) : (
                (topTasks ?? []).map((task) => (
                  <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
                ))
              )}
            </div>
          </div>

          {/* ── Widget column ── */}
          <div className="space-y-3">

            {/* Focus */}
            <Link href="/focus" className="block">
              <div
                className="rounded-[24px] p-6 transition-all hover:opacity-95 hover:scale-[1.01]"
                style={{ background: 'var(--stable-cta)', boxShadow: 'var(--shadow-cta)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Focus session</p>
                    <p className="text-white font-black text-lg leading-tight">Start deep work</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Ready when you are</p>
                  </div>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.18)' }}>
                    <Timer size={18} className="text-white" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Mood */}
            <Link href="/mind/mood" className="block">
              <Card className="p-5 hover:opacity-90 transition-all hover:scale-[1.01] cursor-pointer">
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--stable-t3)' }}>Mood</p>
                <p className="font-bold text-sm" style={{ color: 'var(--stable-t1)' }}>
                  {todayMood ? `${MOOD_EMOJIS[todayMood.rating - 1]} ${MOOD_LABELS[todayMood.rating - 1]}` : 'How are you feeling?'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--stable-t2)' }}>
                  {todayMood ? 'Tap to update' : 'Check in now →'}
                </p>
              </Card>
            </Link>

            {/* Mind — brief weekly bar */}
            <Card className="p-5">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>Weekly mood</p>
              <MoodWeekBar />
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}

function MoodWeekBar() {
  const { data: history = [] } = trpc.moodEntries.history.useQuery({ limit: 7 })
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key   = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 1)
    const entry = history.find((e) => e.createdAt.slice(0, 10) === key)
    return { key, label, entry }
  })
  return (
    <div className="flex gap-1.5 items-end" style={{ height: 52 }}>
      {days.map(({ key, label, entry }) => (
        <div key={key} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-md transition-all"
            style={{
              height:     entry ? `${(entry.rating / 5) * 40 + 8}px` : '5px',
              background: entry ? 'var(--cat-work)' : 'var(--stable-card-border)',
              opacity:    entry ? 1 : 0.5,
            }}
          />
          <span className="text-[9px] font-semibold" style={{ color: 'var(--stable-t3)' }}>{label}</span>
        </div>
      ))}
    </div>
  )
}
