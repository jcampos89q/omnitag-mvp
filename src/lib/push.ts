import webpush from 'web-push'
import { getAdminClient } from '@/lib/supabase/admin'

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BGT3Kz8txr0vXdMgVYRB6FT_zAT_nc6V3S8BU6h364ID5vkMjJKJzpWdprWFjTj834YURYtAoEbB6BaajnF3OO8'
const privateKey = process.env.VAPID_PRIVATE_KEY || '_wO5fpvossgdfpkIjZqBsswY6g79NEEQfWoyc7Ldx8U'

webpush.setVapidDetails(
  'mailto:contacto@omnitag.site',
  publicKey,
  privateKey
)

export interface PushNotificationPayload {
  title: string
  body: string
  url?: string
  icon?: string
}

/**
 * Envía una notificación Push nativa al celular/PC del usuario aunque tenga el navegador cerrado
 */
export async function sendPushNotificationToUser(userId: string, payload: PushNotificationPayload) {
  if (!userId) return

  try {
    const supabaseAdmin = getAdminClient()

    // 1. Intentar obtener suscripciones vía RPC (para evitar RLS si está configurado)
    let subs: any[] | null = null
    const { data: rpcSubs, error: rpcError } = await supabaseAdmin
      .rpc('get_user_push_subscriptions', { p_user_id: userId })

    if (!rpcError && Array.isArray(rpcSubs) && rpcSubs.length > 0) {
      subs = rpcSubs
    } else {
      // Fallback: consulta directa a la tabla push_subscriptions
      const { data: directSubs } = await supabaseAdmin
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', userId)

      if (directSubs && directSubs.length > 0) {
        subs = directSubs
      }
    }

    if (!subs || subs.length === 0) {
      return
    }

    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/dashboard',
      icon: payload.icon || '/icon-192x192.png'
    })

    const sendPromises = subs.map(async (sub: any) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      }

      try {
        await webpush.sendNotification(pushSubscription, payloadString)
      } catch (err: any) {
        // Si la suscripción expiró o fue eliminada del navegador (410 Gone / 404), limpiarla
        if (err.statusCode === 410 || err.statusCode === 404) {
          try {
            await supabaseAdmin
              .rpc('delete_expired_push_subscription', { p_endpoint: sub.endpoint })
          } catch {
            await supabaseAdmin
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint)
          }
        } else {
          console.error('Error enviando push individual:', err.message)
        }
      }
    })

    await Promise.allSettled(sendPromises)
  } catch (err: any) {
    console.error('Error enviando push notification:', err)
  }
}
