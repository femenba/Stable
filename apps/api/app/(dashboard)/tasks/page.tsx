'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Crown } from 'lucide-react'
import { trpc } from '../../../src/lib/trpc-client'
import { TaskCard } from '../../../src/components/task-card'
import { Card, Btn, Label, PageHero, Input, Empty } from '../../../src/components/ui'
import type { TaskCategory } from '@stable/shared'

const CATS: { value: TaskCategory; label: string }[] = [
  { value: 'work',     label: 'Work'     },
  { value: 'personal', label: 'Personal' },
  { value: 'family',   label: 'Family'   },
  { value: 'health',   label: 'Health'   },
  { value: 'other',    label: 'Other'    },
]

const CAT_COLOR: Record<TaskCategory, string> = {
  work: 'var(--cat-work)', personal: 'var(--cat-personal)',
  family: 'var(--cat-family)', health: 'var(--cat-health)', other: 'var(--cat-other)',
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

  const limitReached = create.error?.data?.code === 'FORBIDDEN'

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
      {/* Hero */}
      <PageHero
        eyebrow="YOUR TASKS"
        title="Tasks"
        subtitle={isLoading ? '…' : `${pending.length} active · ${completed.length} done`}
        actions={
          <Btn variant="glass" size="md" onClick={() => setShowForm((v) => !v)}>
            {showForm ? '✕ Cancel' : '+ New task'}
          </Btn>
        }
      />

      <div className="px-6 md:px-8 py-8 space-y-6 max-w-3xl">

        {/* Create form */}
        {showForm && (
          <Card className="p-7">
            <Label className="mb-5">New task</Label>
            <form onSubmit={handleCreate} className="space-y-5">
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you need to do?"
                autoFocus
                full
              />

              {/* Category */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'var(--stable-t3)' }}>
                  Category
                </p>
                <div className="flex gap-2 flex-wrap">
                  {CATS.map((c) => {
                    const active = category === c.value
                    const color  = CAT_COLOR[c.value]
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCategory(c.value)}
                        className="text-xs font-bold px-4 py-2 rounded-full border-2 transition-all"
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
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'var(--stable-t3)' }}>
                  Priority
                </p>
                <div className="flex gap-2">
                  {([1, 2, 3] as const).map((p) => {
                    const labels = { 1: 'High', 2: 'Medium', 3: 'Low' } as const
                    const active = priority === p
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className="flex-1 text-xs font-bold py-2.5 rounded-full border-2 transition-all"
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

              {limitReached && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                     style={{ background: 'rgba(74,122,95,0.08)', border: '1px solid rgba(74,122,95,0.2)' }}>
                  <Crown size={14} style={{ color: 'var(--cat-work)' }} className="shrink-0" />
                  <p className="text-xs flex-1" style={{ color: 'var(--stable-t1)' }}>
                    <strong>Task limit reached.</strong>{' '}
                    <Link href="/pricing" className="underline font-bold" style={{ color: 'var(--cat-work)' }}>
                      Upgrade to Pro
                    </Link>{' '}
                    for unlimited tasks.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Btn type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Cancel
                </Btn>
                <Btn type="submit" variant="primary" size="sm" disabled={create.isPending || !title.trim() || limitReached}>
                  {create.isPending ? '…' : 'Create task'}
                </Btn>
              </div>
            </form>
          </Card>
        )}

        {/* Active tasks */}
        {isLoading ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[72px] rounded-[24px] animate-pulse" style={{ background: 'var(--stable-card-border)' }} />
            ))}
          </div>
        ) : (
          <>
            {pending.length === 0 && !showForm ? (
              <Empty icon="✓" message="All clear — no active tasks."
                action={<Btn variant="tonal" size="sm" onClick={() => setShowForm(true)}>+ Add a task</Btn>}
              />
            ) : (
              <div className="space-y-2.5">
                {pending.map((task) => (
                  <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
                ))}
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <Label className="mb-3">Completed</Label>
                <div className="space-y-2">
                  {completed.map((task) => (
                    <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
