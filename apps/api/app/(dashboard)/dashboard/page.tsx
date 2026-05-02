'use client'

import { trpc } from '../../../src/lib/trpc-client'
import Link from 'next/link'
import { ThemeToggle } from '../../../src/components/theme-toggle'
import { AiInsight } from '../../../src/components/ai-insight'
import { TaskCard } from '../../../src/components/task-card'

export default function DashboardPage() {
  const { data: topTasks, isLoading } = trpc.tasks.listTopThree.useQuery()
  const utils = trpc.useUtils()

  const today = new Date()
    .toLocaleDateString('en-GB', { weekday: 'long' })
    .toUpperCase()

  const handleUpdate = () => {
    utils.tasks.listTopThree.invalidate()
  }

  return (
    <div>
      {/* Gradient header */}
      <div
        className="px-5 pt-12 pb-6 md:px-8 md:pt-10 md:pb-8"
        style={{ background: 'var(--stable-header)' }}
      >
        <div className="flex items-start justify-between mb-3">
          <p
            className="text-[10px] font-medium uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {today} · TODAY'S FOCUS
          </p>
          {/* Hide on desktop — ThemeToggle lives in sidebar */}
          <span className="md:hidden"><ThemeToggle /></span>
        </div>
        <h1 className="text-[26px] md:text-5xl font-extrabold text-white leading-tight">
          Three things.<br />That&apos;s it.
        </h1>
        <p className="text-xs md:text-sm mt-1 md:mt-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
          One at a time.
        </p>
      </div>

      {/* Body */}
      <div className="pb-4 md:pb-0">
        <AiInsight />

        {isLoading ? (
          <div className="space-y-2 px-3 mt-3 md:px-6 md:mt-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl animate-pulse"
                style={{ background: 'var(--stable-card)' }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2 px-3 mt-3 md:px-6 md:mt-5 md:space-y-3">
            {(topTasks ?? []).map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
            ))}
            {!topTasks?.length && (
              <div
                className="rounded-xl px-5 py-8 text-center text-sm"
                style={{ background: 'var(--stable-card)', color: 'var(--stable-t3)' }}
              >
                No active tasks — add one in{' '}
                <Link href="/tasks" className="underline" style={{ color: 'var(--cat-work)' }}>
                  Tasks
                </Link>
                .
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="px-3 mt-3 md:px-6 md:mt-5">
          <Link
            href="/focus"
            className="flex items-center justify-between rounded-xl px-4 py-4 md:py-5"
            style={{ background: 'var(--stable-cta)' }}
          >
            <div>
              <p className="text-sm md:text-base font-bold text-white">Start focus session</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Ready when you are
              </p>
            </div>
            <span className="text-white text-lg font-semibold">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
