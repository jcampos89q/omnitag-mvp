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
      name: `Escudo Anti-Quejas - ${businessName || 'Mi Negocio'}`,
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
