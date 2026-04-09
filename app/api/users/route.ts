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
    
    // Create the Auth user. The DB Trigger (handle_new_user) will automatically create the profile.
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

    // Since a trigger handles the profile, we don't need to manually insert.
    // We return the formatted object based on what we just created.
    const formattedUser = {
      id: authData.user.id,
      nom: body.nom,
      email: body.email,
      role: body.role,
      statut: 'actif',
      telephone: body.telephone || '',
      dateEmbauche: new Date().toISOString().split('T')[0],
      livraisons: 0,
    }

    return NextResponse.json(formattedUser, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
