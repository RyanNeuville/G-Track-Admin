import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createAdminClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const formattedUsers = (data || []).map((profile: any) => ({
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
  try {
    const supabase = await createAdminClient()
    const body = await request.json()
    
    const dbRole = body.role === 'admin' ? 'Administrateur' : 'Chauffeur'
    
    // 1. Create the Auth user first (Bypasses email confirmation for admins)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: 'GTrack' + Math.random().toString(36).slice(-8) + '!',
      email_confirm: true,
      user_metadata: {
        full_name: body.nom,
        role: dbRole
      }
    })

    if (authError) {
      return NextResponse.json({ error: `Auth Error: ${authError.message}` }, { status: 400 })
    }

    // 2. Insert into the profiles table (using the auth user id)
    // Note: If you have a trigger in SQL, this might not be needed, but we do it manually to be safe
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        full_name: body.nom,
        email: body.email,
        role: dbRole,
        phone: body.telephone,
        status: 'actif',
      }])
      .select()
      .single()

    if (error) {
      // Cleanup auth user if profile insert fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: `Profile Error: ${error.message}` }, { status: 500 })
    }

    const formattedUser = {
      id: data.id,
      nom: data.full_name,
      email: data.email,
      role: body.role, // Return frontend-style role
      statut: data.status,
      telephone: data.phone,
      dateEmbauche: new Date(data.created_at).toISOString().split('T')[0],
      livraisons: 0,
    }

    return NextResponse.json(formattedUser, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
