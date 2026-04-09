import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createAdminClient()
  
  // Fetch drivers combined with their profile info
  const { data, error } = await supabase
    .from('drivers')
    .select(`
      id,
      status,
      profiles (
        full_name,
        email
      )
    `)
    .eq('status', 'actif')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const formattedDrivers = data.map((d: any) => ({
    id: d.id,
    nom: d.profiles?.full_name || 'Inconnu',
    email: d.profiles?.email || '',
    status: d.status
  }))

  return NextResponse.json(formattedDrivers)
}
