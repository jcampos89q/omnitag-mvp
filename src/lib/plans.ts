import { SupabaseClient } from '@supabase/supabase-js'

export interface UserPlanInfo {
  plan: 'free' | 'pro'
  isPro: boolean
  isAdmin: boolean
  workspaceId: string | null
  expiresAt: string | null
  daysLeft: number
  isExpired: boolean
  isTrial?: boolean
  isDiscountEligible?: boolean
  discountDaysLeft?: number
  hasNfcCard?: boolean
  hasReviewPlate?: boolean
  nfcCardToken?: string | null
}

/**
 * Obtiene de forma 100% infalible y en tiempo real el plan del usuario, fecha de vencimiento y privilegios
 * Utiliza la función RPC en Postgres con SECURITY DEFINER para verificar vigencia mensual
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
      isTrial: false,
      isDiscountEligible: false,
      discountDaysLeft: 0,
      hasNfcCard: false,
      hasReviewPlate: false,
      nfcCardToken: null
    }
  }

  // 1. Invocar la función RPC y obtener datos del usuario, tarjetas y dispositivos en paralelo
  const [
    { data: rpcData, error: rpcError },
    { data: profile },
    { data: nfcCards },
    { data: devices }
  ] = await Promise.all([
    supabase.rpc('get_user_plan', { p_user_id: userId }),
    supabase.from('users').select('is_admin, created_at, subscription_expires_at, account_type').eq('id', userId).maybeSingle(),
    supabase.from('nfc_cards').select('id, card_token, status, batch_id, nfc_batches(batch_type)').eq('claimed_by_user_id', userId).eq('status', 'active'),
    supabase.from('devices').select('id, tag_id, device_type, is_active').eq('user_id', userId).eq('is_active', true)
  ])

  // Detección de tarjetas y placas NFC físicas activas asociadas a la cuenta
  const activeCards = nfcCards || []
  const activeDevices = devices || []

  const hasNfcCard = activeCards.some(c => (c.nfc_batches as any)?.batch_type !== 'review_plate') || activeDevices.some(d => d.device_type === 'vcard')
  const hasReviewPlate = profile?.account_type === 'review_plate' || 
    activeDevices.some(d => d.device_type === 'tap_to_rate') || 
    activeCards.some(c => (c.nfc_batches as any)?.batch_type === 'review_plate')
  const primaryNfcCard = activeCards.find(c => (c.nfc_batches as any)?.batch_type !== 'review_plate') || activeCards[0]

  // Calcular fechas de prueba basadas en created_at
  const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date(0);
  const now = new Date();
  
  // 10 días de prueba gratuita completa (por defecto para cuentas nuevas sin suscripción formal)
  const trialEndDate = new Date(createdAt.getTime() + 10 * 24 * 60 * 60 * 1000); 
  const discountEndDate = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);
  const isTrialWindow = now <= trialEndDate;
  const isAdmin = Boolean(profile?.is_admin || rpcData?.is_admin);

  if (isAdmin) {
    return { 
      plan: 'pro', 
      isPro: true, 
      isAdmin: true, 
      workspaceId: userId,
      expiresAt: null,
      daysLeft: 9999,
      isExpired: false,
      isTrial: false,
      isDiscountEligible: false,
      discountDaysLeft: 0,
      hasNfcCard,
      hasReviewPlate,
      nfcCardToken: primaryNfcCard?.card_token || null
    }
  }

  if (!rpcError && rpcData) {
    const rawIsPro = Boolean(rpcData.is_pro);
    const rawDaysLeft = Number(rpcData.days_left || 0);
    const rawIsExpired = Boolean(rpcData.is_expired);

    let isPro = rawIsPro;
    let daysLeft = rawDaysLeft;
    let isExpired = rawIsExpired;

    // Si el usuario tiene una tarjeta física NFC, placa o días pagados (> 10 días o suscripción vigente):
    const hasHardwareOrPaidPlan = hasNfcCard || hasReviewPlate || (rawIsPro && !rawIsExpired && (rawDaysLeft > 10 || !isTrialWindow));

    if (rawIsPro && !rawIsExpired) {
      // Cuenta PRO legítima activa por pago o hardware
      isPro = true;
      isExpired = false;
    } else if (isTrialWindow && createdAt.getTime() > 0 && !hasHardwareOrPaidPlan) {
      // Periodo de prueba inicial de 10 días para cuentas nuevas
      isPro = true;
      isExpired = false;
      daysLeft = Math.max(1, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    } else {
      // Cuenta vencida
      isPro = false;
      isExpired = true;
      daysLeft = 0;
    }

    // Es prueba únicamente si es usuario nuevo dentro de sus 10 días sin tarjeta física ni placa
    const isTrial = isPro && isTrialWindow && daysLeft <= 10 && !hasHardwareOrPaidPlan;
    const isDiscountEligible = isTrial && now <= discountEndDate;
    const discountDaysLeft = isDiscountEligible 
      ? Math.max(1, Math.ceil((discountEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      plan: isPro ? 'pro' : 'free',
      isPro,
      isAdmin: false,
      workspaceId: rpcData.workspace_id || userId,
      expiresAt: rpcData.expires_at || (isTrial ? trialEndDate.toISOString() : profile?.subscription_expires_at || null),
      daysLeft,
      isExpired,
      isTrial,
      isDiscountEligible,
      discountDaysLeft,
      hasNfcCard,
      hasReviewPlate,
      nfcCardToken: primaryNfcCard?.card_token || null
    }
  }

  // 2. Fallback de contingencia si el RPC falla
  if (profile?.subscription_expires_at) {
    const expiresDate = new Date(profile.subscription_expires_at);
    const daysLeft = Math.max(0, Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isPro = expiresDate > now;
    const hasHardwareOrPaidPlan = hasNfcCard || hasReviewPlate || daysLeft > 10;
    const isTrial = isPro && isTrialWindow && daysLeft <= 10 && !hasHardwareOrPaidPlan;

    return {
      plan: isPro ? 'pro' : 'free',
      isPro,
      isAdmin: false,
      workspaceId: userId,
      expiresAt: profile.subscription_expires_at,
      daysLeft,
      isExpired: !isPro,
      isTrial,
      isDiscountEligible: isTrial && now <= discountEndDate,
      discountDaysLeft: (isTrial && now <= discountEndDate) ? Math.max(1, Math.ceil((discountEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0,
      hasNfcCard,
      hasReviewPlate,
      nfcCardToken: primaryNfcCard?.card_token || null
    }
  }

  // 3. Ventana de 10 días de prueba gratuita por defecto desde el registro (si no tiene hardware)
  if (now <= trialEndDate && createdAt.getTime() > 0 && !hasNfcCard && !hasReviewPlate) {
    const fallbackDaysLeft = Math.max(1, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      plan: 'pro',
      isPro: true,
      isAdmin: false,
      workspaceId: userId,
      expiresAt: trialEndDate.toISOString(),
      daysLeft: fallbackDaysLeft,
      isExpired: false,
      isTrial: true,
      isDiscountEligible: now <= discountEndDate,
      discountDaysLeft: (now <= discountEndDate) ? Math.max(1, Math.ceil((discountEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0,
      hasNfcCard,
      hasReviewPlate,
      nfcCardToken: primaryNfcCard?.card_token || null
    }
  }

  // 4. Cuenta expirada
  return {
    plan: 'free',
    isPro: false,
    isAdmin: false,
    workspaceId: userId,
    expiresAt: profile?.subscription_expires_at || trialEndDate.toISOString(),
    daysLeft: 0,
    isExpired: true,
    isTrial: false,
    isDiscountEligible: false,
    discountDaysLeft: 0,
    hasNfcCard,
    hasReviewPlate,
    nfcCardToken: primaryNfcCard?.card_token || null
  }
}
