import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BGT3Kz8txr0vXdMgVYRB6FT_zAT_nc6V3S8BU6h364ID5vkMjJKJzpWdprWFjTj834YURYtAoEbB6BaajnF3OO8'
const privateKey = process.env.VAPID_PRIVATE_KEY || '_wO5fpvossgdfpkIjZqBsswY6g79NEEQfWoyc7Ldx8U'

webpush.setVapidDetails(
  'mailto:contacto@omnitag.site',
  publicKey,
  privateKey
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
    // Buscar todas las suscripciones push activas del usuario (celular, tablet, PC)
    const { data: subs, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (error || !subs || subs.length === 0) {
      return
    }

    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/dashboard',
      icon: payload.icon || '/icon-192x192.png'
    })

    const sendPromises = subs.map(async (sub) => {
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
          await supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
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
