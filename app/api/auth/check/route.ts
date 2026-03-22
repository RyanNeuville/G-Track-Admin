import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
