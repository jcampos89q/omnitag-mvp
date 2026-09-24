'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper para generar tokens legibles y únicos (ej. NFC-7X9K2B)
function generateSecureToken(prefix = 'NFC', length = 6): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // Sin caracteres confusos (0, O, 1, I)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${prefix}-${result}`
}

/**
 * Crea un lote nuevo de tarjetas NFC con tokens únicos y estilo de QR personalizado
 */
export async function createNfcBatch(formData: FormData) {
  const supabase = await createClient()

  // 1. Validar que el usuario sea Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('No autorizado')

  // 2. Extraer parámetros del lote
  const batchType = (formData.get('batch_type') as string)?.trim() || 'vcard'
  const isReviewPlate = batchType === 'review_plate'
  const defaultBatchName = isReviewPlate ? 'Lote de Placas Reseñas Google' : 'Lote de Tarjetas NFC'
  const defaultPrefix = isReviewPlate ? 'REV' : 'NFC'

  const batchName = (formData.get('batch_name') as string)?.trim() || defaultBatchName
  const count = Math.min(Math.max(parseInt((formData.get('card_count') as string) || '10', 10), 1), 500)
  const planDays = parseInt((formData.get('plan_days') as string) || '365', 10)
  const tokenPrefix = (formData.get('token_prefix') as string)?.trim().toUpperCase() || defaultPrefix
  const qrStyleJson = (formData.get('qr_style') as string) || '{}'

  let parsedQrStyle = {}
  try {
    parsedQrStyle = JSON.parse(qrStyleJson)
  } catch {
    parsedQrStyle = {}
  }

  // 3. Crear el registro del lote
  const { data: batch, error: batchError } = await supabase
    .from('nfc_batches')
    .insert({
      batch_name: batchName,
      total_cards: count,
      qr_style: parsedQrStyle,
      batch_type: batchType,
    })
    .select()
    .single()

  if (batchError || !batch) {
    throw new Error(batchError?.message || 'Error al crear el lote')
  }

  // 4. Generar tokens únicos e insertar tarjetas
  const cardsToInsert = []
  const generatedTokens = new Set<string>()

  while (cardsToInsert.length < count) {
    const token = generateSecureToken(tokenPrefix, 6)
    if (!generatedTokens.has(token)) {
      generatedTokens.add(token)
      cardsToInsert.push({
        batch_id: batch.id,
        card_token: token,
        status: 'unclaimed',
        plan_duration_days: planDays,
      })
    }
  }

  const { error: cardsError } = await supabase
    .from('nfc_cards')
    .insert(cardsToInsert)

  if (cardsError) {
    // Si falla la inserción masiva, eliminar el lote huérfano
    await supabase.from('nfc_batches').delete().eq('id', batch.id)
    throw new Error(cardsError.message)
  }

  // 5. Si es un lote de placas de reseñas, pre-registrar en devices para activación inmediata
  if (isReviewPlate) {
    const devicesToInsert = cardsToInsert.map(c => ({
      tag_id: c.card_token,
      device_type: 'tap_to_rate',
      review_filter_enabled: true,
      is_active: false
    }))
    // Usar upsert o insert para evitar duplicados si algún token ya existiera
    await supabase
      .from('devices')
      .upsert(devicesToInsert, { onConflict: 'tag_id' })
  }

  revalidatePath('/dashboard/admin')
  return { success: true, batchId: batch.id, count }
}

/**
 * Elimina un lote y todas sus tarjetas asociadas
 */
