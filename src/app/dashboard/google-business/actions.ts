'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'

/**
 * Activa o desactiva el Escudo Anti-Quejas para un dispositivo del usuario
 */
export async function toggleShieldFilter(deviceId: string, enabled: boolean) {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('devices')
    .update({ 
      review_filter_enabled: enabled,
      redirect_url: enabled ? undefined : undefined // Mantiene el link original
    })
    .eq('id', deviceId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error toggling review filter:', error)
    throw new Error('No se pudo actualizar el escudo anti-quejas: ' + error.message)
  }

  revalidatePath('/dashboard/google-business')
  revalidatePath('/dashboard/devices')
  revalidatePath('/dashboard/feedback')
  return { success: true, enabled }
}

/**
 * Crea o asegura un enlace de Escudo Anti-Quejas para un negocio que aún no tiene placa NFC registrada
 */
export async function createShieldLink(placeId: string, businessName: string, directReviewUrl?: string) {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)
  if (!user) throw new Error('No autenticado')

  const tagId = Math.random().toString(36).substring(2, 8).toUpperCase()
  const redirectUrl = directReviewUrl || `https://search.google.com/local/writereview?placeid=${placeId}`

  const { data, error } = await supabase
    .from('devices')
    .insert({
      user_id: user.id,
      device_type: 'tap_to_rate',
      business_name: businessName,
      place_id: placeId,
      redirect_url: redirectUrl,
      tag_id: tagId,
      review_filter_enabled: true,
      is_active: true
    })
    .select('*')
    .single()

  if (error) {
    console.error('Error creating shield device:', error)
    throw new Error('Error al generar tu enlace de escudo: ' + error.message)
  }

  revalidatePath('/dashboard/google-business')
  revalidatePath('/dashboard/devices')
  return { success: true, device: data }
}

/**
 * Marca una queja privada como resuelta con notas de atención al cliente
 */
export async function resolvePrivateFeedback(feedbackId: string, resolutionNotes?: string) {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('private_feedbacks')
    .update({
      status: 'resolved',
      resolution_notes: resolutionNotes?.trim() || 'Cliente contactado y atendido vía WhatsApp.',
    })
    .eq('id', feedbackId)

  if (error) {
    console.error('Error resolving feedback:', error)
    throw new Error('Error al actualizar el estado de la queja.')
  }

  revalidatePath('/dashboard/google-business')
  revalidatePath('/dashboard/feedback')
  return { success: true }
}

/**
 * Genera una descripción comercial optimizada con palabras clave de SEO local
 */
export async function generateLocalSeoDescription(params: {
  businessName: string
  category: string
  city: string
  highlightServices: string
  targetKeywords?: string
}) {
  const { businessName, category, city, highlightServices, targetKeywords } = params

  const description = `¡Bienvenidos a ${businessName}! Somos el ${category || 'establecimiento'} de referencia en ${city || 'nuestra ciudad'}, dedicados a ofrecerte la mejor experiencia con los más altos estándares de calidad y calidez.\n\nEspecialistas en: ${highlightServices || 'atención personalizada, servicios premium y productos garantizados'}. ${targetKeywords ? `Tu mejor opción en ${targetKeywords}.` : ''}\n\n📍 Visítanos para vivir una experiencia inigualable o contáctanos por WhatsApp para consultas, cotizaciones y citas. ¡Será un honor atenderte!`

  return { success: true, description }
}

/**
 * Desconecta la cuenta de Google Business Profile vinculada
 */
export async function disconnectGoogleBusiness() {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('google_business_connections')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    console.error('Error disconnecting Google Business:', error)
    throw new Error('Error al desconectar la cuenta de Google.')
  }

  revalidatePath('/dashboard/google-business')
  return { success: true }
}

/**
 * Obtiene un Access Token fresco (renovando si expiró)
 */
