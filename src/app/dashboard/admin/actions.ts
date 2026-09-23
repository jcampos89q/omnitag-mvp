'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushNotificationToUser } from '@/lib/push'

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
  const explicitPlan = formData.get('new_plan') as string
  const currentPlan = formData.get('current_plan') as string
  const newPlan = explicitPlan ? (explicitPlan === 'pro' ? 'pro' : 'free') : (currentPlan === 'pro' ? 'free' : 'pro')

  // Invocar la función RPC con permisos definer en Postgres
  const { data, error } = await supabase.rpc('admin_set_user_plan', {
    p_user_id: targetUserId,
    p_plan: newPlan,
    p_duration_days: 30
  })

  if (error) {
    console.error("Error toggling user plan via RPC:", error)
    await supabase.from('workspaces').update({ plan: newPlan }).eq('id', targetUserId)
  }

  // Notificación Push al celular del usuario
  try {
    if (newPlan === 'pro') {
      await sendPushNotificationToUser(targetUserId, {
        title: '🎉 ¡Tu Plan PRO ha sido Activado!',
        body: 'Tienes 30 días de acceso total ilimitado a descargas HD, CRM y Escudo 5★.',
        url: '/dashboard'
      })
    }
  } catch (err) {
    console.error('Error enviando push en admin plan toggle:', err)
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
    p_plan: 'pro',
    p_duration_days: 30
  })

  try {
    await sendPushNotificationToUser(targetUserId, {
      title: '🎉 ¡Tu Plan PRO ha sido Activado!',
      body: 'Tu pago ha sido registrado. Tienes 30 días de acceso ilimitado a todas las herramientas PRO.',
      url: '/dashboard'
    })
  } catch (err) {
    console.error('Error enviando push:', err)
  }

  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/billing')
  revalidatePath('/dashboard')
}

export async function grantTrialExtension(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    throw new Error("No autorizado: Solo administradores pueden conceder prórrogas.")
  }

  const targetUserId = formData.get('target_user_id') as string
  const days = parseInt(formData.get('days') as string || '3', 10)

  // Invocar la función RPC con SECURITY DEFINER
  const { error } = await supabase.rpc('admin_grant_trial_extension', {
    p_user_id: targetUserId,
    p_days: days
  })

  if (error) {
    console.error("Error concediendo prórroga:", error)
  }

  try {
    await sendPushNotificationToUser(targetUserId, {
      title: '🎁 ¡Prórroga de 3 Días Concedida!',
      body: 'Se te han otorgado 3 días adicionales de acceso completo a OmniTag. ¡Aprovéchalos!',
      url: '/dashboard'
    })
  } catch (err) {
    console.error('Error enviando push en prórroga:', err)
  }

  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/billing')
  revalidatePath('/dashboard')
}

