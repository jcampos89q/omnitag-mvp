import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PatientsClient from './PatientsClient'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'

export default async function PatientsPage() {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    redirect('/auth/login')
  }

  // Ensure they are in the health industry or admin
  const { data: profile } = await supabase
    .from('users')
    .select('industry, is_admin, currency, currency_symbol')
    .eq('id', user.id)
    .single()
    
  if (profile?.industry !== 'health' && !profile?.is_admin) {
    redirect('/dashboard/settings')
  }

  const [
    { data: patients },
    { data: consultations },
    { data: upcomingBookings }
  ] = await Promise.all([
    supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('medical_consultations')
      .select('id, consultation_fee, payment_status, payment_method, created_at')
      .eq('clinic_id', user.id),
    supabase
      .from('bookings')
      .select('id, booking_date, booking_time, status, customer_name, patient_id')
      .gte('booking_date', new Date().toISOString().slice(0, 10))
      .order('booking_date', { ascending: true })
      .limit(10)
  ])

  // Métricas financieras y operativas de la clínica
  const totalPatients = patients?.length || 0
  const totalConsultations = consultations?.length || 0
  
  const totalEarned = (consultations || [])
    .filter(c => c.payment_status === 'paid')
    .reduce((acc, c) => acc + (Number(c.consultation_fee) || 0), 0)

  const totalPending = (consultations || [])
    .filter(c => c.payment_status === 'pending')
    .reduce((acc, c) => acc + (Number(c.consultation_fee) || 0), 0)

  return (
    <PatientsClient 
      initialPatients={patients || []} 
      currencySymbol={profile?.currency_symbol || 'L.'}
      stats={{
        totalPatients,
        totalConsultations,
        totalEarned,
        totalPending,
        upcomingAppointmentsCount: upcomingBookings?.length || 0
      }}
    />
  )
}
