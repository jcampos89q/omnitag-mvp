'use client'

import { useState } from 'react'
import { 
  Star, 
  ShieldCheck, 
  Plus, 
  Link as LinkIcon, 
  Trash2, 
  QrCode, 
  Sparkles, 
  HelpCircle, 
  ExternalLink,
  MessageSquareWarning,
  CheckCircle2,
  Coffee,
  UserCircle,
  Gift,
  Globe,
  ArrowRight,
  Zap,
  Wifi
} from 'lucide-react'
import { createDevice, deleteDevice } from './actions'
import Link from 'next/link'
import ProFeatureModal from '@/components/ProFeatureModal'

interface DevicesManagerProps {
  devices: any[]
  vcard?: any
  menu?: any
  loyalty?: any
  isPro?: boolean
}

export default function DevicesManager({ 
  devices,
  vcard,
  menu,
  loyalty,
  isPro = false
}: DevicesManagerProps) {
  const [deviceType, setDeviceType] = useState<string>('tap_to_rate')
  const [reviewFilter, setReviewFilter] = useState<boolean>(true)
  const [showGoogleHelp, setShowGoogleHelp] = useState<boolean>(false)
  const [showProModal, setShowProModal] = useState<boolean>(false)
  const [proModalFeature, setProModalFeature] = useState({ name: '', desc: '' })

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Si no es PRO y ya tiene 1 dispositivo registrado
    if (!isPro && devices.length >= 1) {
      e.preventDefault()
      setProModalFeature({
        name: 'Placas NFC & QRs Ilimitados',
        desc: 'El Plan Básico incluye 1 placa activa. Con OmniTag PRO puedes registrar todas las placas de mostrador, mesas y puntos de contacto que necesites.'
      })
      setShowProModal(true)
      return
    }

    // Si no es PRO y seleccionó el filtro inteligente
    if (!isPro && reviewFilter && deviceType === 'tap_to_rate') {
      e.preventDefault()
      setProModalFeature({
        name: 'Escudo Anti-Quejas para Google Reviews',
        desc: 'El filtro inteligente de reseñas de 5 estrellas y el libro digital de quejas privadas es una función exclusiva del Plan PRO.'
      })
      setShowProModal(true)
      return
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. EXPLICACIÓN VISUAL: CÓMO FUNCIONA EL ESCUDO DE RESEÑAS DE GOOGLE */}
      <div className="bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Star className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-base">
              ¿Cómo funciona el Escudo Inteligente de Reseñas de Google?
            </h3>
            <p className="text-xs text-gray-600">
              Filtra automáticamente la experiencia del cliente antes de que llegue a Google Maps:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-900">4 ó 5 Estrellas (Clientes Felices)</h4>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Se envía directo a tu ficha de <b>Google Maps</b> para que publique su reseña pública de 5 estrellas.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-2xs flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span>1 a 3 Estrellas (Quejas Privadas)</span>
                {!isPro && (
                  <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded">
                    PRO
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Abre un <b>buzón privado</b> en OmniTag para resolver la inconformidad internamente sin dañar tu puntaje en Google.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FORMULARIO PARA REGISTRAR O VINCULAR UNA PLACA NFC */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-600" /> Vincular Nueva Placa NFC o Enlace Inteligente
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Elige qué función deseas que se abra cuando los clientes toquen o escaneen esta placa física.
            </p>
          </div>

          {!isPro && (
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Límite Básico: {devices.length}/1 Placa
            </span>
          )}
        </div>

        <form action={createDevice} onSubmit={handleCreateSubmit} className="space-y-5">
          {/* Selector de Tipo de Placa */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              1. Selecciona el Propósito de esta Placa:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setDeviceType('tap_to_rate')}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex flex-col justify-between ${
                  deviceType === 'tap_to_rate'
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Google Reviews
                </span>
                <span className="text-[10px] opacity-75 font-normal mt-1">Con Escudo Anti-Quejas</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceType('vcard')}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex flex-col justify-between ${
                  deviceType === 'vcard'
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <UserCircle className="w-4 h-4 text-blue-500" /> Mi vCard Digital
                </span>
                <span className="text-[10px] opacity-75 font-normal truncate mt-1">{vcard?.slug || 'Tu tarjeta'}</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceType('menu')}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex flex-col justify-between ${
                  deviceType === 'menu'
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-amber-600" /> Menú / Catálogo
                </span>
                <span className="text-[10px] opacity-75 font-normal truncate mt-1">{menu?.name || 'Tu catálogo'}</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceType('loyalty')}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex flex-col justify-between ${
                  deviceType === 'loyalty'
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-purple-500" /> Fidelización
                </span>
                <span className="text-[10px] opacity-75 font-normal truncate mt-1">{loyalty?.name || 'Tarjeta sellos'}</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceType('wifi')}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex flex-col justify-between ${
                  deviceType === 'wifi'
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-purple-600" /> Conexión Wi-Fi
                </span>
                <span className="text-[10px] opacity-75 font-normal truncate mt-1">Placa NFC para clientes</span>
              </button>
            </div>

            <input type="hidden" name="device_type" value={deviceType} />
          </div>

          {/* Campo de URL según tipo */}
          {deviceType === 'tap_to_rate' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="redirect_url" className="block text-xs font-bold text-gray-700">
                  Enlace directo de Google Reviews (o Google Place ID):
                </label>
                <button
                  type="button"
                  onClick={() => setShowGoogleHelp(!showGoogleHelp)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> ¿Cómo conseguir mi enlace de Google?
                </button>
              </div>

              <input 
                type="text" 
                name="redirect_url" 
                id="redirect_url" 
                placeholder="https://g.page/r/TU_ENLACE_GOOGLE/review"
                required
                className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none font-medium" 
              />

              {showGoogleHelp && (
                <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1.5 animate-in fade-in">
                  <p className="font-bold">📍 Pasos para obtener tu enlace de Google Reviews:</p>
                  <p>1. Entra en <b>Google Maps</b> o busca tu negocio en Google.</p>
                  <p>2. Haz clic en el botón <b>"Pedir reseñas"</b> o <b>"Solicitar reseñas"</b>.</p>
                  <p>3. Copia el enlace corto generado (empieza por <code>https://g.page/r/...</code> o <code>https://search.google.com/...</code>) y pégalo aquí.</p>
                </div>
              )}

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="review_filter" 
                    checked={reviewFilter}
                    onChange={(e) => {
                      if (!isPro && e.target.checked) {
                        setProModalFeature({
                          name: 'Escudo Anti-Quejas para Google Reviews',
                          desc: 'El filtro inteligente de reseñas y el buzón privado es una función exclusiva del Plan PRO.'
                        })
                        setShowProModal(true)
                      }
                      setReviewFilter(e.target.checked)
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" 
                  />
                  <span>Activar Escudo Inteligente (Las quejas de 1 a 3 estrellas irán a tu buzón privado)</span>
                  {!isPro && (
                    <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded">
                      PRO
                    </span>
                  )}
                </label>
              </div>
            </div>
          )}

          {deviceType === 'generic' && (
            <div>
              <label htmlFor="redirect_url" className="block text-xs font-bold text-gray-700 mb-1">
                URL de Destino Personalizada:
              </label>
              <input 
                type="url" 
                name="redirect_url" 
                id="redirect_url" 
                placeholder="https://tu-pagina-web.com"
                required
                className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none font-medium" 
              />
            </div>
          )}

          {deviceType === 'vcard' && (
            <input type="hidden" name="redirect_url" value={vcard ? `https://www.omnitag.site/v/${vcard.slug}` : 'https://www.omnitag.site'} />
          )}
          {deviceType === 'menu' && (
            <input type="hidden" name="redirect_url" value={menu ? `https://www.omnitag.site/m/${menu.slug}` : 'https://www.omnitag.site'} />
          )}
          {deviceType === 'loyalty' && (
            <input type="hidden" name="redirect_url" value={loyalty ? `https://www.omnitag.site/l/${loyalty.slug}` : 'https://www.omnitag.site'} />
          )}

          {deviceType === 'wifi' && (
            <div className="p-4 sm:p-5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-purple-700" /> Parámetros de la Placa NFC Wi-Fi
                </span>
                <span className="text-[10px] bg-purple-200 text-purple-900 font-extrabold px-2.5 py-0.5 rounded-full">
                  Compatible con iPhone & Android
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la Red (SSID):</label>
                  <input
                    type="text"
                    name="wifi_ssid"
                    required
                    placeholder="Ej. MiLocal_Clientes"
                    className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs shadow-xs focus:border-black focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña del Wi-Fi:</label>
                  <input
                    type="text"
                    name="wifi_password"
                    placeholder="Contraseña de la red"
                    className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs shadow-xs focus:border-black focus:outline-none font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Comercial a mostrar:</label>
                  <input
                    type="text"
                    name="wifi_name"
                    defaultValue={vcard?.company_name || menu?.name || 'Nuestro Negocio'}
                    placeholder="Ej. Restaurante Bella Italia"
                    className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs shadow-xs focus:border-black focus:outline-none font-medium"
                  />
                </div>

                {menu && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Mostrar acceso al Menú Digital:</label>
                    <select
                      name="wifi_menu_slug"
                      defaultValue={menu.slug}
                      className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs shadow-xs focus:border-black focus:outline-none font-medium"
                    >
                      <option value="">No mostrar menú</option>
                      <option value={menu.slug}>Vincular al Menú: {menu.name}</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="bg-white/90 p-3 rounded-xl border border-purple-100 text-[11px] text-gray-600 space-y-1">
                <p className="font-bold text-purple-950 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> ¿Cómo funciona la conexión por NFC?
                </p>
                <p>
                  Al acercar cualquier smartphone a la placa NFC, se abre de inmediato la pantalla de tu comercio con el botón para <b>copiar la contraseña con 1 toque</b>, el código QR en pantalla y acceso directo a tu menú o catálogo.
                </p>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button 
              type="submit" 
              className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-800 transition shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Placa / Enlace</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. LISTADO DE PLACAS FÍSICAS ACTIVAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Placas y Puntos de Contacto Registrados ({devices.length})
          </h2>
          <Link
            href="/dashboard/qr-studio"
            className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Ir al Estudio QR para Imprimir</span>
          </Link>
        </div>

        {devices.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-800">Aún no tienes placas registradas</p>
            <p className="text-xs text-gray-400 mt-1">Crea tu primera placa para Google Reviews o vincula tu vCard arriba.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => {
              const isGoogle = device.device_type === 'tap_to_rate'
              const isWifi = device.device_type === 'wifi'

              return (
                <div key={device.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isGoogle ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          isWifi ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                          'bg-blue-50 text-blue-600 border border-blue-200'
                        }`}>
                          {isGoogle ? <Star className="w-6 h-6 fill-amber-500" /> : 
                           isWifi ? <Wifi className="w-6 h-6 text-purple-600" /> : 
                           <Globe className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-gray-900 text-sm">Placa Tag: {device.tag_id}</h4>
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-0.5 bg-gray-100 text-gray-700">
                            {isWifi ? 'Wi-Fi Clientes' : device.device_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {device.review_filter_enabled && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Escudo 5★
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600 border border-gray-100">
                      <p className="text-[11px] truncate"><b>Destino:</b> {device.redirect_url}</p>
                      <p className="font-mono text-[10px] text-gray-400 truncate">Enlace público: /r/{device.tag_id}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <a 
                      href={`/r/${device.tag_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center gap-1.5"
                      title="Probar enlace"
                    >
                      <span>Probar Escudo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href="/dashboard/qr-studio"
                        className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition flex items-center gap-1.5"
                        title="Diseñar e imprimir QR"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Imprimir QR</span>
                      </Link>

                      <form action={deleteDevice}>
                        <input type="hidden" name="device_id" value={device.id} />
                        <button 
                          type="submit" 
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Eliminar placa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Upgrade PRO */}
      <ProFeatureModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        featureName={proModalFeature.name}
        featureDescription={proModalFeature.desc}
      />
    </div>
  )
}
