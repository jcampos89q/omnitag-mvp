import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Redirección de Checkout B2B hacia Hotmart (pasarela oficial de OmniTag SaaS)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const baseHotmartUrl = process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL
    if (!baseHotmartUrl) {
      return NextResponse.redirect(new URL('/dashboard/billing#metodos-pago', request.url), { status: 303 })
    }

    const separator = baseHotmartUrl.includes('?') ? '&' : '?'
    const checkoutUrl = `${baseHotmartUrl}${separator}email=${encodeURIComponent(user.email || '')}&sck=${encodeURIComponent(user.id)}`

    return NextResponse.redirect(checkoutUrl, { status: 303 })
  } catch (err) {
    console.error('Error redirigiendo a Hotmart Checkout:', err)
    return NextResponse.redirect(new URL('/dashboard/billing?error=true', request.url), { status: 303 })
  }
}
