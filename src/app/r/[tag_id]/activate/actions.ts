'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sendPushNotificationToUser } from '@/lib/push'

export async function activatePlateAndRegister(formData: FormData) {
  const supabase = await createClient()

  const tagId = (formData.get('tag_id') as string)?.trim()
  const placeId = (formData.get('place_id') as string)?.trim()
  const businessName = (formData.get('business_name') as string)?.trim()
  const businessAddress = (formData.get('business_address') as string)?.trim()
  const businessPhone = (formData.get('business_phone') as string)?.trim()
  const directReviewUrl = (formData.get('direct_review_url') as string)?.trim()
  const reviewFilter = formData.get('review_filter') === 'on'
  const googleTypesRaw = (formData.get('google_types') as string) || '[]'

  let googleTypes: string[] = []
  try {
    googleTypes = JSON.parse(googleTypesRaw)
  } catch {
    googleTypes = []
  }

  // Datos personales del cliente
  const fullName = (formData.get('full_name') as string)?.trim()
  const personalPhone = (formData.get('personal_phone') as string)?.trim() // WhatsApp personal
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)

  if (!tagId || !placeId || !directReviewUrl) {
    redirect(`/r/${tagId}/activate?error=Faltan+datos+del+negocio`)
  }

  const { data: { user: existingAuthUser } } = await supabase.auth.getUser()
  let targetUserId = existingAuthUser?.id

  // 1. Si no tiene sesión iniciada, registrar usuario nuevo
  if (!targetUserId) {
    if (!email || !password || password.length < 6) {
      redirect(`/r/${tagId}/activate?error=Contraseña+debe+tener+al+menos+6+caracteres`)
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          personal_phone: personalPhone,
          account_type: 'review_plate',
          business_name: businessName,
          industry: googleTypes[0] || 'business'
        }
      }
    })

    if (authError || !authData.user) {
      const errMsg = encodeURIComponent(authError?.message || 'Error al registrar usuario')
      redirect(`/r/${tagId}/activate?error=${errMsg}`)
    }

    targetUserId = authData.user.id
  }

  // 2. Establecer vigencia de 1 año (365 días) de suscripción para la placa
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

  // Si no era ya una cuenta de negocio mensual completa, asignarle rol de placa de reseñas
  const { data: currentProfile } = await supabase
    .from('users')
    .select('account_type')
    .eq('id', targetUserId)
    .maybeSingle()

  const finalAccountType = currentProfile?.account_type === 'business' ? 'business' : 'review_plate'

  await supabase
    .from('users')
    .update({
      full_name: fullName || undefined,
      personal_phone: personalPhone || undefined,
      account_type: finalAccountType,
      subscription_expires_at: expiresAt
    })
    .eq('id', targetUserId)

  // 3. Crear o actualizar la placa en la tabla devices
  const { data: existingDevice } = await supabase
    .from('devices')
    .select('id')
    .eq('tag_id', tagId)
    .maybeSingle()

  if (existingDevice) {
    await supabase
      .from('devices')
      .update({
        user_id: targetUserId,
        device_type: 'tap_to_rate',
        redirect_url: directReviewUrl,
        place_id: placeId,
        business_name: businessName,
        business_address: businessAddress,
        business_phone: businessPhone,
        google_types: googleTypes,
        review_filter_enabled: reviewFilter,
        is_active: true
      })
      .eq('id', existingDevice.id)
  } else {
    await supabase
      .from('devices')
      .insert({
        tag_id: tagId,
        user_id: targetUserId,
        device_type: 'tap_to_rate',
        redirect_url: directReviewUrl,
        place_id: placeId,
        business_name: businessName,
        business_address: businessAddress,
        business_phone: businessPhone,
        google_types: googleTypes,
        review_filter_enabled: reviewFilter,
        is_active: true
      })
  }

  // 4. Si la placa pertenecía a un lote de nfc_cards, actualizar su estado a activa
  await supabase
    .from('nfc_cards')
    .update({
      status: 'active',
      claimed_by_user_id: targetUserId,
      claimed_at: new Date().toISOString()
    })
    .eq('card_token', tagId)

  // 5. Sincronizar espacio de trabajo (workspace) con Plan PRO de 365 días
  try {
    await supabase.rpc('admin_set_user_plan', {
      p_user_id: targetUserId,
      p_plan: 'pro',
      p_duration_days: 365
    })
  } catch (wsErr) {
    console.error('Error sincronizando workspace en activación de placa:', wsErr)
    await supabase
      .from('workspaces')
      .upsert({
        id: targetUserId,
        name: businessName || 'Mi Negocio',
        plan: 'pro',
        subscription_expires_at: expiresAt
      })
  }

  // 6. Notificación in-app en la campana
  try {
    await supabase.from('notifications').insert({
      user_id: targetUserId,
      title: '🎉 ¡Tu Placa de Reseñas NFC está Activa!',
      message: `Tu placa física para "${businessName || 'tu negocio'}" quedó configurada con 365 días de servicio PRO y Escudo Anti-Quejas.`,
      type: 'success',
      link: '/dashboard/devices'
    })

    await sendPushNotificationToUser(targetUserId, {
      title: '🎉 ¡Placa de Reseñas NFC Activada!',
      body: `Tu placa para "${businessName || 'tu negocio'}" ya está vinculada con 1 año de membresía PRO.`,
      url: '/dashboard/devices'
    })
  } catch (notifErr) {
    console.error('Error creando notificación de activación:', notifErr)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/devices')
  revalidatePath('/dashboard/admin')
  redirect('/dashboard/devices?success=plate_activated')
}
