'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushNotificationToUser } from '@/lib/push'

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const parts = timeStr.trim().split(' ')
  const timePart = parts[0]
  const modifier = parts[1] || 'AM'
  let [hours, minutes] = timePart.split(':').map(Number)
  if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12
  if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0
  return hours * 60 + (minutes || 0)
}

function isValidUUID(str: string | null | undefined): boolean {
  if (!str) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str.trim())
}

export async function createPublicBooking(formData: FormData) {
  const supabase = await createClient()

  const businessId = (formData.get('business_id') as string)?.trim()
  const rawSpecialistId = (formData.get('specialist_id') as string)?.trim()
  const rawServiceId = (formData.get('service_id') as string)?.trim()
  const specialistId = isValidUUID(rawSpecialistId) ? rawSpecialistId : null
  const serviceId = isValidUUID(rawServiceId) ? rawServiceId : null

  const customerName = (formData.get('customer_name') as string)?.trim()
  const customerPhone = (formData.get('customer_phone') as string)?.trim()
  const customerEmail = (formData.get('customer_email') as string)?.trim() || null
  const bookingDate = (formData.get('booking_date') as string)?.trim()
  const bookingTime = (formData.get('booking_time') as string)?.trim()
  const notes = (formData.get('notes') as string)?.trim() || null
  const slug = (formData.get('slug') as string)?.trim()

  if (!businessId || !isValidUUID(businessId) || !customerName || !customerPhone || !bookingDate || !bookingTime) {
    return { success: false, error: 'Por favor completa todos los campos requeridos.' }
  }

  // Validación estricta usando la zona horaria del cliente
  const clientOffsetStr = formData.get('client_timezone_offset') as string
  const offsetMinutes = clientOffsetStr !== null && clientOffsetStr !== undefined && clientOffsetStr !== ''
    ? parseInt(clientOffsetStr, 10) 
    : 360 // Default a UTC-6 si no viniera offset

  // Calcular la fecha y hora local del cliente independientemente del servidor (Vercel UTC)
  const clientTimeMs = Date.now() - (offsetMinutes * 60 * 1000)
  const clientDate = new Date(clientTimeMs)
  const clientYear = clientDate.getUTCFullYear()
  const clientMonth = String(clientDate.getUTCMonth() + 1).padStart(2, '0')
  const clientDay = String(clientDate.getUTCDate()).padStart(2, '0')
  const clientTodayStr = `${clientYear}-${clientMonth}-${clientDay}`
  const clientCurrentMinutes = clientDate.getUTCHours() * 60 + clientDate.getUTCMinutes()

  if (bookingDate < clientTodayStr) {
    return { success: false, error: 'No es posible agendar citas en fechas pasadas.' }
  }

  if (bookingDate === clientTodayStr) {
    const slotMins = parseTimeToMinutes(bookingTime)
    // Se permite agendar si el horario es posterior a la hora local actual
    if (slotMins < clientCurrentMinutes) {
      return { success: false, error: 'La hora seleccionada ya ha transcurrido. Por favor elige un horario posterior.' }
    }
  }

  let finalSpecialistId = specialistId
  let assignedSpecialistName = ''

  // Si el cliente eligió "Cualquiera disponible", auto-asignar inteligentemente al especialista libre con menor carga
  if (!finalSpecialistId) {
    const { data: activeSpecialists } = await supabase
      .from('specialists')
      .select('id, name')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (activeSpecialists && activeSpecialists.length > 0) {
      // Buscar citas existentes en este día para ver disponibilidad
      const { data: dayBookings } = await supabase
        .from('bookings')
        .select('id, specialist_id, booking_time, appointment_services(duration_minutes)')
        .eq('business_id', businessId)
        .eq('booking_date', bookingDate)
        .neq('status', 'cancelled')

      const slotStart = parseTimeToMinutes(bookingTime)
      const slotEnd = slotStart + 45 // duración estimada

      // Filtrar especialistas que NO tengan conflicto de horario
      const availableSpecialists = activeSpecialists.filter(spec => {
        const hasOverlap = (dayBookings || []).some((b: any) => {
          if (b.specialist_id !== spec.id) return false
          const bStart = parseTimeToMinutes(b.booking_time)
          const bDuration = Array.isArray(b.appointment_services)
            ? b.appointment_services[0]?.duration_minutes || 45
            : b.appointment_services?.duration_minutes || 45
          const bEnd = bStart + bDuration
          return (slotStart < bEnd && slotEnd > bStart)
        })
        return !hasOverlap
      })

      if (availableSpecialists.length > 0) {
        // Contar carga de trabajo del día para balance equitativo
        const workloadMap: Record<string, number> = {}
        availableSpecialists.forEach(s => { workloadMap[s.id] = 0 })
        ;(dayBookings || []).forEach((b: any) => {
          if (b.specialist_id && workloadMap[b.specialist_id] !== undefined) {
            workloadMap[b.specialist_id]++
          }
        })

        // Ordenar por el especialista libre con menor número de citas en el día
        availableSpecialists.sort((a, b) => workloadMap[a.id] - workloadMap[b.id])
        finalSpecialistId = availableSpecialists[0].id
        assignedSpecialistName = availableSpecialists[0].name
      }
    }
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      business_id: businessId,
      specialist_id: finalSpecialistId,
      service_id: serviceId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      booking_date: bookingDate,
      booking_time: bookingTime,
      notes,
      status: 'confirmed'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creando reserva:', error)
    return { success: false, error: error.message }
  }

  // Notificar al dueño del negocio y al especialista
  try {
    const { data: business } = await supabase
      .from('appointment_businesses')
      .select('user_id, name')
      .eq('id', businessId)
      .maybeSingle()

    let specialistName = assignedSpecialistName || 'Cualquiera disponible'
    if (specialistId) {
      const { data: spec } = await supabase
        .from('specialists')
        .select('name')
        .eq('id', specialistId)
        .maybeSingle()
      if (spec?.name) specialistName = spec.name
    }

    if (business?.user_id) {
      // 1. Notificación en Base de Datos
      await supabase.from('notifications').insert({
        user_id: business.user_id,
        title: '📅 ¡Nueva Cita Agendada!',
        message: `${customerName} apartó turno para el ${bookingDate} a las ${bookingTime} con ${specialistName}.`,
        type: 'success',
        link: '/dashboard/appointments'
      })

      // 2. Notificación Push Flotante
      await sendPushNotificationToUser(business.user_id, {
        title: '📅 ¡Nueva Cita Agendada en OmniTag!',
        body: `${customerName} reservó para el ${bookingDate} (${bookingTime}) con ${specialistName}.`,
        url: '/dashboard/appointments'
      })
    }
  } catch (notifErr) {
    console.error('Error enviando notificacion de reserva:', notifErr)
  }

  try {
    revalidatePath('/dashboard/appointments')
  } catch (revErr) {
    console.error('Error revalidando ruta:', revErr)
  }

  return { success: true, booking, assignedSpecialistName }
}

