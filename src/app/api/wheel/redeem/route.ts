import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { couponCode, pinCode } = body

    if (!couponCode?.trim()) {
      return NextResponse.json(
        { error: 'El código de cupón es obligatorio.' },
        { status: 400 }
      )
    }

    const cleanCode = couponCode.trim().toUpperCase()
    const supabase = await createClient()

    // 1. Buscar el Cupón Emitido
    const { data: spin, error: spinErr } = await supabase
      .from('prize_wheel_spins')
      .select('*, prize_wheels(id, user_id, pin_code), prize_wheel_items(label, icon)')
      .eq('coupon_code', cleanCode)
      .maybeSingle()

    if (spinErr || !spin) {
      return NextResponse.json(
        { error: 'Código de cupón no encontrado o inválido.' },
        { status: 404 }
      )
    }

    // 2. Validar Estado del Cupón
    if (spin.status === 'redeemed') {
      const redeemedDate = spin.redeemed_at 
        ? new Date(spin.redeemed_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) 
        : 'hoy'
      return NextResponse.json(
        { error: `Este cupón ya fue canjeado a las ${redeemedDate}. No se puede reutilizar.` },
        { status: 400 }
      )
    }

    if (spin.status === 'expired' || (spin.expires_at && new Date() > new Date(spin.expires_at))) {
      return NextResponse.json(
        { error: 'Este cupón ha expirado.' },
        { status: 400 }
      )
    }

    // 3. Validar PIN del comercio si se configuró PIN de cajero
    const expectedPin = spin.prize_wheels?.pin_code
    if (expectedPin && expectedPin !== '1234' && pinCode) {
      if (pinCode.toString().trim() !== expectedPin.toString().trim()) {
        return NextResponse.json(
          { error: 'PIN de mesero/cajero incorrecto.' },
          { status: 401 }
        )
      }
    }

    // 4. Marcar como Canjeado
    const { error: updateErr } = await supabase
      .from('prize_wheel_spins')
      .update({
        status: 'redeemed',
        redeemed_at: new Date().toISOString()
      })
      .eq('id', spin.id)

    if (updateErr) {
      return NextResponse.json(
        { error: 'No se pudo canjear el cupón.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '¡Cupón canjeado con éxito!',
      prize: spin.prize_wheel_items?.label || 'Premio',
      customerName: spin.customer_name
    })
  } catch (err: any) {
    console.error('Redeem Error:', err)
    return NextResponse.json(
      { error: err.message || 'Error al validar cupón.' },
      { status: 500 }
    )
  }
}
