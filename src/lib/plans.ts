import { SupabaseClient } from '@supabase/supabase-js'

export interface UserPlanInfo {
  plan: 'free' | 'pro'
  isPro: boolean              // true si tiene Pro Suite habilitada (mes gratis de 30 días o suscripción mensual activa)
  isAdmin: boolean
  workspaceId: string | null
  expiresAt: string | null     // Expiración de su acceso Pro (mes gratis o suscripción)
  daysLeft: number
  isExpired: boolean          // true ÚNICAMENTE si la cuenta no tiene hardware vigente ni Pro (cuenta totalmente bloqueada)

  // Hardware Físico (Tarjeta NFC y Placa de Reseñas - 1 Año Garantizado)
  hasNfcCard: boolean         // Tiene Tarjeta NFC (vCard)
  hasReviewPlate: boolean     // Tiene Placa de Reseñas NFC
  hasActiveHardware: boolean  // Tiene hardware físico dentro de su año de vigencia (365 días)
  hardwareType: 'vcard' | 'review_plate' | 'both' | null
  hardwareExpiresAt: string | null
  hardwareDaysLeft: number
  isHardwareActive: boolean

  // Mes de Cortesía / Prueba Completa (30 Días con Todas las Funciones)
  isTrial: boolean            // true durante los primeros 30 días desde la activación de hardware
  trialDaysLeft: number
  trialExpiresAt: string | null

  // Suscripción Mensual PRO de Pago
  isMonthlyPro: boolean       // true si tiene una suscripción mensual activa para las herramientas Pro adicionales

  // Permisos Específicos por Módulo de la Plataforma
  canAccessVCard: boolean       // Mi vCard: 1 año con Tarjeta NFC, mes gratis, suscripción mensual o Admin
  canAccessLeads: boolean       // Contactos CRM: 1 año con Tarjeta NFC, mes gratis, suscripción mensual o Admin
  canAccessReviewPlate: boolean // Mi Placa: 1 año con Placa NFC, mes gratis, suscripción mensual o Admin
  canAccessFeedback: boolean    // Quejas Privadas: 1 año con Placa NFC, mes gratis, suscripción mensual o Admin
  canAccessAnalytics: boolean   // Estadísticas: 1 año con cualquier hardware, mes gratis, suscripción mensual o Admin
  canAccessProSuite: boolean    // Ruleta, Fidelización/Sellos, Citas, Menús, QR Studio: Solo mes gratis o suscripción mensual

  // Información adicional de compatibilidad
  isDiscountEligible?: boolean
  discountDaysLeft?: number
  nfcCardToken?: string | null
  accountType?: string
}

/**
 * Obtiene de forma infalible y en tiempo real el plan del usuario,
 * diferenciando con total claridad:
 * 1. Hardware Físico (Tarjeta NFC o Placa): 1 año completo (365 días) de acceso a su hardware + CRM + Estadísticas.
 * 2. Mes Gratis (30 días): Acceso a TODAS las herramientas de la plataforma (Pro Suite).
 * 3. Fin del Mes Gratis: Si no tiene suscripción mensual, la Pro Suite queda desactivada pero su hardware sigue activo todo el año.
 * 4. Suscripción Mensual: Mantiene la Pro Suite activa mes a mes.
 */
