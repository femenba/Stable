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
      <div className="px-5 pt-12 pb-6 md:px-8 md:pt-10 md:pb-8" style={{ background: 'var(--stable-header)' }}>
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
            FOCUS MODE
          </p>
          <span className="md:hidden"><ThemeToggle /></span>
        </div>
        <h1 className="text-[26px] md:text-5xl font-extrabold text-white leading-tight">Focus</h1>
      </div>

      {/* Timer card */}
      <div
        className="mx-3 mt-3 rounded-xl px-5 py-8 text-center md:mx-6 md:mt-5"
        style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
      >
        {activeSession ? (
          <>
            <div
              className="text-5xl font-mono font-bold tabular-nums mb-2"
              style={{ color: 'var(--cat-work)' }}
            >
              <ElapsedTimer startedAt={activeSession.startedAt} />
            </div>
            <p className="text-xs mb-6" style={{ color: 'var(--stable-t2)' }}>
              Focus session in progress
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => end.mutate({ id: activeSession.id, completed: true })}
                disabled={end.isPending}
                className="text-sm font-semibold px-6 py-3 rounded-xl text-white disabled:opacity-50"
                style={{ background: 'var(--stable-cta)' }}
              >
                End session ✓
              </button>
              <button
                onClick={() => end.mutate({ id: activeSession.id, completed: false })}
                disabled={end.isPending}
                className="text-sm font-semibold px-6 py-3 rounded-xl disabled:opacity-50"
                style={{ color: 'var(--stable-t2)', border: '1px solid var(--stable-card-border)' }}
              >
                Abandon
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              className="text-5xl font-mono font-bold tabular-nums mb-2"
              style={{ color: 'var(--stable-t3)' }}
            >
              00:00
            </div>
            <p className="text-xs mb-6" style={{ color: 'var(--stable-t2)' }}>
              Ready to focus
            </p>
            <button
              onClick={() => start.mutate({})}
              disabled={start.isPending}
              className="text-sm font-semibold px-8 py-3 rounded-xl text-white disabled:opacity-50"
              style={{ background: 'var(--stable-cta)' }}
            >
              ▶ Start session
            </button>
          </>
        )}
      </div>

      {/* Session history */}
      <div className="px-3 mt-4 pb-4 md:px-6 md:mt-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--stable-t3)' }}>
          Recent sessions
        </p>
        {isLoading ? (
          [0, 1].map((i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse mb-2" style={{ background: 'var(--stable-card)' }} />
          ))
        ) : !pastSessions.length ? (
          <div
            className="rounded-xl px-5 py-6 text-center text-sm"
            style={{ background: 'var(--stable-card)', color: 'var(--stable-t3)' }}
          >
            No completed sessions yet.
          </div>
        ) : (
          <div className="space-y-2">
            {pastSessions.map((s) => (
              <div
                key={s.id}
                className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--stable-t1)' }}>
                    {new Date(s.startedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--stable-t2)' }}>
                    {new Date(s.startedAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                    {s.endedAt
                      ? ` → ${new Date(s.endedAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}`
                      : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: 'var(--stable-t1)' }}>
                    {s.durationMinutes != null ? `${s.durationMinutes}m` : '—'}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: s.completed ? 'var(--cat-health)' : 'var(--stable-t3)' }}
                  >
                    {s.completed ? 'Completed' : 'Abandoned'}
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
