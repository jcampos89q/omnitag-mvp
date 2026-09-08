'use client'

import { useState } from 'react'
import { Plus, Search, UserCircle, Calendar, Droplet, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { addPatient } from './actions'

type Patient = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  birth_date: string
  blood_type: string
  allergies: string
  created_at: string
}

export default function PatientsClient({ initialPatients }: { initialPatients: Patient[] }) {
  const [patients, setPatients] = useState(initialPatients)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPatients = patients.filter(p => 
    (p.first_name + ' ' + p.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await addPatient(formData)
      window.location.reload() // Simple reload to get new data
    } catch (err) {
      alert('Error al guardar el paciente.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Directorio de Pacientes</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus pacientes y su historial clínico.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Paciente</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por nombre, correo o teléfono..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
        />
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron pacientes.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPatients.map(patient => (
              <Link 
                key={patient.id} 
                href={`/dashboard/patients/${patient.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                    {patient.first_name[0]}{patient.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{patient.first_name} {patient.last_name}</h3>
                    <p className="text-xs text-gray-500">{patient.email || patient.phone}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
                  {patient.birth_date && (
                    <div className="flex items-center gap-1.5" title="Fecha de Nacimiento">
                      <Calendar className="w-4 h-4" />
                      <span>{patient.birth_date}</span>
                    </div>
                  )}
                  {patient.blood_type && (
                    <div className="flex items-center gap-1.5 text-red-500 font-medium" title="Tipo de Sangre">
                      <Droplet className="w-4 h-4" />
                      <span>{patient.blood_type}</span>
                    </div>
                  )}
                  {patient.allergies && (
                    <div className="flex items-center gap-1.5 text-orange-500" title="Alergias">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="truncate max-w-[100px]">{patient.allergies}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Modal Agregar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Registrar Paciente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                  <input required name="first_name" type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Apellido</label>
                  <input name="last_name" type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                  <input name="phone" type="text" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">F. de Nacimiento</label>
                  <input name="birth_date" type="date" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Sangre</label>
                  <select name="blood_type" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black outline-none bg-white">
                    <option value="">Desconocido</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alergias</label>
                <input name="allergies" type="text" placeholder="Ej: Penicilina, nueces..." className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-black outline-none" />
              </div>
              
              <div className="pt-4 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800">Guardar Paciente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