export async function createSpecialistReview(formData: FormData) {
  const supabase = await createClient()

  const specialistId = (formData.get('specialist_id') as string)?.trim()
  const businessId = (formData.get('business_id') as string)?.trim()
  const customerName = (formData.get('customer_name') as string)?.trim() || 'Cliente'
  const rating = parseInt(formData.get('rating') as string) || 5
  const comment = (formData.get('comment') as string)?.trim() || ''
  const slug = (formData.get('slug') as string)?.trim()

  if (!specialistId || !businessId) {
    return { success: false, error: 'Especialista requerido' }
  }

  const { error } = await supabase
    .from('specialist_reviews')
    .insert({
      specialist_id: specialistId,
      business_id: businessId,
      customer_name: customerName,
      rating,
      comment: comment || null
    })

  if (error) {
    console.error('Error guardando reseña:', error)
    return { success: false, error: error.message }
  }

  // Notificar al dueño
  try {
    const { data: business } = await supabase
      .from('appointment_businesses')
      .select('user_id')
      .eq('id', businessId)
      .maybeSingle()

    const { data: spec } = await supabase
      .from('specialists')
      .select('name')
      .eq('id', specialistId)
      .maybeSingle()

    if (business?.user_id) {
      await supabase.from('notifications').insert({
        user_id: business.user_id,
        title: `⭐ ¡Nueva Calificación para ${spec?.name || 'Especialista'}!`,
        message: `${customerName} calificó con ${rating}★: "${comment.slice(0, 70)}${comment.length > 70 ? '...' : ''}"`,
        type: 'info',
        link: '/dashboard/appointments'
      })
    }
  } catch (notifErr) {
    console.error('Error enviando notificacion de review:', notifErr)
  }

  if (slug) revalidatePath(`/b/${slug}`)
  revalidatePath('/dashboard/appointments')

  return { success: true }
}

export async function lookupCustomerBookings(businessId: string, phone: string) {
  const supabase = await createClient()
  const cleanPhone = phone.replace(/\D/g, '')

  if (!cleanPhone || cleanPhone.length < 6) {
    return { success: false, error: 'Por favor ingresa un número de WhatsApp válido.' }
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, specialists(name, role_title), appointment_services(name, price, duration_minutes)')
    .eq('business_id', businessId)
    .ilike('customer_phone', `%${cleanPhone.slice(-8)}%`)
    .order('booking_date', { ascending: false })
    .limit(10)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, bookings: bookings || [] }
}

export async function staffCreateScheduleBlock(formData: FormData) {
  const supabase = await createClient()

  const businessId = (formData.get('business_id') as string)?.trim()
  const specialistId = (formData.get('specialist_id') as string)?.trim()
  const bookingDate = (formData.get('booking_date') as string)?.trim()
  const bookingTime = (formData.get('booking_time') as string)?.trim()
  const reason = (formData.get('reason') as string)?.trim() || '🥗 Almuerzo / Descanso'
  const slug = (formData.get('slug') as string)?.trim()

  if (!businessId || !specialistId || !bookingDate || !bookingTime) {
    return { success: false, error: 'Fecha y hora requeridas' }
  }

  const { error } = await supabase.from('bookings').insert({
    business_id: businessId,
    specialist_id: specialistId,
    customer_name: `🔒 ${reason}`,
    customer_phone: '00000000',
    booking_date: bookingDate,
    booking_time: bookingTime,
    notes: 'Horario bloqueado por el especialista',
    status: 'confirmed'
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (slug) {
    revalidatePath(`/b/${slug}`)
    revalidatePath(`/b/${slug}/staff/${specialistId}`)
  }
  revalidatePath('/dashboard/appointments')

  return { success: true }
}

export async function staffDeleteBooking(formData: FormData) {
  const supabase = await createClient()

  const bookingId = (formData.get('booking_id') as string)?.trim()
  const specialistId = (formData.get('specialist_id') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim()

  if (!bookingId) return

  await supabase.from('bookings').delete().eq('id', bookingId)

  if (slug) {
    revalidatePath(`/b/${slug}`)
    if (specialistId) revalidatePath(`/b/${slug}/staff/${specialistId}`)
  }
  revalidatePath('/dashboard/appointments')
}
