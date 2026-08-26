'use server'

import { createClient } from '@/lib/supabase/server'
import { uploadMediaFile } from '@/lib/supabase/storage'
import { revalidatePath } from 'next/cache'

export async function createMenu(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const name = (formData.get('name') as string)?.trim()
  const currency = (formData.get('currency') as string) || 'USD'
  const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`

  await supabase.from('menus').insert({
    user_id: user.id,
    name,
    slug,
    currency
  })

  revalidatePath('/dashboard/menus')
}

export async function updateMenu(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const menuId = formData.get('menu_id') as string
  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const whatsappNumber = (formData.get('whatsapp_number') as string)?.trim()
  
  const logoFile = formData.get('logo_file') as File | null
  let logoUrl = (formData.get('logo_url') as string)?.trim() || null

  if (logoFile && logoFile.size > 0) {
    const uploadedLogo = await uploadMediaFile(supabase, logoFile, 'menus', user.id)
    if (uploadedLogo) {
      logoUrl = uploadedLogo
    }
  }

  const updateData: any = {
    whatsapp_number: whatsappNumber,
  }
  if (name) updateData.name = name
  if (description !== undefined) updateData.description = description
  if (logoUrl !== undefined) updateData.logo_url = logoUrl

  await supabase
    .from('menus')
    .update(updateData)
    .eq('id', menuId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard/menus')
  revalidatePath('/m', 'layout')
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")
  
  const menuId = formData.get('menu_id') as string
  const name = (formData.get('name') as string)?.trim()

  await supabase.from('menu_categories').insert({
    menu_id: menuId,
    name
  })

  revalidatePath('/dashboard/menus')
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient()
  const categoryId = formData.get('category_id') as string
  await supabase.from('menu_categories').delete().eq('id', categoryId)
  revalidatePath('/dashboard/menus')
}

export async function createMenuItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")
  
  const categoryId = formData.get('category_id') as string
  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const price = parseFloat(formData.get('price') as string) || 0
  
  const imageFile = formData.get('image_file') as File | null
  let imageUrl = (formData.get('image_url') as string)?.trim() || null

  if (imageFile && imageFile.size > 0) {
    const uploaded = await uploadMediaFile(supabase, imageFile, 'items', user.id)
    if (uploaded) {
      imageUrl = uploaded
    }
  }
  
  // Recoger checkboxes de alérgenos y destacado
  const allergens: string[] = []
  if (formData.get('allergen_vegan')) allergens.push('vegan')
  if (formData.get('allergen_spicy')) allergens.push('spicy')
  if (formData.get('allergen_gluten_free')) allergens.push('gluten_free')

  const isFeatured = formData.get('is_featured') === 'on'

  await supabase.from('menu_items').insert({
    category_id: categoryId,
    name,
    description,
    price,
    image_url: imageUrl,
    allergens,
    is_featured: isFeatured,
    is_available: true
  })

  revalidatePath('/dashboard/menus')
  revalidatePath('/m', 'layout')
}

export async function deleteMenuItem(formData: FormData) {
  const supabase = await createClient()
  const itemId = formData.get('item_id') as string
  await supabase.from('menu_items').delete().eq('id', itemId)
  revalidatePath('/dashboard/menus')
  revalidatePath('/m', 'layout')
}
