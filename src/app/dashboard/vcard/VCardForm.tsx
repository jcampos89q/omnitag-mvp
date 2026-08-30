'use client'

import { useState } from 'react'
import { 
  User, 
  Building2, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  MessageCircle, 
  Lock, 
  Crown,
  Phone,
  Mail,
  Globe,
  Share2,
  Calendar,
  Layers,
  Palette,
  CheckCircle2,
  UtensilsCrossed,
  Scissors,
  Gift,
  Star
} from 'lucide-react'
import ImageUploadInput from '@/components/ImageUploadInput'
import ThemeSelector from '@/components/ThemeSelector'
import ProFeatureModal from '@/components/ProFeatureModal'
import { saveVCard } from './actions'

interface VCardFormProps {
  vcard?: any
  isPro?: boolean
}

const TIME_OPTIONS = [
  '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
  '09:00 PM', '09:30 PM', '10:00 PM', '11:00 PM'
]

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
]

export default function VCardForm({ vcard, isPro = false }: VCardFormProps) {
  const [cardType, setCardType] = useState<'personal' | 'business'>(
    vcard?.card_type === 'business' ? 'business' : 'personal'
  )
  const [leadCaptureEnabled, setLeadCaptureEnabled] = useState<boolean>(
    isPro ? (vcard?.lead_capture_enabled ?? true) : false
  )
  const [showProModal, setShowProModal] = useState<boolean>(false)

  const businessInfo = vcard?.business_info || {}
  const savedSchedule = businessInfo?.schedule_config || {}

  return (
    <form action={saveVCard} className="space-y-8 max-w-3xl">
      {/* 1. Selector de Tipo de vCard (Personal vs Empresa) */}
      <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200 space-y-3">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          1. Tipo de Perfil Digital
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCardType('personal')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
              cardType === 'personal'
                ? 'border-black bg-white shadow-sm ring-2 ring-black/10'
                : 'border-gray-200 bg-white/50 text-gray-600 hover:bg-white'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${cardType === 'personal' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">Profesional / Marca Personal</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Para ejecutivos, freelancers, doctores, abogados, agentes y consultores.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCardType('business')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
              cardType === 'business'
                ? 'border-black bg-white shadow-sm ring-2 ring-black/10'
                : 'border-gray-200 bg-white/50 text-gray-600 hover:bg-white'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${cardType === 'business' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">Empresa / Negocio / Marca</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Para empresas, clínicas, locales, despachos, agencias y marcas con sucursales.
              </p>
            </div>
          </button>
        </div>

        <input type="hidden" name="card_type" value={cardType} />
      </div>

      {/* 2. Aspecto Visual, Logo/Foto y Portada */}
      <div className="bg-gray-50/80 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-5">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>📸</span> 2. Fotos, Logotipo y Portada
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <ImageUploadInput
              name="avatar"
              label={cardType === 'business' ? 'Logotipo de la Empresa' : 'Foto de Perfil'}
              defaultValue={vcard?.avatar_url}
              shape="circle"
              helpText={cardType === 'business' ? 'Logo en formato cuadrado o circular (PNG o JPG).' : 'Foto de tu rostro o marca personal.'}
            />
          </div>
          <div>
            <ImageUploadInput
              name="cover"
              label="Banner / Portada Panorámica"
              defaultValue={vcard?.cover_url}
              shape="banner"
              helpText="Banner horizontal de fondo para la cabecera (alta resolución)."
            />
          </div>
        </div>
      </div>

      {/* 3. Datos Principales */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>📝</span> 3. {cardType === 'business' ? 'Información de la Empresa' : 'Datos Profesionales'}
        </h2>

        {cardType === 'personal' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input 
                  type="text" 
                  name="first_name" 
                  id="first_name" 
                  required
                  defaultValue={vcard?.first_name || ''} 
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input 
                  type="text" 
                  name="last_name" 
                  id="last_name" 
                  defaultValue={vcard?.last_name || ''} 
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="job_title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Cargo / Especialidad</label>
                <input 
                  type="text" 
                  name="job_title" 
                  id="job_title" 
                  defaultValue={vcard?.job_title || ''} 
                  placeholder="Ej. Fundador, Odontólogo, Abogado"
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
              <div>
                <label htmlFor="company_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Empresa / Despacho</label>
                <input 
                  type="text" 
                  name="company_name" 
                  id="company_name" 
                  defaultValue={vcard?.company_name || ''} 
                  placeholder="Ej. Nexoria Digital"
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
              <div>
                <label htmlFor="business_category" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Rubro Principal</label>
                <select
                  name="business_category"
                  id="business_category"
                  defaultValue={businessInfo.category || 'professional'}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none"
                >
                  <option value="professional">💼 Servicios Profesionales & Consultoría</option>
                  <option value="dental">🦷 Clínica Dental & Odontología</option>
                  <option value="medical">🩺 Consultorio Médico & Salud</option>
                  <option value="salon">💇‍♀️ Salón de Belleza & Estilismo</option>
                  <option value="barbershop">💈 Barbería & Cuidado Masculino</option>
                  <option value="spa">💆 Spa, Masajes & Estética</option>
                  <option value="restaurant">🍽️ Restaurante, Café & Bar</option>
                  <option value="tattoo">🎨 Estudio de Tatuajes & Arte</option>
                  <option value="retail">🛍️ Tienda / Comercio Retail</option>
                  <option value="corporate">🏢 Empresa / Corporativo</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="company_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nombre Comercial *</label>
                <input 
                  type="text" 
                  name="company_name" 
                  id="company_name" 
                  required
                  defaultValue={vcard?.company_name || ''} 
                  placeholder="Ej. Clínica Dental Sonrisas"
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
              <div>
                <label htmlFor="business_category" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tipo de Negocio / Rubro</label>
                <select
                  name="business_category"
                  id="business_category"
                  defaultValue={businessInfo.category || 'corporate'}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none"
                >
                  <option value="restaurant">🍽️ Restaurante, Café & Bar</option>
                  <option value="barbershop">💈 Barbería & Peluquería</option>
                  <option value="salon">💇‍♀️ Salón de Belleza & Uñas</option>
                  <option value="dental">🦷 Clínica Dental & Odontología</option>
                  <option value="medical">🩺 Consultorio Médico & Salud</option>
                  <option value="spa">💆 Spa, Masajes & Estética</option>
                  <option value="professional">💼 Servicios Profesionales</option>
                  <option value="tattoo">🎨 Estudio de Tatuajes & Arte</option>
                  <option value="retail">🛍️ Tienda / Comercio Retail</option>
                  <option value="corporate">🏢 Empresa / Corporativo</option>
                </select>
              </div>
              <div>
                <label htmlFor="job_title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Eslogan Corto / Subtítulo</label>
                <input 
                  type="text" 
                  name="job_title" 
                  id="job_title" 
                  defaultValue={vcard?.job_title || ''} 
                  placeholder="Ej. Odontología Especializada"
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
            </div>

            {/* Botón de Acción Destacado (CTA) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label htmlFor="cta_text" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Texto del Botón Destacado (CTA)
                </label>
                <input 
                  type="text" 
                  name="cta_text" 
                  id="cta_text" 
                  defaultValue={businessInfo.cta_text || ''} 
                  placeholder="Ej. Agendar Cita Online / Ver Menú"
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
              <div>
                <label htmlFor="cta_url" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Enlace del Botón Destacado
                </label>
                <input 
                  type="url" 
                  name="cta_url" 
                  id="cta_url" 
                  defaultValue={businessInfo.cta_url || ''} 
                  placeholder="https://wa.me/... o https://misitio.com"
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Biografía / Descripción */}
        <div>
          <label htmlFor="bio" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            {cardType === 'business' ? 'Descripción y Propuesta de Valor' : 'Biografía breve / Presentación'}
          </label>
          <textarea 
            name="bio" 
            id="bio" 
            rows={3}
            defaultValue={vcard?.bio || ''} 
            placeholder={cardType === 'business' ? 'Describe tus soluciones, servicios y valor para tus clientes...' : 'Hola, me apasiona crear soluciones y asesorar a mis clientes...'}
            className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none resize-none" 
          />
        </div>
      </div>

      {/* 4. Canales de Contacto y Redes Sociales */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>📲</span> 4. Canales de Contacto y Redes Sociales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Teléfono Directo / WhatsApp</label>
            <input 
              type="tel" 
              name="phone" 
              id="phone" 
              defaultValue={vcard?.contact_info?.phone || ''} 
              placeholder="+504 9988-6256" 
              className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email Público / Contacto</label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              defaultValue={vcard?.contact_info?.email || ''} 
              placeholder="contacto@miempresa.com"
              className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
            />
          </div>
          <div>
            <label htmlFor="website" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sitio Web Oficial</label>
            <input 
              type="url" 
              name="website" 
              id="website" 
              defaultValue={vcard?.contact_info?.website || ''} 
              placeholder="https://miempresa.com" 
              className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
            />
          </div>
          <div>
            <label htmlFor="instagram" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Instagram (@usuario)</label>
            <input 
              type="text" 
              name="instagram" 
              id="instagram" 
              defaultValue={vcard?.contact_info?.instagram || ''} 
              placeholder="ejemplo.empresa"
              className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
            />
          </div>
          <div>
            <label htmlFor="facebook" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
            <input 
              type="url" 
              name="facebook" 
              id="facebook" 
              defaultValue={vcard?.contact_info?.facebook || ''} 
              placeholder="https://facebook.com/..." 
              className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
            />
          </div>
          <div>
            <label htmlFor="tiktok" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">TikTok Username</label>
            <input 
              type="text" 
              name="tiktok" 
              id="tiktok" 
              defaultValue={vcard?.contact_info?.tiktok || ''} 
              placeholder="@usuario"
              className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
            />
          </div>
          <div>
            <label htmlFor="linkedin" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
            <input 
              type="url" 
              name="linkedin" 
              id="linkedin" 
              defaultValue={vcard?.contact_info?.linkedin || ''} 
              placeholder="https://linkedin.com/in/..." 
              className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
            />
          </div>
        </div>
      </div>

      {/* 5. Horario de Atención Semanal Informativo & Ubicación */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>🕒</span> 5. Horario de Atención Semanal & Ubicación
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Tus clientes podrán consultar tu horario semanal en vivo (Abierto/Cerrado) directamente en tu tarjeta digital.
          </p>
        </div>

        {/* Dirección y Google Maps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="business_address" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-500" /> Dirección Física / Local / Consultorio
            </label>
            <input 
              type="text" 
              name="business_address" 
              id="business_address" 
              defaultValue={businessInfo.address || ''} 
              placeholder="Ej. Plaza Central, Nivel 2, Local #12"
              className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
            />
          </div>
          <div>
            <label htmlFor="google_maps_url" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" /> Enlace de Google Maps (Ubicación GPS)
            </label>
            <input 
              type="url" 
              name="google_maps_url" 
              id="google_maps_url" 
              defaultValue={businessInfo.maps_url || ''} 
              placeholder="https://maps.app.goo.gl/..."
              className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
            />
          </div>
        </div>

        {/* Editor de Horario Semanal */}
        <div className="pt-2 space-y-3">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Horario Día por Día (Lunes a Domingo)
          </label>

          {/* Pausa de Comida / Almuerzo */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 font-bold text-xs text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                name="lunch_break_enabled"
                defaultChecked={savedSchedule?.lunch_break?.enabled ?? true}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <span>Pausa de Comida / Almuerzo</span>
            </label>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">De</span>
              <select
                name="lunch_break_start"
                defaultValue={savedSchedule?.lunch_break?.start || '12:00 PM'}
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-medium focus:border-black focus:outline-none"
              >
                {['11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <span className="text-gray-500">a</span>
              <select
                name="lunch_break_end"
                defaultValue={savedSchedule?.lunch_break?.end || '01:00 PM'}
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-medium focus:border-black focus:outline-none"
              >
                {['12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 7 Días de la semana */}
          <div className="space-y-2">
            {DAYS_OF_WEEK.map(({ key, label }) => {
              const dayData = savedSchedule?.days?.[key] || {
                enabled: key !== 'sunday',
                open: key === 'saturday' ? '09:00 AM' : '08:00 AM',
                close: key === 'saturday' ? '07:00 PM' : '07:00 PM'
              }

              return (
                <div key={key} className="p-3 bg-gray-50/70 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <label className="flex items-center gap-2.5 font-bold text-gray-900 w-32 cursor-pointer">
                    <input
                      type="checkbox"
                      name={`${key}_enabled`}
                      defaultChecked={dayData.enabled}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>{label}</span>
                  </label>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[11px] text-gray-500">De</span>
                    <select
                      name={`${key}_open`}
                      defaultValue={dayData.open || '08:00 AM'}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-medium focus:border-black focus:outline-none flex-1 sm:flex-none"
                    >
                      {TIME_OPTIONS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    <span className="text-[11px] text-gray-500">a</span>
                    <select
                      name={`${key}_close`}
                      defaultValue={dayData.close || '07:00 PM'}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-medium focus:border-black focus:outline-none flex-1 sm:flex-none"
                    >
                      {TIME_OPTIONS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 6. Ecosistema de Módulos Conectados del Negocio (Hub Central) */}
      <div className="bg-linear-to-r from-gray-900 via-slate-900 to-black text-white p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3 fill-black" /> Hub Central Unificado
          </div>
          <h3 className="font-extrabold text-base sm:text-lg">
            6. Módulos y Accesos Visibles en tu Tarjeta Digital
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Tu tarjeta vCard funciona como el portal de bienvenida del negocio. Activa o desactiva qué módulos verán tus clientes:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Switch Menú Digital */}
          <label className="p-3.5 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/15 transition">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🍽️</span>
              <div>
                <p className="font-bold text-xs">Menú & Catálogo</p>
                <p className="text-[10px] text-gray-400">Platos, precios y pedidos</p>
              </div>
            </div>
            <input
              type="checkbox"
              name="show_menu"
              defaultChecked={businessInfo?.show_menu !== false}
              className="w-4 h-4 rounded text-yellow-400 focus:ring-yellow-400"
            />
          </label>

          {/* Switch Agenda & Citas */}
          <label className="p-3.5 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/15 transition">
            <div className="flex items-center gap-2.5">
              <span className="text-base">📅</span>
              <div>
                <p className="font-bold text-xs">Agendas & Citas</p>
                <p className="text-[10px] text-gray-400">Reserva con especialistas</p>
              </div>
            </div>
            <input
              type="checkbox"
              name="show_appointments"
              defaultChecked={businessInfo?.show_appointments !== false}
              className="w-4 h-4 rounded text-purple-400 focus:ring-purple-400"
            />
          </label>

          {/* Switch Fidelización */}
          <label className="p-3.5 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/15 transition">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🎁</span>
              <div>
                <p className="font-bold text-xs">Club de Sellos</p>
                <p className="text-[10px] text-gray-400">Premios a clientes fieles</p>
              </div>
            </div>
            <input
              type="checkbox"
              name="show_loyalty"
              defaultChecked={businessInfo?.show_loyalty !== false}
              className="w-4 h-4 rounded text-pink-400 focus:ring-pink-400"
            />
          </label>

          {/* Switch Reseñas Google */}
          <label className="p-3.5 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/15 transition">
            <div className="flex items-center gap-2.5">
              <span className="text-base">⭐</span>
              <div>
                <p className="font-bold text-xs">Reseñas Google & NFC</p>
                <p className="text-[10px] text-gray-400">Multiplicador 5 estrellas</p>
              </div>
            </div>
            <input
              type="checkbox"
              name="show_reviews"
              defaultChecked={businessInfo?.show_reviews !== false}
              className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400"
            />
          </label>
        </div>
      </div>

      {/* 7. Selector de Temas, Paletas de Colores & Tipografías */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>🎨</span> 7. Personalización de Tema, Colores y Tipografías
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Elige una plantilla de diseño o personaliza los colores y tipografía para que coincidan con tu marca.
          </p>
        </div>

        <ThemeSelector initialTheme={vcard?.theme} fieldNamePrefix="theme" />
      </div>

      {/* 8. Modo Captura de Contactos (Exclusivo PRO) */}
      <div className={`p-5 rounded-2xl border flex items-start gap-3.5 transition ${
        isPro ? 'bg-blue-50/80 border-blue-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <input
          id="lead_capture_enabled"
          name="lead_capture_enabled"
          type="checkbox"
          checked={leadCaptureEnabled}
          onChange={(e) => {
            if (!isPro) {
              setShowProModal(true)
              return
            }
            setLeadCaptureEnabled(e.target.checked)
          }}
          className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <label 
              htmlFor="lead_capture_enabled" 
              onClick={() => {
                if (!isPro) setShowProModal(true)
              }}
              className="font-bold text-gray-900 block text-sm sm:text-base cursor-pointer"
            >
              8. Activar Formulario "Intercambiar Contacto / Capturar Leads"
            </label>
            {!isPro && (
              <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3 text-purple-600" /> PRO
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
            {isPro
              ? 'Permite que los visitantes de tu perfil puedan dejarte sus datos (Nombre, Teléfono, Correo) con un solo toque y los verás organizados en tu sección de Contactos (CRM).'
              : 'Función exclusiva de OmniTag PRO. Permite que tus clientes te dejen sus datos de contacto para sincronizarlos con tu CRM y WhatsApp.'}
          </p>
        </div>
      </div>

      {/* Botón Flotante / Inferior de Guardado */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-all cursor-pointer text-sm flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Guardar Cambios del Perfil</span>
        </button>
      </div>

      {/* Modal de Upgrade PRO */}
      <ProFeatureModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        featureName="Captura de Contactos (Leads CRM)"
        featureDescription="Convierte visitantes en clientes potenciales permitiéndoles dejar sus datos de contacto directamente en tu perfil digital."
      />
    </form>
  )
}
