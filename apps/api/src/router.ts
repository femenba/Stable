import { router } from './trpc'
import { usersRouter } from './routers/users'
import { tasksRouter } from './routers/tasks'
import { remindersRouter } from './routers/reminders'
import { focusSessionsRouter } from './routers/focusSessions'
import { moodEntriesRouter } from './routers/moodEntries'
import { subscriptionsRouter } from './routers/subscriptions'
import { adminRouter } from './routers/admin'

export { router, publicProcedure, protectedProcedure, proProcedure } from './trpc'

export const appRouter = router({
  users:         usersRouter,
  tasks:         tasksRouter,
  reminders:     remindersRouter,
  focusSessions: focusSessionsRouter,
  moodEntries:   moodEntriesRouter,
  subscriptions: subscriptionsRouter,
  admin:         adminRouter,
})

export type AppRouter = typeof appRouter
