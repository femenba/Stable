import { router } from './trpc'
import { usersRouter } from './routers/users'
import { tasksRouter } from './routers/tasks'

export { router, publicProcedure, protectedProcedure } from './trpc'

export const appRouter = router({
  users: usersRouter,
  tasks: tasksRouter,
})

export type AppRouter = typeof appRouter
