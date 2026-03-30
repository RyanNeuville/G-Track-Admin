import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Fetch counts from different tables
  const [
    { count: totalPackages },
    { count: completedPackages },
    { count: pendingPackages },
    { count: activeDrivers },
    { data: routesData },
    { data: statusData }
  ] = await Promise.all([
    supabase.from('packages').select('*', { count: 'exact', head: true }),
    supabase.from('packages').select('*', { count: 'exact', head: true }).eq('status', 'livré'),
    supabase.from('packages').select('*', { count: 'exact', head: true }).in('status', ['en attente', 'en transit']),
    supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('status', 'actif'),
    supabase.from('routes').select('total_distance, region'),
    supabase.from('packages').select('status')
  ])

  // Calculate total distance
  const totalDistance = routesData?.reduce((acc, route) => acc + (Number(route.total_distance) || 0), 0) || 0

  // Calculate status breakdown
  const statusCounts = (statusData || []).reduce((acc: any, pkg: any) => {
    acc[pkg.status] = (acc[pkg.status] || 0) + 1
    return acc
  }, {})

  const statistics = {
    summary: {
      total_deliveries: totalPackages || 0,
      completed: completedPackages || 0,
      pending: pendingPackages || 0,
      active_drivers: activeDrivers || 0,
      total_distance: `${totalDistance.toFixed(1)} km`,
      average_time: 'A calculer',
    },
    monthly_data: [
      { month: new Date().toLocaleString('default', { month: 'short' }), deliveries: totalPackages || 0, revenue: (totalPackages || 0) * 150 },
    ],
    status_breakdown: [
      { name: 'Livré', value: statusCounts['livré'] || 0, color: '#2ECC71' },
      { name: 'En transit', value: statusCounts['en transit'] || 0, color: '#3498DB' },
      { name: 'En attente', value: statusCounts['en attente'] || 0, color: '#F39C12' },
    ],
    regional_performance: (routesData || []).slice(0, 5).map(r => ({
      region: r.region || 'Inconnue',
      deliveries: 1, // Mock logic as we don't have deep grouping here yet
      completion: 100
    })),
    driver_performance: [],
    distance_trend: [
      { day: 'Lun', distance: 0 },
      { day: 'Mar', distance: 0 },
      { day: 'Mer', distance: 0 },
      { day: 'Jeu', distance: 0 },
      { day: 'Ven', distance: 0 },
      { day: 'Sam', distance: 0 },
      { day: 'Dim', distance: 0 },
    ],
  }

  return NextResponse.json(statistics)
}
