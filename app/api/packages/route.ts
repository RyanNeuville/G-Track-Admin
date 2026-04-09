import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createAdminClient()
  
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map database fields to the format expected by the frontend
  const formattedPackages = data.map((pkg: any) => ({
    id: pkg.id,
    numero: pkg.tracking_number,
    destinataire: pkg.recipient_name,
    adresse: pkg.recipient_address,
    poids: `${pkg.weight} kg`,
    statut: pkg.status,
    dateCreation: new Date(pkg.created_at).toLocaleDateString('fr-FR'),
    valeur: pkg.declared_value || 0,
  }))

  return NextResponse.json(formattedPackages)
}

export async function POST(request: Request) {
  const supabase = await createAdminClient()
  const body = await request.json()
  
  // Map frontend body to database fields
  const { data, error } = await supabase
    .from('packages')
    .insert([{
      tracking_number: `GLO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      recipient_name: body.destinataire,
      recipient_address: body.adresse,
      weight: parseFloat(body.poids),
      declared_value: parseFloat(body.valeur) || 0,
      status: 'en attente',
      sender_name: 'Expéditeur par défaut',
      sender_address: 'Douala, Cameroun',
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Format the returned data for the frontend
  const formattedPackage = {
    id: data.id,
    numero: data.tracking_number,
    destinataire: data.recipient_name,
    adresse: data.recipient_address,
    poids: `${data.weight} kg`,
    statut: data.status,
    dateCreation: new Date(data.created_at).toLocaleDateString('fr-FR'),
    valeur: data.declared_value || 0,
  }

  return NextResponse.json(formattedPackage, { status: 201 })
}
