import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Inicializar Stripe con la clave secreta (si existe)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-07-29.dahlia' }) 
  : null

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!stripe) {
      // Si no hay API keys configuradas, mockeamos la respuesta para el MVP local
      console.warn("⚠️ STRIPE_SECRET_KEY no configurada. Simulando redirección de pago.")
      
      // Simularemos que el pago fue exitoso redirigiendo de vuelta con un parámetro
      // En producción, esto JAMÁS debe hacerse así, esto es solo para que el cliente vea el flujo
      return NextResponse.redirect(new URL('/dashboard/billing?mock_success=true', request.url), { status: 303 })
    }

    // Flujo real de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Suscripción PRO - OmniTag',
              description: 'Acceso ilimitado a todas las funciones premium.',
            },
            unit_amount: 2900, // $29.00
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin')}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin')}/dashboard/billing?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id
      }
    })

    if (!session.url) {
      throw new Error("No se pudo crear la sesión de Stripe")
    }

    return NextResponse.redirect(session.url, { status: 303 })
  } catch (err: any) {
    console.error("Error en Stripe Checkout:", err)
    return NextResponse.redirect(new URL('/dashboard/billing?error=true', request.url), { status: 303 })
  }
}
