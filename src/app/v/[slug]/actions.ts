'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveLead(formData: FormData) {
  const supabase = await createClient()
  
  const vcardId = formData.get('vcard_id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const slug = formData.get('slug') as string

  await supabase.from('leads').insert({
    vcard_id: vcardId,
    name,
    email: email || null,
    phone: phone || null
  })

  // We could redirect with ?success=true but let's just revalidate
  revalidatePath(`/v/${slug}`)
}
