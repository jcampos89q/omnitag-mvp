'use client'

import { useState } from 'react'
import { 
  Users, 
  UserCircle, 
  Coffee, 
  Gift, 
  Smartphone, 
  ExternalLink, 
  Search, 
  Building2, 
  Mail, 
  Calendar, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye
} from 'lucide-react'
import AdminUserTable, { AdminUser } from './AdminUserTable'

export interface AdminCreationsData {
  vcards: Array<{
    id: string
    user_id: string
    slug: string
    first_name: string | null
    last_name: string | null
    company_name: string | null
    job_title: string | null
    avatar_url: string | null
    card_type: string
    is_active: boolean
    created_at: string
    user_email: string
    user_full_name: string
  }>
  menus: Array<{
    id: string
    user_id: string
    slug: string
    name: string
    business_type: string
    logo_url: string | null
    is_active: boolean
    created_at: string
    user_email: string
    user_full_name: string
  }>
  loyalty: Array<{
    id: string
    user_id: string
    slug: string
    name: string
    business_type: string
    reward_title: string
    total_stamps_required: number
    logo_url: string | null
    is_active: boolean
    created_at: string
    user_email: string
    user_full_name: string
  }>
  devices: Array<{
    id: string
    user_id: string
    tag_id: string
    device_type: string
    redirect_url: string
    review_filter_enabled: boolean
    is_active: boolean
    created_at: string
    user_email: string
    user_full_name: string
  }>
}