export async function getUserPlanInfo(supabase: SupabaseClient, userId?: string): Promise<UserPlanInfo> {
  if (!userId) {
    return { 
      plan: 'free', 
      isPro: false, 
      isAdmin: false, 
      workspaceId: null,
      expiresAt: null,
      daysLeft: 0,
      isExpired: false,
      hasNfcCard: false,
      hasReviewPlate: false,
      hasActiveHardware: false,
      hardwareType: null,
      hardwareExpiresAt: null,
      hardwareDaysLeft: 0,
      isHardwareActive: false,
      isTrial: false,
      trialDaysLeft: 0,
      trialExpiresAt: null,
      isMonthlyPro: false,
      canAccessVCard: false,
      canAccessLeads: false,
      canAccessReviewPlate: false,
      canAccessFeedback: false,
      canAccessAnalytics: false,
      canAccessProSuite: false,
      nfcCardToken: null
    }
  }

  // 1. Obtener perfil de usuario, tarjetas NFC y dispositivos registrados
  const [
    { data: profile },
    { data: nfcCards },
    { data: devices }
  ] = await Promise.all([
    supabase
      .from('users')
      .select('is_admin, created_at, subscription_expires_at, account_type, hardware_type, hardware_expires_at, trial_expires_at')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('nfc_cards')
      .select('id, card_token, status, batch_id, claimed_at, plan_duration_days, nfc_batches(batch_type)')
      .eq('claimed_by_user_id', userId)
      .eq('status', 'active'),
    supabase
      .from('devices')
      .select('id, tag_id, device_type, is_active, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
  ])

  const now = new Date()
  const isAdmin = Boolean(profile?.is_admin)

  // Rol de Super Administrador: acceso total e ilimitado
  if (isAdmin) {
    return {
      plan: 'pro',
      isPro: true,
      isAdmin: true,
      workspaceId: userId,
      expiresAt: null,
      daysLeft: 9999,
      isExpired: false,
      hasNfcCard: true,
      hasReviewPlate: true,
      hasActiveHardware: true,
      hardwareType: 'both',
      hardwareExpiresAt: null,
      hardwareDaysLeft: 9999,
      isHardwareActive: true,
      isTrial: false,
      trialDaysLeft: 0,
      trialExpiresAt: null,
      isMonthlyPro: true,
      canAccessVCard: true,
      canAccessLeads: true,
      canAccessReviewPlate: true,
      canAccessFeedback: true,
      canAccessAnalytics: true,
      canAccessProSuite: true,
      nfcCardToken: null,
      accountType: 'admin'
    }
  }

  // 2. Detección de Hardware Físico asociado a la cuenta
  const activeCards = nfcCards || []
  const activeDevices = devices || []

  const hasNfcCard = activeCards.some(c => (c.nfc_batches as any)?.batch_type !== 'review_plate') || 
    activeDevices.some(d => d.device_type === 'vcard') ||
    profile?.hardware_type === 'vcard' || 
    profile?.hardware_type === 'both'

  const hasReviewPlate = profile?.account_type === 'review_plate' || 
    activeDevices.some(d => d.device_type === 'tap_to_rate') || 
    activeCards.some(c => (c.nfc_batches as any)?.batch_type === 'review_plate') ||
    profile?.hardware_type === 'review_plate' ||
    profile?.hardware_type === 'both'

  const primaryNfcCard = activeCards.find(c => (c.nfc_batches as any)?.batch_type !== 'review_plate') || activeCards[0]

  const hardwareType: 'vcard' | 'review_plate' | 'both' | null = 
    (hasNfcCard && hasReviewPlate) ? 'both' : (hasNfcCard ? 'vcard' : (hasReviewPlate ? 'review_plate' : null))

  // 3. Cálculo de la Vigencia de Hardware (1 año = 365 días)
  let latestHardwareExpires: Date | null = profile?.hardware_expires_at ? new Date(profile.hardware_expires_at) : null

  // Si no está registrado en el perfil, calcular a partir de las tarjetas o dispositivos
  if (!latestHardwareExpires) {
    for (const card of activeCards) {
      if (card.claimed_at) {
        const days = card.plan_duration_days || 365
        const cardExpires = new Date(new Date(card.claimed_at).getTime() + days * 24 * 60 * 60 * 1000)
        if (!latestHardwareExpires || cardExpires > latestHardwareExpires) {
          latestHardwareExpires = cardExpires
        }
      }
    }
    for (const dev of activeDevices) {
      if (dev.created_at) {
        const devExpires = new Date(new Date(dev.created_at).getTime() + 365 * 24 * 60 * 60 * 1000)
        if (!latestHardwareExpires || devExpires > latestHardwareExpires) {
          latestHardwareExpires = devExpires
        }
      }
    }
  }

  const isHardwareActive = Boolean(latestHardwareExpires && latestHardwareExpires > now)
  const hardwareDaysLeft = isHardwareActive && latestHardwareExpires
    ? Math.max(1, Math.ceil((latestHardwareExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  // 4. Cálculo del Mes Gratis de Prueba Completa (30 días con todas las funciones)
  let trialEndDate: Date | null = profile?.trial_expires_at ? new Date(profile.trial_expires_at) : null

  if (!trialEndDate) {
    // Si no tiene fecha explícita, calcular 30 días desde la fecha de activación de hardware o de creación de cuenta
    let startEpoch: number = profile?.created_at ? new Date(profile.created_at).getTime() : 0
    for (const card of activeCards) {
      if (card.claimed_at) {
        const cTime = new Date(card.claimed_at).getTime()
        if (cTime > startEpoch) startEpoch = cTime
      }
    }
    for (const dev of activeDevices) {
      if (dev.created_at) {
        const dTime = new Date(dev.created_at).getTime()
        if (dTime > startEpoch) startEpoch = dTime
      }
    }

    if (startEpoch > 0) {
      // 30 días de cortesía con todas las funciones abiertas
      trialEndDate = new Date(startEpoch + 30 * 24 * 60 * 60 * 1000)
    }
  }

  const isTrial = Boolean(trialEndDate && now <= trialEndDate)
  const trialDaysLeft = isTrial && trialEndDate
    ? Math.max(1, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  // 5. Cálculo de Suscripción Mensual PRO de Pago
  let isMonthlyPro = false
  let subDaysLeft = 0
  let subExpiresDate: Date | null = null

  if (profile?.subscription_expires_at) {
    subExpiresDate = new Date(profile.subscription_expires_at)
    // Es mensual si la fecha es futura y supera o es independiente del mes de prueba
    if (subExpiresDate > now) {
      const isPastTrial = !trialEndDate || subExpiresDate.getTime() > trialEndDate.getTime()
      if (isPastTrial || !isTrial) {
        isMonthlyPro = true
        subDaysLeft = Math.max(1, Math.ceil((subExpiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      }
    }
  }

  // 6. Matriz de Permisos por Funcionalidad
  // Pro Suite (Ruleta, Sellos, Citas, Menús, QR Studio HD): Solo durante el mes gratis o con suscripción mensual activa
  const canAccessProSuite = isTrial || isMonthlyPro

  // Mi vCard y Contactos CRM: Abiertos por 1 año para quienes compraron Tarjeta NFC, o si tienen Pro Suite
  const canAccessVCard = canAccessProSuite || (isHardwareActive && hasNfcCard)
  const canAccessLeads = canAccessProSuite || (isHardwareActive && hasNfcCard)

  // Placa de Reseñas y Quejas: Abiertos por 1 año para quienes compraron Placa NFC, o si tienen Pro Suite
  const canAccessReviewPlate = canAccessProSuite || (isHardwareActive && hasReviewPlate)
  const canAccessFeedback = canAccessProSuite || (isHardwareActive && hasReviewPlate)

  // Estadísticas: Abiertas por 1 año para cualquier comprador de hardware, o con Pro Suite
  const canAccessAnalytics = canAccessProSuite || isHardwareActive

  // Estado general
  const isPro = canAccessProSuite
  // La cuenta SOLO está totalmente bloqueada si no tiene Pro Suite Y TAMPOCO tiene hardware activo de 1 año
  const isExpired = !canAccessProSuite && !isHardwareActive

  const daysLeft = canAccessProSuite 
    ? (isMonthlyPro ? subDaysLeft : trialDaysLeft)
    : (isHardwareActive ? hardwareDaysLeft : 0)

  const effectiveExpiresAt = canAccessProSuite
    ? (isMonthlyPro ? subExpiresDate?.toISOString() || null : trialEndDate?.toISOString() || null)
    : (isHardwareActive ? latestHardwareExpires?.toISOString() || null : null)

  return {
    plan: isPro ? 'pro' : 'free',
    isPro,
    isAdmin: false,
    workspaceId: userId,
    expiresAt: effectiveExpiresAt,
    daysLeft,
    isExpired,
    hasNfcCard,
    hasReviewPlate,
    hasActiveHardware: isHardwareActive,
    hardwareType,
    hardwareExpiresAt: latestHardwareExpires ? latestHardwareExpires.toISOString() : null,
    hardwareDaysLeft,
    isHardwareActive,
    isTrial,
    trialDaysLeft,
    trialExpiresAt: trialEndDate ? trialEndDate.toISOString() : null,
    isMonthlyPro,
    canAccessVCard,
    canAccessLeads,
    canAccessReviewPlate,
    canAccessFeedback,
    canAccessAnalytics,
    canAccessProSuite,
    isDiscountEligible: isTrial && trialDaysLeft > 25,
    discountDaysLeft: isTrial && trialDaysLeft > 25 ? trialDaysLeft - 25 : 0,
    nfcCardToken: primaryNfcCard?.card_token || null,
    accountType: profile?.account_type || (hasReviewPlate ? 'review_plate' : 'professional')
  }
}
