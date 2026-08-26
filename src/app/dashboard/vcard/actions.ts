'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveVCard(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("No autenticado")

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const jobTitle = formData.get('job_title') as string
  const companyName = formData.get('company_name') as string
  const bio = formData.get('bio') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  
  // Nuevos campos
  const avatarUrl = formData.get('avatar_url') as string
  const coverUrl = formData.get('cover_url') as string
  const color = formData.get('color') as string || '#000000'
  const instagram = formData.get('instagram') as string
  const linkedin = formData.get('linkedin') as string
  const website = formData.get('website') as string
  const facebook = formData.get('facebook') as string
  const tiktok = formData.get('tiktok') as string
  const leadCaptureEnabled = formData.get('lead_capture_enabled') === 'on'

  // Check if vcard exists for this user
  const { data: existingVcard } = await supabase
    .from('vcards')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const contact_info = {
    phone,
    email,
    instagram,
    linkedin,
    website,
    facebook,
    tiktok
  }
  
  const theme = {
    color
  }

  // Generate a basic slug if it's new (in a real app we'd ensure uniqueness perfectly)
  const slug = existingVcard 
    ? undefined 
    : `${firstName.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`

  const payload = {
    first_name: firstName,
    last_name: lastName,
    job_title: jobTitle,
    company_name: companyName,
    bio,
    contact_info,
    theme,
    avatar_url: avatarUrl || null,
    cover_url: coverUrl || null,
    lead_capture_enabled: leadCaptureEnabled
  }

  if (existingVcard) {
    // Update
    const { error } = await supabase
      .from('vcards')
      .update(payload)
      .eq('id', existingVcard.id)
      
    if (error) console.error("Error updating:", error)
  } else {
    // Insert
    const { error } = await supabase
      .from('vcards')
      .insert({
        user_id: user.id,
        slug,
        ...payload
      })
      
    if (error) console.error("Error inserting:", error)
  }

  const { redirect } = await import('next/navigation')
  redirect('/dashboard/vcard?success=true')
}
