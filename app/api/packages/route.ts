import { NextResponse } from 'next/server'

export async function GET() {
  const packages = [
    {
      id: 'PKG001',
      numero: 'FR-2024-001-001',
      destinataire: 'Acme Corp',
      adresse: '123 Rue de Paris, 75000 Paris',
      poids: '2.5 kg',
      statut: 'livré',
      dateCreation: '2024-03-10',
      dateLivraison: '2024-03-12',
      valeur: '150.00 €',
    },
    {
      id: 'PKG002',
      numero: 'FR-2024-001-002',
      destinataire: 'TechStart SARL',
      adresse: '456 Avenue Lyon, 69000 Lyon',
      poids: '1.2 kg',
      statut: 'en transit',
      dateCreation: '2024-03-15',
      dateLivraison: null,
      valeur: '280.00 €',
    },
    {
      id: 'PKG003',
      numero: 'FR-2024-001-003',
      destinataire: 'Boutique Mode',
      adresse: '789 Rue Marseille, 13000 Marseille',
      poids: '0.8 kg',
      statut: 'en attente',
      dateCreation: '2024-03-20',
      dateLivraison: null,
      valeur: '95.50 €',
    },
    {
      id: 'PKG004',
      numero: 'FR-2024-001-004',
      destinataire: 'Restaurant Le Gourmet',
      adresse: '321 Quai Lille, 59000 Lille',
      poids: '3.0 kg',
      statut: 'retard',
      dateCreation: '2024-03-08',
      dateLivraison: '2024-03-21',
      valeur: '420.00 €',
    },
    {
      id: 'PKG005',
      numero: 'FR-2024-001-005',
      destinataire: 'Cabinet Juridique',
      adresse: '654 Rue Toulouse, 31000 Toulouse',
      poids: '0.5 kg',
      statut: 'livré',
      dateCreation: '2024-03-12',
      dateLivraison: '2024-03-14',
      valeur: '75.00 €',
    },
  ]

  return NextResponse.json(packages)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newPackage = {
    id: `PKG${String(Date.now()).slice(-6)}`,
    numero: `FR-2024-001-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    ...body,
    statut: 'en attente',
    dateCreation: new Date().toISOString().split('T')[0],
  }
  return NextResponse.json(newPackage, { status: 201 })
}
