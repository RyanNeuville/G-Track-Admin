import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createAdminClient()
  
  const { data, error } = await supabase
    .from('livraisons')
    .select(`
      *,
      colis (*),
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

  const formattedDeliveries = (data || []).map((delivery: any) => ({
    id: delivery.id,
    numero: `LIV-${new Date(delivery.date_livraison).getFullYear()}-${delivery.id.slice(0, 3).toUpperCase()}`,
    chauffeur: delivery.livreurs?.profils?.nom_complet || 'Non assigné',
    date: delivery.date_livraison,
    colis: delivery.colis?.numero_suivi || 'N/A',
    distance: `${delivery.distance_km || 0} km`,
    statut: delivery.statut === 'en_cours' ? 'en cours' : (delivery.statut === 'terminee' ? 'terminée' : 'en attente'),
    heure_depart: delivery.heure_ramassage ? new Date(delivery.heure_ramassage).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--',
    heure_prevue: '18:00',
    region: delivery.region || 'Locale',
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
