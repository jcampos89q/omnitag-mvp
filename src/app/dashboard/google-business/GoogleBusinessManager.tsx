'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Search, 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw, 
  Flame, 
  ChevronRight, 
  HelpCircle, 
  Video, 
  FileText, 
  Share2, 
  Radio, 
  Zap,
  Award
} from 'lucide-react'
import GooglePlaceSearchInput, { PlaceDetails } from '@/components/GooglePlaceSearchInput'

interface GoogleBusinessManagerProps {
  isPro: boolean
  businessName: string
  preloadedPlaceId: string | null
  userDevices: any[]
}

interface PlaceFullData extends PlaceDetails {
  google_maps_url?: string
  rating?: number
  user_ratings_total?: number
  opening_hours?: {
    open_now?: boolean
    weekday_text?: string[]
  } | null
  photos_count?: number
  photos?: any[]
  reviews?: {
    author_name: string
    rating: number
    text: string
    relative_time_description: string
    time: number
    profile_photo_url?: string
  }[]
  business_status?: string
}

export default function GoogleBusinessManager({
  isPro,
  businessName,
  preloadedPlaceId,
  userDevices
}: GoogleBusinessManagerProps) {
  const [activeTab, setActiveTab] = useState<'audit' | 'reviews' | 'posts' | 'verification'>('audit')
  const [selectedPlace, setSelectedPlace] = useState<PlaceFullData | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // Estados de IA para respuestas a reseñas
  const [selectedReviewIndex, setSelectedReviewIndex] = useState<number | null>(null)
  const [aiTone, setAiTone] = useState<'warm' | 'professional' | 'promotional'>('warm')
  const [generatedResponse, setGeneratedResponse] = useState<string>('')
  const [customReviewInput, setCustomReviewInput] = useState<string>('')

  // Estados para generador de publicaciones (Google Posts)
  const [postType, setPostType] = useState<'promo' | 'weekly_tip' | 'new_service'>('promo')
  const [postHighlight, setPostHighlight] = useState<string>('Descuento especial de temporada')
  const [generatedPost, setGeneratedPost] = useState<string>('')

  // Cargar perfil predeterminado si existe Place ID
  useEffect(() => {
    if (preloadedPlaceId && !selectedPlace) {
      fetchPlaceDetails(preloadedPlaceId)
    }
  }, [preloadedPlaceId])

  const fetchPlaceDetails = async (placeId: string) => {
    setIsLoadingDetails(true)
    try {
      const res = await fetch(`/api/places/details?place_id=${encodeURIComponent(placeId)}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedPlace(data)
      }
    } catch (err) {
      console.error('Error fetching details:', err)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handlePlaceSelect = (place: PlaceDetails) => {
    fetchPlaceDetails(place.place_id)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(id)
    setTimeout(() => setCopiedText(null), 2500)
  }

  // ==========================================
  // CÁLCULO DE AUDITORÍA Y SALUD DEL PERFIL
  // ==========================================
  const calculateAuditScore = (place: PlaceFullData) => {
    let score = 0
    const checks: { title: string; desc: string; passed: boolean; impact: 'alta' | 'media' | 'baja'; points: number }[] = []

    // 1. Estado operativo
    const isOper = place.business_status === 'OPERATIONAL' || !place.business_status
    score += isOper ? 15 : 0
    checks.push({
      title: 'Estado de Negocio Operativo',
      desc: isOper ? 'El perfil figura abierto y activo en Google Maps.' : 'El negocio figura temporalmente cerrado.',
      passed: isOper,
      impact: 'alta',
      points: 15
    })

    // 2. Teléfono
    const hasPhone = Boolean(place.formatted_phone_number || place.international_phone_number)
    score += hasPhone ? 15 : 0
    checks.push({
      title: 'Teléfono de Contacto Visible',
      desc: hasPhone ? `Configurado (${place.formatted_phone_number}). Los clientes pueden llamarte en 1 toque.` : 'Falta teléfono directo para llamadas desde Google.',
      passed: hasPhone,
      impact: 'alta',
      points: 15
    })

    // 3. Sitio web / vCard vinculada
    const hasWeb = Boolean(place.website)
    score += hasWeb ? 15 : 0
    checks.push({
      title: 'Sitio Web o Catálogo Digital',
      desc: hasWeb ? 'Enlace web conectado correctamente.' : 'No tienes sitio web enlazado. Puedes enlazar tu vCard de OmniTag.',
      passed: hasWeb,
      impact: 'alta',
      points: 15
    })

    // 4. Horarios semanales
    const hasHours = Boolean(place.opening_hours?.weekday_text && place.opening_hours.weekday_text.length > 0)
    score += hasHours ? 15 : 0
    checks.push({
      title: 'Horarios de Apertura Completos',
      desc: hasHours ? 'Horario de Lunes a Domingo visible para clientes.' : 'Faltan horarios. Google Maps oculta locales cuando no sabe si están abiertos.',
      passed: hasHours,
      impact: 'alta',
      points: 15
    })

    // 5. Calificación promedio (ideal >= 4.4)
    const rating = place.rating || 0
    const isGoodRating = rating >= 4.4
    score += isGoodRating ? 15 : rating >= 4.0 ? 10 : 5
    checks.push({
      title: 'Reputación de 5 Estrellas (Rating)',
      desc: rating > 0 ? `Calificación de ${rating.toFixed(1)} / 5.0 estrellas.` : 'Aún no cuentas con calificación calculada.',
      passed: isGoodRating,
      impact: 'alta',
      points: 15
    })

    // 6. Volumen de reseñas (mínimo 15 para credibilidad)
    const reviewCount = place.user_ratings_total || 0
    const hasGoodReviews = reviewCount >= 15
    score += reviewCount >= 30 ? 15 : reviewCount >= 15 ? 10 : reviewCount >= 5 ? 5 : 0
    checks.push({
      title: 'Volumen de Reseñas de Clientes',
      desc: `${reviewCount} reseñas registradas. Lo ideal para dominar tu zona en búsquedas son 25+ reseñas.`,
      passed: hasGoodReviews,
      impact: 'media',
      points: 15
    })

    // 7. Fotografías (mínimo 4)
    const photosCount = place.photos_count || place.photos?.length || 0
    const hasPhotos = photosCount >= 4
    score += photosCount >= 6 ? 10 : photosCount >= 2 ? 5 : 0
    checks.push({
      title: 'Galería de Fotografías de Alta Calidad',
      desc: hasPhotos ? 'Cuentas con fotos de fachada e instalaciones.' : 'Tienes pocas fotos. Los perfiles con más de 10 fotos reciben 42% más solicitudes de cómo llegar.',
      passed: hasPhotos,
      impact: 'media',
      points: 10
    })

    return {
      score: Math.min(score, 100),
      checks
    }
  }

  // ==========================================
  // GENERADOR DE RESPUESTAS CON IA
  // ==========================================
  const handleGenerateAiResponse = (reviewText: string, rating: number, authorName: string) => {
    const biz = selectedPlace?.name || businessName || 'nuestro establecimiento'
    const cleanAuthor = authorName ? authorName.split(' ')[0] : 'estimado cliente'

    if (rating >= 4) {
      if (aiTone === 'warm') {
        setGeneratedResponse(
          `¡Hola ${cleanAuthor}! Muchas gracias por tu excelente reseña de 5 estrellas. En ${biz} nos apasiona brindar la mejor experiencia y atención de calidad. ¡Esperamos tener el placer de atenderte nuevamente muy pronto!`
        )
      } else if (aiTone === 'promotional') {
        setGeneratedResponse(
          `¡Muchísimas gracias ${cleanAuthor} por visitarnos y recomendarnos! En ${biz} nos alegra que hayas disfrutado de tu visita. Recuerda que ahora puedes consultar nuestras promociones, certificados de regalo y agendar tus próximas citas directamente en línea. ¡Te esperamos pronto!`
        )
      } else {
        setGeneratedResponse(
          `Estimado/a ${cleanAuthor}, le agradecemos sinceramente su valoración y preferencia. En ${biz} mantenemos el más alto estándar de servicio para nuestros clientes. Quedamos a su entera disposición.`
        )
      }
    } else {
      if (aiTone === 'professional') {
        setGeneratedResponse(
          `Hola ${cleanAuthor}, lamentamos profundamente que tu experiencia en ${biz} no haya cumplido con tus expectativas. Nos tomamos muy en serio la calidad de nuestro servicio. Nos gustaría conversar contigo personalmente para escuchar tus comentarios y compensar el inconveniente. Por favor contáctanos vía WhatsApp para atenderte de forma prioritaria.`
        )
      } else {
        setGeneratedResponse(
          `Estimado/a ${cleanAuthor}, lamentamos el inconveniente ocurrido. En ${biz} nuestro compromiso es la satisfacción de cada cliente. Te invitamos a escribirnos directamente para poder revisar lo sucedido y ofrecerte una solución inmediata.`
        )
      }
    }
  }

  // ==========================================
  // GENERADOR DE PUBLICACIONES CON IA
  // ==========================================
  const handleGenerateGooglePost = () => {
    const biz = selectedPlace?.name || businessName || 'nuestro negocio'
    if (postType === 'promo') {
      setGeneratedPost(
        `✨ ¡Promoción Especial en ${biz}! ✨\n\n${postHighlight}.\n\nVen y disfruta de una experiencia única con atención de primera calidad. ¡Aprovecha hoy mismo!\n\n📍 Visítanos o contáctanos por WhatsApp para agendar tu cita o consultar el catálogo digital.`
      )
    } else if (postType === 'weekly_tip') {
      setGeneratedPost(
        `💡 Consejo de la Semana por ${biz} 💡\n\n¿Sabías que cuidar de los pequeños detalles marca toda la diferencia? En ${biz} estamos comprometidos con tu bienestar y satisfacción.\n\n👉 Descubre todos nuestros servicios disponibles esta semana. ¡Te esperamos!`
      )
    } else {
      setGeneratedPost(
        `🎉 ¡Nuevo Servicio Disponible en ${biz}! 🎉\n\nAmpliamos nuestras opciones para ofrecerte lo mejor: ${postHighlight}.\n\nConsulta detalles, precios y adquiere también tus Tarjetas de Regalo oficiales para consentir a alguien especial. ¡Escríbenos ahora!`
      )
    }
  }

  const auditData = selectedPlace ? calculateAuditScore(selectedPlace) : null

  return (
    <div className="space-y-6">
      {/* 1. CABECERA PRINCIPAL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 flex items-center gap-1 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Maps & SEO Local Studio</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              Oficial
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Piloto Automático para Google Business
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Audita la salud de tu perfil en Google Maps, genera respuestas con IA para tus reseñas, programa publicaciones y domina las búsquedas de tu ciudad.
          </p>
        </div>

        {selectedPlace?.direct_review_url && (
          <a
            href={selectedPlace.direct_review_url}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Star className="w-4 h-4 fill-slate-950" />
            <span>Enlace Directo para Reseñas</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* 2. SELECTOR / BUSCADOR DEL NEGOCIO */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-gray-900 text-base">
              Selecciona tu Perfil de Google Maps
            </h3>
            <p className="text-xs text-gray-500">
              Busca por el nombre de tu empresa en tu ciudad para escanear sus métricas en vivo.
            </p>
          </div>
          {selectedPlace && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Conectado con Google Maps</span>
            </span>
          )}
        </div>

        <GooglePlaceSearchInput
          onPlaceSelected={handlePlaceSelect}
          initialPlace={selectedPlace}
        />

        {/* Resumen del local seleccionado */}
        {selectedPlace && (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-base flex items-center gap-2">
                  <span>{selectedPlace.name}</span>
                  {selectedPlace.rating && (
                    <span className="inline-flex items-center gap-1 text-xs font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {selectedPlace.rating.toFixed(1)} ({selectedPlace.user_ratings_total || 0})
                    </span>
                  )}
                </h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <span className="truncate max-w-md">{selectedPlace.formatted_address}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {selectedPlace.google_maps_url && (
                <a
                  href={selectedPlace.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                  <span>Ver en Google Maps</span>
                </a>
              )}

              <button
                onClick={() => fetchPlaceDetails(selectedPlace.place_id)}
                disabled={isLoadingDetails}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
                title="Actualizar datos desde Google"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingDetails ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. TABS DE NAVEGACIÓN */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Auditoría de Salud (Score)</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'reviews'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Gestor de Reseñas & IA</span>
          {selectedPlace?.reviews && selectedPlace.reviews.length > 0 && (
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {selectedPlace.reviews.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'posts'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Publicaciones con IA</span>
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'verification'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Guía de Verificación LATAM</span>
        </button>
      </div>

      {/* 4. CONTENIDO SEGÚN TAB ACTIVO */}

      {/* TAB 1: AUDITORÍA DE SALUD EN 1-CLIC */}
      {activeTab === 'audit' && (
        selectedPlace && auditData ? (
          <div className="space-y-6">
            {/* Medidor de Calificación Global */}
            <div className="bg-linear-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
              <div className="space-y-2 text-center md:text-left z-10">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-blue-400 block">
                  DIAGNÓSTICO AUTOMATIZADO DE ALGORITMO
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Puntaje de Perfil: {auditData.score} / 100
                </h3>
                <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                  {auditData.score >= 85
                    ? '¡Tu perfil está altamente optimizado! Tiene una fuerte presencia para posicionarse en los primeros 3 lugares de Google Maps.'
                    : auditData.score >= 70
                    ? 'Tu perfil tiene una buena base, pero existen descuidos que te están haciendo perder clientes frente a competidores locales.'
                    : 'Tu perfil tiene deficiencias críticas. Google Maps está enviando a tus clientes potenciales a otros negocios con perfiles más completos.'}
                </p>
              </div>

              {/* Círculo Gráfico de Puntuación */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-slate-800"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={
                      auditData.score >= 85 
                        ? 'text-emerald-500' 
                        : auditData.score >= 70 
                        ? 'text-amber-500' 
                        : 'text-rose-500'
                    }
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - auditData.score / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-white">{auditData.score}%</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Salud SEO</span>
                </div>
              </div>
            </div>

            {/* Desglose de Factores Auditados */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-5">
              <div>
                <h4 className="font-black text-gray-900 text-lg">Checklist de Factores de Posicionamiento</h4>
                <p className="text-xs text-gray-500">Google Maps utiliza estos factores clave para decidir a qué local recomendar primero.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auditData.checks.map((c, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                      c.passed 
                        ? 'bg-emerald-50/50 border-emerald-200' 
                        : 'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    <div className="mt-0.5">
                      {c.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      )}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-gray-900">{c.title}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          c.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.passed ? `+${c.points} pts` : 'Atención'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recomendación OmniTag */}
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-black text-blue-950 text-xs">Acelera tus Reseñas con Placas NFC OmniTag</h5>
                    <p className="text-[11px] text-blue-800">
                      Multiplica las 5 estrellas en tu mostrador con una placa Tap-to-Rate que filtra quejas privadas.
                    </p>
                  </div>
                </div>

                <a
                  href="/dashboard/devices"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition shrink-0"
                >
                  Configurar Placas NFC →
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Busca tu negocio en el buscador superior</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                Escribe el nombre de tu empresa para que el sistema analice tu perfil público de Google Maps y te entregue tu reporte de salud en un clic.
              </p>
            </div>
          </div>
        )
      )}

      {/* TAB 2: GESTOR DE RESEÑAS & IA */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna Izquierda: Reseñas en Vivo */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-gray-900 text-base">Últimas Reseñas de Google Maps</h4>
                <p className="text-xs text-gray-500">Haz clic en "Responder con IA" para redactar una respuesta optimizada.</p>
              </div>
              {selectedPlace?.reviews && (
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                  {selectedPlace.reviews.length} mostradas
                </span>
              )}
            </div>

            {selectedPlace?.reviews && selectedPlace.reviews.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {selectedPlace.reviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      selectedReviewIndex === idx 
                        ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500' 
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {rev.profile_photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={rev.profile_photo_url} alt={rev.author_name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {rev.author_name[0] || 'C'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-xs text-gray-900">{rev.author_name}</p>
                          <span className="text-[10px] text-gray-400">{rev.relative_time_description}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 italic leading-relaxed line-clamp-3">
                      "{rev.text || 'Sin comentario escrito.'}"
                    </p>

                    <div className="pt-3 mt-2 border-t border-gray-200/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400">
                        {rev.rating >= 4 ? '🌟 Reseña Positiva' : '⚠️ Crítica / Observación'}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedReviewIndex(idx)
                          handleGenerateAiResponse(rev.text, rev.rating, rev.author_name)
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generar Respuesta IA</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs font-bold text-gray-700">No se encontraron reseñas directas en este momento</p>
                <p className="text-[11px] text-gray-400">Puedes pegar una reseña manualmente a la derecha para generar la respuesta con IA.</p>
              </div>
            )}
          </div>

          {/* Columna Derecha: Generador y Editor con IA */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-base">Asistente de Respuesta Inteligente</h4>
                  <p className="text-xs text-gray-500">Personaliza el tono y genera respuestas con palabras clave locales.</p>
                </div>
              </div>

              {/* Selector de Tono */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-1.5">
                  Tono de la Respuesta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAiTone('warm')
                      if (selectedReviewIndex !== null && selectedPlace?.reviews?.[selectedReviewIndex]) {
                        const r = selectedPlace.reviews[selectedReviewIndex]
                        handleGenerateAiResponse(r.text, r.rating, r.author_name)
                      }
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      aiTone === 'warm'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🌟 Cálido
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAiTone('professional')
                      if (selectedReviewIndex !== null && selectedPlace?.reviews?.[selectedReviewIndex]) {
                        const r = selectedPlace.reviews[selectedReviewIndex]
                        handleGenerateAiResponse(r.text, r.rating, r.author_name)
                      }
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      aiTone === 'professional'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    👔 Formal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAiTone('promotional')
                      if (selectedReviewIndex !== null && selectedPlace?.reviews?.[selectedReviewIndex]) {
                        const r = selectedPlace.reviews[selectedReviewIndex]
                        handleGenerateAiResponse(r.text, r.rating, r.author_name)
                      }
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      aiTone === 'promotional'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🚀 Promocional
                  </button>
                </div>
              </div>

              {/* Área de Respuesta Generada */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-1.5">
                  Respuesta Sugerida por IA
                </label>
                <textarea
                  rows={6}
                  value={generatedResponse}
                  onChange={(e) => setGeneratedResponse(e.target.value)}
                  placeholder="Selecciona una reseña a la izquierda para generar la respuesta automáticamente..."
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 font-medium focus:bg-white focus:border-blue-500 transition leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => copyToClipboard(generatedResponse, 'ai_response')}
                disabled={!generatedResponse}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {copiedText === 'ai_response' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText === 'ai_response' ? '¡Copiado al portapapeles!' : 'Copiar Respuesta para Google Maps'}</span>
              </button>

              {selectedPlace?.google_maps_url && (
                <a
                  href={selectedPlace.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition flex items-center justify-center gap-2 text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir mi Perfil en Google Maps para Pegar</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PUBLICACIONES CON IA (GOOGLE POSTS) */}
      {activeTab === 'posts' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-lg">Generador de Publicaciones Semanales (Google Updates)</h4>
              <p className="text-xs text-gray-500">
                Google Maps premia con mejor posicionamiento local a los negocios que publican al menos 1 novedad cada semana.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-2">
                  Tipo de Publicación
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPostType('promo')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      postType === 'promo'
                        ? 'border-pink-500 bg-pink-50 text-pink-900 ring-2 ring-pink-500'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-base block mb-0.5">🏷️</span>
                    <span className="text-xs font-black">Promoción</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPostType('weekly_tip')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      postType === 'weekly_tip'
                        ? 'border-pink-500 bg-pink-50 text-pink-900 ring-2 ring-pink-500'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-base block mb-0.5">💡</span>
                    <span className="text-xs font-black">Tip / Consejo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPostType('new_service')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      postType === 'new_service'
                        ? 'border-pink-500 bg-pink-50 text-pink-900 ring-2 ring-pink-500'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-base block mb-0.5">✨</span>
                    <span className="text-xs font-black">Novedad</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Tema o Beneficio a Destacar
                </label>
                <input
                  type="text"
                  value={postHighlight}
                  onChange={(e) => setPostHighlight(e.target.value)}
                  placeholder="Ej. 20% en masajes los miércoles, nuevas gift cards de regalo..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-medium focus:bg-white"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateGooglePost}
                className="w-full py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generar Publicación con IA</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Texto Formateado para Google Maps
                </label>
                <textarea
                  rows={8}
                  value={generatedPost}
                  onChange={(e) => setGeneratedPost(e.target.value)}
                  placeholder="Presiona el botón de la izquierda para redactar tu publicación con IA..."
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 font-medium focus:bg-white leading-relaxed resize-none"
                />
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(generatedPost, 'ai_post')}
                disabled={!generatedPost}
                className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black disabled:opacity-40 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {copiedText === 'ai_post' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText === 'ai_post' ? '¡Copiado!' : 'Copiar Texto del Post'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GUÍA DE VERIFICACIÓN LOCAL (HONDURAS & LATAM) */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900">
                Guía Maestra de Verificación en Honduras & Latinoamérica
              </h4>
              <p className="text-xs text-gray-500">
                Aprende cómo aprobar la verificación de Google Maps a la primera y evitar suspensiones.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Paso 1: El Video */}
            <div className="p-5 rounded-3xl bg-gray-50 border border-gray-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                1
              </div>
              <h5 className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-blue-600" />
                <span>Video Continuo (30-60 seg)</span>
              </h5>
              <p className="text-xs text-gray-600 leading-relaxed">
                El 90% de las verificaciones hoy se hacen por video en tu celular. **Regla de oro: No cortes el video.**
              </p>
              <ul className="text-[11px] text-gray-600 space-y-1.5 list-disc pl-4">
                <li>Graba la placa o letrero de la calle y edificios vecinos.</li>
                <li>Muestra la fachada exterior con el rótulo comercial de tu empresa.</li>
                <li>Graba tu mano abriendo la puerta principal con tu llave.</li>
                <li>Muestra tu mostrador, área de clientes y terminal de cobro (POS/caja).</li>
              </ul>
            </div>

            {/* Paso 2: Documentación */}
            <div className="p-5 rounded-3xl bg-gray-50 border border-gray-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                2
              </div>
              <h5 className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Documentos Oficiales</span>
              </h5>
              <p className="text-xs text-gray-600 leading-relaxed">
                Si Google rechaza el video o pide apelación, ten a mano estos comprobantes con el nombre exacto:
              </p>
              <ul className="text-[11px] text-gray-600 space-y-1.5 list-disc pl-4">
                <li>Permiso de Operación Municipal vigente.</li>
                <li>Factura reciente de energía eléctrica (ENEE) o agua a nombre del negocio.</li>
                <li>Contrato de arrendamiento del local comercial.</li>
                <li>Constancia de RTN de la empresa.</li>
              </ul>
            </div>

            {/* Paso 3: Errores que causan suspensión */}
            <div className="p-5 rounded-3xl bg-gray-50 border border-gray-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-sm">
                3
              </div>
              <h5 className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Evita Suspensiones</span>
              </h5>
              <p className="text-xs text-gray-600 leading-relaxed">
                Errores comunes que hacen que Google suspenda perfiles en Centroamérica:
              </p>
              <ul className="text-[11px] text-gray-600 space-y-1.5 list-disc pl-4">
                <li><strong>No agregues palabras clave al nombre:</strong> Usa solo tu nombre legal/comercial (ej. "D’Liz Salon", no "D’Liz Salon Mejor Spa Masajes Baratos").</li>
                <li>No uses direcciones falsas ni apartados postales.</li>
                <li>Asegúrate de que el letrero físico coincida letra por letra con el perfil.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
