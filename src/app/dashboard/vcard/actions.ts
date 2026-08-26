'use server'

import { createClient } from '@/lib/supabase/server'
import { uploadMediaFile } from '@/lib/supabase/storage'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveVCard(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("No autenticado")

  const firstName = (formData.get('first_name') as string)?.trim()
  const lastName = (formData.get('last_name') as string)?.trim()
  const jobTitle = (formData.get('job_title') as string)?.trim()
  const companyName = (formData.get('company_name') as string)?.trim()
  const bio = (formData.get('bio') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  
  // Archivos de imagen subidos
  const avatarFile = formData.get('avatar_file') as File | null
  const coverFile = formData.get('cover_file') as File | null

  // URLs de respaldo o URLs manuales
  let avatarUrl = (formData.get('avatar_url') as string)?.trim() || null
  let coverUrl = (formData.get('cover_url') as string)?.trim() || null

  // Procesar subida de avatar si viene archivo nuevo
  if (avatarFile && avatarFile.size > 0) {
    const uploadedAvatar = await uploadMediaFile(supabase, avatarFile, 'avatars', user.id)
    if (uploadedAvatar) {
      avatarUrl = uploadedAvatar
    }
  }

  // Procesar subida de cover/portada si viene archivo nuevo
  if (coverFile && coverFile.size > 0) {
    const uploadedCover = await uploadMediaFile(supabase, coverFile, 'covers', user.id)
    if (uploadedCover) {
      coverUrl = uploadedCover
    }
  }

  const color = (formData.get('color') as string) || '#000000'
  const instagram = (formData.get('instagram') as string)?.trim()
  const linkedin = (formData.get('linkedin') as string)?.trim()
  const website = (formData.get('website') as string)?.trim()
  const facebook = (formData.get('facebook') as string)?.trim()
  const tiktok = (formData.get('tiktok') as string)?.trim()
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

  // Generate a basic slug if it's new
  const slug = existingVcard 
    ? undefined 
    : `${(firstName || 'usuario').toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`

  const payload = {
    first_name: firstName,
    last_name: lastName,
    job_title: jobTitle,
    company_name: companyName,
    bio,
    contact_info,
    theme,
    avatar_url: avatarUrl,
    cover_url: coverUrl,
    lead_capture_enabled: leadCaptureEnabled
  }

  if (existingVcard) {
    const { error } = await supabase
      .from('vcards')
      .update(payload)
      .eq('id', existingVcard.id)
      
    if (error) console.error("Error updating vCard:", error)
  } else {
    const { error } = await supabase
      .from('vcards')
      .insert({
        user_id: user.id,
        slug,
        ...payload
      })
      
    if (error) console.error("Error inserting vCard:", error)
  }

  revalidatePath('/dashboard/vcard')
  revalidatePath('/v', 'layout')
  redirect('/dashboard/vcard?success=true')
}
