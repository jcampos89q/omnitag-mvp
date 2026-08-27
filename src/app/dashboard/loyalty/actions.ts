'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createLoyaltyProgram(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const name = (formData.get('name') as string)?.trim()
  const businessType = (formData.get('business_type') as string) || 'restaurant'
  const rewardTitle = (formData.get('reward_title') as string)?.trim() || '1 Premio Especial Gratis'
  const rewardDescription = (formData.get('reward_description') as string)?.trim() || 'Canjeable en tu próxima visita.'
  const totalStamps = parseInt(formData.get('total_stamps_required') as string) || 6
  const pinCode = (formData.get('pin_code') as string)?.trim() || '1234'
  const cooldownHours = parseInt(formData.get('cooldown_hours') as string) || 12

  const slug = `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`

  await supabase.from('loyalty_programs').insert({
    user_id: user.id,
    name,
    business_type: businessType,
    reward_title: rewardTitle,
    reward_description: rewardDescription,
    total_stamps_required: totalStamps,
    pin_code: pinCode,
    cooldown_hours: cooldownHours,
    slug
  })

  revalidatePath('/dashboard/loyalty')
  revalidatePath('/', 'layout')
}

export async function updateLoyaltyProgram(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const programId = formData.get('program_id') as string
  const name = (formData.get('name') as string)?.trim()
  const businessType = (formData.get('business_type') as string) || 'restaurant'
  const rewardTitle = (formData.get('reward_title') as string)?.trim()
  const rewardDescription = (formData.get('reward_description') as string)?.trim()
  const totalStamps = parseInt(formData.get('total_stamps_required') as string) || 6
  const pinCode = (formData.get('pin_code') as string)?.trim() || '1234'
  const cooldownHours = parseInt(formData.get('cooldown_hours') as string) || 12
  const logoUrl = (formData.get('logo_url') as string)?.trim() || null

  // Parsear tema
  const themePreset = (formData.get('theme_preset') as string) || 'minimal_white'
  const themePrimary = (formData.get('theme_primary_color') as string) || '#0F172A'
  const themeBg = (formData.get('theme_bg_color') as string) || '#F8FAFC'
  const themeCardBg = (formData.get('theme_card_bg') as string) || '#FFFFFF'
  const themeText = (formData.get('theme_text_color') as string) || '#0F172A'
  const themeFont = (formData.get('theme_font_family') as string) || 'jakarta'
  const themeBorder = (formData.get('theme_border_style') as string) || 'rounded'
  const themeIsDark = formData.get('theme_is_dark') === 'true'

  const theme = {
    preset: themePreset,
    primary_color: themePrimary,
    bg_color: themeBg,
    card_bg: themeCardBg,
    text_color: themeText,
    font_family: themeFont,
    border_style: themeBorder,
    is_dark: themeIsDark
  }

  const updateData: any = {
    name,
    business_type: businessType,
    reward_title: rewardTitle,
    reward_description: rewardDescription,
    total_stamps_required: totalStamps,
    pin_code: pinCode,
    cooldown_hours: cooldownHours,
    theme
  }
  if (logoUrl !== undefined) updateData.logo_url = logoUrl

  await supabase
    .from('loyalty_programs')
    .update(updateData)
    .eq('id', programId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard/loyalty')
  revalidatePath('/', 'layout')
}

// Acción pública o de cajero para sumar sello con validación de PIN y Cooldown
export async function validateAndAddStamp(formData: FormData) {
  const supabase = await createClient()

  const programId = formData.get('program_id') as string
  const phone = (formData.get('phone') as string)?.trim()
  const name = (formData.get('name') as string)?.trim() || 'Cliente'
  const pinInput = (formData.get('pin') as string)?.trim()

  if (!programId || !phone || !pinInput) {
    return { success: false, error: 'Datos incompletos.' }
  }

  // 1. Obtener programa y validar PIN
  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('id', programId)
    .eq('is_active', true)
    .maybeSingle()

  if (!program) {
    return { success: false, error: 'Programa de fidelización no encontrado.' }
  }

  if (program.pin_code !== pinInput) {
    return { success: false, error: 'PIN de validación incorrecto.' }
  }

  // 2. Buscar o registrar al cliente
  let { data: member } = await supabase
    .from('loyalty_members')
    .select('*')
    .eq('program_id', programId)
    .eq('customer_phone', phone)
    .maybeSingle()

  if (!member) {
    const { data: newMember, error: createError } = await supabase
      .from('loyalty_members')
      .insert({
        program_id: programId,
        customer_name: name,
        customer_phone: phone,
        current_stamps: 0,
        total_rewards_claimed: 0
      })
      .select('*')
      .single()

    if (createError || !newMember) {
      return { success: false, error: 'Error al registrar al cliente.' }
    }
    member = newMember
  }

  // 3. Validar regla de tiempo antifraude (Cooldown)
  if (member.last_stamp_at && program.cooldown_hours > 0) {
    const lastStampTime = new Date(member.last_stamp_at).getTime()
    const now = new Date().getTime()
    const hoursElapsed = (now - lastStampTime) / (1000 * 60 * 60)

    if (hoursElapsed < program.cooldown_hours) {
      const hoursLeft = Math.ceil(program.cooldown_hours - hoursElapsed)
      return { 
        success: false, 
        error: `Límite alcanzado: Ya registraste una visita hoy. Podrás registrar la próxima en ${hoursLeft} hora(s).` 
      }
    }
  }

  // 4. Sumar el sello
  const newStampCount = (member.current_stamps || 0) + 1
  const isRewardUnlocked = newStampCount >= program.total_stamps_required

  await supabase
    .from('loyalty_members')
    .update({
      customer_name: name,
      current_stamps: newStampCount,
      last_stamp_at: new Date().toISOString()
    })
    .eq('id', member.id)

  // Guardar log
  await supabase.from('loyalty_logs').insert({
    program_id: programId,
    member_id: member.id,
    action: 'stamp_added',
    stamps_at_event: newStampCount
  })

  revalidatePath(`/l/${program.slug}`)
  revalidatePath('/dashboard/loyalty')

  return {
    success: true,
    newStamps: newStampCount,
    totalRequired: program.total_stamps_required,
    isRewardUnlocked
  }
}

// Acción para canjear el premio una vez completada la meta
export async function claimLoyaltyReward(formData: FormData) {
  const supabase = await createClient()

  const programId = formData.get('program_id') as string
  const phone = (formData.get('phone') as string)?.trim()
  const pinInput = (formData.get('pin') as string)?.trim()

  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('id', programId)
    .maybeSingle()

  if (!program || program.pin_code !== pinInput) {
    return { success: false, error: 'PIN de cajero incorrecto para autorizar el canje.' }
  }

  const { data: member } = await supabase
    .from('loyalty_members')
    .select('*')
    .eq('program_id', programId)
    .eq('customer_phone', phone)
    .maybeSingle()

  if (!member || member.current_stamps < program.total_stamps_required) {
    return { success: false, error: 'El cliente aún no ha completado los sellos necesarios.' }
  }

  // Resetear sellos y sumar +1 premio canjeado
  const remainingStamps = member.current_stamps - program.total_stamps_required

  await supabase
    .from('loyalty_members')
    .update({
      current_stamps: Math.max(0, remainingStamps),
      total_rewards_claimed: (member.total_rewards_claimed || 0) + 1
    })
    .eq('id', member.id)

  await supabase.from('loyalty_logs').insert({
    program_id: programId,
    member_id: member.id,
    action: 'reward_claimed',
    stamps_at_event: 0
  })

  revalidatePath(`/l/${program.slug}`)
  revalidatePath('/dashboard/loyalty')

  return { success: true, message: '¡Premio canjeado con éxito!' }
}
