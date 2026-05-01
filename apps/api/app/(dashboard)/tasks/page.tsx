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

export default function TasksPage() {
  const [title,     setTitle]     = useState('')
  const [priority,  setPriority]  = useState<1 | 2 | 3>(2)
  const [category,  setCategory]  = useState<TaskCategory>('work')
  const [showForm,  setShowForm]  = useState(false)

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
      <div className="px-5 pt-12 pb-6" style={{ background: 'var(--stable-header)' }}>
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
            YOUR TASKS
          </p>
          <ThemeToggle />
        </div>
        <h1 className="text-[26px] font-extrabold text-white leading-tight">Tasks</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          + Add task
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div
          className="mx-3 mt-3 rounded-xl px-4 py-4"
          style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
        >
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              autoFocus
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
              style={{
                background: 'var(--stable-bg)',
                color:      'var(--stable-t1)',
                border:     '1px solid var(--stable-card-border)',
              }}
            />
            <div className="flex gap-2 flex-wrap items-center">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="text-xs rounded-lg px-3 py-2 outline-none"
                style={{ background: 'var(--stable-bg)', color: 'var(--stable-t1)', border: '1px solid var(--stable-card-border)' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
                className="text-xs rounded-lg px-3 py-2 outline-none"
                style={{ background: 'var(--stable-bg)', color: 'var(--stable-t1)', border: '1px solid var(--stable-card-border)' }}
              >
                <option value={1}>High priority</option>
                <option value={2}>Medium priority</option>
                <option value={3}>Low priority</option>
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
                  disabled={create.isPending || !title.trim()}
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

      {/* Task list */}
      <div className="px-3 mt-3 pb-4 space-y-2">
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--stable-card)' }} />
          ))
        ) : (
          <>
            {pending.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
            ))}
            {!pending.length && !showForm && (
              <div
                className="rounded-xl px-5 py-8 text-center text-sm"
                style={{ background: 'var(--stable-card)', color: 'var(--stable-t3)' }}
              >
                No active tasks. Hit &quot;+ Add task&quot; above.
              </div>
            )}
            {completed.length > 0 && (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-widest pt-2" style={{ color: 'var(--stable-t3)' }}>
                  Completed
                </p>
                {completed.map((task) => (
                  <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
