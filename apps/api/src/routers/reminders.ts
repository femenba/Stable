import { router, protectedProcedure } from '@/trpc'
import type { Context } from '@/context'
import { getUserId } from '@/lib/getUserId'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import type { Reminder } from '@steady/shared'

function mapReminder(row: Record<string, unknown>): Reminder {
  return {
    id: row.id as string,
    taskId: row.task_id as string | null,
    userId: row.user_id as string,
    remindAt: row.remind_at as string,
    type: row.type as Reminder['type'],
    dismissed: row.dismissed as boolean,
    snoozeCount: row.snooze_count as number,
    createdAt: row.created_at as string,
  }
}

export const remindersRouter = router({
  create: protectedProcedure
    .input(z.object({
      taskId: z.string().uuid().optional(),
      remindAt: z.string().datetime().refine(v => new Date(v) > new Date(), { message: 'remindAt must be in the future' }),
      type: z.enum(['once', 'repeating', 'location']).default('once'),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const { data, error } = await ctx.db
        .from('reminders')
        .insert({
          user_id: userId,
          task_id: input.taskId ?? null,
          remind_at: input.remindAt,
          type: input.type,
        })
        .select()
        .single()
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return mapReminder(data)
    }),

  listUpcoming: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = await getUserId(ctx)
      const { data, error } = await ctx.db
        .from('reminders')
        .select()
        .eq('user_id', userId)
        .eq('dismissed', false)
        .gte('remind_at', new Date().toISOString())
        .order('remind_at', { ascending: true })
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return (data ?? []).map(mapReminder)
    }),

  dismiss: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const { data, error } = await ctx.db
        .from('reminders')
        .update({ dismissed: true })
        .eq('id', input.id)
        .eq('user_id', userId)
        .select()
        .single()
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      if (!data) throw new TRPCError({ code: 'NOT_FOUND', message: 'Reminder not found' })
      return mapReminder(data)
    }),

  snooze: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      remindAt: z.string().datetime().refine(v => new Date(v) > new Date(), { message: 'remindAt must be in the future' }),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)

      // Fetch current snooze_count and dismissed status first
      const { data: existing, error: fetchError } = await ctx.db
        .from('reminders')
        .select('snooze_count, dismissed')
        .eq('id', input.id)
        .eq('user_id', userId)
        .single()

      if (fetchError || !existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Reminder not found' })
      if (existing.dismissed) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot snooze a dismissed reminder' })

      const { data, error } = await ctx.db
        .from('reminders')
        .update({
          snooze_count: (existing.snooze_count as number) + 1,
          remind_at: input.remindAt,
        })
        .eq('id', input.id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      if (!data) throw new TRPCError({ code: 'NOT_FOUND', message: 'Reminder not found' })
      return mapReminder(data)
    }),
})
