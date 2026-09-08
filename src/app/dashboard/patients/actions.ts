'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addPatient(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const patient = {
    clinic_id: user.id,
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    birth_date: formData.get('birth_date') ? (formData.get('birth_date') as string) : null,
    blood_type: formData.get('blood_type') as string,
    allergies: formData.get('allergies') as string,
  }

  const { data, error } = await supabase
    .from('patients')
    .insert(patient)
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/patients')
  return data
}

export async function addConsultation(formData: FormData, patientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const consultation = {
    patient_id: patientId,
    clinic_id: user.id,
    reason: formData.get('reason') as string,
    symptoms: formData.get('symptoms') as string,
    diagnosis: formData.get('diagnosis') as string,
    prescription: formData.get('prescription') as string,
    notes: formData.get('notes') as string,
  }

  const { error } = await supabase
    .from('medical_consultations')
    .insert(consultation)

  if (error) throw new Error(error.message)
  
  revalidatePath(`/dashboard/patients/${patientId}`)
}
