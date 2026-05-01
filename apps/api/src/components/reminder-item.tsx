'use client'

import { Bell, X, AlarmClock } from 'lucide-react'
import { trpc } from '@/lib/trpc-client'

interface Reminder {
  id: string
  remindAt: string
  type: string
  snoozeCount: number
}

interface ReminderItemProps {
  reminder: Reminder
  onUpdate: () => void
}

export function ReminderItem({ reminder, onUpdate }: ReminderItemProps) {
  const dismiss = trpc.reminders.dismiss.useMutation({ onSuccess: onUpdate })
  const snooze = trpc.reminders.snooze.useMutation({ onSuccess: onUpdate })

  const snoozeUntil = () => {
    const t = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    snooze.mutate({ id: reminder.id, remindAt: t })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4">
      <Bell size={18} className="text-brand-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">
          {new Date(reminder.remindAt).toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {reminder.type}
          {reminder.snoozeCount > 0 ? ` · snoozed ${reminder.snoozeCount}×` : ''}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={snoozeUntil}
          disabled={snooze.isPending}
          title="Snooze 30 min"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-500 border border-gray-200 hover:border-brand-300 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <AlarmClock size={13} />
          30m
        </button>
        <button
          onClick={() => dismiss.mutate({ id: reminder.id })}
          disabled={dismiss.isPending}
          title="Dismiss"
          className="text-gray-300 hover:text-red-400 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
