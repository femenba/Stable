import { router, protectedProcedure } from '@/trpc'
import { getUserId } from '@/lib/getUserId'
import type { MoodEntry } from '@stable/shared'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

const VALID_TAGS = [
  'focused', 'calm', 'anxious', 'overwhelmed',
  'sad', 'irritable', 'motivated', 'tired',
] as const

function mapEntry(row: Record<string, unknown>): MoodEntry {
  return {
    id:        row.id as string,
    userId:    row.user_id as string,
    rating:    row.rating as number,
    energy:    row.energy as number | null,
    note:      row.note as string | null,
    tags:      (row.tags as string[]) ?? [],
    createdAt: row.created_at as string,
  }
}

export const moodEntriesRouter = router({
  log: protectedProcedure
    .input(z.object({
      rating: z.number().int().min(1).max(5),
      energy: z.number().int().min(1).max(5).optional(),
      note:   z.string().min(1).max(500).optional(),
      tags:   z.array(z.enum(VALID_TAGS)).max(8).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const { data, error } = await ctx.db
        .from('mood_entries')
        .insert({
          user_id: userId,
          rating:  input.rating,
          energy:  input.energy ?? null,
          note:    input.note ?? null,
          tags:    input.tags ?? [],
        })
        .select()
        .single()
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return mapEntry(data)
    }),

  today: protectedProcedure
    .input(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }))
    .query(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const dateStr = input.date ?? new Date().toISOString().slice(0, 10)
      const { data, error } = await ctx.db
        .from('mood_entries')
        .select()
        .eq('user_id', userId)
        .gte('created_at', `${dateStr}T00:00:00.000Z`)
        .lt('created_at',  `${dateStr}T23:59:59.999Z`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data ? mapEntry(data) : null
    }),

  history: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(30).default(7) }))
    .query(async ({ ctx, input }) => {
      const userId = await getUserId(ctx)
      const { data, error } = await ctx.db
        .from('mood_entries')
        .select('id, user_id, rating, energy, tags, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(input.limit)
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return (data ?? []).map(mapEntry)
    }),
})
