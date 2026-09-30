'use client'

import { useState } from 'react'
import { 
  ArrowLeft, 
  Plus, 
  Clock, 
  FileText, 
  Calendar, 
  Activity, 
  Droplet, 
  AlertTriangle, 
  Phone, 
  Mail, 
  Shield, 
  HeartPulse, 
  CreditCard, 
  CheckCircle2, 
  DollarSign, 
  Printer, 
  MessageSquare, 
  Edit3, 
  Stethoscope, 
  User, 
  CalendarDays, 
  Check, 
  X,
  ExternalLink,
  Pill,
  Thermometer,
  Scale
} from 'lucide-react'
import Link from 'next/link'
import { 
  addConsultation, 
  updatePatient, 
  updateConsultationPayment, 
  schedulePatientAppointment 
} from '../actions'

type Specialist = {
  id: string
  name: string
  specialty?: string
}

type AppointmentService = {
  id: string
  name: string
  price: number
  duration?: number
}

type Consultation = {
  id: string
  patient_id: string
  reason: string
  symptoms?: string | null
  diagnosis?: string | null
  prescription?: string | null
  notes?: string | null
  blood_pressure?: string | null
  heart_rate?: string | null
  temperature?: number | null
  weight_kg?: number | null
  height_cm?: number | null
  oxygen_saturation?: number | null
  consultation_fee?: number | null
  payment_status?: 'paid' | 'pending' | 'waived' | null
  payment_method?: string | null
  created_at: string
  specialists?: {
    name: string
    specialty?: string
  } | null
}

type Booking = {
  id: string
  booking_date: string
  booking_time: string
  status: string
  notes?: string | null
  duration_minutes?: number
  appointment_services?: { name: string; price: number } | null
  specialists?: { name: string } | null
}

interface PatientProfileClientProps {
  patient: any
  consultations: Consultation[]
  bookings: Booking[]
  services: AppointmentService[]
  specialists: Specialist[]
  clinicName: string
  currencySymbol?: string
}

