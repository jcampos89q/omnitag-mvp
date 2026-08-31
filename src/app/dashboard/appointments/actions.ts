'use server'

import { createClient } from '@/lib/supabase/server'
import { uploadMediaFile } from '@/lib/supabase/storage'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUserPlanInfo } from '@/lib/plans'

export async function createOrUpdateBusiness(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  try {
    const name = (formData.get('name') as string)?.trim()
  const category = (formData.get('category') as string) || 'barbershop'
  const address = (formData.get('address') as string)?.trim() || ''
  const phone = (formData.get('phone') as string)?.trim() || ''
  const whatsapp = (formData.get('whatsapp') as string)?.trim() || ''
  const instagram = (formData.get('instagram') as string)?.trim() || ''

  if (!name) throw new Error("El nombre del negocio es obligatorio")

  const { data: existing } = await supabase
    .from('appointment_businesses')
    .select('id, slug')
    .eq('user_id', user.id)
    .maybeSingle()

  const slug = existing
    ? existing.slug
    : `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`

  const slotInterval = parseInt(formData.get('slot_interval') as string) || 30
  const lunchEnabled = formData.get('lunch_break_enabled') === 'on'
  const lunchStart = (formData.get('lunch_break_start') as string) || '12:00 PM'
  const lunchEnd = (formData.get('lunch_break_end') as string) || '01:00 PM'

  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
  const daysConfig: Record<string, { enabled: boolean; open: string; close: string }> = {}

  dayKeys.forEach(day => {
    const enabled = formData.get(`${day}_enabled`) === 'on'
    const open = (formData.get(`${day}_open`) as string) || '08:00 AM'
    const close = (formData.get(`${day}_close`) as string) || '07:00 PM'
    daysConfig[day] = { enabled, open, close }
  })

  const schedule_config = {
    slot_interval: slotInterval,
    lunch_break: {
      enabled: lunchEnabled,
      start: lunchStart,
      end: lunchEnd
    },
    days: daysConfig
  }

  const payload = {
    name,
    category,
    address,
    phone,
    whatsapp,
    instagram,
    schedule_config,
    is_active: true,
    updated_at: new Date().toISOString()
  }

  if (existing) {
    await supabase.from('appointment_businesses').update(payload).eq('id', existing.id)
  } else {
    await supabase.from('appointment_businesses').insert({
      user_id: user.id,
      slug,
      ...payload
    })
  }

    revalidatePath('/dashboard/appointments')
    revalidatePath('/', 'layout')
    redirect('/dashboard/appointments?success=' + encodeURIComponent('¡Configuración y horarios guardados correctamente!'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    throw err
  }
}

export async function createSpecialist(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  try {
    const businessId = formData.get('business_id') as string
    const name = (formData.get('name') as string)?.trim()
    const roleTitle = (formData.get('role_title') as string)?.trim() || 'Especialista'
    const phone = (formData.get('phone') as string)?.trim() || ''
    const bio = (formData.get('bio') as string)?.trim() || ''
    const avatarUrl = (formData.get('avatar_url') as string)?.trim() || null
    const accessPin = (formData.get('access_pin') as string)?.trim() || Math.floor(1000 + Math.random() * 9000).toString()

    if (!name || !businessId) throw new Error("Nombre requerido")

    await supabase.from('specialists').insert({
      business_id: businessId,
      name,
      role_title: roleTitle,
      phone,
      bio,
      avatar_url: avatarUrl,
      access_pin: accessPin,
      is_active: true
    })

    revalidatePath('/dashboard/appointments')
    redirect('/dashboard/appointments?success=' + encodeURIComponent('¡Especialista agregado con éxito!'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    throw err
  }
}

export async function updateSpecialistPin(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  try {
    const specialistId = formData.get('specialist_id') as string
    const accessPin = (formData.get('access_pin') as string)?.trim()

    if (!specialistId || !accessPin) return

    await supabase
      .from('specialists')
      .update({ access_pin: accessPin })
      .eq('id', specialistId)

    revalidatePath('/dashboard/appointments')
    redirect('/dashboard/appointments?success=' + encodeURIComponent('PIN de seguridad actualizado'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    throw err
  }
}

export async function deleteSpecialist(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const specialistId = formData.get('specialist_id') as string
  if (!specialistId) return

  await supabase.from('specialists').delete().eq('id', specialistId)
  revalidatePath('/dashboard/appointments')
}

export async function createService(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  try {
    const businessId = formData.get('business_id') as string
    const specialistId = (formData.get('specialist_id') as string)?.trim() || null
    const name = (formData.get('name') as string)?.trim()
    const description = (formData.get('description') as string)?.trim() || ''
    const price = parseFloat(formData.get('price') as string) || 0
    const duration = parseInt(formData.get('duration_minutes') as string) || 45

    if (!name || !businessId) throw new Error("Nombre requerido")

    await supabase.from('appointment_services').insert({
      business_id: businessId,
      specialist_id: specialistId || null,
      name,
      description,
      price,
      duration_minutes: duration,
      is_active: true
    })

    revalidatePath('/dashboard/appointments')
    redirect('/dashboard/appointments?success=' + encodeURIComponent('¡Servicio agregado con éxito!'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    throw err
  }
}

export async function deleteService(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  try {
    const serviceId = formData.get('service_id') as string
    if (!serviceId) return

    await supabase.from('appointment_services').delete().eq('id', serviceId)
    revalidatePath('/dashboard/appointments')
    redirect('/dashboard/appointments?success=' + encodeURIComponent('Servicio eliminado correctamente'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    throw err
  }
}

export async function updateBookingStatus(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  try {
    const bookingId = formData.get('booking_id') as string
    const status = formData.get('status') as string

    if (!bookingId || !status) return

    await supabase.from('bookings').update({ status }).eq('id', bookingId)
    revalidatePath('/dashboard/appointments')
    redirect('/dashboard/appointments?success=' + encodeURIComponent('Estado de cita actualizado'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    throw err
  }
}

export async function toggleSpecialistAvailability(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  try {
    const specialistId = formData.get('specialist_id') as string
    const isActive = formData.get('is_active') === 'true'

    if (!specialistId) return

    await supabase
      .from('specialists')
      .update({ is_active: isActive })
      .eq('id', specialistId)

    revalidatePath('/dashboard/appointments')
    revalidatePath('/', 'layout')
    redirect('/dashboard/appointments?success=' + encodeURIComponent('Disponibilidad del especialista actualizada'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    throw err
  }
}

export async function createManualBlockOrBooking(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  try {
    const businessId = (formData.get('business_id') as string)?.trim()
    const specialistId = (formData.get('specialist_id') as string)?.trim() || null
    const bookingDate = (formData.get('booking_date') as string)?.trim()
    const bookingTime = (formData.get('booking_time') as string)?.trim()
    const reason = (formData.get('reason') as string)?.trim() || 'Bloqueo / Salida Temprana'

    if (!businessId || !bookingDate || !bookingTime) {
      throw new Error("Fecha y hora requeridas")
    }

    await supabase.from('bookings').insert({
      business_id: businessId,
      specialist_id: specialistId || null,
      customer_name: `🔒 ${reason}`,
      customer_phone: '00000000',
      booking_date: bookingDate,
      booking_time: bookingTime,
      notes: 'Horario bloqueado por el administrador',
      status: 'confirmed'
    })

    revalidatePath('/dashboard/appointments')
    revalidatePath('/', 'layout')
    redirect('/dashboard/appointments?success=' + encodeURIComponent('¡Horario bloqueado con éxito!'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    throw err
  }
}

export async function deleteBooking(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  try {
    const bookingId = formData.get('booking_id') as string
    if (!bookingId) return

    await supabase.from('bookings').delete().eq('id', bookingId)
    revalidatePath('/dashboard/appointments')
    redirect('/dashboard/appointments?success=' + encodeURIComponent('Registro eliminado correctamente'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    throw err
  }
}

export async function deleteSpecialistReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  try {
    const reviewId = formData.get('review_id') as string
    if (!reviewId) return

    await supabase.from('specialist_reviews').delete().eq('id', reviewId)
    revalidatePath('/dashboard/appointments')
    redirect('/dashboard/appointments?success=' + encodeURIComponent('Opinión eliminada correctamente'))
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    throw err
  }
}
