'use client'

import { useState, useEffect, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
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
  QrCode,
  Flame, 
  ChevronRight, 
  HelpCircle, 
  Video, 
  FileText, 
  Share2, 
  Radio, 
  Zap,
  Award,
  ShieldAlert,
  MessageCircle,
  TrendingUp,
  Sliders,
  Store,
  Tag,
  Key,
  Link2,
  Unlink
} from 'lucide-react'
import GooglePlaceSearchInput, { PlaceDetails } from '@/components/GooglePlaceSearchInput'
import { 
  toggleShieldFilter, 
  createShieldLink, 
  resolvePrivateFeedback, 
  generateLocalSeoDescription,
  disconnectGoogleBusiness,
  publishReviewReplyDirect,
  publishGooglePostDirect
} from './actions'

interface DeviceItem {
  id: string
  name: string
  device_type: string
  redirect_url: string
  place_id?: string | null
  business_name?: string | null
  tag_id?: string | null
  review_filter_enabled?: boolean | null
}

interface PrivateFeedbackItem {
  id: string
  device_id: string
  rating: number
  message: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  status: string | null
  resolution_notes: string | null
  created_at: string
  devices?: {
    tag_id?: string
    business_name?: string
  }
}

interface GoogleConnectionItem {
  id: string
  email?: string | null
  business_name?: string | null
  status?: string | null
  created_at?: string
}

