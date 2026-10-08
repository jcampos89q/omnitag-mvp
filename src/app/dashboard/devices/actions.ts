'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'

export async function createDevice(formData: FormData) {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

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

  // Capturar datos enriquecidos de Google Places si vienen en el formulario
  const placeId = (formData.get('place_id') as string)?.trim() || null
  const businessName = (formData.get('business_name') as string)?.trim() || null
  const businessAddress = (formData.get('business_address') as string)?.trim() || null
  const businessPhone = (formData.get('business_phone') as string)?.trim() || null
  const googleTypesRaw = (formData.get('google_types') as string) || '[]'
  let googleTypes: string[] = []
  try {
    googleTypes = JSON.parse(googleTypesRaw)
  } catch {
    googleTypes = []
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
      place_id: placeId,
      business_name: businessName,
      business_address: businessAddress,
      business_phone: businessPhone,
      google_types: googleTypes,
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
  const { user } = await getEffectiveUser(supabase)
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

export async function toggleReviewFilter(deviceId: string) {
  const supabase = await createClient()
  const { user, realAdmin, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")

  // Verificar pertenencia del dispositivo
  const { data: device, error: fetchError } = await supabase
    .from('devices')
    .select('id, review_filter_enabled, user_id')
    .eq('id', deviceId)
    .single()

  if (fetchError || !device) {
    throw new Error("Dispositivo no encontrado")
  }

  // Si no es el dueño, verificar si es admin (o está en sesión de soporte)
  if (device.user_id !== user.id) {
    const checkAdminId = realAdmin?.id || user.id
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', checkAdminId)
      .single()
    if (!profile?.is_admin) {
      throw new Error("No tienes permisos para modificar esta placa")
    }
  }

  const newStatus = !device.review_filter_enabled

  const { error: updateError } = await supabase
    .from('devices')
    .update({ review_filter_enabled: newStatus })
    .eq('id', deviceId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  revalidatePath('/dashboard/devices')
  revalidatePath('/dashboard/admin')
  return { success: true, enabled: newStatus }
}

/**
 * Permite a un usuario vincular una placa física adicional directamente desde su panel
 */
export async function claimPhysicalPlate(formData: FormData) {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")

  const rawTagId = (formData.get('tag_id') as string)?.trim()
  if (!rawTagId) {
    redirect('/dashboard/devices?error=' + encodeURIComponent('Por favor ingresa el código o ID de la placa'))
  }

  const cleanTagId = decodeURIComponent(rawTagId).trim()

  // 1. Verificar si la placa ya pertenece a otro usuario activo con destino configurado
  const { data: existingDevice } = await supabase
    .from('devices')
    .select('id, user_id, is_active, business_name, redirect_url')
    .or(`tag_id.eq.${cleanTagId},tag_id.eq.${encodeURIComponent(cleanTagId)},tag_id.ilike.${cleanTagId}`)
    .maybeSingle()

  if (existingDevice && existingDevice.user_id && existingDevice.user_id !== user.id && existingDevice.is_active && existingDevice.redirect_url) {
    redirect('/dashboard/devices?error=' + encodeURIComponent('Esta placa ya se encuentra vinculada a otra cuenta.'))
  }

  // 2. Obtener datos de negocio base del usuario (para clonar el mismo negocio a la nueva placa)
  const sourceDeviceId = (formData.get('source_device_id') as string)?.trim()
  let baseDevice: any = null

  if (sourceDeviceId) {
    const { data: src } = await supabase
      .from('devices')
      .select('*')
      .eq('id', sourceDeviceId)
      .eq('user_id', user.id)
      .maybeSingle()
    baseDevice = src
  }

  if (!baseDevice) {
    const { data: latest } = await supabase
      .from('devices')
      .select('*')
      .eq('user_id', user.id)
      .not('business_name', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    baseDevice = latest
  }

  const businessName = baseDevice?.business_name || 'Mi Negocio'
  const placeId = baseDevice?.place_id || null
  const redirectUrl = baseDevice?.redirect_url || null
  const businessAddress = baseDevice?.business_address || null
  const businessPhone = baseDevice?.business_phone || null
  const googleTypes = Array.isArray(baseDevice?.google_types) ? baseDevice.google_types : []
  const reviewFilter = baseDevice?.review_filter_enabled ?? true

  if (existingDevice) {
    await supabase
      .from('devices')
      .update({
        user_id: user.id,
        device_type: 'tap_to_rate',
        business_name: businessName,
        place_id: placeId,
        redirect_url: redirectUrl,
        business_address: businessAddress,
        business_phone: businessPhone,
        google_types: googleTypes,
        review_filter_enabled: reviewFilter,
        is_active: Boolean(redirectUrl)
      })
      .eq('id', existingDevice.id)
  } else {
    await supabase
      .from('devices')
      .insert({
        tag_id: cleanTagId,
        user_id: user.id,
        device_type: 'tap_to_rate',
        business_name: businessName,
        place_id: placeId,
        redirect_url: redirectUrl,
        business_address: businessAddress,
        business_phone: businessPhone,
        google_types: googleTypes,
        review_filter_enabled: reviewFilter,
        is_active: Boolean(redirectUrl)
      })
  }

  // Actualizar estado en nfc_cards si existe
  await supabase
    .from('nfc_cards')
    .update({
      status: 'active',
      claimed_by_user_id: user.id,
      claimed_at: new Date().toISOString()
    })
    .or(`card_token.eq.${cleanTagId},card_token.ilike.${cleanTagId}`)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/devices')
  revalidatePath('/dashboard/google-business')

  redirect('/dashboard/devices?success=' + encodeURIComponent(`¡Placa ${cleanTagId} vinculada exitosamente a ${businessName}!`))
}
