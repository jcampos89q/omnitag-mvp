'use client'

import { useState } from 'react'
import { Search, Download, ShieldCheck, Mail, Phone, Calendar, Smartphone, Coffee, UserCheck, MessageCircle, Sparkles } from 'lucide-react'
import { toggleUserPlan } from './actions'

export interface AdminUser {
  out_user_id: string
  out_email: string
  out_full_name: string
  out_created_at: string
  out_plan: string
  out_phone: string | null
  out_vcards_count: number
  out_menus_count: number
  out_devices_count: number
  out_scans_count: number
  out_leads_count: number
}

export default function AdminUserTable({ users }: { users: AdminUser[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [planFilter, setPlanFilter] = useState<'all' | 'pro' | 'free' | 'with_phone'>('all')

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.out_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.out_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.out_phone && u.out_phone.includes(searchTerm))

    if (!matchesSearch) return false

    if (planFilter === 'pro') return u.out_plan === 'pro'
    if (planFilter === 'free') return u.out_plan === 'free' || !u.out_plan
    if (planFilter === 'with_phone') return Boolean(u.out_phone)

    return true
  })

  // Exportar a CSV para Campañas de Marketing (Meta Ads, Mailchimp, WhatsApp)
  const exportToCSV = () => {
    const headers = ['Nombre', 'Email', 'Telefono', 'Plan', 'Fecha Registro', 'vCards', 'Menus', 'Dispositivos', 'Escaneos', 'Leads']
    const rows = filteredUsers.map(u => [
      `"${(u.out_full_name || '').replace(/"/g, '""')}"`,
      `"${(u.out_email || '').replace(/"/g, '""')}"`,
      `"${(u.out_phone || '').replace(/"/g, '""')}"`,
      `"${u.out_plan === 'pro' ? 'PRO' : 'Gratuito'}"`,
      `"${new Date(u.out_created_at).toLocaleDateString()}"`,
      u.out_vcards_count || 0,
      u.out_menus_count || 0,
      u.out_devices_count || 0,
      u.out_scans_count || 0,
      u.out_leads_count || 0
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `usuarios_omnitag_marketing_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* Controles de Búsqueda, Filtro y Exportación */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-200">
        {/* Barra de Búsqueda */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:border-black focus:outline-none shadow-xs"
          />
        </div>

        {/* Filtro por Plan */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setPlanFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              planFilter === 'all' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Todos ({users.length})
          </button>
          <button
            onClick={() => setPlanFilter('pro')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              planFilter === 'pro' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Plan PRO ({users.filter(u => u.out_plan === 'pro').length})
          </button>
          <button
            onClick={() => setPlanFilter('free')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              planFilter === 'free' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Básicos ({users.filter(u => u.out_plan !== 'pro').length})
          </button>
          <button
            onClick={() => setPlanFilter('with_phone')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              planFilter === 'with_phone' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Con WhatsApp ({users.filter(u => u.out_phone).length})
          </button>
        </div>

        {/* Botón Exportar CSV */}
        <button
          onClick={exportToCSV}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap cursor-pointer"
        >
          <Download className="w-4 h-4" /> Exportar CSV (Marketing)
        </button>
      </div>

      {/* Listado de Usuarios */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
          <p className="font-semibold text-gray-700">No se encontraron usuarios</p>
          <p className="text-xs text-gray-400 mt-1">Prueba cambiando los términos de búsqueda o el filtro.</p>
        </div>
      ) : (
        <>
          {/* Vista Móvil (Tarjetas detalladas) */}
          <div className="block md:hidden space-y-3">
            {filteredUsers.map((u) => (
              <div key={u.out_user_id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{u.out_full_name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400" /> {u.out_email}
                    </p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    u.out_plan === 'pro' 
                      ? 'bg-black text-yellow-400 border border-yellow-500/40' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {u.out_plan === 'pro' ? '★ PRO' : 'Gratis'}
                  </span>
                </div>

                {u.out_phone && (
                  <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-100">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> {u.out_phone}
                    </span>
                    <a
                      href={`https://wa.me/${u.out_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-emerald-700 underline flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Enviar WhatsApp
                    </a>
                  </div>
                )}

                {/* Métricas de Actividad del Usuario */}
                <div className="grid grid-cols-4 gap-2 text-center bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[11px]">
                  <div>
                    <p className="font-bold text-gray-900">{u.out_vcards_count || 0}</p>
                    <p className="text-gray-400 text-[9px] uppercase">vCards</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{u.out_menus_count || 0}</p>
                    <p className="text-gray-400 text-[9px] uppercase">Menús</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{u.out_devices_count || 0}</p>
                    <p className="text-gray-400 text-[9px] uppercase">QRs</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{u.out_leads_count || 0}</p>
                    <p className="text-gray-400 text-[9px] uppercase">Leads</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Registrado: {new Date(u.out_created_at).toLocaleDateString()}
                  </span>

                  <form action={toggleUserPlan}>
                    <input type="hidden" name="target_user_id" value={u.out_user_id} />
                    <input type="hidden" name="current_plan" value={u.out_plan} />
                    <button
                      type="submit"
                      className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                    >
                      {u.out_plan === 'pro' ? 'Bajar a Free' : 'Subir a PRO'}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {/* Vista Escritorio (Tabla Completa) */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                  <th className="px-6 py-3.5">Usuario / Email</th>
                  <th className="px-6 py-3.5">Plan</th>
                  <th className="px-6 py-3.5">Contacto</th>
                  <th className="px-6 py-3.5">Actividad</th>
                  <th className="px-6 py-3.5">Registro</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.out_user_id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{u.out_full_name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {u.out_email}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                        u.out_plan === 'pro' 
                          ? 'bg-black text-yellow-400 border border-yellow-500/30' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.out_plan === 'pro' ? <><Sparkles className="w-3 h-3 text-yellow-400" /> PRO</> : 'Básico'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {u.out_phone ? (
                        <a
                          href={`https://wa.me/${u.out_phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium hover:underline bg-emerald-50 px-2.5 py-1 rounded-md"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          {u.out_phone}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin teléfono</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="bg-gray-100 px-2 py-0.5 rounded" title="vCards">📇 {u.out_vcards_count || 0}</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded" title="Menús">☕ {u.out_menus_count || 0}</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded" title="QRs/Dispositivos">📱 {u.out_devices_count || 0}</span>
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium" title="Leads capturados">👥 {u.out_leads_count || 0}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(u.out_created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <form action={toggleUserPlan} className="inline-block">
                        <input type="hidden" name="target_user_id" value={u.out_user_id} />
                        <input type="hidden" name="current_plan" value={u.out_plan} />
                        <button
                          type="submit"
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                        >
                          {u.out_plan === 'pro' ? 'Bajar a Free' : 'Cambiar a PRO'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
