'use client'

import { trpc } from '../../../src/lib/trpc-client'
import Link from 'next/link'
import { Wind, Hand, PauseCircle, Waves, Brain, RotateCcw, ArrowRight, TrendingUp, Lock, Crown } from 'lucide-react'
import { Card, Btn, Label } from '../../../src/components/ui'
import { useSubscription } from '../../../src/lib/use-subscription'

const MOOD_EMOJIS = ['😔', '😕', '😐', '🙂', '😊']
const MOOD_LABELS = ['Very low', 'Low', 'Okay', 'Good', 'Great']

// All support tools are Pro-only
const ALL_TOOLS = [
  { href: '/mind/support?tool=breathe',   icon: Wind,        label: 'Breathe With Me',           desc: 'Follow a slow, guided breathing exercise to calm your nervous system.',              sub: '~1 minute', color: '#4A7A5F', bg: 'rgba(74,122,95,0.08)'    },
  { href: '/mind/support?tool=grounding', icon: Hand,        label: 'Come Back to Now',           desc: 'Use your five senses to ground yourself in the present moment.',                   sub: '5 senses',  color: '#4A8FAF', bg: 'rgba(74,143,175,0.08)'   },
  { href: '/mind/support?tool=stop',      icon: PauseCircle, label: 'Pause Before Reacting',      desc: 'A four-step technique to interrupt automatic reactions with intention.',             sub: '4 steps',   color: '#8B7EC8', bg: 'rgba(139,126,200,0.08)'  },
  { href: '/mind/support?tool=urge',      icon: Waves,       label: 'Ride the Wave',              desc: 'Observe difficult feelings without acting on them until they pass.',               sub: '~1 minute', color: '#5E8B71', bg: 'rgba(94,139,113,0.08)'   },
  { href: '/mind/support?tool=opposite',  icon: RotateCcw,   label: 'Choose a Helpful Next Step', desc: 'Identify one small action that moves you in a positive direction.',               sub: '3 steps',   color: '#C05570', bg: 'rgba(192,85,112,0.08)'   },
  { href: '/mind/support?tool=wise',      icon: Brain,       label: 'Find Your Calm Self',        desc: 'Connect with the part of you that is balanced, wise, and at ease.',              sub: '3 steps',   color: '#7B6DB8', bg: 'rgba(123,109,184,0.08)'  },
]

export default function MindPage() {
  const today = new Date().toISOString().slice(0, 10)
  const { data: todayMood } = trpc.moodEntries.today.useQuery({ date: today })
  const { data: history = [] } = trpc.moodEntries.history.useQuery({ limit: 7 })
  const { isPro } = useSubscription()

  return (
    <div>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--stable-hero-bg)' }}
      >
        <div style={{ position: 'absolute', top: -60, right: -40, width: 300, height: 300, borderRadius: '50%', background: 'rgba(139,126,200,0.08)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '20%', width: 240, height: 240, borderRadius: '50%', background: 'rgba(74,122,95,0.07)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="relative px-7 md:px-10 pt-10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--stable-t3)' }}>
            MIND & WELLBEING
          </p>
          <h1 className="text-[32px] md:text-[44px] font-black leading-[1.1] mb-2" style={{ color: 'var(--stable-t1)' }}>
            A moment<br />for your mind.
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--stable-t2)' }}>
            Guided tools to help you feel calmer, clearer, and more present.
          </p>

          {/* Mood + history row */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/mind/mood">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all hover:opacity-80 cursor-pointer"
                style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', color: 'var(--stable-t1)', boxShadow: 'var(--shadow-card)' }}>
                {todayMood
                  ? <>{MOOD_EMOJIS[todayMood.rating - 1]} {MOOD_LABELS[todayMood.rating - 1]}</>
                  : <>🌿 Log today&apos;s mood</>
                }
              </div>
            </Link>
            {history.length > 0 && (
              <div className="flex items-center gap-1.5">
                <TrendingUp size={12} style={{ color: 'var(--stable-t3)' }} />
                <span className="text-xs" style={{ color: 'var(--stable-t3)' }}>
                  {history.length} check-in{history.length !== 1 ? 's' : ''} this week
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SUPPORT TOOLS — all Pro-only ── */}
      <div className="px-7 md:px-10 py-8">
        <div className="flex items-center justify-between mb-6">
          <Label>Support tools</Label>
          <span className="text-xs" style={{ color: 'var(--stable-t3)' }}>
            {ALL_TOOLS.length} guided exercises
          </span>
        </div>

        {!isPro && (
          <div
            className="rounded-[20px] p-5 mb-5 flex items-center gap-4"
            style={{ background: 'var(--sage-soft)', border: '1px solid rgba(74,122,95,0.2)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style={{ background: 'var(--stable-cta)' }}>
              <Crown size={18} className="text-white" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black" style={{ color: 'var(--stable-t1)' }}>Support tools are Pro-only</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--stable-t2)' }}>
                Unlock all 6 guided exercises with a 7-day free trial.
              </p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 px-4 py-2 rounded-full text-xs font-black text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--stable-cta)' }}
            >
              Upgrade
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {ALL_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={isPro ? tool.href : '/pricing'}
              className="group block"
              style={{ opacity: isPro ? 1 : 0.7 }}
            >
              <Card className="p-6 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
                       style={{ background: tool.bg }}>
                    <tool.icon size={22} style={{ color: tool.color }} strokeWidth={1.7} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold" style={{ color: 'var(--stable-t1)' }}>{tool.label}</p>
                        {!isPro && <Lock size={11} style={{ color: 'var(--stable-t3)' }} strokeWidth={2.5} />}
                      </div>
                      <span className="text-[10px] font-semibold rounded-full px-2.5 py-1 shrink-0 ml-2"
                            style={{ background: tool.bg, color: tool.color }}>{tool.sub}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--stable-t2)' }}>{tool.desc}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold transition-all group-hover:gap-2.5"
                     style={{ color: isPro ? tool.color : 'var(--stable-t3)' }}>
                  {isPro ? <><>Begin</> <ArrowRight size={12} /></> : <><Crown size={11} strokeWidth={2} /> Unlock with Pro</>}
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Mood history */}
        {history.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <Label>Mood this week</Label>
              <Link href="/mind/mood">
                <Btn variant="tonal" size="xs">Check in <ArrowRight size={11} /></Btn>
              </Link>
            </div>
            <Card className="p-6">
              <div className="flex gap-2 items-end" style={{ height: 64 }}>
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date()
                  d.setDate(d.getDate() - (6 - i))
                  const key   = d.toISOString().slice(0, 10)
                  const label = d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 1)
                  const entry = history.find((e) => e.createdAt.slice(0, 10) === key)
                  return (
                    <div key={key} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-md transition-all"
                        style={{
                          height:     entry ? `${(entry.rating / 5) * 50 + 8}px` : '6px',
                          background: entry ? 'var(--cat-work)' : 'var(--stable-card-border)',
                          opacity:    entry ? 1 : 0.4,
                        }}
                      />
                      <span className="text-[9px] font-semibold" style={{ color: 'var(--stable-t3)' }}>{label}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
