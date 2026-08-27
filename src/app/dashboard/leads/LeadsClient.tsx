'use client'

import { useState } from 'react'
import { Users, Mail, Phone, Calendar, Download, MessageSquare, Search, FileSpreadsheet, UserPlus, Gift, UserCircle } from 'lucide-react'

export interface Lead {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  created_at: string
  vcard_id: string
  source?: 'vcard' | 'loyalty'
  loyaltyStamps?: number
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

    const note = lead.source === 'loyalty'
      ? `Cliente del Club de Fidelización OmniTag (${lead.loyaltyStamps || 1} sellos)`
      : 'Contacto capturado vía OmniTag vCard'

    const vcfLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName};${firstName};;;`,
      `FN:${lead.name}`,
      lead.phone ? `TEL;TYPE=CELL:${lead.phone}` : '',
      lead.email ? `EMAIL;TYPE=INTERNET,HOME:${lead.email}` : '',
      `NOTE:${note}`,
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

    const headers = ['Nombre', 'Teléfono', 'Email', 'Origen', 'Detalle', 'Fecha']
    const rows = leads.map(l => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${l.source === 'loyalty' ? 'Fidelización' : 'vCard'}"`,
      `"${l.source === 'loyalty' ? `${l.loyaltyStamps || 1} Sellos` : 'Intercambio vCard'}"`,
      `"${new Date(l.created_at).toLocaleString()}"`
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `mis_contactos_omnitag_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* Controles de Búsqueda y Exportación */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-50/80 p-3.5 sm:p-4 rounded-2xl border border-gray-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:border-black focus:outline-none shadow-xs font-medium"
          />
        </div>

        <button
          onClick={handleExportCSV}
          disabled={leads.length === 0}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" /> Exportar a Excel (CSV)
        </button>
      </div>

      {/* Lista Vacía */}
      {filteredLeads.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="font-semibold text-gray-700">No hay contactos registrados todavía</p>
          <p className="text-xs text-gray-400 mt-1">
            {searchTerm ? 'No se encontraron resultados con ese criterio de búsqueda.' : 'Comparte tu tarjeta digital o activa tu tarjeta de fidelización para que tus clientes te dejen sus datos.'}
          </p>
        </div>
      ) : (
        <>
          {/* Vista Móvil (Tarjetas de Contacto) */}
          <div className="block md:hidden space-y-3">
            {filteredLeads.map((lead) => {
              const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : null

              return (
                <div key={lead.id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-base">{lead.name}</h3>
                        {lead.source === 'loyalty' ? (
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Gift className="w-3 h-3" /> {lead.loyaltyStamps || 1} sellos
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <UserCircle className="w-3 h-3" /> vCard
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {new Date(lead.created_at).toLocaleDateString()}
                      </p>
                    </div>

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
                      <p className="flex items-center gap-2 text-gray-800 font-medium font-mono">
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
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${lead.name}! Gracias por conectar conmigo a través de mi tarjeta digital. ¿Cómo puedo ayudarte hoy?`)}`}
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

          {/* Vista Escritorio (Tabla) */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                  <th className="px-6 py-3.5">Nombre</th>
                  <th className="px-6 py-3.5">Teléfono / WhatsApp</th>
                  <th className="px-6 py-3.5">Correo Electrónico</th>
                  <th className="px-6 py-3.5">Origen</th>
                  <th className="px-6 py-3.5">Fecha</th>
                  <th className="px-6 py-3.5 text-right">Acciones Directas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => {
                  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : null

                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {lead.name}
                      </td>

                      <td className="px-6 py-4">
                        {lead.phone ? (
                          <span className="font-mono text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" /> {lead.phone}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-xs">No provisto</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="text-gray-600 hover:text-blue-600 text-xs flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" /> {lead.email}
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-xs">No provisto</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {lead.source === 'loyalty' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                            <Gift className="w-3 h-3" /> {lead.loyaltyStamps || 1} sellos
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                            <UserCircle className="w-3 h-3" /> vCard
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSaveToPhone(lead)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer"
                            title="Guardar en agenda (.vcf)"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                            <span>Guardar</span>
                          </button>

                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${lead.name}! Gracias por conectar conmigo a través de mi tarjeta digital. ¿Cómo puedo ayudarte hoy?`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE57] transition shadow-2xs"
                              title="Chatear en WhatsApp"
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
        </>
      )}
    </div>
  )
}
