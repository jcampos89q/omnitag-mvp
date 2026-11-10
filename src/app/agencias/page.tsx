import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import {
  Building2,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Users,
  Palette,
  CreditCard,
  Utensils,
  Scissors,
  Stethoscope,
  ShoppingBag,
  Briefcase,
  TrendingUp,
  Globe,
  Zap,
  Tag,
  ChevronRight,
  Star,
  Gift,
  Disc
} from 'lucide-react'
import LandingNavbar from '@/components/LandingNavbar'

export const metadata = {
  title: 'Licencia SaaS Marca Blanca & Programa de Agencias | OmniTag',
  description: 'Lanza tu propia plataforma SaaS de Menús QR, Agendas Médicas, Fidelización y Tarjetas NFC bajo tu propia marca y cobra el 100% directo a tus clientes.',
}

export default async function AgenciasWhiteLabelPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; aff?: string; src?: string }>
}) {
  const params = await searchParams
  const affiliateParam = params?.ref || params?.aff || params?.src || ''

  const appendAffiliateParams = (baseUrl: string) => {
    if (!affiliateParam) return baseUrl
    const sep = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${sep}ref=${encodeURIComponent(affiliateParam)}&src=${encodeURIComponent(affiliateParam)}`
  }

  const defaultStarterCheckout = 'https://pay.hotmart.com/F108380682J?checkoutMode=2&off=7p2sbzur'
  const defaultAgencyCheckout = 'https://pay.hotmart.com/F108380682J?checkoutMode=2&off=ozwefg5c'
  const defaultCountryCheckout = 'https://pay.hotmart.com/F108380682J?checkoutMode=2&off=50u8dbyw'

  const starterHotmartUrl = appendAffiliateParams(
    process.env.NEXT_PUBLIC_HOTMART_RESELLER_STARTER_URL ||
    defaultStarterCheckout
  )

  const agencyHotmartUrl = appendAffiliateParams(
    process.env.NEXT_PUBLIC_HOTMART_RESELLER_URL ||
    defaultAgencyCheckout
  )

  const enterpriseHotmartUrl = appendAffiliateParams(
    process.env.NEXT_PUBLIC_HOTMART_RESELLER_PRO_URL ||
    defaultCountryCheckout
  )

  const affiliateSignupUrl = process.env.NEXT_PUBLIC_HOTMART_AFFILIATE_URL || 'https://affiliate.hotmart.com/affiliate-recruiting/view/2575S108380703'

  const industries = [
    { name: 'Restaurantes & Bares', emoji: '🍽️', desc: 'Menús con turno activo, Ruleta o Raspa y Gana en mesa, y comandas a WhatsApp.' },
    { name: 'Barberías & Salones', emoji: '💈', desc: 'Reservas online 24/7 con selección de especialista, Gift Cards y club de sellos.' },
    { name: 'Clínicas & Médicos', emoji: '🩺', desc: 'Expediente Clínico Electrónico (ECE), agenda médica y reseñas verificadas.' },
    { name: 'Tiendas & Retail', emoji: '🛍️', desc: 'Catálogo online con carrito directo a WhatsApp, Gift Cards y lealtad.' },
    { name: 'Profesionales & B2B', emoji: '💼', desc: 'vCards NFC, intercambio de contactos y captura de prospectos CRM.' }
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-black selection:text-white font-sans antialiased">
      {/* Widget Oficial de Checkout de Hotmart */}
      <link rel="stylesheet" type="text/css" href="https://static.hotmart.com/css/hotmart-fb.min.css" />
      <Script src="https://static.hotmart.com/checkout/widget.min.js" strategy="afterInteractive" />

      {/* 0. CINTILLO SUPERIOR DE OFERTA CON IDENTIDAD OMNITAG */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-emerald-700 text-white py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
        <span className="bg-yellow-400 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">
          PROGRAMA PARTNER & AGENCIAS
        </span>
        <span className="truncate sm:overflow-visible sm:whitespace-normal">
          🚀 <b>Licencia SaaS Marca Blanca</b> • Vende nuestro software bajo <b>tu propio Logo y Nombre</b> y quédate con el <b>100% de tus cobros</b>.
        </span>
        <Link
          href="/activar-compra"
          className="hidden sm:inline-flex items-center gap-1 underline font-black text-yellow-300 hover:text-white transition ml-1 shrink-0"
        >
          <span>¿Ya compraste en Hotmart? Activar aquí</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 1. NAVEGACIÓN PRINCIPAL DE OMNITAG */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 2. HERO SECTION CON ESTÉTICA OFICIAL OMNITAG */}
        <section className="relative overflow-hidden pt-10 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 border-b border-gray-100 bg-gradient-to-b from-white via-gray-50/50 to-white">
          {/* Fondo decorativo con gradientes suaves de marca */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
            <div className="w-[650px] h-[650px] bg-gradient-to-tr from-amber-100/40 via-purple-100/40 to-emerald-50/40 rounded-full blur-3xl opacity-80" />
          </div>

          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-black tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 fill-current animate-pulse" />
              <span>FRANQUICIA TECNOLÓGICA SAAS EN MARCA BLANCA • ACTIVACIÓN INMEDIATA</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-950 leading-[1.08]">
              Toda la tecnología de OmniTag, <br />
              <span className="bg-gradient-to-r from-purple-600 via-amber-600 to-emerald-600 bg-clip-text text-transparent">
                bajo tu propia Marca y Logo.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Conviértete en dueño de tu propia empresa de software sin programar desde cero. Ponle <b>tu propio logo, nombre comercial y tu propia pasarela de cobro</b> a nuestro ecosistema de <b>Menús QR, Comandas, Citas, Expediente Médico, Ruleta y Tarjetas NFC</b>, y cobra mensualidades directamente a los negocios de tu ciudad o país.
            </p>

            {/* Botones de Acción */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
              <a
                href={agencyHotmartUrl}
                className="hotmart-fb hotmart__button-checkout w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl font-black text-sm sm:text-base hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Activar Mi Agencia Marca Blanca</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#planes-agencia"
                className="w-full sm:w-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-6 py-4 rounded-2xl font-black text-sm sm:text-base transition flex items-center justify-center gap-2"
              >
                <Tag className="w-4 h-4 text-emerald-700" />
                <span>Ver Planes & Rentabilidad</span>
              </a>
              <Link
                href="/activar-compra"
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-4 rounded-2xl font-bold text-sm sm:text-base transition text-center"
              >
                Activar Compra Hotmart
              </Link>
            </div>

            {/* Badges de Garantía y Beneficios */}
            <div className="pt-1 flex flex-wrap items-center justify-center gap-y-2 gap-x-4 text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <b>100% de lo que cobres</b> a tus clientes es tuyo
              </span>
              <span className="flex items-center gap-1.5 text-gray-700">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                Tus clientes nunca ven la marca OmniTag
              </span>
              <span className="flex items-center gap-1.5 text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Pago seguro y garantizado vía Hotmart
              </span>
            </div>

            {/* SHOWCASE VISUAL DEL PANEL MARCA BLANCA */}
            <div className="pt-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-2xl overflow-hidden text-left">
                {/* Barra de ventana estilo navegador */}
                <div className="bg-gray-950 text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="ml-2 text-[11px] font-bold text-gray-300">
                      Vista Previa en Vivo • Así ven el panel tus Sub-Clientes
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white px-2.5 py-0.5 rounded-full">
                    100% Tu Propia Marca
                  </span>
                </div>

                <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
                  <div className="md:col-span-5 flex justify-center">
                    <img
                      src="/hotmart-saas-marca-blanca.jpg"
                      alt="Licencia SaaS Marca Blanca OmniTag"
                      className="w-full max-w-[280px] rounded-2xl shadow-xl border border-gray-200 object-cover"
                    />
                  </div>

                  <div className="md:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black">
                      <span>⚡ Tu Agencia Digital Llave en Mano</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                      Tú administras tu cartera y defines tus propios precios
                    </h3>
                    <div className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><b>Reemplazo Total de Marca:</b> Sube tu logo y nombre en <code className="bg-gray-100 px-1.5 py-0.5 rounded font-bold">/dashboard/reseller</code> y todo el panel de tus clientes adopta tu identidad.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><b>Tu Propia Pasarela de Cobro:</b> Conecta tus propios links de Hotmart, Stripe, Tilopay, PayPal o tu cuenta bancaria para que tus clientes te paguen directo a ti.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><b>Aislamiento Inteligente por Giro:</b> Cuando le creas la cuenta a una Barbería, solo ve <i>Servicios y Citas</i>; un Restaurante solo ve <i>Menú y Comandas</i>; una Clínica ve <i>Expediente de Pacientes</i>.</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <a
                        href={agencyHotmartUrl}
                        className="hotmart-fb hotmart__button-checkout inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Adquirir Licencia ahora en Hotmart</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2.5 LOS 5 SECTORES QUE PUEDES VENDER (ESTILO IDÉNTICO A LA HOME) */}
        <section className="py-12 bg-white border-b border-gray-100 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                5 SISTEMAS VERTICALES INCLUIDOS EN TU LICENCIA
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                Véndele a cualquier negocio local entregándole herramientas exclusivas para su rubro
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

        {/* 3. CÓMO FUNCIONA TU NEGOCIO DE DISTRIBUIDOR EN 3 PASOS */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Modelo de Negocio Recurrente (MRR)
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
              ¿Cómo lanzas y monetizas tu Agencia Marca Blanca?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              Ideal para agencias de marketing, vendedores de tarjetas y placas NFC, diseñadores web y emprendedores B2B.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* PASO 1 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-purple-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xl shadow-xs">
                    🎨
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                    Paso 1 • Tu Identidad
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Personaliza tu Marca Blanca y Dominio de Registro
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    Al activar tu suscripción en Hotmart, entras a tu Consola Partner, subes tu logo, defines el nombre de tu plataforma y obtienes tu enlace único de registro con tu marca.
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-gray-100 text-xs text-gray-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Sin rastro de OmniTag:</b> Tus sub-clientes solo ven tu marca en la barra superior y menú.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Enlace de Invitación Propio:</b> La pantalla de registro muestra tu logo automáticamente.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PASO 2 */}
            <div className="bg-gradient-to-b from-amber-50/50 via-white to-white rounded-3xl p-6 sm:p-7 border-2 border-amber-400 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-xs">
                    💳
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Paso 2 • Tus Precios
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Conecta tu Pasarela y Cobra el 100% de tus Ventas
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    Tú decides a qué precio vender cada membresía mensual o anual (ej. $25 USD/mes o $250 USD/año) y conectas tus propios métodos de pago.
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-gray-100 text-xs text-gray-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Cero comisiones por venta:</b> Todo lo que te paguen tus sub-clientes entra íntegro a tu cuenta.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Múltiples métodos:</b> Usa tus propios links de Hotmart, Stripe, Tilopay, PayPal o transferencia bancaria.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PASO 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl shadow-xs">
                    🚀
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Paso 3 • Tus Clientes
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Da de Alta Sub-Clientes con Giro Bloqueado
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    Desde tu panel creas las cuentas de tus clientes en segundos, eliges su giro de negocio y controlas su fecha de vencimiento (+30 días, +1 año o pausar).
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-gray-100 text-xs text-gray-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Combínalo con NFC:</b> Vende tarjetas o placas NFC físicas junto con la suscripción de tu software.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Control total de accesos:</b> Activa o pausa cuentas de clientes morosos con un solo clic.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SECCIÓN DE PLANES DE LICENCIA MARCA BLANCA (ESTÉTICA IDÉNTICA A LA SECCIÓN DE PRECIOS DE OMNITAG) */}
        <section id="planes-agencia" className="py-16 sm:py-24 bg-gray-50 border-y border-gray-200 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                Licencias Oficiales para Distribuidores
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
                Elige el tamaño de tu Agencia Marca Blanca
              </h2>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Con solo 3 o 4 clientes activos pagas tu licencia entera y todo el resto de tu cartera es ganancia neta recurrente para ti.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {/* PLAN 1: STARTER PARTNER (10 CUENTAS) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-500">Starter Partner</span>
                    <span className="text-[10px] font-black bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full">
                      10 Sub-Clientes
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-gray-900">Licencia Inicial 10</h3>
                    <p className="text-xs text-gray-500 mt-1">Ideal para validar tu agencia local y conseguir tus primeros 10 negocios.</p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-gray-900">$49</span>
                      <span className="text-xs text-gray-500 font-bold">USD / mes</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-bold mt-1">
                      💡 Vende 10 cuentas a $25/mes = $250 USD/mes para ti
                    </p>
                  </div>

                  <div className="pt-4 space-y-2.5 border-t border-gray-100 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Hasta 10 sub-cuentas</b> de clientes activas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Panel con tu propio Logo</b> y Nombre Comercial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Tu propia pasarela de pagos</b> para cobrar el 100%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Los 5 giros de negocio</b> desbloqueados</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <a
                    href={starterHotmartUrl}
                    className="hotmart-fb hotmart__button-checkout w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                  >
                    <span>Comenzar con Starter (10 Cuentas)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* PLAN 2: AGENCY PARTNER 25 (RECOMENDADO) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-purple-600 shadow-xl flex flex-col justify-between relative transform md:-translate-y-2">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md whitespace-nowrap">
                  ⭐ MÁS POPULAR • MAYOR RENTABILIDAD
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-700">Agency Partner</span>
                    <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                      25 Sub-Clientes
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-gray-900">Licencia Agencia 25</h3>
                    <p className="text-xs text-gray-500 mt-1">La licencia completa para agencias de marketing y distribuidores NFC.</p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-purple-700">$99</span>
                      <span className="text-xs text-gray-500 font-bold">USD / mes</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-bold mt-1">
                      💡 Vende 25 cuentas a $25/mes = $625 USD/mes ($526 netos)
                    </p>
                  </div>

                  <div className="pt-4 space-y-2.5 border-t border-gray-100 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Hasta 25 sub-cuentas</b> de negocios activas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>100% Marca Blanca</b> (Oculta todo sello de OmniTag)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Link de registro exclusivo</b> con tu propio logo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Conecta tu propio Hotmart</b>, Stripe, Tilopay o Banco</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Menús, Comandas, Citas, ECE Médico</b>, Ruleta y Gift Cards</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Activación automática</b> al instante tras el pago</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-2.5">
                  <a
                    href={agencyHotmartUrl}
                    className="hotmart-fb hotmart__button-checkout w-full bg-black hover:bg-gray-800 text-white font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <span>Activar Licencia Agency (25 Cuentas)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={agencyHotmartUrl}
                    className="hotmart-fb hotmart__button-checkout flex justify-center pt-1"
                  >
                    <img src="https://static.hotmart.com/img/btn-buy-green.png" alt="Comprar en Hotmart" className="h-9 object-contain" />
                  </a>
                </div>
              </div>

              {/* PLAN 3: COUNTRY PARTNER 100 */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Country Partner</span>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      100 Sub-Clientes
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-gray-900">Licencia Nacional 100</h3>
                    <p className="text-xs text-gray-500 mt-1">Para distribuidoras mayoristas y agencias con equipo de ventas.</p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-gray-900">$199</span>
                      <span className="text-xs text-gray-500 font-bold">USD / mes</span>
                    </div>
                    <p className="text-[11px] text-purple-700 font-bold mt-1">
                      💡 Menos de $2 USD por cliente • Genera +$2,500 USD/mes
                    </p>
                  </div>

                  <div className="pt-4 space-y-2.5 border-t border-gray-100 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Hasta 100 sub-cuentas</b> de negocios activas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Marca Blanca Total</b> en panel y páginas públicas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Máximo margen de ganancia</b> por cada suscripción</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Soporte técnico prioritario</b> directo por WhatsApp</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <a
                    href={enterpriseHotmartUrl}
                    className="hotmart-fb hotmart__button-checkout w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Activar Country Partner (100 Cuentas)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. PROGRAMA DE AFILIADOS HOTMART (FLUJO Y RECLUTAMIENTO OFICIAL) */}
        <section id="afiliados" className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-gray-950 via-slate-900 to-black text-white p-8 sm:p-14 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-52 h-52 bg-purple-600/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-52 h-52 bg-emerald-600/20 rounded-full blur-3xl" />

            <div className="relative text-center space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 shadow-xs">
                PROGRAMA OFICIAL DE AFILIADOS EN HOTMART
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                ¿Prefieres ganar comisiones recomendando el SaaS?
              </h2>
              <p className="text-xs sm:text-base text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
                Si eres creador de contenido, trafficker o vendedor digital y quieres ganar comisiones recurrentes sin administrar clientes, únete gratis a nuestro Programa de Afiliados en Hotmart:
              </p>
            </div>

            {/* Los 3 pasos del Afiliado */}
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Paso 1 • 1 Clic
                </span>
                <h3 className="text-base font-extrabold text-white">Afíliate Gratis en Hotmart</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Haz clic en el botón de abajo para abrir la invitación oficial de Hotmart y activar tu afiliación con un clic.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  Paso 2 • Tus HotLinks
                </span>
                <h3 className="text-base font-extrabold text-white">Copia tus Links de Divulgación</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Hotmart te entregará automáticamente tus enlaces únicos con tu código de rastreo para los 3 planes ($49, $99 y $199).
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  Paso 3 • Pago Automático
                </span>
                <h3 className="text-base font-extrabold text-white">Cobra Comisiones en Dólares</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Por cada agencia que se suscriba con tu link, Hotmart separa y deposita tu comisión automáticamente en tu saldo de Hotmart.
                </p>
              </div>
            </div>

            <div className="relative pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={affiliateSignupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm sm:text-base transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <TrendingUp className="w-5 h-5" />
                <span>Unirme como Afiliado en Hotmart (Gratis)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/activar-compra"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-2xl text-sm sm:text-base transition text-center"
              >
                Ya compré mi Licencia • Activar Cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 6. FOOTER PROFESIONAL IDÉNTICO A LA HOME DE OMNITAG */}
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
            <span>Plataforma Segura • Pagos Oficiales vía Hotmart</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
            <Link href="/" className="hover:text-black hover:underline">
              Inicio OmniTag
            </Link>
            <span>•</span>
            <Link href="/tienda" className="hover:text-black hover:underline">
              Tienda Oficial NFC
            </Link>
            <span>•</span>
            <Link href="/activar-compra" className="hover:text-black hover:underline">
              Activar Compra
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