interface GoogleBusinessManagerProps {
  isPro: boolean
  businessName: string
  preloadedPlaceId: string | null
  userDevices: DeviceItem[]
  initialFeedbacks?: PrivateFeedbackItem[]
  vcardProfile?: any | null
  userMenus?: any[]
  initialGoogleConnection?: GoogleConnectionItem | null
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
  userDevices,
  initialFeedbacks = [],
  vcardProfile,
  userMenus = [],
  initialGoogleConnection = null
}: GoogleBusinessManagerProps) {
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab') as any
  const isConnectedParam = searchParams.get('connected') === 'success'
  const errorParam = searchParams.get('error')

  const defaultTab = tabFromUrl || (isConnectedParam || errorParam ? 'api' : 'shield')
  const [activeTab, setActiveTab] = useState<'profile' | 'shield' | 'audit' | 'reviews' | 'posts' | 'api' | 'verification'>(defaultTab)
  const [selectedPlace, setSelectedPlace] = useState<PlaceFullData | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Conexión Google Business Profile (OAuth)
  const [googleConnection, setGoogleConnection] = useState<GoogleConnectionItem | null>(initialGoogleConnection)
  const [isDisconnectingGoogle, setIsDisconnectingGoogle] = useState<boolean>(false)
  const [isPublishingDirect, setIsPublishingDirect] = useState<boolean>(false)
  const [directActionResult, setDirectActionResult] = useState<{ success: boolean; message: string } | null>(null)

  // Dispositivos y Escudo Anti-Quejas
  const [devices, setDevices] = useState<DeviceItem[]>(userDevices)
  const [feedbacks, setFeedbacks] = useState<PrivateFeedbackItem[]>(initialFeedbacks)
  const primaryDevice = devices[0] || null

  // Ficha de Negocio & SEO Local
  const [bizForm, setBizForm] = useState({
    name: vcardProfile?.company_name || vcardProfile?.first_name || businessName || '',
    category: 'Salón de Belleza & Spa',
    city: 'Tegucigalpa',
    address: vcardProfile?.business_address || '',
    phone: vcardProfile?.phone || '',
    website: vcardProfile?.website || (vcardProfile?.slug ? `https://www.omnitag.site/v/${vcardProfile.slug}` : ''),
    services: 'Masajes relajantes, faciales hidrofaciales, manicure, pedicure y cortes de cabello.',
    targetKeywords: 'mejor spa en Tegucigalpa, masajes relajantes'
  })
  const [aiBio, setAiBio] = useState<string>(vcardProfile?.bio || '')
  const [isGeneratingBio, setIsGeneratingBio] = useState<boolean>(false)

  // Estados de IA para respuestas a reseñas públicas
  const [selectedReviewIndex, setSelectedReviewIndex] = useState<number | null>(null)
  const [aiTone, setAiTone] = useState<'warm' | 'professional' | 'promotional'>('warm')
  const [generatedResponse, setGeneratedResponse] = useState<string>('')
  
  // Reseña manual / simulada para generar respuesta cuando Google tiene latencia de moderación
  const [reviewTabMode, setReviewTabMode] = useState<'google' | 'manual'>('google')
  const [customReviewText, setCustomReviewText] = useState<string>('')
  const [customReviewRating, setCustomReviewRating] = useState<number>(5)
  const [customReviewAuthor, setCustomReviewAuthor] = useState<string>('')
  const [activeReviewSource, setActiveReviewSource] = useState<'google' | 'manual'>('google')

  // Estados para generador de publicaciones (Google Posts)
  const [postType, setPostType] = useState<'promo' | 'weekly_tip' | 'new_service'>('promo')
  const [postHighlight, setPostHighlight] = useState<string>('20% de descuento en tratamientos los miércoles')
  const [generatedPost, setGeneratedPost] = useState<string>('')

  // Modal para resolver queja privada
  const [resolvingFeedbackId, setResolvingFeedbackId] = useState<string | null>(null)
  const [resolutionNoteInput, setResolutionNoteInput] = useState<string>('')

  // Handlers para Publicación Directa y OAuth
  const handleDisconnectGoogle = () => {
    if (!confirm('¿Estás seguro de que deseas desvincular tu cuenta de Google Business?')) return
    setIsDisconnectingGoogle(true)
    startTransition(async () => {
      try {
        await disconnectGoogleBusiness()
        setGoogleConnection(null)
      } catch (err: any) {
        alert(err.message || 'Error al desconectar')
      } finally {
        setIsDisconnectingGoogle(false)
      }
    })
  }

  const handlePublishReviewReply = async (reviewName: string, replyText: string) => {
    setIsPublishingDirect(true)
    setDirectActionResult(null)
    try {
      const res = await publishReviewReplyDirect(reviewName, replyText)
      if (res.success) {
        setDirectActionResult({ success: true, message: '¡Respuesta publicada oficialmente en Google Maps con éxito!' })
      } else {
        setDirectActionResult({ success: false, message: res.message || 'No se pudo publicar la respuesta.' })
      }
    } catch (err: any) {
      setDirectActionResult({ success: false, message: err.message || 'Error al conectar con Google' })
    } finally {
      setIsPublishingDirect(false)
    }
  }

  const handlePublishGooglePost = async () => {
    if (!generatedPost.trim()) return
    setIsPublishingDirect(true)
    setDirectActionResult(null)
    try {
      const res = await publishGooglePostDirect(generatedPost)
      if (res.success) {
        setDirectActionResult({ success: true, message: '¡Novedad publicada oficialmente en Google Maps con éxito!' })
      } else {
        setDirectActionResult({ success: false, message: res.message || 'No se pudo publicar la novedad.' })
      }
    } catch (err: any) {
      setDirectActionResult({ success: false, message: err.message || 'Error al conectar con Google' })
    } finally {
      setIsPublishingDirect(false)
    }
  }

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
  // ESCUDO ANTI-QUEJAS: ACCIONES
  // ==========================================
  const handleToggleShield = (device: DeviceItem) => {
    const nextState = !device.review_filter_enabled
    startTransition(async () => {
      try {
        await toggleShieldFilter(device.id, nextState)
        setDevices(prev => prev.map(d => d.id === device.id ? { ...d, review_filter_enabled: nextState } : d))
      } catch (err) {
        console.error('Error al alternar escudo:', err)
      }
    })
  }

  const handleCreateShield = () => {
    startTransition(async () => {
      try {
        const placeId = selectedPlace?.place_id || 'ChIJdefault'
        const res = await createShieldLink(placeId, bizForm.name || businessName, selectedPlace?.direct_review_url)
        if (res.success && res.device) {
          setDevices([res.device, ...devices])
        }
      } catch (err) {
        console.error('Error al crear escudo:', err)
      }
    })
  }

  const handleResolveFeedbackSubmit = (feedbackId: string) => {
    startTransition(async () => {
      try {
        await resolvePrivateFeedback(feedbackId, resolutionNoteInput)
        setFeedbacks(prev => prev.map(f => f.id === feedbackId ? { ...f, status: 'resolved', resolution_notes: resolutionNoteInput } : f))
        setResolvingFeedbackId(null)
        setResolutionNoteInput('')
      } catch (err) {
        console.error('Error resolviendo queja:', err)
      }
    })
  }

  // ==========================================
  // GENERAR DESCRIPCIÓN CON SEO LOCAL
  // ==========================================
  const handleGenerateBio = async () => {
    setIsGeneratingBio(true)
    try {
      const res = await generateLocalSeoDescription({
        businessName: bizForm.name || businessName,
        category: bizForm.category,
        city: bizForm.city,
        highlightServices: bizForm.services,
        targetKeywords: bizForm.targetKeywords
      })
      if (res.success) {
        setAiBio(res.description)
      }
    } finally {
      setIsGeneratingBio(false)
    }
  }

  // ==========================================
  // CÁLCULO DE AUDITORÍA Y SALUD DEL PERFIL
  // ==========================================
  const calculateAuditScore = (place: PlaceFullData) => {
    let score = 0
    const checks: { title: string; desc: string; passed: boolean; impact: 'alta' | 'media' | 'baja'; points: number }[] = []

    const isOper = place.business_status === 'OPERATIONAL' || !place.business_status
    score += isOper ? 15 : 0
    checks.push({
      title: 'Estado de Negocio Operativo',
      desc: isOper ? 'El perfil figura abierto y activo en Google Maps.' : 'El negocio figura temporalmente cerrado.',
      passed: isOper,
      impact: 'alta',
      points: 15
    })

    const hasPhone = Boolean(place.formatted_phone_number || place.international_phone_number)
    score += hasPhone ? 15 : 0
    checks.push({
      title: 'Teléfono de Contacto Visible',
      desc: hasPhone ? `Configurado (${place.formatted_phone_number}). Los clientes pueden llamarte en 1 toque.` : 'Falta teléfono directo para llamadas desde Google.',
      passed: hasPhone,
      impact: 'alta',
      points: 15
    })

    const hasWeb = Boolean(place.website)
    score += hasWeb ? 15 : 0
    checks.push({
      title: 'Sitio Web o Catálogo Digital',
      desc: hasWeb ? 'Enlace web conectado correctamente.' : 'No tienes sitio web enlazado. Puedes enlazar tu vCard de OmniTag.',
      passed: hasWeb,
      impact: 'alta',
      points: 15
    })

    const hasHours = Boolean(place.opening_hours?.weekday_text && place.opening_hours.weekday_text.length > 0)
    score += hasHours ? 15 : 0
    checks.push({
      title: 'Horarios de Apertura Completos',
      desc: hasHours ? 'Horario de Lunes a Domingo visible para clientes.' : 'Faltan horarios. Google Maps oculta locales cuando no sabe si están abiertos.',
      passed: hasHours,
      impact: 'alta',
      points: 15
    })

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
  const handleGenerateAiResponse = (
    reviewText: string,
    rating: number,
    authorName: string,
    toneOverride?: 'warm' | 'professional' | 'promotional'
  ) => {
    const tone = toneOverride || aiTone
    const biz = selectedPlace?.name || bizForm.name || businessName || 'nuestro establecimiento'
    const cleanAuthor = authorName ? authorName.split(' ')[0] : 'estimado cliente'

    if (rating >= 4) {
      if (tone === 'warm') {
        setGeneratedResponse(
          `¡Hola ${cleanAuthor}! Muchas gracias por tu excelente reseña de ${rating} estrellas. En ${biz} nos apasiona brindar la mejor experiencia y atención de calidad. ¡Esperamos tener el placer de atenderte nuevamente muy pronto!`
        )
      } else if (tone === 'promotional') {
        setGeneratedResponse(
          `¡Muchísimas gracias ${cleanAuthor} por visitarnos y recomendarnos! En ${biz} nos alegra que hayas disfrutado de tu visita. Recuerda que ahora puedes consultar nuestras promociones, certificados de regalo y agendar tus próximas citas directamente en línea. ¡Te esperamos pronto!`
        )
      } else {
        setGeneratedResponse(
          `Estimado/a ${cleanAuthor}, le agradecemos sinceramente su valoración de ${rating} estrellas y preferencia. En ${biz} mantenemos el más alto estándar de servicio para nuestros clientes. Quedamos a su entera disposición.`
        )
      }
    } else {
      if (tone === 'professional') {
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
    const biz = selectedPlace?.name || bizForm.name || businessName || 'nuestro negocio'
    if (postType === 'promo') {
      const topic = postHighlight.trim() || 'Aprovecha nuestras promociones especiales'
      setGeneratedPost(
        `✨ ¡Promoción Especial en ${biz}! ✨\n\n🎉 ${topic}.\n\nVen y disfruta de la mejor atención y calidad garantizada. ¡Oferta por tiempo limitado!\n\n📍 Contáctanos por WhatsApp o visita nuestro catálogo digital para aprovechar esta promoción.`
      )
    } else if (postType === 'weekly_tip') {
      const topic = postHighlight.trim() || 'cuidar cada detalle en tu negocio marca la diferencia'
      setGeneratedPost(
        `💡 Consejo de la Semana por ${biz} 💡\n\n👉 ${topic.charAt(0).toUpperCase() + topic.slice(1)}.\n\nEn ${biz} estamos comprometidos con ayudarte a alcanzar los mejores resultados con atención profesional y soluciones a tu medida.\n\n📲 ¡Escríbenos hoy por WhatsApp y conversemos sobre tu proyecto!`
      )
    } else {
      const topic = postHighlight.trim() || 'Nuevas soluciones y servicios disponibles'
      setGeneratedPost(
        `🎉 ¡Novedad en ${biz}! 🎉\n\n🚀 ${topic}.\n\nAmpliamos nuestras opciones para ofrecerte siempre lo más innovador con el respaldo de nuestro equipo.\n\n📲 Consulta detalles, disponibilidad y cotizaciones directamente con nosotros. ¡Te esperamos!`
      )
    }
  }

  const auditData = selectedPlace ? calculateAuditScore(selectedPlace) : null

  // URL del Escudo Anti-Quejas
  const activeShieldTagId = primaryDevice?.tag_id || null
  const shieldUrl = activeShieldTagId ? `https://www.omnitag.site/r/${activeShieldTagId}/filter` : null
  const qrShieldUrl = shieldUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shieldUrl)}&format=svg&qzone=1` 
    : null

  return (
    <div className="space-y-6">
      {/* 1. CABECERA PRINCIPAL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 flex items-center gap-1 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Centro de Mando Google Business & Reputación</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              360° Todo en Uno
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Gestión Integral de Tu Negocio Local
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Crea y optimiza la presencia de tu negocio, controla tu <b>Escudo Anti-Quejas</b>, responde a reseñas con Inteligencia Artificial y publica novedades sin enredarte en Google.
          </p>
        </div>

        {shieldUrl && (
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={shieldUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Probar Mi Escudo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* 2. SELECTOR DE PERFIL DE GOOGLE MAPS */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Perfil Oficial de Google Maps Conectado</span>
            </h3>
            <p className="text-xs text-gray-500">
              Conecta o cambia el perfil de tu empresa para sincronizar reseñas y diagnósticos.
            </p>
          </div>
          {selectedPlace && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sincronizado</span>
            </span>
          )}
        </div>

        <GooglePlaceSearchInput
          onPlaceSelected={handlePlaceSelect}
          initialPlace={selectedPlace}
        />
      </div>

      {/* 3. TABS DE NAVEGACIÓN */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('shield')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'shield'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Escudo Anti-Quejas</span>
          {feedbacks.filter(f => f.status !== 'resolved').length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {feedbacks.filter(f => f.status !== 'resolved').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Ficha & Creación de Negocio</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'reviews'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Reseñas Google & IA</span>
          {selectedPlace?.reviews && selectedPlace.reviews.length > 0 && (
            <span className="bg-gray-200 text-gray-800 text-[10px] px-1.5 py-0.2 rounded-full">
              {selectedPlace.reviews.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'posts'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Publicaciones con IA</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Auditoría de Salud (Score)</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'api'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>Conexión API Oficial</span>
          {googleConnection ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          ) : (
            <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
              OAuth
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'verification'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Guía de Verificación</span>
        </button>
      </div>

      {/* 4. CONTENIDO SEGÚN TAB ACTIVO */}

      {/* TAB 1: MI ESCUDO ANTI-QUEJAS & FILTRO DE RESEÑAS */}
      {activeTab === 'shield' && (
        <div className="space-y-6">
          {/* Tarjeta de Control del Escudo */}
          <div className="bg-linear-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Escudo Anti-Quejas Activo</h3>
                  <p className="text-xs text-slate-300">
                    Filtra automáticamente calificaciones bajas (1 a 3 estrellas) en privado y envía solo las 5 estrellas a Google Maps.
                  </p>
                </div>
              </div>

              {primaryDevice ? (
                <button
                  onClick={() => handleToggleShield(primaryDevice)}
                  disabled={isPending}
                  className={`px-4 py-2 rounded-2xl font-black text-xs transition cursor-pointer flex items-center gap-2 ${
                    primaryDevice.review_filter_enabled !== false
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${primaryDevice.review_filter_enabled !== false ? 'bg-slate-950 animate-pulse' : 'bg-slate-500'}`} />
                  <span>{primaryDevice.review_filter_enabled !== false ? 'Escudo: ACTIVADO' : 'Escudo: DESACTIVADO'}</span>
                </button>
              ) : (
                <button
                  onClick={handleCreateShield}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Activar Mi Escudo Ahora</span>
                </button>
              )}
            </div>

            {/* Enlace y QR del Escudo */}
            {shieldUrl ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block mb-1">
                      ENLACE PÚBLICO DEL ESCUDO (Para tus clientes)
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={shieldUrl}
                        className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl font-mono text-xs text-slate-200 select-all"
                      />
                      <button
                        onClick={() => copyToClipboard(shieldUrl, 'shield_link')}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition shrink-0"
                        title="Copiar enlace"
                      >
                        {copiedText === 'shield_link' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Envía este enlace por WhatsApp al cliente al terminar su servicio o cópialo en tus recibos. Si califica con 4 o 5 estrellas, el sistema lo redirecciona directo a Google Maps; si califica con 1, 2 o 3 estrellas, se abre un buzón confidencial para que el cliente desahogue su queja en privado sin afectar tu perfil público.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`¡Hola! En ${bizForm.name || businessName} valoramos mucho tu opinión. ¿Cómo calificarías tu experiencia hoy con nosotros? Puedes dejar tu calificación aquí: ${shieldUrl}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Compartir por WhatsApp</span>
                    </a>
                  </div>
                </div>

                {qrShieldUrl && (
                  <div className="p-4 bg-white rounded-2xl text-center space-y-2 max-w-[200px] mx-auto shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrShieldUrl} alt="QR Escudo" className="w-36 h-36 mx-auto rounded-lg" />
                    <span className="text-[10px] font-black text-gray-900 block uppercase tracking-wider">
                      QR de Mostrador
                    </span>
                    <a
                      href={qrShieldUrl}
                      download={`qr-escudo-${activeShieldTagId}.svg`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-[10px] font-bold text-emerald-700 hover:underline"
                    >
                      Descargar QR para Imprimir
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 bg-white/5 rounded-2xl border border-white/10">
                Presiona "Activar Mi Escudo Ahora" para generar tu código QR y enlace antifiltro.
              </div>
            )}
          </div>

          {/* Buzón de Quejas Privadas Interceptadas */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h4 className="font-black text-gray-900 text-lg flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <span>Quejas Interceptadas por tu Escudo ({feedbacks.length})</span>
                </h4>
                <p className="text-xs text-gray-500">
                  Opiniones de 1 a 3 estrellas que fueron atrapadas en privado para evitar que arruinen tu promedio en Google Maps.
                </p>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-xl">
                {feedbacks.filter(f => f.status !== 'resolved').length} pendientes
              </span>
            </div>

            {feedbacks.length === 0 ? (
              <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h5 className="font-black text-gray-900 text-base">¡Excelente! Cero quejas pendientes</h5>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Tu escudo está vigilante. Si algún cliente califica con baja puntuación, aparecerá de inmediato aquí para que lo atiendas en privado.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbacks.map((fb) => {
                  const cleanPhone = fb.customer_phone ? fb.customer_phone.replace(/\D/g, '') : null
                  const isResolved = fb.status === 'resolved'

                  return (
                    <div
                      key={fb.id}
                      className={`p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                        isResolved ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-rose-50/40 border-rose-200 shadow-xs'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 font-black text-xs">
                            <Star className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                            <span>{fb.rating} / 5 Estrellas</span>
                          </div>

                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-200 text-rose-900'
                          }`}>
                            {isResolved ? 'Resuelta' : 'Pendiente'}
                          </span>
                        </div>

                        {/* Mensaje de la queja */}
                        <div className="p-3 bg-white rounded-xl border border-rose-100 text-xs text-slate-800 font-medium leading-relaxed italic">
                          "{fb.message || 'El cliente no detalló el texto de su queja.'}"
                        </div>

                        {/* Datos del cliente */}
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <p>Cliente: <strong className="text-gray-900 font-bold">{fb.customer_name || 'Anónimo'}</strong></p>
                          {fb.customer_phone && <p>Tel: <span className="font-mono">{fb.customer_phone}</span></p>}
                          <p className="text-[10px] text-gray-400">Recibida: {new Date(fb.created_at).toLocaleDateString('es-HN', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>

                        {fb.resolution_notes && (
                          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900">
                            <strong>Resolución:</strong> {fb.resolution_notes}
                          </div>
                        )}
                      </div>

                      {/* Botones de acción para desescalar la crisis */}
                      <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between gap-2">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${fb.customer_name || ''}, te saluda la gerencia de ${bizForm.name || businessName}. Recibimos tus comentarios sobre tu visita y nos gustaría pedirte una sincera disculpa. Queremos escucharte y ofrecerte una solución prioritaria.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Contactar WhatsApp</span>
                          </a>
                        )}

                        {!isResolved && (
                          <button
                            onClick={() => setResolvingFeedbackId(fb.id)}
                            className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition"
                          >
                            Marcar Resuelta
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FICHA & CREACIÓN DE NEGOCIO */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900">
                Ficha Oficial de Negocio & SEO Local
              </h4>
              <p className="text-xs text-gray-500">
                Mantén tus datos actualizados y genera tu paquete de alta oficial para Google Maps en 1 clic.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos del Negocio */}
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1">
                  Nombre Comercial del Negocio *
                </label>
                <input
                  type="text"
                  value={bizForm.name}
                  onChange={e => setBizForm({ ...bizForm, name: e.target.value })}
                  placeholder="Ej. D’Liz Salon&Spa"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1">
                    Rubro / Categoría *
                  </label>
                  <input
                    type="text"
                    value={bizForm.category}
                    onChange={e => setBizForm({ ...bizForm, category: e.target.value })}
                    placeholder="Ej. Spa de Belleza, Barbería..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-medium focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1">
                    Ciudad / Municipio *
                  </label>
                  <input
                    type="text"
                    value={bizForm.city}
                    onChange={e => setBizForm({ ...bizForm, city: e.target.value })}
                    placeholder="Ej. Tegucigalpa, SPS..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-medium focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1">
                  Dirección Física Completa
                </label>
                <input
                  type="text"
                  value={bizForm.address}
                  onChange={e => setBizForm({ ...bizForm, address: e.target.value })}
                  placeholder="Ej. Colonia Palmira, Calle Principal, Local 4..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-medium focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={bizForm.phone}
                    onChange={e => setBizForm({ ...bizForm, phone: e.target.value })}
                    placeholder="+504 9999-9999"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-medium focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1">
                    Sitio Web / vCard Oficial
                  </label>
                  <input
                    type="url"
                    value={bizForm.website}
                    onChange={e => setBizForm({ ...bizForm, website: e.target.value })}
                    placeholder="https://www.omnitag.site/v/..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-medium focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1">
                  Servicios o Platillos Principales a Destacar
                </label>
                <input
                  type="text"
                  value={bizForm.services}
                  onChange={e => setBizForm({ ...bizForm, services: e.target.value })}
                  placeholder="Ej. Masajes, faciales, tintes, uñas..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-medium focus:bg-white"
                />
              </div>
            </div>

            {/* Optimizador con IA y Kit de Registro */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                    Descripción Comercial con Palabras Clave de SEO Local
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateBio}
                    disabled={isGeneratingBio}
                    className="text-xs text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingBio ? 'Generando...' : 'Optimizar con IA'}</span>
                  </button>
                </div>

                <textarea
                  rows={7}
                  value={aiBio}
                  onChange={e => setAiBio(e.target.value)}
                  placeholder="Presiona 'Optimizar con IA' para que redactemos la descripción perfecta con las palabras clave con las que tus clientes buscan tu rubro en Google..."
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 font-medium focus:bg-white leading-relaxed resize-none"
                />

                <button
                  type="button"
                  onClick={() => copyToClipboard(aiBio, 'bio')}
                  disabled={!aiBio}
                  className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  {copiedText === 'bio' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedText === 'bio' ? '¡Descripción Copiada!' : 'Copiar Descripción para Google Maps'}</span>
                </button>
              </div>

              {/* Botón directo para dar de alta en Google Business si no existe */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-blue-950 font-black text-xs">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span>¿Tu negocio aún no existe en Google Maps?</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-tight">
                  Abre la consola oficial de Google Business con un clic y pega estos datos listos para registrar tu local sin errores.
                </p>
                <a
                  href={`https://business.google.com/create?business_name=${encodeURIComponent(bizForm.name || businessName)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition block text-center shadow-xs"
                >
                  Abrir Registro Oficial en Google Business Profile →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RESEÑAS PÚBLICAS & IA */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <h4 className="font-black text-gray-900 text-base">Reseñas de Clientes & Respuestas IA</h4>
                <p className="text-xs text-gray-500">Supervisa Google Maps o responde reseñas al instante.</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedPlace?.place_id && (
                  <button
                    type="button"
                    onClick={() => fetchPlaceDetails(selectedPlace.place_id)}
                    disabled={isLoadingDetails}
                    className="p-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    title="Actualizar y consultar a Google nuevamente"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDetails ? 'animate-spin text-blue-600' : ''}`} />
                    <span>Sincronizar</span>
                  </button>
                )}
                {selectedPlace?.place_id && (
                  <a
                    href={`https://www.google.com/maps/place/?q=place_id:${selectedPlace.place_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ver en Google</span>
                  </a>
                )}
              </div>
            </div>

            {/* Selector de modo: Google Maps en vivo vs Manual */}
            <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
              <button
                type="button"
                onClick={() => setReviewTabMode('google')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer ${
                  reviewTabMode === 'google' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Google Maps en Vivo {selectedPlace?.reviews ? `(${selectedPlace.reviews.length})` : '(0)'}
              </button>
              <button
                type="button"
                onClick={() => setReviewTabMode('manual')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  reviewTabMode === 'manual' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pegar / Responder Reseña Manual</span>
              </button>
            </div>

            {reviewTabMode === 'google' ? (
              selectedPlace?.reviews && selectedPlace.reviews.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {selectedPlace.reviews.map((rev, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        activeReviewSource === 'google' && selectedReviewIndex === idx 
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
                          {rev.rating >= 4 ? '🌟 5 Estrellas' : '⚠️ Observación'}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedReviewIndex(idx)
                            setActiveReviewSource('google')
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
                <div className="p-6 bg-gradient-to-br from-amber-50/70 to-blue-50/40 rounded-2xl border border-amber-200/80 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-black text-gray-900 text-sm">
                        Perfil conectado, pero Google aún no publica las reseñas en su API
                      </h5>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        ¿Ya te dejaron una reseña pero no aparece aquí? Esto es completamente normal en Google Maps debido a lo siguiente:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-700 bg-white/95 p-4 rounded-xl border border-amber-100/80 shadow-2xs">
                    <p>
                      ⏳ <strong>Latencia de Moderación (24 a 72 hrs):</strong> Cuando alguien publica una reseña en Google Maps, sus algoritmos antispam la revisan internamente antes de propagarla a su base de datos pública y API.
                    </p>
                    <p>
                      👁️ <strong>El "Efecto Espejo" de Google:</strong> Quien escribió la reseña sí puede verla en su propio teléfono o navegador mientras esté logueado con su cuenta de Google, pero para el resto del público y para herramientas externas permanece oculta hasta que Google concluye la aprobación.
                    </p>
                    <p>
                      🔒 <strong>Autorreseñas o misma red WiFi:</strong> Si la reseña fue escrita por el propietario para probar o desde la misma red WiFi del local, los filtros de Google suelen demorarla o filtrarla para evitar conflicto de intereses.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setReviewTabMode('manual')}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Pegar el texto de mi reseña para responder con IA</span>
                    </button>
                    {selectedPlace?.place_id && (
                      <a
                        href={`https://www.google.com/maps/place/?q=place_id:${selectedPlace.place_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center gap-1.5 transition text-center"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver en Google Maps ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h5 className="font-black text-gray-900 text-sm">Responde Cualquier Reseña al Instante con IA</h5>
                </div>
                <p className="text-xs text-gray-500">
                  Pega aquí la reseña que te dejaron en Google Maps, WhatsApp o redes sociales para redactar la respuesta estratégica en segundos.
                </p>

                <div>
                  <label className="block font-bold text-gray-700 text-[10px] uppercase mb-1">
                    Nombre del Cliente (Opcional)
                  </label>
                  <input
                    type="text"
                    value={customReviewAuthor}
                    onChange={e => setCustomReviewAuthor(e.target.value)}
                    placeholder="Ej: Carlos Mejía"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[10px] uppercase mb-1">
                    Calificación de la Reseña
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCustomReviewRating(s)}
                        className="p-1 rounded-lg hover:bg-white transition cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${s <= customReviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-gray-600">{customReviewRating} de 5 Estrellas</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[10px] uppercase mb-1">
                    Texto o Comentario de la Reseña *
                  </label>
                  <textarea
                    rows={4}
                    value={customReviewText}
                    onChange={e => setCustomReviewText(e.target.value)}
                    placeholder="Pega aquí el texto que te escribió el cliente..."
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 font-medium resize-none focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveReviewSource('manual')
                    setSelectedReviewIndex(null)
                    handleGenerateAiResponse(customReviewText, customReviewRating, customReviewAuthor)
                  }}
                  disabled={!customReviewText.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Respuesta con IA para esta Reseña</span>
                </button>
              </div>
            )}
          </div>

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

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-1.5">
                  Tono de la Respuesta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAiTone('warm')
                      if (activeReviewSource === 'google' && selectedReviewIndex !== null && selectedPlace?.reviews?.[selectedReviewIndex]) {
                        const r = selectedPlace.reviews[selectedReviewIndex]
                        handleGenerateAiResponse(r.text, r.rating, r.author_name, 'warm')
                      } else if (activeReviewSource === 'manual' && customReviewText) {
                        handleGenerateAiResponse(customReviewText, customReviewRating, customReviewAuthor, 'warm')
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
                      if (activeReviewSource === 'google' && selectedReviewIndex !== null && selectedPlace?.reviews?.[selectedReviewIndex]) {
                        const r = selectedPlace.reviews[selectedReviewIndex]
                        handleGenerateAiResponse(r.text, r.rating, r.author_name, 'professional')
                      } else if (activeReviewSource === 'manual' && customReviewText) {
                        handleGenerateAiResponse(customReviewText, customReviewRating, customReviewAuthor, 'professional')
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
                      if (activeReviewSource === 'google' && selectedReviewIndex !== null && selectedPlace?.reviews?.[selectedReviewIndex]) {
                        const r = selectedPlace.reviews[selectedReviewIndex]
                        handleGenerateAiResponse(r.text, r.rating, r.author_name, 'promotional')
                      } else if (activeReviewSource === 'manual' && customReviewText) {
                        handleGenerateAiResponse(customReviewText, customReviewRating, customReviewAuthor, 'promotional')
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

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-1.5">
                  Respuesta Sugerida por IA
                </label>
                <textarea
                  rows={6}
                  value={generatedResponse}
                  onChange={(e) => setGeneratedResponse(e.target.value)}
                  placeholder="Selecciona una reseña a la izquierda o pega una manual para generar la respuesta automáticamente..."
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 font-medium focus:bg-white focus:border-blue-500 transition leading-relaxed resize-none"
                />
              </div>
            </div>

            {directActionResult && (
              <div className={`p-3 rounded-2xl text-xs font-bold ${
                directActionResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {directActionResult.message}
              </div>
            )}

            <div className="space-y-2 pt-3 border-t border-gray-100">
              {googleConnection && (
                <button
                  type="button"
                  onClick={() => {
                    const rev = (selectedReviewIndex !== null && selectedPlace?.reviews?.[selectedReviewIndex]) ? selectedPlace.reviews[selectedReviewIndex] : null
                    const revName = rev?.time ? `rev_${rev.time}` : 'review_1'
                    handlePublishReviewReply(revName, generatedResponse)
                  }}
                  disabled={!generatedResponse || isPublishingDirect}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Zap className="w-4 h-4 text-emerald-200" />
                  <span>{isPublishingDirect ? 'Publicando en Google Maps...' : '⚡ Publicar Respuesta Directa a Google Maps'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => copyToClipboard(generatedResponse, 'ai_response')}
                disabled={!generatedResponse}
                className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {copiedText === 'ai_response' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText === 'ai_response' ? '¡Copiado al portapapeles!' : 'Copiar Respuesta para Google Maps'}</span>
              </button>

              <a
                href={selectedPlace?.place_id ? `https://search.google.com/local/writereview?placeid=${selectedPlace.place_id}` : (selectedPlace?.google_maps_url || 'https://business.google.com')}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition flex items-center justify-center gap-2 text-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Perfil en Google Maps para Pegar</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PUBLICACIONES CON IA (GOOGLE POSTS) */}
      {activeTab === 'posts' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-lg">Publicaciones Semanales de Google Maps</h4>
              <p className="text-xs text-gray-500">
                Google premia a los locales que publican al menos 1 novedad semanal haciéndolos destacar sobre los que están inactivos.
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
                    <span className="text-xs font-black">Consejo / Tip</span>
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
                    <span className="text-xs font-black">Nuevo Servicio</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Beneficio o Tema a Comunicar
                </label>
                <input
                  type="text"
                  value={postHighlight}
                  onChange={(e) => setPostHighlight(e.target.value)}
                  placeholder="Ej. 2x1 en cortes los martes, nuevas gift cards de regalo..."
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
                  placeholder="Presiona 'Generar Publicación con IA' a la izquierda para redactar el post..."
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 font-medium focus:bg-white leading-relaxed resize-none"
                />
              </div>

              {directActionResult && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  directActionResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {directActionResult.message}
                </div>
              )}

              {googleConnection && (
                <button
                  type="button"
                  onClick={handlePublishGooglePost}
                  disabled={!generatedPost || isPublishingDirect}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Zap className="w-4 h-4 text-emerald-200" />
                  <span>{isPublishingDirect ? 'Publicando en Google Maps...' : '⚡ Publicar Novedad Directa a Google Maps'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => copyToClipboard(generatedPost, 'ai_post')}
                disabled={!generatedPost}
                className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black disabled:opacity-40 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {copiedText === 'ai_post' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText === 'ai_post' ? '¡Copiado!' : 'Copiar Texto del Post'}</span>
              </button>

              <a
                href={selectedPlace?.google_maps_url || 'https://business.google.com'}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition flex items-center justify-center gap-2 text-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Google Maps para Publicar Novedad</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDITORÍA DE SALUD */}
      {activeTab === 'audit' && (
        selectedPlace && auditData ? (
          <div className="space-y-6">
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

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-5">
              <div>
                <h4 className="font-black text-gray-900 text-lg">Factores Auditados</h4>
                <p className="text-xs text-gray-500">Google Maps utiliza estos factores para clasificar tu negocio en las búsquedas locales.</p>
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
                Escribe el nombre de tu empresa para que el sistema analice tu perfil público de Google Maps y te entregue tu reporte de salud.
              </p>
            </div>
          </div>
        )
      )}

      {/* TAB 6: GUÍA DE VERIFICACIÓN */}
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
                <li><strong>No agregues palabras clave al nombre:</strong> Usa solo tu nombre legal/comercial.</li>
                <li>No uses direcciones falsas ni apartados postales.</li>
                <li>Asegúrate de que el letrero físico coincida letra por letra con el perfil.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CONEXIÓN API OFICIAL (OAUTH & ESCRITURA DIRECTA) */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Link2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    Conexión Oficial con Google Business Profile (OAuth 2.0)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Habilita la escritura directa para responder reseñas y publicar novedades en Google Maps en 1 clic.
                  </p>
                </div>
              </div>

              {googleConnection ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black self-start sm:self-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Conectado a Google</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black self-start sm:self-auto">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Configuración Requerida</span>
                </div>
              )}
            </div>

            {/* Alertas de Retorno OAuth */}
            {errorParam && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold space-y-1">
                <div className="flex items-center gap-2 text-rose-800 font-black">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    {errorParam === 'missing_credentials_in_vercel'
                      ? 'Atención: Faltan credenciales en Vercel'
                      : 'Aviso de autenticación de Google'}
                  </span>
                </div>
                <p className="font-normal text-rose-700 leading-relaxed">
                  {errorParam === 'missing_credentials_in_vercel'
                    ? 'Para que el botón funcione en www.omnitag.site, debes agregar GOOGLE_OAUTH_CLIENT_ID y GOOGLE_OAUTH_CLIENT_SECRET en las Variables de Entorno de Vercel y hacer un Redeploy.'
                    : `Google devolvió el estado: "${errorParam}". Revisa que la aplicación en Google Cloud esté en Producción o que tu correo esté agregado como usuario de prueba.`}
                </p>
              </div>
            )}

            {isConnectedParam && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>¡Tu cuenta de Google Business Profile ha sido vinculada con éxito! Ya puedes gestionar respuestas y novedades directas.</span>
              </div>
            )}

            {/* Estado de Conexión Actual */}
            {googleConnection ? (
              <div className="p-6 rounded-3xl bg-linear-to-br from-emerald-50/60 to-blue-50/40 border border-emerald-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Cuenta Administradora Activa
                    </span>
                    <h4 className="text-lg font-black text-gray-900">{googleConnection.email}</h4>
                    <p className="text-xs text-gray-600">
                      Esta cuenta tiene permisos autorizados para gestionar la ficha de <strong>{selectedPlace?.name || businessName}</strong>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDisconnectGoogle}
                    disabled={isDisconnectingGoogle}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
                  >
                    <Unlink className="w-4 h-4" />
                    <span>{isDisconnectingGoogle ? 'Desconectando...' : 'Desvincular Cuenta'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-white rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 block">RESPUESTAS A RESEÑAS</span>
                    <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Escritura Directa Habilitada
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 block">GOOGLE POSTS (NOVEDADES)</span>
                    <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Publicación en 1 Clic
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 block">ESCUDO ANTI-QUEJAS</span>
                    <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Filtro Activo
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-linear-to-br from-indigo-50/70 to-blue-50/40 border border-indigo-200/80 space-y-4">
                <div className="max-w-2xl space-y-2">
                  <h4 className="text-base font-black text-gray-900">
                    Vincular Cuenta de Administrador de Google Maps
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Al conectar tu cuenta mediante el protocolo seguro OAuth 2.0 de Google, tus respuestas sugeridas por la Inteligencia Artificial y tus publicaciones semanales se enviarán directamente a Google Maps sin que tengas que copiar y pegar manualmente.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
                  <a
                    href="/api/auth/google-business"
                    className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Conectar con Cuenta de Google (OAuth 2.0)</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>

                  <span className="text-[11px] text-gray-500 italic">
                    * Inicia sesión con el correo Gmail dueño del negocio.
                  </span>
                </div>
              </div>
            )}

            {/* GUÍA PASO A PASO: APROBACIÓN DE GOOGLE PARTNER */}
            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200/80 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-base">
                    Guía de Aprobación de la Google Business Profile API
                  </h4>
                  <p className="text-xs text-gray-500">
                    Google exige un proceso de aprobación formal antes de otorgar cuotas de escritura masivas para proteger la seguridad de los negocios.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Paso 1 */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-blue-700">
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">1</span>
                    <span>Credenciales en Google Cloud</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    En <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">Google Cloud Console</a>, crea un <strong>ID de cliente de OAuth 2.0</strong> (tipo Aplicación Web).
                  </p>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-[10px] space-y-1">
                    <span className="font-bold text-gray-500 block">URI de redireccionamiento autorizado:</span>
                    <code className="text-blue-600 break-all select-all font-mono font-bold">
                      https://www.omnitag.site/api/auth/google-business/callback
                    </code>
                  </div>
                </div>

                {/* Paso 2 */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-blue-700">
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">2</span>
                    <span>Formulario de Acceso a la API</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Aplica formalmente ante el equipo de Google llenando el formulario oficial de solicitud de acceso a la <strong>Google Business Profile API</strong>.
                  </p>
                  <a
                    href="https://developers.google.com/my-business/content/prereqs#request-access"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline"
                  >
                    <span>Abrir Formulario de Solicitud Google</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Paso 3 */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-blue-700">
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">3</span>
                    <span>Aprobación & Activación</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Google revisará la legitimidad de tu herramienta (tarda entre 2 y 4 semanas). Una vez aprobada, tus clientes podrán publicar y contestar con 1 clic sin límites.
                  </p>
                </div>
              </div>

              {/* Plantilla de Respuestas Aprobadas */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-gray-900 text-xs uppercase tracking-wider">
                    Plantilla de Respuestas para el Formulario de Google (Copiar y Pegar)
                  </h5>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Optimizado para Aprobación Rápida
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <span className="font-bold text-gray-700 block text-[11px]">¿Cuál es el propósito de tu aplicación?</span>
                    <p className="text-gray-600 text-[11px] leading-relaxed">
                      "OmniTag es una plataforma integral para comercios locales y pymes que les permite sincronizar sus datos, publicar actualizaciones semanales y responder de forma eficiente y oportuna a las opiniones de sus clientes."
                    </p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('OmniTag es una plataforma integral para comercios locales y pymes que les permite sincronizar sus datos, publicar actualizaciones semanales y responder de forma eficiente y oportuna a las opiniones de sus clientes.', 'tpl_1')}
                      className="text-blue-600 hover:text-blue-800 font-bold text-[10px] flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedText === 'tpl_1' ? '¡Copiado!' : 'Copiar respuesta'}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <span className="font-bold text-gray-700 block text-[11px]">¿Por qué requieres acceso de escritura a reseñas?</span>
                    <p className="text-gray-600 text-[11px] leading-relaxed">
                      "Para permitir que los dueños de negocios locales puedan responder a los comentarios de sus clientes en Google Maps directamente desde su panel unificado con plantillas profesionales y asistencia de IA."
                    </p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('Para permitir que los dueños de negocios locales puedan responder a los comentarios de sus clientes en Google Maps directamente desde su panel unificado con plantillas profesionales y asistencia de IA.', 'tpl_2')}
                      className="text-blue-600 hover:text-blue-800 font-bold text-[10px] flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedText === 'tpl_2' ? '¡Copiado!' : 'Copiar respuesta'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Resolver Queja Privada */}
      {resolvingFeedbackId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <h4 className="font-black text-gray-900 text-base">Resolver Queja de Cliente</h4>
            <p className="text-xs text-gray-500">
              Registra qué acuerdo o solución se le ofreció al cliente para mantener un registro de calidad.
            </p>
            <textarea
              rows={3}
              value={resolutionNoteInput}
              onChange={e => setResolutionNoteInput(e.target.value)}
              placeholder="Ej. Se le ofreció una disculpa, se le reintegró el costo del servicio y se le obsequió un certificado de descuento..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResolvingFeedbackId(null)}
                className="px-4 py-2 rounded-xl text-gray-600 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleResolveFeedbackSubmit(resolvingFeedbackId)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black"
              >
                Guardar y Marcar Resuelta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
