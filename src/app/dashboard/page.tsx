export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  UserCircle, 
  Smartphone, 
  Coffee, 
  Users, 
  BarChart3, 
  ArrowRight, 
  Zap, 
  Sparkles, 
  Star, 
  QrCode, 
  Gift, 
  Check, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Scissors, 
  Disc, 
  CreditCard, 
  MapPin,
  ShoppingBag,
  Stethoscope,
  Lightbulb,
  Building2
} from 'lucide-react'
import { getUserPlanInfo } from '@/lib/plans'
import BusinessUpgradesShowcase from '@/components/BusinessUpgradesShowcase'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'
import IndustrySwitcher from '@/components/IndustrySwitcher'
import { getIndustryConfig, normalizeIndustry } from '@/lib/industries'

// Mapeo de iconos para tarjetas
const cardIcons: Record<string, any> = {
  coffee: Coffee,
  scissors: Scissors,
  stethoscope: Stethoscope,
  shopping: ShoppingBag,
  user: UserCircle,
  star: Star,
  sparkles: Sparkles,
  gift: Gift,
  disc: Disc,
  qrcode: QrCode,
  mapPin: MapPin,
  users: Users,
  alert: AlertTriangle
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    redirect('/login')
  }

  // 1. Obtener plan, perfil y giro del negocio
  const [planInfo, { data: profile }] = await Promise.all([
    getUserPlanInfo(supabase, user.id),
    supabase.from('users').select('full_name, account_type, industry').eq('id', user.id).maybeSingle()
  ])

  const {
    isPro,
    isAdmin,
    expiresAt,
    daysLeft,
    isExpired,
    isTrial,
    isDiscountEligible,
    discountDaysLeft,
    hasNfcCard,
    isHardwareActive,
    hardwareDaysLeft,
    hardwareExpiresAt
  } = planInfo

  const userIndustry = user.industry || profile?.industry || 'general'
  const industryConfig = getIndustryConfig(userIndustry)
  const normalizedIndustry = normalizeIndustry(userIndustry)
  const accountType = profile?.account_type || 'professional'
  const isReviewPlateUser = accountType === 'review_plate'

  // Si es un cliente exclusivo de Placa de Reseñas de Google, mostrar su panel especializado
  if (isReviewPlateUser) {
    const { data: userDevices } = await supabase
      .from('devices')
      .select('*')
      .eq('user_id', user.id)

    const primaryDevice = userDevices?.[0]
    const deviceIds = userDevices?.map(d => d.id) || []

    const [{ count: feedbackCount }, { count: scansCount }] = await Promise.all([
      deviceIds.length > 0 
        ? supabase.from('private_feedbacks').select('*', { count: 'exact', head: true }).in('device_id', deviceIds)
        : { count: 0 },
      deviceIds.length > 0 
        ? supabase.from('scans').select('*', { count: 'exact', head: true }).or(`target_user_id.eq.${user.id},device_id.in.(${deviceIds.join(',')})`)
        : supabase.from('scans').select('*', { count: 'exact', head: true }).eq('target_user_id', user.id)
    ])

    return (
      <div className="space-y-6">
        {/* Banner de Giro */}
        <IndustrySwitcher currentIndustry={userIndustry} variant="banner" />

        {/* Vista Dedicada para Clientes de Placas NFC de Reseñas */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                  ¡Hola{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
                </h1>
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[10px] sm:text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-black text-black" /> PLACA DE RESEÑAS PRO (1 AÑO)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                Panel exclusivo de control para tu placa física NFC de Google Reviews y Escudo Anti-Quejas.
              </p>
            </div>

            {primaryDevice?.tag_id && (
              <a
                href={`/r/${primaryDevice.tag_id}`}
                target="_blank"
                rel="noreferrer"
                className="bg-black text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-gray-800 transition shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <span>Probar mi Placa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Estado de la Placa (1 Año Garantizado) y Suite Extendida PRO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Caja 1: Tu Producto Físico (1 Año Garantizado) */}
            <div className="p-4 rounded-2xl border text-xs bg-amber-50/90 border-amber-200/80 text-amber-950 flex flex-col justify-between">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-xs font-black">
                  <Star className="w-4 h-4 fill-black text-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900">
                      Placa Tap-to-Rate NFC Activa
                    </span>
                    <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                      1 Año Garantizado
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 mt-1 font-medium">
                    ✓ Reseñas de Google, Escudo Anti-Quejas, Buzón Privado y Perfil Google Maps activos por <b>{daysLeft} días restantes</b> sin mensualidades obligatorias.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                <span className="text-amber-800 font-semibold">Vence: {expiresAt ? new Date(expiresAt).toLocaleDateString('es-HN', { day: 'numeric', month: 'long', year: 'numeric' }) : '1 Año'}</span>
                <span className="font-bold text-amber-900">Servicio Anual Activo</span>
              </div>
            </div>

            {/* Caja 2: Suite Extendida PRO (Software Opcional) */}
            <div className={`p-4 rounded-2xl border text-xs flex flex-col justify-between ${
              planInfo.isMonthlyPro
                ? 'bg-purple-50/90 border-purple-200 text-purple-950'
                : planInfo.isTrial
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                : 'bg-gray-50 border-gray-200 text-gray-800'
            }`}>
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-white ${
                  planInfo.isMonthlyPro ? 'bg-purple-600' : planInfo.isTrial ? 'bg-emerald-600' : 'bg-gray-700'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900">
                      Suite Extendida de Negocio
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      planInfo.isMonthlyPro 
                        ? 'bg-purple-200 text-purple-900' 
                        : planInfo.isTrial 
                        ? 'bg-emerald-200 text-emerald-900' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {planInfo.isMonthlyPro ? 'PRO Mensual' : planInfo.isTrial ? `Mes Cortesía (${planInfo.trialDaysLeft}d)` : 'Opcional'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 mt-1 font-medium">
                    {planInfo.isMonthlyPro
                      ? 'Todas las herramientas activas: Menús con pedidos WhatsApp, Ruleta de premios, Sellos de fidelización y Agendas.'
                      : planInfo.isTrial
                      ? `🎁 Tu compra incluye 1 mes de cortesía (${planInfo.trialDaysLeft} días restantes) para probar Menús, Ruleta, Sellos y Citas.`
                      : 'Herramientas avanzadas opcionales (Menús, Ruleta de premios, Sellos de fidelización). Actívalas cuando quieras.'}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-gray-600">
                  {planInfo.isMonthlyPro ? 'Renovación mensual activa' : planInfo.isTrial ? 'Incluido de cortesía' : 'L. 550 HNL / mes voluntario'}
                </span>
                <Link
                  href="/dashboard/billing#metodos-pago"
                  className="font-extrabold text-black hover:underline flex items-center gap-1"
                >
                  {planInfo.isMonthlyPro ? 'Ver suscripción' : 'Ver opciones'} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* KPIs Principales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Escaneos Totales</span>
                <span className="text-2xl font-black text-gray-900 mt-1 block">{scansCount || 0}</span>
                <span className="text-[10px] text-gray-500">Toques NFC y escaneos QR</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Escudo Anti-Quejas</span>
                <span className="text-lg font-black text-emerald-700 mt-1 block">
                  {primaryDevice?.review_filter_enabled !== false ? 'PROTEGIDO 5★' : 'INACTIVO'}
                </span>
                <span className="text-[10px] text-gray-500">4-5★ a Google • 1-3★ a buzón</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Quejas Privadas</span>
                <span className="text-2xl font-black text-red-600 mt-1 block">{feedbackCount || 0}</span>
                <span className="text-[10px] text-gray-500">Inconformidades recibidas</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Accesos Directos Exclusivos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/devices"
              className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-amber-50 text-amber-600 border border-amber-200 shadow-xs rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Star className="w-6 h-6 fill-amber-500" />
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-1">Mi Placa de Reseñas</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {primaryDevice?.business_name ? primaryDevice.business_name : 'Ver datos de tu negocio en Google Maps, probar tu enlace y ajustar el Escudo.'}
                </p>
              </div>
              <span className="mt-4 text-xs font-bold text-black inline-flex items-center gap-1 group-hover:underline">
                Gestionar Placa <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              href="/dashboard/feedback"
              className="group p-5 border border-red-100/80 rounded-2xl bg-red-50/30 hover:bg-red-50/60 hover:border-red-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-red-50 text-red-600 border border-red-200 shadow-xs rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base text-gray-900">Buzón de Quejas Privadas</h3>
                  {(feedbackCount || 0) > 0 && (
                    <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full">
                      {feedbackCount}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Clientes insatisfechos capturados por el Escudo. Contáctalos directamente por WhatsApp para resolver su caso.
                </p>
              </div>
              <span className="mt-4 text-xs font-bold text-red-700 inline-flex items-center gap-1 group-hover:underline">
                Abrir Buzón ({feedbackCount || 0}) <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              href="/dashboard/analytics"
              className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 border border-blue-200 shadow-xs rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-1">Métricas de Escaneos</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Revisa en tiempo real cuántas personas tocan tu placa NFC y qué dispositivos utilizan.
                </p>
              </div>
              <span className="mt-4 text-xs font-bold text-blue-700 inline-flex items-center gap-1 group-hover:underline">
                Ver Métricas <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          <div className="pt-2">
            <BusinessUpgradesShowcase currentAccountType="review_plate" />
          </div>
        </div>
      </div>
    )
  }

  // 2. Obtener dispositivos del usuario para verificar quejas pendientes
  const { data: userDevices } = await supabase
    .from('devices')
    .select('id')
    .eq('user_id', user.id)

  const userDeviceIds = userDevices?.map(d => d.id) || []

  // Obtener conteos básicos y conteos específicos según industria
  const [
    { count: devicesCount }, 
    { count: leadsCount },
    { count: menusCount },
    { count: vcardsCount },
    { count: feedbackCount }
  ] = await Promise.all([
    supabase.from('devices').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('leads').select('*, vcards!inner(user_id)', { count: 'exact', head: true }).eq('vcards.user_id', user.id),
    supabase.from('menus').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('vcards').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    userDeviceIds.length > 0 
      ? supabase.from('private_feedbacks').select('*', { count: 'exact', head: true }).in('device_id', userDeviceIds)
      : Promise.resolve({ count: 0 })
  ])

  // Conteos adicionales contextuales
  let contextualCount1 = { label: 'Dispositivos NFC', value: devicesCount || 0, sub: 'Placas o QRs activos' }
  let contextualCount2 = { label: 'Contactos CRM', value: leadsCount || 0, sub: 'Leads capturados' }
  let contextualCount3 = { label: 'Menús / Catálogos', value: menusCount || 0, sub: 'Publicados' }
  let contextualCount4 = { label: 'Tarjetas vCard', value: vcardsCount || 0, sub: 'Perfiles digitales' }

  if (normalizedIndustry === 'restaurant') {
    contextualCount1 = { label: 'Menú Digital', value: menusCount || 0, sub: 'Cartas activas' }
    contextualCount2 = { label: 'Placas de Mesa', value: devicesCount || 0, sub: 'QRs / NFC en mesas' }
    contextualCount3 = { label: 'Base de Clientes', value: leadsCount || 0, sub: 'Comensales registrados' }
    contextualCount4 = { label: 'Tarjetas vCard', value: vcardsCount || 0, sub: 'Perfil de restaurante' }
  } else if (normalizedIndustry === 'beauty') {
    contextualCount1 = { label: 'Turnos & Citas', value: 0, sub: 'Agendas en línea' }
    contextualCount2 = { label: 'Reseñas & Espejos', value: devicesCount || 0, sub: 'Placas NFC activas' }
    contextualCount3 = { label: 'Clientela (CRM)', value: leadsCount || 0, sub: 'Contactos guardados' }
    contextualCount4 = { label: 'vCards Salón', value: vcardsCount || 0, sub: 'Perfiles de estilistas' }
  } else if (normalizedIndustry === 'health') {
    contextualCount1 = { label: 'Expedientes (ECE)', value: 0, sub: 'Pacientes registrados' }
    contextualCount2 = { label: 'Placas de Recepción', value: devicesCount || 0, sub: 'Reseñas profesionales' }
    contextualCount3 = { label: 'Directorio Pacientes', value: leadsCount || 0, sub: 'Consultas capturadas' }
    contextualCount4 = { label: 'vCard Médico', value: vcardsCount || 0, sub: 'Perfil profesional' }
  } else if (normalizedIndustry === 'retail') {
    contextualCount1 = { label: 'Catálogos Activos', value: menusCount || 0, sub: 'Listas de productos' }
    contextualCount2 = { label: 'Placas en Caja', value: devicesCount || 0, sub: 'NFC de cobro' }
    contextualCount3 = { label: 'Compradores (CRM)', value: leadsCount || 0, sub: 'Contactos registrados' }
    contextualCount4 = { label: 'vCard Comercial', value: vcardsCount || 0, sub: 'Tarjetas digitales' }
  } else if (normalizedIndustry === 'professional') {
    contextualCount1 = { label: 'vCard Digital', value: vcardsCount || 0, sub: 'Perfil activo' }
    contextualCount2 = { label: 'Leads Cualificados', value: leadsCount || 0, sub: 'Prospectos en CRM' }
    contextualCount3 = { label: 'Placas / NFC', value: devicesCount || 0, sub: 'Oficina y networking' }
    contextualCount4 = { label: 'Herramientas', value: 6, sub: 'Módulos activos' }
  }

  return (
    <div className="space-y-6">
      {/* 1. SELECTOR / BANNER INTERACTIVO DE GIRO DE NEGOCIO */}
      <IndustrySwitcher currentIndustry={userIndustry} variant="banner" />

      {/* 2. TARJETA DE BIENVENIDA Y ESTADO DEL PLAN */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                ¡Hola{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
              </h1>
              {isHardwareActive && hasNfcCard ? (
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                  <CreditCard className="w-3.5 h-3.5" /> TARJETA NFC PRO ({hardwareDaysLeft} {hardwareDaysLeft === 1 ? 'DÍA' : 'DÍAS'})
                </span>
              ) : isPro ? (
                isTrial ? (
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-200" /> PRUEBA GRATUITA ({daysLeft} {daysLeft === 1 ? 'DÍA' : 'DÍAS'})
                  </span>
                ) : (
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> PLAN PRO ILIMITADO
                  </span>
                )
              ) : (
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-gray-200">
                  Plan Básico ($0)
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Bienvenido a tu suite digital para <b>{industryConfig.name}</b>, <span className="font-semibold text-gray-800">{user.email}</span>.
              {isHardwareActive && hasNfcCard
                ? ' Tu tarjeta inteligente física NFC y perfil digital cuentan con membresía anual activa.'
                : isTrial
                ? ` Tienes ${daysLeft} días de prueba con todas las herramientas de ${industryConfig.shortName} desbloqueadas.`
                : ''}
            </p>
          </div>

          {hasNfcCard && isHardwareActive ? (
            <Link
              href="/dashboard/vcard"
              className="bg-black text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-gray-800 transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>Ver mi vCard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : !isPro && isDiscountEligible ? (
            <Link
              href="/dashboard/billing#metodos-pago"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>50% OFF: Primer mes por L. 275</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : !isPro ? (
            <Link
              href="/dashboard/billing#metodos-pago"
              className="bg-black text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-gray-800 transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{accountType === 'professional' ? 'Obtener Tarjeta NFC PRO (L. 1,200)' : 'Mejorar a PRO por L. 550'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : null}
        </div>

        {/* 2 CAJAS CLARAS: HARDWARE (1 AÑO GARANTIZADO) Y SUITE EXTENDIDA PRO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Caja A: Hardware Físico (1 Año Garantizado) */}
          <div className="p-4 rounded-2xl border text-xs bg-linear-to-r from-blue-50/90 to-indigo-50/80 border-blue-200 text-blue-950 flex flex-col justify-between shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs font-black">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-gray-900">
                    {hasNfcCard ? 'Tarjeta Física Inteligente NFC' : 'Dispositivo NFC / vCard'}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                    isHardwareActive ? 'bg-blue-200 text-blue-950' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {isHardwareActive ? '✓ 1 Año Garantizado' : 'Básico ($0)'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1 font-medium">
                  {isHardwareActive
                    ? `✓ Tu tarjeta NFC, perfil vCard, CRM de contactos y estadísticas están cubiertos por ${hardwareDaysLeft} días restantes sin mensualidades obligatorias.`
                    : 'Dispones de vCard básica digital. Adquiere tu Tarjeta Inteligente NFC con chip para activar 1 año completo de servicio sin pagos mensuales.'}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-blue-200/60 flex items-center justify-between text-[11px]">
              <span className="text-gray-500 font-semibold">
                {isHardwareActive
                  ? `Vence: ${hardwareExpiresAt ? new Date(hardwareExpiresAt).toLocaleDateString('es-HN', { day: 'numeric', month: 'long', year: 'numeric' }) : '1 Año'}`
                  : 'Sin tarjeta NFC física'}
              </span>
              <Link
                href={hasNfcCard ? "/dashboard/vcard" : "/dashboard/billing#metodos-pago"}
                className="font-extrabold text-blue-700 hover:underline flex items-center gap-1"
              >
                {hasNfcCard ? 'Ver mi vCard' : 'Pedir Tarjeta (L. 1,200)'} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Caja B: Suite Extendida PRO (Software Opcional o Mes de Cortesía) */}
          <div className={`p-4 rounded-2xl border text-xs flex flex-col justify-between shadow-2xs ${
            planInfo.isMonthlyPro
              ? 'bg-purple-50/90 border-purple-200 text-purple-950'
              : planInfo.isTrial
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
              : 'bg-gray-50 border-gray-200 text-gray-800'
          }`}>
            <div className="flex items-start gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-white ${
                planInfo.isMonthlyPro ? 'bg-purple-600' : planInfo.isTrial ? 'bg-emerald-600' : 'bg-gray-700'
              }`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-gray-900">
                    Suite Extendida de Negocio ({industryConfig.shortName})
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                    planInfo.isMonthlyPro
                      ? 'bg-purple-200 text-purple-900'
                      : planInfo.isTrial
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {planInfo.isMonthlyPro ? 'PRO Mensual' : planInfo.isTrial ? `Mes Cortesía (${planInfo.trialDaysLeft}d)` : 'Opcional'}
                  </span>
                </div>
                <p className="text-[11px] opacity-90 mt-1 font-medium">
                  {planInfo.isMonthlyPro
                    ? 'Acceso total: Menús/Catálogos con WhatsApp, Agendas de turnos, Ruleta de premios y Club de Fidelización.'
                    : planInfo.isTrial
                    ? `🎁 Cortesía de tu compra de hardware: Tienes ${planInfo.trialDaysLeft} días de prueba para usar todas las herramientas avanzadas.`
                    : `Desbloquea Menús digitales, Agendas de citas, Ruleta interactiva y Sellos digitales para tu ${industryConfig.shortName.toLowerCase()}.`}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-gray-500">
                {planInfo.isMonthlyPro 
                  ? `Vence: ${expiresAt ? new Date(expiresAt).toLocaleDateString('es-HN') : 'Activo'}` 
                  : planInfo.isTrial 
                  ? 'Mes de cortesía incluido' 
                  : 'L. 550 HNL / mes voluntario'}
              </span>
              <Link
                href="/dashboard/billing#metodos-pago"
                className="font-extrabold text-black hover:underline flex items-center gap-1"
              >
                {planInfo.isMonthlyPro ? 'Gestionar' : planInfo.isTrial ? 'Ver detalles' : 'Activar por L. 550'} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* AVISO DE PLAN EXPIRADO */}
        {isExpired && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs flex items-center justify-between text-red-950">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="font-bold">Tu periodo de prueba ha finalizado</p>
                <p className="text-[11px] opacity-80">Renueva tu suscripción para mantener todas tus herramientas de {industryConfig.shortName} activas.</p>
              </div>
            </div>
            <Link
              href="/dashboard/billing#metodos-pago"
              className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs shrink-0 hover:bg-red-700 transition"
            >
              Reactivar PRO →
            </Link>
          </div>
        )}

        {/* AVISO DE QUEJAS PRIVADAS PENDIENTES */}
        {(feedbackCount || 0) > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-950">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="font-extrabold text-sm text-red-900">
                  Tienes {feedbackCount} {feedbackCount === 1 ? 'queja privada pendiente' : 'quejas privadas pendientes'}
                </p>
                <p className="text-[11px] text-red-800/90 mt-0.5">
                  Clientes que calificaron con 1-3 estrellas capturados por tu Escudo. Contáctalos directamente para solucionar su caso antes de que califiquen en Google Maps.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/feedback"
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shrink-0 transition shadow-2xs"
            >
              Revisar Buzón ({feedbackCount}) →
            </Link>
          </div>
        )}

        {/* 3. KPIS ADAPTADOS AL GIRO DEL NEGOCIO */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="p-3.5 sm:p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">{contextualCount1.label}</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 my-1">{contextualCount1.value}</span>
            <span className="text-[10px] text-gray-500">{contextualCount1.sub}</span>
          </div>

          <div className="p-3.5 sm:p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">{contextualCount2.label}</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 my-1">{contextualCount2.value}</span>
            <span className="text-[10px] text-gray-500">{contextualCount2.sub}</span>
          </div>

          <div className="p-3.5 sm:p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">{contextualCount3.label}</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 my-1">{contextualCount3.value}</span>
            <span className="text-[10px] text-gray-500">{contextualCount3.sub}</span>
          </div>

          <div className="p-3.5 sm:p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">{contextualCount4.label}</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 my-1">{contextualCount4.value}</span>
            <span className="text-[10px] text-gray-500">{contextualCount4.sub}</span>
          </div>
        </div>
        
        {/* 4. HERRAMIENTAS PRIORITARIAS PARA ESTE GIRO */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">
              Herramientas Clave para {isHardwareActive && hasNfcCard && !planInfo.canAccessProSuite ? 'tu Tarjeta NFC' : industryConfig.shortName}
            </h2>
            <p className="text-xs text-gray-500">
              {isHardwareActive && hasNfcCard && !planInfo.canAccessProSuite
                ? 'Gestiona tu tarjeta de presentación digital y contactos capturados.'
                : 'Funcionalidades recomendadas para potenciar tu operación diaria.'}
            </p>
          </div>
        </div>

        {(() => {
          const displayedCards = (!planInfo.canAccessProSuite && (hasNfcCard || accountType === 'professional'))
            ? [
                {
                  href: '/dashboard/vcard',
                  title: 'Mi vCard Digital',
                  description: 'Tu perfil interactivo para compartir tus datos con un toque de tu tarjeta NFC.',
                  actionText: 'Gestionar vCard',
                  icon: 'user',
                  badge: '1 Año Activo',
                  badgeColor: 'bg-blue-100 text-blue-800'
                },
                {
                  href: '/dashboard/leads',
                  title: 'Contactos & Leads (CRM)',
                  description: 'Personas que han guardado tu contacto o intercambiado datos desde tu tarjeta.',
                  actionText: 'Ver Contactos',
                  icon: 'users',
                  badge: 'CRM',
                  badgeColor: 'bg-emerald-100 text-emerald-800'
                },
                {
                  href: '/dashboard/analytics',
                  title: 'Métricas de Escaneos',
                  description: 'Revisa cuántas personas han tocado tu tarjeta física o visto tu perfil virtual.',
                  actionText: 'Ver Métricas',
                  icon: 'star',
                  badge: 'NFC',
                  badgeColor: 'bg-purple-100 text-purple-800'
                }
              ]
            : industryConfig.featuredCards

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCards.map((card) => {
                const Icon = cardIcons[card.icon] || Sparkles
                return (
                  <Link 
                    key={card.href}
                    href={card.href} 
                    className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-gray-900 mb-3 group-hover:scale-105 transition-transform border border-gray-100">
                        <Icon className="w-5 h-5" style={{ color: industryConfig.accentColor }} />
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">{card.title}</h3>
                        {card.badge && (
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded shrink-0 ${card.badgeColor || 'bg-gray-200 text-gray-800'}`}>
                            {card.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{card.description}</p>
                    </div>
                    <span className="mt-4 text-xs font-bold text-black inline-flex items-center gap-1 group-hover:underline">
                      {card.actionText} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                )
              })}
            </div>
          )
        })()}
      </div>

      {/* 5. SECCIÓN DE CONSEJOS ESTRATÉGICOS PARA EL GIRO */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl p-6 shadow-md border border-gray-800">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold">
            <Lightbulb className="w-4 h-4 fill-black" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">
              Estrategia de Crecimiento para {industryConfig.shortName}
            </h3>
            <p className="text-[11px] text-gray-400">
              Consejos prácticos para maximizar tus ingresos y fidelizar clientes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {industryConfig.tips.map((tip, index) => (
            <div key={index} className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 leading-relaxed">
              <span className="font-extrabold text-amber-300 block mb-1 text-[11px]">Tip #{index + 1}</span>
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* Vitrina de Mejoras para Cuentas Profesionales */}
      {accountType === 'professional' && (
        <BusinessUpgradesShowcase currentAccountType="professional" />
      )}
    </div>
  )
}
