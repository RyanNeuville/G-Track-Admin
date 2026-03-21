import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let supabaseClientInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (supabaseClientInstance) {
    return supabaseClientInstance
  }

  supabaseClientInstance = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  )

  return supabaseClientInstance
}
