import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client
 * This client should be used in Server Components and API routes
 */
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  )
}
