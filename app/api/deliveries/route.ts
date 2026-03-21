import { NextResponse } from 'next/server'

export async function GET() {
  const deliveries = [
    {
      id: 'DEL001',
      numero: 'TOUR-2024-001',
      chauffeur: 'Jean Dupont',
      date: '2024-03-20',
      colis: 12,
      distance: '45.2 km',
      statut: 'en cours',
      heure_depart: '08:30',
      heure_prevue: '17:30',
      livraisons_reussies: 11,
      region: 'Île-de-France',
    },
    {
      id: 'DEL002',
      numero: 'TOUR-2024-002',
      chauffeur: 'Marie Martin',
      date: '2024-03-20',
      colis: 8,
      distance: '32.5 km',
      statut: 'en cours',
      heure_depart: '08:45',
      heure_prevue: '16:00',
      livraisons_reussies: 7,
      region: 'Rhône-Alpes',
    },
    {
      id: 'DEL003',
      numero: 'TOUR-2024-003',
      chauffeur: 'Sophie Dubois',
      date: '2024-03-19',
      colis: 15,
      distance: '52.0 km',
      statut: 'terminée',
      heure_depart: '08:00',
      heure_prevue: '18:00',
      livraisons_reussies: 14,
      region: 'Provence-Alpes',
    },
    {
      id: 'DEL004',
      numero: 'TOUR-2024-004',
      chauffeur: 'Jean Dupont',
      date: '2024-03-19',
      colis: 10,
      distance: '38.7 km',
      statut: 'terminée',
      heure_depart: '09:00',
      heure_prevue: '17:00',
      livraisons_reussies: 10,
      region: 'Île-de-France',
    },
    {
      id: 'DEL005',
      numero: 'TOUR-2024-005',
      chauffeur: 'Marie Martin',
      date: '2024-03-18',
      colis: 11,
      distance: '41.3 km',
      statut: 'terminée',
      heure_depart: '08:30',
      heure_prevue: '17:30',
      livraisons_reussies: 11,
      region: 'Rhône-Alpes',
    },
  ]

  return NextResponse.json(deliveries)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newDelivery = {
    id: `DEL${String(Date.now()).slice(-6)}`,
    numero: `TOUR-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    ...body,
    statut: 'en cours',
    heure_depart: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  }
  return NextResponse.json(newDelivery, { status: 201 })
}
