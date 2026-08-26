'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitPrivateFeedback(formData: FormData) {
  const supabase = await createClient()
  
  const deviceId = formData.get('device_id') as string
  const rating = parseInt(formData.get('rating') as string)
  const message = formData.get('message') as string

  if (!deviceId || !rating) return

  await supabase.from('private_feedbacks').insert({
    device_id: deviceId,
    rating,
    message: message || null
  })
}
