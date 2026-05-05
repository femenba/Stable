'use client'

import { useState, useEffect } from 'react'
import { trpc } from '../../../src/lib/trpc-client'
import { ThemeToggle } from '../../../src/components/theme-toggle'

function formatDuration(startedAt: string): string {
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return <span>{formatDuration(startedAt)}</span>
}

export default function FocusPage() {
  const utils = trpc.useUtils()
  const { data: sessions, isLoading } = trpc.focusSessions.list.useQuery({ limit: 10 })

  const start = trpc.focusSessions.start.useMutation({
    onSuccess: () => utils.focusSessions.list.invalidate(),
  })
  const end = trpc.focusSessions.end.useMutation({
    onSuccess: () => utils.focusSessions.list.invalidate(),
  })

  const activeSession = sessions?.find((s) => s.endedAt === null) ?? null
  const pastSessions  = sessions?.filter((s) => s.endedAt !== null) ?? []

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden px-4 pt-12 pb-8 md:px-10 lg:px-12 md:pt-12 md:pb-10" style={{ background: 'var(--stable-header)' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
            FOCUS MODE
          </p>
          <span className="md:hidden"><ThemeToggle /></span>
        </div>
        <h1 className="text-[28px] md:text-[44px] font-black text-white leading-tight">Focus</h1>
        <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.58)' }}>
          {activeSession ? 'Session in progress — stay with it.' : 'Deep work, one session at a time.'}
        </p>
      </div>

      {/* Timer card */}
      <div className="px-4 md:px-10 lg:px-12 mt-6">
        <div
          className="rounded-2xl text-center"
          style={{
            background: 'var(--stable-card)',
            border:     '1px solid var(--stable-card-border)',
            boxShadow:  'var(--shadow-float)',
            padding:    '56px 32px',
          }}
        >
          {activeSession ? (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--stable-t3)' }}>
                Session running
              </p>
              <div
                className="font-mono font-black tabular-nums mb-3 leading-none"
                style={{ fontSize: 80, color: 'var(--cat-work)', letterSpacing: '-3px' }}
              >
                <ElapsedTimer startedAt={activeSession.startedAt} />
              </div>
              <p className="text-sm mb-8" style={{ color: 'var(--stable-t2)' }}>
                You&apos;re doing great. Keep going.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => end.mutate({ id: activeSession.id, completed: true })}
                  disabled={end.isPending}
                  className="text-sm font-black px-8 py-4 rounded-2xl text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                  style={{ background: 'var(--stable-cta)', boxShadow: 'var(--shadow-cta)' }}
                >
                  End session ✓
                </button>
                <button
                  onClick={() => end.mutate({ id: activeSession.id, completed: false })}
                  disabled={end.isPending}
                  className="text-sm font-semibold px-6 py-4 rounded-2xl disabled:opacity-50 transition-all hover:opacity-70"
                  style={{ color: 'var(--stable-t2)', background: 'var(--stable-bg)', border: '1px solid var(--stable-card-border)' }}
                >
                  Abandon
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--stable-t3)' }}>
                Ready to focus
              </p>
              <div
                className="font-mono font-black tabular-nums mb-3 leading-none"
                style={{ fontSize: 80, color: 'var(--stable-t3)', letterSpacing: '-3px' }}
              >
                00:00
              </div>
              <p className="text-sm mb-8" style={{ color: 'var(--stable-t2)' }}>
                Start a session and track your deep work time.
              </p>
              <button
                onClick={() => start.mutate({})}
                disabled={start.isPending}
                className="text-sm font-black px-10 py-4 rounded-2xl text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: 'var(--stable-cta)', boxShadow: 'var(--shadow-cta)' }}
              >
                ▶ Start session
              </button>
            </>
          )}
        </div>
      </div>

      {/* Session history */}
      <div className="px-4 mt-6 pb-8 md:px-10 lg:px-12">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--stable-t3)' }}>
          Recent sessions
        </p>
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'var(--stable-card-border)' }} />
            ))}
          </div>
        ) : !pastSessions.length ? (
          <div
            className="rounded-2xl px-5 py-10 text-center text-sm"
            style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', color: 'var(--stable-t3)' }}
          >
            No completed sessions yet.
          </div>
        ) : (
          <div className="space-y-2">
            {pastSessions.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl px-5 py-4 flex items-center justify-between"
                style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', boxShadow: 'var(--shadow-card)' }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--stable-t1)' }}>
                    {new Date(s.startedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--stable-t2)' }}>
                    {new Date(s.startedAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                    {s.endedAt ? ` → ${new Date(s.endedAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black" style={{ color: 'var(--stable-t1)' }}>
                    {s.durationMinutes != null ? `${s.durationMinutes}m` : '—'}
                  </p>
                  <p
                    className="text-[10px] font-semibold mt-0.5"
                    style={{ color: s.completed ? 'var(--cat-health)' : 'var(--stable-t3)' }}
                  >
                    {s.completed ? '✓ Completed' : 'Abandoned'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
