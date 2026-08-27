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
  Eye,
  HeartHandshake,
  CreditCard,
  Clock
} from 'lucide-react'
import AdminUserTable, { AdminUser } from './AdminUserTable'
import AdminMasterContacts, { MasterContact } from './AdminMasterContacts'
import AdminBankTransfers, { AdminBankTransfer } from './AdminBankTransfers'

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
  creations,
  contacts,
  transfers = []
}: {
  users: AdminUser[]
  creations: AdminCreationsData
  contacts: {
    vcard_leads: MasterContact[]
    loyalty_members: MasterContact[]
    private_feedbacks: MasterContact[]
  }
  transfers?: AdminBankTransfer[]
}) {
  const [activeTab, setActiveTab] = useState<'users' | 'transfers' | 'contacts' | 'vcards' | 'menus' | 'loyalty' | 'devices'>('users')
  const [searchTerm, setSearchTerm] = useState('')

  const totalMasterContacts = 
    (contacts?.vcard_leads?.length || 0) + 
    (contacts?.loyalty_members?.length || 0) + 
    (contacts?.private_feedbacks?.length || 0)

  const pendingTransfersCount = (transfers || []).filter(t => t.status === 'pending').length

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
          onClick={() => { setActiveTab('transfers'); setSearchTerm('') }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'transfers'
              ? 'bg-red-600 text-white shadow-xs'
              : pendingTransfersCount > 0
              ? 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>💳 Pagos & BAC ({transfers.length})</span>
          {pendingTransfersCount > 0 && (
            <span className="bg-amber-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
              {pendingTransfersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('contacts'); setSearchTerm('') }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'contacts'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>🎯 Master CRM & Leads ({totalMasterContacts})</span>
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
          <span>Menús ({creations.menus?.length || 0})</span>
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
          <span>Fidelización ({creations.loyalty?.length || 0})</span>
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
          <span>Placas NFC ({creations.devices?.length || 0})</span>
        </button>
      </div>

      {/* 1. PESTAÑA: BASE DE USUARIOS */}
      {activeTab === 'users' && (
        <AdminUserTable users={users} />
      )}

      {/* 2. PESTAÑA: PAGOS Y TRANSFERENCIAS BANCARIAS */}
      {activeTab === 'transfers' && (
        <AdminBankTransfers transfers={transfers} />
      )}

      {/* 3. PESTAÑA: MASTER CRM & LEADS */}
      {activeTab === 'contacts' && (
        <AdminMasterContacts contacts={contacts} />
      )}

      {/* 4. PESTAÑA: VCARDS CREADAS */}
      {activeTab === 'vcards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar vCard por nombre, empresa, slug o email del dueño..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {filteredVCards.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
              <UserCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No se encontraron vCards creadas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVCards.map((vcard) => (
                <div key={vcard.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {vcard.avatar_url ? (
                          <img src={vcard.avatar_url} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100 shrink-0">
                            {(vcard.first_name?.[0] || vcard.company_name?.[0] || 'V').toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">
                            {vcard.first_name ? `${vcard.first_name} ${vcard.last_name || ''}` : vcard.company_name || 'Sin nombre'}
                          </h4>
                          <p className="text-xs text-gray-500">{vcard.job_title || vcard.company_name || 'Perfil vCard'}</p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        vcard.card_type === 'business' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {vcard.card_type === 'business' ? 'Empresa' : 'Personal'}
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600 border border-gray-100">
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-semibold text-gray-800">{vcard.user_full_name || vcard.user_email}</span>
                        <span className="text-gray-400 text-[11px]">({vcard.user_email})</span>
                      </p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Creada: {new Date(vcard.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-500">/v/{vcard.slug}</span>
                    <a
                      href={`/v/${vcard.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 bg-black text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-800 transition"
                    >
                      <span>Ver en Vivo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. PESTAÑA: MENÚS Y CATÁLOGOS */}
      {activeTab === 'menus' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar menú por nombre, slug o email del dueño..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {filteredMenus.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
              <Coffee className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No se encontraron menús creados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMenus.map((menu) => (
                <div key={menu.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {menu.logo_url ? (
                          <img src={menu.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg border border-amber-100 shrink-0">
                            <Coffee className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">{menu.name}</h4>
                          <p className="text-xs text-gray-500 capitalize">{menu.business_type || 'Restaurante / Catálogo'}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Activo
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600 border border-gray-100">
                      <p className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-semibold text-gray-800">{menu.user_full_name || menu.user_email}</span>
                      </p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Creado: {new Date(menu.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-500">/m/{menu.slug}</span>
                    <a
                      href={`/m/${menu.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 bg-black text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-800 transition"
                    >
                      <span>Ver Menú</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. PESTAÑA: FIDELIZACIÓN & SELLOS */}
      {activeTab === 'loyalty' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar programa por negocio, premio, slug o email del dueño..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {filteredLoyalty.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
              <Gift className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No se encontraron programas de fidelización</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLoyalty.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.logo_url ? (
                          <img src={item.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg border border-purple-100 shrink-0">
                            <Gift className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">{item.name}</h4>
                          <p className="text-xs text-purple-700 font-semibold">🎁 Premio: {item.reward_title}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        {item.total_stamps_required} Sellos
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600 border border-gray-100">
                      <p className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-semibold text-gray-800">{item.user_full_name || item.user_email}</span>
                      </p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Creado: {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-500">/l/{item.slug}</span>
                    <a
                      href={`/l/${item.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 bg-black text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-800 transition"
                    >
                      <span>Ver Tarjeta Sellos</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. PESTAÑA: PLACAS NFC & QRS */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar placa por Tag ID, tipo o email del dueño..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 focus:border-black focus:outline-none"
              />
            </div>
          </div>

          {filteredDevices.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
              <Smartphone className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No se encontraron placas NFC registradas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDevices.map((device) => (
                <div key={device.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono font-extrabold text-gray-900 text-base">Tag: {device.tag_id}</span>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{device.device_type.replace('_', ' ')}</p>
                      </div>

                      {device.review_filter_enabled && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                          🛡️ Escudo 5★ Activo
                        </span>
                      )}
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600 border border-gray-100">
                      <p className="truncate"><b>Destino:</b> {device.redirect_url}</p>
                      <p className="flex items-center gap-1.5 pt-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-semibold text-gray-800">{device.user_full_name || device.user_email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-500">/r/{device.tag_id}</span>
                    <a
                      href={`/r/${device.tag_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 bg-black text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-800 transition"
                    >
                      <span>Probar Enlace</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
