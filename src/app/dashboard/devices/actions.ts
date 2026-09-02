'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createDevice(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("No autenticado")

  const deviceType = (formData.get('device_type') as string) || 'tap_to_rate'
  let redirectUrl = (formData.get('redirect_url') as string)?.trim() || ''
  const reviewFilter = deviceType === 'tap_to_rate' && (formData.get('review_filter') === 'on' || formData.get('review_filter') !== 'off')
  const tagId = Math.random().toString(36).substring(2, 8).toUpperCase() // ej: X7F9A2

  let vcardId: string | null = null
  let loyaltyId: string | null = null

  // Si es tap-to-rate y pega un Place ID de Google (empieza con ChI)
  if (deviceType === 'tap_to_rate' && redirectUrl.startsWith('ChI')) {
    redirectUrl = `https://search.google.com/local/writereview?placeid=${redirectUrl}`
  }

  // Si es vincular a vCard
  if (deviceType === 'vcard') {
    const { data: vcard } = await supabase
      .from('vcards')
      .select('id, slug')
      .eq('user_id', user.id)
      .maybeSingle()
    if (vcard) {
      vcardId = vcard.id
      redirectUrl = `https://www.omnitag.site/v/${vcard.slug}`
    }
  }

  // Si es vincular a Menú
  if (deviceType === 'menu') {
    const { data: menu } = await supabase
      .from('menus')
      .select('id, slug')
      .eq('user_id', user.id)
      .maybeSingle()
    if (menu) {
      redirectUrl = `https://www.omnitag.site/m/${menu.slug}`
    }
  }

  // Si es vincular a Fidelización
  if (deviceType === 'loyalty') {
    const { data: loyalty } = await supabase
      .from('loyalty_programs')
      .select('id, slug')
      .eq('user_id', user.id)
      .maybeSingle()
    if (loyalty) {
      loyaltyId = loyalty.id
      redirectUrl = `https://www.omnitag.site/l/${loyalty.slug}`
    }
  }

  // Si es vincular a Wi-Fi
  if (deviceType === 'wifi') {
    const wifiSsid = (formData.get('wifi_ssid') as string)?.trim() || 'MiNegocio_WiFi'
    const wifiPass = (formData.get('wifi_password') as string)?.trim() || ''
    const wifiName = (formData.get('wifi_name') as string)?.trim() || ''
    const menuSlug = (formData.get('wifi_menu_slug') as string)?.trim() || ''
    redirectUrl = `https://www.omnitag.site/wifi?ssid=${encodeURIComponent(wifiSsid)}&pass=${encodeURIComponent(wifiPass)}&name=${encodeURIComponent(wifiName)}&menu=${encodeURIComponent(menuSlug)}`
  }

  if (!redirectUrl) {
    redirect('/dashboard/devices?error=missing_url')
  }

  const { error } = await supabase
    .from('devices')
    .insert({
      user_id: user.id,
      tag_id: tagId,
      device_type: deviceType,
      redirect_url: redirectUrl,
      vcard_id: vcardId,
      loyalty_program_id: loyaltyId,
      review_filter_enabled: reviewFilter,
      is_active: true
    })

  if (error) {
    console.error('Error creating device:', error)
    redirect('/dashboard/devices?error=true')
  }

  revalidatePath('/dashboard/devices')
  revalidatePath('/dashboard/admin')
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
  revalidatePath('/dashboard/admin')
}
