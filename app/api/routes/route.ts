import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  // Get routes and join with profiles through drivers to get the driver's name
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
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map database fields to the format expected by the frontend
  const formattedRoutes = data.map((route: any) => ({
    id: route.id,
    nom: `Route ${route.region || 'Locale'} #${route.id.slice(0, 4)}`,
    region: route.region,
    zone: 'Zone à préciser',
    distance_km: route.total_distance,
    duree_estimee: `${Math.floor((route.estimated_duration_minutes || 0) / 60)}h${(route.estimated_duration_minutes || 0) % 60}`,
    points_arret: route.total_deliveries,
    chauffeur: route.drivers?.profiles?.full_name || 'Non assigné',
    statut: route.status === 'completed' ? 'inactif' : (route.status === 'in_progress' ? 'actif' : 'en pause'),
    priorite: 'moyenne',
    dernier_execution: route.updated_at ? new Date(route.updated_at).toLocaleDateString('fr-FR') : null,
    prochaine_execution: 'A planifier',
  }))

  return NextResponse.json(formattedRoutes)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('routes')
    .insert([{
      region: body.region,
      total_distance: parseFloat(body.distance_km),
      total_deliveries: parseInt(body.points_arret),
      status: 'pending',
      estimated_duration_minutes: 480, // Default 8h for now
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
