import Link from 'next/link'
import Image from 'next/image'
import { 
  Smartphone, 
  Star, 
  Coffee, 
  Scissors, 
  Gift, 
  Users, 
  QrCode, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Calendar, 
  MessageCircle, 
  Lock, 
  Sparkles,
  ChevronRight, 
  Clock, 
  Layers, 
  Palette, 
  RefreshCw, 
  Download, 
  Wifi, 
  Tag, 
  Check, 
  CreditCard,
  UtensilsCrossed,
  MapPin,
  TrendingUp,
  Truck,
  HeartHandshake
} from 'lucide-react'
import LandingNavbar from '@/components/LandingNavbar'
import InteractiveHeroShowcase from '@/components/InteractiveHeroShowcase'
import LandingFaq from '@/components/LandingFaq'

export default function LandingPage() {
  const industries = [
    { name: 'Restaurantes & Bares', emoji: '🍽️', desc: 'Menú digital con turnos activos, platos del día y pedidos por mesa a WhatsApp.' },
    { name: 'Barberías & Salones', emoji: '💈', desc: 'Reservas online 24/7 con selección de especialista y portal móvil para colaboradores.' },
    { name: 'Spas & Estética', emoji: '💆‍♀️', desc: 'Catálogo de servicios, control de tiempos extra y opiniones privadas.' },
    { name: 'Clínicas & Médicos', emoji: '🩺', desc: 'Agendas ordenadas, perfil profesional y reseñas de pacientes verificadas en Google.' },
    { name: 'Profesionales & Negocios', emoji: '💼', desc: 'vCards NFC, intercambio de contactos y captura de prospectos permanente.' }
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-black selection:text-white font-sans antialiased">
      {/* 0. CINTILLO SUPERIOR DE OFERTA */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-emerald-700 text-white py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
        <span className="bg-yellow-400 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">
          PROMO DE LANZAMIENTO
        </span>
        <span className="truncate sm:overflow-visible sm:whitespace-normal">
          🎁 <b>10 Días de Prueba Gratis PRO</b> (Sin tarjeta) • <b>50% de Descuento (L. 275 / $10)</b> si activas tu plan en tus primeros 3 días.
        </span>
        <Link 
          href="/register" 
          className="hidden sm:inline-flex items-center gap-1 underline font-black text-yellow-300 hover:text-white transition ml-1 shrink-0"
        >
          <span>Activar cuenta gratis</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 1. NAVEGACIÓN PRINCIPAL */}
      <LandingNavbar />

      {/* 2. HERO SECTION */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-10 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 border-b border-gray-100 bg-gradient-to-b from-white via-gray-50/50 to-white">
          {/* Fondo decorativo con gradientes suaves */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] bg-gradient-to-tr from-purple-100/40 via-blue-50/50 to-amber-50/40 rounded-full blur-3xl opacity-80" />
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-current animate-pulse" />
              <span>PLATAFORMA TODO-EN-UNO PARA NEGOCIOS FÍSICOS • 10 DÍAS GRATIS</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-950 leading-[1.08]">
              Tu negocio en el mundo físico, <br />
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                conectado al mundo digital.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Todo lo que necesitas para vender más y fidelizar clientes: <b>Menús con turnos activos y comandas por mesa a WhatsApp</b>, <b>Agendas de citas 24/7 con especialistas</b>, <b>Escudo de reseñas de Google Maps</b> y <b>Tarjetas de sellos digitales</b> sin descargar aplicaciones.
            </p>

            {/* Botones de Acción */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
              <Link 
                href="/register" 
                className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl font-black text-sm sm:text-base hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl cursor-pointer"
              >
                <span>Comenzar 10 Días Gratis PRO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/tienda" 
                className="w-full sm:w-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-6 py-4 rounded-2xl font-black text-sm sm:text-base transition flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>Tienda NFC & Placas</span>
              </Link>
              <a 
                href="#precios" 
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-4 rounded-2xl font-bold text-sm sm:text-base transition text-center"
              >
                Ver Precios
              </a>
            </div>

            {/* Badges de Garantía y Beneficios */}
            <div className="pt-1 flex flex-wrap items-center justify-center gap-y-2 gap-x-4 text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <b>10 días</b> de prueba con todo desbloqueado
              </span>
              <span className="flex items-center gap-1.5 text-gray-700">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                Sin tarjeta de crédito requerida
              </span>
              <span className="flex items-center gap-1.5 text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                <Tag className="w-3.5 h-3.5 text-purple-600" />
                50% OFF (L. 275) los primeros 3 días
              </span>
            </div>

            {/* MOCKUP INTERACTIVO EN VIVO: DEMOSTRACIÓN DE LA EXPERIENCIA DEL CLIENTE */}
            <div className="pt-6">
              <InteractiveHeroShowcase />
            </div>
          </div>
        </section>

        {/* 2.5 SECTORES & ADAPTABILIDAD */}
        <section className="py-12 bg-white border-b border-gray-100 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                ADAPTADO A LA MEDIDA DE TU COMERCIO
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                Diseñado para operar en cualquier sector sin complicaciones
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {industries.map((ind, i) => (
                <div key={i} className="bg-gray-50/70 hover:bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs transition hover:shadow-md space-y-1.5 text-center sm:text-left">
                  <div className="text-2xl mb-1">{ind.emoji}</div>
                  <h3 className="font-extrabold text-sm text-gray-900">{ind.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{ind.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. MÓDULOS PRINCIPALES DEL ECOSISTEMA */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Ecosistema Integral
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
              Todas las herramientas para vender, atender y fidelizar
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              Cada módulo funciona de manera autónoma o sincronizada en tiempo real para que tus clientes vivan una experiencia moderna y sin fricción.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* CARD 1: RESTAURANTES & MENÚS INTELIGENTES */}
            <div id="restaurantes" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xl shadow-xs">
                    🍽️
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Restaurantes & Bares
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-amber-900 transition">
                    Menús Digitales con Turno Activo & Comandas
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    Digitaliza tu carta gastronómica con fotos HD. El cliente ve automáticamente el menú del turno actual (Desayunos, Almuerzos o Cenas) y pide a WhatsApp con su número de mesa.
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-gray-100">
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Turnos Activos Automáticos:</b> Muestra el menú del momento y oculta platos fuera de hora.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Plato del Día Único:</b> Sección especial que cambia a diario y no se repite en la semana.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Comandas por Mesa (#Mesa QR):</b> Pedidos estructurados a tu WhatsApp y comandera en cocina.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Ruleta & Raspa y Gana en Mesa:</b> Gamificación con premios y cortesías para cautivar comensales.</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-900 hover:text-amber-700 transition"
                >
                  <span>Crear menú para mi restaurante</span>
                  <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* CARD 2: CITAS & AGENDAS */}
            <div id="citas" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-purple-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xl shadow-xs">
                    💈
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                    Salones & Spas
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-purple-900 transition">
                    Agendas & Reservas con Especialistas 24/7
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    Permite a tus clientes reservar turnos online las 24 horas del día. Asignación inteligente de barberos o estilistas, portal móvil con PIN y bloqueo de horarios automático.
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-gray-100">
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Reserva por Especialista:</b> Horarios sincronizados en vivo por barbero o terapeuta.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Portal Móvil para Colaboradores:</b> Acceso personal protegido con PIN de 4 dígitos.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Control de Tiempo Extra:</b> Extiende servicios en vivo (+15m, +30m) para evitar choques de turnos.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Confirmación Instantánea:</b> Avisos automáticos directos a WhatsApp.</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-900 hover:text-purple-700 transition"
                >
                  <span>Activar agenda para mi salón</span>
                  <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* CARD 3: RESEÑAS GOOGLE & ESCUDO */}
            <div id="reputacion" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-yellow-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-700 flex items-center justify-center font-black text-xl shadow-xs">
                    ⭐
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-900 border border-yellow-300">
                    Google Maps
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-yellow-900 transition">
                    Reseñas Google & Escudo Antirreclamos
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    Multiplica las opiniones de 5 estrellas en tu perfil de Google Maps con tecnología Tap-to-Rate NFC & QR, desviando quejas a un buzón privado para resolverlas antes de que dañen tu imagen.
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-gray-100">
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Tap-to-Rate NFC & QR:</b> El cliente califica acercando su smartphone al mostrador.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Filtro Inteligente:</b> 5★ van directo a Google; 1-3★ van al buzón confidencial de gerencia.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Mejora tu Posición Local:</b> Atrae clientes que buscan negocios cercanos en Google.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Placas Físicas en PVC:</b> Disponibles en la tienda oficial con 1 año PRO incluido.</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-yellow-950 hover:text-yellow-700 transition"
                >
                  <span>Blindar mi reputación en Google</span>
                  <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* CARD 4: FIDELIZACIÓN & SELLOS DIGITALES */}
            <div id="fidelizacion" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl shadow-xs">
                    🎁
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Fidelización
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-emerald-900 transition">
                    Club de Sellos & Recompensas Digitales
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    Sustituye las tarjetas de cartón que se pierden o arrugan por una tarjeta de fidelización digital en el smartphone de tu cliente con sellos acumulativos por visita y validación con PIN.
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-gray-100">
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Sin Descargar Apps:</b> Funciona al instante en cualquier teléfono con QR o NFC.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Sellado Rápido con PIN:</b> El cajero o colaborador valida el sello en 2 segundos.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Premios Configurables:</b> Define el número de visitas y el beneficio (ej. 8º café gratis).</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Clientes Recurrentes:</b> Multiplica las visitas repetidas a tu establecimiento.</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-900 hover:text-emerald-700 transition"
                >
                  <span>Crear mi club de sellos digital</span>
                  <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* CARD 5: VCARDS & CRM */}
            <div id="vcards" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-blue-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl shadow-xs">
                    💼
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    vCards & CRM
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-blue-900 transition">
                    vCards NFC Profesionales & CRM Permanente
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    Comparte tu tarjeta de presentación profesional, catálogo, redes sociales y formas de pago con un toque NFC. Los contactos que interactúan quedan guardados en tu base de datos CRM.
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-gray-100">
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Guardado Directo en Agenda:</b> Descarga de contacto (.vcf) al móvil en un solo clic.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Captura Bidireccional:</b> Pide los datos de la otra persona para hacer seguimiento.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>CRM Permanente Centralizado:</b> Exporta contactos a Excel para campañas de WhatsApp.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Tarjetas Físicas Matte Black:</b> Disponibles con envío a domicilio.</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-900 hover:text-blue-700 transition"
                >
                  <span>Diseñar mi vCard profesional</span>
                  <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* CARD 6: ESTUDIO QR DINÁMICO & WI-FI */}
            <div id="estudio-qr" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-pink-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center font-black text-xl shadow-xs">
                    🎨
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-50 text-pink-800 border border-pink-200">
                    Diseño & Wi-Fi
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-pink-900 transition">
                    Estudio QR Dinámico & Autoconexión Wi-Fi
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    Crea códigos QR con degradados estilo Instagram, puntos redondeados, tu logo oficial y marcos para mostradores. Además, conecta a tus clientes al Wi-Fi sin dictar contraseñas.
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-gray-100">
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>QRs 100% Dinámicos:</b> Cambia el menú o destino cuando quieras sin reimprimir papel.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Conexión Wi-Fi Instantánea:</b> Conexión rápida por escaneo QR o toque NFC en mesa.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Diseños VIP con tu Logotipo:</b> Degradados modernos y esquinas redondeadas.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Descargas en Ultra HD & SVG:</b> Archivos vectoriales listos para imprenta y acrílicos.</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-pink-900 hover:text-pink-700 transition"
                >
                  <span>Generar QRs exclusivos</span>
                  <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HARDWARE FÍSICO NFC & TIENDA OFICIAL */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-950 via-slate-900 to-black text-white px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl text-center lg:text-left">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                  Dispositivos Físicos Contactless
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  Equipa tu local con Placas & Tarjetas Inteligentes NFC
                </h2>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-medium">
                  Lleva tu negocio al siguiente nivel físico con dispositivos de alta gama. Placas para mesas y mostradores en vinil sobre PVC altamente resistente y tarjetas de presentación Matte Black con chip NFC integrado.
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-bold text-gray-300">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Truck className="w-4 h-4" />
                    <span>Envíos a toda Honduras</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-yellow-300">
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Incluyen 1 Año Completo PRO</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:max-w-md">
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/15 space-y-3">
                  <div className="text-2xl">💳</div>
                  <h4 className="font-extrabold text-base text-white">Tarjeta NFC Matte Black</h4>
                  <p className="text-xs text-gray-300">Para ejecutivos y profesionales. Comparte tu vCard con un toque.</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-black text-yellow-300">L. 1,200 HNL</span>
                    <Link href="/tienda" className="text-xs font-black bg-white text-black px-3 py-1.5 rounded-xl hover:bg-gray-200 transition">
                      Ver en Tienda
                    </Link>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/15 space-y-3">
                  <div className="text-2xl">⭐</div>
                  <h4 className="font-extrabold text-base text-white">Placa Reseñas Google NFC</h4>
                  <p className="text-xs text-gray-300">En Vinil sobre PVC ultrarresistente para mesas o mostrador.</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-black text-yellow-300">L. 1,200 HNL</span>
                    <Link href="/tienda" className="text-xs font-black bg-white text-black px-3 py-1.5 rounded-xl hover:bg-gray-200 transition">
                      Ver en Tienda
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CÓMO FUNCIONA EN 3 PASOS */}
        <section id="como-funciona" className="py-20 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Rápido & Sin Complicaciones
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              Operativo en tu negocio en menos de 5 minutos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center relative">
            <div className="p-6 bg-white rounded-3xl border-2 border-gray-100 shadow-xs space-y-3 hover:border-black transition">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto shadow-xs">
                1
              </div>
              <h3 className="font-extrabold text-base text-gray-900">Crea tu Cuenta en 1 Minuto</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Sin tarjeta de crédito. Activa tu negocio y selecciona qué módulos deseas utilizar (Menús, Citas, Reseñas o Sellos).
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border-2 border-gray-100 shadow-xs space-y-3 hover:border-black transition">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto shadow-xs">
                2
              </div>
              <h3 className="font-extrabold text-base text-gray-900">Personaliza con tu Marca</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Ingresa tus platillos, servicios o información de contacto con tus fotos, horarios de turno y logo oficial.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border-2 border-gray-100 shadow-xs space-y-3 hover:border-black transition">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto shadow-xs">
                3
              </div>
              <h3 className="font-extrabold text-base text-gray-900">Conecta Clientes por QR o NFC</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Descarga tus códigos QR para mostradores o adquiere tus placas físicas para recibir pedidos y citas directo a WhatsApp.
              </p>
            </div>
          </div>
        </section>

        {/* 6. TABLA DE PLANES & PRECIOS CLAROS Y TRANSPARENTES */}
        <section id="precios" className="py-20 bg-gray-50/70 border-y border-gray-200 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                Precios Transparentes • Cero Letras Pequeñas
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                Elige la opción ideal para impulsar tu negocio
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Comienza sin costo hoy mismo. Puedes pagar con facilidad vía transferencia o depósito en bancos de Honduras.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {/* PLAN 1: PRUEBA PRO GRATIS */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-500">Prueba Inicial</span>
                    <span className="text-[10px] font-black bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      Sin Tarjeta
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-gray-900">10 Días Gratis PRO</h3>
                    <p className="text-xs text-gray-500 mt-1">Prueba todas las funcionalidades sin pagar un solo centavo.</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-4xl font-black text-gray-900">L. 0</span>
                    <span className="text-xs text-gray-500 ml-1">por 10 días</span>
                  </div>

                  <div className="pt-4 space-y-2.5 border-t border-gray-100 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Acceso total a todos los módulos PRO</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Menús QR con turnos y comandas por mesa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Agendas con especialistas para salones</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Escudo de reseñas de Google Maps</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Estudio QR dinámico descargable</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <Link
                    href="/register"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                  >
                    <span>Comenzar Prueba Gratis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* PLAN 2: MENSUALIDAD PRO (RECOMENDADO) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-purple-600 shadow-xl flex flex-col justify-between relative transform md:-translate-y-2">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                  ⭐ MÁS POPULAR • 50% OFF
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-700">Membresía Completa</span>
                    <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                      Lanzamiento
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-gray-900">Membresía Mensual PRO</h3>
                    <p className="text-xs text-gray-500 mt-1">Digitalización total para tu negocio sin contratos forzosos.</p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-purple-700">L. 275</span>
                      <span className="text-xs text-gray-400 line-through">L. 550 HNL</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-bold mt-1">
                      50% OFF si confirmas en tus primeros 3 días
                    </p>
                  </div>

                  <div className="pt-4 space-y-2.5 border-t border-gray-100 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Todo lo de la prueba</b> de forma continua</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Turnos inteligentes</b> para menús (Desayuno, Almuerzo, Cena)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Plato del Día destacado</b> ilimitado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Portal móvil para colaboradores</b> con PIN</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>CRM centralizado</b> con exportación a Excel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Cancela cuando quieras sin compromisos</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <Link
                    href="/register"
                    className="w-full bg-black hover:bg-gray-800 text-white font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <span>Activar con 50% de Descuento</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* PLAN 3: DISPOSITIVOS FÍSICOS NFC */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Hardware Físico</span>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      1 Año PRO Incluido
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-gray-900">Dispositivo NFC Físico</h3>
                    <p className="text-xs text-gray-500 mt-1">Placas vinil sobre PVC para mesas o Tarjeta Matte Black.</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-4xl font-black text-gray-900">L. 1,200</span>
                    <span className="text-xs text-gray-500 ml-1">pago único</span>
                    <p className="text-[11px] text-purple-700 font-bold mt-1">
                      🎁 Incluye 1 Año Completo PRO Gratis
                    </p>
                  </div>

                  <div className="pt-4 space-y-2.5 border-t border-gray-100 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>1 Dispositivo Físico</b> con chip NFC de largo alcance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>12 meses de suscripción PRO</b> completamente incluidos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Envío rápido a domicilio en toda Honduras</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Configuración y asesoría por WhatsApp</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <Link
                    href="/tienda"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Ver Catálogo en la Tienda</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PREGUNTAS FRECUENTES (FAQ) */}
        <section id="faq" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              Resolvemos tus Dudas
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              Preguntas Frecuentes
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Todo lo que necesitas saber antes de comenzar.
            </p>
          </div>

          <LandingFaq />
        </section>

        {/* 8. LLAMADO A LA ACCIÓN FINAL (CTA BANNER) */}
        <section className="py-12 sm:py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-950 via-slate-900 to-black text-white p-8 sm:p-14 rounded-3xl shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-52 h-52 bg-purple-600/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-52 h-52 bg-emerald-600/20 rounded-full blur-3xl" />

            <div className="relative space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 shadow-xs">
                10 DÍAS GRATIS PRO • SIN TARJETA
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Empieza a digitalizar tu negocio hoy mismo
              </h2>
              <p className="text-xs sm:text-base text-gray-300 max-w-lg mx-auto font-medium leading-relaxed">
                Crea tu cuenta gratis en 60 segundos y prueba el menú con turnos activos, agendas para citas y escudo de reseñas. Recuerda que tienes <b>50% de descuento (L. 275)</b> si confirmas en tus primeros 3 días.
              </p>
            </div>

            <div className="relative pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                href="/register" 
                className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 font-black px-8 py-4 rounded-2xl text-sm sm:text-base transition shadow-xl cursor-pointer"
              >
                Comenzar 10 Días de Prueba Gratis
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-2xl text-sm sm:text-base transition"
              >
                Ya tengo una cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 9. FOOTER PROFESIONAL */}
      <footer className="border-t border-gray-200 bg-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-light.png"
              alt="OmniTag"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
            <span className="font-black text-lg text-gray-900">OmniTag</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Plataforma Segura • Conexión Cifrada SSL</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
            <Link href="/privacidad" className="hover:text-black hover:underline">
              Políticas de Privacidad
            </Link>
            <span>•</span>
            <Link href="/tienda" className="hover:text-black hover:underline">
              Tienda Oficial NFC
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-black hover:underline">
              Iniciar Sesión
            </Link>
          </div>

          <p className="text-gray-400 text-xs font-medium">
            © {new Date().getFullYear()} OmniTag. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
