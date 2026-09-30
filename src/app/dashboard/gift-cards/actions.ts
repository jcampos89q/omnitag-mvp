'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'
import { createGoogleWalletGiftCardPass } from '@/lib/googleWallet'

// Generar código único para la tarjeta (ej. SPA-7K29 o GC-8492)
function generateUniqueCode(prefix: string = 'GC'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // Sin caracteres confusos (0, O, 1, I)
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${prefix}-${code}`
}

// Generar PIN de seguridad de 4 dígitos
function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function createGiftCard(formData: FormData) {
  const supabase = await createClient()
  const { user: effectiveUser } = await getEffectiveUser(supabase)
  if (!effectiveUser) throw new Error('No autorizado. Debes iniciar sesión.')

  // Obtener moneda del usuario
  const { data: userProfile } = await supabase
    .from('users')
    .select('currency, currency_symbol')
    .eq('id', effectiveUser.id)
    .maybeSingle()

  const currency = userProfile?.currency || 'HNL'
  const currencySymbol = userProfile?.currency_symbol || 'L.'

  const cardType = (formData.get('card_type') as string) || 'amount' // 'amount' | 'service'
  const title = (formData.get('title') as string)?.trim() || (cardType === 'service' ? 'Certificado de Servicio' : 'Tarjeta de Regalo')
  const serviceName = (formData.get('service_name') as string)?.trim() || null
  const amountRaw = parseFloat(formData.get('amount') as string) || 0
  const initialAmount = cardType === 'service' ? (amountRaw || 0) : Math.max(0, amountRaw)
  
  const recipientName = (formData.get('recipient_name') as string)?.trim()
  if (!recipientName) throw new Error('El nombre de la persona que recibe el regalo es obligatorio.')
  
  const recipientPhone = (formData.get('recipient_phone') as string)?.trim() || null
  const recipientEmail = (formData.get('recipient_email') as string)?.trim() || null
  const buyerName = (formData.get('buyer_name') as string)?.trim() || 'Un ser querido'
  const buyerPhone = (formData.get('buyer_phone') as string)?.trim() || null
  const buyerEmail = (formData.get('buyer_email') as string)?.trim() || null
  const giftMessage = (formData.get('gift_message') as string)?.trim() || null
  const themeColor = (formData.get('theme_color') as string) || '#ec4899'
  const logoUrl = (formData.get('logo_url') as string)?.trim() || null
  const cardImageUrl = (formData.get('card_image_url') as string)?.trim() || null
  const requirePin = formData.get('require_pin') === 'true' || formData.get('require_pin') === 'on'
  
  // Expiración en meses
  const expiresInMonthsRaw = formData.get('expires_in_months') as string
  let expiresAt: string | null = null
  if (expiresInMonthsRaw && expiresInMonthsRaw !== 'never') {
    const months = parseInt(expiresInMonthsRaw, 10)
    if (!isNaN(months) && months > 0) {
      const expDate = new Date()
      expDate.setMonth(expDate.getMonth() + months)
      expiresAt = expDate.toISOString()
    }
  }

  // Generar código con reintentos si colisiona
  let code = ''
  let attempts = 0
  while (attempts < 5) {
    const candidate = generateUniqueCode('GC')
    const { data: existing } = await supabase
      .from('gift_cards')
      .select('id')
      .eq('code', candidate)
      .maybeSingle()
    if (!existing) {
      code = candidate
      break
    }
    attempts++
  }

  if (!code) {
    code = `GC-${Date.now().toString(36).toUpperCase().slice(-5)}`
  }

  const securityPin = generatePin()

  const { data: newCard, error } = await supabase
    .from('gift_cards')
    .insert({
      user_id: effectiveUser.id,
      code,
      security_pin: securityPin,
      title,
      card_type: cardType,
      service_name: serviceName,
      initial_amount: initialAmount,
      current_balance: initialAmount,
      currency,
      currency_symbol: currencySymbol,
      status: 'active',
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      buyer_email: buyerEmail,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      recipient_email: recipientEmail,
      gift_message: giftMessage,
      theme_color: themeColor,
      logo_url: logoUrl,
      card_image_url: cardImageUrl,
      require_pin: requirePin,
      source: 'manual',
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error || !newCard) {
    console.error('Error al crear gift card:', error)
    throw new Error('Error al registrar la tarjeta de regalo: ' + (error?.message || 'Error desconocido'))
  }

  revalidatePath('/dashboard/gift-cards')
  return { success: true, card: newCard }
}

export async function redeemGiftCard(payload: {
  codeOrId: string
  securityPin?: string
  amountToRedeem?: number
  notes?: string
}) {
  const supabase = await createClient()
  const { user: effectiveUser, realAdmin } = await getEffectiveUser(supabase)
  if (!effectiveUser) throw new Error('No autorizado. Debes iniciar sesión.')

  const { codeOrId, securityPin = '', amountToRedeem = 0, notes } = payload
  const cleanCode = codeOrId.trim().toUpperCase()

  // Revisar si el usuario tiene privilegios de superadministrador
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', effectiveUser.id)
    .maybeSingle()

  const isAdmin = Boolean(profile?.is_admin || realAdmin)

  // Si es admin, permite buscar cualquier tarjeta por código. Si es negocio normal, busca las de su cuenta
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanCode)
  let query = supabase.from('gift_cards').select('*')

  if (isUuid) {
    query = query.or(`code.eq.${cleanCode},id.eq.${cleanCode}`)
  } else {
    query = query.eq('code', cleanCode)
  }

  if (!isAdmin) {
    query = query.eq('user_id', effectiveUser.id)
  }

  const { data: card, error: fetchError } = await query.maybeSingle()

  if (fetchError) {
    console.error('Error buscando tarjeta:', fetchError)
    throw new Error('Error al consultar la tarjeta: ' + fetchError.message)
  }

  if (!card) {
    throw new Error(`Tarjeta con código "${cleanCode}" no encontrada o no pertenece a tu cuenta.`)
  }

  // Validaciones
  if (card.status === 'redeemed') {
    throw new Error('Esta tarjeta de regalo ya ha sido canjeada en su totalidad.')
  }
  if (card.status === 'cancelled') {
    throw new Error('Esta tarjeta de regalo ha sido cancelada / anulada.')
  }
  if (card.expires_at && new Date() > new Date(card.expires_at)) {
    throw new Error('Esta tarjeta de regalo ha expirado.')
  }

  // Validar PIN de seguridad únicamente si la tarjeta no es al portador
  if (card.require_pin !== false) {
    if (!securityPin || card.security_pin.trim() !== securityPin.trim()) {
      throw new Error('El PIN de seguridad ingresado es incorrecto.')
    }
  }

  const prevBalance = parseFloat(card.current_balance) || 0
  let deductAmount = 0
  let newBalance = 0
  let newStatus: 'active' | 'redeemed' = 'active'

  if (card.card_type === 'service') {
    // Para servicio específico, el canje es total
    deductAmount = prevBalance
    newBalance = 0
    newStatus = 'redeemed'
  } else {
    // Por saldo monetario
    deductAmount = Math.round(Number(amountToRedeem) * 100) / 100
    if (deductAmount <= 0) {
      throw new Error('El monto a consumir debe ser mayor a 0.')
    }
    if (deductAmount > prevBalance) {
      throw new Error(`El monto excede el saldo disponible (${card.currency_symbol} ${prevBalance.toFixed(2)}).`)
    }
    newBalance = Math.round((prevBalance - deductAmount) * 100) / 100
    if (newBalance === 0) {
      newStatus = 'redeemed'
    }
  }

  // Registrar redención
  const { error: redemptionError } = await supabase
    .from('gift_card_redemptions')
    .insert({
      gift_card_id: card.id,
      user_id: card.user_id,
      amount: deductAmount,
      previous_balance: prevBalance,
      new_balance: newBalance,
      notes: notes?.trim() || (card.card_type === 'service' ? `Canje del servicio: ${card.service_name || card.title}` : 'Consumo en establecimiento'),
      redeemed_by: effectiveUser.id,
    })

  if (redemptionError) {
    console.error('Error insertando redención:', redemptionError)
    throw new Error('No se pudo registrar la redención: ' + redemptionError.message)
  }

  // Actualizar tarjeta
  const { error: updateError } = await supabase
    .from('gift_cards')
    .update({
      current_balance: newBalance,
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', card.id)

  if (updateError) {
    console.error('Error actualizando balance de tarjeta:', updateError)
    throw new Error('Error al actualizar el saldo de la tarjeta.')
  }

  revalidatePath('/dashboard/gift-cards')
  revalidatePath(`/g/${card.code}`)

  return {
    success: true,
    code: card.code,
    deductedAmount: deductAmount,
    newBalance,
    newStatus,
    currencySymbol: card.currency_symbol
  }
}

export async function cancelGiftCard(cardId: string) {
  const supabase = await createClient()
  const { user: effectiveUser } = await getEffectiveUser(supabase)
  if (!effectiveUser) throw new Error('No autorizado')

  const { error } = await supabase
    .from('gift_cards')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', cardId)

  if (error) throw new Error('Error al anular la tarjeta: ' + error.message)

  revalidatePath('/dashboard/gift-cards')
  return { success: true }
}

export async function getGiftCardPublic(code: string) {
  const supabase = await createClient()
  const cleanCode = code.trim().toUpperCase()

  const { data: card, error } = await supabase
    .from('gift_cards')
    .select(`
      *,
      users:user_id (
        full_name,
        avatar_url,
        industry
      )
    `)
    .eq('code', cleanCode)
    .maybeSingle()

  if (error || !card) return null

  // Obtener negocio emisor desde vCards si existe
  const { data: vcard } = await supabase
    .from('vcards')
    .select('first_name, company_name, slug, theme, contact_info, avatar_url, cover_url')
    .eq('user_id', card.user_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Historial de consumos
  const { data: redemptions } = await supabase
    .from('gift_card_redemptions')
    .select('id, amount, previous_balance, new_balance, notes, created_at')
    .eq('gift_card_id', card.id)
    .order('created_at', { ascending: false })

  const vcardTheme = typeof vcard?.theme === 'object' && vcard.theme !== null ? (vcard.theme as any) : {}
  const vcardContact = typeof vcard?.contact_info === 'object' && vcard.contact_info !== null ? (vcard.contact_info as any) : {}
  const detectedLogo = card.logo_url || vcard?.avatar_url || vcardTheme?.logo_url || vcardContact?.logo_url || card.users?.avatar_url || null

  return {
    card,
    business: {
      name: vcard?.company_name || vcard?.first_name || card.users?.full_name || 'Negocio Afiliado',
      slug: vcard?.slug || null,
      contact: vcardContact,
      avatar: card.users?.avatar_url || null,
      logo: detectedLogo
    },
    redemptions: redemptions || []
  }
}

export async function getGoogleWalletGiftCardUrl(code: string, origin: string) {
  const data = await getGiftCardPublic(code)
  if (!data) return { success: false, error: 'Tarjeta no encontrada.' }

  const publicUrl = `${origin}/g/${data.card.code}`
  return createGoogleWalletGiftCardPass({
    card: {
      code: data.card.code,
      title: data.card.title,
      card_type: data.card.card_type,
      service_name: data.card.service_name,
      current_balance: data.card.current_balance,
      currency_symbol: data.card.currency_symbol,
      recipient_name: data.card.recipient_name,
      buyer_name: data.card.buyer_name,
      gift_message: data.card.gift_message,
      theme_color: data.card.theme_color,
      expires_at: data.card.expires_at,
      card_image_url: data.card.card_image_url
    },
    businessName: data.business.name,
    logoUrl: data.business.logo,
    publicUrl
  })
}
