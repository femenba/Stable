import { initTRPC } from '@trpc/server'
import type { Context } from '@/context'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import type { Task } from '@steady/shared'

const t = initTRPC.context<Context>().create()
const router = t.router
const protectedProcedure = t.procedure

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    description: row.description as string | null,
    dueAt: row.due_at as string | null,
    estimatedMinutes: row.estimated_minutes as number | null,
    priority: row.priority as Task['priority'],
    status: row.status as Task['status'],
    parentTaskId: row.parent_task_id as string | null,
    aiGenerated: row.ai_generated as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

async function getUserId(ctx: Context): Promise<string> {
  const { data, error } = await ctx.db
    .from('users')
    .select('id')
    .eq('clerk_id', ctx.userId)
    .single()
  if (error || !data) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found — call upsertMe first' })
  return data.id
}

export const tasksRouter = router({
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(500),
      description: z.string().optional(),
      dueAt: z.string().datetime().optional(),
      estimatedMinutes: z.number().int().positive().optional(),
      priority: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
      parentTaskId: z.string().uuid().optional(),
      aiGenerated: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const { data, error } = await ctx.db
        .from('tasks')
        .insert({
          user_id: userId,
          title: input.title,
          description: input.description ?? null,
          due_at: input.dueAt ?? null,
          estimated_minutes: input.estimatedMinutes ?? null,
          priority: input.priority,
          parent_task_id: input.parentTaskId ?? null,
          ai_generated: input.aiGenerated,
        })
        .select()
        .single()
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return mapTask(data)
    }),

  list: protectedProcedure
    .input(z.object({
      status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      let query = ctx.db
        .from('tasks')
        .select()
        .eq('user_id', userId)
        .is('parent_task_id', null)
        .order('created_at', { ascending: false })

      if (input.status) query = query.eq('status', input.status)

      const { data, error } = await query
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return (data ?? []).map(mapTask)
    }),

  listTopThree: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = await getUserId(ctx)
      const { data, error } = await ctx.db
        .from('tasks')
        .select()
        .eq('user_id', userId)
        .in('status', ['pending', 'in_progress'])
        .is('parent_task_id', null)
        .order('priority', { ascending: true })
        .order('due_at', { ascending: true, nullsFirst: false })
        .limit(3)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return (data ?? []).map(mapTask)
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(500).optional(),
      description: z.string().nullable().optional(),
      dueAt: z.string().datetime().nullable().optional(),
      estimatedMinutes: z.number().int().positive().nullable().optional(),
      priority: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
      status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const { id, ...fields } = input

      const updateData: Record<string, unknown> = {}
      if (fields.title !== undefined) updateData.title = fields.title
      if (fields.description !== undefined) updateData.description = fields.description
      if (fields.dueAt !== undefined) updateData.due_at = fields.dueAt
      if (fields.estimatedMinutes !== undefined) updateData.estimated_minutes = fields.estimatedMinutes
      if (fields.priority !== undefined) updateData.priority = fields.priority
      if (fields.status !== undefined) updateData.status = fields.status

      const { data, error } = await ctx.db
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      if (!data) throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' })
      return mapTask(data)
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const { data, error } = await ctx.db
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', input.id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      if (!data) throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' })
      return mapTask(data)
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const { error } = await ctx.db
        .from('tasks')
        .delete()
        .eq('id', input.id)
        .eq('user_id', userId)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return { success: true }
    }),
})