export async function deleteNfcBatch(batchId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('No autorizado')

  // Obtener tarjetas del lote para limpiar dispositivos no activados
  const { data: batchCards } = await supabase
    .from('nfc_cards')
    .select('card_token')
    .eq('batch_id', batchId)

  if (batchCards && batchCards.length > 0) {
    const tokens = batchCards.map(c => c.card_token)
    await supabase
      .from('devices')
      .delete()
      .in('tag_id', tokens)
      .eq('is_active', false)
  }

  const { error } = await supabase
    .from('nfc_batches')
    .delete()
    .eq('id', batchId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin')
  return { success: true }
}

/**
 * Conmuta el estado activo / pausado de un lote completo
 * Si se pausa, desactiva todas sus tarjetas y dispositivos para evitar uso no autorizado.
 */
export async function toggleNfcBatchActive(batchId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('No autorizado')

  const { data: batch } = await supabase
    .from('nfc_batches')
    .select('id, is_active')
    .eq('id', batchId)
    .single()

  if (!batch) throw new Error('Lote no encontrado')

  const newIsActive = batch.is_active === false ? true : false

  // 1. Actualizar el lote
  await supabase
    .from('nfc_batches')
    .update({ is_active: newIsActive })
    .eq('id', batchId)

  // 2. Obtener todas las tarjetas del lote
  const { data: cards } = await supabase
    .from('nfc_cards')
    .select('id, card_token, claimed_by_user_id')
    .eq('batch_id', batchId)

  if (cards && cards.length > 0) {
    const tokens = cards.map(c => c.card_token)

    if (!newIsActive) {
      // Al pausar el lote: marcar tarjetas como disabled y dispositivos como is_active = false
      await supabase
        .from('nfc_cards')
        .update({ status: 'disabled' })
        .eq('batch_id', batchId)

      await supabase
        .from('devices')
        .update({ is_active: false })
        .in('tag_id', tokens)
    } else {
      // Al reactivar el lote: restaurar tarjetas y dispositivos
      const claimedCards = cards.filter(c => c.claimed_by_user_id)
      const unclaimedCards = cards.filter(c => !c.claimed_by_user_id)

      if (claimedCards.length > 0) {
        await supabase
          .from('nfc_cards')
          .update({ status: 'active' })
          .in('id', claimedCards.map(c => c.id))

        await supabase
          .from('devices')
          .update({ is_active: true })
          .in('tag_id', claimedCards.map(c => c.card_token))
      }

      if (unclaimedCards.length > 0) {
        await supabase
          .from('nfc_cards')
          .update({ status: 'unclaimed' })
          .in('id', unclaimedCards.map(c => c.id))
      }
    }
  }

  revalidatePath('/dashboard/admin')
  return { success: true, isActive: newIsActive }
}

/**
 * Conmuta el archivado de un lote para ocultarlo o mostrarlo sin destruirlo
 */
export async function archiveNfcBatch(batchId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('No autorizado')

  const { data: batch } = await supabase
    .from('nfc_batches')
    .select('id, is_archived')
    .eq('id', batchId)
    .single()

  if (!batch) throw new Error('Lote no encontrado')

  const newIsArchived = !Boolean(batch.is_archived)

  const { error } = await supabase
    .from('nfc_batches')
    .update({ is_archived: newIsArchived })
    .eq('id', batchId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin')
  return { success: true, isArchived: newIsArchived }
}

/**
 * Cambia el estado de una tarjeta o placa individual (bloquear por extravío / reactivar)
 * Sincroniza inmediatamente con la tabla devices para bloquear el escaneo en vivo.
 */
export async function toggleNfcCardStatus(cardId: string, currentStatus: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('No autorizado')

  const { data: card } = await supabase
    .from('nfc_cards')
    .select('id, card_token, claimed_by_user_id')
    .eq('id', cardId)
    .single()

  if (!card) throw new Error('Tarjeta no encontrada')

  let newStatus: string
  if (currentStatus === 'disabled') {
    newStatus = card.claimed_by_user_id ? 'active' : 'unclaimed'
    // Si tenía dispositivo activo, rehabilitarlo
    if (card.claimed_by_user_id) {
      await supabase
        .from('devices')
        .update({ is_active: true })
        .eq('tag_id', card.card_token)
    }
  } else {
    newStatus = 'disabled'
    // Suspender el dispositivo físico
    await supabase
      .from('devices')
      .update({ is_active: false })
      .eq('tag_id', card.card_token)
  }

  const { error } = await supabase
    .from('nfc_cards')
    .update({ status: newStatus })
    .eq('id', cardId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin')
  return { success: true, newStatus }
}

/**
 * Desvincula a un usuario de una tarjeta/placa NFC reclamada (ej. si fue activada sin permiso o robada)
 * Resetea el hardware a estado disponible y cancela la vinculación no autorizada.
 */
export async function unlinkNfcCardUser(cardId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('No autorizado')

  const { data: card } = await supabase
    .from('nfc_cards')
    .select('id, card_token')
    .eq('id', cardId)
    .single()

  if (!card) throw new Error('Tarjeta no encontrada')

  // 1. Resetear la tarjeta a disponible
  await supabase
    .from('nfc_cards')
    .update({
      status: 'unclaimed',
      claimed_by_user_id: null,
      claimed_at: null
    })
    .eq('id', cardId)

  // 2. Limpiar el hardware en devices
  await supabase
    .from('devices')
    .update({
      user_id: null,
      redirect_url: null,
      place_id: null,
      business_name: null,
      business_address: null,
      business_phone: null,
      is_active: false
    })
    .eq('tag_id', card.card_token)

  revalidatePath('/dashboard/admin')
  return { success: true }
}

/**
 * Asigna manualmente una tarjeta de un lote a un usuario existente desde el Panel Admin
 */
export async function assignNfcCardToUser(cardId: string, userId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('No autorizado')

  const { data: card } = await supabase
    .from('nfc_cards')
    .select('*')
    .eq('id', cardId)
    .single()

  if (!card) throw new Error('Tarjeta no encontrada')

  const planDays = card.plan_duration_days || 365
  const hwExpiresAt = new Date(Date.now() + planDays * 24 * 60 * 60 * 1000).toISOString()
  const trialExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  // 1. Asignar tarjeta al usuario
  await supabase
    .from('nfc_cards')
    .update({
      status: 'active',
      claimed_by_user_id: userId,
      claimed_at: new Date().toISOString()
    })
    .eq('id', cardId)

  const { data: userRow } = await supabase
    .from('users')
    .select('hardware_type, trial_expires_at')
    .eq('id', userId)
    .maybeSingle()

  const isPlate = (card as any)?.batch_type === 'review_plate'
  const newHw = isPlate ? 'review_plate' : 'vcard'
  const combinedHw = (userRow?.hardware_type && userRow.hardware_type !== newHw) ? 'both' : newHw

  // 2. 1 año de hardware + 30 días de prueba PRO completa
  await supabase
    .from('users')
    .update({
      hardware_expires_at: hwExpiresAt,
      hardware_type: combinedHw,
      trial_expires_at: userRow?.trial_expires_at || trialExpiresAt,
      subscription_expires_at: trialExpiresAt
    })
    .eq('id', userId)

  revalidatePath('/dashboard/admin')
  return { success: true }
}

/**
 * Permite a un usuario existente canjear un código de tarjeta NFC directamente desde su panel
 */
export async function claimNfcCardByToken(cardToken: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Debes iniciar sesión para canjear tu tarjeta')

  const cleanToken = cardToken.trim().toUpperCase()

  const { data: card } = await supabase
    .from('nfc_cards')
    .select('*, nfc_batches(batch_type)')
    .eq('card_token', cleanToken)
    .maybeSingle()

  if (!card) throw new Error('El código de tarjeta no existe en el sistema')
  if (card.status === 'active') throw new Error('Esta tarjeta ya fue activada por otro usuario')
  if (card.status === 'disabled') throw new Error('Esta tarjeta está deshabilitada')

  const planDays = card.plan_duration_days || 365
  const hwExpiresAt = new Date(Date.now() + planDays * 24 * 60 * 60 * 1000).toISOString()
  const trialExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const isPlate = (card.nfc_batches as any)?.batch_type === 'review_plate'
  const newHw = isPlate ? 'review_plate' : 'vcard'

  await supabase
    .from('nfc_cards')
    .update({
      status: 'active',
      claimed_by_user_id: user.id,
      claimed_at: new Date().toISOString()
    })
    .eq('id', card.id)

  const { data: userRow } = await supabase
    .from('users')
    .select('hardware_type, trial_expires_at')
    .eq('id', user.id)
    .maybeSingle()

  const combinedHw = (userRow?.hardware_type && userRow.hardware_type !== newHw) ? 'both' : newHw

  await supabase
    .from('users')
    .update({
      hardware_expires_at: hwExpiresAt,
      hardware_type: combinedHw,
      trial_expires_at: userRow?.trial_expires_at || trialExpiresAt,
      subscription_expires_at: trialExpiresAt
    })
    .eq('id', user.id)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/billing')
  revalidatePath('/dashboard/vcard')
  return { success: true, expiresAt }
}
