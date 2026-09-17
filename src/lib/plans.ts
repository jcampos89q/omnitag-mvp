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
    supabase.from('users').select('is_admin, created_at, plan_status, current_period_end').eq('id', userId).maybeSingle()
  ])

  // Calcular siempre los días de prueba y descuentos basados en created_at
  const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date(0);
  const now = new Date();
  
  // Supabase RPC default is 10 days for trial in DB, but we consider 10 days for frontend compatibility if needed.
  // Actually, let's keep frontend logic aware of a 10-day trial if the RPC gave them 10 days.
  // If created_at is within 10 days, we consider it a trial.
  const trialEndDate = new Date(createdAt.getTime() + 10 * 24 * 60 * 60 * 1000); 
  const discountEndDate = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  const isDiscountEligible = now <= discountEndDate;
  const discountDaysLeft = isDiscountEligible 
    ? Math.max(1, Math.ceil((discountEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isTrialWindow = now <= trialEndDate;
  
  const isAdmin = Boolean(profile?.is_admin || rpcData?.is_admin);

  if (!rpcError && rpcData) {
    // Es posible que el RPC devuelva pro porque está en periodo de prueba de 10 días
    // Vamos a marcarlo como "isTrial: true" si está en esos 10 días y no tiene un plan activo formal
    const hasFormalPlan = profile?.plan_status === 'active' || profile?.plan_status === 'trialing';
    const isTrial = rpcData.plan === 'pro' && !isAdmin && !hasFormalPlan && isTrialWindow;

    return {
      plan: rpcData.plan === 'pro' ? 'pro' : 'free',
      isPro: Boolean(rpcData.is_pro),
      isAdmin: isAdmin,
      workspaceId: rpcData.workspace_id || userId,
      expiresAt: rpcData.expires_at || null,
      daysLeft: Number(rpcData.days_left || 0),
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

  // Verificar si tiene una suscripción activa real (preparando para cuando haya webhook)
  if (profile?.plan_status === 'active' || profile?.plan_status === 'trialing') {
    const expiresAt = profile.current_period_end ? new Date(profile.current_period_end).toISOString() : null;
    const daysLeft = expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 9999;
    return {
      plan: 'pro',
      isPro: true,
      isAdmin: false,
      workspaceId: userId,
      expiresAt,
      daysLeft,
      isExpired: daysLeft <= 0
    }
  }

  // 3. Lógica de 7 días de prueba gratuita al crear la cuenta
  const fallbackTrialEndDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (now <= fallbackTrialEndDate) {
    const fallbackDaysLeft = Math.max(1, Math.ceil((fallbackTrialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return {
      plan: 'pro', // Herramientas completas durante la prueba
      isPro: true,
      isAdmin: false,
      workspaceId: userId,
      expiresAt: fallbackTrialEndDate.toISOString(),
      daysLeft: fallbackDaysLeft,
      isExpired: false,
      isTrial: true,
      isDiscountEligible,
      discountDaysLeft
    }
  }

  // 4. Cuenta gratuita expirada (terminó la prueba de 7 días)
  return {
    plan: 'free',
    isPro: false,
    isAdmin: false,
    workspaceId: userId,
    expiresAt: fallbackTrialEndDate.toISOString(),
    daysLeft: 0,
    isExpired: true,
    isTrial: false,
    isDiscountEligible: false,
    discountDaysLeft: 0
  }
}
