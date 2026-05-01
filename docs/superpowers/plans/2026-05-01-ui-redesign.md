# stable. UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the stable. web UI to match the approved mockup — mobile-first centered layout, dual light/dark theme with toggle, bottom tab navigation, and task categories.

**Architecture:** CSS custom properties drive the theme system (`:root` = light, `[data-theme="dark"]` = dark). Tailwind utility classes map to these CSS variables. A static `public/theme-init.js` file loaded with `<Script strategy="beforeInteractive">` reads `localStorage` and sets the attribute before first paint, eliminating any flash. The sidebar is removed; a new `Shell` component provides the bottom tab bar and page wrapper.

**Tech Stack:** Next.js 15 App Router, tRPC v11, Tailwind CSS v3.4, Supabase (direct SQL migration), Clerk v6, TypeScript

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| CREATE | `packages/db/migrations/002_tasks_category.sql` | Add `category` column to tasks table |
| MODIFY | `packages/shared/src/types.ts` | Add `TaskCategory` type + `category` field on `Task` |
| MODIFY | `apps/api/src/routers/tasks.ts` | Category in create/update/mapTask |
| MODIFY | `apps/api/tailwind.config.ts` | CSS-variable-based stable colour tokens |
| MODIFY | `apps/api/app/globals.css` | CSS custom properties for both themes |
| CREATE | `apps/api/public/theme-init.js` | No-flash theme script loaded before render |
| MODIFY | `apps/api/app/layout.tsx` | Add `<Script strategy="beforeInteractive">` for theme |
| CREATE | `apps/api/src/components/theme-toggle.tsx` | Light/Dark pill toggle |
| CREATE | `apps/api/src/components/shell.tsx` | Mobile wrapper + fixed bottom tab nav |
| CREATE | `apps/api/src/components/task-card.tsx` | Task card with category colour |
| CREATE | `apps/api/src/components/ai-insight.tsx` | STABLE AI insight card |
| MODIFY | `apps/api/app/(dashboard)/layout.tsx` | Use Shell, remove Sidebar |
| REWRITE | `apps/api/app/(dashboard)/dashboard/page.tsx` | Today view |
| REWRITE | `apps/api/app/(dashboard)/tasks/page.tsx` | Tasks list with category |
| REWRITE | `apps/api/app/(dashboard)/focus/page.tsx` | Focus timer |
| REWRITE | `apps/api/app/(dashboard)/reminders/page.tsx` | Reminders |
| DELETE | `apps/api/src/components/sidebar.tsx` | Replaced by Shell |
| DELETE | `apps/api/src/components/task-item.tsx` | Replaced by TaskCard |
| DELETE | `apps/api/src/components/reminder-item.tsx` | Inlined into reminders page |

---

## Task 1: Database migration — add category column

**Files:**
- Create: `packages/db/migrations/002_tasks_category.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- packages/db/migrations/002_tasks_category.sql
ALTER TABLE tasks
  ADD COLUMN category TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN ('work', 'personal', 'family', 'health', 'other'));

CREATE INDEX tasks_user_id_category_idx ON tasks(user_id, category);
```

- [ ] **Step 2: Run the migration in Supabase**

Open your Supabase project → SQL Editor → paste the SQL above → Run.

Expected: "Success. No rows returned."

- [ ] **Step 3: Verify column exists**

In Supabase Table Editor, open the `tasks` table. You should see a `category` column with type `text`, default `other`, and a CHECK constraint.

- [ ] **Step 4: Commit the migration file**

```bash
cd /Users/femenba/stable
git add packages/db/migrations/002_tasks_category.sql
git commit -m "feat: add category column to tasks table"
```

---

## Task 2: Add TaskCategory to shared types

**Files:**
- Modify: `packages/shared/src/types.ts`

- [ ] **Step 1: Update types.ts** — replace entire file:

