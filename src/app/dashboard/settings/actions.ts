'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { SUPPORTED_CURRENCIES } from '@/lib/currency'
import { 
  normalizeIndustry, 
  SELECTABLE_INDUSTRY_IDS, 
  SelectableIndustryId,
  INDUSTRY_COOLDOWN_DAYS
} from '@/lib/industries'

export interface BusinessPaymentConfig {
  provider_name?: string       // ej. 'Tilopay', 'PixelPay', 'BAC CompraClick', 'PayPal', 'Stripe', 'Hotmart'
  checkout_url?: string        // Link de pago por defecto
  bank_name?: string           // ej. 'BAC Credomatic'
  bank_account_number?: string // Número de cuenta para transferencias B2C
  bank_account_holder?: string // Titular
  bank_account_id_doc?: string // DNI / RTN
  whatsapp_payments?: string   // WhatsApp para recibir comprobantes de clientes
  accept_card_link?: boolean
  accept_bank_transfer?: boolean
  accept_cash?: boolean
}

export async function updateCurrencySetting(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const currencyCode = (formData.get('currency') as string)?.trim() || 'HNL'
  const matched = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode)
  const currencySymbol = matched ? matched.symbol : 'L.'

  // 1. Actualizar perfil del usuario
  const { error: userError } = await supabase
    .from('users')
    .update({
      currency: currencyCode,
      currency_symbol: currencySymbol
    })
    .eq('id', user.id)

  if (userError) throw new Error(userError.message)

  // 2. Sincronizar con negocios de citas y menús vinculados al usuario
  await Promise.allSettled([
    supabase
      .from('appointment_businesses')
      .update({ currency_symbol: currencySymbol })
      .eq('user_id', user.id),
    supabase
      .from('menus')
      .update({ currency: currencySymbol })
      .eq('user_id', user.id)
  ])

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/appointments')
  revalidatePath('/dashboard/menus')
  revalidatePath('/dashboard/patients')
  revalidatePath('/dashboard/leads')
  revalidatePath('/', 'layout')

  return { success: true }
}

/**
 * Sincroniza técnicamente los módulos de la base de datos cuando se fija o cambia el giro:
 * - Adapta el business_type en menus (restaurant vs services para catálogo retail)
 * - Pausa enlaces públicos de módulos que no corresponden al nuevo giro
 */
async function applyTechnicalIndustryTransition(userId: string, newIndustry: SelectableIndustryId) {
  const admin = getAdminClient()

  // Si el nuevo giro es restaurant o retail, aseguramos el modo correcto en menus
  if (newIndustry === 'restaurant') {
    await admin
      .from('menus')
      .update({ business_type: 'restaurant', is_active: true })
      .eq('user_id', userId)
  } else if (newIndustry === 'retail') {
    await admin
      .from('menus')
      .update({ business_type: 'services', is_active: true })
      .eq('user_id', userId)
  } else {
    // Si pasa a beauty, health o professional, pausar menús públicos para no dejar QRs de comida activos
    await admin
      .from('menus')
      .update({ is_active: false })
      .eq('user_id', userId)
  }

  // Si pasa a un giro sin ruleta (health o professional), pausar ruleta activa
  if (newIndustry === 'health' || newIndustry === 'professional') {
    await admin
      .from('prize_wheels')
      .update({ is_active: false })
      .eq('user_id', userId)
  }
}

/**
 * Configura el giro inicial obligatorio cuando la cuenta es nueva o viene de prueba/NFC/Hotmart
 */
export async function lockInitialIndustryAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const rawIndustry = (formData.get('industry') as string)?.trim()
  const normalized = normalizeIndustry(rawIndustry) as SelectableIndustryId

  if (!SELECTABLE_INDUSTRY_IDS.includes(normalized)) {
    throw new Error('Selecciona uno de los 5 giros oficiales.')
  }

  const nowIso = new Date().toISOString()
  const accountType = normalized === 'professional' ? 'professional' : 'business'

  const { error: userError } = await supabase
    .from('users')
    .update({
      industry: normalized,
      account_type: accountType
    })
    .eq('id', user.id)

  if (userError) throw new Error(userError.message)

  // Guardar metadatos de bloqueo de giro
  const admin = getAdminClient()
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...(user.user_metadata || {}),
      industry: normalized,
      industry_locked: true,
      industry_initial_set_at: nowIso
    }
  })

  await applyTechnicalIndustryTransition(user.id, normalized)

  revalidatePath('/', 'layout')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')

  return { success: true, industry: normalized }
}

