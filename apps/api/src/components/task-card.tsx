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
  work: 'Work', personal: 'Personal', family: 'Family', health: 'Health', other: 'Other',
}

export function TaskCard({ task, onUpdate }: { task: Task; onUpdate: () => void }) {
  const complete = trpc.tasks.complete.useMutation({ onSuccess: onUpdate })
  const del      = trpc.tasks.delete.useMutation({ onSuccess: onUpdate })

  const color  = CAT_COLOR[task.category] ?? CAT_COLOR.other
  const isDone = task.status === 'completed'

  return (
    <div
      className="flex items-center gap-4 transition-all"
      style={{
        background:      'var(--stable-card)',
        border:          '1px solid var(--stable-card-border)',
        borderRadius:    24,
        borderLeftWidth: 4,
        borderLeftColor: isDone ? 'var(--stable-card-border)' : color,
        boxShadow:       'var(--shadow-card)',
        padding:         '16px 18px',
        opacity:         isDone ? 0.55 : 1,
      }}
    >
      {/* Complete button */}
      <button
        onClick={() => complete.mutate({ id: task.id })}
        disabled={isDone || complete.isPending}
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all disabled:opacity-40 hover:opacity-80"
        style={{
          background:  isDone ? 'rgba(94,139,113,0.15)' : 'var(--stable-bg)',
          color:       isDone ? 'var(--cat-work)' : 'var(--stable-t3)',
          border:      `2px solid ${isDone ? 'var(--cat-work)' : 'var(--stable-card-border)'}`,
        }}
        title="Complete"
      >
        {isDone ? '✓' : ''}
      </button>

      {/* Content */}
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
            className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{ color, background: `${color}1A` }}
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

      {/* Delete */}
      <button
        onClick={() => del.mutate({ id: task.id })}
        disabled={del.isPending}
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all disabled:opacity-30 hover:opacity-50"
        style={{ color: 'var(--stable-t3)', background: 'var(--stable-bg)', border: '1px solid var(--stable-card-border)' }}
        title="Delete"
      >
        ✕
      </button>
    </div>
  )
}
