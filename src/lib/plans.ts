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
      discountDaysLeft: 0
    }
  }

  // 1. Invocar la función RPC y obtener datos básicos del usuario en paralelo
  const [
    { data: rpcData, error: rpcError },
    { data: profile }
  ] = await Promise.all([
    supabase.rpc('get_user_plan', { p_user_id: userId }),
    supabase.from('users').select('is_admin, created_at, subscription_expires_at').eq('id', userId).maybeSingle()
  ])

  // Calcular siempre los días de prueba y descuentos basados en created_at
  const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date(0);
  const now = new Date();
  
  // 10 días de prueba gratuita completa
  const trialEndDate = profile?.subscription_expires_at 
    ? new Date(profile.subscription_expires_at) 
    : new Date(createdAt.getTime() + 10 * 24 * 60 * 60 * 1000); 

  // 3 primeros días con oferta del 50%
  const discountEndDate = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  const isTrialWindow = now <= trialEndDate;
  const isAdmin = Boolean(profile?.is_admin || rpcData?.is_admin);

  // Oferta del 50% solo durante los primeros 3 días desde el registro
  const isDiscountEligible = !isAdmin && now <= discountEndDate;
  const discountDaysLeft = isDiscountEligible 
    ? Math.max(1, Math.ceil((discountEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

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
      discountDaysLeft: 0
    }
  }

  if (!rpcError && rpcData) {
    const rawIsPro = Boolean(rpcData.is_pro);
    const rawDaysLeft = Number(rpcData.days_left || 0);
    const rawIsExpired = Boolean(rpcData.is_expired);

    // Si el RPC dice que venció, pero aún está en su ventana de prueba o prórroga:
    let isPro = rawIsPro;
    let daysLeft = rawDaysLeft;
    let isExpired = rawIsExpired;

    if (isTrialWindow && createdAt.getTime() > 0) {
      isPro = true;
      isExpired = false;
      daysLeft = Math.max(1, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    } else if (!isPro || rawIsExpired || now > trialEndDate) {
      // Si ya pasó la prueba y no tiene membresía pagada activa -> CUENTA BLOQUEADA / VENCIDA
      isPro = false;
      isExpired = true;
      daysLeft = 0;
    }

    // Es prueba si está activo dentro de la ventana de prueba y no tiene membresía formal de 30 o 365 días
    const isTrial = isPro && isTrialWindow && daysLeft <= 10;

    return {
      plan: isPro ? 'pro' : 'free',
      isPro,
      isAdmin: false,
      workspaceId: rpcData.workspace_id || userId,
      expiresAt: rpcData.expires_at || trialEndDate.toISOString(),
      daysLeft,
      isExpired,
      isTrial,
      isDiscountEligible,
      discountDaysLeft
    }
  }

  // 2. Fallback de contingencia si el RPC falla
  if (profile?.subscription_expires_at) {
    const expiresDate = new Date(profile.subscription_expires_at);
    const daysLeft = Math.max(0, Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isPro = expiresDate > now;
    const isTrial = isPro && daysLeft <= 10;

    return {
      plan: isPro ? 'pro' : 'free',
      isPro,
      isAdmin: false,
      workspaceId: userId,
      expiresAt: profile.subscription_expires_at,
      daysLeft,
      isExpired: !isPro,
      isTrial,
      isDiscountEligible,
      discountDaysLeft
    }
  }

  // 3. Ventana de 10 días de prueba gratuita por defecto desde el registro
  if (now <= trialEndDate && createdAt.getTime() > 0) {
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
      isDiscountEligible,
      discountDaysLeft
    }
  }

  // 4. Cuenta expirada (No existen cuentas gratuitas permanentes)
  return {
    plan: 'free',
    isPro: false,
    isAdmin: false,
    workspaceId: userId,
    expiresAt: trialEndDate.toISOString(),
    daysLeft: 0,
    isExpired: true,
    isTrial: false,
    isDiscountEligible: false,
    discountDaysLeft: 0
  }
}

