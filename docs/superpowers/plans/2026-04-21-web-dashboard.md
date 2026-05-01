# Web Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the stable. web dashboard — Clerk sign-in/sign-up, task management, focus sessions, reminders, and a daily overview — all wired to the live tRPC API and Supabase backend.

**Architecture:** Single Next.js 15 App Router app (`apps/api`) that serves both the tRPC API (`/api/trpc/*`) and the web UI. Client components consume the API via tRPC React Query (`/api/trpc`). Clerk handles auth — cookies are sent automatically same-origin so no token injection is needed.

**Tech Stack:** Next.js 15, Tailwind CSS v3, tRPC v11 + React Query v5, Clerk v6 (`@clerk/nextjs`), lucide-react icons, Zod.

---

## Critical Architectural Constraints

- `tsconfig.json` has `"paths": { "@/*": ["./src/*"] }` — the `@/` alias resolves to `apps/api/src/`, NOT the repo root.
- New shared code (clients, providers, components) goes in `src/`.
- New pages go in `app/` (Next.js App Router convention).
- Both existing and new files must respect this boundary.
- `dev` server runs on port 3001 (`next dev --port 3001`).

---

## File Map

**New files to create:**

| File | Responsibility |
|------|----------------|
| `app/globals.css` | Tailwind directives + CSS reset |
| `src/lib/trpc-client.ts` | tRPC React proxy instance |
| `src/lib/providers.tsx` | QueryClient + tRPC provider wrapper (client component) |
| `src/components/sidebar.tsx` | Nav sidebar with links (client component) |
| `src/components/task-item.tsx` | Single task row with complete/delete actions |
| `src/components/reminder-item.tsx` | Single reminder row with dismiss/snooze actions |
| `src/components/focus-timer.tsx` | Active focus session timer display |
| `app/(auth)/sign-in/[[...sign-in]]/page.tsx` | Clerk sign-in page |
| `app/(auth)/sign-up/[[...sign-up]]/page.tsx` | Clerk sign-up page |
| `app/(auth)/layout.tsx` | Centered layout for auth pages |
| `app/(dashboard)/layout.tsx` | Shell with sidebar + user sync on mount |
| `app/(dashboard)/dashboard/page.tsx` | Daily overview (top tasks + active session + upcoming reminders) |
| `app/(dashboard)/tasks/page.tsx` | Full task list + add task form |
| `app/(dashboard)/focus/page.tsx` | Focus session start/end + history |
| `app/(dashboard)/reminders/page.tsx` | Upcoming reminders list |

**Files to modify:**

| File | Change |
|------|--------|
| `app/layout.tsx` | Add ClerkProvider, Providers, import globals.css |
| `app/page.tsx` | Redirect to `/dashboard` |
| `package.json` | Add react deps, tailwind, trpc client, react-query, lucide-react |
| `middleware.ts` | Add `/dashboard(.*)` to public route exclusion (already protected by default) |

---

## Task 1: Install Dependencies + Tailwind

**Files:**
- Modify: `apps/api/package.json`
- Create: `apps/api/tailwind.config.ts`
- Create: `apps/api/postcss.config.mjs`
- Create: `apps/api/app/globals.css`

- [ ] **Step 1: Install packages**

Run from `apps/api/`:
```bash
cd /Users/femenba/stable/apps/api
pnpm add react react-dom @trpc/react-query @tanstack/react-query @trpc/client lucide-react
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p --ts
```

Expected: `tailwind.config.ts` and `postcss.config.mjs` created.

- [ ] **Step 2: Configure Tailwind content paths**

