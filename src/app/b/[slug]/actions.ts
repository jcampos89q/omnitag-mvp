'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushNotificationToUser } from '@/lib/push'

export async function createPublicBooking(formData: FormData) {
  const supabase = await createClient()

  const businessId = (formData.get('business_id') as string)?.trim()
  const specialistId = (formData.get('specialist_id') as string)?.trim() || null
  const serviceId = (formData.get('service_id') as string)?.trim() || null
  const customerName = (formData.get('customer_name') as string)?.trim()
  const customerPhone = (formData.get('customer_phone') as string)?.trim()
  const customerEmail = (formData.get('customer_email') as string)?.trim() || null
  const bookingDate = (formData.get('booking_date') as string)?.trim()
  const bookingTime = (formData.get('booking_time') as string)?.trim()
  const notes = (formData.get('notes') as string)?.trim() || null
  const slug = (formData.get('slug') as string)?.trim()

  if (!businessId || !customerName || !customerPhone || !bookingDate || !bookingTime) {
    return { success: false, error: 'Por favor completa todos los campos requeridos.' }
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      business_id: businessId,
      specialist_id: specialistId || null,
      service_id: serviceId || null,
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

    let specialistName = 'Cualquiera disponible'
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

  if (slug) revalidatePath(`/b/${slug}`)
  revalidatePath('/dashboard/appointments')

  return { success: true, booking }
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
