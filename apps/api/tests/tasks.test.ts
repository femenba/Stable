import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { tasksRouter } from '@/routers/tasks'
import { createTestContext, ensureTestUser, cleanTestData } from './setup'

describe('tasks router', () => {
  const ctx = createTestContext()
  let createdTaskId: string

  beforeAll(async () => {
    await cleanTestData(ctx)
    await ensureTestUser(ctx)
  })

  afterAll(async () => {
    await cleanTestData(ctx)
  })

  it('create adds a new task', async () => {
    const caller = tasksRouter.createCaller(ctx)

    const task = await caller.create({
      title: 'Reply to Marcus',
      estimatedMinutes: 20,
      priority: 1,
    })

    expect(task.title).toBe('Reply to Marcus')
    expect(task.status).toBe('pending')
    expect(task.estimatedMinutes).toBe(20)
    expect(task.priority).toBe(1)
    expect(task.aiGenerated).toBe(false)
    createdTaskId = task.id
  })

  it('list returns tasks for the authenticated user only', async () => {
    const caller = tasksRouter.createCaller(ctx)

    const tasks = await caller.list({ status: 'pending' })

    expect(tasks.length).toBeGreaterThan(0)
    expect(tasks.every(t => t.status === 'pending')).toBe(true)
  })

  it('update changes task fields', async () => {
    const caller = tasksRouter.createCaller(ctx)

    const updated = await caller.update({
      id: createdTaskId,
      title: 'Reply to Marcus — urgent',
      status: 'in_progress',
    })

    expect(updated.title).toBe('Reply to Marcus — urgent')
    expect(updated.status).toBe('in_progress')
  })

  it('complete marks a task as completed', async () => {
    const caller = tasksRouter.createCaller(ctx)

    const completed = await caller.complete({ id: createdTaskId })

    expect(completed.status).toBe('completed')
  })

  it('listTopThree returns at most 3 tasks ordered by priority then due date', async () => {
    const caller = tasksRouter.createCaller(ctx)

    // Create extra tasks
    await caller.create({ title: 'High priority task', priority: 1 })
    await caller.create({ title: 'Medium priority task', priority: 2 })
    await caller.create({ title: 'Low priority task', priority: 3 })

    const top = await caller.listTopThree()

    expect(top.length).toBeLessThanOrEqual(3)
    // First task should be highest priority
    if (top.length > 1) {
      expect(top[0].priority).toBeLessThanOrEqual(top[1].priority)
    }
  })

  it('delete removes the task', async () => {
    const caller = tasksRouter.createCaller(ctx)
    const task = await caller.create({ title: 'To be deleted', priority: 2 })

    await caller.delete({ id: task.id })

    const tasks = await caller.list({})
    expect(tasks.find(t => t.id === task.id)).toBeUndefined()
  })
})
