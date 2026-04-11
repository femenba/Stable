import { initTRPC } from '@trpc/server'
import type { Context } from '@/context'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import type { User } from '@steady/shared'

const t = initTRPC.context<Context>().create()
const router = t.router
const protectedProcedure = t.procedure

function mapUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    clerkId: row.clerk_id as string,
    email: row.email as string,
    name: row.name as string | null,
    timezone: row.timezone as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export const usersRouter = router({
  upsertMe: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().nullable().optional(),
      timezone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.db
        .from('users')
        .upsert(
          {
            clerk_id: ctx.userId,
            email: input.email,
            name: input.name ?? null,
            timezone: input.timezone ?? 'UTC',
          },
          { onConflict: 'clerk_id' },
        )
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return mapUser(data)
    }),

  getMe: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.db
        .from('users')
        .select()
        .eq('clerk_id', ctx.userId)
        .single()

      if (error || !data) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      return mapUser(data)
    }),
})
