import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { moodEntriesRouter } from '@/routers/moodEntries'
import { createTestContext, ensureTestUser, cleanTestData } from './setup'

describe('moodEntries router', () => {
  const ctx = createTestContext()

  beforeAll(async () => {
    await cleanTestData(ctx)
    await ensureTestUser(ctx)
  })

  afterAll(async () => {
    await cleanTestData(ctx)
  })

  it('log inserts a new mood entry', async () => {
    const caller = moodEntriesRouter.createCaller(ctx)
    const entry = await caller.log({ rating: 4, energy: 3, tags: ['calm', 'focused'], note: 'good day' })
    expect(entry.rating).toBe(4)
    expect(entry.energy).toBe(3)
    expect(entry.tags).toEqual(['calm', 'focused'])
    expect(entry.note).toBe('good day')
    expect(entry.id).toBeTruthy()
  })

  it('today returns the most recent entry logged today', async () => {
    const caller = moodEntriesRouter.createCaller(ctx)
    await caller.log({ rating: 2 })
    const today = await caller.today({ date: new Date().toISOString().slice(0, 10) })
    expect(today).not.toBeNull()
    expect(today!.rating).toBe(2)
  })

  it('history returns entries newest first up to limit', async () => {
    const caller = moodEntriesRouter.createCaller(ctx)
    await caller.log({ rating: 5 })
    const history = await caller.history({ limit: 7 })
    expect(history.length).toBeGreaterThanOrEqual(1)
    expect(history[0].rating).toBe(5)
  })

  it('log rejects rating outside 1–5', async () => {
    const caller = moodEntriesRouter.createCaller(ctx)
    await expect(caller.log({ rating: 0 })).rejects.toThrow()
    await expect(caller.log({ rating: 6 })).rejects.toThrow()
  })

  it('log rejects invalid tag', async () => {
    const caller = moodEntriesRouter.createCaller(ctx)
    await expect(caller.log({ rating: 3, tags: ['invalid-tag' as never] })).rejects.toThrow()
  })
})
