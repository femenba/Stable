import { router, protectedProcedure } from '@/trpc'
import type { Context } from '@/context'
import { getCachedUserId, setCachedUserId } from '@/lib/redis'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import type { FocusSession } from '@steady/shared'

function mapSession(row: Record<string, unknown>): FocusSession {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    taskId: row.task_id as string | null,
    startedAt: row.started_at as string,
    endedAt: row.ended_at as string | null,
    durationMinutes: row.duration_minutes as number | null,
    completed: row.completed as boolean,
    createdAt: row.created_at as string,
  }
}

async function getUserId(ctx: Context): Promise<string> {
  const cached = await getCachedUserId(ctx.redis, ctx.userId)
  if (cached) return cached

  const { data, error } = await ctx.db
    .from('users')
    .select('id')
    .eq('clerk_id', ctx.userId)
    .single()

  if (error || !data) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
  await setCachedUserId(ctx.redis, ctx.userId, data.id as string)
  return data.id as string
}

export const focusSessionsRouter = router({
  start: protectedProcedure
    .input(z.object({
      taskId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const { data, error } = await ctx.db
        .from('focus_sessions')
        .insert({
          user_id: userId,
          task_id: input.taskId ?? null,
          started_at: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return mapSession(data)
    }),

  end: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      completed: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)

      // Fetch the session — guard ownership and already-ended
      const { data: existing, error: fetchError } = await ctx.db
        .from('focus_sessions')
        .select('started_at, ended_at')
        .eq('id', input.id)
        .eq('user_id', userId)
        .single()

      if (fetchError || !existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Focus session not found' })
      }

      if (existing.ended_at !== null) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Focus session has already ended' })
      }

      const now = new Date()
      const startedAt = new Date(existing.started_at as string)
      const durationMinutes = Math.round((now.getTime() - startedAt.getTime()) / 60_000)

      const { data, error } = await ctx.db
        .from('focus_sessions')
        .update({
          ended_at: now.toISOString(),
          duration_minutes: durationMinutes,
          completed: input.completed,
        })
        .eq('id', input.id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      if (!data) throw new TRPCError({ code: 'NOT_FOUND', message: 'Focus session not found' })
      return mapSession(data)
    }),

  list: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const { data, error } = await ctx.db
        .from('focus_sessions')
        .select()
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(input.limit)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return (data ?? []).map(mapSession)
    }),
})
