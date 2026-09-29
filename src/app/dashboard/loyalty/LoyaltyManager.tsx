'use client'

import { useState, useEffect } from 'react'
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
  Palette,
  MapPin,
  Send,
  BellRing,
  Megaphone,
  Radio,
  AlertCircle,
  X,
  Navigation
} from 'lucide-react'
import ImageUploadInput from '@/components/ImageUploadInput'
import ThemeSelector from '@/components/ThemeSelector'
import GooglePlaceSearchInput, { PlaceDetails } from '@/components/GooglePlaceSearchInput'
import { updateLoyaltyProgram, validateAndAddStamp, sendLoyaltyCampaignPush } from './actions'

interface LoyaltyManagerProps {
  program: any
  members: any[]
  logs: any[]
  messages?: any[]
}

export default function LoyaltyManager({ program, members, logs, messages = [] }: LoyaltyManagerProps) {
  const [copied, setCopied] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPin, setShowPin] = useState(false)

  // Estados de Campaña Push
  const [campaignModalOpen, setCampaignModalOpen] = useState(false)
  const [campaignTitle, setCampaignTitle] = useState('')
  const [campaignBody, setCampaignBody] = useState('')
  const [campaignLoading, setCampaignLoading] = useState(false)
  const [campaignFeedback, setCampaignFeedback] = useState<{
    type: 'success' | 'error'
    message: string
    needsApiEnable?: boolean
  } | null>(null)

  // Estados de Geolocalización
  const [address, setAddress] = useState(program.address || '')
  const [lat, setLat] = useState(program.latitude ? String(program.latitude) : '')
  const [lng, setLng] = useState(program.longitude ? String(program.longitude) : '')
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Sincronizar estados si program cambia
  useEffect(() => {
    if (program.address) setAddress(program.address)
    if (program.latitude) setLat(String(program.latitude))
    if (program.longitude) setLng(String(program.longitude))
  }, [program.address, program.latitude, program.longitude])

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSavingConfig(true)
    setSaveSuccess(false)
    const formData = new FormData(e.currentTarget)
    try {
      await updateLoyaltyProgram(formData)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 6000)
    } catch (err: any) {
      alert('Error al guardar configuración: ' + (err.message || 'Error desconocido'))
    } finally {
      setSavingConfig(false)
    }
  }

  const handlePlaceSelected = (place: PlaceDetails) => {
    if (place.formatted_address) {
      setAddress(place.formatted_address)
    }
    if (place.lat !== undefined && place.lng !== undefined) {
      setLat(place.lat.toFixed(6))
      setLng(place.lng.toFixed(6))
    }
  }

  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('La geolocalización no está disponible en este dispositivo.')
      return
    }
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6))
        setLng(pos.coords.longitude.toFixed(6))
        setDetectingLocation(false)
      },
      (err) => {
        alert('No se pudo obtener la ubicación: ' + err.message)
        setDetectingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignTitle.trim() || !campaignBody.trim()) return

    setCampaignLoading(true)
    setCampaignFeedback(null)

    const formData = new FormData()
    formData.append('program_id', program.id)
    formData.append('title', campaignTitle)
    formData.append('body', campaignBody)

    try {
      const res = await sendLoyaltyCampaignPush(formData)
      if (res.success) {
        setCampaignFeedback({
          type: 'success',
          message: res.message || 'Campaña enviada con éxito.'
        })
        setCampaignTitle('')
        setCampaignBody('')
      } else {
        setCampaignFeedback({
          type: 'error',
          message: res.error || 'Ocurrió un error al enviar.',
          needsApiEnable: res.needsApiEnable
        })
      }
    } catch (err: any) {
      setCampaignFeedback({
        type: 'error',
        message: err.message || 'Error de conexión.'
      })
    } finally {
      setCampaignLoading(false)
    }
  }

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

      {/* 2.5. Campañas Push a Billeteras de Google */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white p-6 rounded-2xl shadow-lg border border-purple-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-purple-400/30">
              <BellRing className="w-3.5 h-3.5" /> Google Wallet Push Marketing
            </div>
            <h3 className="font-extrabold text-xl sm:text-2xl text-white">
              Notificaciones Directas a las Billeteras
            </h3>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-xl">
              Envía promociones, recordatorios y ofertas a la pantalla de bloqueo de los clientes que guardaron tu tarjeta en su teléfono. Sin costo de SMS ni WhatsApp.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCampaignModalOpen(!campaignModalOpen)
              setCampaignFeedback(null)
            }}
            className="bg-white text-purple-950 hover:bg-purple-50 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap"
          >
            <Megaphone className="w-4 h-4 text-purple-700" />
            <span>{campaignModalOpen ? 'Cerrar Formulario' : 'Crear Campaña Push'}</span>
          </button>
        </div>

        {/* Formulario Desplegable de Campaña Push */}
        {campaignModalOpen && (
          <form onSubmit={handleSendCampaign} className="mt-6 pt-6 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1">
                  Título de la Notificación (máx. 50 caracteres) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="Ej. ¡Jueves de 2x1 en Café!"
                  className="w-full rounded-xl border border-purple-400/40 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1">
                  Destinatarios
                </label>
                <div className="w-full rounded-xl border border-purple-400/20 bg-black/30 px-3.5 py-2.5 text-xs text-purple-300 flex items-center justify-between">
                  <span>Todos los clientes con tarjeta en Google Wallet</span>
                  <span className="font-bold text-white bg-purple-600/60 px-2 py-0.5 rounded-lg">{totalMembers} registrados</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1">
                Mensaje de la Oferta / Promoción *
              </label>
              <textarea
                required
                rows={2}
                maxLength={200}
                value={campaignBody}
                onChange={(e) => setCampaignBody(e.target.value)}
                placeholder="Ej. Ven hoy de 4 a 8 PM y recibe tu segundo café de especialidad gratis presentando tu tarjeta de sellos."
                className="w-full rounded-xl border border-purple-400/40 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {campaignFeedback && (
              <div className={`p-4 rounded-xl text-xs ${
                campaignFeedback.type === 'success' 
                  ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200' 
                  : 'bg-rose-500/20 border border-rose-400/40 text-rose-200'
              }`}>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{campaignFeedback.message}</p>
                    {campaignFeedback.needsApiEnable && (
                      <div className="mt-2 text-[11px] text-white space-y-1">
                        <p>
                          Tu cuenta de Google Cloud necesita tener habilitada la <b>Google Wallet API</b> para despachar notificaciones.
                        </p>
                        <a
                          href="https://console.developers.google.com/apis/api/walletobjects.googleapis.com/overview?project=1009146761390"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 bg-white text-black font-extrabold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition mt-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Habilitar Google Wallet API en 1 Clic
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCampaignModalOpen(false)}
                className="text-xs font-bold text-purple-300 hover:text-white px-4 py-2 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={campaignLoading}
                className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{campaignLoading ? 'Despachando...' : 'Enviar Notificación Push Ahora'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Historial Reciente de Mensajes */}
        {messages && messages.length > 0 && !campaignModalOpen && (
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-purple-200/70 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Última campaña: <b>"{messages[0].title}"</b> ({new Date(messages[0].created_at).toLocaleDateString('es-ES')})
            </span>
            <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-md font-mono text-emerald-300">
              {messages.length} mensaje(s) enviado(s)
            </span>
          </div>
        )}
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

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <input type="hidden" name="program_id" value={program.id} />

          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>¡Configuración, dirección y coordenadas GPS guardadas exitosamente!</span>
            </div>
          )}

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

          {/* Geolocalización y Aviso por Proximidad (Google Wallet) */}
          <div className="bg-blue-50/70 border border-blue-200 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-blue-950 font-extrabold text-sm">
                <MapPin className="w-5 h-5 text-blue-700" />
                Geolocalización & Aviso por Proximidad en Google Wallet
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:text-blue-900 bg-white hover:bg-blue-100/60 border border-blue-300 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs self-start sm:self-auto"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>{detectingLocation ? 'Detectando GPS...' : 'Detectar mi Ubicación Actual'}</span>
              </button>
            </div>

            <p className="text-xs text-blue-900/80">
              Cuando un cliente que guardó tu tarjeta pase cerca de esta dirección (a 100-150 metros), <b>Google Wallet le enviará un recordatorio automático a su pantalla de bloqueo</b> para que entre a tu negocio.
            </p>

            {/* Buscador inteligente con Google Maps API */}
            <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-2xs space-y-2">
              <label className="block text-xs font-extrabold text-blue-950 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Buscar mi Negocio en Google Maps (Autocompleta nombre, dirección y GPS)</span>
              </label>
              <GooglePlaceSearchInput
                initialPlace={
                  program.address
                    ? {
                        name: program.name || 'Negocio',
                        formatted_address: program.address,
                        place_id: 'saved_place',
                        direct_review_url: ''
                      }
                    : null
                }
                onPlaceSelected={handlePlaceSelected}
                className="w-full text-xs"
              />
              <p className="text-[11px] text-gray-400">
                Escribe parte del nombre de tu negocio para buscarlo en Google Maps y extraer automáticamente la dirección exacta y coordenadas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-blue-950 mb-1">
                  Dirección del Local
                </label>
                <input
                  type="text"
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej. Calle Principal 123, Centro"
                  className="w-full rounded-xl border border-blue-300 bg-white px-3.5 py-2 text-xs sm:text-sm shadow-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-950 mb-1">
                  Latitud GPS
                </label>
                <input
                  type="text"
                  name="latitude"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="Ej. 19.432608"
                  className="w-full rounded-xl border border-blue-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-950 mb-1">
                  Longitud GPS
                </label>
                <input
                  type="text"
                  name="longitude"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="Ej. -99.133209"
                  className="w-full rounded-xl border border-blue-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button 
              type="submit" 
              disabled={savingConfig}
              className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center gap-2 text-sm cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? 'Guardando cambios...' : 'Guardar Configuración del Programa'}</span>
            </button>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" /> ¡Guardado con éxito!
              </span>
            )}
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
