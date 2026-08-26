'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createMenu(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const name = formData.get('name') as string
  const currency = formData.get('currency') as string || 'USD'
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
  const menuId = formData.get('menu_id') as string
  const whatsappNumber = formData.get('whatsapp_number') as string

  await supabase
    .from('menus')
    .update({ whatsapp_number: whatsappNumber })
    .eq('id', menuId)

  revalidatePath('/dashboard/menus')
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  
  const menuId = formData.get('menu_id') as string
  const name = formData.get('name') as string

  await supabase.from('menu_categories').insert({
    menu_id: menuId,
    name
  })

  revalidatePath('/dashboard/menus')
}

export async function createMenuItem(formData: FormData) {
  const supabase = await createClient()
  
  const categoryId = formData.get('category_id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const imageUrl = formData.get('image_url') as string
  
  // Recoger checkboxes de alérgenos y destacado
  const allergens = []
  if (formData.get('allergen_vegan')) allergens.push('vegan')
  if (formData.get('allergen_spicy')) allergens.push('spicy')
  if (formData.get('allergen_gluten_free')) allergens.push('gluten_free')

  const isFeatured = formData.get('is_featured') === 'on'

  await supabase.from('menu_items').insert({
    category_id: categoryId,
    name,
    description,
    price,
    image_url: imageUrl || null,
    allergens,
    is_featured: isFeatured
  })

  revalidatePath('/dashboard/menus')
}
