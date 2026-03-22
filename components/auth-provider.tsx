'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

/**
 * This component synchronizes Supabase session with cookies
 * so that the server can access the auth state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const supabase = createClient()

    // Subscribe to auth changes and sync to cookies
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Send session to server to save in cookies
      if (session) {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        })
      } else if (event === 'SIGNED_OUT') {
        // Clear cookies on sign out
        await fetch('/api/auth/session', { method: 'DELETE' })
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return <>{children}</>
}