async function getFreshAccessToken(connection: any, supabase: any) {
  const isExpired = !connection.expires_at || new Date(connection.expires_at).getTime() <= Date.now() + 60000
  if (!isExpired) return connection.access_token

  if (!connection.refresh_token) {
    throw new Error('Sesión de Google expirada. Por favor vuelve a conectar tu cuenta de Google.')
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('Credenciales de Google OAuth no configuradas en el servidor.')
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: connection.refresh_token,
      grant_type: 'refresh_token'
    })
  })

  const data = await res.json()
  if (!res.ok || !data.access_token) {
    throw new Error('No se pudo renovar el token de Google: ' + (data.error_description || data.error || 'Error desconocido'))
  }

  const expiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString()
  await supabase
    .from('google_business_connections')
    .update({
      access_token: data.access_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString()
    })
    .eq('id', connection.id)

  return data.access_token
}

/**
 * Asegura que se tengan el Account ID y Location ID de Google Business
 */
async function resolveAccountAndLocation(connection: any, accessToken: string, supabase: any) {
  let accountId = connection.account_id
  let locationId = connection.location_id
  let businessName = connection.business_name

  if (!accountId || !locationId) {
    try {
      const accRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (accRes.ok) {
        const accData = await accRes.json()
        const primaryAccount = accData.accounts?.[0]
        if (primaryAccount?.name) {
          accountId = primaryAccount.name
          const locRes = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${primaryAccount.name}/locations?readMask=name,title,storefrontAddress`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          if (locRes.ok) {
            const locData = await locRes.json()
            const primaryLocation = locData.locations?.[0]
            if (primaryLocation?.name) {
              locationId = primaryLocation.name
              businessName = primaryLocation.title || businessName
            }
          }
        }

        if (accountId || locationId) {
          await supabase
            .from('google_business_connections')
            .update({
              account_id: accountId || null,
              location_id: locationId || null,
              business_name: businessName || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', connection.id)
        }
      }
    } catch (e) {
      console.warn('Error resolving Google Business account/location:', e)
    }
  }

  return { accountId, locationId, businessName }
}

/**
 * Publica una respuesta oficial directamente en Google Maps
 */
export async function publishReviewReplyDirect(reviewName: string, replyComment: string) {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)
  if (!user) throw new Error('No autenticado')

  const { data: connection } = await supabase
    .from('google_business_connections')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!connection) {
    return {
      success: false,
      requiresAuth: true,
      message: 'Debes conectar tu cuenta de Google Business oficial para publicar directamente.'
    }
  }

  try {
    const accessToken = await getFreshAccessToken(connection, supabase)
    const { accountId, locationId } = await resolveAccountAndLocation(connection, accessToken, supabase)

    const cleanAccount = accountId ? (accountId.startsWith('accounts/') ? accountId : `accounts/${accountId}`) : 'accounts/_'
    const cleanLocation = locationId ? (locationId.startsWith('locations/') ? locationId : `locations/${locationId}`) : 'locations/_'

    // Formato de reviewName: reviews/{reviewId} o sólo reviewId
    const cleanReview = reviewName.includes('reviews/') ? reviewName.split('reviews/')[1] : reviewName
    const url = `https://mybusiness.googleapis.com/v4/${cleanAccount}/${cleanLocation}/reviews/${cleanReview}/reply`

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ comment: replyComment })
    })

    const result = await response.json()

    if (!response.ok) {
      const errText = result.error?.message || ''
      if (response.status === 403 || result.error?.status === 'PERMISSION_DENIED') {
        if (errText.includes('insufficient authentication scopes') || !connection.scope?.includes('business.manage')) {
          return {
            success: false,
            needsReauth: true,
            message: 'Tu cuenta de Google no tiene autorizados los permisos de gestión comercial. Por favor desvincula tu cuenta y vuelve a conectarla marcando la casilla de permisos en Google.'
          }
        }
        return {
          success: false,
          needsPartnerApproval: true,
          message: 'Tu cuenta de Google está vinculada. Sin embargo, tu proyecto en Google Cloud requiere habilitar la Google Business Profile API para publicar directamente por API. Mientras tanto, puedes usar el botón de Copiar para publicar.'
        }
      }
      return {
        success: false,
        message: errText || 'Google rechazó la publicación de la respuesta.'
      }
    }

    revalidatePath('/dashboard/google-business')
    return { success: true, reply: result }
  } catch (err: any) {
    console.error('Error publishing review reply:', err)
    return { success: false, message: err.message || 'Error de conexión con Google' }
  }
}

