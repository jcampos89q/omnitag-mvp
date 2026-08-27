import { SupabaseClient } from '@supabase/supabase-js'

export interface UserPlanInfo {
  plan: 'free' | 'pro'
  isPro: boolean
  isAdmin: boolean
  workspaceId: string | null
  expiresAt: string | null
  daysLeft: number
  isExpired: boolean
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
      isExpired: false
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
    .select('is_admin')
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

  return {
    plan: 'free',
    isPro: false,
    isAdmin: false,
    workspaceId: userId,
    expiresAt: null,
    daysLeft: 0,
    isExpired: false
  }
}
