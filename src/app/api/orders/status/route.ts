import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, status, payment_status, payment_method } = body

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID es requerido' }, { status: 400 })
    }

    const admin = getAdminClient()

    // 1. Obtener la orden actual
    const { data: currentOrder, error: fetchErr } = await admin
      .from('restaurant_orders')
      .select('*')
      .eq('id', order_id)
      .maybeSingle()

    if (fetchErr || !currentOrder) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // 2. Preparar campos a actualizar
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (status) updates.status = status
    if (payment_status) updates.payment_status = payment_status
    if (payment_method) updates.payment_method = payment_method

    if (payment_status === 'paid' || status === 'completed') {
      if (!currentOrder.paid_at) {
        updates.paid_at = new Date().toISOString()
      }
      if (!updates.payment_status) {
        updates.payment_status = 'paid'
      }

      // 3. Si tenía cupón de ruleta/raspable aplicado, marcarlo automáticamente como 'redeemed' en prize_wheel_spins
      if (currentOrder.applied_coupon_code) {
        try {
          await admin
            .from('prize_wheel_spins')
            .update({
              status: 'redeemed',
              redeemed_at: new Date().toISOString()
            })
            .eq('coupon_code', currentOrder.applied_coupon_code)
        } catch (spinErr) {
          console.error('Error auto-redeeming wheel coupon:', spinErr)
        }
      }
    }

    const { data: updatedOrder, error: updateErr } = await admin
      .from('restaurant_orders')
      .update(updates)
      .eq('id', order_id)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (err: any) {
    console.error('Error updating order status:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
