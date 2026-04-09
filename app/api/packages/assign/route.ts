import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { packageId, driverId, region } = await request.json()

    if (!packageId || !driverId) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Assigning a package means creating a delivery record
    const { data, error } = await supabase
      .from('deliveries')
      .insert([{
        package_id: packageId,
        driver_id: driverId,
        delivery_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        region: region || 'Non précisée'
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also update package status to 'en transit'
    await supabase
      .from('packages')
      .update({ status: 'en transit' })
      .eq('id', packageId)

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
