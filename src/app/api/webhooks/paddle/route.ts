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
        // Otorgar 35 días de vigencia mensual (margen seguro para ciclo de cobro)
        const durationDays = 35
        const newExpiry = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()

        // Identificar el Price ID del ítem comprado
        const purchasedPriceId = (
          data?.items?.[0]?.price?.id ||
          data?.price_id ||
          data?.priceId ||
          data?.details?.line_items?.[0]?.price_id ||
          ''
        ).toString().trim()

        const payloadStr = JSON.stringify(data || {}).toLowerCase()

        // Mapeo oficial de planes y licencias de Agencias
        const starterPrice = process.env.NEXT_PUBLIC_PADDLE_AGENCY_STARTER_PRICE_ID || 'pri_01m7b4yqxqmn1x4bbc7kd8b4rz'
        const proAgencyPrice = process.env.NEXT_PUBLIC_PADDLE_AGENCY_PRO_PRICE_ID || 'pri_01m7b5999d227mew1kmd1mn0gd'
        const enterpriseAgencyPrice = process.env.NEXT_PUBLIC_PADDLE_AGENCY_ENTERPRISE_PRICE_ID || 'pri_01m7b5c5zsva2rb1g2za305nbh'

        const isAgencyStarter = purchasedPriceId === starterPrice || payloadStr.includes('starter') || payloadStr.includes(starterPrice)
        const isAgencyPro = purchasedPriceId === proAgencyPrice || payloadStr.includes('pro agency') || payloadStr.includes('agencia pro') || payloadStr.includes(proAgencyPrice)
        const isAgencyEnterprise = purchasedPriceId === enterpriseAgencyPrice || payloadStr.includes('enterprise') || payloadStr.includes('country') || payloadStr.includes(enterpriseAgencyPrice)

        const isResellerPlan = isAgencyStarter || isAgencyPro || isAgencyEnterprise

        if (isResellerPlan) {
          const quota = isAgencyEnterprise ? 100 : isAgencyPro ? 25 : 10

          const { data: targetAuth } = await admin.auth.admin.getUserById(targetUser.id)
          const existingMeta = targetAuth?.user?.user_metadata || {}

          await admin.auth.admin.updateUserById(targetUser.id, {
            user_metadata: {
              ...existingMeta,
              is_reseller: true,
              reseller_quota: quota,
              reseller_expires_at: newExpiry,
            }
          })

          await admin
            .from('users')
            .update({
              plan: 'pro',
              plan_status: 'active',
              plan_expires_at: newExpiry,
              subscription_expires_at: newExpiry,
              updated_at: new Date().toISOString()
            })
            .eq('id', targetUser.id)

          await admin
            .from('workspaces')
            .upsert({
              id: targetUser.id,
              name: data?.customer?.name || targetUser.email?.split('@')[0] || 'Mi Agencia',
              slug: (targetUser.email?.split('@')[0] || 'agencia').toLowerCase().replace(/[^a-z0-9]/g, ''),
              subscription_expires_at: newExpiry,
              plan_type: 'agency',
              updated_at: new Date().toISOString()
            })

          await admin.from('notifications').insert({
            user_id: targetUser.id,
            type: 'plan_upgraded',
            title: '🚀 ¡Licencia de Agencia Activada vía Paddle!',
            message: `Tu pago fue procesado con éxito. Tienes acceso completo a tu Panel de Revendedor Marca Blanca con cupo para ${quota} clientes activo hasta el ${new Date(newExpiry).toLocaleDateString('es-HN')}.`,
            read: false,
            created_at: new Date().toISOString()
          })
        } else {
          // Cliente Final / Plan Negocio PRO ($25/mes)
          await admin
            .from('users')
            .update({
              plan: 'pro',
              plan_status: 'active',
              plan_expires_at: newExpiry,
              subscription_expires_at: newExpiry,
              updated_at: new Date().toISOString()
            })
            .eq('id', targetUser.id)

          await admin
            .from('workspaces')
            .upsert({
              id: targetUser.id,
              name: data?.customer?.name || targetUser.email?.split('@')[0] || 'Mi Negocio',
              slug: (targetUser.email?.split('@')[0] || 'negocio').toLowerCase().replace(/[^a-z0-9]/g, ''),
              subscription_expires_at: newExpiry,
              plan_type: 'pro',
              updated_at: new Date().toISOString()
            })

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
