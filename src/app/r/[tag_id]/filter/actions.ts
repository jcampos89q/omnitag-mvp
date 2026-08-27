'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushNotificationToUser } from '@/lib/push'

export async function submitPrivateFeedback(formData: FormData) {
  const supabase = await createClient()
  
  const deviceId = (formData.get('device_id') as string)?.trim()
  const rating = parseInt(formData.get('rating') as string) || 1
  const message = (formData.get('message') as string)?.trim() || ''
  const customerName = (formData.get('customer_name') as string)?.trim() || null
  const customerPhone = (formData.get('customer_phone') as string)?.trim() || null
  const customerEmail = (formData.get('customer_email') as string)?.trim() || null

  if (!deviceId) return { success: false, error: 'Dispositivo no especificado' }

  const { error } = await supabase.from('private_feedbacks').insert({
    device_id: deviceId,
    rating,
    message: message || null,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    status: 'pending'
  })

  if (error) {
    console.error('Error guardando queja privada:', error)
    return { success: false, error: error.message }
  }

  // Enviar notificación interna y Push Flotante al celular del dueño
  try {
    const { data: device } = await supabase
      .from('devices')
      .select('user_id, name')
      .eq('id', deviceId)
      .maybeSingle()

    if (device?.user_id) {
      await supabase.from('notifications').insert({
        user_id: device.user_id,
        title: '⚠️ Queja / Opinión Privada Recibida',
        message: `${customerName || 'Un cliente'} dejó ${rating}★ en "${device.name || 'tu placa'}"${message ? `: "${message.slice(0, 70)}${message.length > 70 ? '...' : ''}"` : '.'}`,
        type: 'warning',
        link: '/dashboard/feedback'
      })

      // Push Flotante al celular bloqueado
      await sendPushNotificationToUser(device.user_id, {
        title: '⚠️ ¡Alerta de Reseña / Queja en OmniTag!',
        body: `Un cliente dejó ${rating}★ en "${device.name || 'tu placa'}". Toca para verla y responder.`,
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
