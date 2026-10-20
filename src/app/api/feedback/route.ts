import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { device_id, rating, message, customer_name, customer_phone } = body

    if (!device_id) {
      return NextResponse.json({ error: 'Device ID requerido' }, { status: 400 })
    }

    const payload = {
      device_id,
      rating: parseInt(rating) || 1,
      message: message || null,
      customer_name: customer_name || null,
      customer_phone: customer_phone || null,
      status: 'pending'
    }

    const admin = getAdminClient()
    const { error: adminErr } = await admin.from('private_feedbacks').insert(payload)

    if (adminErr) {
      const supabase = await createClient()
      await supabase.from('private_feedbacks').insert(payload)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error in /api/feedback:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
