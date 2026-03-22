import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        flowType: 'pkce',
      },
    },
  )

  // Get the session from cookies
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Clone the request headers
  const requestHeaders = new Headers(request.headers)

  // Set auth headers if session exists
  if (session?.access_token) {
    requestHeaders.set('Authorization', `Bearer ${session.access_token}`)
  }

  // Create response with updated headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  return response
}
