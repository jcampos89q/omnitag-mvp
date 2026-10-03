'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushNotificationToUser } from '@/lib/push'

function isValidUUID(str: string | null | undefined): boolean {
  if (!str) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str.trim())
}

export async function saveLead(formData: FormData) {
  const supabase = await createClient()
  
  const vcardId = (formData.get('vcard_id') as string)?.trim()
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim()
  const notes = (formData.get('notes') as string)?.trim() || null
  const category = (formData.get('category') as string)?.trim() || null

  if ((!vcardId && !slug) || !name) {
    return { success: false, error: 'Nombre y vCard requeridos' }
  }

  // Obtener primero la vCard para conocer al dueño de forma ultra-segura
  let targetUserId: string | null = null
  let actualVcardId: string | null = null

  if (vcardId && isValidUUID(vcardId)) {
    const { data: vcard } = await supabase
      .from('vcards')
      .select('id, user_id')
      .eq('id', vcardId)
      .maybeSingle()
    if (vcard?.user_id) {
      targetUserId = vcard.user_id
      actualVcardId = vcard.id
    }
  }

  if (!targetUserId && slug) {
    const { data: vcardBySlug } = await supabase
      .from('vcards')
      .select('id, user_id')
      .eq('slug', slug)
      .maybeSingle()
    if (vcardBySlug?.user_id) {
      targetUserId = vcardBySlug.user_id
      actualVcardId = vcardBySlug.id
    }
  }

  // Guardar en leads sin .select().single() para evitar violación de RLS por consulta de retorno de rol anónimo
  const { error } = await supabase.from('leads').insert({
    vcard_id: isValidUUID(actualVcardId) ? actualVcardId : null,
    user_id: targetUserId,
    name,
    email: email || null,
    phone: phone || null,
    source: 'vcard',
    status: 'lead',
    notes,
    category
  })

  if (error) {
    console.error('Error guardando lead en base de datos:', error)
    return { success: false, error: error.message }
  }

  // Enviar notificación interna y Notificación Push Flotante al celular del usuario
  try {
    if (targetUserId) {
      // 1. Guardar en base de datos
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        title: '👤 ¡Nuevo Contacto Capturado!',
        message: `${name}${phone ? ` (${phone})` : ''} ha guardado tu vCard y te ha compartido sus datos.`,
        type: 'success',
        link: '/dashboard/leads'
      })

      // 2. Disparar Push Flotante al sistema operativo / celular bloqueado
      await sendPushNotificationToUser(targetUserId, {
        title: '👤 ¡Nuevo Contacto Capturado en OmniTag!',
        body: `${name}${phone ? ` (${phone})` : ''} te ha dejado sus datos de contacto. Toca para verlos.`,
        url: '/dashboard/leads'
      })
    }
  } catch (notifErr) {
    console.error('Error enviando notificacion de lead:', notifErr)
  }

  if (slug) {
    revalidatePath(`/v/${slug}`)
  }
  revalidatePath('/dashboard/leads')
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/analytics')

  return { success: true }
}
