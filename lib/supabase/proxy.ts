import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // For now, simple middleware that just allows the request through
  // In a production app, you'd validate auth tokens here
  return NextResponse.next({
    request,
  })
}
