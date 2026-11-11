'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { IMPERSONATE_COOKIE_NAME } from '@/lib/auth/effectiveUser'

/**
 * Inicia una sesión de soporte / impersonación para ver el panel desde la perspectiva del cliente
 */
export async function startImpersonation(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No autenticado')
  }

  // Verificar que el usuario sea Superadministrador o el Partner dueño de ese sub-cliente
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    const { getAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = getAdminClient()
    const { data: targetAuth } = await adminClient.auth.admin.getUserById(targetUserId)
    const parentResellerId = targetAuth?.user?.user_metadata?.parent_reseller_id
    if (parentResellerId !== user.id) {
      throw new Error('No autorizado: Solo puedes entrar en modo soporte a tus propios sub-clientes.')
    }
  }

  // Guardar cookie de impersonación por 24 horas
  const cookieStore = await cookies()
  cookieStore.set(IMPERSONATE_COOKIE_NAME, targetUserId, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 horas
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/admin')
  redirect('/dashboard')
}

/**
 * Termina la sesión de soporte y regresa al administrador a su panel de control
 */
export async function stopImpersonation() {
  const cookieStore = await cookies()
  cookieStore.delete(IMPERSONATE_COOKIE_NAME)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/reseller')
  revalidatePath('/dashboard/admin')
  redirect('/dashboard/reseller')
}
