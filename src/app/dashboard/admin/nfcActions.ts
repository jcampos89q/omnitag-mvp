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
  const batchName = (formData.get('batch_name') as string)?.trim() || 'Lote de Tarjetas NFC'
  const count = Math.min(Math.max(parseInt((formData.get('card_count') as string) || '10', 10), 1), 500)
  const planDays = parseInt((formData.get('plan_days') as string) || '365', 10)
  const tokenPrefix = (formData.get('token_prefix') as string)?.trim().toUpperCase() || 'NFC'
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

  const { error } = await supabase
    .from('nfc_batches')
    .delete()
    .eq('id', batchId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin')
  return { success: true }
}

/**
 * Cambia el estado de una tarjeta (ej. deshabilitar si se extravió o dañó)
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

  const newStatus = currentStatus === 'disabled' ? 'unclaimed' : 'disabled'

  const { error } = await supabase
    .from('nfc_cards')
    .update({ status: newStatus })
    .eq('id', cardId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin')
  return { success: true, newStatus }
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
  const expiresAt = new Date(Date.now() + planDays * 24 * 60 * 60 * 1000).toISOString()

  // 1. Asignar tarjeta al usuario
  await supabase
    .from('nfc_cards')
    .update({
      status: 'active',
      claimed_by_user_id: userId,
      claimed_at: new Date().toISOString()
    })
    .eq('id', cardId)

  // 2. Extender membresía del usuario por 1 año PRO
  await supabase
    .from('users')
    .update({
      subscription_expires_at: expiresAt,
      plan_status: 'pro_annual'
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
    .select('*')
    .eq('card_token', cleanToken)
    .maybeSingle()

  if (!card) throw new Error('El código de tarjeta no existe en el sistema')
  if (card.status === 'active') throw new Error('Esta tarjeta ya fue activada por otro usuario')
  if (card.status === 'disabled') throw new Error('Esta tarjeta está deshabilitada')

  const planDays = card.plan_duration_days || 365
  const expiresAt = new Date(Date.now() + planDays * 24 * 60 * 60 * 1000).toISOString()

  await supabase
    .from('nfc_cards')
    .update({
      status: 'active',
      claimed_by_user_id: user.id,
      claimed_at: new Date().toISOString()
    })
    .eq('id', card.id)

  await supabase
    .from('users')
    .update({
      subscription_expires_at: expiresAt,
      plan_status: 'pro_annual'
    })
    .eq('id', user.id)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/billing')
  revalidatePath('/dashboard/vcard')
  return { success: true, expiresAt }
}
