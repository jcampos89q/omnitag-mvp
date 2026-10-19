'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendPushNotificationToUser } from '@/lib/push'

export async function submitPrivateFeedback(formData: FormData) {
  const supabase = await createClient()
  const adminClient = getAdminClient()
  
  const deviceId = (formData.get('device_id') as string)?.trim()
  const rating = parseInt(formData.get('rating') as string) || 1
  const message = (formData.get('message') as string)?.trim() || ''
  const customerName = (formData.get('customer_name') as string)?.trim() || null
  const customerPhone = (formData.get('customer_phone') as string)?.trim() || null
  const customerEmail = (formData.get('customer_email') as string)?.trim() || null

  if (!deviceId) return { success: false, error: 'Dispositivo no especificado' }

  // Intentar con adminClient (service_role si existe) o cliente normal
  let insertError = null
  const feedbackPayload = {
    device_id: deviceId,
    rating,
    message: message || null,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    status: 'pending'
  }

  const { error: adminErr } = await adminClient.from('private_feedbacks').insert(feedbackPayload)
  if (adminErr) {
    const { error: normalErr } = await supabase.from('private_feedbacks').insert(feedbackPayload)
    insertError = normalErr || adminErr
  }

  if (insertError) {
    console.error('Error guardando queja privada:', insertError)
  }

  // Enviar notificación interna y Push Flotante al celular del dueño
  try {
    const { data: device } = await supabase
      .from('devices')
      .select('user_id, business_name')
      .eq('id', deviceId)
      .maybeSingle()

    if (device?.user_id) {
      const bizName = device.business_name || 'tu negocio'
      const notifPayload = {
        user_id: device.user_id,
        title: '⚠️ Queja / Opinión Privada Recibida',
        message: `${customerName || 'Un cliente'} dejó ${rating}★ en "${bizName}"${message ? `: "${message.slice(0, 70)}${message.length > 70 ? '...' : ''}"` : '.'}`,
        type: 'warning',
        link: '/dashboard/feedback'
      }

      await adminClient.from('notifications').insert(notifPayload)

      // Push Flotante al celular del dueño
      await sendPushNotificationToUser(device.user_id, {
        title: '⚠️ ¡Alerta de Opinión Privada!',
        body: `Un cliente dejó ${rating}★ en "${bizName}". Toca para ver el comentario y contactarlo.`,
        url: '/dashboard/feedback'
      })
    }
  } catch (notifErr) {
    console.error('Error enviando notificacion de feedback:', notifErr)
  }

  revalidatePath('/dashboard/feedback')
  revalidatePath('/dashboard/admin')

  return { success: true }
}

export async function recordPositiveReviewClick(deviceId: string, rating: number) {
  if (!deviceId) return

  try {
    const supabase = await createClient()
    const adminClient = getAdminClient()

    const { data: device } = await supabase
      .from('devices')
      .select('user_id, business_name')
      .eq('id', deviceId)
      .maybeSingle()

    if (device?.user_id) {
      const bizName = device.business_name || 'tu local'
      
      // In-app notification
      await adminClient.from('notifications').insert({
        user_id: device.user_id,
        title: `⭐ ¡Nuevo Cliente Calificó ${rating}★!`,
        message: `Un cliente en "${bizName}" tocó ${rating} estrellas y fue dirigido a tu perfil de Google Reviews para publicar su reseña.`,
        type: 'success',
        link: '/dashboard'
      })

      // Push Notification
      await sendPushNotificationToUser(device.user_id, {
        title: `⭐ ¡Calificación ${rating}★ en ${bizName}!`,
        body: `Un cliente tocó ${rating}★ en tu placa NFC y fue a Google Reviews a dejar su reseña.`,
        url: '/dashboard'
      })
    }
  } catch (err) {
    console.error('Error registrando clic positivo en reseña:', err)
  }
}
