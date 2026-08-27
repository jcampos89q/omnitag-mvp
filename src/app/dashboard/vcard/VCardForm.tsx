'use client'

import { useState } from 'react'
import { User, Building2, MapPin, Clock, ExternalLink, Sparkles, MessageCircle, Lock, Crown } from 'lucide-react'
import ImageUploadInput from '@/components/ImageUploadInput'
import ThemeSelector from '@/components/ThemeSelector'
import ProFeatureModal from '@/components/ProFeatureModal'
import { saveVCard } from './actions'

interface VCardFormProps {
  vcard?: any
  isPro?: boolean
}

export default function VCardForm({ vcard, isPro = false }: VCardFormProps) {
  const [cardType, setCardType] = useState<'personal' | 'business'>(
    vcard?.card_type === 'business' ? 'business' : 'personal'
  )
  const [leadCaptureEnabled, setLeadCaptureEnabled] = useState<boolean>(
    isPro ? (vcard?.lead_capture_enabled ?? true) : false
  )
  const [showProModal, setShowProModal] = useState<boolean>(false)

  const businessInfo = vcard?.business_info || {}

  return (
    <form action={saveVCard} className="space-y-8 max-w-3xl">
      {/* 1. Selector de Tipo de vCard (Personal vs Empresa) */}
      <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Tipo de Perfil Digital
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
          <span>📸</span> Fotos, Logotipo y Portada
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

      {/* 3. Datos Principales (Dinámicos según Personal o Empresa) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>📝</span> {cardType === 'business' ? 'Información de la Empresa' : 'Datos Profesionales'}
        </h2>

        {cardType === 'personal' ? (
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
            <div>
              <label htmlFor="job_title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Cargo / Especialidad</label>
              <input 
                type="text" 
                name="job_title" 
                id="job_title" 
                defaultValue={vcard?.job_title || ''} 
                placeholder="Ej. Fundador, Diseñador UI/UX"
                className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
              />
            </div>
            <div>
              <label htmlFor="company_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Empresa / Negocio</label>
              <input 
                type="text" 
                name="company_name" 
                id="company_name" 
                defaultValue={vcard?.company_name || ''} 
                placeholder="Ej. Nexoria Digital"
                className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nombre Comercial de la Empresa *</label>
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
                <label htmlFor="job_title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Rubro / Eslogan Corto</label>
                <input 
                  type="text" 
                  name="job_title" 
                  id="job_title" 
                  defaultValue={vcard?.job_title || ''} 
                  placeholder="Ej. Odontología Especializada & Estética"
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="business_hours" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" /> Horario de Atención
                </label>
                <input 
                  type="text" 
                  name="business_hours" 
                  id="business_hours" 
                  defaultValue={businessInfo.hours || ''} 
                  placeholder="Ej. Lun - Vie: 8:00 AM - 6:00 PM"
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
              <div>
                <label htmlFor="business_address" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" /> Dirección Física / Local
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
            {cardType === 'business' ? 'Descripción y Propuesta de Valor de la Empresa' : 'Biografía breve'}
          </label>
          <textarea 
            name="bio" 
            id="bio" 
            rows={3}
            defaultValue={vcard?.bio || ''} 
            placeholder={cardType === 'business' ? 'Describe tus soluciones, servicios y valor para tus clientes...' : 'Hola, me apasiona crear soluciones...'}
            className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none resize-none" 
          />
        </div>
      </div>

      {/* 4. Canales de Contacto y Redes Sociales */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>📲</span> Canales de Contacto y Redes
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
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email Público / Ventas</label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              defaultValue={vcard?.contact_info?.email || ''} 
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
              placeholder="https://nexoriama.com" 
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
              placeholder="https://linkedin.com/company/..." 
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
        </div>
      </div>

      {/* 5. Selector de Temas, Paletas de Colores & Tipografías */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🎨</span> Personalización de Tema, Colores y Tipografías
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Elige una plantilla de diseño o personaliza los colores y tipografía para que coincidan con tu marca.
            </p>
          </div>
        </div>

        <ThemeSelector initialTheme={vcard?.theme} fieldNamePrefix="theme" />
      </div>

      {/* 6. Modo Captura de Contactos (Exclusivo PRO) */}
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
              Activar Formulario "Intercambiar Contacto / Capturar Leads"
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

      {/* Botón de Guardado */}
      <div className="flex justify-end pt-2">
        <button 
          type="submit" 
          className="w-full sm:w-auto bg-black text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          Guardar Cambios del Perfil
        </button>
      </div>

      {/* Modal de Upgrade PRO */}
      <ProFeatureModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        featureName="Formulario de Captura de Contactos (vCard)"
        featureDescription="Desbloquea el botón interactivo de intercambio de contactos en tu tarjeta digital para capturar el Nombre, WhatsApp y Email de todos tus prospectos y guardarlos en tu CRM."
      />
    </form>
  )
}
