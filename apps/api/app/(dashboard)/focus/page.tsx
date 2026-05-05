'use client'

import { useState, useEffect } from 'react'
import { trpc } from '../../../src/lib/trpc-client'
import { Card, Btn, Label, PageHero } from '../../../src/components/ui'

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

  const start = trpc.focusSessions.start.useMutation({ onSuccess: () => utils.focusSessions.list.invalidate() })
  const end   = trpc.focusSessions.end.useMutation({ onSuccess: () => utils.focusSessions.list.invalidate() })

  const activeSession = sessions?.find((s) => s.endedAt === null) ?? null
  const pastSessions  = sessions?.filter((s) => s.endedAt !== null) ?? []

  return (
    <div>
      {/* Hero */}
      <PageHero
        eyebrow="FOCUS MODE"
        title="Focus"
        subtitle={activeSession ? 'Session in progress — stay with it.' : 'Deep work, one session at a time.'}
      />

      <div className="px-6 md:px-8 py-8 space-y-6 max-w-2xl">

        {/* Timer card */}
        <Card className="p-10 text-center">
          {activeSession ? (
            <>
              <Label className="mb-6 block">Session running</Label>
              <div
                className="font-mono font-black tabular-nums leading-none mb-4"
                style={{ fontSize: 88, color: 'var(--cat-work)', letterSpacing: '-3px' }}
              >
                <ElapsedTimer startedAt={activeSession.startedAt} />
              </div>
              <p className="text-sm mb-8" style={{ color: 'var(--stable-t2)' }}>
                You&apos;re doing great. Keep going.
              </p>
              <div className="flex justify-center gap-3">
                <Btn
                  variant="primary"
                  size="lg"
                  onClick={() => end.mutate({ id: activeSession.id, completed: true })}
                  disabled={end.isPending}
                >
                  End session ✓
                </Btn>
                <Btn
                  variant="ghost"
                  size="lg"
                  onClick={() => end.mutate({ id: activeSession.id, completed: false })}
                  disabled={end.isPending}
                >
                  Abandon
                </Btn>
              </div>
            </>
          ) : (
            <>
              <Label className="mb-6 block">Ready to focus</Label>
              <div
                className="font-mono font-black tabular-nums leading-none mb-4"
                style={{ fontSize: 88, color: 'var(--stable-card-border)', letterSpacing: '-3px' }}
              >
                00:00
              </div>
              <p className="text-sm mb-8" style={{ color: 'var(--stable-t2)' }}>
                Start a session and track your deep work time.
              </p>
              <Btn
                variant="primary"
                size="lg"
                onClick={() => start.mutate({})}
                disabled={start.isPending}
                icon="▶"
              >
                Start session
              </Btn>
            </>
          )}
        </Card>

        {/* Session history */}
        <div>
          <Label className="mb-4">Recent sessions</Label>
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-[68px] rounded-[24px] animate-pulse" style={{ background: 'var(--stable-card-border)' }} />
              ))}
            </div>
          ) : !pastSessions.length ? (
            <Card className="px-6 py-10 text-center text-sm" style={{ color: 'var(--stable-t3)' }}>
              No completed sessions yet. Start one above.
            </Card>
          ) : (
            <div className="space-y-2">
              {pastSessions.map((s) => (
                <Card key={s.id} className="px-6 py-4 flex items-center justify-between">
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
                    <p className="text-[10px] font-semibold mt-0.5" style={{ color: s.completed ? 'var(--cat-health)' : 'var(--stable-t3)' }}>
                      {s.completed ? '✓ Completed' : 'Abandoned'}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
