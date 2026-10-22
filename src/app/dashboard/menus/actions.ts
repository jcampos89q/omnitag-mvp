'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { uploadMediaFile } from '@/lib/supabase/storage'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'

export async function createMenu(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase

  try {
    const name = (formData.get('name') as string)?.trim()
    const businessType = (formData.get('business_type') as string) || 'restaurant'
    const currency = (formData.get('currency') as string) || 'USD'
    
    if (!name) {
      redirect('/dashboard/menus?error=' + encodeURIComponent('El nombre del negocio es obligatorio.'))
    }

    const slug = `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`

    const { error } = await db.from('menus').insert({
      user_id: user.id,
      name,
      business_type: businessType,
      slug,
      currency
    })

    if (error) {
      console.error("Error creating menu:", error)
      redirect('/dashboard/menus?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent(`¡Catálogo "${name}" creado exitosamente!`))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error creating menu:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al crear el catálogo'))
  }
}

export async function updateMenu(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase

  try {
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

    const { error } = await db
      .from('menus')
      .update(updateData)
      .eq('id', menuId)
      .eq('user_id', user.id)

    if (error) {
      console.error("Error updating menu:", error)
      redirect('/dashboard/menus?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent('Cambios guardados correctamente.'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error updating menu:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al actualizar menú'))
  }
}

export async function setDailySpecial(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase

  try {
    const menuId = formData.get('menu_id') as string
    const dishId = (formData.get('dish_id') as string)?.trim()
    const name = (formData.get('name') as string)?.trim()
    const description = (formData.get('description') as string)?.trim() || ''
    const price = parseFloat(formData.get('price') as string) || 0
    const imageUrl = (formData.get('image_url') as string)?.trim() || null

    if (!name) {
      redirect('/dashboard/menus?error=' + encodeURIComponent('El nombre del plato del día es obligatorio.'))
    }

    const today = new Date().toISOString().slice(0, 10)

    // Obtener configuración actual del menú
    const { data: menuData } = await db
      .from('menus')
      .select('daily_special')
      .eq('id', menuId)
      .eq('user_id', user.id)
      .single()

    const currentSpecial = menuData?.daily_special || {}
    const isToday = currentSpecial?.date === today && currentSpecial?.is_active

    // Lista de platos del día existentes
    let currentItems: Array<{ id: string; name: string; price: number; description?: string; image_url?: string }> = []
    if (isToday && Array.isArray(currentSpecial.items)) {
      currentItems = [...currentSpecial.items]
    } else if (isToday && currentSpecial.name) {
      currentItems = [{
        id: currentSpecial.id || crypto.randomUUID(),
        name: currentSpecial.name,
        price: currentSpecial.price || 0,
        description: currentSpecial.description || '',
        image_url: currentSpecial.image_url || ''
      }]
    }

    const itemPayload = {
      id: dishId || crypto.randomUUID(),
      name,
      description,
      price,
      image_url: imageUrl || undefined
    }

    if (dishId) {
      const idx = currentItems.findIndex(it => it.id === dishId)
      if (idx >= 0) {
        currentItems[idx] = itemPayload
      } else {
        currentItems.push(itemPayload)
      }
    } else {
      currentItems.push(itemPayload)
    }

    // Configuración de Horario / Turno para el Plato del Día (por defecto Almuerzo: 10:30 AM a 3:30 PM)
    const scheduleType = (formData.get('schedule_type') as string) || currentSpecial.schedule_type || 'lunch'
    let scheduleStart = (formData.get('schedule_start') as string) || currentSpecial.schedule_start || ''
    let scheduleEnd = (formData.get('schedule_end') as string) || currentSpecial.schedule_end || ''
    let scheduleLabel = ''

    if (scheduleType === 'lunch') {
      scheduleStart = scheduleStart || '10:30'
      scheduleEnd = scheduleEnd || '15:30'
      scheduleLabel = 'Almuerzos (10:30 AM - 3:30 PM)'
    } else if (scheduleType === 'breakfast') {
      scheduleStart = scheduleStart || '07:00'
      scheduleEnd = scheduleEnd || '10:30'
      scheduleLabel = 'Desayunos (7:00 AM - 10:30 AM)'
    } else if (scheduleType === 'dinner') {
      scheduleStart = scheduleStart || '18:00'
      scheduleEnd = scheduleEnd || '23:00'
      scheduleLabel = 'Cenas (6:00 PM - 11:00 PM)'
    } else if (scheduleType === 'all_day') {
      scheduleStart = '00:00'
      scheduleEnd = '23:59'
      scheduleLabel = 'Todo el día'
    } else {
      scheduleStart = scheduleStart || '10:30'
      scheduleEnd = scheduleEnd || '15:30'
      scheduleLabel = `Horario: ${scheduleStart} a ${scheduleEnd}`
    }

    const daily_special = {
      name: currentItems[0]?.name || name,
      title: currentItems[0]?.name || name,
      description: currentItems[0]?.description || description,
      price: currentItems[0]?.price || price,
      image_url: currentItems[0]?.image_url || imageUrl,
      date: today,
      is_active: true,
      schedule_type: scheduleType,
      schedule_start: scheduleStart,
      schedule_end: scheduleEnd,
      schedule_label: scheduleLabel,
      items: currentItems
    }

    const { error } = await db
      .from('menus')
      .update({ daily_special })
      .eq('id', menuId)
      .eq('user_id', user.id)

    if (error) {
      console.error("Error setting daily special:", error)
      redirect('/dashboard/menus?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent(`¡Plato del día "${name}" publicado con éxito!`))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error setting daily special:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al publicar especial del día'))
  }
}

