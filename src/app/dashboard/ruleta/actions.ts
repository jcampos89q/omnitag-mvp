'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Premios por defecto iniciales
const DEFAULT_ITEMS = [
  { label: 'Café Gratis', icon: '☕', bg_color: '#7C3AED', text_color: '#FFFFFF', probability_weight: 25, reward_type: 'free_item', sort_order: 0 },
  { label: 'Postre 2x1', icon: '🍰', bg_color: '#D97706', text_color: '#FFFFFF', probability_weight: 20, reward_type: 'discount', sort_order: 1 },
  { label: '15% Descuento', icon: '🏷️', bg_color: '#059669', text_color: '#FFFFFF', probability_weight: 15, reward_type: 'discount', sort_order: 2 },
  { label: 'Bebida Gratis', icon: '🍹', bg_color: '#DC2626', text_color: '#FFFFFF', probability_weight: 15, reward_type: 'free_item', sort_order: 3 },
  { label: '+1 Sello Extra', icon: '⭐', bg_color: '#2563EB', text_color: '#FFFFFF', probability_weight: 15, reward_type: 'stamp', stamp_count: 1, sort_order: 4 },
  { label: '20% Próxima Visita', icon: '🎟️', bg_color: '#DB2777', text_color: '#FFFFFF', probability_weight: 8, reward_type: 'discount', sort_order: 5 },
  { label: 'Entrada 2x1', icon: '🍔', bg_color: '#4F46E5', text_color: '#FFFFFF', probability_weight: 2, reward_type: 'discount', sort_order: 6 }
]

export async function getOrCreateWheel() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // 1. Buscar si ya tiene una ruleta
  let { data: wheel } = await supabase
    .from('prize_wheels')
    .select('*, prize_wheel_items(*)')
    .eq('user_id', user.id)
    .maybeSingle()

  // 2. Si no existe, crear ruleta inicial por defecto
  if (!wheel) {
    const slug = `ruleta-${user.id.substring(0, 6)}`
    const { data: newWheel, error: createErr } = await supabase
      .from('prize_wheels')
      .insert({
        user_id: user.id,
        slug,
        name: 'Ruleta de la Fortuna VIP',
        description: 'Gira y obtén beneficios exclusivos en tu visita.',
        is_active: true,
        schedule_mode: 'always',
        active_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        cooldown_hours: 24,
        pin_code: '1234'
      })
      .select()
      .single()

    if (createErr || !newWheel) {
      console.error('Error creating default wheel:', createErr)
      throw new Error('No se pudo inicializar la ruleta.')
    }

    // Insertar items por defecto
    const itemsToInsert = DEFAULT_ITEMS.map(it => ({
      wheel_id: newWheel.id,
      ...it
    }))

    await supabase.from('prize_wheel_items').insert(itemsToInsert)

    // Volver a consultar completa
    const { data: completeWheel } = await supabase
      .from('prize_wheels')
      .select('*, prize_wheel_items(*)')
      .eq('id', newWheel.id)
      .single()

    wheel = completeWheel
  }

  // Ordenar items por sort_order
  if (wheel && wheel.prize_wheel_items) {
    wheel.prize_wheel_items.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
  }

  return wheel
}

export async function updateWheelSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const wheelId = formData.get('wheel_id') as string
  const name = (formData.get('name') as string)?.trim() || 'Ruleta de la Fortuna'
  const description = (formData.get('description') as string)?.trim() || ''
  const scheduleMode = (formData.get('schedule_mode') as string) || 'always'
  const pausedMessage = (formData.get('paused_message') as string)?.trim() || 'La ruleta de premios está temporalmente en pausa.'
  const pinCode = (formData.get('pin_code') as string)?.trim() || '1234'
  const cooldownHours = parseInt(formData.get('cooldown_hours') as string) || 24

  // Días activos seleccionados
  const activeDaysRaw = formData.getAll('active_days') as string[]
  const activeDays = activeDaysRaw.length > 0 
    ? activeDaysRaw 
    : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  const startDate = formData.get('start_date') ? new Date(formData.get('start_date') as string).toISOString() : null
  const endDate = formData.get('end_date') ? new Date(formData.get('end_date') as string).toISOString() : null

  const { error } = await supabase
    .from('prize_wheels')
    .update({
      name,
      description,
      schedule_mode: scheduleMode,
      active_days: activeDays,
      start_date: startDate,
      end_date: endDate,
      paused_message: pausedMessage,
      pin_code: pinCode,
      cooldown_hours: cooldownHours,
      updated_at: new Date().toISOString()
    })
    .eq('id', wheelId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/ruleta')
  revalidatePath('/w/[slug]', 'page')
  return { success: true }
}

export async function toggleWheelStatus(wheelId: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const nextStatus = !currentStatus

  const { error } = await supabase
    .from('prize_wheels')
    .update({
      is_active: nextStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', wheelId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/ruleta')
  revalidatePath('/w/[slug]', 'page')
  return { success: true, isActive: nextStatus }
}

export async function saveWheelItems(wheelId: string, items: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // 1. Validar que la ruleta pertenezca al usuario
  const { data: wheel } = await supabase
    .from('prize_wheels')
    .select('id')
    .eq('id', wheelId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!wheel) throw new Error('Ruleta no autorizada')

  // 2. Eliminar items anteriores y reinsertar lista limpia
  await supabase.from('prize_wheel_items').delete().eq('wheel_id', wheelId)

  const itemsToInsert = items.map((it, idx) => ({
    wheel_id: wheelId,
    label: it.label || it.text || 'Premio',
    icon: it.icon || '🎁',
    bg_color: it.bg_color || it.bg || '#7C3AED',
    text_color: it.text_color || '#FFFFFF',
    probability_weight: Math.max(parseInt(it.probability_weight || it.prob || 10), 1),
    reward_type: it.reward_type || (it.label?.includes('Sello') ? 'stamp' : 'discount'),
    stamp_count: parseInt(it.stamp_count || 1),
    max_daily_stock: it.max_daily_stock ? parseInt(it.max_daily_stock) : null,
    is_active: it.is_active !== false,
    sort_order: idx
  }))

  const { error } = await supabase.from('prize_wheel_items').insert(itemsToInsert)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/ruleta')
  revalidatePath('/w/[slug]', 'page')
  return { success: true }
}
