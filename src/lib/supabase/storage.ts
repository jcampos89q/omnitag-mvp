import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Helper to upload an image file to Supabase Storage bucket 'omnitag_media'
 */
export async function uploadMediaFile(
  supabase: SupabaseClient,
  file: File | null | undefined,
  folder: string,
  userId: string
): Promise<string | null> {
  if (!file || typeof file === 'string' || !(file instanceof File) || file.size === 0) {
    return null
  }

  // Ensure valid extension
  const originalName = file.name || 'image.jpg'
  const fileExt = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const sanitizedBase = originalName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30)
  
  const filePath = `${userId}/${folder}/${Date.now()}_${sanitizedBase}.${fileExt}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error: uploadError } = await supabase.storage
    .from('omnitag_media')
    .upload(filePath, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    })

  if (uploadError) {
    console.error('Error uploading to Supabase Storage:', uploadError)
    throw new Error(`Error al subir archivo: ${uploadError.message}`)
  }

  const { data } = supabase.storage
    .from('omnitag_media')
    .getPublicUrl(filePath)

  return data.publicUrl
}
