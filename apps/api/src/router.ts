import { initTRPC } from '@trpc/server'
import type { Context } from './context'
import { usersRouter } from './routers/users'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure // context already validates auth

export const appRouter = router({
  users: usersRouter,
})

export type AppRouter = typeof appRouter