export default function AdminCreationsHub({
  users,
  creations
}: {
  users: AdminUser[]
  creations: AdminCreationsData
}) {
  const [activeTab, setActiveTab] = useState<'users' | 'vcards' | 'menus' | 'loyalty' | 'devices'>('users')
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrados por búsqueda
  const filteredVCards = (creations.vcards || []).filter(v => 
    (v.first_name && v.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.company_name && v.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.slug && v.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.user_email && v.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredMenus = (creations.menus || []).filter(m => 
    (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.slug && m.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.user_email && m.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredLoyalty = (creations.loyalty || []).filter(l => 
    (l.name && l.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.reward_title && l.reward_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.slug && l.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.user_email && l.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredDevices = (creations.devices || []).filter(d => 
    (d.tag_id && d.tag_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.device_type && d.device_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.user_email && d.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Pestañas de Navegación del Superadministrador */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 text-xs sm:text-sm">
        <button
          onClick={() => { setActiveTab('users'); setSearchTerm('') }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'bg-black text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Base de Usuarios ({users.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('vcards'); setSearchTerm('') }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'vcards'
              ? 'bg-black text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <UserCircle className="w-4 h-4" />
          <span>vCards ({creations.vcards?.length || 0})</span>
        </button>

        <button
          onClick={() => { setActiveTab('menus'); setSearchTerm('') }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'menus'
              ? 'bg-black text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Menús & Catálogos ({creations.menus?.length || 0})</span>
        </button>

        <button
          onClick={() => { setActiveTab('loyalty'); setSearchTerm('') }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'loyalty'
              ? 'bg-black text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Fidelización & Sellos ({creations.loyalty?.length || 0})</span>
        </button>

        <button
          onClick={() => { setActiveTab('devices'); setSearchTerm('') }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'devices'
              ? 'bg-black text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Placas NFC & QRs ({creations.devices?.length || 0})</span>
        </button>
      </div>

      {/* 1. PESTAÑA: BASE DE USUARIOS & MARKETING */}
      {activeTab === 'users' && (
        <AdminUserTable users={users} />
      )}

      {/* 2. PESTAÑA: TODAS LAS VCARDS CREADAS */}
      {activeTab === 'vcards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar vCard por nombre, empresa, slug o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <span className="text-xs text-gray-500 font-bold whitespace-nowrap">
              {filteredVCards.length} vCard(s) encontrada(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVCards.map((v) => {
              const displayName = v.first_name 
                ? `${v.first_name} ${v.last_name || ''}`
                : v.company_name || 'Sin Nombre'

              return (
                <div key={v.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {v.avatar_url ? (
                          <img src={v.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-gray-900 text-sm truncate">{displayName}</h4>
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            v.card_type === 'business' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {v.card_type === 'business' ? 'Empresa' : 'Personal'}
                          </span>
                        </div>
                        {v.job_title && (
                          <p className="text-xs text-gray-500 truncate">{v.job_title}</p>
                        )}
                        {v.company_name && (
                          <p className="text-xs text-gray-700 font-medium truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-gray-400" /> {v.company_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600 border border-gray-100">
                      <p className="truncate"><b>Dueño:</b> {v.user_full_name || v.user_email}</p>
                      <p className="font-mono text-[11px] text-gray-500">/v/{v.slug}</p>
                      <p className="text-[10px] text-gray-400">Creada: {new Date(v.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> {v.is_active ? 'Activa' : 'Inactiva'}
                    </span>

                    <a
                      href={`/v/${v.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-800 transition"
                    >
                      <span>Abrir en Vivo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 3. PESTAÑA: TODOS LOS MENÚS Y CATÁLOGOS CREADOS */}
      {activeTab === 'menus' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar menú por nombre, slug o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <span className="text-xs text-gray-500 font-bold whitespace-nowrap">
              {filteredMenus.length} Menú(s) encontrado(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenus.map((m) => (
              <div key={m.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                      {m.logo_url ? (
                        <img src={m.logo_url} alt={m.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Coffee className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-gray-900 text-sm truncate">{m.name}</h4>
                      <span className="inline-block text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md mt-0.5 uppercase">
                        {m.business_type === 'salon' ? '💈 Salón / Barbería' : m.business_type === 'dental' ? '🦷 Clínica Dental' : '🍽️ Restaurante / Café'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600 border border-gray-100">
                    <p className="truncate"><b>Propietario:</b> {m.user_full_name || m.user_email}</p>
                    <p className="font-mono text-[11px] text-gray-500">/m/{m.slug}</p>
                    <p className="text-[10px] text-gray-400">Creado: {new Date(m.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {m.is_active ? 'Activo' : 'Inactivo'}
                  </span>

                  <a
                    href={`/m/${m.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-800 transition"
                  >
                    <span>Ver Catálogo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PESTAÑA: TODOS LOS CLUBES DE FIDELIZACIÓN CREADOS */}
      {activeTab === 'loyalty' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar programa por nombre, premio o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <span className="text-xs text-gray-500 font-bold whitespace-nowrap">
              {filteredLoyalty.length} Programa(s) encontrado(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLoyalty.map((l) => (
              <div key={l.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {l.logo_url ? (
                        <img src={l.logo_url} alt={l.name} className="w-full h-full object-cover" />
                      ) : (
                        <Gift className="w-6 h-6" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-gray-900 text-sm truncate">{l.name}</h4>
                      <p className="text-xs font-bold text-purple-700 mt-0.5 truncate">
                        🎁 {l.reward_title}
                      </p>
                      <span className="text-[10px] text-gray-500">Meta: {l.total_stamps_required} sellos</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600 border border-gray-100">
                    <p className="truncate"><b>Propietario:</b> {l.user_full_name || l.user_email}</p>
                    <p className="font-mono text-[11px] text-gray-500">/l/{l.slug}</p>
                    <p className="text-[10px] text-gray-400">Creado: {new Date(l.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {l.is_active ? 'Activo' : 'Inactivo'}
                  </span>

                  <a
                    href={`/l/${l.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-purple-800 transition"
                  >
                    <span>Ver Tarjeta</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PESTAÑA: TODAS LAS PLACAS Y QRS REGISTRADOS */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar placa por Tag ID, tipo o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <span className="text-xs text-gray-500 font-bold whitespace-nowrap">
              {filteredDevices.length} Placa(s) encontrada(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDevices.map((d) => (
              <div key={d.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-gray-900 text-sm truncate">Tag ID: {d.tag_id}</h4>
                      <span className="inline-block text-[10px] bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded mt-0.5 uppercase">
                        {d.device_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600 border border-gray-100">
                    <p className="truncate"><b>Propietario:</b> {d.user_full_name || d.user_email}</p>
                    <p className="text-[11px] truncate"><b>Destino:</b> {d.redirect_url || 'Redirección interna'}</p>
                    <p className="text-[10px] text-gray-400">Creado: {new Date(d.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {d.is_active ? 'Activo' : 'Inactivo'}
                  </span>

                  <a
                    href={`/r/${d.tag_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-800 transition"
                  >
                    <span>Probar Tag</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
