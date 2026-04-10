import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createAdminClient()
  
  const { data, error } = await supabase
    .from('itineraires')
    .select(`
      *,
      livreurs (
        profils (
          nom_complet
        )
      )
    `)
    .order('date_livraison', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const formattedDeliveries = (data || []).map((itin: any) => ({
    id: itin.id,
    numero: `LIV-${new Date(itin.date_livraison).getFullYear()}-${itin.id.toString().slice(0, 3).toUpperCase()}`,
    chauffeur: itin.livreurs?.profils?.nom_complet || 'En attente',
    date: itin.date_livraison,
    colis: itin.total_livraisons || 0,
    distance: `${itin.distance_totale || 0} km`,
    statut: itin.statut === 'en_cours' ? 'en cours' : (itin.statut === 'terminee' ? 'terminée' : 'en attente'),
    region: itin.region || 'Locale',
  }))

  return NextResponse.json(formattedDeliveries)
}

export async function POST(request: Request) {
  const supabase = await createAdminClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('itineraires')
    .insert([{
      date_livraison: body.date || new Date().toISOString().split('T')[0],
      region: body.region,
      total_livraisons: parseInt(body.colis) || 0,
      distance_totale: parseFloat(body.distance) || 0,
      statut: 'en_attente',
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
