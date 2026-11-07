import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * Webhook Oficial de Hotmart para OmniTag SaaS (B2B)
 * Recibe notificaciones automáticas de compras, renovaciones, cancelaciones y reembolsos.
 * Valida la cabecera de seguridad X-HOTMART-HOTTOK (configurada en HOTMART_HOTTOK en .env.local).
 */
export async function POST(request: NextRequest) {
  try {
    const expectedHottok = process.env.HOTMART_HOTTOK
    const incomingHottok = request.headers.get('x-hotmart-hottok') || request.headers.get('X-HOTMART-HOTTOK')

    if (!expectedHottok || incomingHottok !== expectedHottok) {
      return NextResponse.json(
        { error: 'No autorizado: Token HOTTOK inválido o no configurado' },
        { status: 401 }
      )
    }

    const payload = await request.json()
    const event = (payload?.event || '').toString().toUpperCase()
    const data = payload?.data || {}

    const buyerEmail = (data?.buyer?.email || payload?.email || '').toString().trim().toLowerCase()
    const buyerName = (data?.buyer?.name || payload?.name || 'Cliente Hotmart').toString().trim()
    const sckUserId = (
      data?.purchase?.origin?.sck ||
      data?.purchase?.sck ||
      payload?.sck ||
      ''
    ).toString().trim()

    if (!buyerEmail && !sckUserId) {
      return NextResponse.json({ error: 'Payload sin comprador identificable' }, { status: 400 })
    }

    const admin = getAdminClient()

    // 1. Localizar al usuario por sck (ID directo) o por correo electrónico
    let targetUser: { id: string; email?: string | null; industry?: string | null } | null = null

    if (sckUserId && sckUserId.length >= 20) {
      const { data: byId } = await admin
        .from('users')
        .select('id, email, industry')
        .eq('id', sckUserId)
        .maybeSingle()
      if (byId) targetUser = byId
    }

    if (!targetUser && buyerEmail) {
      const { data: byEmail } = await admin
        .from('users')
        .select('id, email, industry')
        .ilike('email', buyerEmail)
        .maybeSingle()
      if (byEmail) targetUser = byEmail
    }

    // 2. Si compró directo en Hotmart y aún no tenía cuenta en OmniTag, crearle la cuenta automáticamente
    // con industry = 'general' para que al iniciar sesión el Onboarding lo obligue a elegir su Giro Oficial
    if (!targetUser && buyerEmail && (event === 'PURCHASE_APPROVED' || event === 'PURCHASE_COMPLETE')) {
      const tempPassword = 'Omni' + Math.random().toString(36).slice(-8) + '!'
      const { data: createdAuth, error: createErr } = await admin.auth.admin.createUser({
        email: buyerEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: buyerName,
          account_type: 'business',
          industry: 'general',
          source: 'hotmart'
        }
      })

      if (!createErr && createdAuth?.user) {
        targetUser = {
          id: createdAuth.user.id,
          email: buyerEmail,
          industry: 'general'
        }
      }
    }

    if (!targetUser) {
      return NextResponse.json({ received: true, status: 'user_not_found' })
    }

    // 3. Procesar el evento de suscripción de Hotmart
    const approveEvents = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']
    const revokeEvents = ['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'SUBSCRIPTION_CANCELLATION', 'PURCHASE_CANCELED', 'PURCHASE_EXPIRED']

    if (approveEvents.includes(event)) {
      // Detectar si es plan anual, mensual o Licencia de Distribuidor Marca Blanca según el nombre de la oferta/producto o Claves de Seguimiento
      const offerCode = (data?.purchase?.offer?.code || '').toString().toLowerCase()
      const planName = (data?.subscription?.plan?.name || '').toString().toLowerCase()
      const prodName = (data?.product?.name || '').toString().toLowerCase()
      const payloadStr = JSON.stringify(data || {}).toLowerCase()
      const combinedName = `${offerCode} ${planName} ${prodName} ${payloadStr}`

      const isAnnual = combinedName.includes('anual') || combinedName.includes('year')
      const isResellerPlan =
        combinedName.includes('reseller_25') ||
        combinedName.includes('reseller_10') ||
        combinedName.includes('reseller_50') ||
        combinedName.includes('reseller_100') ||
        combinedName.includes('marca_blanca') ||
        combinedName.includes('distribuidor') ||
        combinedName.includes('reseller') ||
        combinedName.includes('agencia') ||
        combinedName.includes('partner') ||
        combinedName.includes('marca blanca') ||
        combinedName.includes('whitelabel')

      const durationDays = isAnnual ? 365 : 32 // 32 días de margen para cobros mensuales
      const newExpiry = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()

      if (isResellerPlan) {
        const { data: targetAuth } = await admin.auth.admin.getUserById(targetUser.id)
        const existingMeta = targetAuth?.user?.user_metadata || {}
        const quota = combinedName.includes('100')
          ? 100
          : combinedName.includes('50')
          ? 50
          : (combinedName.includes('10') || combinedName.includes('starter'))
          ? 10
          : Number(existingMeta.reseller_quota || 25)

        await admin.auth.admin.updateUserById(targetUser.id, {
          user_metadata: {
            ...existingMeta,
            is_reseller: true,
            reseller_quota: quota,
            reseller_expires_at: newExpiry,
          }
        })
      }

      await admin
        .from('users')
        .update({
          subscription_expires_at: newExpiry
        })
        .eq('id', targetUser.id)

      await admin
        .from('workspaces')
        .upsert({
          id: targetUser.id,
          name: buyerName || 'Mi Negocio',
          plan: 'pro',
          subscription_expires_at: newExpiry
        })

      await admin.from('notifications').insert({
        user_id: targetUser.id,
        title: '💎 ¡Suscripción PRO Activada vía Hotmart!',
        message: `Tu pago en Hotmart fue confirmado. Tu cuenta cuenta con acceso PRO activo hasta el ${new Date(newExpiry).toLocaleDateString('es-HN')}.`,
        type: 'success',
        link: '/dashboard/billing'
      })

      return NextResponse.json({ received: true, action: 'pro_activated', userId: targetUser.id, expiresAt: newExpiry })
    }

    if (revokeEvents.includes(event)) {
      const expiredIso = new Date(Date.now() - 60 * 1000).toISOString()

      const { data: targetAuth } = await admin.auth.admin.getUserById(targetUser.id)
      const existingMeta = targetAuth?.user?.user_metadata || {}
      if (existingMeta.is_reseller) {
        await admin.auth.admin.updateUserById(targetUser.id, {
          user_metadata: {
            ...existingMeta,
            reseller_expires_at: expiredIso,
          }
        })
      }

      await admin
        .from('users')
        .update({
          subscription_expires_at: expiredIso
        })
        .eq('id', targetUser.id)

      await admin
        .from('workspaces')
        .update({
          plan: 'free',
          subscription_expires_at: expiredIso
        })
        .eq('id', targetUser.id)

      await admin.from('notifications').insert({
        user_id: targetUser.id,
        title: '⚠️ Suscripción Hotmart Finalizada',
        message: `Recibimos una notificación de ${event} desde Hotmart. Tu suscripción PRO mensual ha sido desactivada.`,
        type: 'warning',
        link: '/dashboard/billing'
      })

      return NextResponse.json({ received: true, action: 'pro_revoked', userId: targetUser.id })
    }

    return NextResponse.json({ received: true, event })
  } catch (err: any) {
    console.error('Error en Webhook de Hotmart:', err)
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 })
  }
}
