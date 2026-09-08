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

  // 1. Invocar la función RPC con permisos directos en PostgreSQL
  const { data, error } = await supabase.rpc('get_user_plan', {
    p_user_id: userId
  })

  if (!error && data) {
    return {
      plan: data.plan === 'pro' ? 'pro' : 'free',
      isPro: Boolean(data.is_pro),
      isAdmin: Boolean(data.is_admin),
      workspaceId: data.workspace_id || userId,
      expiresAt: data.expires_at || null,
      daysLeft: Number(data.days_left || 0),
      isExpired: Boolean(data.is_expired)
    }
  }

  // 2. Fallback de contingencia si el RPC falla
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin, created_at, plan_status, current_period_end')
    .eq('id', userId)
    .maybeSingle()

  const isAdmin = Boolean(profile?.is_admin)
  if (isAdmin) {
    return { 
      plan: 'pro', 
      isPro: true, 
      isAdmin: true, 
      workspaceId: userId,
      expiresAt: null,
      daysLeft: 9999,
      isExpired: false
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

  // 3. Lógica de 7 días de prueba gratuita al crear la cuenta y descuento de 3 días
  const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date();
  const now = new Date();
  const trialEndDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const discountEndDate = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  const isDiscountEligible = now <= discountEndDate;
  const discountDaysLeft = isDiscountEligible 
    ? Math.max(1, Math.ceil((discountEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (now <= trialEndDate) {
    const daysLeft = Math.max(1, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return {
      plan: 'pro', // Herramientas completas durante la prueba
      isPro: true,
      isAdmin: false,
      workspaceId: userId,
      expiresAt: trialEndDate.toISOString(),
      daysLeft: daysLeft,
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
    expiresAt: trialEndDate.toISOString(),
    daysLeft: 0,
    isExpired: true,
    isTrial: false,
    isDiscountEligible: false,
    discountDaysLeft: 0
  }
}
