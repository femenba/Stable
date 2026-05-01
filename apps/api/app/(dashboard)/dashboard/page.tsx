'use client'

import { trpc } from '../../../src/lib/trpc-client'
import Link from 'next/link'
import { CheckCircle2, Clock, Bell, ArrowRight } from 'lucide-react'

const PRIORITY_LABEL: Record<number, string> = { 1: 'high', 2: 'medium', 3: 'low' }
const PRIORITY_COLOR: Record<number, string> = {
  1: 'bg-red-50 text-red-600',
  2: 'bg-yellow-50 text-yellow-600',
  3: 'bg-gray-100 text-gray-500',
}

export default function DashboardPage() {
  const { data: topTasks, isLoading: loadingTasks } = trpc.tasks.listTopThree.useQuery()
  const { data: sessions } = trpc.focusSessions.list.useQuery({ limit: 10 })
  const { data: reminders, isLoading: loadingReminders } = trpc.reminders.listUpcoming.useQuery()

  const activeSession = sessions?.find((s) => s.endedAt === null) ?? null
  const upcomingReminders = reminders?.slice(0, 3) ?? []

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">{today}</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Good day.</h1>
      </div>

      {/* Active focus session banner */}
      {activeSession && (
        <div className="bg-brand-500 text-white rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={20} />
            <div>
              <p className="font-semibold">Focus session in progress</p>
              <p className="text-brand-100 text-sm">
                Started{' '}
                {new Date(activeSession.startedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <Link
            href="/focus"
            className="text-sm font-medium bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            View session
          </Link>
        </div>
      )}

      {/* Top tasks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Priority Tasks</h2>
          <Link
            href="/tasks"
            className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            All tasks <ArrowRight size={14} />
          </Link>
        </div>
        {loadingTasks ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 bg-white rounded-xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : !topTasks?.length ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
            <CheckCircle2 size={32} className="mx-auto mb-2 opacity-40" />
            <p>No active tasks — add one to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  {task.dueAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Due {new Date(task.dueAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${PRIORITY_COLOR[task.priority]}`}>
                  {PRIORITY_LABEL[task.priority]}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming reminders */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Upcoming Reminders</h2>
          <Link
            href="/reminders"
            className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            All reminders <ArrowRight size={14} />
          </Link>
        </div>
        {loadingReminders ? (
          <div className="h-14 bg-white rounded-xl animate-pulse border border-gray-100" />
        ) : !upcomingReminders.length ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400">
            <Bell size={24} className="mx-auto mb-2 opacity-40" />
            <p>No upcoming reminders.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingReminders.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4"
              >
                <Bell size={16} className="text-brand-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(r.remindAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                  <p className="text-xs text-gray-400">{r.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
