'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Sparkles, 
  AlertCircle, 
  Building2, 
  MapPin, 
  Tag, 
  Hourglass, 
  Search, 
  CheckCircle2, 
  LogIn, 
  Store, 
  Loader2, 
  Check,
  KeyRound
} from 'lucide-react'
import GooglePlaceSearchInput, { PlaceDetails } from '@/components/GooglePlaceSearchInput'
import { activatePlateAndRegister } from './actions'
import { createClient } from '@/lib/supabase/client'

export interface ExistingBusinessOption {
  id: string
  businessName: string
  placeId: string | null
  directReviewUrl: string | null
  businessAddress: string | null
  businessPhone: string | null
  googleTypes: string[]
  reviewFilterEnabled: boolean
}

interface ActivatePlateClientProps {
  tagId: string
  currentUser: { id: string; email: string } | null
  existingBusinesses?: ExistingBusinessOption[]
  userProfile?: { fullName: string | null; personalPhone: string | null } | null
  serverError?: string
  initialEmail?: string
  initialAuthMode?: string
}

export default function ActivatePlateClient({
  tagId,
  currentUser,
  existingBusinesses = [],
  userProfile,
  serverError,
  initialEmail = '',
  initialAuthMode
}: ActivatePlateClientProps) {
  const router = useRouter()

  const hasExistingBusinesses = existingBusinesses.length > 0
  const [bizMode, setBizMode] = useState<'existing' | 'new'>(hasExistingBusinesses ? 'existing' : 'new')
  const [selectedBizId, setSelectedBizId] = useState<string>(existingBusinesses[0]?.id || '')

  // Pestaña de autenticación cuando el usuario no ha iniciado sesión
  const [authTab, setAuthTab] = useState<'login' | 'register'>(
    initialAuthMode === 'register' ? 'register' : 'login'
  )

  // Estado de inicio de sesión rápido (inline)
  const [inlineLoggingIn, setInlineLoggingIn] = useState(false)
  const [inlineLoginError, setInlineLoginError] = useState<string | null>(null)

  const [noGooglePlace, setNoGooglePlace] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null)
  const [reviewFilter, setReviewFilter] = useState<boolean>(
    existingBusinesses[0]?.reviewFilterEnabled ?? true
  )
  const [submitting, setSubmitting] = useState(false)

  // Campos manuales para cuando aún no está en Google Maps
  const [manualBusinessName, setManualBusinessName] = useState('')
  const [manualCategory, setManualCategory] = useState('Comercio / Tienda')
  const [manualAddress, setManualAddress] = useState('')
  const [manualPhone, setManualPhone] = useState('')

  // Campos de cuenta / usuario
  const [fullName, setFullName] = useState(userProfile?.fullName || '')
  const [personalPhone, setPersonalPhone] = useState(userProfile?.personalPhone || '')
  const [email, setEmail] = useState(initialEmail || '')
  const [password, setPassword] = useState('')
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)

  const activeExistingBiz = existingBusinesses.find(b => b.id === selectedBizId) || existingBusinesses[0]

  // Función para iniciar sesión inline sin recargar ni perder el contexto
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setInlineLoginError('Por favor ingresa tu correo y contraseña.')
      return
    }

    setInlineLoggingIn(true)
    setInlineLoginError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (error) {
        setInlineLoginError(
          error.message.includes('Invalid login credentials')
            ? 'Correo o contraseña incorrectos. Por favor verifica tus credenciales.'
            : error.message
        )
        setInlineLoggingIn(false)
      } else if (data?.user) {
        // Sesión establecida en cookies del navegador!
        // Refrescamos para que el Server Component detecte al usuario y sus negocios
        router.refresh()
      }
    } catch (err: any) {
      setInlineLoginError(err.message || 'Error de conexión al iniciar sesión')
      setInlineLoggingIn(false)
    }
  }

  // Validación del formulario
  let isFormValid = false
  if (currentUser) {
    if (bizMode === 'existing' && activeExistingBiz) {
      isFormValid = true
    } else {
      isFormValid = noGooglePlace
        ? manualBusinessName.trim().length > 0 && manualAddress.trim().length > 0
        : Boolean(selectedPlace)
    }
  } else {
    if (authTab === 'login') {
      isFormValid = email.trim().length > 0 && password.length >= 6 && (
        bizMode === 'existing' || (noGooglePlace ? (manualBusinessName.trim().length > 0 && manualAddress.trim().length > 0) : Boolean(selectedPlace))
      )
    } else {
      isFormValid = fullName.trim().length > 0 && 
        personalPhone.trim().length > 0 && 
        email.trim().length > 0 && 
        password.length >= 6 && 
        acceptedPrivacy && (
          noGooglePlace 
            ? manualBusinessName.trim().length > 0 && manualAddress.trim().length > 0 
            : Boolean(selectedPlace)
        )
    }
  }

  return (
    <div className="max-w-md w-full bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
      {/* Cabecera */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-300 text-black rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          <Star className="w-7 h-7 fill-black" />
        </div>
        <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Placa NFC de Reseñas Google</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Activa tu Placa Inteligente
        </h1>
        <p className="text-xs text-gray-400">
          Placa ID: <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">{tagId}</span>
        </p>
      </div>

      {/* Errores del servidor */}
      {serverError && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{serverError}</span>
        </div>
      )}

      {/* DETECCIÓN DE CUENTA */}
      {currentUser ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Cuenta detectada</span>
            </div>
            <p className="text-white font-bold text-xs truncate max-w-[220px]">{currentUser.email}</p>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/30">
            Sesión Activa
          </span>
        </div>
      ) : (
        /* SI NO TIENE SESIÓN INICIADA: OFRECER OPCIÓN DE INICIAR SESIÓN O CREAR CUENTA */
        <div className="space-y-3">
          <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-2xl gap-1 text-xs font-bold text-center">
            <button
              type="button"
              onClick={() => {
                setAuthTab('login')
                setInlineLoginError(null)
              }}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authTab === 'login' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Ya tengo cuenta</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('register')
                setInlineLoginError(null)
              }}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authTab === 'register' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Soy nuevo</span>
            </button>
          </div>

          {authTab === 'login' && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Inicia sesión para vincular a tu cuenta
                </p>
                <p className="text-[11px] text-gray-400 leading-snug">
                  Si ya tienes una placa previa o cuenta en OmniTag, ingresa tu clave para detectar tu negocio y vincular esta placa directamente sin volver a registrarte.
                </p>
              </div>

              {inlineLoginError && (
                <div className="p-2.5 bg-red-500/15 border border-red-500/30 rounded-xl text-[11px] text-red-300 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{inlineLoginError}</span>
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu contraseña"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInlineLogin}
                  disabled={inlineLoggingIn || !email || !password}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition border border-white/15 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {inlineLoggingIn ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Detectando tu cuenta y negocio...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5 text-amber-400" />
                      <span>Detectar mi Cuenta y Mis Negocios</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SELECCIÓN DE NEGOCIO (SI EL USUARIO TIENE NEGOCIOS REGISTRADOS) */}
      {currentUser && hasExistingBusinesses && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
              ¿A qué negocio deseas vincular esta placa?
            </label>
          </div>

          <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-2xl gap-1 text-xs font-bold text-center">
            <button
              type="button"
              onClick={() => setBizMode('existing')}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                bizMode === 'existing' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Mismo Negocio</span>
            </button>
            <button
              type="button"
              onClick={() => setBizMode('new')}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                bizMode === 'new' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Otro Negocio</span>
            </button>
          </div>

          {/* TARJETA DE NEGOCIO EXISTENTE DETECTADO */}
          {bizMode === 'existing' && activeExistingBiz && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Negocio Detectado en tu Cuenta
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  1-Clic Vinculación
                </span>
              </div>

              {existingBusinesses.length > 1 && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Selecciona la sucursal o negocio:</label>
                  <select
                    value={selectedBizId}
                    onChange={(e) => {
                      setSelectedBizId(e.target.value)
                      const target = existingBusinesses.find(b => b.id === e.target.value)
                      if (target) setReviewFilter(target.reviewFilterEnabled)
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {existingBusinesses.map(b => (
                      <option key={b.id} value={b.id} className="bg-gray-900 text-white">
                        {b.businessName} {b.businessAddress ? `(${b.businessAddress})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-extrabold text-white text-sm">{activeExistingBiz.businessName}</span>
                </div>
                {activeExistingBiz.businessAddress && (
                  <div className="flex items-start gap-2 text-[11px] text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                    <span>{activeExistingBiz.businessAddress}</span>
                  </div>
                )}
                {activeExistingBiz.businessPhone && (
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span>{activeExistingBiz.businessPhone}</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Esta nueva placa se configurará con las mismas reseñas oficiales de <b>{activeExistingBiz.businessName}</b> y sumará 365 días de garantía.
              </p>
            </div>
          )}
        </div>
      )}

      {/* FORMULARIO PRINCIPAL */}
      <form action={activatePlateAndRegister} onSubmit={() => setSubmitting(true)} className="space-y-5">
        <input type="hidden" name="tag_id" value={tagId} />
        <input 
          type="hidden" 
          name="auth_mode" 
          value={currentUser ? 'existing_biz' : authTab} 
        />

        {/* Si usa negocio existente detectado */}
        {currentUser && hasExistingBusinesses && bizMode === 'existing' && activeExistingBiz && (
          <>
            <input type="hidden" name="use_existing_business" value="true" />
            <input type="hidden" name="existing_device_id" value={activeExistingBiz.id} />
            <input type="hidden" name="business_name" value={activeExistingBiz.businessName} />
            <input type="hidden" name="place_id" value={activeExistingBiz.placeId || ''} />
            <input type="hidden" name="direct_review_url" value={activeExistingBiz.directReviewUrl || ''} />
            <input type="hidden" name="business_address" value={activeExistingBiz.businessAddress || ''} />
            <input type="hidden" name="business_phone" value={activeExistingBiz.businessPhone || ''} />
            <input type="hidden" name="google_types" value={JSON.stringify(activeExistingBiz.googleTypes || [])} />
            <input type="hidden" name="no_google_place" value={activeExistingBiz.placeId ? 'false' : 'true'} />
          </>
        )}

        {/* SI CONFIGURA UN NEGOCIO NUEVO O NO TIENE NEGOCIOS DETECTADOS AÚN */}
        {(!currentUser || !hasExistingBusinesses || bizMode === 'new') && (
          <div className="space-y-4">
            {/* Selector de modo: Con Google Maps o Sin Google Maps */}
            <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-2xl gap-1 text-xs font-bold text-center">
              <button
                type="button"
                onClick={() => setNoGooglePlace(false)}
                className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  !noGooglePlace ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Ya estoy en Google</span>
              </button>
              <button
                type="button"
                onClick={() => setNoGooglePlace(true)}
                className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  noGooglePlace ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Aún no en Google</span>
              </button>
            </div>

            {/* MODO 1: Búsqueda oficial en Google Maps */}
            {!noGooglePlace ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Busca tu Negocio en Google Maps *
                </label>
                <GooglePlaceSearchInput
                  onPlaceSelected={(place) => {
                    setSelectedPlace(place)
                  }}
                  initialPlace={selectedPlace}
                />
                <input type="hidden" name="no_google_place" value="false" />
                <input type="hidden" name="place_id" value={selectedPlace?.place_id || ''} />
                <input type="hidden" name="business_name" value={selectedPlace?.name || ''} />
                <input type="hidden" name="business_address" value={selectedPlace?.formatted_address || ''} />
                <input type="hidden" name="business_phone" value={selectedPlace?.formatted_phone_number || ''} />
                <input type="hidden" name="direct_review_url" value={selectedPlace?.direct_review_url || ''} />
                <input type="hidden" name="google_types" value={JSON.stringify(selectedPlace?.types || [])} />
              </div>
            ) : (
              /* MODO 2: Aún no tiene perfil en Google Maps */
              <div className="space-y-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                  <Hourglass className="w-4 h-4" />
                  <span>Alta comercial en proceso</span>
                </div>

                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Ingresa los datos de tu negocio para registrar tu placa con <b>365 días de garantía</b>. 
                  <strong className="text-white block mt-1">⚠️ Recuerda no colocar la placa en tu mostrador todavía hasta que Google verifique tu local.</strong>
                </p>

                <input type="hidden" name="no_google_place" value="true" />

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Nombre Comercial del Negocio *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      name="manual_business_name"
                      required={noGooglePlace}
                      value={manualBusinessName}
                      onChange={(e) => setManualBusinessName(e.target.value)}
                      placeholder="Ej. Tacos El Paisa"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Categoría / Giro del Negocio *</label>
                  <div className="relative">
                    <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <select
                      name="manual_category"
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value="Restaurante / Cafetería" className="bg-gray-900 text-white">Restaurante / Cafetería</option>
                      <option value="Salón de Belleza / Barbería" className="bg-gray-900 text-white">Salón de Belleza / Barbería / Spa</option>
                      <option value="Clínica / Consultorio Dental" className="bg-gray-900 text-white">Clínica / Consultorio Dental</option>
                      <option value="Tienda / Boutique / Comercio" className="bg-gray-900 text-white">Tienda / Boutique / Comercio</option>
                      <option value="Taller Mecánico / Car Wash" className="bg-gray-900 text-white">Taller Mecánico / Car Wash</option>
                      <option value="Gimnasio / Deportes" className="bg-gray-900 text-white">Gimnasio / Fitness</option>
                      <option value="Servicios Profesionales" className="bg-gray-900 text-white">Servicios Profesionales</option>
                      <option value="Otro Negocio Local" className="bg-gray-900 text-white">Otro Negocio Local</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Dirección del Establecimiento *</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      name="manual_business_address"
                      required={noGooglePlace}
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      placeholder="Ej. Col. Palmira, Ave. República de Chile #1402"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">Teléfono de Atención al Cliente</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="tel"
                      name="manual_business_phone"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="Ej. +504 9876-5432"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Escudo Anti-Quejas */}
        <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="review_filter"
              checked={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-400 mt-0.5 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Activar Escudo Inteligente Anti-Quejas
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Las calificaciones de <b>4 y 5 estrellas</b> van a Google Maps. Las de <b>1 a 3 estrellas</b> van a tu buzón privado para resolver el problema antes de que dañe tu reputación.
              </p>
            </div>
          </label>
        </div>

        {/* CAMPOS DE CUENTA CUANDO NO HAY SESIÓN INICIADA */}
        {!currentUser && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            {authTab === 'login' ? (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Tus Credenciales de Acceso
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Correo Electrónico *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Contraseña *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu contraseña registrada"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Tus Datos de Acceso al Panel de Control
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Nombre Completo *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      name="full_name"
                      required={authTab === 'register'}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">
                    WhatsApp Personal del Administrador *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input
                      type="tel"
                      name="personal_phone"
                      required={authTab === 'register'}
                      value={personalPhone}
                      onChange={(e) => setPersonalPhone(e.target.value)}
                      placeholder="Ej. +504 9999-9999"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-emerald-400 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    Para avisarte de quejas privadas o soporte directo de tu suscripción.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Correo Electrónico *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Crea tu Contraseña *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Aceptación de Políticas de Privacidad */}
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-300 select-none">
                    <input
                      type="checkbox"
                      name="privacy_accepted"
                      value="true"
                      required={authTab === 'register'}
                      checked={acceptedPrivacy}
                      onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-white/20 bg-black/40 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
                    />
                    <span className="leading-snug text-[11px]">
                      Acepto los Términos del Servicio y la{' '}
                      <a
                        href="/privacidad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-amber-400 underline hover:text-amber-300"
                      >
                        Política de Privacidad
                      </a>{' '}
                      de OmniTag.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón de Activación */}
        <button
          type="submit"
          disabled={!isFormValid || submitting}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-extrabold text-sm hover:brightness-110 transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Procesando activación...</span>
            </>
          ) : (
            <>
              <span>
                {currentUser && hasExistingBusinesses && bizMode === 'existing' && activeExistingBiz
                  ? `Vincular Placa a "${activeExistingBiz.businessName}"`
                  : noGooglePlace 
                  ? 'Registrar Placa & Tramitar Alta en Google' 
                  : 'Activar Placa & 1 Año de Servicio'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
