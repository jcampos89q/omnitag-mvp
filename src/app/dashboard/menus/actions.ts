'use server'

import { createClient } from '@/lib/supabase/server'
import { uploadMediaFile } from '@/lib/supabase/storage'
import { revalidatePath } from 'next/cache'

export async function createMenu(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const name = (formData.get('name') as string)?.trim()
  const businessType = (formData.get('business_type') as string) || 'restaurant'
  const currency = (formData.get('currency') as string) || 'USD'
  const slug = `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`

  await supabase.from('menus').insert({
    user_id: user.id,
    name,
    business_type: businessType,
    slug,
    currency
  })

  revalidatePath('/dashboard/menus')
  revalidatePath('/', 'layout')
}

export async function updateMenu(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const menuId = formData.get('menu_id') as string
  const name = (formData.get('name') as string)?.trim()
  const businessType = (formData.get('business_type') as string) || 'restaurant'
  const description = (formData.get('description') as string)?.trim()
  const whatsappNumber = (formData.get('whatsapp_number') as string)?.trim()
  
  let logoUrl = (formData.get('logo_url') as string)?.trim() || null

  // Parsear tema y tipografía
  const themePreset = (formData.get('theme_preset') as string) || 'warm_bistro'
  const themePrimary = (formData.get('theme_primary_color') as string) || (formData.get('color') as string) || '#B45309'
  const themeBg = (formData.get('theme_bg_color') as string) || '#FBF8F3'
  const themeCardBg = (formData.get('theme_card_bg') as string) || '#FFFFFF'
  const themeText = (formData.get('theme_text_color') as string) || '#292524'
  const themeFont = (formData.get('theme_font_family') as string) || 'playfair'
  const themeBorder = (formData.get('theme_border_style') as string) || 'rounded'
  const themeIsDark = formData.get('theme_is_dark') === 'true'

  const theme = {
    preset: themePreset,
    color: themePrimary,
    primary_color: themePrimary,
    bg_color: themeBg,
    card_bg: themeCardBg,
    text_color: themeText,
    font_family: themeFont,
    border_style: themeBorder,
    is_dark: themeIsDark
  }

  const updateData: any = {
    business_type: businessType,
    whatsapp_number: whatsappNumber,
    theme
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
  revalidatePath('/', 'layout')
}

export async function setDailySpecial(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const menuId = formData.get('menu_id') as string
  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const price = parseFloat(formData.get('price') as string) || 0
  const imageUrl = (formData.get('image_url') as string)?.trim() || null

  const today = new Date().toISOString().slice(0, 10)

  const daily_special = {
    name,
    description,
    price,
    image_url: imageUrl,
    date: today,
    is_active: true
  }

  await supabase
    .from('menus')
    .update({ daily_special })
    .eq('id', menuId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard/menus')
  revalidatePath('/', 'layout')
}

export async function deleteDailySpecial(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const menuId = formData.get('menu_id') as string

  await supabase
    .from('menus')
    .update({ daily_special: { is_active: false } })
    .eq('id', menuId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard/menus')
  revalidatePath('/', 'layout')
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
  revalidatePath('/', 'layout')
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient()
  const categoryId = formData.get('category_id') as string
  await supabase.from('menu_categories').delete().eq('id', categoryId)
  revalidatePath('/dashboard/menus')
  revalidatePath('/', 'layout')
}

export async function createMenuItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")
  
  const categoryId = formData.get('category_id') as string
  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const price = parseFloat(formData.get('price') as string) || 0
  const priceType = (formData.get('price_type') as string) || 'fixed'
  const durationMinutes = (formData.get('duration_minutes') as string)?.trim() || null
  let imageUrl = (formData.get('image_url') as string)?.trim() || null
  
  // Recoger alérgenos / tags
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
    price_type: priceType,
    duration_minutes: durationMinutes,
    image_url: imageUrl,
    allergens,
    is_featured: isFeatured,
    is_available: true
  })

  revalidatePath('/dashboard/menus')
  revalidatePath('/', 'layout')
}

export async function deleteMenuItem(formData: FormData) {
  const supabase = await createClient()
  const itemId = formData.get('item_id') as string
  await supabase.from('menu_items').delete().eq('id', itemId)
  revalidatePath('/dashboard/menus')
  revalidatePath('/', 'layout')
}
