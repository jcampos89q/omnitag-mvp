'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sendPushNotificationToUser } from '@/lib/push'

export async function activatePlateAndRegister(formData: FormData) {
  const supabase = await createClient()

  const tagId = (formData.get('tag_id') as string)?.trim()
  const authMode = (formData.get('auth_mode') as string)?.trim() || 'auto' // 'login' | 'register' | 'existing_biz' | 'auto'
  const useExistingBiz = formData.get('use_existing_business') === 'true'
  const existingDeviceId = (formData.get('existing_device_id') as string)?.trim()

  let isNoGooglePlace = formData.get('no_google_place') === 'true'
  let manualBusinessName = (formData.get('manual_business_name') as string)?.trim()
  let manualAddress = (formData.get('manual_business_address') as string)?.trim() || null
  let manualPhone = (formData.get('manual_business_phone') as string)?.trim() || null
  let manualCategory = (formData.get('manual_category') as string)?.trim() || 'Comercio'

  let placeId = isNoGooglePlace ? null : (formData.get('place_id') as string)?.trim()
  let businessName = isNoGooglePlace ? manualBusinessName : (formData.get('business_name') as string)?.trim()
  let businessAddress = isNoGooglePlace ? manualAddress : (formData.get('business_address') as string)?.trim()
  let businessPhone = isNoGooglePlace ? manualPhone : (formData.get('business_phone') as string)?.trim()
  let directReviewUrl = isNoGooglePlace ? null : (formData.get('direct_review_url') as string)?.trim()
  const reviewFilter = formData.get('review_filter') === 'on' || formData.get('review_filter') === 'true'
  const googleTypesRaw = (formData.get('google_types') as string) || '[]'

  let googleTypes: string[] = []
  if (isNoGooglePlace) {
    googleTypes = [manualCategory]
  } else {
    try {
      googleTypes = JSON.parse(googleTypesRaw)
    } catch {
      googleTypes = []
    }
  }

  // Datos personales del cliente
  const fullName = (formData.get('full_name') as string)?.trim()
  const personalPhone = (formData.get('personal_phone') as string)?.trim() // WhatsApp personal
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = (formData.get('password') as string)

  if (!tagId) {
    redirect('/dashboard/devices?error=' + encodeURIComponent('Identificador de placa no especificado'))
  }

  const { data: { user: existingAuthUser } } = await supabase.auth.getUser()
  let targetUserId = existingAuthUser?.id

  // 1. Si no tiene sesión iniciada, iniciar sesión o registrar usuario
  if (!targetUserId) {
    if (!email || !password) {
      redirect(`/r/${encodeURIComponent(tagId)}/activate?error=${encodeURIComponent('Por favor ingresa tu correo y contraseña.')}&email=${encodeURIComponent(email || '')}`)
    }

    if (password.length < 6) {
      redirect(`/r/${encodeURIComponent(tagId)}/activate?error=${encodeURIComponent('La contraseña debe tener al menos 6 caracteres.')}&email=${encodeURIComponent(email || '')}`)
    }

    if (authMode === 'login') {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError || !signInData.user) {
        const errMsg = signInError?.message.includes('Invalid login credentials')
          ? 'Correo o contraseña incorrectos. Por favor verifica tus credenciales.'
          : (signInError?.message || 'Error al iniciar sesión')
        redirect(`/r/${encodeURIComponent(tagId)}/activate?error=${encodeURIComponent(errMsg)}&email=${encodeURIComponent(email)}&auth_mode=login`)
      }
      targetUserId = signInData.user.id
    } else {
      // Intentar registro de cuenta nueva
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

      if (authError) {
        const errorMsgLower = authError.message.toLowerCase()
        const isAlreadyRegistered =
          errorMsgLower.includes('already registered') ||
          errorMsgLower.includes('ya registrado') ||
          errorMsgLower.includes('already exists') ||
          errorMsgLower.includes('ya existe') ||
          (authError as any).status === 422

        if (isAlreadyRegistered) {
          // El usuario ya existe en OmniTag! Iniciar sesión automáticamente con la clave proporcionada
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (signInData?.user) {
            targetUserId = signInData.user.id
          } else {
            redirect(`/r/${encodeURIComponent(tagId)}/activate?error=${encodeURIComponent(
              'Este correo ya está registrado en OmniTag. La contraseña ingresada no coincide. Por favor ingresa tu contraseña correcta para vincular esta placa a tu cuenta.'
            )}&email=${encodeURIComponent(email)}&auth_mode=login`)
          }
        } else {
          redirect(`/r/${encodeURIComponent(tagId)}/activate?error=${encodeURIComponent(authError.message || 'Error al registrar usuario')}&email=${encodeURIComponent(email)}`)
        }
      } else if (authData?.user) {
        targetUserId = authData.user.id
      }
    }
  }

  if (!targetUserId) {
    redirect(`/r/${encodeURIComponent(tagId)}/activate?error=${encodeURIComponent('No se pudo verificar la cuenta de usuario.')}`)
  }

  // 2. Si el usuario seleccionó vincular a un negocio existente (o no completó Google Maps porque ya tiene negocio registrado):
  if (useExistingBiz || (!businessName && !placeId)) {
    let srcQuery = supabase
      .from('devices')
      .select('*')
      .eq('user_id', targetUserId)

    if (existingDeviceId) {
      srcQuery = srcQuery.eq('id', existingDeviceId)
    } else {
      srcQuery = srcQuery.not('business_name', 'is', null).order('created_at', { ascending: false }).limit(1)
    }

    const { data: existingBizDev } = await srcQuery.maybeSingle()

    if (existingBizDev) {
      businessName = businessName || existingBizDev.business_name
      placeId = placeId || existingBizDev.place_id
      directReviewUrl = directReviewUrl || existingBizDev.redirect_url
      businessAddress = businessAddress || existingBizDev.business_address
      businessPhone = businessPhone || existingBizDev.business_phone
      googleTypes = (googleTypes && googleTypes.length > 0) ? googleTypes : (Array.isArray(existingBizDev.google_types) ? existingBizDev.google_types : [])
      isNoGooglePlace = isNoGooglePlace || (!existingBizDev.place_id && !existingBizDev.redirect_url)
    }
  }

  // Validación de datos del negocio
  if (isNoGooglePlace) {
    if (!manualBusinessName && !businessName) {
      redirect(`/r/${encodeURIComponent(tagId)}/activate?error=${encodeURIComponent('Por favor ingresa el nombre de tu negocio')}`)
    }
    if (!businessName) businessName = manualBusinessName
  } else {
    if (!placeId || !directReviewUrl) {
      redirect(`/r/${encodeURIComponent(tagId)}/activate?error=${encodeURIComponent('Faltan datos del negocio en Google Maps. Por favor selecciona tu negocio.')}`)
    }
  }

  // 3. Establecer vigencia de 1 año (365 días) para la placa y 30 días de prueba PRO con todas las funciones
  const hwExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  const trialExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  // Si no era ya una cuenta de negocio mensual completa, asignarle rol de placa de reseñas
  const { data: currentProfile } = await supabase
    .from('users')
    .select('account_type, hardware_type, hardware_expires_at, trial_expires_at, full_name, personal_phone')
    .eq('id', targetUserId)
    .maybeSingle()

  const finalAccountType = currentProfile?.account_type === 'business' ? 'business' : 'review_plate'
  const combinedHw = (currentProfile?.hardware_type && currentProfile.hardware_type !== 'review_plate') ? 'both' : 'review_plate'

  // Preservar la fecha de hardware más lejana si ya tenía vigencia extendida
  let finalHwExpiry = hwExpiresAt
  if (currentProfile?.hardware_expires_at) {
    const existingDate = new Date(currentProfile.hardware_expires_at)
    if (existingDate > new Date(hwExpiresAt)) {
      finalHwExpiry = currentProfile.hardware_expires_at
    }
  }

  await supabase
    .from('users')
    .update({
      full_name: fullName || currentProfile?.full_name || undefined,
      personal_phone: personalPhone || currentProfile?.personal_phone || undefined,
      account_type: finalAccountType,
      hardware_expires_at: finalHwExpiry,
      hardware_type: combinedHw,
      trial_expires_at: currentProfile?.trial_expires_at || trialExpiresAt,
      subscription_expires_at: trialExpiresAt
    })
    .eq('id', targetUserId)

  // 4. Crear o actualizar la placa en la tabla devices
  const { data: existingDevice } = await supabase
    .from('devices')
    .select('id, user_id')
    .or(`tag_id.eq.${tagId},tag_id.eq.${encodeURIComponent(tagId)},tag_id.ilike.${tagId}`)
    .maybeSingle()

  if (existingDevice) {
    await supabase
      .from('devices')
      .update({
        user_id: targetUserId,
        device_type: 'tap_to_rate',
        redirect_url: directReviewUrl || null,
        place_id: placeId || null,
        business_name: businessName,
        business_address: businessAddress,
        business_phone: businessPhone,
        google_types: googleTypes,
        review_filter_enabled: reviewFilter,
        is_active: isNoGooglePlace ? false : true
      })
      .eq('id', existingDevice.id)
  } else {
    await supabase
      .from('devices')
      .insert({
        tag_id: tagId,
        user_id: targetUserId,
        device_type: 'tap_to_rate',
        redirect_url: directReviewUrl || null,
        place_id: placeId || null,
        business_name: businessName,
        business_address: businessAddress,
        business_phone: businessPhone,
        google_types: googleTypes,
        review_filter_enabled: reviewFilter,
        is_active: isNoGooglePlace ? false : true
      })
  }

  // 5. Si la placa pertenecía a un lote de nfc_cards, actualizar su estado a activa
  await supabase
    .from('nfc_cards')
    .update({
      status: 'active',
      claimed_by_user_id: targetUserId,
      claimed_at: new Date().toISOString()
    })
    .or(`card_token.eq.${tagId},card_token.ilike.${tagId}`)

  // 6. Sincronizar espacio de trabajo (workspace) con Plan PRO
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
        subscription_expires_at: finalHwExpiry
      })
  }

  // 7. Notificación in-app en la campana
  try {
    if (isNoGooglePlace) {
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        title: '⏳ Placa Registrada: En Espera de Verificación de Google',
        message: `Tu placa física para "${businessName || 'tu negocio'}" quedó vinculada con 365 días de garantía. Recuerda no colocarla en tu mostrador todavía hasta que Google verifique tu local comercial.`,
        type: 'warning',
        link: '/dashboard/google-business'
      })

      await sendPushNotificationToUser(targetUserId, {
        title: '⏳ Placa en Espera de Aprobación de Google',
        body: `Tu placa para "${businessName || 'tu negocio'}" está registrada. Recuerda no colocarla en tu mostrador todavía hasta que Google apruebe tu local.`,
        url: '/dashboard/google-business'
      })
    } else {
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
    }
  } catch (notifErr) {
    console.error('Error creando notificación de activación:', notifErr)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/devices')
  revalidatePath('/dashboard/google-business')
  revalidatePath('/dashboard/admin')

  if (isNoGooglePlace) {
    redirect('/dashboard/google-business?pending_plate=' + encodeURIComponent(tagId))
  } else {
    redirect('/dashboard/devices?success=plate_activated')
  }
}
