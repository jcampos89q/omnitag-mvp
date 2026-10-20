import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      menu_id, 
      table_number, 
      order_type = 'table', 
      customer_name, 
      customer_phone, 
      items, 
      subtotal = 0,
      discount_amount = 0,
      total_amount = 0, 
      applied_coupon_code, 
      applied_coupon_label, 
      notes 
    } = body

    if (!menu_id || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'El menú y al menos un ítem son obligatorios.' },
        { status: 400 }
      )
    }

    const admin = getAdminClient()

    // 1. Obtener menú para saber el dueño (user_id) y la moneda
    const { data: menu, error: menuErr } = await admin
      .from('menus')
      .select('id, user_id, currency, name')
      .eq('id', menu_id)
      .maybeSingle()

    if (menuErr || !menu) {
      return NextResponse.json({ error: 'Menú no encontrado' }, { status: 404 })
    }

    // 2. Calcular número correlativo del día para el restaurante
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { count: todayCount } = await admin
      .from('restaurant_orders')
      .select('id', { count: 'exact', head: true })
      .eq('menu_id', menu_id)
      .gte('created_at', todayStart.toISOString())

    const dailyOrderNumber = (todayCount || 0) + 1

    // 3. Crear el pedido en la base de datos
    const payload = {
      menu_id,
      user_id: menu.user_id,
      daily_order_number: dailyOrderNumber,
      table_number: table_number || 'Mesa',
      order_type,
      customer_name: customer_name?.trim() || 'Comensal',
      customer_phone: customer_phone?.trim() || null,
      items,
      subtotal: Number(subtotal) || Number(total_amount) || 0,
      discount_amount: Number(discount_amount) || 0,
      total_amount: Number(total_amount) || 0,
      currency: menu.currency || 'HNL',
      applied_coupon_code: applied_coupon_code || null,
      applied_coupon_label: applied_coupon_label || null,
      notes: notes?.trim() || null,
      status: 'pending',
      payment_status: 'pending'
    }

    const { data: newOrder, error: insertErr } = await admin
      .from('restaurant_orders')
      .insert(payload)
      .select()
      .single()

    if (insertErr || !newOrder) {
      console.error('Error inserting restaurant order:', insertErr)
      return NextResponse.json(
        { error: insertErr?.message || 'Error al registrar pedido' },
        { status: 500 }
      )
    }

    // 4. Sincronización automática con el CRM (Tabla leads) si proporcionó teléfono
    if (customer_phone?.trim()) {
      try {
        const cleanPhone = customer_phone.trim().replace(/\s+/g, '')
        const cleanName = customer_name?.trim() || 'Comensal'

        const { data: existingLead } = await admin
          .from('leads')
          .select('id, notes, deal_value')
          .eq('user_id', menu.user_id)
          .eq('phone', cleanPhone)
          .maybeSingle()

        const orderNote = `[${new Date().toLocaleDateString('es-ES')}] Pedido #${dailyOrderNumber} (${table_number || 'Mesa'}) — Total: ${menu.currency} ${total_amount}${applied_coupon_label ? ` [Cupón: ${applied_coupon_label}]` : ''}`

        if (existingLead) {
          await admin
            .from('leads')
            .update({
              name: cleanName,
              deal_value: (existingLead.deal_value || 0) + Number(total_amount),
              notes: existingLead.notes ? `${existingLead.notes}\n${orderNote}` : orderNote
            })
            .eq('id', existingLead.id)
        } else {
          await admin
            .from('leads')
            .insert({
              user_id: menu.user_id,
              name: cleanName,
              phone: cleanPhone,
              source: 'menu_digital',
              deal_value: Number(total_amount),
              notes: orderNote
            })
        }
      } catch (crmErr) {
        console.error('CRM sync warning for order:', crmErr)
      }
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      dailyOrderNumber
    })
  } catch (err: any) {
    console.error('Error in /api/orders/create:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
