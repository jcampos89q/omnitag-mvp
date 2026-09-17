export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserCircle, Smartphone, Coffee, Users, BarChart3, ArrowRight, Zap, Sparkles, Star, QrCode, Gift, Check, ShieldCheck, Clock, AlertTriangle, Scissors, Disc } from 'lucide-react'
import { getUserPlanInfo } from '@/lib/plans'
import BusinessUpgradesShowcase from '@/components/BusinessUpgradesShowcase'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    redirect('/login')
  }

  // 1. Obtener plan, contador de días restantes y privilegios del usuario
  const [{ isPro, isAdmin, expiresAt, daysLeft, isExpired, isTrial, isDiscountEligible, discountDaysLeft }, { data: profile }] = await Promise.all([
    getUserPlanInfo(supabase, user.id),
    supabase.from('users').select('full_name, account_type').eq('id', user.id).maybeSingle()
  ])

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
        ? supabase.from('scans').select('*', { count: 'exact', head: true }).in('device_id', deviceIds)
        : { count: 0 }
    ])

    return (
      <div className="space-y-6">
        {/* Vista Dedicada para Clientes de Placas NFC de Reseñas */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                  ¡Hola{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
                </h1>
                <span className="bg-linear-to-r from-amber-500 to-amber-600 text-black text-[10px] sm:text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
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

          {/* Estado de la Placa y Días de Suscripción */}
          <div className="mb-6 p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/80 border-amber-200 text-amber-950">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-extrabold text-sm">
                  {primaryDevice?.business_name ? primaryDevice.business_name : 'Placa Activa'} • {daysLeft} días de servicio restantes
                </p>
                <p className="text-[11px] text-amber-800/90 mt-0.5">
                  Tu placa cuenta con membresía anual activa. No requieres pagos mensuales adicionales.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-200/60 text-amber-900 rounded-lg shrink-0">
              Vence: {expiresAt ? new Date(expiresAt).toLocaleDateString() : '1 Año'}
            </span>
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
            {/* 1. Placa de Reseñas */}
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

            {/* 2. Quejas Privadas */}
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

            {/* 3. Métricas y Estadísticas */}
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
                  Revisa en tiempo real cuántas personas tocan tu placa NFC y qué dispositivos utilizan (iPhone vs Android).
                </p>
              </div>
              <span className="mt-4 text-xs font-bold text-blue-700 inline-flex items-center gap-1 group-hover:underline">
                Ver Métricas <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Vitrina de Marketing Digital y Beneficios de la Suite Empresarial */}
          <div className="pt-2">
            <BusinessUpgradesShowcase currentAccountType="review_plate" />
          </div>
        </div>
      </div>
    )
  }

  // 2. Obtener conteos básicos para KPIs rápidos (Usuarios generales y profesionales)
  const [
    { count: devicesCount }, 
    { count: leadsCount },
    { count: menusCount },
    { count: vcardsCount }
  ] = await Promise.all([
    supabase.from('devices').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('leads').select('*, vcards!inner(user_id)', { count: 'exact', head: true }).eq('vcards.user_id', user.id),
    supabase.from('menus').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('vcards').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  ])

  return (
    <div className="space-y-6">
      {/* 1. TARJETA DE BIENVENIDA Y ESTADO DEL PLAN */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                ¡Hola{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
              </h1>
              {isPro ? (
                isTrial ? (
                  <span className="bg-linear-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-200" /> PRUEBA GRATUITA ({daysLeft} {daysLeft === 1 ? 'DÍA' : 'DÍAS'})
                  </span>
                ) : (
                  <span className="bg-linear-to-r from-purple-600 to-indigo-600 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
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
              Bienvenido a tu suite digital de OmniTag, <span className="font-semibold text-gray-800">{user.email}</span>.
              {isTrial && ' Estás disfrutando de 10 días de prueba gratuita con acceso total a todas las herramientas.'}
            </p>
          </div>

          {!isPro && isDiscountEligible ? (
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

        {/* CONTADOR DE TIEMPO / ESTADO MENSUAL PRO O PRUEBA */}
        {isPro && !isAdmin && expiresAt && (
          <div className={`mb-6 p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isTrial 
              ? 'bg-amber-50/90 border-amber-200 text-amber-950'
              : daysLeft <= 5 
              ? 'bg-amber-50 border-amber-200 text-amber-950' 
              : 'bg-purple-50/80 border-purple-200 text-purple-950'
          }`}>
            <div className="flex items-center gap-2.5">
              <Clock className={`w-5 h-5 shrink-0 ${isTrial || daysLeft <= 5 ? 'text-amber-600' : 'text-purple-600'}`} />
              <div>
                <p className="font-extrabold text-sm">
                  {isTrial 
                    ? `Periodo de Prueba Activo: ${daysLeft} ${daysLeft === 1 ? 'día restante' : 'días restantes'} con herramientas completas`
                    : daysLeft > 0 
                    ? `Suscripción Activa: ${daysLeft} ${daysLeft === 1 ? 'día restante' : 'días restantes'}`
                    : 'Suscripción por vencer hoy'}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {isTrial 
                    ? `Tu prueba gratuita de 10 días concluye el ${new Date(expiresAt).toLocaleDateString('es-HN', { day: 'numeric', month: 'long', year: 'numeric' })}. ${isDiscountEligible ? `¡Aprovecha el 50% de descuento (L. 275) durante tus primeros 3 días!` : ''}`
                    : `Vence el ${new Date(expiresAt).toLocaleDateString('es-HN', { day: 'numeric', month: 'long', year: 'numeric' })}. Se renueva con tu pago mensual por depósito o transferencia BAC.`}
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/billing#metodos-pago"
              className="bg-black text-white font-bold px-3.5 py-2 rounded-xl text-xs shrink-0 hover:bg-gray-800 transition shadow-2xs"
            >
              {isTrial && isDiscountEligible ? 'Aprovechar 50% OFF (L. 275) →' : 'Detalles de Suscripción BAC →'}
            </Link>
          </div>
        )}

        {/* AVISO DE PLAN EXPIRADO */}
        {isExpired && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs flex items-center justify-between text-red-950">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="font-bold">Tu periodo de prueba de 10 días ha finalizado</p>
                <p className="text-[11px] opacity-80">Realiza tu depósito o transferencia por BAC para mantener todas las herramientas PRO activas.</p>
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
        
        {/* 2. ACCESOS RÁPIDOS A LAS HERRAMIENTAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* vCard */}
          <Link 
            href="/dashboard/vcard" 
            className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-blue-600 mb-3 group-hover:scale-105 transition-transform">
                <UserCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-1">Mi vCard Digital</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Tu tarjeta de presentación virtual interactiva para guardar contactos en la agenda.</p>
            </div>
            <span className="mt-4 text-xs font-bold text-black inline-flex items-center gap-1 group-hover:underline">
              Gestionar vCard <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Estudio QR */}
          {accountType !== 'professional' && (
            <Link 
              href="/dashboard/qr-studio" 
              className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-purple-600 mb-3 group-hover:scale-105 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-bold text-base text-gray-900">Estudio QR (Impresión)</h3>
                  <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded">HD</span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">Diseña códigos QR con degradados estilo Instagram, tu logo central y marcos para imprenta.</p>
              </div>
              <span className="mt-4 text-xs font-bold text-purple-700 inline-flex items-center gap-1 group-hover:underline">
                Diseñar e Imprimir <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          )}

          {/* Reseñas Google & NFC */}
          {accountType !== 'professional' && (
            <Link 
              href="/dashboard/devices" 
              className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-amber-500 mb-3 group-hover:scale-105 transition-transform">
                  <Star className="w-6 h-6 fill-amber-400" />
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-1">Reseñas Google & NFC</h3>
                <p className="text-gray-500 text-xs leading-relaxed">Placas Tap-to-Rate con Escudo Anti-Quejas para multiplicar tus 5 estrellas en Google Maps.</p>
              </div>
              <span className="mt-4 text-xs font-bold text-black inline-flex items-center gap-1 group-hover:underline">
                Configurar Placas ({devicesCount || 0}) <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          )}

          {/* Menú Digital */}
          {accountType !== 'professional' && (
            <Link 
              href="/dashboard/menus" 
              className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-amber-600 mb-3 group-hover:scale-105 transition-transform">
                  <Coffee className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-1">Menú & Catálogo</h3>
                <p className="text-gray-500 text-xs leading-relaxed">Catálogo con fotos, categorías, precios y botón para recibir pedidos directos a WhatsApp.</p>
              </div>
              <span className="mt-4 text-xs font-bold text-black inline-flex items-center gap-1 group-hover:underline">
                Gestionar Menú <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          )}

          {/* Fidelización & Sellos */}
          {accountType !== 'professional' && (
            <Link 
              href="/dashboard/loyalty" 
              className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-purple-600 mb-3 group-hover:scale-105 transition-transform">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-1">Fidelización & Sellos</h3>
                <p className="text-gray-500 text-xs leading-relaxed">Tarjeta de sellos digitales para premiar a clientes frecuentes y aumentar visitas repetidas.</p>
              </div>
              <span className="mt-4 text-xs font-bold text-black inline-flex items-center gap-1 group-hover:underline">
                Club de Premios <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          )}

          {/* Agendas & Citas (Barberías / Salones) */}
          {accountType !== 'professional' && (
            <Link 
              href="/dashboard/appointments" 
              className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-purple-600 mb-3 group-hover:scale-105 transition-transform">
                  <Scissors className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-bold text-base text-gray-900">Agendas & Citas</h3>
                  <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded">NUEVO</span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">Reserva de turnos para Barberías, Salones y Spas con selección y calificación de especialistas.</p>
              </div>
              <span className="mt-4 text-xs font-bold text-purple-700 inline-flex items-center gap-1 group-hover:underline">
                Gestionar Agenda <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          )}

          {/* Ruleta de Premios & Gamificación */}
          {accountType !== 'professional' && (
            <Link 
              href="/dashboard/ruleta" 
              className="group p-5 border border-amber-200/80 rounded-2xl bg-amber-50/40 hover:bg-amber-50 hover:border-amber-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-amber-600 mb-3 group-hover:scale-105 transition-transform">
                  <Disc className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-bold text-base text-gray-900">Ruleta de Premios</h3>
                  <span className="text-[9px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.2 rounded">VIP</span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">Gamificación para mesas y clientes con control de probabilidades, stock anti-sobregiros y cupones de fidelización.</p>
              </div>
              <span className="mt-4 text-xs font-bold text-amber-700 inline-flex items-center gap-1 group-hover:underline">
                Gestionar Ruleta <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          )}

          {/* Contactos CRM */}
          <Link 
            href="/dashboard/leads" 
            className="group p-5 border border-gray-100 rounded-2xl bg-gray-50/70 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-white shadow-xs rounded-xl flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-1">Contactos & CRM</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Base de datos de personas que intercambiaron datos contigo o se registraron en tus tarjetas.</p>
            </div>
            <span className="mt-4 text-xs font-bold text-black inline-flex items-center gap-1 group-hover:underline">
              Ver Contactos ({leadsCount || 0}) <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* Vitrina de Aplicaciones de Marketing Digital para Cuentas Profesionales */}
      {accountType === 'professional' && (
        <BusinessUpgradesShowcase currentAccountType="professional" />
      )}
    </div>
  )
}
