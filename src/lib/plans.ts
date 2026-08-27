import { SupabaseClient } from '@supabase/supabase-js'

export interface UserPlanInfo {
  plan: 'free' | 'pro'
  isPro: boolean
  isAdmin: boolean
  workspaceId: string | null
}

/**
 * Obtiene de forma 100% infalible y en tiempo real el plan del usuario y sus privilegios
 * Utiliza la función RPC en Postgres con SECURITY DEFINER para evitar problemas de RLS o desincronización
 */
export async function getUserPlanInfo(supabase: SupabaseClient, userId?: string): Promise<UserPlanInfo> {
  if (!userId) {
    return { plan: 'free', isPro: false, isAdmin: false, workspaceId: null }
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
      workspaceId: data.workspace_id || userId
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
    return { plan: 'pro', isPro: true, isAdmin: true, workspaceId: userId }
  }

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(plan)')
    .eq('user_id', userId)
    .maybeSingle()

  const rawPlan = (member?.workspaces as any)?.plan || 'free'
  const isPro = rawPlan === 'pro'

  return {
    plan: isPro ? 'pro' : 'free',
    isPro,
    isAdmin,
    workspaceId: member?.workspace_id || userId
  }
}
