import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('deliveries')
    .select(`
      *,
      packages (*),
      drivers (
        profiles (
          full_name
        )
      )
    `)
    .order('delivery_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const formattedDeliveries = data.map((delivery: any) => ({
    id: delivery.id,
    numero: `LIV-${new Date(delivery.delivery_date).getFullYear()}-${delivery.id.slice(0, 3).toUpperCase()}`,
    chauffeur: delivery.drivers?.profiles?.full_name || 'Non assigné',
    date: delivery.delivery_date,
    colis: delivery.packages?.tracking_number || 'N/A',
    distance: `${delivery.distance_km || 0} km`,
    statut: delivery.status === 'in_transit' ? 'en cours' : (delivery.status === 'delivered' ? 'terminée' : 'en attente'),
    heure_depart: delivery.pickup_time ? new Date(delivery.pickup_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--',
    heure_prevue: '18:00',
    region: delivery.region || 'Locale',
  }))

  return NextResponse.json(formattedDeliveries)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('routes')
    .insert([{
      delivery_date: body.date || new Date().toISOString().split('T')[0],
      region: body.region,
      total_deliveries: parseInt(body.colis) || 0,
      total_distance: parseFloat(body.distance) || 0,
      status: 'pending',
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
