'use client'

import { useState } from 'react'
import { trpc } from '../../../src/lib/trpc-client'
import { ReminderItem } from '../../../src/components/reminder-item'
import { Bell, Plus, Loader2 } from 'lucide-react'

export default function RemindersPage() {
  const [remindAt, setRemindAt] = useState('')
  const [type, setType] = useState<'once' | 'repeating'>('once')
  const [showForm, setShowForm] = useState(false)

  const utils = trpc.useUtils()
  const { data: reminders, isLoading } = trpc.reminders.listUpcoming.useQuery()
  const create = trpc.reminders.create.useMutation({
    onSuccess: () => {
      utils.reminders.listUpcoming.invalidate()
      setRemindAt('')
      setShowForm(false)
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!remindAt) return
    create.mutate({ remindAt: new Date(remindAt).toISOString(), type })
  }

  const handleUpdate = () => utils.reminders.listUpcoming.invalidate()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add reminder
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-gray-200 p-5 space-y-4"
        >
          <div>
            <label className="block text-sm text-gray-500 mb-1.5">Remind at</label>
            <input
              type="datetime-local"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-500">Type:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'once' | 'repeating')}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            >
              <option value="once">Once</option>
              <option value="repeating">Repeating</option>
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
                disabled={create.isPending || !remindAt}
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
          {[0, 1].map((i) => (
            <div key={i} className="h-14 bg-white rounded-xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : !reminders?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
          <Bell size={32} className="mx-auto mb-2 opacity-40" />
          <p>No upcoming reminders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => (
            <ReminderItem key={r.id} reminder={r} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}