```ts
export type TaskStatus   = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 1 | 2 | 3  // 1=high, 2=medium, 3=low
export type TaskCategory = 'work' | 'personal' | 'family' | 'health' | 'other'
export type ReminderType = 'once' | 'repeating' | 'location'

export interface User {
  id: string
  clerkId: string
  email: string
  name: string | null
  timezone: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  userId: string
  title: string
  description: string | null
  dueAt: string | null
  estimatedMinutes: number | null
  priority: TaskPriority
  status: TaskStatus
  category: TaskCategory
  parentTaskId: string | null
  aiGenerated: boolean
  createdAt: string
  updatedAt: string
}

export interface Reminder {
  id: string
  taskId: string | null
  userId: string
  remindAt: string
  type: ReminderType
  dismissed: boolean
  snoozeCount: number
  createdAt: string
}

export interface FocusSession {
  id: string
  userId: string
  taskId: string | null
  startedAt: string
  endedAt: string | null
  durationMinutes: number | null
  completed: boolean
  createdAt: string
}
```

- [ ] **Step 2: Build the shared package**

```bash
cd /Users/femenba/stable
pnpm --filter @stable/shared build
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/types.ts
git commit -m "feat: add TaskCategory type to shared types"
```

---

## Task 3: Update tasks router to support category

**Files:**
- Modify: `apps/api/src/routers/tasks.ts`

- [ ] **Step 1: Replace entire tasks.ts**

```ts
import { router, protectedProcedure } from '@/trpc'
import { getUserId } from '@/lib/getUserId'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import type { Task } from '@stable/shared'

const categorySchema = z.enum(['work', 'personal', 'family', 'health', 'other'])

function mapTask(row: Record<string, unknown>): Task {
  return {
    id:               row.id as string,
    userId:           row.user_id as string,
    title:            row.title as string,
    description:      row.description as string | null,
    dueAt:            row.due_at as string | null,
    estimatedMinutes: row.estimated_minutes as number | null,
    priority:         row.priority as Task['priority'],
    status:           row.status as Task['status'],
    category:         (row.category as Task['category']) ?? 'other',
    parentTaskId:     row.parent_task_id as string | null,
    aiGenerated:      row.ai_generated as boolean,
    createdAt:        row.created_at as string,
    updatedAt:        row.updated_at as string,
  }
}

export const tasksRouter = router({
  create: protectedProcedure
    .input(z.object({
      title:            z.string().min(1).max(500),
      description:      z.string().optional(),
      dueAt:            z.string().datetime().optional(),
      estimatedMinutes: z.number().int().positive().optional(),
      priority:         z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
      category:         categorySchema.default('other'),
      parentTaskId:     z.string().uuid().optional(),
      aiGenerated:      z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const { data, error } = await ctx.db
        .from('tasks')
        .insert({
          user_id:          userId,
          title:            input.title,
          description:      input.description ?? null,
          due_at:           input.dueAt ?? null,
          estimated_minutes: input.estimatedMinutes ?? null,
          priority:         input.priority,
          category:         input.category,
          parent_task_id:   input.parentTaskId ?? null,
          ai_generated:     input.aiGenerated,
        })
        .select()
        .single()
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return mapTask(data)
    }),

  list: protectedProcedure
    .input(z.object({
      status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      let query = ctx.db
        .from('tasks')
        .select()
        .eq('user_id', userId)
        .is('parent_task_id', null)
        .order('created_at', { ascending: false })

      if (input.status) query = query.eq('status', input.status)

      const { data, error } = await query
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return (data ?? []).map(mapTask)
    }),

  listTopThree: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = await getUserId(ctx)
      const { data, error } = await ctx.db
        .from('tasks')
        .select()
        .eq('user_id', userId)
        .in('status', ['pending', 'in_progress'])
        .is('parent_task_id', null)
        .order('priority', { ascending: true })
        .order('due_at', { ascending: true, nullsFirst: false })
        .limit(3)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return (data ?? []).map(mapTask)
    }),

  update: protectedProcedure
    .input(z.object({
      id:               z.string().uuid(),
      title:            z.string().min(1).max(500).optional(),
      description:      z.string().nullable().optional(),
      dueAt:            z.string().datetime().nullable().optional(),
      estimatedMinutes: z.number().int().positive().nullable().optional(),
      priority:         z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
      category:         categorySchema.optional(),
      status:           z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const { id, ...fields } = input
      const updateData: Record<string, unknown> = {}
      if (fields.title !== undefined)            updateData.title             = fields.title
      if (fields.description !== undefined)      updateData.description       = fields.description
      if (fields.dueAt !== undefined)            updateData.due_at            = fields.dueAt
      if (fields.estimatedMinutes !== undefined) updateData.estimated_minutes = fields.estimatedMinutes
      if (fields.priority !== undefined)         updateData.priority          = fields.priority
      if (fields.category !== undefined)         updateData.category          = fields.category
      if (fields.status !== undefined)           updateData.status            = fields.status

      const { data, error } = await ctx.db
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      if (!data) throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' })
      return mapTask(data)
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const { data, error } = await ctx.db
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', input.id)
        .eq('user_id', userId)
        .select()
        .single()
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      if (!data) throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' })
      return mapTask(data)
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const { error } = await ctx.db
        .from('tasks')
        .delete()
        .eq('id', input.id)
        .eq('user_id', userId)
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return { success: true }
    }),
})
```

