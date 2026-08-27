'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveLead(formData: FormData) {
  const supabase = await createClient()
  
  const vcardId = (formData.get('vcard_id') as string)?.trim()
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim()

  if (!vcardId || !name) {
    return { success: false, error: 'Nombre y vCard requeridos' }
  }

  const { data, error } = await supabase.from('leads').insert({
    vcard_id: vcardId,
    name,
    email: email || null,
    phone: phone || null
  }).select().single()

  if (error) {
    console.error('Error guardando lead en base de datos:', error)
    return { success: false, error: error.message }
  }

  if (slug) {
    revalidatePath(`/v/${slug}`)
  }
  revalidatePath('/dashboard/leads')
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/analytics')

  return { success: true, data }
}
