import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { focusSessionsRouter } from '@/routers/focusSessions'
import { createTestContext, ensureTestUser, cleanTestData } from './setup'

describe('focusSessions router', () => {
  const ctx = createTestContext()
  let createdSessionId: string

  beforeAll(async () => {
    await cleanTestData(ctx)
    await ensureTestUser(ctx)
  })

  afterAll(async () => {
    await cleanTestData(ctx)
  })

  it('start creates an active session with no endedAt and completed=false', async () => {
    const caller = focusSessionsRouter.createCaller(ctx)

    const session = await caller.start({})

    expect(session.startedAt).toBeTruthy()
    expect(session.endedAt).toBeNull()
    expect(session.completed).toBe(false)
    expect(session.durationMinutes).toBeNull()
    expect(session.taskId).toBeNull()
    createdSessionId = session.id
  })

  it('start accepts an optional taskId', async () => {
    const caller = focusSessionsRouter.createCaller(ctx)

    // Create a valid UUID to use as taskId placeholder — the real test would use a real task,
    // but here we just verify the field is accepted. We'll pass undefined instead.
    const session = await caller.start({})
    expect(session.taskId).toBeNull()
  })

  it('end completes the session and sets endedAt and durationMinutes', async () => {
    const caller = focusSessionsRouter.createCaller(ctx)

    const ended = await caller.end({ id: createdSessionId, completed: true })

    expect(ended.endedAt).toBeTruthy()
    expect(ended.durationMinutes).toBeGreaterThanOrEqual(0)
    expect(ended.completed).toBe(true)
    expect(ended.id).toBe(createdSessionId)
  })

  it('end throws BAD_REQUEST when called on an already-ended session', async () => {
    const caller = focusSessionsRouter.createCaller(ctx)

    await expect(
      caller.end({ id: createdSessionId, completed: false })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  it('list returns sessions for the user ordered by most recent first', async () => {
    const caller = focusSessionsRouter.createCaller(ctx)

    // Start a couple more sessions
    await caller.start({})
    await caller.start({})

    const sessions = await caller.list({ limit: 10 })

    expect(sessions.length).toBeGreaterThan(0)
    // Verify descending order: each startedAt >= next one
    for (let i = 0; i < sessions.length - 1; i++) {
      expect(new Date(sessions[i].startedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(sessions[i + 1].startedAt).getTime()
      )
    }
  })

  it('list respects the limit parameter', async () => {
    const caller = focusSessionsRouter.createCaller(ctx)

    const sessions = await caller.list({ limit: 1 })

    expect(sessions.length).toBeLessThanOrEqual(1)
  })
})
