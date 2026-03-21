import { NextResponse } from 'next/server'

export async function GET() {
  const users = [
    {
      id: '1',
      nom: 'Jean Dupont',
      email: 'jean.dupont@glotelho.com',
      role: 'Chauffeur',
      statut: 'actif',
      telephone: '+33612345678',
      dateEmbauche: '2023-01-15',
      livraisons: 342,
    },
    {
      id: '2',
      nom: 'Marie Martin',
      email: 'marie.martin@glotelho.com',
      role: 'Chauffeur',
      statut: 'actif',
      telephone: '+33623456789',
      dateEmbauche: '2023-02-20',
      livraisons: 298,
    },
    {
      id: '3',
      nom: 'Pierre Bernard',
      email: 'pierre.bernard@glotelho.com',
      role: 'Responsable',
      statut: 'actif',
      telephone: '+33634567890',
      dateEmbauche: '2022-11-10',
      livraisons: 0,
    },
    {
      id: '4',
      nom: 'Sophie Dubois',
      email: 'sophie.dubois@glotelho.com',
      role: 'Chauffeur',
      statut: 'en repos',
      telephone: '+33645678901',
      dateEmbauche: '2023-03-05',
      livraisons: 256,
    },
    {
      id: '5',
      nom: 'Luc Moreau',
      email: 'luc.moreau@glotelho.com',
      role: 'Administrateur',
      statut: 'actif',
      telephone: '+33656789012',
      dateEmbauche: '2022-09-01',
      livraisons: 0,
    },
  ]

  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newUser = {
    id: String(Date.now()),
    ...body,
    dateEmbauche: new Date().toISOString().split('T')[0],
    livraisons: 0,
  }
  return NextResponse.json(newUser, { status: 201 })
}
