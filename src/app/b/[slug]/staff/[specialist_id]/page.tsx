import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import StaffPortalClient from './StaffPortalClient'

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; specialist_id: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { slug, specialist_id } = await params

  const { data: specialist } = await supabase
    .from('specialists')
    .select('name')
    .eq('id', specialist_id)
    .maybeSingle()

  return {
    title: specialist?.name ? `Mi Agenda - ${specialist.name} | OmniTag` : 'Portal del Especialista',
  }
}

export default async function SpecialistPortalPage({
  params
}: {
  params: Promise<{ slug: string; specialist_id: string }>
}) {
  const supabase = await createClient()
  const { slug, specialist_id } = await params

  // 1. Buscar negocio
  const { data: business } = await supabase
    .from('appointment_businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!business) {
    notFound()
  }

  // 2. Buscar especialista
  const { data: specialist } = await supabase
    .from('specialists')
    .select('*')
    .eq('id', specialist_id)
    .eq('business_id', business.id)
    .maybeSingle()

  if (!specialist) {
    notFound()
  }

  // 3. Buscar citas del especialista
  const todayStr = new Date().toISOString().slice(0, 10)
  const [
    { data: bookings },
    { data: reviews }
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, appointment_services(name, price, duration_minutes)')
      .eq('specialist_id', specialist.id)
      .gte('booking_date', todayStr)
      .order('booking_time', { ascending: true }),
    supabase
      .from('specialist_reviews')
      .select('*')
      .eq('specialist_id', specialist.id)
  ])

  return (
    <StaffPortalClient
      business={business}
      specialist={specialist}
      initialBookings={bookings || []}
      reviews={reviews || []}
    />
  )
}
