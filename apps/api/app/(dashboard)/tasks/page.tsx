'use client'

import { useState } from 'react'
import { trpc } from '../../../src/lib/trpc-client'
import { TaskCard } from '../../../src/components/task-card'
import { Plus, Loader2 } from 'lucide-react'

export default function TasksPage() {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<1 | 2 | 3>(2)
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
    create.mutate({ title: title.trim(), priority })
  }

  const handleUpdate = () => {
    utils.tasks.list.invalidate()
    utils.tasks.listTopThree.invalidate()
  }

  const pending = tasks?.filter((t) => t.status !== 'completed') ?? []
  const completed = tasks?.filter((t) => t.status === 'completed') ?? []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add task
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full text-gray-900 placeholder-gray-400 text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            autoFocus
          />
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-500">Priority:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            >
              <option value={1}>High</option>
              <option value={2}>Medium</option>
              <option value={3}>Low</option>
            </select>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={create.isPending || !title.trim()}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {create.isPending && <Loader2 size={14} className="animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {pending.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
            ))}
            {!pending.length && !showForm && (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
                No active tasks. Add one above.
              </div>
            )}
          </div>

          {completed.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Completed</p>
              {completed.map((task) => (
                <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