export async function removeDailySpecialItem(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase

  try {
    const menuId = formData.get('menu_id') as string
    const dishId = formData.get('dish_id') as string

    const today = new Date().toISOString().slice(0, 10)

    const { data: menuData } = await db
      .from('menus')
      .select('daily_special')
      .eq('id', menuId)
      .eq('user_id', user.id)
      .single()

    const currentSpecial = menuData?.daily_special || {}
    let items: any[] = Array.isArray(currentSpecial.items) ? currentSpecial.items : []

    if (items.length === 0 && currentSpecial.name) {
      items = [{
        id: currentSpecial.id || 'single',
        name: currentSpecial.name,
        price: currentSpecial.price,
        description: currentSpecial.description,
        image_url: currentSpecial.image_url
      }]
    }

    const remainingItems = items.filter(it => it.id !== dishId && it.name !== dishId)

    const updatedSpecial = {
      ...currentSpecial,
      is_active: remainingItems.length > 0,
      name: remainingItems[0]?.name || '',
      title: remainingItems[0]?.name || '',
      price: remainingItems[0]?.price || 0,
      description: remainingItems[0]?.description || '',
      image_url: remainingItems[0]?.image_url || null,
      items: remainingItems
    }

    await db
      .from('menus')
      .update({ daily_special: updatedSpecial })
      .eq('id', menuId)
      .eq('user_id', user.id)

    revalidatePath('/dashboard/menus')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent('Plato del día eliminado.'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error removing daily special item:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al eliminar plato'))
  }
}

export async function deleteDailySpecial(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase

  try {
    const menuId = formData.get('menu_id') as string

    const { error } = await db
      .from('menus')
      .update({ daily_special: { is_active: false, items: [] } })
      .eq('id', menuId)
      .eq('user_id', user.id)

    if (error) {
      console.error("Error deleting daily special:", error)
      redirect('/dashboard/menus?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent('Plato del día desactivado para hoy.'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error deleting daily special:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al desactivar especial'))
  }
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase
  
  try {
    const menuId = formData.get('menu_id') as string
    const name = (formData.get('name') as string)?.trim()
    const scheduleType = (formData.get('schedule_type') as string) || 'all_day'
    const scheduleStart = (formData.get('schedule_start') as string) || ''
    const scheduleEnd = (formData.get('schedule_end') as string) || ''

    if (!name) {
      redirect('/dashboard/menus?error=' + encodeURIComponent('Por favor ingresa un nombre para la categoría.'))
    }

    const { data: newCat, error } = await db.from('menu_categories').insert({
      menu_id: menuId,
      name
    }).select('id').single()

    if (error) {
      console.error("Error creating category:", error)
      redirect('/dashboard/menus?error=' + encodeURIComponent(error.message))
    }

    // Si viene configuración de horario y tenemos el ID del menú
    if (menuId && newCat?.id && scheduleType !== 'all_day') {
      const { data: menuData } = await db
        .from('menus')
        .select('catalog_settings')
        .eq('id', menuId)
        .eq('user_id', user.id)
        .single()

      const currentSettings = menuData?.catalog_settings || {}
      const schedules = currentSettings.category_schedules || {}
      
      schedules[newCat.id] = {
        type: scheduleType,
        start_time: scheduleStart,
        end_time: scheduleEnd,
        updated_at: new Date().toISOString()
      }

      await db
        .from('menus')
        .update({
          catalog_settings: {
            ...currentSettings,
            category_schedules: schedules
          }
        })
        .eq('id', menuId)
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent(`Categoría "${name}" agregada con éxito.`))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error creating category:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al agregar categoría'))
  }
}

export async function updateCategory(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase

  try {
    const categoryId = formData.get('category_id') as string
    const menuId = formData.get('menu_id') as string
    const name = (formData.get('name') as string)?.trim()
    const scheduleType = (formData.get('schedule_type') as string) || 'all_day'
    const scheduleStart = (formData.get('schedule_start') as string) || ''
    const scheduleEnd = (formData.get('schedule_end') as string) || ''

    if (!categoryId || !name) {
      redirect('/dashboard/menus?error=' + encodeURIComponent('El nombre de la categoría es obligatorio.'))
    }

    // Actualizar nombre en menu_categories
    const { error: catErr } = await db
      .from('menu_categories')
      .update({ name })
      .eq('id', categoryId)

    if (catErr) {
      console.error("Error updating category:", catErr)
      redirect('/dashboard/menus?error=' + encodeURIComponent(catErr.message))
    }

    // Si viene menuId, actualizar schedule en catalog_settings
    if (menuId) {
      const { data: menuData } = await db
        .from('menus')
        .select('catalog_settings')
        .eq('id', menuId)
        .eq('user_id', user.id)
        .single()

      const currentSettings = menuData?.catalog_settings || {}
      const schedules = currentSettings.category_schedules || {}
      
      schedules[categoryId] = {
        type: scheduleType,
        start_time: scheduleStart,
        end_time: scheduleEnd,
        updated_at: new Date().toISOString()
      }

      await db
        .from('menus')
        .update({
          catalog_settings: {
            ...currentSettings,
            category_schedules: schedules
          }
        })
        .eq('id', menuId)
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent(`Categoría "${name}" actualizada correctamente.`))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error updating category:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al actualizar categoría'))
  }
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase

  try {
    const categoryId = formData.get('category_id') as string
    const { error } = await db.from('menu_categories').delete().eq('id', categoryId)

    if (error) {
      console.error("Error deleting category:", error)
      redirect('/dashboard/menus?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent('Categoría eliminada.'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error deleting category:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al eliminar categoría'))
  }
}

export async function createMenuItem(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase
  
  try {
    const categoryId = formData.get('category_id') as string
    const name = (formData.get('name') as string)?.trim()
    const description = (formData.get('description') as string)?.trim()
    const price = parseFloat(formData.get('price') as string) || 0
    const priceType = (formData.get('price_type') as string) || 'fixed'
    const durationMinutes = (formData.get('duration_minutes') as string)?.trim() || null
    let imageUrl = (formData.get('image_url') as string)?.trim() || null
    
    if (!name) {
      redirect('/dashboard/menus?error=' + encodeURIComponent('El nombre del platillo/servicio es obligatorio.'))
    }

    // Recoger alérgenos / tags
    const allergens: string[] = []
    if (formData.get('allergen_vegan')) allergens.push('vegan')
    if (formData.get('allergen_spicy')) allergens.push('spicy')
    if (formData.get('allergen_gluten_free')) allergens.push('gluten_free')

    const isFeatured = formData.get('is_featured') === 'on'

    const { error } = await db.from('menu_items').insert({
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

    if (error) {
      console.error("Error creating menu item:", error)
      redirect('/dashboard/menus?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent(`Ítem "${name}" agregado con éxito.`))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error creating item:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al agregar ítem'))
  }
}

export async function deleteMenuItem(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase

  try {
    const itemId = formData.get('item_id') as string
    const { error } = await db.from('menu_items').delete().eq('id', itemId)

    if (error) {
      console.error("Error deleting menu item:", error)
      redirect('/dashboard/menus?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent('Ítem eliminado.'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error deleting item:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al eliminar ítem'))
  }
}

export async function updateMenuItem(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase

  try {
    const itemId = formData.get('item_id') as string
    const categoryId = formData.get('category_id') as string
    const name = (formData.get('name') as string)?.trim()
    const description = (formData.get('description') as string)?.trim() || ''
    const price = parseFloat(formData.get('price') as string) || 0
    const priceType = (formData.get('price_type') as string) || 'fixed'
    const durationMinutes = (formData.get('duration_minutes') as string)?.trim() || null
    const imageUrl = (formData.get('image_url') as string)?.trim()
    const isFeatured = formData.get('is_featured') === 'on' || formData.get('is_featured') === 'true'
    const isAvailable = formData.get('is_available') !== 'false'

    if (!itemId || !name) {
      redirect('/dashboard/menus?error=' + encodeURIComponent('El nombre del platillo/servicio es obligatorio.'))
    }

    const allergens: string[] = []
    if (formData.get('allergen_vegan')) allergens.push('vegan')
    if (formData.get('allergen_spicy')) allergens.push('spicy')
    if (formData.get('allergen_gluten_free')) allergens.push('gluten_free')

    const updatePayload: any = {
      name,
      description,
      price,
      price_type: priceType,
      duration_minutes: durationMinutes,
      allergens,
      is_featured: isFeatured,
      is_available: isAvailable
    }

    if (categoryId) {
      updatePayload.category_id = categoryId
    }

    if (imageUrl !== undefined && imageUrl !== '') {
      updatePayload.image_url = imageUrl
    } else if (formData.get('remove_image') === 'true') {
      updatePayload.image_url = null
    }

    const { error } = await db
      .from('menu_items')
      .update(updatePayload)
      .eq('id', itemId)

    if (error) {
      console.error("Error updating menu item:", error)
      redirect('/dashboard/menus?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent(`Platillo "${name}" actualizado con éxito.`))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error updating item:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al actualizar platillo'))
  }
}

export async function toggleMenuItemFeatured(itemId: string, isFeatured: boolean) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase

  try {
    const { error } = await db
      .from('menu_items')
      .update({ is_featured: isFeatured })
      .eq('id', itemId)

    if (error) {
      console.error("Error toggling item featured:", error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error("Error toggling item featured:", err)
    return { success: false, error: err.message || 'Error al actualizar destacado' }
  }
}

export async function saveAllCategorySchedules(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase

  try {
    const menuId = formData.get('menu_id') as string
    const schedulesJson = formData.get('schedules_json') as string

    if (!menuId || !schedulesJson) {
      redirect('/dashboard/menus?error=' + encodeURIComponent('Datos de configuración incompletos'))
    }

    let parsedSchedules = {}
    try {
      parsedSchedules = JSON.parse(schedulesJson)
    } catch {
      redirect('/dashboard/menus?error=' + encodeURIComponent('Formato de horarios inválido'))
    }

    const { data: menuData } = await db
      .from('menus')
      .select('catalog_settings')
      .eq('id', menuId)
      .eq('user_id', user.id)
      .single()

    const currentSettings = menuData?.catalog_settings || {}

    const { error } = await db
      .from('menus')
      .update({
        catalog_settings: {
          ...currentSettings,
          category_schedules: parsedSchedules
        }
      })
      .eq('id', menuId)

    if (error) {
      redirect('/dashboard/menus?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent('Horarios inteligentes guardados correctamente.'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error saving schedules:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al guardar horarios'))
  }
}

export async function addMenuTable(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase

  try {
    const menuId = formData.get('menu_id') as string
    const tableName = (formData.get('table_name') as string)?.trim()
    if (!menuId || !tableName) {
      redirect('/dashboard/menus?error=' + encodeURIComponent("Nombre de mesa requerido"))
    }

    const { data: menu, error: fetchErr } = await db
      .from('menus')
      .select('id, tables')
      .eq('id', menuId)
      .eq('user_id', user.id)
      .single()

    if (fetchErr || !menu) {
      redirect('/dashboard/menus?error=' + encodeURIComponent("Menú no encontrado"))
    }

    const currentTables: Array<{ id: string; name: string; code: string }> = Array.isArray(menu.tables) ? menu.tables : []

    const code = tableName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-')
    const newTable = {
      id: crypto.randomUUID(),
      name: tableName,
      code
    }

    const updatedTables = [...currentTables, newTable]

    const { error: updateErr } = await db
      .from('menus')
      .update({ tables: updatedTables })
      .eq('id', menuId)

    if (updateErr) {
      redirect('/dashboard/menus?error=' + encodeURIComponent(updateErr.message))
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/dashboard/qr-studio')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent(`¡Mesa "${tableName}" agregada correctamente!`))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error adding table:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al agregar mesa'))
  }
}

export async function generateBatchTables(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase

  try {
    const menuId = formData.get('menu_id') as string
    const prefix = (formData.get('prefix') as string)?.trim() || 'Mesa'
    const count = parseInt(formData.get('count') as string) || 5

    if (!menuId) {
      redirect('/dashboard/menus?error=' + encodeURIComponent("Menú requerido"))
    }

    const { data: menu, error: fetchErr } = await db
      .from('menus')
      .select('id, tables')
      .eq('id', menuId)
      .eq('user_id', user.id)
      .single()

    if (fetchErr || !menu) {
      redirect('/dashboard/menus?error=' + encodeURIComponent("Menú no encontrado"))
    }

    const currentTables: Array<{ id: string; name: string; code: string }> = Array.isArray(menu.tables) ? menu.tables : []
    const existingNames = new Set(currentTables.map(t => t.name.toLowerCase()))

    const newBatch: Array<{ id: string; name: string; code: string }> = []
    for (let i = 1; i <= count; i++) {
      const name = `${prefix} ${i}`
      if (!existingNames.has(name.toLowerCase())) {
        newBatch.push({
          id: crypto.randomUUID(),
          name,
          code: `${prefix.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`
        })
      }
    }

    const updatedTables = [...currentTables, ...newBatch]

    const { error: updateErr } = await db
      .from('menus')
      .update({ tables: updatedTables })
      .eq('id', menuId)

    if (updateErr) {
      redirect('/dashboard/menus?error=' + encodeURIComponent(updateErr.message))
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/dashboard/qr-studio')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent(`¡Se generaron ${newBatch.length} mesas con éxito!`))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error generating tables:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al generar mesas'))
  }
}

export async function deleteMenuTable(formData: FormData) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) throw new Error("No autenticado")
  const db = isImpersonating ? getAdminClient() : supabase

  try {
    const menuId = formData.get('menu_id') as string
    const tableId = formData.get('table_id') as string

    if (!menuId || !tableId) return

    const { data: menu, error: fetchErr } = await db
      .from('menus')
      .select('id, tables')
      .eq('id', menuId)
      .eq('user_id', user.id)
      .single()

    if (fetchErr || !menu) return

    const currentTables: Array<{ id: string; name: string; code: string }> = Array.isArray(menu.tables) ? menu.tables : []
    const updatedTables = currentTables.filter(t => t.id !== tableId)

    const { error: updateErr } = await db
      .from('menus')
      .update({ tables: updatedTables })
      .eq('id', menuId)

    if (updateErr) {
      redirect('/dashboard/menus?error=' + encodeURIComponent(updateErr.message))
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/dashboard/qr-studio')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent('Mesa eliminada correctamente.'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error deleting table:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al eliminar mesa'))
  }
}
