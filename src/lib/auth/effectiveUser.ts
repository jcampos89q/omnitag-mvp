import { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export interface EffectiveUser {
  id: string
  email?: string | null
  full_name?: string | null
  account_type: string
  industry: string
  avatar_url?: string | null
}

export interface EffectiveUserResult {
  user: EffectiveUser | null
  realAdmin: {
    id: string
    email?: string | null
  } | null
  isImpersonating: boolean
}

export const IMPERSONATE_COOKIE_NAME = 'omnitag_impersonate_user_id'

/**
 * Obtiene el usuario activo para el panel:
 * Si el usuario es Administrador y tiene activa la cookie de soporte "omnitag_impersonate_user_id",
 * devuelve los datos del cliente impersonado para que el admin vea el panel exactamente como él.
 * De lo contrario, devuelve el usuario normal en sesión.
 */
export async function getEffectiveUser(supabase: SupabaseClient): Promise<EffectiveUserResult> {
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return { user: null, realAdmin: null, isImpersonating: false }
  }

  // 1. Verificar si el usuario autenticado es Administrador
  const { data: profile } = await supabase
    .from('users')
    .select('id, email, full_name, is_admin, account_type, industry, avatar_url')
    .eq('id', authUser.id)
    .maybeSingle()

  const isAdmin = Boolean(profile?.is_admin)

  // 2. Si es admin, revisar si tiene la cookie de soporte activa
  if (isAdmin) {
    const cookieStore = await cookies()
    const targetUserId = cookieStore.get(IMPERSONATE_COOKIE_NAME)?.value

    if (targetUserId && targetUserId !== authUser.id) {
      // Obtener datos del cliente a quien se le brinda soporte
      const { data: targetUser } = await supabase
        .from('users')
        .select('id, email, full_name, account_type, industry, avatar_url')
        .eq('id', targetUserId)
        .maybeSingle()

      if (targetUser) {
        return {
          user: {
            id: targetUser.id,
            email: targetUser.email,
            full_name: targetUser.full_name,
            account_type: targetUser.account_type || 'professional',
            industry: targetUser.industry || 'general',
            avatar_url: targetUser.avatar_url,
          },
          realAdmin: {
            id: authUser.id,
            email: authUser.email,
          },
          isImpersonating: true,
        }
      }
    }
  }

  // 3. Flujo normal (sin impersonación)
  return {
    user: {
      id: authUser.id,
      email: authUser.email,
      full_name: profile?.full_name,
      account_type: profile?.account_type || 'professional',
      industry: profile?.industry || 'general',
      avatar_url: profile?.avatar_url,
    },
    realAdmin: null,
    isImpersonating: false,
  }
}
