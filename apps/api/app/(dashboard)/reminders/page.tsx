'use client'

import { useState } from 'react'
import { trpc } from '../../../src/lib/trpc-client'
import { ThemeToggle } from '../../../src/components/theme-toggle'

export default function RemindersPage() {
  const [remindAt, setRemindAt] = useState('')
  const [type,     setType]     = useState<'once' | 'repeating'>('once')
  const [showForm, setShowForm] = useState(false)

  const utils = trpc.useUtils()
  const { data: reminders, isLoading } = trpc.reminders.listUpcoming.useQuery()
  const create  = trpc.reminders.create.useMutation({
    onSuccess: () => {
      utils.reminders.listUpcoming.invalidate()
      setRemindAt('')
      setShowForm(false)
    },
  })
  const dismiss = trpc.reminders.dismiss.useMutation({
    onSuccess: () => utils.reminders.listUpcoming.invalidate(),
  })
  const snooze  = trpc.reminders.snooze.useMutation({
    onSuccess: () => utils.reminders.listUpcoming.invalidate(),
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!remindAt) return
    create.mutate({ remindAt: new Date(remindAt).toISOString(), type })
  }

  const snooze30 = (id: string) => {
    const t = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    snooze.mutate({ id, remindAt: t })
  }

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-12 pb-6" style={{ background: 'var(--stable-header)' }}>
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
            YOUR REMINDERS
          </p>
          <ThemeToggle />
        </div>
        <h1 className="text-[26px] font-extrabold text-white leading-tight">Reminders</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          + Add reminder
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div
          className="mx-3 mt-3 rounded-xl px-4 py-4"
          style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
        >
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--stable-t2)' }}>
                Remind at
              </label>
              <input
                type="datetime-local"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
                className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
                style={{ background: 'var(--stable-bg)', color: 'var(--stable-t1)', border: '1px solid var(--stable-card-border)' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'once' | 'repeating')}
                className="text-xs rounded-lg px-3 py-2 outline-none"
                style={{ background: 'var(--stable-bg)', color: 'var(--stable-t1)', border: '1px solid var(--stable-card-border)' }}
              >
                <option value="once">Once</option>
                <option value="repeating">Repeating</option>
              </select>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ color: 'var(--stable-t2)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={create.isPending || !remindAt}
                  className="text-xs font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
                  style={{ background: 'var(--cat-work)' }}
                >
                  {create.isPending ? '...' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Reminder list */}
      <div className="px-3 mt-3 pb-4 space-y-2">
        {isLoading ? (
          [0, 1].map((i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--stable-card)' }} />
          ))
        ) : !reminders?.length ? (
          <div
            className="rounded-xl px-5 py-8 text-center text-sm"
            style={{ background: 'var(--stable-card)', color: 'var(--stable-t3)' }}
          >
            No upcoming reminders.
          </div>
        ) : (
          reminders.map((r) => (
            <div
              key={r.id}
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{
                background:      'var(--stable-card)',
                border:          '1px solid var(--stable-card-border)',
                borderLeftWidth: '3px',
                borderLeftColor: 'var(--cat-family)',
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--stable-t1)' }}>
                  {new Date(r.remindAt).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--stable-t2)' }}>
                  {r.type}
                  {r.snoozeCount > 0 ? ` · snoozed ${r.snoozeCount}×` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => snooze30(r.id)}
                  disabled={snooze.isPending}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-lg disabled:opacity-40"
                  style={{ color: 'var(--stable-t2)', border: '1px solid var(--stable-card-border)' }}
                  title="Snooze 30 min"
                >
                  +30m
                </button>
                <button
                  onClick={() => dismiss.mutate({ id: r.id })}
                  disabled={dismiss.isPending}
                  className="text-[11px] px-2.5 py-1 rounded-lg disabled:opacity-40"
                  style={{ color: 'var(--stable-t3)', border: '1px solid var(--stable-card-border)' }}
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
