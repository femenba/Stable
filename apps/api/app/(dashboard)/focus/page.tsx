'use client'

import { useState, useEffect } from 'react'
import { trpc } from '../../../src/lib/trpc-client'
import { Play, Square, Clock } from 'lucide-react'

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
  const pastSessions = sessions?.filter((s) => s.endedAt !== null) ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Focus</h1>

      {/* Timer card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-6">
        {activeSession ? (
          <>
            <div className="text-6xl font-mono font-bold text-brand-600 tabular-nums">
              <ElapsedTimer startedAt={activeSession.startedAt} />
            </div>
            <p className="text-gray-400 text-sm">Focus session in progress</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => end.mutate({ id: activeSession.id, completed: true })}
                disabled={end.isPending}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-xl transition-colors"
              >
                <Square size={18} />
                End session
              </button>
              <button
                onClick={() => end.mutate({ id: activeSession.id, completed: false })}
                disabled={end.isPending}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Abandon
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-6xl font-mono font-bold text-gray-200 tabular-nums">00:00</div>
            <p className="text-gray-400 text-sm">Ready to focus</p>
            <button
              onClick={() => start.mutate({})}
              disabled={start.isPending}
              className="flex items-center gap-2 mx-auto bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium px-8 py-3 rounded-xl transition-colors"
            >
              <Play size={18} />
              Start session
            </button>
          </>
        )}
      </div>

      {/* Session history */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent sessions</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 bg-white rounded-xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : !pastSessions.length ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400">
            <Clock size={24} className="mx-auto mb-2 opacity-40" />
            <p>No completed sessions yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastSessions.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(s.startedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(s.startedAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                    {s.endedAt
                      ? ` → ${new Date(s.endedAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}`
                      : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    {s.durationMinutes != null ? `${s.durationMinutes}m` : '—'}
                  </p>
                  <p className={`text-xs ${s.completed ? 'text-green-500' : 'text-gray-400'}`}>
                    {s.completed ? 'Completed' : 'Abandoned'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
