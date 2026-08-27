import { SupabaseClient } from '@supabase/supabase-js'

export interface UserPlanInfo {
  plan: 'free' | 'pro'
  isPro: boolean
  isAdmin: boolean
  workspaceId: string | null
}

/**
 * Obtiene de forma 100% infalible el plan del usuario y sus privilegios de administrador
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
  if (isAdmin) {
    return { plan: 'pro', isPro: true, isAdmin: true, workspaceId: userId }
  }

  // 2. Buscar membresía de workspace
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .maybeSingle()

  const targetWorkspaceId = member?.workspace_id || userId

  // 3. Consultar directamente el plan en la tabla workspaces
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, plan')
    .eq('id', targetWorkspaceId)
    .maybeSingle()

  const rawPlan = workspace?.plan || 'free'
  const isPro = rawPlan === 'pro'
  const plan = isPro ? 'pro' : 'free'

  return {
    plan,
    isPro,
    isAdmin,
    workspaceId: targetWorkspaceId
  }
}
