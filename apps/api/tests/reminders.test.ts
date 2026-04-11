import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { remindersRouter } from '@/routers/reminders'
import { tasksRouter } from '@/routers/tasks'
import { createTestContext, ensureTestUser, cleanTestData } from './setup'

describe('reminders router', () => {
  const ctx = createTestContext()
  let createdReminderId: string
  let testTaskId: string

  beforeAll(async () => {
    await cleanTestData(ctx)
    await ensureTestUser(ctx)

    // Create a task to link reminders to
    const taskCaller = tasksRouter.createCaller(ctx)
    const task = await taskCaller.create({
      title: 'Task for reminder test',
      priority: 2,
    })
    testTaskId = task.id
  })

  afterAll(async () => {
    await cleanTestData(ctx)
  })

  it('create adds a new reminder linked to a task', async () => {
    const caller = remindersRouter.createCaller(ctx)

    const reminder = await caller.create({
      taskId: testTaskId,
      remindAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      type: 'once',
    })

    expect(reminder.taskId).toBe(testTaskId)
    expect(reminder.type).toBe('once')
    expect(reminder.dismissed).toBe(false)
    expect(reminder.snoozeCount).toBe(0)
    expect(reminder.id).toBeDefined()
    createdReminderId = reminder.id
  })

  it('create uses default type "once" when not specified', async () => {
    const caller = remindersRouter.createCaller(ctx)

    const reminder = await caller.create({
      remindAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    })

    expect(reminder.type).toBe('once')
    expect(reminder.taskId).toBeNull()
  })

  it('listUpcoming returns undismissed reminders only', async () => {
    const caller = remindersRouter.createCaller(ctx)

    const reminders = await caller.listUpcoming()

    expect(reminders.length).toBeGreaterThan(0)
    expect(reminders.every(r => r.dismissed === false)).toBe(true)
    // Should be ordered by remindAt ASC
    if (reminders.length > 1) {
      expect(new Date(reminders[0].remindAt).getTime()).toBeLessThanOrEqual(
        new Date(reminders[1].remindAt).getTime()
      )
    }
  })

  it('dismiss marks a reminder as dismissed', async () => {
    const caller = remindersRouter.createCaller(ctx)

    const dismissed = await caller.dismiss({ id: createdReminderId })

    expect(dismissed.dismissed).toBe(true)
    expect(dismissed.id).toBe(createdReminderId)
  })

  it('listUpcoming does not return dismissed reminders', async () => {
    const caller = remindersRouter.createCaller(ctx)

    const reminders = await caller.listUpcoming()

    expect(reminders.find(r => r.id === createdReminderId)).toBeUndefined()
  })

  it('snooze increments snoozeCount and updates remindAt', async () => {
    const caller = remindersRouter.createCaller(ctx)

    // Create a fresh reminder to snooze
    const reminder = await caller.create({
      remindAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min from now
      type: 'once',
    })

    const newRemindAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() // 3 hours from now
    const snoozed = await caller.snooze({ id: reminder.id, remindAt: newRemindAt })

    expect(snoozed.snoozeCount).toBe(1)
    // The remindAt should have been updated (compare as dates to avoid minor precision differences)
    expect(new Date(snoozed.remindAt).getTime()).toBeGreaterThan(
      new Date(reminder.remindAt).getTime()
    )
  })
})
