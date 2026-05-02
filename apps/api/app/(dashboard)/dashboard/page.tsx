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

  // Shared skeleton / task content — rendered in both layouts
  const skeletons = [0, 1, 2].map((i) => (
    <div
      key={i}
      className="h-16 rounded-xl animate-pulse"
      style={{ background: 'var(--stable-card)' }}
    />
  ))

  const emptyState = (
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
  )

  const taskNodes = isLoading
    ? skeletons
    : (topTasks ?? []).length > 0
      ? (topTasks ?? []).map((task) => (
          <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
        ))
      : [emptyState]

  return (
    <div>

      {/* ═══════════════════════════════════════════════════════
          MOBILE layout — hidden on md+
      ═══════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        {/* Gradient hero header */}
        <div className="px-4 pt-12 pb-6" style={{ background: 'var(--stable-header)' }}>
          <div className="flex items-start justify-between mb-3">
            <p
              className="text-[10px] font-medium uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {today} · TODAY&apos;S FOCUS
            </p>
            <ThemeToggle />
          </div>
          <h1 className="text-[26px] font-extrabold text-white leading-tight">
            Three things.<br />That&apos;s it.
          </h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
            One at a time.
          </p>
        </div>

        {/* Body */}
        <div className="pb-4">
          <AiInsight />
          <div className="space-y-3 px-4 mt-4">
            {taskNodes}
          </div>
          <div className="px-4 mt-4">
            <Link
              href="/focus"
              className="flex items-center justify-between rounded-xl px-5 py-4"
              style={{ background: 'var(--stable-cta)' }}
            >
              <div>
                <p className="text-sm font-bold text-white">Start focus session</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Ready when you are
                </p>
              </div>
              <span className="text-white text-lg font-semibold">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP layout — hidden on mobile
      ═══════════════════════════════════════════════════════ */}
      <div className="hidden md:block px-10 lg:px-14 pt-10 pb-12">

        {/* Page header — clean, no gradient background */}
        <div className="mb-8">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--stable-t3)' }}
          >
            {today} · TODAY&apos;S FOCUS
          </p>
          <h1 className="text-[40px] font-extrabold leading-tight" style={{ color: 'var(--stable-t1)' }}>
            Three things.{' '}
            <span style={{ color: 'var(--cat-work)' }}>That&apos;s it.</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--stable-t2)' }}>
            One at a time. Pick three. Go deep.
          </p>
        </div>

        {/* Dashboard grid — 3 columns */}
        <div className="grid grid-cols-3 gap-6 items-start">

          {/* ── Main column (2/3): tasks ─────────────────────── */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <p
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--stable-t3)' }}
              >
                Today&apos;s tasks
              </p>
              <Link
                href="/tasks"
                className="text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: 'var(--cat-work)' }}
              >
                Manage →
              </Link>
            </div>
            <div className="space-y-3">
              {taskNodes}
            </div>
          </div>

          {/* ── Side column (1/3): AI + Focus CTA ───────────── */}
          <div className="col-span-1 space-y-5">

            {/* AI suggestion widget */}
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--stable-t3)' }}
              >
                AI suggestion
              </p>
              <div
                className="rounded-xl px-4 py-4"
                style={{
                  background: 'var(--stable-card)',
                  border:     '1px solid var(--stable-card-border)',
                }}
              >
                <div
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 mb-3 text-[9px] font-bold uppercase tracking-wide"
                  style={{
                    background: 'rgba(99,102,241,0.12)',
                    border:     '1px solid rgba(99,102,241,0.3)',
                    color:      'var(--cat-work)',
                  }}
                >
                  ⬡ STABLE AI
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--stable-t2)' }}>
                  Pick your three most important tasks and focus on{' '}
                  <strong style={{ color: 'var(--stable-t1)' }}>one at a time</strong>.{' '}
                  Your focus is sharpest{' '}
                  <strong style={{ color: 'var(--stable-t1)' }}>before noon</strong>.
                </p>
              </div>
            </div>

            {/* Focus CTA widget */}
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--stable-t3)' }}
              >
                Focus session
              </p>
              <Link
                href="/focus"
                className="flex items-center justify-between rounded-xl px-4 py-5 transition-opacity hover:opacity-90"
                style={{ background: 'var(--stable-cta)' }}
              >
                <div>
                  <p className="text-sm font-bold text-white">Start session</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    Ready when you are
                  </p>
                </div>
                <span className="text-white text-xl font-semibold">→</span>
              </Link>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
