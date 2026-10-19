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
    redirect('/dashboard/menus?success=' + encodeURIComponent('Especial del día publicado con éxito.'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error("Error setting daily special:", err)
    redirect('/dashboard/menus?error=' + encodeURIComponent(err.message || 'Error al publicar especial del día'))
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
      .update({ daily_special: { is_active: false } })
      .eq('id', menuId)
      .eq('user_id', user.id)

    if (error) {
      console.error("Error deleting daily special:", error)
      redirect('/dashboard/menus?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/', 'layout')
    redirect('/dashboard/menus?success=' + encodeURIComponent('Especial del día desactivado.'))
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
    if (!name) {
      redirect('/dashboard/menus?error=' + encodeURIComponent('Por favor ingresa un nombre para la categoría.'))
    }

    const { error } = await db.from('menu_categories').insert({
      menu_id: menuId,
      name
    })

    if (error) {
      console.error("Error creating category:", error)
      redirect('/dashboard/menus?error=' + encodeURIComponent(error.message))
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
