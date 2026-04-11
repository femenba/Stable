import { createClient } from '@supabase/supabase-js'

export function createDbClient(url: string, serviceRoleKey: string) {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

export type DbClient = ReturnType<typeof createDbClient>