export default function PatientProfileClient({ 
  patient, 
  consultations, 
  bookings, 
  services, 
  specialists,
  clinicName,
  currencySymbol = 'L.'
}: PatientProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'consultations' | 'appointments' | 'billing'>('consultations')
  
  // Modales
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedBookingForConsultation, setSelectedBookingForConsultation] = useState<string | null>(null)
  const [printablePrescription, setPrintablePrescription] = useState<Consultation | null>(null)

  // Loading / Feedback
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')

  // Cálculo de edad
  const calculateAge = (birthDateString?: string | null) => {
    if (!birthDateString) return null
    const birth = new Date(birthDateString)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Cálculo de IMC
  const calculateBMI = (weightKg?: number | null, heightCm?: number | null) => {
    if (!weightKg || !heightCm) return null
    const heightM = heightCm / 100
    const bmi = weightKg / (heightM * heightM)
    return {
      value: bmi.toFixed(1),
      status: bmi < 18.5 ? 'Bajo peso' : bmi < 25 ? 'Peso normal' : bmi < 30 ? 'Sobrepeso' : 'Obesidad'
    }
  }

  // Finanzas del paciente
  const totalBilled = consultations.reduce((acc, c) => acc + (Number(c.consultation_fee) || 0), 0)
  const totalPaid = consultations
    .filter(c => c.payment_status === 'paid')
    .reduce((acc, c) => acc + (Number(c.consultation_fee) || 0), 0)
  const totalPending = totalBilled - totalPaid

  // Guardar Consulta
  async function handleConsultationSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setActionError('')
    const formData = new FormData(e.currentTarget)
    try {
      await addConsultation(formData, patient.id)
      setIsConsultationModalOpen(false)
      window.location.reload()
    } catch (err: any) {
      setActionError(err.message || 'Error al registrar la consulta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Guardar Cita
  async function handleBookingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setActionError('')
    const formData = new FormData(e.currentTarget)
    try {
      await schedulePatientAppointment(formData, patient.id)
      setIsBookingModalOpen(false)
      window.location.reload()
    } catch (err: any) {
      setActionError(err.message || 'Error al agendar la cita.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Editar Paciente
  async function handleEditPatientSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setActionError('')
    const formData = new FormData(e.currentTarget)
    try {
      await updatePatient(formData, patient.id)
      setIsEditModalOpen(false)
      window.location.reload()
    } catch (err: any) {
      setActionError(err.message || 'Error al actualizar expediente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cambiar estado de pago
  async function handlePaymentChange(consultationId: string, status: 'paid' | 'pending' | 'waived', method: string) {
    try {
      await updateConsultationPayment(consultationId, patient.id, status, method)
      window.location.reload()
    } catch (err) {
      alert('Error actualizando pago.')
    }
  }

  // Compartir receta por WhatsApp
  const sharePrescriptionWhatsApp = (c: Consultation) => {
    if (!patient.phone) {
      alert('El paciente no tiene un número telefónico registrado.')
      return
    }
    const cleanPhone = patient.phone.replace(/\D/g, '')
    const msg = `*RECETA MÉDICA - ${clinicName}*\n\n` +
      `*Paciente:* ${patient.first_name} ${patient.last_name || ''}\n` +
      `*Fecha:* ${new Date(c.created_at).toLocaleDateString()}\n` +
      `*Diagnóstico:* ${c.diagnosis || 'Revisión médica'}\n\n` +
      `*Indicaciones & Medicamentos:*\n${c.prescription || 'Ver indicaciones en consulta'}\n\n` +
      `_Atendido por: ${c.specialists?.name || 'Médico Tratante'}._`

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const patientAge = calculateAge(patient.birth_date)

  return (
    <div className="space-y-6">
      {/* 1. Header con Navegación y Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/patients" 
            className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200 text-gray-700"
            title="Volver al Directorio"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {patient.first_name} {patient.last_name}
              </h1>
              {patientAge !== null && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {patientAge} años
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Expediente: {patient.national_id ? `DNI ${patient.national_id}` : `ID-${patient.id.slice(0, 8)}`} • Registrado el {new Date(patient.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Datos</span>
          </button>

          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Agendar Cita</span>
          </button>

          <button
            onClick={() => {
              setSelectedBookingForConsultation(null)
              setIsConsultationModalOpen(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Consulta</span>
          </button>
        </div>
      </div>

      {/* 2. Grid Principal: Sidebar Ficha Clínica + Contenido Operativo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: Expediente Clínico y Antecedentes */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 space-y-4">
            <h2 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center justify-between">
              <span>Ficha Médica & Contacto</span>
              <HeartPulse className="w-4 h-4 text-blue-600" />
            </h2>

            {/* Alertas Médicas Críticas */}
            {patient.allergies ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs space-y-0.5">
                <p className="font-extrabold text-red-700 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> ALERGIAS REGISTRADAS
                </p>
                <p className="text-red-900 font-semibold">{patient.allergies}</p>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sin alergias conocidas reportadas
              </div>
            )}

            {patient.chronic_conditions && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-0.5">
                <p className="font-extrabold text-amber-800">ENFERMEDADES PREEXISTENTES</p>
                <p className="text-amber-950 font-medium">{patient.chronic_conditions}</p>
              </div>
            )}

            {/* Datos Personales y Biológicos */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[10px]">Tipo de Sangre</p>
                <p className="font-extrabold text-gray-900 mt-0.5 flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-red-500" /> {patient.blood_type || 'No registrado'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[10px]">Género</p>
                <p className="font-bold text-gray-900 mt-0.5">{patient.gender || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[10px]">Nacimiento</p>
                <p className="font-bold text-gray-900 mt-0.5">{patient.birth_date || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[10px]">Cédula / DNI</p>
                <p className="font-bold text-gray-900 mt-0.5 font-mono">{patient.national_id || 'Sin DNI'}</p>
              </div>
            </div>

            {/* Seguro Médico */}
            <div className="pt-3 border-t border-gray-100 text-xs">
              <p className="text-gray-400 font-semibold uppercase text-[10px]">Aseguradora / Cobertura</p>
              {patient.insurance_provider ? (
                <div className="mt-1 bg-purple-50 p-2.5 rounded-xl border border-purple-100 text-purple-950">
                  <p className="font-extrabold">{patient.insurance_provider}</p>
                  {patient.insurance_policy_number && (
                    <p className="text-[11px] font-mono text-purple-700 mt-0.5">Póliza: {patient.insurance_policy_number}</p>
                  )}
                </div>
              ) : (
                <p className="font-semibold text-gray-700 mt-0.5">Atención Particular</p>
              )}
            </div>

            {/* Canales de Contacto */}
            <div className="pt-3 border-t border-gray-100 text-xs space-y-2">
              <p className="text-gray-400 font-semibold uppercase text-[10px]">Contacto Directo</p>
              {patient.phone ? (
                <div className="flex items-center justify-between">
                  <span className="font-mono text-gray-800 font-bold">{patient.phone}</span>
                  <a 
                    href={`https://wa.me/${patient.phone.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" /> WhatsApp
                  </a>
                </div>
              ) : (
                <p className="text-gray-400 italic">Sin teléfono</p>
              )}

              {patient.email && (
                <p className="text-gray-600 truncate">{patient.email}</p>
              )}

              {patient.address && (
                <p className="text-gray-500 text-[11px] flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                  <span>{patient.address}</span>
                </p>
              )}
            </div>

            {/* Contacto de Emergencia */}
            {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
              <div className="pt-3 border-t border-gray-100 text-xs bg-gray-50 p-2.5 rounded-xl">
                <p className="text-gray-500 font-bold uppercase text-[10px]">Contacto de Emergencia</p>
                <p className="font-bold text-gray-900 mt-0.5">{patient.emergency_contact_name || 'Familiar'}</p>
                {patient.emergency_contact_phone && (
                  <p className="font-mono text-gray-600 text-[11px] mt-0.5">{patient.emergency_contact_phone}</p>
                )}
              </div>
            )}
          </div>

          {/* Resumen Financiero del Paciente */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 space-y-3">
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-500 flex items-center justify-between">
              <span>Estado de Cuenta</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-400 text-[10px] font-semibold">Total Pagado</p>
                <p className="font-extrabold text-emerald-600 text-sm mt-0.5">{currencySymbol} {totalPaid.toLocaleString('es-HN')}</p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-400 text-[10px] font-semibold">Saldo Pendiente</p>
                <p className="font-extrabold text-amber-600 text-sm mt-0.5">{currencySymbol} {totalPending.toLocaleString('es-HN')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: PESTAÑAS OPERATIVAS (Consultas, Citas, Pagos) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Navegación por Pestañas */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs">
            <button
              onClick={() => setActiveTab('consultations')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'consultations' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Consultas Médicas ({consultations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'appointments' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Citas & Turnos ({bookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'billing' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Control de Pagos</span>
            </button>
          </div>

          {/* TAB 1: CONSULTAS MÉDICAS */}
          {activeTab === 'consultations' && (
            <div className="space-y-4">
              {consultations.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xs">
                  <Stethoscope className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-700 font-bold text-base">Sin consultas registradas</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    Inicia la primera consulta médica de este paciente para registrar signos vitales, diagnóstico y receta.
                  </p>
                  <button 
                    onClick={() => setIsConsultationModalOpen(true)}
                    className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Iniciar Primera Consulta</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultations.map((c) => {
                    const bmi = calculateBMI(c.weight_kg, c.height_cm)
                    return (
                      <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                        {/* Cabecera de la Consulta */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-gray-900">{c.reason}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                c.payment_status === 'paid' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {c.payment_status === 'paid' ? '✓ Cobrado' : '⏳ Cobro Pendiente'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(c.created_at).toLocaleString()} • {c.specialists?.name || 'Médico de turno'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {c.prescription && (
                              <button
                                onClick={() => sharePrescriptionWhatsApp(c)}
                                className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                                title="Enviar receta por WhatsApp al paciente"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Receta WhatsApp</span>
                              </button>
                            )}

                            {c.prescription && (
                              <button
                                onClick={() => setPrintablePrescription(c)}
                                className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition cursor-pointer"
                                title="Imprimir o exportar receta médica"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Imprimir</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Signos Vitales */}
                        {(c.blood_pressure || c.heart_rate || c.temperature || c.weight_kg || c.oxygen_saturation) && (
                          <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Activity className="w-3 h-3 text-blue-600" /> Signos Vitales Registrados
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                              {c.blood_pressure && (
                                <div className="bg-white p-2 rounded-lg border border-blue-100 text-center">
                                  <p className="text-gray-400 text-[10px]">Presión Art.</p>
                                  <p className="font-extrabold text-gray-900">{c.blood_pressure}</p>
                                </div>
                              )}
                              {c.heart_rate && (
                                <div className="bg-white p-2 rounded-lg border border-blue-100 text-center">
                                  <p className="text-gray-400 text-[10px]">Pulso / FC</p>
                                  <p className="font-extrabold text-gray-900">{c.heart_rate} bpm</p>
                                </div>
                              )}
                              {c.temperature && (
                                <div className="bg-white p-2 rounded-lg border border-blue-100 text-center">
                                  <p className="text-gray-400 text-[10px]">Temperatura</p>
                                  <p className="font-extrabold text-gray-900">{c.temperature} °C</p>
                                </div>
                              )}
                              {c.oxygen_saturation && (
                                <div className="bg-white p-2 rounded-lg border border-blue-100 text-center">
                                  <p className="text-gray-400 text-[10px]">SatO2</p>
                                  <p className="font-extrabold text-gray-900">{c.oxygen_saturation}%</p>
                                </div>
                              )}
                              {c.weight_kg && (
                                <div className="bg-white p-2 rounded-lg border border-blue-100 text-center">
                                  <p className="text-gray-400 text-[10px]">Peso / IMC</p>
                                  <p className="font-extrabold text-gray-900">
                                    {c.weight_kg} kg {bmi && `(${bmi.value})`}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Síntomas y Diagnóstico */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {c.symptoms && (
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <p className="font-bold text-gray-700 mb-1">Síntomas / Hallazgos:</p>
                              <p className="text-gray-600 whitespace-pre-wrap">{c.symptoms}</p>
                            </div>
                          )}

                          {c.diagnosis && (
                            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                              <p className="font-bold text-purple-900 mb-1">Diagnóstico Médico:</p>
                              <p className="text-purple-950 font-semibold whitespace-pre-wrap">{c.diagnosis}</p>
                            </div>
                          )}
                        </div>

                        {/* Receta Médica */}
                        {c.prescription && (
                          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs">
                            <p className="font-extrabold text-emerald-900 mb-1 flex items-center gap-1.5">
                              <Pill className="w-3.5 h-3.5 text-emerald-600" /> Prescripción & Medicamentos:
                            </p>
                            <p className="text-emerald-950 font-medium whitespace-pre-wrap">{c.prescription}</p>
                          </div>
                        )}

                        {c.notes && (
                          <div className="text-xs text-gray-500 italic border-t border-gray-100 pt-2">
                            Nota adicional: {c.notes}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CITAS Y TURNOS MÉDICOS */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Agenda de Citas del Paciente</h3>
                  <p className="text-xs text-gray-400">Historial y próximos turnos agendados en consultorio.</p>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-700 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva Cita</span>
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xs">
                  <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-700 font-bold text-base">No hay citas registradas</p>
                  <p className="text-xs text-gray-400 mt-1">Programa una cita médica para el control o seguimiento del paciente.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b.id} className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">
                            {b.appointment_services?.name || 'Consulta Médica'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            b.status === 'completed' 
                              ? 'bg-gray-100 text-gray-600' 
                              : b.status === 'confirmed' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {b.status === 'completed' ? 'Atendida' : b.status === 'confirmed' ? 'Confirmada' : b.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{b.booking_date} a las {b.booking_time}</span>
                          <span>• {b.specialists?.name || 'Consultorio General'}</span>
                        </p>
                        {b.notes && <p className="text-[11px] text-gray-400 italic mt-0.5">{b.notes}</p>}
                      </div>

                      {b.status !== 'completed' && (
                        <button
                          onClick={() => {
                            setSelectedBookingForConsultation(b.id)
                            setIsConsultationModalOpen(true)
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Atender Paciente</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONTROL DE PAGOS Y COBROS */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <h3 className="font-extrabold text-sm text-gray-900 mb-1">Control de Cobros por Consultas</h3>
                <p className="text-xs text-gray-400 mb-4">Registro contable y método de pago de cada atención médica.</p>

                {consultations.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No hay registros de consultas ni cobros pendientes.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px]">
                          <th className="py-2.5">Fecha</th>
                          <th className="py-2.5">Concepto</th>
                          <th className="py-2.5">Honorarios</th>
                          <th className="py-2.5">Estado</th>
                          <th className="py-2.5">Método</th>
                          <th className="py-2.5 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {consultations.map((c) => (
                          <tr key={c.id}>
                            <td className="py-3 font-mono">{new Date(c.created_at).toLocaleDateString()}</td>
                            <td className="py-3 font-semibold text-gray-900">{c.reason}</td>
                            <td className="py-3 font-bold text-gray-900">
                              {currencySymbol} {(Number(c.consultation_fee) || 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                c.payment_status === 'paid' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {c.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                              </span>
                            </td>
                            <td className="py-3 capitalize text-gray-500">
                              {c.payment_method || 'Sin registrar'}
                            </td>
                            <td className="py-3 text-right">
                              {c.payment_status !== 'paid' ? (
                                <button
                                  onClick={() => handlePaymentChange(c.id, 'paid', 'Efectivo')}
                                  className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                                >
                                  Marcar Pagado
                                </button>
                              ) : (
                                <span className="text-[11px] text-gray-400">Completado</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: NUEVA CONSULTA MÉDICA (ECE COMPLETO) */}
      {isConsultationModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  Nueva Consulta Médica (Nota de Evolución)
                </h3>
                <p className="text-xs text-gray-400">
                  Paciente: {patient.first_name} {patient.last_name}
                </p>
              </div>
              <button 
                onClick={() => setIsConsultationModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {actionError}
              </div>
            )}

            <form onSubmit={handleConsultationSubmit} className="space-y-4">
              <input type="hidden" name="booking_id" value={selectedBookingForConsultation || ''} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Motivo de la Consulta *</label>
                  <input 
                    type="text" 
                    name="reason" 
                    required 
                    placeholder="Ej: Control de rutina, dolor lumbar, cefalea"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Médico / Especialista</label>
                  <select 
                    name="specialist_id"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    <option value="">Consultorio Principal</option>
                    {specialists.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.specialty || 'General'})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Signos Vitales */}
              <div className="bg-blue-50/40 p-3.5 rounded-2xl border border-blue-100 space-y-2">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" /> Signos Vitales de Ingreso
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Presión (PA)</label>
                    <input 
                      type="text" 
                      name="blood_pressure" 
                      placeholder="120/80"
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Frec. Card. (FC)</label>
                    <input 
                      type="text" 
                      name="heart_rate" 
                      placeholder="72 bpm"
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Temp (°C)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      name="temperature" 
                      placeholder="36.5"
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Peso (kg)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      name="weight_kg" 
                      placeholder="70.5"
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Talla (cm)</label>
                    <input 
                      type="number" 
                      step="1" 
                      name="height_cm" 
                      placeholder="170"
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Exploración & Diagnóstico */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Síntomas / Exploración Física</label>
                  <textarea 
                    name="symptoms" 
                    rows={2}
                    placeholder="Descripción clínica, examen físico y hallazgos observados..."
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Diagnóstico (Impresión Clínica)</label>
                  <input 
                    type="text" 
                    name="diagnosis" 
                    placeholder="Ej: Faringoamigdalitis aguda bacteriana, Lumbalgia mecánica"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-emerald-600" /> Prescripción & Receta Médica
                  </label>
                  <textarea 
                    name="prescription" 
                    rows={3}
                    placeholder="Medicamentos, dosis, frecuencia, duración y recomendaciones para el paciente..."
                    className="w-full p-2.5 border border-emerald-200 bg-emerald-50/20 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cobro / Finanzas */}
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Honorarios & Cobro de Consulta
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Costo Consulta ({currencySymbol})</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      name="consultation_fee" 
                      placeholder="Ej: 800"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Estado de Pago</label>
                    <select 
                      name="payment_status"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                    >
                      <option value="paid">Pagado en Consulta</option>
                      <option value="pending">Pendiente / Por Cobrar</option>
                      <option value="waived">Cortesía / Sin Costo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Método de Pago</label>
                    <select 
                      name="payment_method"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                      <option value="Transferencia">Transferencia Bancaria</option>
                      <option value="Seguro">Aseguradora Médica</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsConsultationModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-5 py-2 text-xs sm:text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Consulta & Receta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AGENDAR CITA MÉDICA */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Agendar Turno / Cita Médica
                </h3>
                <p className="text-xs text-gray-400">Paciente: {patient.first_name} {patient.last_name}</p>
              </div>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {actionError}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Servicio / Tipo de Consulta</label>
                <select 
                  name="service_id"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                >
                  <option value="">Consulta Médica General</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({currencySymbol} {s.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Médico Tratante</label>
                <select 
                  name="specialist_id"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                >
                  <option value="">Consultorio Principal</option>
                  {specialists.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.specialty || 'General'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de la Cita *</label>
                  <input 
                    type="date" 
                    name="booking_date" 
                    required 
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Hora de la Cita *</label>
                  <input 
                    type="time" 
                    name="booking_time" 
                    required 
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Motivo o Notas</label>
                <input 
                  type="text" 
                  name="notes" 
                  placeholder="Ej: Seguimiento de tratamiento, revisión de exámenes"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-5 py-2 text-xs font-bold rounded-xl hover:bg-blue-700 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Agendando...' : 'Confirmar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDITAR EXPEDIENTE DEL PACIENTE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-lg text-gray-900">Editar Expediente Clínico</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditPatientSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nombre *</label>
                  <input type="text" name="first_name" defaultValue={patient.first_name} required className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Apellidos</label>
                  <input type="text" name="last_name" defaultValue={patient.last_name || ''} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Identidad / DNI</label>
                  <input type="text" name="national_id" defaultValue={patient.national_id || ''} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono / WhatsApp</label>
                  <input type="tel" name="phone" defaultValue={patient.phone || ''} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Sangre</label>
                  <input type="text" name="blood_type" defaultValue={patient.blood_type || ''} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input type="date" name="birth_date" defaultValue={patient.birth_date || ''} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Aseguradora</label>
                  <input type="text" name="insurance_provider" defaultValue={patient.insurance_provider || ''} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Número de Póliza</label>
                  <input type="text" name="insurance_policy_number" defaultValue={patient.insurance_policy_number || ''} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-red-600 mb-1">Alergias Críticas</label>
                  <input type="text" name="allergies" defaultValue={patient.allergies || ''} className="w-full p-2.5 border border-red-200 rounded-xl text-xs sm:text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Enfermedades Crónicas</label>
                  <input type="text" name="chronic_conditions" defaultValue={patient.chronic_conditions || ''} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-5 py-2 text-xs font-bold rounded-xl hover:bg-blue-700">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: VISTA DE IMPRESIÓN DE RECETA MÉDICA */}
      {printablePrescription && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 print:shadow-none print:w-full print:max-w-none print:p-4">
            <div className="flex justify-between items-start border-b-2 border-blue-600 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-blue-900 tracking-tight">{clinicName}</h2>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Receta Médica & Indicaciones</p>
              </div>
              <button 
                onClick={() => setPrintablePrescription(null)}
                className="print:hidden text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p className="text-gray-400 uppercase text-[10px] font-bold">Paciente</p>
                <p className="font-extrabold text-gray-900 text-sm">{patient.first_name} {patient.last_name}</p>
                {patientAge !== null && <p className="text-gray-500 text-[11px]">{patientAge} años</p>}
              </div>
              <div>
                <p className="text-gray-400 uppercase text-[10px] font-bold">Fecha de Emisión</p>
                <p className="font-extrabold text-gray-900 text-sm">{new Date(printablePrescription.created_at).toLocaleDateString()}</p>
                <p className="text-gray-500 text-[11px]">{printablePrescription.specialists?.name || 'Médico Tratante'}</p>
              </div>
              {printablePrescription.diagnosis && (
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <p className="text-gray-400 uppercase text-[10px] font-bold">Diagnóstico</p>
                  <p className="font-bold text-gray-800">{printablePrescription.diagnosis}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wider text-blue-900 flex items-center gap-1.5 border-b border-gray-100 pb-1">
                <Pill className="w-4 h-4 text-blue-600" /> Prescripción Farmacológica
              </h4>
              <div className="p-4 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm whitespace-pre-wrap font-sans text-gray-800 leading-relaxed min-h-36">
                {printablePrescription.prescription || 'Sin indicaciones farmacológicas.'}
              </div>
            </div>

            <div className="pt-10 flex justify-between items-end text-center text-xs text-gray-400">
              <div className="w-48 border-t border-gray-300 pt-1 text-center">
                <p className="font-bold text-gray-700">{printablePrescription.specialists?.name || 'Firma & Sello Médico'}</p>
                <p className="text-[10px] text-gray-400">Colegiación Médica</p>
              </div>
              <p className="text-[10px] italic">Documento emitido por OmniTag Health</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 print:hidden">
              <button 
                type="button" 
                onClick={() => setPrintablePrescription(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Cerrar
              </button>
              <button 
                type="button" 
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-5 py-2 text-xs font-bold rounded-xl hover:bg-blue-700 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Receta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
