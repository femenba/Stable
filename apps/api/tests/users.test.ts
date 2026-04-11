import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { usersRouter } from '@/routers/users'
import { createTestContext, ensureTestUser, cleanTestData, TEST_CLERK_ID, TEST_USER_EMAIL } from './setup'

describe('users router', () => {
  const ctx = createTestContext()

  beforeAll(async () => {
    await cleanTestData(ctx)
  })

  afterAll(async () => {
    await cleanTestData(ctx)
  })

  it('upsertMe creates a new user on first call', async () => {
    const caller = usersRouter.createCaller(ctx)

    const user = await caller.upsertMe({
      email: TEST_USER_EMAIL,
      name: 'Felipe Barros',
      timezone: 'Europe/London',
    })

    expect(user.clerkId).toBe(TEST_CLERK_ID)
    expect(user.email).toBe(TEST_USER_EMAIL)
    expect(user.name).toBe('Felipe Barros')
    expect(user.timezone).toBe('Europe/London')
    expect(user.id).toBeTruthy()
  })

  it('upsertMe updates an existing user', async () => {
    const caller = usersRouter.createCaller(ctx)

    const updated = await caller.upsertMe({
      email: TEST_USER_EMAIL,
      name: 'Felipe B.',
      timezone: 'UTC',
    })

    expect(updated.name).toBe('Felipe B.')
    expect(updated.timezone).toBe('UTC')
  })

  it('getMe returns the current user', async () => {
    const caller = usersRouter.createCaller(ctx)

    const user = await caller.getMe()

    expect(user.clerkId).toBe(TEST_CLERK_ID)
    expect(user.email).toBe(TEST_USER_EMAIL)
  })
})
