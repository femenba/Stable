import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

export function getRedis(): Redis | null {
  if (_redis) return _redis
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  _redis = Redis.fromEnv()
  return _redis
}

const USER_ID_TTL = 3600 // 1 hour

export async function getCachedUserId(
  redis: Redis,
  clerkId: string,
): Promise<string | null> {
  return redis.get<string>(`user:clerk:${clerkId}`)
}

export async function setCachedUserId(
  redis: Redis,
  clerkId: string,
  userId: string,
): Promise<void> {
  await redis.set(`user:clerk:${clerkId}`, userId, { ex: USER_ID_TTL })
}

export async function invalidateCachedUserId(
  redis: Redis,
  clerkId: string,
): Promise<void> {
  await redis.del(`user:clerk:${clerkId}`)
}
