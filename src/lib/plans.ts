import { SupabaseClient } from '@supabase/supabase-js'

export interface UserPlanInfo {
  plan: 'free' | 'pro'
  isPro: boolean
  isAdmin: boolean
  workspaceId: string | null
}

/**
 * Obtiene de forma robusta el plan del usuario y sus privilegios de administrador
 * Nota: Los administradores (is_admin = true) siempre tienen acceso PRO ilimitado
 */
export async function getUserPlanInfo(supabase: SupabaseClient, userId?: string): Promise<UserPlanInfo> {
  if (!userId) {
    return { plan: 'free', isPro: false, isAdmin: false, workspaceId: null }
  }

  // 1. Obtener perfil de usuario (is_admin)
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle()

  const isAdmin = Boolean(profile?.is_admin)

  // 2. Obtener workspace y plan
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(plan)')
    .eq('user_id', userId)
    .maybeSingle()

  const rawPlan = (member?.workspaces as any)?.plan || 'free'
  const isPro = isAdmin || rawPlan === 'pro'
  const plan = isPro ? 'pro' : 'free'

  return {
    plan,
    isPro,
    isAdmin,
    workspaceId: member?.workspace_id || null
  }
}
