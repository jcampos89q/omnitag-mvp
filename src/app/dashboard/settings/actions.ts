'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SUPPORTED_CURRENCIES } from '@/lib/currency'

export async function updateCurrencySetting(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const currencyCode = (formData.get('currency') as string)?.trim() || 'HNL'
  const matched = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode)
  const currencySymbol = matched ? matched.symbol : 'L.'

  // 1. Actualizar perfil del usuario
  const { error: userError } = await supabase
    .from('users')
    .update({
      currency: currencyCode,
      currency_symbol: currencySymbol
    })
    .eq('id', user.id)

  if (userError) throw new Error(userError.message)

  // 2. Sincronizar con negocios de citas y menús vinculados al usuario
  await Promise.allSettled([
    supabase
      .from('appointment_businesses')
      .update({ currency_symbol: currencySymbol })
      .eq('user_id', user.id),
    supabase
      .from('menus')
      .update({ currency: currencySymbol })
      .eq('user_id', user.id)
  ])

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/appointments')
  revalidatePath('/dashboard/menus')
  revalidatePath('/dashboard/patients')
  revalidatePath('/dashboard/leads')
  revalidatePath('/', 'layout')

  return { success: true }
}
