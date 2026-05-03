import { router } from './trpc'
import { usersRouter } from './routers/users'
import { tasksRouter } from './routers/tasks'
import { remindersRouter } from './routers/reminders'
import { focusSessionsRouter } from './routers/focusSessions'
import { moodEntriesRouter } from './routers/moodEntries'

export { router, publicProcedure, protectedProcedure } from './trpc'

export const appRouter = router({
  users:         usersRouter,
  tasks:         tasksRouter,
  reminders:     remindersRouter,
  focusSessions: focusSessionsRouter,
  moodEntries:   moodEntriesRouter,
})

export type AppRouter = typeof appRouter
