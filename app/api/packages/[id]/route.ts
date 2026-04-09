import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createAdminClient()
    const { id } = await params

    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createAdminClient()
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabase
      .from('packages')
      .update({
        recipient_name: body.destinataire,
        recipient_address: body.adresse,
        weight: parseFloat(body.poids) || undefined,
        declared_value: parseFloat(body.valeur) || undefined,
        status: body.statut,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createAdminClient()
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
