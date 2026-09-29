'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addPatient(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const firstName = (formData.get('first_name') as string)?.trim()
  const lastName = (formData.get('last_name') as string)?.trim() || ''
  const email = (formData.get('email') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || null
  const birthDate = formData.get('birth_date') ? (formData.get('birth_date') as string) : null
  const nationalId = (formData.get('national_id') as string)?.trim() || null
  const gender = (formData.get('gender') as string)?.trim() || null
  const bloodType = (formData.get('blood_type') as string)?.trim() || null
  const allergies = (formData.get('allergies') as string)?.trim() || null
  const chronicConditions = (formData.get('chronic_conditions') as string)?.trim() || null
  const currentMedications = (formData.get('current_medications') as string)?.trim() || null
  const emergencyContactName = (formData.get('emergency_contact_name') as string)?.trim() || null
  const emergencyContactPhone = (formData.get('emergency_contact_phone') as string)?.trim() || null
  const insuranceProvider = (formData.get('insurance_provider') as string)?.trim() || null
  const insurancePolicyNumber = (formData.get('insurance_policy_number') as string)?.trim() || null
  const address = (formData.get('address') as string)?.trim() || null

  if (!firstName) throw new Error('El nombre del paciente es obligatorio')

  const patient = {
    clinic_id: user.id,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    birth_date: birthDate,
    national_id: nationalId,
    gender,
    blood_type: bloodType,
    allergies,
    chronic_conditions: chronicConditions,
    current_medications: currentMedications,
    emergency_contact_name: emergencyContactName,
    emergency_contact_phone: emergencyContactPhone,
    insurance_provider: insuranceProvider,
    insurance_policy_number: insurancePolicyNumber,
    address,
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

export async function updatePatient(formData: FormData, patientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const firstName = (formData.get('first_name') as string)?.trim()
  const lastName = (formData.get('last_name') as string)?.trim() || ''
  const email = (formData.get('email') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || null
  const birthDate = formData.get('birth_date') ? (formData.get('birth_date') as string) : null
  const nationalId = (formData.get('national_id') as string)?.trim() || null
  const gender = (formData.get('gender') as string)?.trim() || null
  const bloodType = (formData.get('blood_type') as string)?.trim() || null
  const allergies = (formData.get('allergies') as string)?.trim() || null
  const chronicConditions = (formData.get('chronic_conditions') as string)?.trim() || null
  const currentMedications = (formData.get('current_medications') as string)?.trim() || null
  const emergencyContactName = (formData.get('emergency_contact_name') as string)?.trim() || null
  const emergencyContactPhone = (formData.get('emergency_contact_phone') as string)?.trim() || null
  const insuranceProvider = (formData.get('insurance_provider') as string)?.trim() || null
  const insurancePolicyNumber = (formData.get('insurance_policy_number') as string)?.trim() || null
  const address = (formData.get('address') as string)?.trim() || null

  if (!firstName) throw new Error('El nombre del paciente es obligatorio')

  const updateData = {
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    birth_date: birthDate,
    national_id: nationalId,
    gender,
    blood_type: bloodType,
    allergies,
    chronic_conditions: chronicConditions,
    current_medications: currentMedications,
    emergency_contact_name: emergencyContactName,
    emergency_contact_phone: emergencyContactPhone,
    insurance_provider: insuranceProvider,
    insurance_policy_number: insurancePolicyNumber,
    address,
  }

  const { error } = await supabase
    .from('patients')
    .update(updateData)
    .eq('id', patientId)
    .eq('clinic_id', user.id)

  if (error) throw new Error(error.message)
  
  revalidatePath(`/dashboard/patients/${patientId}`)
  revalidatePath('/dashboard/patients')
}

export async function deletePatient(patientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', patientId)
    .eq('clinic_id', user.id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/patients')
}

export async function addConsultation(formData: FormData, patientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const reason = (formData.get('reason') as string)?.trim()
  const symptoms = (formData.get('symptoms') as string)?.trim() || null
  const diagnosis = (formData.get('diagnosis') as string)?.trim() || null
  const prescription = (formData.get('prescription') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null

  // Signos vitales
  const bloodPressure = (formData.get('blood_pressure') as string)?.trim() || null
  const heartRate = (formData.get('heart_rate') as string)?.trim() || null
  const tempRaw = formData.get('temperature') as string
  const temperature = tempRaw ? parseFloat(tempRaw) : null
  const weightRaw = formData.get('weight_kg') as string
  const weightKg = weightRaw ? parseFloat(weightRaw) : null
  const heightRaw = formData.get('height_cm') as string
  const heightCm = heightRaw ? parseFloat(heightRaw) : null
  const o2Raw = formData.get('oxygen_saturation') as string
  const oxygenSaturation = o2Raw ? parseFloat(o2Raw) : null

  // Finanzas y citas
  const feeRaw = formData.get('consultation_fee') as string
  const consultationFee = feeRaw ? parseFloat(feeRaw) : 0
  const paymentStatus = (formData.get('payment_status') as string) || 'pending'
  const paymentMethod = (formData.get('payment_method') as string) || null
  const bookingId = (formData.get('booking_id') as string)?.trim() || null
  const specialistId = (formData.get('specialist_id') as string)?.trim() || null

  const consultation = {
    patient_id: patientId,
    clinic_id: user.id,
    reason,
    symptoms,
    diagnosis,
    prescription,
    notes,
    blood_pressure: bloodPressure,
    heart_rate: heartRate,
    temperature,
    weight_kg: weightKg,
    height_cm: heightCm,
    oxygen_saturation: oxygenSaturation,
    consultation_fee: consultationFee,
    payment_status: paymentStatus,
    payment_method: paymentMethod,
    booking_id: bookingId || null,
    specialist_id: specialistId || null
  }

  const { error } = await supabase
    .from('medical_consultations')
    .insert(consultation)

  if (error) throw new Error(error.message)

  // Si estaba asociada a una cita, marcarla como completada
  if (bookingId) {
    try {
      await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId)
    } catch (e) {
      console.error('Error actualizando cita:', e)
    }
  }
  
  revalidatePath(`/dashboard/patients/${patientId}`)
  revalidatePath('/dashboard/patients')
}

export async function updateConsultationPayment(
  consultationId: string, 
  patientId: string, 
  paymentStatus: 'paid' | 'pending' | 'waived', 
  paymentMethod: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { error } = await supabase
    .from('medical_consultations')
    .update({
      payment_status: paymentStatus,
      payment_method: paymentMethod
    })
    .eq('id', consultationId)
    .eq('clinic_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/patients/${patientId}`)
  revalidatePath('/dashboard/patients')
  return { success: true }
}

export async function schedulePatientAppointment(formData: FormData, patientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  // Obtener negocio de citas del doctor/clínica
  const { data: business } = await supabase
    .from('appointment_businesses')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!business) {
    throw new Error('Debes configurar tu consultorio o clínica en la sección de Citas para agendar turnos.')
  }

  // Obtener datos del paciente
  const { data: patient } = await supabase
    .from('patients')
    .select('first_name, last_name, phone, email')
    .eq('id', patientId)
    .single()

  const customerName = `${patient?.first_name || 'Paciente'} ${patient?.last_name || ''}`.trim()
  const customerPhone = patient?.phone || '00000000'
  const customerEmail = patient?.email || null

  const specialistId = (formData.get('specialist_id') as string)?.trim() || null
  const serviceId = (formData.get('service_id') as string)?.trim() || null
  const bookingDate = (formData.get('booking_date') as string)?.trim()
  const bookingTime = (formData.get('booking_time') as string)?.trim()
  const durationMinutes = parseInt(formData.get('duration_minutes') as string, 10) || 30
  const notes = (formData.get('notes') as string)?.trim() || 'Cita agendada desde el expediente'

  if (!bookingDate || !bookingTime) {
    throw new Error('Fecha y hora son obligatorias')
  }

  const { error } = await supabase.from('bookings').insert({
    business_id: business.id,
    patient_id: patientId,
    specialist_id: specialistId || null,
    service_id: serviceId || null,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    booking_date: bookingDate,
    booking_time: bookingTime,
    duration_minutes: durationMinutes,
    notes,
    status: 'confirmed'
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/patients/${patientId}`)
  revalidatePath('/dashboard/appointments')
  return { success: true }
}
