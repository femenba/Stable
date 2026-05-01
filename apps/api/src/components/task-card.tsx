'use client'

import { trpc } from '@/lib/trpc-client'
import type { Task, TaskCategory } from '@stable/shared'

const CAT_COLOR: Record<TaskCategory, string> = {
  work:     'var(--cat-work)',
  personal: 'var(--cat-personal)',
  family:   'var(--cat-family)',
  health:   'var(--cat-health)',
  other:    'var(--cat-other)',
}

const CAT_LABEL: Record<TaskCategory, string> = {
  work:     'Work',
  personal: 'Personal',
  family:   'Family',
  health:   'Health',
  other:    'Other',
}

interface TaskCardProps {
  task: Task
  onUpdate: () => void
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const complete = trpc.tasks.complete.useMutation({ onSuccess: onUpdate })
  const del      = trpc.tasks.delete.useMutation({ onSuccess: onUpdate })

  const color  = CAT_COLOR[task.category] ?? CAT_COLOR.other
  const isDone = task.status === 'completed'

  return (
    <div
      className="rounded-xl px-4 py-3 flex items-start gap-3"
      style={{
        background:      'var(--stable-card)',
        border:          '1px solid var(--stable-card-border)',
        borderLeftWidth: '3px',
        borderLeftColor: color,
      }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold"
          style={{
            color:          isDone ? 'var(--stable-t3)' : 'var(--stable-t1)',
            textDecoration: isDone ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{ color, background: `${color}22` }}
          >
            {CAT_LABEL[task.category] ?? 'Other'}
          </span>
          {task.estimatedMinutes != null && (
            <span className="text-[10px]" style={{ color: 'var(--stable-t3)' }}>
              {task.estimatedMinutes} min
            </span>
          )}
          {task.dueAt && (
            <span className="text-[10px]" style={{ color: 'var(--stable-t3)' }}>
              {new Date(task.dueAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
        <button
          onClick={() => complete.mutate({ id: task.id })}
          disabled={isDone || complete.isPending}
          className="text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40"
          style={{ color: 'var(--stable-t2)', border: '1px solid var(--stable-card-border)' }}
          title="Complete"
        >
          ✓
        </button>
        <button
          onClick={() => del.mutate({ id: task.id })}
          disabled={del.isPending}
          className="text-[11px] px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40"
          style={{ color: 'var(--stable-t3)', border: '1px solid var(--stable-card-border)' }}
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
