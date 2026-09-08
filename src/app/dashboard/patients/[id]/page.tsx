import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PatientProfileClient from './PatientProfileClient'

export default async function PatientProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch patient ensuring it belongs to the clinic (user.id)
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', params.id)
    .eq('clinic_id', user.id)
    .single()

  if (error || !patient) {
    redirect('/dashboard/patients') // Not found or no access
  }

  const { data: consultations } = await supabase
    .from('medical_consultations')
    .select('*')
    .eq('patient_id', patient.id)
    .order('created_at', { ascending: false })

  return <PatientProfileClient patient={patient} consultations={consultations || []} />
}
