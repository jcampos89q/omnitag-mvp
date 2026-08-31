import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { 
  UserCircle2, 
  Briefcase, 
  Mail, 
  Phone, 
  Download, 
  Building2, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Sparkles,
  UtensilsCrossed,
  Scissors,
  Gift,
  Star,
  ChevronRight,
  CalendarDays
} from 'lucide-react'
import ShareButtons from '@/components/ShareButtons'
import LeadCaptureModal from './LeadCaptureModal'
import BusinessHoursWidget from './BusinessHoursWidget'
import { resolveTheme, getGoogleFontUrl, getFontFamilyCss } from '@/lib/themes'
import { recordPageViewScan } from '@/lib/analytics'
import { getUserPlanInfo } from '@/lib/plans'

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params

  const { data: vcard } = await supabase
    .from('vcards')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!vcard) {
    return {
      title: 'Perfil Digital | OmniTag',
    }
  }

  const isBusiness = vcard.card_type === 'business'
  const titleName = isBusiness 
    ? (vcard.first_name || vcard.company_name || 'Perfil Empresarial')
    : [vcard.first_name, vcard.last_name].filter(Boolean).join(' ') || 'Contacto'

  const subtitle = vcard.job_title 
    ? `${vcard.job_title}${vcard.company_name ? ` • ${vcard.company_name}` : ''}`
    : vcard.company_name || 'Tarjeta de Presentación Digital'

  const description = vcard.bio || `${subtitle}. Conecta, guarda mis datos de contacto o comunícate conmigo.`
  const imageUrl = vcard.cover_url || vcard.avatar_url || ''

  return {
    title: `${titleName} | ${subtitle}`,
    description,
    openGraph: {
      title: titleName,
      description,
      url: `https://www.omnitag.site/v/${slug}`,
      siteName: 'OmniTag',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: titleName,
        }
      ] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: titleName,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function PublicVCardPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient()
  const { slug } = await params

  // 1. Buscar la vCard por su slug (URL) de forma segura
  const { data: vcard } = await supabase
    .from('vcards')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!vcard) {
    notFound()
  }

  // Registrar visita / escaneo de la vCard asíncronamente
  recordPageViewScan({
    vcardId: vcard.id,
    targetUserId: vcard.user_id,
    sourceType: 'vcard'
  })

  const { 
    id: vcardId, 
    user_id: ownerId,
    card_type = 'personal',
    first_name, 
    last_name, 
    job_title, 
    company_name, 
    bio, 
    contact_info, 
    business_info,
    avatar_url, 
    cover_url, 
    theme: rawTheme, 
    lead_capture_enabled 
  } = vcard

  // 2. Comprobar si el dueño de la vCard es PRO y buscar sus módulos del ecosistema
  const [
    { isPro: ownerIsPro },
    { data: activeMenu },
    { data: activeAppointment },
    { data: activeLoyalty },
    { data: activeDevice }
  ] = await Promise.all([
    getUserPlanInfo(supabase, ownerId),
    supabase.from('menus').select('id, slug, name, business_type').eq('user_id', ownerId).eq('is_active', true).maybeSingle(),
    supabase.from('appointment_businesses').select('id, slug, name, category').eq('user_id', ownerId).eq('is_active', true).maybeSingle(),
    supabase.from('loyalty_programs').select('id, slug, title, reward_text').eq('user_id', ownerId).eq('is_active', true).maybeSingle(),
    supabase.from('devices').select('id, tag_id, name').eq('user_id', ownerId).eq('is_active', true).maybeSingle()
  ])

  const canCaptureLeads = ownerIsPro && lead_capture_enabled

  const businessInfo = business_info || {}
  const isBusiness = card_type === 'business'
  const titleName = isBusiness 
    ? (first_name || company_name || 'Empresa')
    : [first_name, last_name].filter(Boolean).join(' ')
  
  const subtitle = job_title || (isBusiness ? '' : company_name ? `en ${company_name}` : '')

  const theme = resolveTheme(rawTheme)
  const fontUrl = getGoogleFontUrl(theme.font_family)
  const fontFamilyCss = getFontFamilyCss(theme.font_family)

  // Clases según estilo de bordes
  const cardRadiusClass = theme.border_style === 'square' 
    ? 'rounded-none' 
    : theme.border_style === 'pill' 
    ? 'rounded-3xl' 
    : 'rounded-2xl'

  const btnRadiusClass = theme.border_style === 'square' 
    ? 'rounded-none' 
    : theme.border_style === 'pill' 
    ? 'rounded-full' 
    : 'rounded-xl'

  const isGlass = theme.border_style === 'glass'

  // Determinar módulos activos del ecosistema
  const showMenu = activeMenu && businessInfo.show_menu !== false
  const showAppointment = activeAppointment && businessInfo.show_appointments !== false
  const showLoyalty = activeLoyalty && businessInfo.show_loyalty !== false
  const showReviews = activeDevice && businessInfo.show_reviews !== false
  const hasConnectedModules = showMenu || showAppointment || showLoyalty || showReviews

  return (
    <>
      {/* Pre-conexión DNS y optimización de carga para Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={fontUrl} />

      <div 
        className="min-h-screen py-8 sm:py-14 px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-center transition-colors duration-300"
        style={{ 
          backgroundColor: theme.bg_color,
          fontFamily: fontFamilyCss 
        }}
      >
        <div 
          className={`w-full max-w-md shadow-2xl overflow-hidden border transition-all ${cardRadiusClass} ${
            isGlass ? 'backdrop-blur-xl border-white/20' : 'border-black/5'
          }`}
          style={{ 
            backgroundColor: theme.card_bg,
            color: theme.text_color
          }}
        >
          {/* Encabezado / Banner Panorámico */}
          <div 
            className="h-36 sm:h-44 relative bg-cover bg-center transition-all"
            style={{ 
              backgroundColor: theme.primary_color, 
              backgroundImage: cover_url ? `url(${cover_url})` : 'none' 
            }}
          >
            <div className="absolute inset-0 bg-black/15 pointer-events-none" />

            {/* Avatar / Logotipo superpuesto (Elemento LCP Crítico) */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-10">
              <div 
                className={`w-24 h-24 p-1 shadow-xl flex items-center justify-center overflow-hidden border-2 ${
                  isBusiness ? 'rounded-2xl' : 'rounded-full'
                }`}
                style={{ 
                  backgroundColor: theme.card_bg,
                  borderColor: theme.primary_color 
                }}
              >
                {avatar_url ? (
                  <img 
                    src={avatar_url} 
                    alt={titleName} 
                    fetchPriority="high"
                    decoding="async"
                    className={`w-full h-full object-cover ${isBusiness ? 'rounded-xl' : 'rounded-full'}`} 
                  />
                ) : isBusiness ? (
                  <Building2 className="w-12 h-12 text-gray-400" />
                ) : (
                  <UserCircle2 className="w-full h-full text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Información de Identidad */}
          <div className="pt-16 pb-6 px-6 sm:px-8 text-center border-b border-black/5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: theme.text_color }}>
              {titleName}
            </h1>
            
            {subtitle && (
              <p className="mt-1 text-sm font-semibold opacity-80" style={{ color: theme.primary_color }}>
                {subtitle}
              </p>
            )}
            
            {bio && (
              <p className="mt-3 text-xs sm:text-sm leading-relaxed opacity-75 max-w-sm mx-auto" style={{ color: theme.text_color }}>
                "{bio}"
              </p>
            )}

            {/* Botón de Acción Destacado (CTA para Empresas) */}
            {isBusiness && businessInfo?.cta_text && (
              <div className="mt-5">
                <a
                  href={businessInfo.cta_url || (contact_info?.phone ? `https://wa.me/${contact_info.phone.replace(/\D/g, '')}` : '#')}
                  target="_blank"
                  rel="noreferrer"
                  style={{ backgroundColor: theme.primary_color }}
                  className={`inline-flex items-center justify-center gap-2 text-white px-6 py-3 font-bold text-sm shadow-md hover:opacity-95 transition-all w-full ${btnRadiusClass}`}
                >
                  <Sparkles className="w-4 h-4" />
                  {businessInfo.cta_text}
                </a>
              </div>
            )}

            {/* Redes Sociales Rápidas */}
            <div className="flex items-center justify-center gap-4 mt-5">
              {contact_info?.instagram && (
                <a 
                  href={`https://instagram.com/${contact_info.instagram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="opacity-70 hover:opacity-100 hover:text-pink-600 transition-all"
                  title="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
              )}
              {contact_info?.linkedin && (
                <a 
                  href={contact_info.linkedin} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="opacity-70 hover:opacity-100 hover:text-blue-600 transition-all"
                  title="LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                </a>
              )}
              {contact_info?.facebook && (
                <a 
                  href={contact_info.facebook} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="opacity-70 hover:opacity-100 hover:text-blue-500 transition-all"
                  title="Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
              )}
              {contact_info?.tiktok && (
                <a 
                  href={`https://tiktok.com/@${contact_info.tiktok.replace('@', '')}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="opacity-70 hover:opacity-100 transition-all"
                  title="TikTok"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.63-1.15 5.3-3.16 7.03-2.3 2.01-5.74 2.58-8.54 1.43-2.61-1.09-4.52-3.64-4.83-6.52-.3-2.92 1.12-5.91 3.66-7.5 2.16-1.34 4.88-1.58 7.31-.96v4.32c-1.3-.39-2.79-.27-3.95.45-1.15.71-1.84 2.05-1.73 3.4.11 1.25.97 2.41 2.15 2.87 1.43.55 3.19.34 4.39-.56.97-.73 1.58-1.89 1.6-3.1.03-5.71.02-11.41.02-17.12z" clipRule="evenodd" /></svg>
                </a>
              )}
              {contact_info?.website && (
                <a 
                  href={contact_info.website} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="opacity-70 hover:opacity-100 transition-all"
                  title="Sitio Web"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </a>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 🌟 HUB DEL ECOSISTEMA: SERVICIOS & ACCIONES DEL NEGOCIO */}
          {/* ======================================================== */}
          {hasConnectedModules && (
            <div className="p-5 sm:p-6 bg-black/5 border-b border-black/5 space-y-3">
              <div className="text-left mb-2">
                <p className="text-[11px] font-black uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: theme.primary_color }} /> 
                  Servicios & Accesos del Negocio
                </p>
              </div>

              <div className="space-y-2.5">
                {/* 1. Módulo de Menú & Catálogo Digital */}
                {showMenu && (
                  <a
                    href={`/m/${activeMenu.slug}`}
                    className={`p-3.5 sm:p-4 bg-white/80 hover:bg-white border border-black/10 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all text-left ${cardRadiusClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <UtensilsCrossed className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-xs sm:text-sm" style={{ color: theme.text_color }}>
                          {activeMenu.name || 'Menú Digital & Catálogo'}
                        </p>
                        <p className="text-[11px] opacity-70">
                          Explora platillos, precios y pide por WhatsApp
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                  </a>
                )}

                {/* 2. Módulo de Agendas & Citas */}
                {showAppointment && (
                  <a
                    href={`/b/${activeAppointment.slug}`}
                    className={`p-3.5 sm:p-4 bg-white/80 hover:bg-white border border-black/10 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all text-left ${cardRadiusClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-xs sm:text-sm" style={{ color: theme.text_color }}>
                          Reservar Cita / Apartar Turno
                        </p>
                        <p className="text-[11px] opacity-70">
                          Elige tu especialista favorito y horario online
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                  </a>
                )}

                {/* 3. Módulo de Fidelización & Sellos */}
                {showLoyalty && (
                  <a
                    href={`/l/${activeLoyalty.slug}`}
                    className={`p-3.5 sm:p-4 bg-white/80 hover:bg-white border border-black/10 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all text-left ${cardRadiusClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-xs sm:text-sm" style={{ color: theme.text_color }}>
                          Club de Sellos & Recompensas
                        </p>
                        <p className="text-[11px] opacity-70">
                          {activeLoyalty.reward_text ? `Gana: ${activeLoyalty.reward_text}` : 'Sella tu tarjeta y canjea premios'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                  </a>
                )}

                {/* 4. Módulo de Calificación Google & Reseñas */}
                {showReviews && (
                  <a
                    href={`/r/${activeDevice.tag_id}`}
                    className={`p-3.5 sm:p-4 bg-white/80 hover:bg-white border border-black/10 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all text-left ${cardRadiusClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center shrink-0 shadow-xs">
                        <Star className="w-5 h-5 fill-black" />
                      </div>
                      <div>
                        <p className="font-extrabold text-xs sm:text-sm" style={{ color: theme.text_color }}>
                          Califícanos en Google Maps
                        </p>
                        <p className="text-[11px] opacity-70">
                          Déjanos tus 5 estrellas en segundos
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Botones de Acción Directa (WhatsApp, SMS, Guardar Contacto) */}
          <div className="p-6 sm:p-8 space-y-3">
            {contact_info?.phone && (
              <div className="grid grid-cols-2 gap-3 mb-2">
                <a
                  href={`https://wa.me/${contact_info.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3.5 font-bold text-xs sm:text-sm hover:bg-[#1EBE57] transition-all shadow-sm ${btnRadiusClass}`}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`sms:${contact_info.phone.replace(/\D/g, '')}`}
                  className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3.5 font-bold text-xs sm:text-sm hover:bg-blue-700 transition-all shadow-sm ${btnRadiusClass}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <span>SMS</span>
                </a>
              </div>
            )}

            {/* Descargar Contacto .vcf */}
            <a
              href={`/v/${slug}/vcard`}
              style={{ backgroundColor: theme.primary_color }}
              className={`w-full flex items-center justify-center gap-2 text-white px-6 py-3.5 font-bold text-sm hover:opacity-90 transition-all shadow-md ${btnRadiusClass}`}
            >
              <Download className="w-5 h-5" />
              Guardar Contacto en el Móvil
            </a>

            {/* Modal de Intercambiar Contacto / Leads (Exclusivo PRO) */}
            {canCaptureLeads && (
              <LeadCaptureModal vcardId={vcardId} slug={slug} theme={theme} />
            )}

            {/* Botones Sociales para Compartir */}
            <ShareButtons slug={slug} name={titleName} isDark={theme.is_dark} />

            {/* Detalles Corporativos: Horario, Dirección y Ubicación */}
            {((businessInfo?.show_hours !== false && (businessInfo?.hours || businessInfo?.schedule_config)) || businessInfo?.address || contact_info?.phone || contact_info?.email) && (
              <div className="mt-8 pt-6 border-t border-black/5 space-y-3">
                {/* Horario de Atención en Vivo (Si está habilitado) */}
                {businessInfo?.show_hours !== false && (businessInfo?.schedule_config || businessInfo?.hours) && (
                  <BusinessHoursWidget
                    scheduleConfig={businessInfo?.schedule_config}
                    legacyHoursText={businessInfo?.hours}
                    theme={theme}
                    btnRadiusClass={btnRadiusClass}
                  />
                )}

                {/* Dirección y Mapa */}
                {businessInfo?.address && (
                  <div className={`p-4 border border-black/5 flex items-start justify-between gap-3.5 ${cardRadiusClass}`} style={{ backgroundColor: theme.is_dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <div className="flex items-start gap-3.5 text-left">
                      <MapPin className="w-5 h-5 shrink-0 opacity-70 mt-0.5" style={{ color: theme.primary_color }} />
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider opacity-60">Ubicación / Dirección</p>
                        <p className="text-xs sm:text-sm font-medium mt-0.5" style={{ color: theme.text_color }}>{businessInfo.address}</p>
                      </div>
                    </div>
                    {businessInfo?.maps_url && (
                      <a
                        href={businessInfo.maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-black/10 shrink-0 hover:bg-black/5 transition flex items-center gap-1"
                        style={{ color: theme.primary_color }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Mapa
                      </a>
                    )}
                  </div>
                )}

                {/* Teléfono */}
                {contact_info?.phone && (
                  <a 
                    href={`tel:${contact_info.phone}`}
                    className={`flex items-center gap-3.5 p-3.5 border border-black/5 hover:bg-black/5 transition-all text-left ${cardRadiusClass}`}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${theme.primary_color}20`, color: theme.primary_color }}>
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider opacity-60">Llamada Directa</p>
                      <p className="text-xs sm:text-sm font-medium" style={{ color: theme.text_color }}>{contact_info.phone}</p>
                    </div>
                  </a>
                )}

                {/* Correo Electrónico */}
                {contact_info?.email && (
                  <a 
                    href={`mailto:${contact_info.email}`}
                    className={`flex items-center gap-3.5 p-3.5 border border-black/5 hover:bg-black/5 transition-all text-left ${cardRadiusClass}`}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${theme.primary_color}20`, color: theme.primary_color }}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider opacity-60">Correo Electrónico</p>
                      <p className="text-xs sm:text-sm font-medium truncate" style={{ color: theme.text_color }}>{contact_info.email}</p>
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pie de Página */}
        <div className="mt-6 text-center opacity-60">
          <p className="text-xs font-semibold" style={{ color: theme.text_color }}>
            Tarjeta Digital creada con <span className="font-bold">OmniTag</span>
          </p>
        </div>
      </div>
    </>
  )
}
