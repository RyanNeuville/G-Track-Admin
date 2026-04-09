import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('routes')
    .select(`
      *,
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

  const formattedDeliveries = data.map((route: any) => ({
    id: route.id,
    numero: `TOUR-${new Date(route.delivery_date).getFullYear()}-${route.id.slice(0, 3).toUpperCase()}`,
    chauffeur: route.drivers?.profiles?.full_name || 'Non assigné',
    date: route.delivery_date,
    colis: route.total_deliveries,
    distance: `${route.total_distance} km`,
    statut: route.status === 'in_progress' ? 'en cours' : (route.status === 'completed' ? 'terminée' : 'en attente'),
    heure_depart: route.created_at ? new Date(route.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--',
    heure_prevue: '18:00',
    livraisons_reussies: route.completed_deliveries,
    region: route.region,
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