/**
 * Publica una novedad (Google Post) directamente en Google Maps
 */
export async function publishGooglePostDirect(summary: string, actionUrl?: string) {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)
  if (!user) throw new Error('No autenticado')

  const { data: connection } = await supabase
    .from('google_business_connections')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!connection) {
    return {
      success: false,
      requiresAuth: true,
      message: 'Debes conectar tu cuenta de Google Business oficial para publicar directamente.'
    }
  }

  try {
    const accessToken = await getFreshAccessToken(connection, supabase)
    const { accountId, locationId } = await resolveAccountAndLocation(connection, accessToken, supabase)

    const cleanAccount = accountId ? (accountId.startsWith('accounts/') ? accountId : `accounts/${accountId}`) : 'accounts/_'
    const cleanLocation = locationId ? (locationId.startsWith('locations/') ? locationId : `locations/${locationId}`) : 'locations/_'

    // Formato de post en Google Business Profile API
    const url = `https://mybusiness.googleapis.com/v4/${cleanAccount}/${cleanLocation}/localPosts`
    const postBody: any = {
      languageCode: 'es',
      summary,
      topicType: 'STANDARD'
    }

    if (actionUrl) {
      postBody.callToAction = {
        actionType: 'LEARN_MORE',
        url: actionUrl
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postBody)
    })

    const result = await response.json()

    if (!response.ok) {
      const errText = result.error?.message || ''
      if (response.status === 403 || result.error?.status === 'PERMISSION_DENIED') {
        if (errText.includes('insufficient authentication scopes') || !connection.scope?.includes('business.manage')) {
          return {
            success: false,
            needsReauth: true,
            message: 'Tu cuenta de Google fue conectada sin los permisos de administración comercial. Por favor desvincula tu cuenta en la pestaña de Conexión API y vuelve a conectar ASEGURÁNDOTE de marcar la casilla de permisos en Google.'
          }
        }
        return {
          success: false,
          needsPartnerApproval: true,
          message: 'Tu cuenta de Google está conectada. Para publicar novedades directamente por API, tu proyecto de Google Cloud requiere la aprobación del acceso a la Google Business Profile API. Mientras tanto, puedes copiar el texto con 1 clic.'
        }
      }
      return {
        success: false,
        message: errText || 'Error al enviar la publicación a Google.'
      }
    }

    revalidatePath('/dashboard/google-business')
    return { success: true, post: result }
  } catch (err: any) {
    console.error('Error publishing Google Post:', err)
    return { success: false, message: err.message || 'Error de conexión con Google' }
  }
}

/**
 * Activa una placa NFC que estaba en espera de aprobación de Google Maps
 */
export async function activatePendingPlateWithGoogle(
  deviceId: string,
  placeId: string,
  directReviewUrl: string,
  businessName: string,
  businessAddress?: string,
  businessPhone?: string,
  googleTypes: string[] = []
) {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)
  if (!user) throw new Error('No autenticado')

  const { data: updatedDevice, error } = await supabase
    .from('devices')
    .update({
      place_id: placeId,
      redirect_url: directReviewUrl,
      business_name: businessName,
      business_address: businessAddress || null,
      business_phone: businessPhone || null,
      google_types: googleTypes,
      is_active: true
    })
    .eq('id', deviceId)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) {
    console.error('Error activating pending plate:', error)
    throw new Error('Error al activar la placa: ' + error.message)
  }

  // Notificación in-app
  try {
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: '🚀 ¡Tu Placa Física ya está Activa y Lista para el Mostrador!',
      message: `Tu negocio "${businessName}" fue vinculado exitosamente con Google Maps. Tu placa física ya está lista para colocar en el mostrador.`,
      type: 'success',
      link: '/dashboard/devices'
    })
  } catch (notifErr) {
    console.error('Error creating notification:', notifErr)
  }

  revalidatePath('/dashboard/google-business')
  revalidatePath('/dashboard/devices')
  return { success: true, device: updatedDevice }
}
