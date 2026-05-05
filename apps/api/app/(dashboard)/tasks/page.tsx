'use client'

import { useState } from 'react'
import { trpc } from '../../../src/lib/trpc-client'
import { TaskCard } from '../../../src/components/task-card'
import { ThemeToggle } from '../../../src/components/theme-toggle'
import type { TaskCategory } from '@stable/shared'

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'work',     label: 'Work'     },
  { value: 'personal', label: 'Personal' },
  { value: 'family',   label: 'Family'   },
  { value: 'health',   label: 'Health'   },
  { value: 'other',    label: 'Other'    },
]

const CAT_COLOR: Record<TaskCategory, string> = {
  work:     'var(--cat-work)',
  personal: 'var(--cat-personal)',
  family:   'var(--cat-family)',
  health:   'var(--cat-health)',
  other:    'var(--cat-other)',
}

export default function TasksPage() {
  const [title,    setTitle]    = useState('')
  const [priority, setPriority] = useState<1 | 2 | 3>(2)
  const [category, setCategory] = useState<TaskCategory>('work')
  const [showForm, setShowForm] = useState(false)

  const utils = trpc.useUtils()
  const { data: tasks, isLoading } = trpc.tasks.list.useQuery({})
  const create = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate()
      utils.tasks.listTopThree.invalidate()
      setTitle('')
      setShowForm(false)
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    create.mutate({ title: title.trim(), priority, category })
  }

  const handleUpdate = () => {
    utils.tasks.list.invalidate()
    utils.tasks.listTopThree.invalidate()
  }

  const pending   = tasks?.filter((t) => t.status !== 'completed') ?? []
  const completed = tasks?.filter((t) => t.status === 'completed') ?? []

  return (
    <div>
      {/* Header */}
      <div
        className="relative overflow-hidden px-4 pt-12 pb-8 md:px-10 lg:px-12 md:pt-12 md:pb-10"
        style={{ background: 'var(--stable-header)' }}
      >
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
            YOUR TASKS
          </p>
          <span className="md:hidden"><ThemeToggle /></span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] md:text-[44px] font-black text-white leading-tight">Tasks</h1>
            <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.58)' }}>
              {isLoading ? '…' : `${pending.length} active · ${completed.length} done`}
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="shrink-0 rounded-2xl px-5 py-3 text-sm font-black text-white transition-opacity hover:opacity-90"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.22)' }}
          >
            + Add task
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="px-4 mt-5 md:px-10 lg:px-12">
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)', boxShadow: 'var(--shadow-float)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--stable-t3)' }}>
              New task
            </p>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you need to do?"
                autoFocus
                className="w-full text-sm font-semibold rounded-xl px-4 py-3 outline-none"
                style={{
                  background: 'var(--stable-bg)',
                  color:      'var(--stable-t1)',
                  border:     '1px solid var(--stable-card-border)',
                }}
              />

              {/* Category pills */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--stable-t3)' }}>Category</p>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((c) => {
                    const active = category === c.value
                    const color = CAT_COLOR[c.value]
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCategory(c.value)}
                        className="text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all"
                        style={{
                          borderColor: active ? color : 'var(--stable-card-border)',
                          background:  active ? `${color}1A` : 'transparent',
                          color:       active ? color : 'var(--stable-t2)',
                        }}
                      >
                        {c.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Priority */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--stable-t3)' }}>Priority</p>
                <div className="flex gap-2">
                  {([1, 2, 3] as const).map((p) => {
                    const labels = { 1: 'High', 2: 'Medium', 3: 'Low' }
                    const active = priority === p
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className="flex-1 text-xs font-bold py-2 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: active ? 'var(--cat-work)' : 'var(--stable-card-border)',
                          background:  active ? 'rgba(94,139,113,0.1)' : 'transparent',
                          color:       active ? 'var(--cat-work)' : 'var(--stable-t2)',
                        }}
                      >
                        {labels[p]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-sm px-4 py-2.5 rounded-xl transition-opacity hover:opacity-70"
                  style={{ color: 'var(--stable-t2)', background: 'var(--stable-bg)', border: '1px solid var(--stable-card-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={create.isPending || !title.trim()}
                  className="text-sm font-black px-6 py-2.5 rounded-xl text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                  style={{ background: 'var(--stable-cta)', boxShadow: 'var(--shadow-cta)' }}
                >
                  {create.isPending ? '…' : 'Create task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="px-4 mt-5 pb-8 md:px-10 lg:px-12">
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[68px] rounded-2xl animate-pulse" style={{ background: 'var(--stable-card-border)' }} />
            ))}
          </div>
        ) : (
          <>
            {pending.map((task) => (
              <div key={task.id} className="mb-2">
                <TaskCard task={task} onUpdate={handleUpdate} />
              </div>
            ))}
            {!pending.length && !showForm && (
              <div
                className="rounded-2xl px-5 py-12 text-center"
                style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
              >
                <p className="text-sm mb-2" style={{ color: 'var(--stable-t3)' }}>No active tasks</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-xs font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-70"
                  style={{ background: 'rgba(94,139,113,0.1)', color: 'var(--cat-work)' }}
                >
                  + Add your first task
                </button>
              </div>
            )}
            {completed.length > 0 && (
              <>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mt-6 mb-3"
                  style={{ color: 'var(--stable-t3)' }}
                >
                  Completed
                </p>
                {completed.map((task) => (
                  <div key={task.id} className="mb-2">
                    <TaskCard task={task} onUpdate={handleUpdate} />
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