Edit `apps/api/tailwind.config.ts`:
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
        brand: {
          50:  '#f0f4ff',
          100: '#dde7ff',
          500: '#4f6ef7',
          600: '#3b5af0',
          700: '#2c46dc',
          900: '#1a2d9e',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 3: Create globals.css**

Create `apps/api/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    box-sizing: border-box;
  }
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}
```

- [ ] **Step 4: Verify build**

```bash
cd /Users/femenba/stable/apps/api
pnpm build
```

Expected: Build succeeds (may warn about missing ClerkProvider, ignore for now).

- [ ] **Step 5: Commit**

```bash
cd /Users/femenba/stable
git add apps/api/package.json apps/api/tailwind.config.ts apps/api/postcss.config.mjs apps/api/app/globals.css pnpm-lock.yaml
git commit -m "feat: install tailwind + trpc client + react-query deps"
```

---

## Task 2: tRPC React Client + Providers

**Files:**
- Create: `apps/api/src/lib/trpc-client.ts`
- Create: `apps/api/src/lib/providers.tsx`

- [ ] **Step 1: Create tRPC React proxy**

Create `apps/api/src/lib/trpc-client.ts`:
```ts
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/router'

export const trpc = createTRPCReact<AppRouter>()
```

- [ ] **Step 2: Create Providers component**

Create `apps/api/src/lib/providers.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { trpc } from '@/lib/trpc-client'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      }),
  )

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    }),
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/femenba/stable/apps/api
pnpm exec tsc --noEmit
```

Expected: No errors in the two new files.

- [ ] **Step 4: Commit**

```bash
cd /Users/femenba/stable
git add apps/api/src/lib/trpc-client.ts apps/api/src/lib/providers.tsx
git commit -m "feat: add trpc react client and providers"
```

---

## Task 3: Root Layout + Auth Pages

**Files:**
- Modify: `apps/api/app/layout.tsx`
- Modify: `apps/api/app/page.tsx`
- Create: `apps/api/app/(auth)/layout.tsx`
- Create: `apps/api/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Create: `apps/api/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

- [ ] **Step 1: Update root layout**

Replace `apps/api/app/layout.tsx`:
```tsx
import './globals.css'
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
    <ClerkProvider>
      <html lang="en">
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
```

Note: The import path for `providers` uses a relative path from `app/` to `src/lib/` because `@/` resolves to `src/` but `app/layout.tsx` is outside `src/`. Use `'../src/lib/providers'`.

- [ ] **Step 2: Update home page to redirect**

Replace `apps/api/app/page.tsx`:
```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

- [ ] **Step 3: Create auth layout**

Create `apps/api/app/(auth)/layout.tsx`:
```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  )
}
```

- [ ] **Step 4: Create sign-in page**

Create `apps/api/app/(auth)/sign-in/[[...sign-in]]/page.tsx`:
```tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">stable.</h1>
        <p className="text-gray-500 mt-1">Your focus companion</p>
      </div>
      <SignIn />
    </div>
  )
}
```

- [ ] **Step 5: Create sign-up page**

Create `apps/api/app/(auth)/sign-up/[[...sign-up]]/page.tsx`:
```tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">stable.</h1>
        <p className="text-gray-500 mt-1">Your focus companion</p>
      </div>
      <SignUp />
    </div>
  )
}
```

- [ ] **Step 6: Build and verify**

```bash
cd /Users/femenba/stable/apps/api
pnpm build
```

Expected: Build succeeds. Visit `http://localhost:3001` and confirm it redirects to `/sign-in` (unauthenticated).

- [ ] **Step 7: Commit**

```bash
cd /Users/femenba/stable
git add apps/api/app/layout.tsx apps/api/app/page.tsx apps/api/app/\(auth\)/
git commit -m "feat: root layout with Clerk + auth pages"
```

---

## Task 4: Sidebar Component

**Files:**
- Create: `apps/api/src/components/sidebar.tsx`

- [ ] **Step 1: Create sidebar**

Create `apps/api/src/components/sidebar.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, CheckSquare, Timer, Bell } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Today', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/focus', label: 'Focus', icon: Timer },
  { href: '/reminders', label: 'Reminders', icon: Bell },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-white border-r border-gray-100 px-3 py-5">
      <div className="px-3 mb-8">
        <span className="text-2xl font-bold text-gray-900">stable.</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto px-3 pt-4 border-t border-gray-100 flex items-center gap-3">
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-sm text-gray-500">Account</span>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/femenba/stable/apps/api
pnpm exec tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/femenba/stable
git add apps/api/src/components/sidebar.tsx
git commit -m "feat: sidebar navigation component"
```

---

## Task 5: Dashboard Shell Layout + User Sync

**Files:**
- Create: `apps/api/app/(dashboard)/layout.tsx`

The dashboard layout must sync the Clerk user into the DB (`users.upsertMe`) on first load. We do this with a client component child so the layout itself can be a server component.

- [ ] **Step 1: Create user sync client component**