/**
 * Cambia el giro del negocio desde Configuración verificando la regla de 30 días de enfriamiento
 * y confirmación técnica explícita.
 */
export async function updateIndustrySetting(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const rawIndustry = (formData.get('industry') as string)?.trim()
  const confirmationText = (formData.get('confirmation_text') as string)?.trim().toUpperCase()
  const normalized = normalizeIndustry(rawIndustry) as SelectableIndustryId

  if (!SELECTABLE_INDUSTRY_IDS.includes(normalized)) {
    throw new Error('Selecciona un giro de negocio válido.')
  }

  if (confirmationText !== 'CAMBIAR GIRO') {
    throw new Error('Debes escribir exactamente CAMBIAR GIRO para confirmar la transición técnica.')
  }

  // Verificar si es administrador (los admins no tienen bloqueo de 30 días)
  const { data: profile } = await supabase
    .from('users')
    .select('industry, is_admin, account_type')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = Boolean(profile?.is_admin)
  const lastChangedAtRaw = user.user_metadata?.industry_changed_at as string | undefined

  if (!isAdmin && lastChangedAtRaw) {
    const lastChanged = new Date(lastChangedAtRaw).getTime()
    const elapsedMs = Date.now() - lastChanged
    const cooldownMs = INDUSTRY_COOLDOWN_DAYS * 24 * 60 * 60 * 1000

    if (elapsedMs < cooldownMs) {
      const daysRemaining = Math.ceil((cooldownMs - elapsedMs) / (1000 * 60 * 60 * 24))
      throw new Error(
        `El giro del negocio solo puede modificarse cada ${INDUSTRY_COOLDOWN_DAYS} días. Podrás realizar un nuevo cambio en ${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'}.`
      )
    }
  }

  const nowIso = new Date().toISOString()
  const nextAccountType = profile?.account_type === 'review_plate'
    ? 'review_plate'
    : (normalized === 'professional' ? 'professional' : 'business')

  const { error: userError } = await supabase
    .from('users')
    .update({
      industry: normalized,
      account_type: nextAccountType
    })
    .eq('id', user.id)

  if (userError) throw new Error(userError.message)

  // Registrar marca de tiempo del cambio para el bloqueo de 30 días
  const admin = getAdminClient()
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...(user.user_metadata || {}),
      industry: normalized,
      industry_locked: true,
      industry_changed_at: nowIso,
      previous_industry: profile?.industry || null
    }
  })

  await applyTechnicalIndustryTransition(user.id, normalized)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/menus')
  revalidatePath('/dashboard/comandas')
  revalidatePath('/dashboard/appointments')
  revalidatePath('/dashboard/devices')
  revalidatePath('/dashboard/loyalty')
  revalidatePath('/dashboard/patients')
  revalidatePath('/dashboard/leads')
  revalidatePath('/', 'layout')

  return { success: true, industry: normalized, changedAt: nowIso }
}

/**
 * Guarda la configuración de la pasarela o métodos de cobro propios del negocio (B2C)
 */
export async function updateBusinessPaymentConfigAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const config: BusinessPaymentConfig = {
    provider_name: (formData.get('provider_name') as string)?.trim() || '',
    checkout_url: (formData.get('checkout_url') as string)?.trim() || '',
    bank_name: (formData.get('bank_name') as string)?.trim() || '',
    bank_account_number: (formData.get('bank_account_number') as string)?.trim() || '',
    bank_account_holder: (formData.get('bank_account_holder') as string)?.trim() || '',
    bank_account_id_doc: (formData.get('bank_account_id_doc') as string)?.trim() || '',
    whatsapp_payments: (formData.get('whatsapp_payments') as string)?.trim() || '',
    accept_card_link: formData.get('accept_card_link') === 'true',
    accept_bank_transfer: formData.get('accept_bank_transfer') === 'true',
    accept_cash: formData.get('accept_cash') === 'true',
  }

  const admin = getAdminClient()
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...(user.user_metadata || {}),
      business_payment_config: config
    }
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/menus')
  revalidatePath('/dashboard/appointments')
  revalidatePath('/dashboard/gift-cards')

  return { success: true, config }
}
