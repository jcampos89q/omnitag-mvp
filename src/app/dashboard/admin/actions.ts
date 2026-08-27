'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleUserPlan(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  // Verificar rol de Superadministrador
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    throw new Error("No autorizado: Solo administradores pueden modificar planes.")
  }

  const targetUserId = formData.get('target_user_id') as string
  const currentPlan = formData.get('current_plan') as string
  const newPlan = currentPlan === 'pro' ? 'free' : 'pro'

  // Invocar la función RPC con permisos definer en Postgres
  const { data, error } = await supabase.rpc('admin_set_user_plan', {
    p_user_id: targetUserId,
    p_plan: newPlan
  })

  if (error) {
    console.error("Error toggling user plan via RPC:", error)
    // Fallback: actualización directa por si acaso
    await supabase.from('workspaces').update({ plan: newPlan }).eq('id', targetUserId)
  }

  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/billing')
  revalidatePath('/dashboard')
}

export async function activateUserProCash(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    throw new Error("No autorizado: Solo administradores pueden modificar planes.")
  }

  await supabase.rpc('admin_set_user_plan', {
    p_user_id: targetUserId,
    p_plan: 'pro'
  })

  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/billing')
  revalidatePath('/dashboard')
}
