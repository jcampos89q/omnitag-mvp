'use client'

import { useState } from 'react'
import { 
  Users, 
  Download, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  MessageCircle, 
  UserCheck, 
  Gift, 
  Star, 
  Building2, 
  Filter, 
  FileSpreadsheet,
  CheckCircle2,
  Share2
} from 'lucide-react'

export interface MasterContact {
  id: string
  source_type: 'vcard_lead' | 'loyalty_member' | 'review_feedback'
  customer_name: string
  customer_phone?: string | null
  customer_email?: string | null
  created_at: string
  origin_id: string
  origin_name: string
  origin_slug: string
  merchant_id: string
  merchant_email: string
  merchant_name: string
  rating?: number
  message?: string
  current_stamps?: number
  total_rewards_claimed?: number
}

export default function AdminMasterContacts({
  contacts
}: {
  contacts: {
    vcard_leads: MasterContact[]
    loyalty_members: MasterContact[]
    private_feedbacks: MasterContact[]
  }
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'vcard_lead' | 'loyalty_member' | 'review_feedback'>('all')
  const [selectedMerchant, setSelectedMerchant] = useState<string>('all')

  // Unificar todos los contactos
  const allContacts: MasterContact[] = [
    ...(contacts.vcard_leads || []),
    ...(contacts.loyalty_members || []),
    ...(contacts.private_feedbacks || []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Lista única de negocios/usuarios para el dropdown de filtro
  const merchantOptions = Array.from(
    new Set(allContacts.map(c => c.origin_name).filter(Boolean))
  ).sort()

  // Filtrado reactivo
  const filteredContacts = allContacts.filter(c => {
    // Filtro por fuente
    if (sourceFilter !== 'all' && c.source_type !== sourceFilter) return false

    // Filtro por negocio
    if (selectedMerchant !== 'all' && c.origin_name !== selectedMerchant) return false

    // Filtro por término de búsqueda
    const term = searchTerm.toLowerCase()
    const matchesSearch = 
      (c.customer_name && c.customer_name.toLowerCase().includes(term)) ||
      (c.customer_phone && c.customer_phone.includes(term)) ||
      (c.customer_email && c.customer_email.toLowerCase().includes(term)) ||
      (c.origin_name && c.origin_name.toLowerCase().includes(term)) ||
      (c.merchant_email && c.merchant_email.toLowerCase().includes(term))

    return matchesSearch
  })

  // Exportar a Excel / CSV para Campañas de Marketing (Meta Ads, WhatsApp Masivo, CRM)
  const exportToCSV = () => {
    const headers = [
      'Nombre del Cliente',
      'Telefono / WhatsApp',
      'Correo Electronico',
      'Origen de Captura',
      'Negocio / Perfil de Origen',
      'Cuenta Duena',
      'Detalles / Calificacion / Sellos',
      'Fecha de Registro'
    ]

    const rows = filteredContacts.map(c => {
      let details = ''
      if (c.source_type === 'vcard_lead') details = 'Intercambio de Contacto vCard'
      else if (c.source_type === 'loyalty_member') details = `${c.current_stamps || 0} Sellos acumulados`
      else if (c.source_type === 'review_feedback') details = `Calificacion: ${c.rating || 0} estrellas - "${(c.message || '').replace(/"/g, '""')}"`

      const sourceLabel = c.source_type === 'vcard_lead' 
        ? 'vCard Lead' 
        : c.source_type === 'loyalty_member' 
        ? 'Fidelizacion & Sellos' 
        : 'Queja / Resena Privada'

      return [
        `"${(c.customer_name || '').replace(/"/g, '""')}"`,
        `"${(c.customer_phone || '').replace(/"/g, '""')}"`,
        `"${(c.customer_email || '').replace(/"/g, '""')}"`,
        `"${sourceLabel}"`,
        `"${(c.origin_name || '').replace(/"/g, '""')}"`,
        `"${(c.merchant_name || c.merchant_email || '').replace(/"/g, '""')}"`,
        `"${details}"`,
        `"${new Date(c.created_at).toLocaleString()}"`
      ]
    })

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `base_datos_master_contactos_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Métricas
  const totalContactsCount = allContacts.length
  const totalWithPhone = allContacts.filter(c => c.customer_phone).length
  const totalWithEmail = allContacts.filter(c => c.customer_email).length
  const totalFeedbacks = contacts.private_feedbacks?.length || 0

  return (
    <div className="space-y-6">
      {/* 1. KPIs Rápidos de Contactos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Base Master</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{totalContactsCount}</p>
          <p className="text-[11px] text-gray-400 mt-1">Contactos únicos recolectados</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Con WhatsApp / Móvil</span>
            <Phone className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{totalWithPhone}</p>
          <p className="text-[11px] text-gray-400 mt-1">Listos para WhatsApp Marketing</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Con Correo Electrónico</span>
            <Mail className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-700">{totalWithEmail}</p>
          <p className="text-[11px] text-gray-400 mt-1">Para campañas de Email</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Opiniones & Quejas</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{totalFeedbacks}</p>
          <p className="text-[11px] text-gray-400 mt-1">Filtro de Google Reviews</p>
        </div>
      </div>

      {/* 2. Barra de Filtros, Búsqueda y Exportación */}
      <div className="bg-gray-50/90 p-5 rounded-2xl border border-gray-200 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono, email o negocio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black shadow-xs font-medium"
            />
          </div>

          {/* Selector de Negocio de Origen */}
          <div className="w-full sm:w-64">
            <select
              value={selectedMerchant}
              onChange={(e) => setSelectedMerchant(e.target.value)}
              className="w-full py-2.5 px-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">🏢 Todos los Negocios ({merchantOptions.length})</option>
              {merchantOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Botón de Exportación */}
          <button
            onClick={exportToCSV}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition shadow-sm whitespace-nowrap cursor-pointer shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Base CSV ({filteredContacts.length})</span>
          </button>
        </div>

        {/* Filtros por Origen de Captura */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              sourceFilter === 'all' ? 'bg-black text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Todos ({allContacts.length})
          </button>
          <button
            onClick={() => setSourceFilter('vcard_lead')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              sourceFilter === 'vcard_lead' ? 'bg-black text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Intercambio en vCards ({contacts.vcard_leads?.length || 0})</span>
          </button>
          <button
            onClick={() => setSourceFilter('loyalty_member')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              sourceFilter === 'loyalty_member' ? 'bg-black text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-purple-600" />
            <span>Club de Fidelización ({contacts.loyalty_members?.length || 0})</span>
          </button>
          <button
            onClick={() => setSourceFilter('review_feedback')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              sourceFilter === 'review_feedback' ? 'bg-black text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Quejas Privadas Google ({contacts.private_feedbacks?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* 3. Tabla Master de Contactos */}
      {filteredContacts.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="font-bold text-gray-800 text-base">No se encontraron contactos con los filtros seleccionados</p>
          <p className="text-xs text-gray-400 mt-1">Prueba cambiando el negocio o la fuente de captura.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs bg-white">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/90 border-b border-gray-200 text-[11px] uppercase text-gray-500 font-bold tracking-wider">
                <th className="px-6 py-4">Cliente / Contacto</th>
                <th className="px-6 py-4">Teléfono & Email</th>
                <th className="px-6 py-4">Origen de Captura</th>
                <th className="px-6 py-4">Negocio / Cuenta</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-right">Acción Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContacts.map((c) => {
                const cleanPhone = c.customer_phone ? c.customer_phone.replace(/\D/g, '') : null

                return (
                  <tr key={`${c.source_type}-${c.id}`} className="hover:bg-gray-50/70 transition-colors">
                    {/* Cliente */}
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-gray-900 text-sm">{c.customer_name}</p>
                      {c.source_type === 'review_feedback' && c.message && (
                        <p className="text-xs text-red-600 font-medium italic mt-0.5 max-w-xs line-clamp-2">
                          "{c.message}"
                        </p>
                      )}
                    </td>

                    {/* Teléfono & Email */}
                    <td className="px-6 py-4 space-y-1">
                      {c.customer_phone ? (
                        <span className="font-mono text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {c.customer_phone}
                        </span>
                      ) : null}

                      {c.customer_email ? (
                        <a href={`mailto:${c.customer_email}`} className="text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-gray-400" /> {c.customer_email}
                        </a>
                      ) : null}

                      {!c.customer_phone && !c.customer_email && (
                        <span className="text-xs text-gray-400 italic">No provisto</span>
                      )}
                    </td>

                    {/* Origen de Captura */}
                    <td className="px-6 py-4">
                      {c.source_type === 'vcard_lead' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                          <UserCheck className="w-3 h-3" /> vCard Lead
                        </span>
                      )}
                      {c.source_type === 'loyalty_member' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                          <Gift className="w-3 h-3" /> {c.current_stamps || 0} Sellos
                        </span>
                      )}
                      {c.source_type === 'review_feedback' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                          <Star className="w-3 h-3 fill-amber-400" /> {c.rating}★ Queja
                        </span>
                      )}
                    </td>

                    {/* Negocio & Dueño */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-xs truncate flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" /> {c.origin_name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        Dueño: {c.merchant_name || c.merchant_email}
                      </p>
                    </td>

                    {/* Fecha */}
                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${c.customer_name}! Nos comunicamos desde ${c.origin_name} para agradecerte por tu visita.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE57] transition shadow-2xs"
                            title="Enviar WhatsApp directo"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {c.customer_phone && (
                          <a
                            href={`tel:${c.customer_phone}`}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                            title="Llamar al cliente"
                          >
                            <Phone className="w-3.5 h-3.5" />
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
      )}
    </div>
  )
}
