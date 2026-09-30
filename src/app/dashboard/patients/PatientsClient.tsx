'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  UserCircle, 
  Calendar, 
  Droplet, 
  AlertTriangle, 
  Activity, 
  DollarSign, 
  Clock, 
  Shield, 
  FileText, 
  HeartPulse, 
  CheckCircle2, 
  X,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Stethoscope
} from 'lucide-react'
import Link from 'next/link'
import { addPatient } from './actions'

export type Patient = {
  id: string
  first_name: string
  last_name?: string | null
  email?: string | null
  phone?: string | null
  birth_date?: string | null
  national_id?: string | null
  gender?: string | null
  blood_type?: string | null
  allergies?: string | null
  chronic_conditions?: string | null
  current_medications?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  insurance_provider?: string | null
  insurance_policy_number?: string | null
  address?: string | null
  created_at: string
}

interface PatientsClientProps {
  initialPatients: Patient[]
  currencySymbol?: string
  stats: {
    totalPatients: number
    totalConsultations: number
    totalEarned: number
    totalPending: number
    upcomingAppointmentsCount: number
  }
}

export default function PatientsClient({ initialPatients, stats, currencySymbol = 'L.' }: PatientsClientProps) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const filteredPatients = patients.filter(p => {
    const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase()
    const query = searchTerm.toLowerCase()
    return (
      fullName.includes(query) ||
      (p.email && p.email.toLowerCase().includes(query)) ||
      (p.phone && p.phone.includes(query)) ||
      (p.national_id && p.national_id.toLowerCase().includes(query)) ||
      (p.insurance_provider && p.insurance_provider.toLowerCase().includes(query))
    )
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    try {
      await addPatient(formData)
      setIsModalOpen(false)
      window.location.reload()
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el paciente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header con Título y Botón Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1.5">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Expediente Clínico Electrónico (ECE)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
            Control de Pacientes & Gestión Clínica
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Expedientes médicos, signos vitales, recetas, citas y control de pagos de consultas.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-xs cursor-pointer text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Paciente</span>
        </button>
      </div>

      {/* 2. Tarjetas de Métricas de la Clínica */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5">
            <span>Pacientes</span>
            <UserCircle className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{stats.totalPatients}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Expedientes activos</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5">
            <span>Consultas</span>
            <Stethoscope className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{stats.totalConsultations}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Atenciones registradas</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5">
            <span>Cobrado</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {currencySymbol} {stats.totalEarned.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Ingresos por consultas</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-1.5">
            <span>Por Cobrar</span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {currencySymbol} {stats.totalPending.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Saldos pendientes</p>
        </div>
      </div>

      {/* 3. Buscador y Filtro */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por nombre, identidad / DNI, teléfono o seguro..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-xs"
        />
      </div>

      {/* 4. Lista de Pacientes */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <HeartPulse className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-700">No se encontraron pacientes</p>
            <p className="text-xs text-gray-400 mt-1">Registra a tu primer paciente para abrir su expediente clínico digital.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPatients.map(patient => (
              <Link 
                key={patient.id} 
                href={`/dashboard/patients/${patient.id}`}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 hover:bg-gray-50/80 transition-colors gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center font-extrabold text-sm border border-blue-100 shrink-0">
                    {patient.first_name[0]}{(patient.last_name?.[0] || '')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      {patient.national_id && (
                        <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold">
                          ID: {patient.national_id}
                        </span>
                      )}
                      {patient.blood_type && (
                        <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                          <Droplet className="w-2.5 h-2.5" /> {patient.blood_type}
                        </span>
                      )}
                      {patient.insurance_provider && (
                        <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100 flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" /> {patient.insurance_provider}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                      {patient.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-gray-400" /> {patient.phone}
                        </span>
                      )}
                      {patient.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" /> {patient.email}
                        </span>
                      )}
                      {patient.allergies && (
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-500" /> Alergias: {patient.allergies}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 shrink-0 self-end sm:self-center">
                  {patient.birth_date && (
                    <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{patient.birth_date}</span>
                    </div>
                  )}
                  <span className="text-blue-600 font-bold hover:underline">Ver Expediente →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 5. Modal de Registro Completo de Paciente (ECE) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-blue-600" />
                  Apertura de Expediente Clínico (ECE)
                </h3>
                <p className="text-xs text-gray-400">Ingresa los datos del paciente para su control médico y administrativo.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sección 1: Datos Personales */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                  1. Identificación del Paciente
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nombre(s) *</label>
                    <input 
                      type="text" 
                      name="first_name" 
                      required 
                      placeholder="Ej: Juan Carlos"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Apellidos</label>
                    <input 
                      type="text" 
                      name="last_name" 
                      placeholder="Ej: Martínez Pérez"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Identidad / DNI / Cédula</label>
                    <input 
                      type="text" 
                      name="national_id" 
                      placeholder="Ej: 0801-1990-12345"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de Nacimiento</label>
                    <input 
                      type="date" 
                      name="birth_date" 
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Género</label>
                    <select 
                      name="gender"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                    >
                      <option value="">Seleccionar género...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Sangre</label>
                    <select 
                      name="blood_type"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                    >
                      <option value="">Desconocido...</option>
                      <option value="O+">O Positivo (O+)</option>
                      <option value="O-">O Negativo (O-)</option>
                      <option value="A+">A Positivo (A+)</option>
                      <option value="A-">A Negativo (A-)</option>
                      <option value="B+">B Positivo (B+)</option>
                      <option value="B-">B Negativo (B-)</option>
                      <option value="AB+">AB Positivo (AB+)</option>
                      <option value="AB-">AB Negativo (AB-)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección 2: Contacto & Emergencia */}
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                  2. Contacto & Ubicación
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono / WhatsApp</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      placeholder="+504 9999-9999"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="paciente@correo.com"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Contacto de Emergencia</label>
                    <input 
                      type="text" 
                      name="emergency_contact_name" 
                      placeholder="Nombre y parentesco"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono de Emergencia</label>
                    <input 
                      type="tel" 
                      name="emergency_contact_phone" 
                      placeholder="Número de contacto de emergencia"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Dirección Residencial</label>
                    <input 
                      type="text" 
                      name="address" 
                      placeholder="Colonia, ciudad o dirección"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Antecedentes Clínicos & Seguro */}
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                  3. Antecedentes Clínicos & Seguro Médico
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Aseguradora / Seguro Médico</label>
                    <input 
                      type="text" 
                      name="insurance_provider" 
                      placeholder="Ej: Mapfre, Ficohsa Seguros, Particular"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Número de Póliza / Carnet</label>
                    <input 
                      type="text" 
                      name="insurance_policy_number" 
                      placeholder="Ej: POL-8839201"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-red-600 mb-1">Alergias Críticas (Medicamentos / Alimentos)</label>
                    <input 
                      type="text" 
                      name="allergies" 
                      placeholder="Ej: Penicilina, Sulfas, Mariscos, AINES (Dejar vacío si no presenta)"
                      className="w-full p-2.5 border border-red-200 bg-red-50/30 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Enfermedades Crónicas / Antecedentes</label>
                    <input 
                      type="text" 
                      name="chronic_conditions" 
                      placeholder="Ej: Hipertensión arterial, Diabetes Tipo 2, Asma"
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-5 py-2 text-xs sm:text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creando Expediente...' : 'Crear Expediente Clínico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
