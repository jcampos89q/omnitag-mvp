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
  
  const trialEndDate = new Date(createdAt.getTime() + 10 * 24 * 60 * 60 * 1000); 
  const discountEndDate = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  const isTrialWindow = now <= trialEndDate;
  const isAdmin = Boolean(profile?.is_admin || rpcData?.is_admin);

  if (!rpcError && rpcData) {
    const isPro = Boolean(rpcData.is_pro);
    const daysLeft = Number(rpcData.days_left || 0);

    // Un usuario solo está en "Trial" si está dentro de sus primeros 10 días de registro
    // Y NO tiene una membresía mensual (30 días) ni anual (365 días) asignada formalmente.
    // Si tiene más de 10 días restantes, definitivamente es un plan PRO activado (30 o 365 días).
    const isTrial = isPro && !isAdmin && isTrialWindow && daysLeft <= 10;

    // La oferta del 50% solo aplica a usuarios gratuitos que aún no han adquirido ningún plan PRO
    // y que se registraron hace menos de 3 días.
    const isDiscountEligible = !isPro && now <= discountEndDate;
    const discountDaysLeft = isDiscountEligible 
      ? Math.max(1, Math.ceil((discountEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      plan: isPro ? 'pro' : 'free',
      isPro,
      isAdmin,
      workspaceId: rpcData.workspace_id || userId,
      expiresAt: rpcData.expires_at || profile?.subscription_expires_at || null,
      daysLeft,
      isExpired: Boolean(rpcData.is_expired),
      isTrial,
      isDiscountEligible,
      discountDaysLeft
    }
  }

  // 2. Fallback de contingencia si el RPC falla
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

  // Verificar si tiene fecha de expiración en la tabla users
  if (profile?.subscription_expires_at) {
    const expiresDate = new Date(profile.subscription_expires_at);
    const daysLeft = Math.max(0, Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isPro = expiresDate > now;
    return {
      plan: isPro ? 'pro' : 'free',
      isPro,
      isAdmin: false,
      workspaceId: userId,
      expiresAt: profile.subscription_expires_at,
      daysLeft,
      isExpired: !isPro,
      isTrial: false,
      isDiscountEligible: false,
      discountDaysLeft: 0
    }
  }

  // 3. Lógica de 7 días de prueba gratuita al crear la cuenta si es un usuario recién creado
  const fallbackTrialEndDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (now <= fallbackTrialEndDate && createdAt.getTime() > 0) {
    const fallbackDaysLeft = Math.max(1, Math.ceil((fallbackTrialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isDiscountEligible = now <= discountEndDate;
    const discountDaysLeft = isDiscountEligible 
      ? Math.max(1, Math.ceil((discountEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      plan: 'pro',
      isPro: true,
      isAdmin: false,
      workspaceId: userId,
      expiresAt: fallbackTrialEndDate.toISOString(),
      daysLeft: fallbackDaysLeft,
      isExpired: false,
      isTrial: true,
      isDiscountEligible: false, // Ya tiene PRO en prueba, no requiere comprar con 50% hasta que termine
      discountDaysLeft: 0
    }
  }

  // 4. Cuenta gratuita regular
  return {
    plan: 'free',
    isPro: false,
    isAdmin: false,
    workspaceId: userId,
    expiresAt: null,
    daysLeft: 0,
    isExpired: false,
    isTrial: false,
    isDiscountEligible: false,
    discountDaysLeft: 0
  }
}