- [ ] **Step 2: Check TypeScript**

```bash
cd /Users/femenba/stable/apps/api && pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/routers/tasks.ts
git commit -m "feat: add category support to tasks router"
```

---

## Task 4: Theme system — CSS variables, Tailwind tokens, no-flash script

**Files:**
- Modify: `apps/api/tailwind.config.ts`
- Modify: `apps/api/app/globals.css`
- Create: `apps/api/public/theme-init.js`
- Modify: `apps/api/app/layout.tsx`

- [ ] **Step 1: Replace tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        stable: {
          bg:           'var(--stable-bg)',
          card:         'var(--stable-card)',
          'card-border':'var(--stable-card-border)',
          nav:          'var(--stable-nav)',
          'nav-border': 'var(--stable-nav-border)',
          t1:           'var(--stable-t1)',
          t2:           'var(--stable-t2)',
          t3:           'var(--stable-t3)',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Replace globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── Light mode (default) ─────────────────── */
:root {
  --stable-bg:          #fafafe;
  --stable-card:        #ffffff;
  --stable-card-border: #f0eeff;
  --stable-nav:         #ffffff;
  --stable-nav-border:  #f0eeff;
  --stable-t1:          #111111;
  --stable-t2:          #888888;
  --stable-t3:          #cccccc;
  --stable-header:      linear-gradient(160deg, #4f3aff 0%, #7c3aed 50%, #c026d3 100%);
  --stable-cta:         linear-gradient(135deg, #4f3aff, #7c3aed);
  --cat-work:     #4f3aff;
  --cat-personal: #7c3aed;
  --cat-family:   #be185d;
  --cat-health:   #0891b2;
  --cat-other:    #6b7280;
}

/* ── Dark mode ────────────────────────────── */
[data-theme="dark"] {
  --stable-bg:          #120e24;
  --stable-card:        #1a1535;
  --stable-card-border: #2a1f60;
  --stable-nav:         #120e24;
  --stable-nav-border:  #1e1a38;
  --stable-t1:          #e2d9f3;
  --stable-t2:          #8b7ab8;
  --stable-t3:          #3a2f5a;
  --stable-header:      linear-gradient(160deg, #1e1260 0%, #120e24 70%);
  --stable-cta:         linear-gradient(135deg, #6366f1, #a855f7);
  --cat-work:     #6366f1;
  --cat-personal: #a855f7;
  --cat-family:   #ec4899;
  --cat-health:   #22d3ee;
  --cat-other:    #9ca3af;
}

@layer base {
  * { box-sizing: border-box; }
  body {
    background: var(--stable-bg);
    color: var(--stable-t1);
    @apply antialiased;
  }
}
```

- [ ] **Step 3: Create public/theme-init.js**

This script runs before React hydrates, setting the theme attribute from localStorage so there is no flash of the wrong theme on load.

```js
(function () {
  try {
    var t = localStorage.getItem('stable-theme')
    if (t === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  } catch (_) {}
})()
```

- [ ] **Step 4: Replace app/layout.tsx**

```tsx
import './globals.css'
import Script from 'next/script'
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from '../src/lib/providers'

export const metadata = {
  title: 'stable.',
  description: 'Your focus companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en">
        <body>
          {/* Apply saved theme before first paint — eliminates flash */}
          <Script src="/theme-init.js" strategy="beforeInteractive" />
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Step 5: Check TypeScript**

```bash
cd /Users/femenba/stable/apps/api && pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add apps/api/tailwind.config.ts apps/api/app/globals.css \
        apps/api/public/theme-init.js apps/api/app/layout.tsx
git commit -m "feat: CSS variable theme system with no-flash beforeInteractive script"
```

---

## Task 5: ThemeToggle component

**Files:**
- Create: `apps/api/src/components/theme-toggle.tsx`

- [ ] **Step 1: Create theme-toggle.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('stable-theme') as 'light' | 'dark' | null
    if (saved) setTheme(saved)
  }, [])

  function apply(next: 'light' | 'dark') {
    setTheme(next)
    localStorage.setItem('stable-theme', next)
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  return (
    <div
      className="flex items-center rounded-full p-1 shrink-0"
      style={{
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <button
        onClick={() => apply('light')}
        className="flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold transition-all"
        style={{
          background:  theme === 'light' ? '#fff' : 'transparent',
          color:       theme === 'light' ? '#111' : 'rgba(255,255,255,0.5)',
          boxShadow:   theme === 'light' ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        ☀️ Light
      </button>
      <button
        onClick={() => apply('dark')}
        className="flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold transition-all"
        style={{
          background: theme === 'dark' ? '#1a1535' : 'transparent',
          color:      theme === 'dark' ? '#a78bfa' : 'rgba(255,255,255,0.5)',
          boxShadow:  theme === 'dark' ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        🌙 Dark
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Check TypeScript**

```bash
cd /Users/femenba/stable/apps/api && pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/components/theme-toggle.tsx
git commit -m "feat: add ThemeToggle component"
```

---

## Task 6: Shell component — mobile wrapper + bottom tab nav

**Files:**
- Create: `apps/api/src/components/shell.tsx`

- [ ] **Step 1: Create shell.tsx**

```tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const TABS = [
  { href: '/dashboard', label: 'Today',     icon: '🏠' },
  { href: '/tasks',     label: 'Tasks',     icon: '✓'  },
  { href: '/focus',     label: 'Focus',     icon: '⏱' },
  { href: '/reminders', label: 'Reminders', icon: '🔔' },
] as const

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-svh bg-stable-bg">
      {/* Scrollable page content */}
      <div className="max-w-[480px] mx-auto min-h-svh pb-[72px]">
        {children}
      </div>

      {/* Fixed bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-stable-nav border-t border-stable-nav-border"
        style={{ zIndex: 50 }}
      >
        <div className="max-w-[480px] mx-auto flex justify-around py-2">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center gap-0.5 py-1 px-5"
              >
                <span className="text-xl leading-none">{tab.icon}</span>
                {isActive && (
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ background: 'var(--cat-work)' }}
                  />
                )}
                <span
                  className="text-[9px] font-semibold uppercase tracking-wide"
                  style={{ color: isActive ? 'var(--cat-work)' : 'var(--stable-t3)' }}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
```

- [ ] **Step 2: Check TypeScript**

```bash
cd /Users/femenba/stable/apps/api && pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/components/shell.tsx
git commit -m "feat: add Shell component with fixed bottom tab navigation"
```

---

## Task 7: Replace dashboard layout — Sidebar out, Shell in

**Files:**
- Modify: `apps/api/app/(dashboard)/layout.tsx`
- Delete: `apps/api/src/components/sidebar.tsx`

- [ ] **Step 1: Replace layout.tsx**

```tsx
import { Suspense } from 'react'
import { Shell } from '../../src/components/shell'
import { UserSync } from '../../src/components/user-sync'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Shell>
      <Suspense fallback={null}>
        <UserSync />
      </Suspense>
      {children}
    </Shell>
  )
}
```

- [ ] **Step 2: Delete sidebar.tsx**

```bash
rm apps/api/src/components/sidebar.tsx
```

- [ ] **Step 3: Check TypeScript**

```bash
cd /Users/femenba/stable/apps/api && pnpm exec tsc --noEmit
```

Expected: No errors. (Sidebar was only imported in the old layout.)

- [ ] **Step 4: Commit**

```bash
git add apps/api/app/\(dashboard\)/layout.tsx
git rm apps/api/src/components/sidebar.tsx
git commit -m "feat: replace sidebar layout with Shell"
```

---

## Task 8: TaskCard component

**Files:**
- Create: `apps/api/src/components/task-card.tsx`
- Delete: `apps/api/src/components/task-item.tsx`

- [ ] **Step 1: Create task-card.tsx**

```tsx
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
```

- [ ] **Step 2: Delete task-item.tsx**

```bash
rm apps/api/src/components/task-item.tsx
```

- [ ] **Step 3: Check TypeScript**

```bash
cd /Users/femenba/stable/apps/api && pnpm exec tsc --noEmit
```

Expected: No errors. If you see errors about task-item still being imported, run:
```bash
grep -r "task-item" apps/api/src apps/api/app
```
and remove those import lines.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/components/task-card.tsx
git rm apps/api/src/components/task-item.tsx
git commit -m "feat: add TaskCard with category colours, remove old TaskItem"
```

---

## Task 9: AiInsight component

**Files:**
- Create: `apps/api/src/components/ai-insight.tsx`

- [ ] **Step 1: Create ai-insight.tsx**

```tsx
export function AiInsight() {
  return (
    <div
      className="mx-3 mt-3 rounded-xl px-4 py-3"
      style={{
        background: 'var(--stable-card)',
        border:     '1px solid var(--stable-card-border)',
      }}
    >
      <div
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 mb-2 text-[9px] font-bold uppercase tracking-wide"
        style={{
          background: 'rgba(99,102,241,0.12)',
          border:     '1px solid rgba(99,102,241,0.3)',
          color:      'var(--cat-work)',
        }}
      >
        ⬡ STABLE AI
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--stable-t2)' }}>
        Pick your three most important tasks and focus on{' '}
        <strong style={{ color: 'var(--stable-t1)' }}>one at a time</strong>.{' '}
        Your focus is sharpest{' '}
        <strong style={{ color: 'var(--stable-t1)' }}>before noon</strong>.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Check TypeScript**

```bash
cd /Users/femenba/stable/apps/api && pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/components/ai-insight.tsx
git commit -m "feat: add AiInsight card component"
```

---

## Task 10: Rewrite Today (dashboard) page

**Files:**
- Rewrite: `apps/api/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Replace dashboard/page.tsx**

```tsx
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
      <div className="px-5 pt-12 pb-6" style={{ background: 'var(--stable-header)' }}>
        <div className="flex items-start justify-between mb-3">
          <p
            className="text-[10px] font-medium uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {today} · TODAY'S FOCUS
          </p>
          <ThemeToggle />
        </div>
        <h1 className="text-[26px] font-extrabold text-white leading-tight">
          Three things.<br />That's it.
        </h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
          One at a time.
        </p>
      </div>

      {/* Body */}
      <div className="pb-4">
        <AiInsight />

        {isLoading ? (
          <div className="space-y-2 px-3 mt-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl animate-pulse"
                style={{ background: 'var(--stable-card)' }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2 px-3 mt-3">
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
        <div className="px-3 mt-3">
          <Link
            href="/focus"
            className="flex items-center justify-between rounded-xl px-4 py-4"
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
  )
}
```

- [ ] **Step 2: Check TypeScript**

```bash
cd /Users/femenba/stable/apps/api && pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add "apps/api/app/(dashboard)/dashboard/page.tsx"
git commit -m "feat: rewrite Today page with new design"
```

---

## Task 11: Rewrite Tasks page with category picker

**Files:**
- Rewrite: `apps/api/app/(dashboard)/tasks/page.tsx`

- [ ] **Step 1: Replace tasks/page.tsx**

```tsx
'use client'

import { useState } from 'react'
import { trpc } from '../../../src/lib/trpc-client'
import { TaskCard } from '../../../src/components/task-card'
import { ThemeToggle } from '../../../src/components/theme-toggle'
import type { TaskCategory } from '@stable/shared'

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'work',     label: 'Work'     },
  { value: 'personal', label: 'Personal' },
  { value: 'family',   label: 'Family'   },
  { value: 'health',   label: 'Health'   },
  { value: 'other',    label: 'Other'    },
]

export default function TasksPage() {
  const [title,     setTitle]     = useState('')
  const [priority,  setPriority]  = useState<1 | 2 | 3>(2)
  const [category,  setCategory]  = useState<TaskCategory>('work')
  const [showForm,  setShowForm]  = useState(false)

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
      {/* Header */}
      <div className="px-5 pt-12 pb-6" style={{ background: 'var(--stable-header)' }}>
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
            YOUR TASKS
          </p>
          <ThemeToggle />
        </div>
        <h1 className="text-[26px] font-extrabold text-white leading-tight">Tasks</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          + Add task
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div
          className="mx-3 mt-3 rounded-xl px-4 py-4"
          style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
        >
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              autoFocus
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
              style={{
                background: 'var(--stable-bg)',
                color:      'var(--stable-t1)',
                border:     '1px solid var(--stable-card-border)',
              }}
            />
            <div className="flex gap-2 flex-wrap items-center">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="text-xs rounded-lg px-3 py-2 outline-none"
                style={{ background: 'var(--stable-bg)', color: 'var(--stable-t1)', border: '1px solid var(--stable-card-border)' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
                className="text-xs rounded-lg px-3 py-2 outline-none"
                style={{ background: 'var(--stable-bg)', color: 'var(--stable-t1)', border: '1px solid var(--stable-card-border)' }}
              >
                <option value={1}>High priority</option>
                <option value={2}>Medium priority</option>
                <option value={3}>Low priority</option>
              </select>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ color: 'var(--stable-t2)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={create.isPending || !title.trim()}
                  className="text-xs font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
                  style={{ background: 'var(--cat-work)' }}
                >
                  {create.isPending ? '...' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Task list */}
      <div className="px-3 mt-3 pb-4 space-y-2">
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--stable-card)' }} />
          ))
        ) : (
          <>
            {pending.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
            ))}
            {!pending.length && !showForm && (
              <div
                className="rounded-xl px-5 py-8 text-center text-sm"
                style={{ background: 'var(--stable-card)', color: 'var(--stable-t3)' }}
              >
                No active tasks. Hit "+ Add task" above.
              </div>
            )}
            {completed.length > 0 && (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-widest pt-2" style={{ color: 'var(--stable-t3)' }}>
                  Completed
                </p>
                {completed.map((task) => (
                  <TaskCard key={task.id} task={task} onUpdate={handleUpdate} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Check TypeScript**

```bash
cd /Users/femenba/stable/apps/api && pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add "apps/api/app/(dashboard)/tasks/page.tsx"
git commit -m "feat: rewrite Tasks page with category picker and new design"
```

---

## Task 12: Rewrite Focus page

**Files:**
- Rewrite: `apps/api/app/(dashboard)/focus/page.tsx`

- [ ] **Step 1: Replace focus/page.tsx**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { trpc } from '../../../src/lib/trpc-client'
import { ThemeToggle } from '../../../src/components/theme-toggle'

function formatDuration(startedAt: string): string {
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return <span>{formatDuration(startedAt)}</span>
}

export default function FocusPage() {
  const utils = trpc.useUtils()
  const { data: sessions, isLoading } = trpc.focusSessions.list.useQuery({ limit: 10 })

  const start = trpc.focusSessions.start.useMutation({
    onSuccess: () => utils.focusSessions.list.invalidate(),
  })
  const end = trpc.focusSessions.end.useMutation({
    onSuccess: () => utils.focusSessions.list.invalidate(),
  })

  const activeSession = sessions?.find((s) => s.endedAt === null) ?? null
  const pastSessions  = sessions?.filter((s) => s.endedAt !== null) ?? []

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-12 pb-6" style={{ background: 'var(--stable-header)' }}>
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
            FOCUS MODE
          </p>
          <ThemeToggle />
        </div>
        <h1 className="text-[26px] font-extrabold text-white leading-tight">Focus</h1>
      </div>

      {/* Timer card */}
      <div
        className="mx-3 mt-3 rounded-xl px-5 py-8 text-center"
        style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
      >
        {activeSession ? (
          <>
            <div
              className="text-5xl font-mono font-bold tabular-nums mb-2"
              style={{ color: 'var(--cat-work)' }}
            >
              <ElapsedTimer startedAt={activeSession.startedAt} />
            </div>
            <p className="text-xs mb-6" style={{ color: 'var(--stable-t2)' }}>
              Focus session in progress
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => end.mutate({ id: activeSession.id, completed: true })}
                disabled={end.isPending}
                className="text-sm font-semibold px-6 py-3 rounded-xl text-white disabled:opacity-50"
                style={{ background: 'var(--stable-cta)' }}
              >
                End session ✓
              </button>
              <button
                onClick={() => end.mutate({ id: activeSession.id, completed: false })}
                disabled={end.isPending}
                className="text-sm font-semibold px-6 py-3 rounded-xl disabled:opacity-50"
                style={{ color: 'var(--stable-t2)', border: '1px solid var(--stable-card-border)' }}
              >
                Abandon
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              className="text-5xl font-mono font-bold tabular-nums mb-2"
              style={{ color: 'var(--stable-t3)' }}
            >
              00:00
            </div>
            <p className="text-xs mb-6" style={{ color: 'var(--stable-t2)' }}>
              Ready to focus
            </p>
            <button
              onClick={() => start.mutate({})}
              disabled={start.isPending}
              className="text-sm font-semibold px-8 py-3 rounded-xl text-white disabled:opacity-50"
              style={{ background: 'var(--stable-cta)' }}
            >
              ▶ Start session
            </button>
          </>
        )}
      </div>

      {/* Session history */}
      <div className="px-3 mt-4 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--stable-t3)' }}>
          Recent sessions
        </p>
        {isLoading ? (
          [0, 1].map((i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse mb-2" style={{ background: 'var(--stable-card)' }} />
          ))
        ) : !pastSessions.length ? (
          <div
            className="rounded-xl px-5 py-6 text-center text-sm"
            style={{ background: 'var(--stable-card)', color: 'var(--stable-t3)' }}
          >
            No completed sessions yet.
          </div>
        ) : (
          <div className="space-y-2">
            {pastSessions.map((s) => (
              <div
                key={s.id}
                className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--stable-t1)' }}>
                    {new Date(s.startedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--stable-t2)' }}>
                    {new Date(s.startedAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                    {s.endedAt
                      ? ` → ${new Date(s.endedAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}`
                      : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: 'var(--stable-t1)' }}>
                    {s.durationMinutes != null ? `${s.durationMinutes}m` : '—'}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: s.completed ? 'var(--cat-health)' : 'var(--stable-t3)' }}
                  >
                    {s.completed ? 'Completed' : 'Abandoned'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Check TypeScript**

```bash
cd /Users/femenba/stable/apps/api && pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add "apps/api/app/(dashboard)/focus/page.tsx"
git commit -m "feat: rewrite Focus page with new design"
```

---

## Task 13: Rewrite Reminders page

**Files:**
- Rewrite: `apps/api/app/(dashboard)/reminders/page.tsx`
- Delete: `apps/api/src/components/reminder-item.tsx`

- [ ] **Step 1: Replace reminders/page.tsx (reminder item inlined)**

```tsx
'use client'

import { useState } from 'react'
import { trpc } from '../../../src/lib/trpc-client'
import { ThemeToggle } from '../../../src/components/theme-toggle'

export default function RemindersPage() {
  const [remindAt, setRemindAt] = useState('')
  const [type,     setType]     = useState<'once' | 'repeating'>('once')
  const [showForm, setShowForm] = useState(false)

  const utils = trpc.useUtils()
  const { data: reminders, isLoading } = trpc.reminders.listUpcoming.useQuery()
  const create  = trpc.reminders.create.useMutation({
    onSuccess: () => {
      utils.reminders.listUpcoming.invalidate()
      setRemindAt('')
      setShowForm(false)
    },
  })
  const dismiss = trpc.reminders.dismiss.useMutation({
    onSuccess: () => utils.reminders.listUpcoming.invalidate(),
  })
  const snooze  = trpc.reminders.snooze.useMutation({
    onSuccess: () => utils.reminders.listUpcoming.invalidate(),
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!remindAt) return
    create.mutate({ remindAt: new Date(remindAt).toISOString(), type })
  }

  const snooze30 = (id: string) => {
    const t = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    snooze.mutate({ id, remindAt: t })
  }

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-12 pb-6" style={{ background: 'var(--stable-header)' }}>
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
            YOUR REMINDERS
          </p>
          <ThemeToggle />
        </div>
        <h1 className="text-[26px] font-extrabold text-white leading-tight">Reminders</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          + Add reminder
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div
          className="mx-3 mt-3 rounded-xl px-4 py-4"
          style={{ background: 'var(--stable-card)', border: '1px solid var(--stable-card-border)' }}
        >
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--stable-t2)' }}>
                Remind at
              </label>
              <input
                type="datetime-local"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
                className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
                style={{ background: 'var(--stable-bg)', color: 'var(--stable-t1)', border: '1px solid var(--stable-card-border)' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'once' | 'repeating')}
                className="text-xs rounded-lg px-3 py-2 outline-none"
                style={{ background: 'var(--stable-bg)', color: 'var(--stable-t1)', border: '1px solid var(--stable-card-border)' }}
              >
                <option value="once">Once</option>
                <option value="repeating">Repeating</option>
              </select>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ color: 'var(--stable-t2)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={create.isPending || !remindAt}
                  className="text-xs font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
                  style={{ background: 'var(--cat-work)' }}
                >
                  {create.isPending ? '...' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Reminder list */}
      <div className="px-3 mt-3 pb-4 space-y-2">
        {isLoading ? (
          [0, 1].map((i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--stable-card)' }} />
          ))
        ) : !reminders?.length ? (
          <div
            className="rounded-xl px-5 py-8 text-center text-sm"
            style={{ background: 'var(--stable-card)', color: 'var(--stable-t3)' }}
          >
            No upcoming reminders.
          </div>
        ) : (
          reminders.map((r) => (
            <div
              key={r.id}
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{
                background:      'var(--stable-card)',
                border:          '1px solid var(--stable-card-border)',
                borderLeftWidth: '3px',
                borderLeftColor: 'var(--cat-family)',
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--stable-t1)' }}>
                  {new Date(r.remindAt).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--stable-t2)' }}>
                  {r.type}
                  {r.snoozeCount > 0 ? ` · snoozed ${r.snoozeCount}×` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => snooze30(r.id)}
                  disabled={snooze.isPending}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-lg disabled:opacity-40"
                  style={{ color: 'var(--stable-t2)', border: '1px solid var(--stable-card-border)' }}
                  title="Snooze 30 min"
                >
                  +30m
                </button>
                <button
                  onClick={() => dismiss.mutate({ id: r.id })}
                  disabled={dismiss.isPending}
                  className="text-[11px] px-2.5 py-1 rounded-lg disabled:opacity-40"
                  style={{ color: 'var(--stable-t3)', border: '1px solid var(--stable-card-border)' }}
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Delete reminder-item.tsx**

```bash
rm apps/api/src/components/reminder-item.tsx
```

- [ ] **Step 3: Check TypeScript**

```bash
cd /Users/femenba/stable/apps/api && pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add "apps/api/app/(dashboard)/reminders/page.tsx"
git rm apps/api/src/components/reminder-item.tsx
git commit -m "feat: rewrite Reminders page with new design, inline reminder item"
```

---

## Task 14: Final build + smoke test + deploy

**Files:** None (verification only)

- [ ] **Step 1: Full build**

```bash
cd /Users/femenba/stable
pnpm --filter @stable/api build
```

Expected: Build completes, Next.js prints page sizes. Zero TypeScript errors.

If errors occur, diagnose:
- `task.category` does not exist → Task 2 (shared types) not applied; run `pnpm --filter @stable/shared build` then retry
- Import of deleted file → find with `grep -r "task-item\|reminder-item\|sidebar" apps/api/src apps/api/app` and remove

- [ ] **Step 2: Dev smoke-test**

```bash
pnpm --filter @stable/api dev
```

Open `http://localhost:3001` and verify:

1. Today page loads — gradient header, "Three things. That's it."
2. Bottom nav shows 4 tabs: Today · Tasks · Focus · Reminders
3. Theme toggle pill visible in header top-right
4. Click 🌙 Dark → page turns deep purple
5. Refresh → dark theme persists (no flash)
6. Click ☀️ Light → returns to light, persists on refresh
7. Tasks page → gradient header, "+ Add task" button works
8. Create task with category "Family" → pink left border on card ✓
9. Create task with category "Work" → indigo left border on card ✓
10. Focus page → timer card, start/end session works
11. Reminders page → list (or empty state) shown correctly

- [ ] **Step 3: Final commit**

```bash
cd /Users/femenba/stable
git add -A
git commit -m "feat: stable. UI redesign complete — light/dark theme, bottom nav, task categories"
```

- [ ] **Step 4: Deploy**

```bash
vercel --prod
```

Open the deployment URL and repeat smoke-test from Step 2.
