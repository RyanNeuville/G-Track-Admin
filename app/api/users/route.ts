import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const formattedUsers = data.map((profile: any) => ({
    id: profile.id,
    nom: profile.full_name,
    email: profile.email,
    role: profile.role === 'Administrateur' ? 'admin' : (profile.role === 'Chauffeur' ? 'driver' : profile.role),
    statut: profile.status,
    telephone: profile.phone,
    dateEmbauche: new Date(profile.created_at).toISOString().split('T')[0],
    livraisons: 0, 
  }))

  return NextResponse.json(formattedUsers)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  // Mapping roles to DB constraints: 'Administrateur', 'Chauffeur'
  const dbRole = body.role === 'admin' ? 'Administrateur' : 'Chauffeur'
  
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      full_name: body.nom,
      email: body.email,
      role: dbRole,
      phone: body.telephone,
      status: 'actif',
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const formattedUser = {
    id: data.id,
    nom: data.full_name,
    email: data.email,
    role: data.role,
    statut: data.status,
    telephone: data.phone,
    dateEmbauche: new Date(data.created_at).toISOString().split('T')[0],
    livraisons: 0,
  }

  return NextResponse.json(formattedUser, { status: 201 })
}
