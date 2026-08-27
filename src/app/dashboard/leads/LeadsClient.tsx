'use client'

import { useState } from 'react'
import { Users, Mail, Phone, Calendar, Download, MessageSquare, Search, FileSpreadsheet, UserPlus } from 'lucide-react'

export interface Lead {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  created_at: string
  vcard_id: string
}

export default function LeadsClient({ leads }: { leads: Lead[] }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase()
    return (
      lead.name.toLowerCase().includes(term) ||
      (lead.email && lead.email.toLowerCase().includes(term)) ||
      (lead.phone && lead.phone.includes(term))
    )
  })

  // Generar y descargar vCard (.vcf) directamente en el móvil o PC
  const handleSaveToPhone = (lead: Lead) => {
    const nameParts = lead.name.trim().split(' ')
    const firstName = nameParts[0] || 'Contacto'
    const lastName = nameParts.slice(1).join(' ') || ''

    const vcfLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName};${firstName};;;`,
      `FN:${lead.name}`,
      lead.phone ? `TEL;TYPE=CELL:${lead.phone}` : '',
      lead.email ? `EMAIL;TYPE=INTERNET,HOME:${lead.email}` : '',
      'NOTE:Contacto capturado vía OmniTag vCard',
      'END:VCARD'
    ].filter(Boolean).join('\r\n')

    const blob = new Blob([vcfLines], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${lead.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.vcf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Exportar lista completa a CSV para Excel / CRM
  const handleExportCSV = () => {
    if (leads.length === 0) return

    const headers = ['Nombre', 'Teléfono', 'Email', 'Fecha']
    const rows = leads.map(l => [
      `"${l.name}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${new Date(l.created_at).toLocaleString()}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `contactos_omnitag_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (leads.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 border border-gray-100 rounded-2xl bg-gray-50/50">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="font-bold text-gray-900 text-base">Aún no tienes contactos recolectados</p>
        <p className="text-xs sm:text-sm mt-1 text-gray-500">
          Comparte tu vCard pública para que los visitantes toquen <b>"Intercambiar Contacto"</b>.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barra de Búsqueda y Exportar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, teléfono o correo..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition"
          />
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Descargar Excel / CSV ({leads.length})</span>
        </button>
      </div>

      {/* Vista Móvil (Tarjetas interactivas con botones rápidos) */}
      <div className="block md:hidden space-y-3">
        {filteredLeads.map((lead) => {
          const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : null

          return (
            <div key={lead.id} className="p-4 bg-gray-50/80 border border-gray-200 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">{lead.name}</h3>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(lead.created_at).toLocaleDateString()} • {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Botón Guardar en el Teléfono */}
                <button
                  onClick={() => handleSaveToPhone(lead)}
                  title="Guardar en agenda del móvil"
                  className="p-2 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 transition flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Guardar</span>
                </button>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-xs">
                {lead.phone && (
                  <p className="flex items-center gap-2 text-gray-800 font-medium">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {lead.phone}
                  </p>
                )}
                {lead.email && (
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 truncate">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {lead.email}
                  </a>
                )}
              </div>

              {/* Botones de Acción Directa */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                {cleanPhone ? (
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${lead.name}! Gracias por conectar a través de mi tarjeta digital. ¿Cómo puedo ayudarte hoy?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-[#25D366] text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs hover:bg-[#1EBE57] transition"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    <span>WhatsApp</span>
                  </a>
                ) : (
                  <button disabled className="bg-gray-200 text-gray-400 py-2 px-3 rounded-xl font-bold text-xs opacity-50 cursor-not-allowed">
                    Sin WhatsApp
                  </button>
                )}

                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center justify-center gap-1.5 bg-black text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs hover:bg-gray-800 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Llamar</span>
                  </a>
                ) : lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs hover:bg-blue-700 transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {/* Vista Escritorio (Tabla tradicional enriquecida) */}
      <div className="hidden md:block border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase text-gray-500 font-bold tracking-wider">
              <th className="px-6 py-4">Nombre del Contacto</th>
              <th className="px-6 py-4">Teléfono</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4 text-right">Acciones Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {filteredLeads.map((lead) => {
              const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : null

              return (
                <tr key={lead.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {lead.name}
                  </td>

                  <td className="px-6 py-4">
                    {lead.phone ? (
                      <span className="font-mono text-gray-800 text-xs font-semibold">{lead.phone}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">No provisto</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} className="text-gray-600 hover:text-blue-600 text-xs">
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">No provisto</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Botón Guardar en Teléfono (.vcf) */}
                      <button
                        onClick={() => handleSaveToPhone(lead)}
                        title="Guardar contacto en mi agenda (.vcf)"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition shadow-2xs cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                        <span>Guardar</span>
                      </button>

                      {/* Botón WhatsApp */}
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${lead.name}! Gracias por conectar a través de mi tarjeta digital. ¿Cómo puedo ayudarte hoy?`)}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Enviar WhatsApp directo"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE57] transition shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-white" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
