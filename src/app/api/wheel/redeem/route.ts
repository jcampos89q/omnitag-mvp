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

    const { data: result, error: rpcErr } = await supabase.rpc('redeem_wheel_coupon', {
      p_coupon_code: cleanCode,
      p_pin_code: pinCode ? pinCode.toString().trim() : null
    })

    if (rpcErr || !result) {
      console.error('Redeem RPC Error:', rpcErr)
      return NextResponse.json(
        { error: 'Error al procesar la validación del cupón.' },
        { status: 500 }
      )
    }

    if (!result.success) {
      const status = result.error?.includes('PIN') ? 401 : result.error?.includes('no encontrado') ? 404 : 400
      return NextResponse.json({ error: result.error }, { status })
    }

    return NextResponse.json({
      success: true,
      message: result.message || '¡Cupón canjeado con éxito!',
      prize: result.prize || 'Premio',
      customerName: result.customerName
    })
  } catch (err: any) {
    console.error('Redeem Error:', err)
    return NextResponse.json(
      { error: err.message || 'Error al validar cupón.' },
      { status: 500 }
    )
  }
}
