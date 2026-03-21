import { NextResponse } from 'next/server'

export async function GET() {
  const statistics = {
    summary: {
      total_deliveries: 1243,
      completed: 1156,
      pending: 67,
      active_drivers: 5,
      total_distance: '12456.3 km',
      average_time: '8h 15m',
    },
    monthly_data: [
      { month: 'Jan', deliveries: 94, revenue: 28200 },
      { month: 'Fév', deliveries: 102, revenue: 30600 },
      { month: 'Mar', deliveries: 156, revenue: 46800 },
    ],
    status_breakdown: [
      { name: 'Livré', value: 1156, color: '#2ECC71' },
      { name: 'En transit', value: 45, color: '#3498DB' },
      { name: 'En attente', value: 22, color: '#F39C12' },
    ],
    regional_performance: [
      { region: 'Île-de-France', deliveries: 450, completion: 94 },
      { region: 'Rhône-Alpes', deliveries: 280, completion: 91 },
      { region: 'Provence-Alpes', deliveries: 210, completion: 88 },
      { region: 'Nord-Pas-de-Calais', deliveries: 180, completion: 93 },
      { region: 'Autres', deliveries: 123, completion: 89 },
    ],
    driver_performance: [
      { name: 'Jean Dupont', deliveries: 342, rating: 4.8 },
      { name: 'Marie Martin', deliveries: 298, rating: 4.7 },
      { name: 'Sophie Dubois', deliveries: 256, rating: 4.9 },
    ],
    distance_trend: [
      { day: 'Lun', distance: 856 },
      { day: 'Mar', distance: 923 },
      { day: 'Mer', distance: 1045 },
      { day: 'Jeu', distance: 876 },
      { day: 'Ven', distance: 1234 },
      { day: 'Sam', distance: 567 },
      { day: 'Dim', distance: 234 },
    ],
  }

  return NextResponse.json(statistics)
}
