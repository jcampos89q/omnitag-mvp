'use client'

import { useState } from 'react'
import { Search, Download, ShieldCheck, Mail, Phone, Calendar, Smartphone, Coffee, UserCheck, MessageCircle, Sparkles, CheckCircle2, Zap, Clock, PlusCircle, Eye, Loader2 } from 'lucide-react'
import { toggleUserPlan, grantTrialExtension } from './actions'
import { startImpersonation } from './impersonateActions'

export interface AdminUser {
  out_user_id: string
  out_email: string
  out_full_name: string
  out_created_at: string
  out_plan: string
  out_expires_at?: string | null
  out_phone: string | null
  out_vcards_count: number
  out_menus_count: number
  out_devices_count: number
  out_scans_count: number
  out_leads_count: number
  out_has_hardware?: boolean
  out_is_trial?: boolean
}

export default function AdminUserTable({ users }: { users: AdminUser[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [planFilter, setPlanFilter] = useState<'all' | 'pro' | 'trial' | 'free' | 'with_phone'>('all')
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null)

  const handleImpersonate = async (userId: string) => {
    setImpersonatingId(userId)
    try {
      await startImpersonation(userId)
    } catch (err: any) {
      alert(err?.message || 'Error al iniciar el modo soporte')
      setImpersonatingId(null)
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.out_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.out_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.out_phone && u.out_phone.includes(searchTerm))

    if (!matchesSearch) return false

    if (planFilter === 'pro') return u.out_plan === 'pro'
    if (planFilter === 'trial') return u.out_plan === 'trial'
    if (planFilter === 'free') return u.out_plan === 'free' || !u.out_plan
    if (planFilter === 'with_phone') return Boolean(u.out_phone)

    return true
  })

  // Exportar a CSV para Campañas de Marketing (Meta Ads, Mailchimp, WhatsApp)
  const exportToCSV = () => {
    const headers = ['Nombre', 'Email', 'Telefono', 'Plan', 'Vencimiento', 'Fecha Registro', 'vCards', 'Menus', 'Dispositivos', 'Escaneos', 'Leads']
    const rows = filteredUsers.map(u => [
      `"${(u.out_full_name || '').replace(/"/g, '""')}"`,
      `"${(u.out_email || '').replace(/"/g, '""')}"`,
      `"${(u.out_phone || '').replace(/"/g, '""')}"`,
      `"${u.out_plan === 'pro' ? 'PRO' : 'Gratuito'}"`,
      `"${u.out_expires_at ? new Date(u.out_expires_at).toLocaleDateString() : 'N/A'}"`,
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
              planFilter === 'all' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Todos ({users.length})
          </button>
          <button
            onClick={() => setPlanFilter('pro')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
              planFilter === 'pro' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            ★ PRO ({users.filter(u => u.out_plan === 'pro').length})
          </button>
          <button
            onClick={() => setPlanFilter('trial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
              planFilter === 'trial' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            ⏳ En Prueba ({users.filter(u => u.out_plan === 'trial').length})
          </button>
          <button
            onClick={() => setPlanFilter('free')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
              planFilter === 'free' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            🔒 Vencidos ({users.filter(u => u.out_plan === 'free' || !u.out_plan).length})
          </button>
          <button
            onClick={() => setPlanFilter('with_phone')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
              planFilter === 'with_phone' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            WhatsApp ({users.filter(u => u.out_phone).length})
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
            {filteredUsers.map((u) => {
              const isPro = u.out_plan === 'pro'
              const isTrial = u.out_plan === 'trial'
              const isFree = u.out_plan === 'free' || !u.out_plan
              const expiresDate = u.out_expires_at ? new Date(u.out_expires_at) : null
              const isExpired = isFree || (expiresDate ? expiresDate < new Date() : false)
              const daysLeft = expiresDate ? Math.max(0, Math.ceil((expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : null
              
              // Calcular descuento para cuentas nuevas
              const createdDate = new Date(u.out_created_at)
              const daysSinceCreation = Math.ceil(Math.abs(new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
              const isDiscountEligible = isTrial && daysSinceCreation <= 3
              const discountDaysLeft = Math.max(0, 3 - daysSinceCreation + 1)

              return (
                <div key={u.out_user_id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{u.out_full_name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {u.out_email}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        isExpired || isFree
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : isPro
                          ? 'bg-black text-yellow-400 border border-yellow-500/40' 
                          : isTrial
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isExpired || isFree 
                          ? '🔒 Bloqueado' 
                          : isPro 
                          ? daysLeft && daysLeft > 60 
                            ? '★ PRO (Hardware Anual)' 
                            : `★ PRO (${daysLeft || 30}d)` 
                          : isTrial 
                          ? `⏳ Prueba (${daysLeft || 10}d)` 
                          : 'Sin Plan'}
                      </span>
                      {!isExpired && isDiscountEligible && (
                        <span className="text-[9px] text-green-600 font-bold bg-green-50 px-1.5 rounded-sm">
                          50% OFF ({discountDaysLeft}d)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Estado de Vencimiento Mensual */}
                  {expiresDate && (
                    <div className={`p-2 rounded-xl text-xs flex items-center justify-between font-medium ${
                      isExpired ? 'bg-red-50 text-red-800' : daysLeft && daysLeft <= 5 ? 'bg-amber-50 text-amber-900' : 'bg-purple-50 text-purple-900'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {isExpired ? 'Prueba/Plan Vencido' : `${daysLeft} días restantes`}
                      </span>
                      <span className="text-[10px] opacity-80">
                        Vence: {expiresDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}

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
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </div>
                  )}

                  {/* Métricas de Actividad */}
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

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 flex-wrap gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(u.out_created_at).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        disabled={impersonatingId === u.out_user_id}
                        onClick={() => handleImpersonate(u.out_user_id)}
                        className="text-xs font-bold px-2.5 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1 bg-amber-400 hover:bg-amber-500 text-black cursor-pointer disabled:opacity-50"
                        title="Modo Soporte: Ver como cliente"
                      >
                        {impersonatingId === u.out_user_id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        <span>Ver como cliente</span>
                      </button>

                      <form action={grantTrialExtension}>
                        <input type="hidden" name="target_user_id" value={u.out_user_id} />
                        <input type="hidden" name="days" value="3" />
                        <button
                          type="submit"
                          className="text-xs font-bold px-2.5 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer"
                          title="Conceder 3 días de prórroga a este usuario"
                        >
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          <span>+3d Prórroga</span>
                        </button>
                      </form>

                      {isPro ? (
                        <form action={toggleUserPlan}>
                          <input type="hidden" name="target_user_id" value={u.out_user_id} />
                          <input type="hidden" name="new_plan" value="free" />
                          <button
                            type="submit"
                            className="text-xs font-bold px-2.5 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 border border-gray-200 cursor-pointer"
                            title="Desactivar plan PRO y volver a estado gratuito"
                          >
                            <span>Bajar a Gratis</span>
                          </button>
                        </form>
                      ) : isTrial ? (
                        <div className="flex items-center gap-1">
                          <form action={toggleUserPlan}>
                            <input type="hidden" name="target_user_id" value={u.out_user_id} />
                            <input type="hidden" name="new_plan" value="free" />
                            <button
                              type="submit"
                              className="text-xs font-bold px-2.5 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-200 cursor-pointer"
                              title="Terminar prueba y bloquear acceso"
                            >
                              <span>Expirar</span>
                            </button>
                          </form>
                          <form action={toggleUserPlan}>
                            <input type="hidden" name="target_user_id" value={u.out_user_id} />
                            <input type="hidden" name="new_plan" value="pro" />
                            <button
                              type="submit"
                              className="text-xs font-bold px-2.5 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                              title="Activar plan PRO oficial por 30 días"
                            >
                              <Zap className="w-3.5 h-3.5 fill-white" />
                              <span>PRO</span>
                            </button>
                          </form>
                        </div>
                      ) : (
                        <form action={toggleUserPlan}>
                          <input type="hidden" name="target_user_id" value={u.out_user_id} />
                          <input type="hidden" name="new_plan" value="pro" />
                          <button
                            type="submit"
                            className="text-xs font-bold px-2.5 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            title="Activar plan PRO oficial por 30 días"
                          >
                            <Zap className="w-3.5 h-3.5 fill-white" />
                            <span>Activar PRO</span>
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Vista Escritorio (Tabla Completa con scroll horizontal suave para evitar recortes) */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-x-auto shadow-xs">
            <table className="w-full min-w-[960px] text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                  <th className="px-6 py-3.5 whitespace-nowrap">Usuario / Email</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Plan & Vigencia (30 Días)</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Contacto</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Actividad</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Registro</th>
                  <th className="px-6 py-3.5 text-right whitespace-nowrap">Acciones & Soporte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const isPro = u.out_plan === 'pro'
                  const isTrial = u.out_plan === 'trial'
                  const isFree = u.out_plan === 'free' || !u.out_plan
                  const expiresDate = u.out_expires_at ? new Date(u.out_expires_at) : null
                  const isExpired = isFree || (expiresDate ? expiresDate < new Date() : false)
                  const daysLeft = expiresDate ? Math.max(0, Math.ceil((expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : null
                  
                  // Calcular descuento para cuentas nuevas
                  const createdDate = new Date(u.out_created_at)
                  const daysSinceCreation = Math.ceil(Math.abs(new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
                  const isDiscountEligible = isTrial && daysSinceCreation <= 3
                  const discountDaysLeft = Math.max(0, 3 - daysSinceCreation + 1)

                  return (
                    <tr key={u.out_user_id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{u.out_full_name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" /> {u.out_email}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                            isExpired || isFree
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : isPro
                              ? 'bg-black text-yellow-400 border border-yellow-500/40' 
                              : isTrial
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isExpired || isFree 
                              ? '🔒 Bloqueado' 
                              : isPro 
                              ? daysLeft && daysLeft > 60 
                                ? '★ PRO (Hardware Anual)' 
                                : `★ PRO (${daysLeft || 30}d)` 
                              : isTrial 
                              ? `⏳ Prueba (${daysLeft || 10}d)` 
                              : 'Sin Plan'}
                          </span>
                          {expiresDate && (
                            <span className={`text-[11px] font-medium ${isExpired ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                              {isExpired ? 'Vencida' : `${daysLeft}d restantes`}
                            </span>
                          )}
                          {!isExpired && isDiscountEligible && (
                            <span className="text-[9px] text-green-600 font-bold bg-green-50 px-1.5 rounded-sm">
                              50% OFF ({discountDaysLeft}d)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {u.out_phone ? (
                          <a
                            href={`https://wa.me/${u.out_phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 hover:underline"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            {u.out_phone}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sin teléfono</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="bg-gray-100 px-2 py-0.5 rounded" title="vCards">💳 {u.out_vcards_count || 0}</span>
                          <span className="bg-gray-100 px-2 py-0.5 rounded" title="Menús">☕ {u.out_menus_count || 0}</span>
                          <span className="bg-gray-100 px-2 py-0.5 rounded" title="QRs/Dispositivos">📱 {u.out_devices_count || 0}</span>
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium" title="Leads capturados">👥 {u.out_leads_count || 0}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(u.out_created_at).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={impersonatingId === u.out_user_id}
                            onClick={() => handleImpersonate(u.out_user_id)}
                            className="text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-black cursor-pointer disabled:opacity-50"
                            title="Ver el panel exactamente como este usuario (Modo Soporte)"
                          >
                            {impersonatingId === u.out_user_id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                            <span>Ver como cliente</span>
                          </button>

                          <form action={grantTrialExtension} className="inline-block">
                            <input type="hidden" name="target_user_id" value={u.out_user_id} />
                            <input type="hidden" name="days" value="3" />
                            <button
                              type="submit"
                              className="text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer"
                              title="Conceder prórroga de 3 días a este usuario"
                            >
                              <Clock className="w-3.5 h-3.5 text-indigo-600" />
                              <span>+3d Prórroga</span>
                            </button>
                          </form>

                          {isPro ? (
                            <form action={toggleUserPlan} className="inline-block">
                              <input type="hidden" name="target_user_id" value={u.out_user_id} />
                              <input type="hidden" name="new_plan" value="free" />
                              <button
                                type="submit"
                                className="text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 border border-gray-200 cursor-pointer"
                                title="Desactivar plan PRO y volver a estado gratuito"
                              >
                                <span>Bajar a Gratis</span>
                              </button>
                            </form>
                          ) : isTrial ? (
                            <div className="inline-flex items-center gap-1.5">
                              <form action={toggleUserPlan} className="inline-block">
                                <input type="hidden" name="target_user_id" value={u.out_user_id} />
                                <input type="hidden" name="new_plan" value="free" />
                                <button
                                  type="submit"
                                  className="text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs flex items-center gap-1 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-200 cursor-pointer"
                                  title="Terminar prueba y bloquear acceso ahora"
                                >
                                  <span>Expirar</span>
                                </button>
                              </form>
                              <form action={toggleUserPlan} className="inline-block">
                                <input type="hidden" name="target_user_id" value={u.out_user_id} />
                                <input type="hidden" name="new_plan" value="pro" />
                                <button
                                  type="submit"
                                  className="text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                  title="Activar plan PRO oficial por 30 días"
                                >
                                  <Zap className="w-3.5 h-3.5 fill-white" />
                                  <span>Activar PRO</span>
                                </button>
                              </form>
                            </div>
                          ) : (
                            <form action={toggleUserPlan} className="inline-block">
                              <input type="hidden" name="target_user_id" value={u.out_user_id} />
                              <input type="hidden" name="new_plan" value="pro" />
                              <button
                                type="submit"
                                className="text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                title="Activar plan PRO oficial por 30 días"
                              >
                                <Zap className="w-3.5 h-3.5 fill-white" />
                                <span>Activar PRO (+30 Días)</span>
                              </button>
                            </form>
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
