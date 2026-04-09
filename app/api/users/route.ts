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
    role: profile.role,
    statut: profile.status,
    telephone: profile.phone,
    dateEmbauche: new Date(profile.created_at).toISOString().split('T')[0],
    livraisons: 0, // Would need a join/count to be accurate
  }))

  return NextResponse.json(formattedUsers)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  // Note: For a real app, you'd use supabase.auth.admin.createUser 
  // but here we just insert into the profiles table for the simulation transition
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      full_name: body.nom,
      email: body.email,
      role: body.role,
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
