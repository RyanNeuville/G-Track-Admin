import { NextResponse } from 'next/server'

export async function GET() {
  const routes = [
    {
      id: 'ROUTE001',
      nom: 'Circuit Centre-Ville Paris',
      region: 'Île-de-France',
      zone: 'Paris 1-4',
      distance_km: 45.2,
      duree_estimee: '8h30',
      points_arret: 12,
      chauffeur: 'Jean Dupont',
      statut: 'actif',
      priorite: 'haute',
      dernier_execution: '2024-03-20',
      prochaine_execution: '2024-03-21',
    },
    {
      id: 'ROUTE002',
      nom: 'Banlieue Est',
      region: 'Île-de-France',
      zone: 'Val-de-Marne',
      distance_km: 38.7,
      duree_estimee: '7h45',
      points_arret: 10,
      chauffeur: 'Sophie Dubois',
      statut: 'actif',
      priorite: 'moyenne',
      dernier_execution: '2024-03-19',
      prochaine_execution: '2024-03-21',
    },
    {
      id: 'ROUTE003',
      nom: 'Corridor Lyon-Saint-Étienne',
      region: 'Rhône-Alpes',
      zone: 'Loire',
      distance_km: 52.5,
      duree_estimee: '9h00',
      points_arret: 15,
      chauffeur: 'Marie Martin',
      statut: 'actif',
      priorite: 'haute',
      dernier_execution: '2024-03-20',
      prochaine_execution: '2024-03-22',
    },
    {
      id: 'ROUTE004',
      nom: 'Littoral Provence',
      region: 'Provence-Alpes',
      zone: 'Bouches-du-Rhône',
      distance_km: 61.3,
      duree_estimee: '9h45',
      points_arret: 18,
      chauffeur: 'Disponible',
      statut: 'en pause',
      priorite: 'moyenne',
      dernier_execution: '2024-03-18',
      prochaine_execution: '2024-03-22',
    },
    {
      id: 'ROUTE005',
      nom: 'Métropole Lille',
      region: 'Nord-Pas-de-Calais',
      zone: 'Nord',
      distance_km: 32.1,
      duree_estimee: '6h30',
      points_arret: 8,
      chauffeur: 'Disponible',
      statut: 'inactif',
      priorite: 'basse',
      dernier_execution: '2024-03-15',
      prochaine_execution: '2024-03-25',
    },
  ]

  return NextResponse.json(routes)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newRoute = {
    id: `ROUTE${String(Date.now()).slice(-6)}`,
    ...body,
    statut: 'inactif',
    dernier_execution: null,
  }
  return NextResponse.json(newRoute, { status: 201 })
}
