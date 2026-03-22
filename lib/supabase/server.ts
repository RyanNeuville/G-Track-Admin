import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client
 * This client should be used in Server Components and API routes
 */
export async function createClient() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
      },
      global: {
        headers: {
          'x-my-custom-header': 'my-app',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      },
    },
  )
}
