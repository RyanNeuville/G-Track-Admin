import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createAdminClient()
  
  // Fetch drivers combined with their profile info
  const { data, error } = await supabase
    .from('livreurs')
    .select(`
      *,
      profils (
        nom_complet,
        email,
        telephone
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const formattedDrivers = data.map((d: any) => ({
    id: d.id,
    id_utilisateur: d.id_utilisateur,
    nom: d.profils?.nom_complet || 'Inconnu',
    email: d.profils?.email || '',
    telephone: d.profils?.telephone || '',
    statut: d.statut,
    permis: d.numero_permis,
    vehicule: d.type_vehicule,
    immatriculation: d.immatriculation
  }))

  return NextResponse.json(formattedDrivers)
}

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient()
    const body = await request.json()

    if (!body.id_utilisateur) {
      return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('livreurs')
      .insert([{
        id_utilisateur: body.id_utilisateur,
        numero_permis: body.numero_permis,
        type_vehicule: body.type_vehicule,
        immatriculation: body.immatriculation,
        statut: 'actif'
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
