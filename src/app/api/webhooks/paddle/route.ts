import { NextRequest, NextResponse } from 'next/server'
import { Paddle, Environment } from '@paddle/paddle-node-sdk'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * Webhook Oficial de Paddle Billing para OmniTag SaaS (B2B)
 * Maneja eventos de:
 * - transaction.completed / transaction.paid
 * - subscription.activated / subscription.updated / subscription.canceled
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('paddle-signature') || ''
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET_KEY || ''
    const apiKey = process.env.PADDLE_API_KEY || ''
    const env = process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' 
      ? Environment.production 
      : Environment.sandbox

    const paddle = new Paddle(apiKey, { environment: env })

    // Si hay un webhook secret configurado en Paddle, verificar firma
    let eventData: any = null
    if (webhookSecret && signature) {
      try {
        eventData = paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)
      } catch (err: any) {
        console.error('Error validando firma de Paddle webhook:', err?.message)
        return NextResponse.json({ error: 'Firma de webhook inválida' }, { status: 400 })
      }
    } else {
      // Modo flexible para pruebas iniciales si aún no se configuró el webhook secret
      try {
        eventData = JSON.parse(rawBody)
      } catch {
        return NextResponse.json({ error: 'Cuerpo no es JSON válido' }, { status: 400 })
      }
    }

    const eventType = (eventData?.eventType || eventData?.event_type || '').toString()
    const data = eventData?.data || {}

    console.log(`[Paddle Webhook] Recibido evento: ${eventType}`)

    // Obtener información del cliente
    const customerEmail = (
      data?.customer?.email || 
      data?.customData?.userEmail || 
      data?.custom_data?.userEmail || 
      ''
    ).toString().trim().toLowerCase()

    const sckUserId = (
      data?.customData?.userId || 
      data?.custom_data?.userId || 
      ''
    ).toString().trim()

    if (!customerEmail && !sckUserId) {
      return NextResponse.json({ received: true, note: 'Sin usuario identificable' })
    }

    const admin = getAdminClient()

    // 1. Localizar usuario
    let targetUser: { id: string; email?: string | null; industry?: string | null } | null = null

    if (sckUserId && sckUserId.length >= 20) {
      const { data: byId } = await admin
        .from('users')
        .select('id, email, industry')
        .eq('id', sckUserId)
        .maybeSingle()
      if (byId) targetUser = byId
    }

    if (!targetUser && customerEmail) {
      const { data: byEmail } = await admin
        .from('users')
        .select('id, email, industry')
        .ilike('email', customerEmail)
        .maybeSingle()
      if (byEmail) targetUser = byEmail
    }

    // Si compró y no tenía cuenta previa, crearla automáticamente
    if (!targetUser && customerEmail && (eventType.includes('transaction.completed') || eventType.includes('subscription.activated'))) {
      const tempPassword = 'Omni' + Math.random().toString(36).slice(-8) + '!'
      const { data: createdAuth, error: createErr } = await admin.auth.admin.createUser({
        email: customerEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: data?.customer?.name || 'Cliente Paddle',
          account_type: 'business',
          industry: 'general',
          source: 'paddle'
        }
      })

      if (!createErr && createdAuth?.user) {
        targetUser = {
          id: createdAuth.user.id,
          email: customerEmail,
          industry: 'general'
        }
      }
    }

    if (!targetUser) {
      return NextResponse.json({ received: true, status: 'user_not_found' })
    }

    // 2. Procesar activación de suscripción o pago
    if (eventType === 'transaction.completed' || eventType === 'subscription.activated' || eventType === 'subscription.updated') {
      const isSubscriptionActive = data?.status === 'active' || eventType === 'transaction.completed'

      if (isSubscriptionActive) {
        // Otorgar 35 días de vigencia mensual
        const newExpiry = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString()

        await admin
          .from('users')
          .update({
            plan: 'pro',
            plan_status: 'active',
            plan_expires_at: newExpiry,
            updated_at: new Date().toISOString()
          })
          .eq('id', targetUser.id)

        // Registrar notificación
        await admin.from('notifications').insert({
          user_id: targetUser.id,
          type: 'plan_upgraded',
          title: '🎉 ¡Suscripción PRO Activada vía Paddle!',
          message: `Tu pago seguro fue procesado con éxito. Tu cuenta cuenta con acceso PRO activo hasta el ${new Date(newExpiry).toLocaleDateString('es-HN')}.`,
          read: false,
          created_at: new Date().toISOString()
        })
      }
    }

    // 3. Procesar cancelaciones
    if (eventType === 'subscription.canceled' || eventType === 'subscription.past_due') {
      await admin
        .from('users')
        .update({
          plan: 'basic',
          plan_status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUser.id)

      await admin.from('notifications').insert({
        user_id: targetUser.id,
        type: 'plan_downgraded',
        title: '⚠️ Suscripción Finalizada',
        message: 'Tu suscripción en Paddle ha finalizado o fue cancelada.',
        read: false,
        created_at: new Date().toISOString()
      })
    }

    return NextResponse.json({ received: true, processed: true })
  } catch (err: any) {
    console.error('Error procesando webhook de Paddle:', err)
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
