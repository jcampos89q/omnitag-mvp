'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Clock, FileText, Calendar, Activity } from 'lucide-react'
import Link from 'next/link'
import { addConsultation } from '../actions'

type Consultation = {
  id: string
  date: string
  reason: string
  symptoms: string
  diagnosis: string
  prescription: string
  notes: string
  created_at: string
}

type PatientProfileClientProps = {
  patient: any
  consultations: Consultation[]
}

export default function PatientProfileClient({ patient, consultations }: PatientProfileClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await addConsultation(formData, patient.id)
      window.location.reload()
    } catch (err) {
      alert('Error al guardar la consulta.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{patient.first_name} {patient.last_name}</h1>
          <p className="text-sm text-gray-500">ID: {patient.id.slice(0,8)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Info */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 h-fit space-y-4">
          <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Datos del Paciente</h2>
          
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Contacto</p>
            <p className="text-sm text-gray-900 mt-1">{patient.email || 'Sin correo'}</p>
            <p className="text-sm text-gray-900">{patient.phone || 'Sin teléfono'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Nacimiento</p>
            <p className="text-sm text-gray-900 mt-1">{patient.birth_date ? new Date(patient.birth_date).toLocaleDateString() : 'No registrado'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Tipo de Sangre</p>
            <div className="flex items-center gap-2 mt-1">
              <DropletIcon bloodType={patient.blood_type} />
              <p className="text-sm font-bold text-gray-900">{patient.blood_type || 'No registrado'}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Alergias</p>
            {patient.allergies ? (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg mt-1 border border-red-100">{patient.allergies}</p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">Ninguna registrada</p>
            )}
          </div>
        </div>

        {/* Historial Clínico */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Historial Clínico</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Consulta</span>
            </button>
          </div>

          {consultations.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-gray-900 font-bold">Sin historial médico</h3>
              <p className="text-gray-500 text-sm mt-1">No hay consultas registradas para este paciente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map(consult => (
                <div key={consult.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-purple-700 bg-purple-50 px-2 py-1 rounded-md text-xs font-bold border border-purple-100">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(consult.created_at).toLocaleDateString()} a las {new Date(consult.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {consult.reason && (
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Motivo de Consulta</p>
                        <p className="text-sm text-gray-900">{consult.reason}</p>
                      </div>
                    )}
                    {consult.symptoms && (
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Síntomas</p>
                        <p className="text-sm text-gray-900">{consult.symptoms}</p>
                      </div>
                    )}
                    {consult.diagnosis && (
                      <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-700 font-bold uppercase flex items-center gap-1 mb-1"><Activity className="w-3.5 h-3.5" /> Diagnóstico</p>
                        <p className="text-sm text-gray-900 font-medium">{consult.diagnosis}</p>
                      </div>
                    )}
                    {consult.prescription && (
                      <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                        <p className="text-xs text-green-700 font-bold uppercase flex items-center gap-1 mb-1"><FileText className="w-3.5 h-3.5" /> Receta / Tratamiento</p>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{consult.prescription}</p>
                      </div>
                    )}
                    {consult.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Notas Privadas</p>
                        <p className="text-sm text-gray-700 italic">{consult.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Nueva Consulta */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Registrar Consulta Médica</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de Consulta *</label>
                <input required name="reason" type="text" placeholder="Ej: Chequeo general, Dolor abdominal..." className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Síntomas</label>
                <textarea name="symptoms" rows={2} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Describe los síntomas del paciente..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> Diagnóstico Médico
                </label>
                <textarea name="diagnosis" rows={2} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Escribe tu diagnóstico..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-500" /> Tratamiento / Receta
                </label>
                <textarea name="prescription" rows={3} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Medicamentos, dosis y frecuencia..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (Privadas)</label>
                <textarea name="notes" rows={2} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-gray-50" placeholder="Observaciones adicionales exclusivas para ti..."></textarea>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700">Guardar Ficha</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function DropletIcon({ bloodType }: { bloodType: string }) {
  if (!bloodType) return <div className="w-6 h-6 bg-gray-100 rounded-full"></div>
  return (
    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-500">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
    </div>
  )
}
