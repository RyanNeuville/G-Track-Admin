import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token } = await request.json()
    const cookieStore = await cookies()

    // Set cookies with secure flags
    cookieStore.set('sb-access-token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/',
    })

    if (refresh_token) {
      cookieStore.set('sb-refresh-token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 604800, // 7 days
        path: '/',
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session save error:', error)
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('sb-access-token')
    cookieStore.delete('sb-refresh-token')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session delete error:', error)
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
  }
}
