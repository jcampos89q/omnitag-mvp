export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import LeadsClient, { Lead } from './LeadsClient'
import { getUserPlanInfo } from '@/lib/plans'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-8 text-center text-gray-500">Inicia sesión para ver tus contactos.</div>
  }

  // 1. Obtener plan y privilegios del usuario (Admins siempre son PRO)
  const { isPro } = await getUserPlanInfo(supabase, user?.id)

  // 2. Buscar entidades pertenecientes al usuario
  const [
    { data: vcards },
    { data: loyaltyPrograms },
    { data: appointmentBusinesses }
  ] = await Promise.all([
    supabase.from('vcards').select('id, slug').eq('user_id', user.id),
    supabase.from('loyalty_programs').select('id, name, slug').eq('user_id', user.id),
    supabase.from('appointment_businesses').select('id, name, slug').eq('user_id', user.id)
  ])

  const vcardIds = vcards?.map(v => v.id) || []
  const loyaltyIds = loyaltyPrograms?.map(l => l.id) || []
  const businessIds = appointmentBusinesses?.map(b => b.id) || []

  // 3. Obtener contactos de todas las fuentes en paralelo
  const [
    { data: leadsTableData },
    { data: loyaltyMembersData },
    { data: bookingsData },
    { data: reviewsData }
  ] = await Promise.all([
    // A. Leads directos (vCards, agendamientos directos, menús)
    vcardIds.length > 0
      ? supabase.from('leads').select('*').or(`user_id.eq.${user.id},vcard_id.in.(${vcardIds.join(',')})`).order('created_at', { ascending: false })
      : supabase.from('leads').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),

    // B. Miembros de programas de fidelización
    loyaltyIds.length > 0
      ? supabase.from('loyalty_members').select('*').in('program_id', loyaltyIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),

    // C. Historial de Citas (para recuperar contactos de citas pasadas, activas o canceladas)
    businessIds.length > 0
      ? supabase.from('bookings').select('id, customer_name, customer_phone, customer_email, booking_date, booking_time, notes, created_at, appointment_services(name), specialists(name)').in('business_id', businessIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),

    // D. Reseñas de clientes que dejaron su WhatsApp
    businessIds.length > 0
      ? supabase.from('specialist_reviews').select('id, customer_name, customer_phone, rating, comment, created_at, specialists(name)').in('business_id', businessIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] })
  ])

  // 4. Mapear y unificar contactos evitando duplicados por teléfono/email
  const seenKeys = new Set<string>()
  const unifiedLeads: Lead[] = []

  // Prioridad 1: Leads de la tabla `leads`
  ;(leadsTableData || []).forEach((l: any) => {
    const key = l.phone?.trim() ? `phone_${l.phone.replace(/\D/g, '')}` : l.email?.trim() ? `email_${l.email.trim().toLowerCase()}` : `id_${l.id}`
    seenKeys.add(key)
    unifiedLeads.push({
      id: l.id,
      name: l.name || 'Contacto',
      email: l.email || null,
      phone: l.phone || null,
      created_at: l.created_at,
      vcard_id: l.vcard_id || null,
      source: (l.source as any) || 'vcard',
      notes: l.notes || null
    })
  })

  // Prioridad 2: Miembros del club de fidelización
  ;(loyaltyMembersData || []).forEach((m: any) => {
    const key = m.customer_phone?.trim() ? `phone_${m.customer_phone.replace(/\D/g, '')}` : `id_${m.id}`
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      unifiedLeads.push({
        id: m.id,
        name: m.customer_name || 'Miembro Club',
        email: null,
        phone: m.customer_phone || null,
        created_at: m.created_at,
        vcard_id: m.program_id,
        source: 'loyalty',
        loyaltyStamps: m.current_stamps
      })
    }
  })

  // Prioridad 3: Clientes de Citas y Reservas
  ;(bookingsData || []).forEach((b: any) => {
    if (!b.customer_name || b.customer_name.startsWith('🔒')) return
    const key = b.customer_phone?.trim() && b.customer_phone !== '00000000'
      ? `phone_${b.customer_phone.replace(/\D/g, '')}`
      : b.customer_email?.trim()
      ? `email_${b.customer_email.trim().toLowerCase()}`
      : `id_${b.id}`

    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      const serviceName = Array.isArray(b.appointment_services) ? b.appointment_services[0]?.name : b.appointment_services?.name
      const specialistName = Array.isArray(b.specialists) ? b.specialists[0]?.name : b.specialists?.name

      unifiedLeads.push({
        id: b.id,
        name: b.customer_name,
        email: b.customer_email || null,
        phone: b.customer_phone && b.customer_phone !== '00000000' ? b.customer_phone : null,
        created_at: b.created_at || new Date().toISOString(),
        source: 'appointment',
        serviceName: serviceName || 'Atención General',
        notes: `Cita: ${b.booking_date} a las ${b.booking_time} (${specialistName || 'Especialista'})`
      })
    }
  })

  // Prioridad 4: Reseñas con teléfono
  ;(reviewsData || []).forEach((r: any) => {
    if (!r.customer_phone) return
    const key = `phone_${r.customer_phone.replace(/\D/g, '')}`
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      const specName = Array.isArray(r.specialists) ? r.specialists[0]?.name : r.specialists?.name
      unifiedLeads.push({
        id: r.id,
        name: r.customer_name || 'Cliente',
        email: null,
        phone: r.customer_phone,
        created_at: r.created_at,
        source: 'review',
        notes: `Calificación ${r.rating}★ a ${specName || 'Especialista'}`
      })
    }
  })

  // Ordenar todos los contactos cronológicamente (más recientes primero)
  unifiedLeads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            Contactos y Clientes (CRM Unificado)
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 leading-relaxed">
            Base centralizada y permanente de todos tus clientes: personas que agendaron <b>Citas</b>, usaron tu <b>vCard</b>, se registraron en tu <b>Tarjeta de Sellos</b> o hicieron pedidos en tu <b>Menú Digital</b>.
          </p>
        </div>

        <LeadsClient leads={unifiedLeads} isPro={isPro} />
      </div>
    </div>
  )
}
