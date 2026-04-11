import { initTRPC } from '@trpc/server'
import type { Context } from './context'
import { usersRouter } from './routers/users'
import { tasksRouter } from './routers/tasks'

const t = initTRPC.context<Context>().create()

const router = t.router

export const appRouter = router({
  users: usersRouter,
  tasks: tasksRouter,
})

export type AppRouter = typeof appRouter
