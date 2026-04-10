import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createAdminClient()
  
  const { data, error } = await supabase
    .from('colis')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map database fields to the format expected by the frontend
  const formattedPackages = data.map((pkg: any) => ({
    id: pkg.id,
    numero: pkg.numero_suivi,
    destinataire: pkg.nom_destinataire,
    adresse: pkg.adresse_destinataire,
    poids: `${pkg.poids} kg`,
    statut: pkg.statut,
    dateCreation: new Date(pkg.created_at).toLocaleDateString('fr-FR'),
    valeur: pkg.valeur_declaree || 0,
  }))

  return NextResponse.json(formattedPackages)
}

export async function POST(request: Request) {
  const supabase = await createAdminClient()
  const body = await request.json()
  
  // Map frontend body to database fields
  const { data, error } = await supabase
    .from('colis')
    .insert([{
      numero_suivi: `GLO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      nom_destinataire: body.destinataire,
      adresse_destinataire: body.adresse,
      poids: parseFloat(body.poids),
      valeur_declaree: parseFloat(body.valeur) || 0,
      statut: 'en attente',
      nom_expediteur: 'Expéditeur par défaut',
      adresse_expediteur: 'Douala, Cameroun',
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Format the returned data for the frontend
  const formattedPackage = {
    id: data.id,
    numero: data.numero_suivi,
    destinataire: data.nom_destinataire,
    adresse: data.adresse_destinataire,
    poids: `${data.poids} kg`,
    statut: data.statut,
    dateCreation: new Date(data.created_at).toLocaleDateString('fr-FR'),
    valeur: data.valeur_declaree || 0,
  }

  return NextResponse.json(formattedPackage, { status: 201 })
}
