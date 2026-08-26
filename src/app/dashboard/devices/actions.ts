'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createDevice(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("No autenticado")

  const deviceType = formData.get('device_type') as string
  let redirectUrl = formData.get('redirect_url') as string
  const reviewFilter = formData.get('review_filter') === 'on'
  const tagId = Math.random().toString(36).substring(2, 8).toUpperCase() // ej: X7F9A2

  // Smart Link para Google Reviews: Si el usuario pega solo un Place ID (empieza con ChI), lo convertimos
  if (deviceType === 'tap_to_rate' && redirectUrl.startsWith('ChI')) {
    redirectUrl = `https://search.google.com/local/writereview?placeid=${redirectUrl}`
  }

  const { error } = await supabase
    .from('devices')
    .insert({
      user_id: user.id,
      tag_id: tagId,
      device_type: deviceType,
      redirect_url: redirectUrl,
      review_filter_enabled: reviewFilter,
      is_active: true
    })

  if (error) {
    console.error('Error creating device:', error)
    redirect('/dashboard/devices?error=true')
  }

  revalidatePath('/dashboard/devices')
  redirect('/dashboard/devices?success=true')
}

export async function deleteDevice(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const deviceId = formData.get('device_id') as string

  await supabase
    .from('devices')
    .delete()
    .eq('id', deviceId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard/devices')
}
