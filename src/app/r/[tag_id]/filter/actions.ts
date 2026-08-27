'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

  revalidatePath('/dashboard/feedback')
  revalidatePath('/dashboard/admin')

  return { success: true }
}