Create `apps/api/src/components/user-sync.tsx`:
```tsx
'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { trpc } from '@/lib/trpc-client'

export function UserSync() {
  const { user, isLoaded } = useUser()
  const upsert = trpc.users.upsertMe.useMutation()

  useEffect(() => {
    if (!isLoaded || !user) return
    upsert.mutate({
      email: user.primaryEmailAddress?.emailAddress ?? '',
      name: user.fullName ?? undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    // Run once on mount — intentionally no deps array for upsert
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id])

  return null
}
```

- [ ] **Step 2: Create dashboard shell layout**

Create `apps/api/app/(dashboard)/layout.tsx`:
```tsx
import { Sidebar } from '../../src/components/sidebar'
import { UserSync } from '../../src/components/user-sync'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <UserSync />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Build and verify**

```bash
cd /Users/femenba/stable/apps/api
pnpm build
```

Expected: Build succeeds. Sign in and verify the sidebar appears.

- [ ] **Step 4: Commit**

```bash
cd /Users/femenba/stable
git add apps/api/src/components/user-sync.tsx apps/api/app/\(dashboard\)/layout.tsx
git commit -m "feat: dashboard layout with sidebar and user sync"
```

---

## Task 6: Dashboard Overview Page (Today View)

**Files:**
- Create: `apps/api/app/(dashboard)/dashboard/page.tsx`

Shows: top 3 tasks, any active focus session, and next 3 upcoming reminders.

- [ ] **Step 1: Create the dashboard page**

Create `apps/api/app/(dashboard)/dashboard/page.tsx`:
```tsx
'use client'

