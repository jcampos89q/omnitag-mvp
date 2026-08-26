'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleUserPlan(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  // Check admin
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

  // Update or insert workspace plan
  const { error } = await supabase
    .from('workspaces')
    .update({ plan: newPlan })
    .eq('id', targetUserId)

  if (error) {
    console.error("Error toggling user plan:", error)
  }

  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/billing')
}
