'use client'

import { useState } from 'react'
import { 
  Gift, 
  Award, 
  Users, 
  QrCode, 
  ExternalLink, 
  Copy, 
  Check, 
  KeyRound, 
  ShieldCheck, 
  Clock, 
  Save, 
  MessageSquare, 
  Search, 
  Sparkles, 
  Plus, 
  Palette 
} from 'lucide-react'
import ImageUploadInput from '@/components/ImageUploadInput'
import ThemeSelector from '@/components/ThemeSelector'
import { updateLoyaltyProgram, validateAndAddStamp } from './actions'

interface LoyaltyManagerProps {
  program: any
  members: any[]
  logs: any[]
}

export default function LoyaltyManager({ program, members, logs }: LoyaltyManagerProps) {
  const [copied, setCopied] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPin, setShowPin] = useState(false)

  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/l/${program.slug}` 
    : `https://www.omnitag.site/l/${program.slug}`

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Filtrado de miembros
  const filteredMembers = members.filter(m => 
    m.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.customer_phone.includes(searchTerm)
  )

  // Métricas
  const totalMembers = members.length
  const totalStampsGiven = logs.filter(l => l.action === 'stamp_added').length
  const totalRewardsClaimed = members.reduce((acc, m) => acc + (m.total_rewards_claimed || 0), 0)
  const almostCompletedMembers = members.filter(m => m.current_stamps === program.total_stamps_required - 1)

  return (
    <div className="space-y-8">
      {/* 1. Métricas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Clientes Fieles</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{totalMembers}</p>
          <p className="text-[11px] text-gray-400 mt-1">Registrados en el programa</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Sellos Otorgados</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{totalStampsGiven}</p>
          <p className="text-[11px] text-gray-400 mt-1">Visitas verificadas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Premios Canjeados</span>
            <Gift className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{totalRewardsClaimed}</p>
          <p className="text-[11px] text-gray-400 mt-1">Recompensas entregadas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>A 1 Sello de Ganar</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-700">{almostCompletedMembers.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Prospectos calientes</p>
        </div>
      </div>

      {/* 2. Banner de Enlace y QR del Mostrador */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-yellow-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">
            <QrCode className="w-3.5 h-3.5" /> Enlace para Mostrador / Placa NFC
          </div>
          <h3 className="font-extrabold text-lg sm:text-xl">Tarjeta Digital de Sellos</h3>
          <p className="text-xs text-gray-300 mt-0.5">
            Vincula este enlace a tus placas NFC o coloca el código QR en la caja de tu local.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={copyLink}
            className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Enlace'}</span>
          </button>
          
          <a
            href={`/l/${program.slug}`}
            target="_blank"
            rel="noreferrer"
            className="bg-white text-black font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-gray-100 transition flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4" /> Ver Tarjeta
          </a>
        </div>
      </div>

      {/* 3. Configuración del Programa y PIN de Seguridad */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg sm:text-xl flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" /> Configuración del Programa de Premios
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Personaliza la meta de visitas, el premio final y tu PIN de validación.
            </p>
          </div>
        </div>

        <form action={updateLoyaltyProgram} className="space-y-6">
          <input type="hidden" name="program_id" value={program.id} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Nombre Comercial *</label>
              <input 
                type="text" 
                name="name" 
                defaultValue={program.name} 
                required 
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-black font-medium"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Tipo de Negocio</label>
              <select
                name="business_type"
                defaultValue={program.business_type || 'restaurant'}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-black font-medium bg-white"
              >
                <option value="restaurant">🍽️ Restaurante / Cafetería / Bar</option>
                <option value="salon">💈 Salón de Belleza / Barbería / Spa</option>
                <option value="dental">🦷 Clínica Dental / Médica</option>
                <option value="services">🛍️ Tienda / Comercio / Servicios</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                🎁 Título del Premio al Completar *
              </label>
              <input 
                type="text" 
                name="reward_title" 
                defaultValue={program.reward_title} 
                placeholder="Ej. 1 Corte de Cabello Gratis / 1 Café Americano Gratis" 
                required 
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-black font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                ⭐ Número de Sellos / Visitas Requeridas
              </label>
              <select
                name="total_stamps_required"
                defaultValue={program.total_stamps_required || 6}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-black font-bold bg-white"
              >
                <option value="4">4 Visitas / Sellos (Recompensa Rápida)</option>
                <option value="6">6 Visitas / Sellos (Recomendado)</option>
                <option value="8">8 Visitas / Sellos (Estándar)</option>
                <option value="10">10 Visitas / Sellos (Club VIP)</option>
                <option value="12">12 Visitas / Sellos (Gran Premio)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Descripción y Condiciones del Canje</label>
            <input 
              type="text" 
              name="reward_description" 
              defaultValue={program.reward_description || ''} 
              placeholder="Ej. Válido de lunes a viernes. Muestra tu pantalla al pagar para canjear." 
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Seguridad Antifraude */}
          <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              Seguridad Antifraude para tu Negocio
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-amber-950 mb-1 flex items-center justify-between">
                  <span>PIN Secreto del Cajero / Personal (4 Dígitos) *</span>
                  <button 
                    type="button" 
                    onClick={() => setShowPin(!showPin)} 
                    className="text-[11px] text-amber-800 underline font-bold cursor-pointer"
                  >
                    {showPin ? 'Ocultar' : 'Ver PIN'}
                  </button>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showPin ? 'text' : 'password'}
                    maxLength={4}
                    name="pin_code" 
                    defaultValue={program.pin_code || '1234'} 
                    required 
                    placeholder="1234"
                    className="w-full rounded-xl border border-amber-300 bg-white pl-9 pr-3.5 py-2.5 text-sm shadow-xs font-mono font-bold tracking-widest text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[11px] text-amber-800/80 mt-1">
                  Solo tu personal debe conocer este PIN para sellar las tarjetas en caja.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-950 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" /> Límite de Visitas por Cliente (Cooldown)
                </label>
                <select
                  name="cooldown_hours"
                  defaultValue={program.cooldown_hours || 12}
                  className="w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="0">Sin límite (Permite varios sellos seguidos)</option>
                  <option value="6">Máximo 1 sello cada 6 horas</option>
                  <option value="12">Máximo 1 sello cada 12 horas (Recomendado)</option>
                  <option value="24">Máximo 1 sello cada 24 horas (1 por día)</option>
                </select>
                <p className="text-[11px] text-amber-800/80 mt-1">
                  Evita que un mismo cliente sume múltiples visitas en un mismo día.
                </p>
              </div>
            </div>
          </div>

          {/* Logotipo */}
          <div>
            <ImageUploadInput
              name="logo"
              label="Logotipo del Negocio para la Tarjeta"
              defaultValue={program.logo_url}
              shape="circle"
              helpText="Aparecerá en la parte superior de la tarjeta de sellos digital."
            />
          </div>

          {/* Tema Visual */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600" />
              Tema Visual y Tipografía de la Tarjeta de Sellos
            </h4>
            <ThemeSelector initialTheme={program.theme} fieldNamePrefix="theme" />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center gap-2 text-sm cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" /> Guardar Configuración del Programa
            </button>
          </div>
        </form>
      </div>

      {/* 4. CRM de Clientes Registrados */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg sm:text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Clientes y Tarjetas Activas ({members.length})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Contacta a tus clientes frecuentes directamente por WhatsApp para recordarles sus premios.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Buscar por teléfono o nombre..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {members.length === 0 ? (
          <div className="p-10 text-center text-gray-500 border border-gray-100 rounded-2xl bg-gray-50/50">
            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-800 text-sm">Aún no hay clientes registrados en el programa</p>
            <p className="text-xs text-gray-500 mt-1">
              Coloca tu código QR o placa NFC en el mostrador para que tus clientes comiencen a acumular sellos.
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase text-gray-500 font-bold tracking-wider">
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Progreso de Sellos</th>
                  <th className="px-5 py-3.5">Premios Ganados</th>
                  <th className="px-5 py-3.5">Última Visita</th>
                  <th className="px-5 py-3.5 text-right">Contactar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm bg-white">
                {filteredMembers.map((member) => {
                  const cleanPhone = member.customer_phone.replace(/\D/g, '')
                  const isReadyToClaim = member.current_stamps >= program.total_stamps_required
                  const isOneLeft = member.current_stamps === program.total_stamps_required - 1

                  let waMessage = ''
                  if (isReadyToClaim) {
                    waMessage = `¡Hola ${member.customer_name}! 🎉 Vemos que completaste todos tus sellos en ${program.name}. Tienes disponible tu premio: *${program.reward_title}*. ¡Te esperamos para canjearlo!`
                  } else if (isOneLeft) {
                    waMessage = `¡Hola ${member.customer_name}! ⭐ Te falta solo 1 visita en ${program.name} para ganar tu premio: *${program.reward_title}*. ¡Visítanos pronto!`
                  } else {
                    waMessage = `¡Hola ${member.customer_name}! Gracias por ser cliente de ${program.name}. Llevas ${member.current_stamps} de ${program.total_stamps_required} sellos acumulados.`
                  }

                  return (
                    <tr key={member.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm">{member.customer_name}</p>
                        <p className="font-mono text-xs text-gray-500">{member.customer_phone}</p>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                isReadyToClaim ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, (member.current_stamps / program.total_stamps_required) * 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${isReadyToClaim ? 'text-emerald-700' : 'text-gray-700'}`}>
                            {member.current_stamps} / {program.total_stamps_required}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-bold text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          🎁 {member.total_rewards_claimed || 0}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {member.last_stamp_at 
                          ? new Date(member.last_stamp_at).toLocaleDateString()
                          : new Date(member.created_at).toLocaleDateString()
                        }
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE57] transition shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-white" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
