import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PatientProfileClient from './PatientProfileClient'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'

export default async function PatientProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    redirect('/auth/login')
  }

  // 1. Obtener expediente del paciente garantizando que pertenezca a la clínica
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .eq('clinic_id', user.id)
    .single()

  if (error || !patient) {
    redirect('/dashboard/patients')
  }

  // 2. Obtener consultas médicas históricas y citas asociadas
  const [
    { data: consultationsData },
    { data: patientBookingsData },
    { data: business }
  ] = await Promise.all([
    supabase
      .from('medical_consultations')
      .select('*, specialists(name, specialty)')
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('bookings')
      .select('*, appointment_services(name, price), specialists(name)')
      .or(`patient_id.eq.${patient.id},customer_phone.eq.${patient.phone || '00000000'}`)
      .order('booking_date', { ascending: false }),
    supabase
      .from('appointment_businesses')
      .select('id, name')
      .eq('user_id', user.id)
      .maybeSingle()
  ])

  // 3. Obtener especialistas y servicios de la clínica para agendar o registrar consultas
  let services: any[] = []
  let specialists: any[] = []
  if (business) {
    const [{ data: srvs }, { data: spcs }] = await Promise.all([
      supabase.from('appointment_services').select('id, name, price, duration').eq('business_id', business.id),
      supabase.from('specialists').select('id, name, specialty').eq('business_id', business.id)
    ])
    services = srvs || []
    specialists = spcs || []
  }

  return (
    <PatientProfileClient 
      patient={patient} 
      consultations={consultationsData || []} 
      bookings={patientBookingsData || []}
      services={services}
      specialists={specialists}
      clinicName={business?.name || 'Clínica / Consultorio'}
    />
  )
}