import { trpc } from '../../../src/lib/trpc-client'
import Link from 'next/link'
import { CheckCircle2, Clock, Bell, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const { data: topTasks, isLoading: loadingTasks } = trpc.tasks.listTopThree.useQuery()
  const { data: sessions, isLoading: loadingSessions } = trpc.focusSessions.list.useQuery({ limit: 1 })
  const { data: reminders, isLoading: loadingReminders } = trpc.reminders.listUpcoming.useQuery()

  const activeSession = sessions?.[0] && !sessions[0].endedAt ? sessions[0] : null
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
                Started {new Date(activeSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <Link href="/focus" className="text-sm font-medium bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
            View session
          </Link>
        </div>
      )}

      {/* Top tasks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Priority Tasks</h2>
          <Link href="/tasks" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
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
              <div key={task.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  {task.dueAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Due {new Date(task.dueAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  task.priority === 'urgent' ? 'bg-red-50 text-red-600' :
                  task.priority === 'high' ? 'bg-orange-50 text-orange-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {task.priority}
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
          <Link href="/reminders" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
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
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4">
                <Bell size={16} className="text-brand-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(r.remindAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
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
```

Note: The `trpc.focusSessions.list` query returns sessions — check that `endedAt` and `startedAt` match the actual field names returned by `focusSessions.list` in `src/routers/focusSessions.ts`. If the field is `ended_at` (snake_case from Supabase), adjust accordingly. Look at the actual DB column names returned.

- [ ] **Step 2: Check focusSessions router field names**

Read `apps/api/src/routers/focusSessions.ts` and confirm: what fields does `list` return? If it maps to camelCase, use `endedAt` / `startedAt`. If raw Supabase (snake_case), use `ended_at` / `started_at`. Update `dashboard/page.tsx` to match.

- [ ] **Step 3: Build and verify**

```bash
cd /Users/femenba/stable/apps/api
pnpm build
pnpm dev
```

Visit `http://localhost:3001/dashboard`. Sign in. Verify the today view loads without errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/femenba/stable
git add apps/api/app/\(dashboard\)/dashboard/
git commit -m "feat: dashboard today overview page"
```

---

## Task 7: Tasks Page

**Files:**
- Create: `apps/api/src/components/task-item.tsx`
- Create: `apps/api/app/(dashboard)/tasks/page.tsx`

- [ ] **Step 1: Create TaskItem component**

Create `apps/api/src/components/task-item.tsx`:
```tsx
'use client'

import { CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { trpc } from '@/lib/trpc-client'

interface Task {
  id: string
  title: string
  description?: string | null
  priority: string
  status: string
  dueAt?: string | null
  estimatedMinutes?: number | null
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
    <div className={`bg-white rounded-xl border px-5 py-4 flex items-start gap-4 transition-opacity ${isComplete ? 'opacity-50' : ''}`}>
      <button
        onClick={() => !isComplete && complete.mutate({ id: task.id })}
        disabled={isComplete || complete.isPending}
        className="mt-0.5 shrink-0 text-gray-300 hover:text-brand-500 disabled:cursor-not-allowed transition-colors"
      >
        {isComplete ? <CheckCircle2 size={20} className="text-brand-500" /> : <Circle size={20} />}
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
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          task.priority === 'urgent' ? 'bg-red-50 text-red-600' :
          task.priority === 'high' ? 'bg-orange-50 text-orange-600' :
          task.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' :
          'bg-gray-100 text-gray-500'
        }`}>
          {task.priority}
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
```

- [ ] **Step 2: Create tasks page**

Create `apps/api/app/(dashboard)/tasks/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { trpc } from '../../../src/lib/trpc-client'
import { TaskItem } from '../../../src/components/task-item'
import { Plus, Loader2 } from 'lucide-react'

export default function TasksPage() {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
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
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
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
              <TaskItem key={task.id} task={task} onUpdate={handleUpdate} />
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
                <TaskItem key={task.id} task={task} onUpdate={handleUpdate} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Check tasks router field names**

Read `apps/api/src/routers/tasks.ts` to confirm the exact shape returned by `tasks.list`. Adjust field references in `task-item.tsx` (`dueAt`, `estimatedMinutes`, `priority`, `status`, `title`) to match the actual property names.

- [ ] **Step 4: Build and test**

```bash
cd /Users/femenba/stable/apps/api
pnpm build
pnpm dev
```

Sign in, navigate to `/tasks`, create a task, complete it, delete it. Verify all three mutations work.

- [ ] **Step 5: Commit**

```bash
cd /Users/femenba/stable
git add apps/api/src/components/task-item.tsx apps/api/app/\(dashboard\)/tasks/
git commit -m "feat: tasks page with create, complete, delete"
```

---

## Task 8: Focus Sessions Page

**Files:**
- Create: `apps/api/app/(dashboard)/focus/page.tsx`

- [ ] **Step 1: Create focus sessions page**

Create `apps/api/app/(dashboard)/focus/page.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { trpc } from '../../../src/lib/trpc-client'
import { Play, Square, Clock } from 'lucide-react'

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

  // Detect active session (no endedAt)
  // Note: field name depends on router mapping. Check focusSessions.ts - adjust if snake_case.
  const activeSession = sessions?.find((s) => !s.endedAt) ?? null
  const pastSessions = sessions?.filter((s) => !!s.endedAt) ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Focus</h1>

      {/* Timer card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-6">
        {activeSession ? (
          <>
            <div className="text-6xl font-mono font-bold text-brand-600 tabular-nums">
              <ElapsedTimer startedAt={activeSession.startedAt} />
            </div>
            <p className="text-gray-400 text-sm">Focus session in progress</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => end.mutate({ id: activeSession.id, completed: true })}
                disabled={end.isPending}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-xl transition-colors"
              >
                <Square size={18} />
                End session
              </button>
              <button
                onClick={() => end.mutate({ id: activeSession.id, completed: false })}
                disabled={end.isPending}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Abandon
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-6xl font-mono font-bold text-gray-200 tabular-nums">00:00</div>
            <p className="text-gray-400 text-sm">Ready to focus</p>
            <button
              onClick={() => start.mutate({})}
              disabled={start.isPending}
              className="flex items-center gap-2 mx-auto bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium px-8 py-3 rounded-xl transition-colors"
            >
              <Play size={18} />
              Start session
            </button>
          </>
        )}
      </div>

      {/* Session history */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent sessions</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 bg-white rounded-xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : !pastSessions.length ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400">
            <Clock size={24} className="mx-auto mb-2 opacity-40" />
            <p>No completed sessions yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastSessions.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(s.startedAt).toLocaleDateString([], { dateStyle: 'medium' })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(s.startedAt).toLocaleTimeString([], { timeStyle: 'short' })} →{' '}
                    {s.endedAt
                      ? new Date(s.endedAt).toLocaleTimeString([], { timeStyle: 'short' })
                      : '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{s.durationMinutes ?? '—'}m</p>
                  <p className={`text-xs ${s.completed ? 'text-green-500' : 'text-gray-400'}`}>
                    {s.completed ? 'Completed' : 'Abandoned'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Check focusSessions router field names**

Read `apps/api/src/routers/focusSessions.ts`. Confirm field names returned by `list`: `startedAt`/`started_at`, `endedAt`/`ended_at`, `durationMinutes`/`duration_minutes`, `completed`. Update the page to match.

- [ ] **Step 3: Build and test**

```bash
cd /Users/femenba/stable/apps/api
pnpm dev
```

Visit `/focus`. Start a session — confirm timer counts up. End the session — confirm it appears in history.

- [ ] **Step 4: Commit**

```bash
cd /Users/femenba/stable
git add apps/api/app/\(dashboard\)/focus/
git commit -m "feat: focus sessions page with live timer"
```

---

## Task 9: Reminders Page

**Files:**
- Create: `apps/api/src/components/reminder-item.tsx`
- Create: `apps/api/app/(dashboard)/reminders/page.tsx`

- [ ] **Step 1: Create ReminderItem component**

Create `apps/api/src/components/reminder-item.tsx`:
```tsx
'use client'

import { Bell, X, AlarmClock } from 'lucide-react'
import { trpc } from '@/lib/trpc-client'

interface Reminder {
  id: string
  remindAt: string
  type: string
  snoozeCount?: number | null
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
          {new Date(reminder.remindAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {reminder.type}
          {reminder.snoozeCount ? ` · snoozed ${reminder.snoozeCount}×` : ''}
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
```

- [ ] **Step 2: Create reminders page**

Create `apps/api/app/(dashboard)/reminders/page.tsx`:
```tsx
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
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
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
              onChange={(e) => setType(e.target.value as typeof type)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            >
              <option value="once">Once</option>
              <option value="repeating">Repeating</option>
            </select>
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
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
```

- [ ] **Step 3: Check reminders router field names**

Read `apps/api/src/routers/reminders.ts`. Confirm shape returned by `listUpcoming`: `remindAt`/`remind_at`, `type`, `snoozeCount`/`snooze_count`. Update components to match.

- [ ] **Step 4: Build and test**

```bash
cd /Users/femenba/stable/apps/api
pnpm dev
```

Visit `/reminders`. Create a reminder. Snooze it. Dismiss it. Verify all mutations work and list updates.

- [ ] **Step 5: Full production build**

```bash
cd /Users/femenba/stable/apps/api
pnpm build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/femenba/stable
git add apps/api/src/components/reminder-item.tsx apps/api/app/\(dashboard\)/reminders/
git commit -m "feat: reminders page with create, snooze, dismiss"
```

---

## Task 10: Deploy + Verify

- [ ] **Step 1: Push to GitHub**

```bash
cd /Users/femenba/stable
git push origin main
```

Vercel auto-deploys on push since GitHub is connected.

- [ ] **Step 2: Monitor deploy**

```bash
vercel logs --follow
```

Or check Vercel dashboard for the production deployment status.

- [ ] **Step 3: Smoke test production**

1. Visit `https://api-sooty-two-41.vercel.app` — should redirect to `/sign-in`
2. Sign up with a new account — Clerk sign-up should work
3. Sign in — redirects to `/dashboard`
4. Create a task — appears immediately
5. Complete a task — moves to completed section
6. Start a focus session — timer counts up
7. End the session — appears in history
8. Create a reminder — appears in list
9. Dismiss the reminder — disappears from list

- [ ] **Step 4: Commit any production fixes**

If any field names or edge cases need fixing after testing production, fix and push.

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Clerk sign-in/sign-up — Tasks 3
- ✅ Dashboard overview with today's tasks and reminders — Task 6
- ✅ Task list with create, complete, delete — Tasks 7
- ✅ Focus sessions with live timer, start/end — Task 8
- ✅ Reminders with create, snooze, dismiss — Task 9
- ✅ Supabase persistence — all mutations hit the live tRPC API

**Critical field name verification required** (Tasks 6, 7, 8, 9): All pages reference camelCase field names (`endedAt`, `startedAt`, `durationMinutes`, `remindAt`, `snoozeCount`, `dueAt`). These must match what the tRPC routers actually return. If routers return raw Supabase rows (snake_case), update all field references before building.

**Type note:** `trpc.tasks.list.useQuery({})` passes empty object because `status` is optional. Verify that the Zod schema on `tasks.list` allows `{}` (optional `status` param).
