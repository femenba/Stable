'use client'

import { Circle, CheckCircle2, Trash2 } from 'lucide-react'
import { trpc } from '@/lib/trpc-client'

const PRIORITY_LABEL: Record<number, string> = { 1: 'high', 2: 'medium', 3: 'low' }
const PRIORITY_COLOR: Record<number, string> = {
  1: 'bg-red-50 text-red-600',
  2: 'bg-yellow-50 text-yellow-600',
  3: 'bg-gray-100 text-gray-500',
}

interface Task {
  id: string
  title: string
  description: string | null
  priority: 1 | 2 | 3
  status: string
  dueAt: string | null
  estimatedMinutes: number | null
}

interface TaskItemProps {
  task: Task
  onUpdate: () => void
}

export function TaskItem({ task, onUpdate }: TaskItemProps) {
  const complete = trpc.tasks.complete.useMutation({ onSuccess: onUpdate })
  const del = trpc.tasks.delete.useMutation({ onSuccess: onUpdate })

  const isComplete = task.status === 'completed'

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-start gap-4 transition-opacity ${
        isComplete ? 'opacity-50' : ''
      }`}
    >
      <button
        onClick={() => !isComplete && complete.mutate({ id: task.id })}
        disabled={isComplete || complete.isPending}
        className="mt-0.5 shrink-0 text-gray-300 hover:text-brand-500 disabled:cursor-not-allowed transition-colors"
      >
        {isComplete ? (
          <CheckCircle2 size={20} className="text-brand-500" />
        ) : (
          <Circle size={20} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium ${isComplete ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-gray-400 mt-0.5 truncate">{task.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          {task.dueAt && (
            <span className="text-xs text-gray-400">
              Due {new Date(task.dueAt).toLocaleDateString()}
            </span>
          )}
          {task.estimatedMinutes && (
            <span className="text-xs text-gray-400">{task.estimatedMinutes}m</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLOR[task.priority]}`}
        >
          {PRIORITY_LABEL[task.priority]}
        </span>
        <button
          onClick={() => del.mutate({ id: task.id })}
          disabled={del.isPending}
          className="text-gray-300 hover:text-red-400 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
