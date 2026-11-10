import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import {
  Building2,
  Check,
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
  Zap
} from 'lucide-react'

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

  const defaultHotmartCheckout = 'https://pay.hotmart.com/F108380682J?checkoutMode=2'

  const starterHotmartUrl = appendAffiliateParams(
    process.env.NEXT_PUBLIC_HOTMART_RESELLER_STARTER_URL ||
    process.env.NEXT_PUBLIC_HOTMART_RESELLER_URL ||
    defaultHotmartCheckout
  )

  const agencyHotmartUrl = appendAffiliateParams(
    process.env.NEXT_PUBLIC_HOTMART_RESELLER_URL ||
    defaultHotmartCheckout
  )

  const enterpriseHotmartUrl = appendAffiliateParams(
    process.env.NEXT_PUBLIC_HOTMART_RESELLER_PRO_URL ||
    process.env.NEXT_PUBLIC_HOTMART_RESELLER_URL ||
    defaultHotmartCheckout
  )

  const affiliateSignupUrl = process.env.NEXT_PUBLIC_HOTMART_AFFILIATE_URL || defaultHotmartCheckout

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Widget Oficial de Checkout de Hotmart */}
      <link rel="stylesheet" type="text/css" href="https://static.hotmart.com/css/hotmart-fb.min.css" />
      <Script src="https://static.hotmart.com/checkout/widget.min.js" strategy="afterInteractive" />
      {/* Barra Superior */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo-light.png"
              alt="OmniTag"
              width={34}
              height={34}
              className="w-8 h-8 object-contain"
            />
            <span className="font-black text-lg tracking-tight text-white">OmniTag</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              White-Label SaaS
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/activar-compra"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-emerald-200 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Ya compré en Hotmart
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl border border-white/15 hover:bg-white/5 transition"
            >
              Iniciar Sesión
            </Link>
            <a
              href="#planes-agencia"
              className="text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl transition shadow-lg"
            >
              Ver Licencias
            </a>
          </div>
        </div>
      </header>

      {/* HERO PRINCIPAL */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-extrabold uppercase tracking-wider">
            <Building2 className="w-4 h-4" /> Franquicia Tecnológica SaaS Marca Blanca
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Sé Dueño de tu Propio <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-300">SaaS con tu Propia Marca</span> y Cobra el 100% a tus Clientes
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            No inviertas miles de dólares ni años programando. Ponle <strong>tu propio logo, tu nombre comercial y tu propia pasarela de pagos</strong> a nuestra plataforma y véndele suscripciones mensuales a restaurantes, clínicas, barberías y comercios en tu país.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#planes-agencia"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm sm:text-base shadow-xl transition"
            >
              <Sparkles className="w-5 h-5" />
              Adquirir Licencia Marca Blanca en Hotmart
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#afiliados"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-bold text-sm transition"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Programa de Afiliados (Gana Comisiones)
            </a>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA EL MODELO MARCA BLANCA */}
      <section className="py-14 px-4 sm:px-6 bg-slate-900/60 border-y border-white/10">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black">¿Cómo funciona tu Agencia Marca Blanca?</h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              En menos de 5 minutos tras activar tu suscripción en Hotmart tendrás tu propia empresa de software funcionando:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 border border-white/10 rounded-3xl p-6 space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-black">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">1. Sube tu Logo y Marca</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Desde tu consola de Agencia configuras el nombre de tu plataforma y tu logo. Tus clientes verán únicamente tu marca en el menú superior, registro y páginas públicas.
              </p>
            </div>

            <div className="bg-slate-950 border border-white/10 rounded-3xl p-6 space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Conecta tu Pasarela y Precios</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Tú decides cuánto cobrarles a tus clientes (ej. \$25 USD/mes o \$250 USD/año) y conectas tu propio link de Hotmart, Stripe, Tilopay, PayPal o tu cuenta bancaria local.
              </p>
            </div>

            <div className="bg-slate-950 border border-white/10 rounded-3xl p-6 space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Crea Cuentas por Giro de Negocio</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Cada cliente que des de alta recibe un sistema especializado según su giro (Restaurante, Barbería, Clínica Médica, Tienda o Profesional) y tú conservas el 100% de tus ventas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LOS 5 SISTEMAS VERTICALES QUE PODRÁS VENDER */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black">5 Sistemas Especializados en 1 Sola Licencia</h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Al crearle la cuenta a tu cliente eliges su giro y el sistema adapta automáticamente todo el vocabulario y herramientas:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              icon: Utensils,
              title: 'Restaurantes & Cafés',
              desc: 'Menú QR interactivo, comandas en vivo, pedidos a WhatsApp, ruleta de premios y reseñas Google.',
              color: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
            },
            {
              icon: Scissors,
              title: 'Barberías & Salones',
              desc: 'Agenda de citas por especialista, catálogo de servicios, tarjetas de sellos y gift cards.',
              color: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
            },
            {
              icon: Stethoscope,
              title: 'Clínicas & Médicos',
              desc: 'Expediente Clínico Electrónico (ECE), control de pacientes, agenda médica y tarjeta digital.',
              color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
            },
            {
              icon: ShoppingBag,
              title: 'Tiendas & Retail',
              desc: 'Catálogo online con carrito a WhatsApp, gift cards digitales, fidelización y estudio QR.',
              color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            },
            {
              icon: Briefcase,
              title: 'Profesionales & B2B',
              desc: 'Tarjeta de presentación digital NFC, captura de prospectos CRM, agenda de asesorías y portafolio.',
              color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
            }
          ].map((v, i) => {
            const Icon = v.icon
            return (
              <div key={i} className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${v.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">{v.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* PLANES DE LICENCIA MARCA BLANCA (HOTMART) */}
      <section id="planes-agencia" className="py-16 px-4 sm:px-6 bg-slate-900/50 border-t border-white/10">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
              Suscripciones Oficiales en Hotmart
            </span>
            <h2 className="text-2xl sm:text-4xl font-black">Elige tu Licencia de Distribuidor Marca Blanca</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Activación automática inmediata al completar tu pago seguro a través de Hotmart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PLAN STARTER 10 */}
            <div className="bg-slate-950 border border-white/10 rounded-3xl p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Starter Partner</span>
                  <h3 className="text-xl font-black text-white mt-1">Hasta 10 Sub-Clientes</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$49</span>
                  <span className="text-xs font-bold text-slate-400">USD / mes</span>
                </div>
                <p className="text-xs text-emerald-400 font-bold">
                  💡 Si vendes cada cuenta a $25/mes, generas $250 USD/mes ($201 USD de ganancia neta mensual).
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 10 Cuentas de negocios activas</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Tu propio Logo y Nombre de Marca</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Tu propia pasarela de cobro para clientes</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Los 5 giros verticales incluidos</li>
                </ul>
              </div>

              <a
                href={starterHotmartUrl}
                className="hotmart-fb hotmart__button-checkout w-full py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm text-center transition block"
              >
                Comenzar con Starter (10 Cuentas)
              </a>
            </div>

            {/* PLAN AGENCY 25 (RECOMENDADO) */}
            <div className="bg-gradient-to-b from-indigo-950 to-slate-950 border-2 border-indigo-500 rounded-3xl p-7 flex flex-col justify-between space-y-6 shadow-2xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full">
                Más Rentable • Recomendado
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">Agency Partner</span>
                  <h3 className="text-xl font-black text-white mt-1">Hasta 25 Sub-Clientes</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$99</span>
                  <span className="text-xs font-bold text-slate-300">USD / mes</span>
                </div>
                <p className="text-xs text-emerald-300 font-bold">
                  💡 Si vendes 25 cuentas a $25/mes, generas $625 USD/mes ($526 USD de ganancia neta mensual).
                </p>
                <ul className="space-y-2.5 text-xs text-slate-200 pt-2">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 25 Cuentas de negocios activas</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Marca Blanca 100% (Sin sello OmniTag)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Link de registro exclusivo con tu marca</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Conecta tu propio Hotmart, Stripe o Banco</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Ideal para vender con tarjetas y placas NFC</li>
                </ul>
              </div>

              <div className="space-y-2.5">
                <a
                  href={agencyHotmartUrl}
                  className="hotmart-fb hotmart__button-checkout w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm text-center transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Comprar Ahora en Hotmart</span>
                </a>
                <a
                  href={agencyHotmartUrl}
                  className="hotmart-fb hotmart__button-checkout flex justify-center pt-1"
                >
                  <img src="https://static.hotmart.com/img/btn-buy-green.png" alt="Comprar en Hotmart" className="h-10 object-contain" />
                </a>
              </div>
            </div>

            {/* PLAN COUNTRY PARTNER 100 */}
            <div className="bg-slate-950 border border-white/10 rounded-3xl p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Country Partner</span>
                  <h3 className="text-xl font-black text-white mt-1">Hasta 100 Sub-Clientes</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$199</span>
                  <span className="text-xs font-bold text-slate-400">USD / mes</span>
                </div>
                <p className="text-xs text-emerald-400 font-bold">
                  💡 Si vendes 100 cuentas a $25/mes, generas $2,500 USD/mes ($2,301 USD de ganancia neta).
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 100 Cuentas de negocios activas</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Costo por cliente menor a $2 USD/mes</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Marca Blanca Total + Soporte Prioritario</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Escala tu distribuidora nacional NFC</li>
                </ul>
              </div>

              <a
                href={enterpriseHotmartUrl}
                className="hotmart-fb hotmart__button-checkout w-full py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm text-center transition block"
              >
                Activar Country Partner (100 Cuentas)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN PROGRAMA DE AFILIADOS HOTMART */}
      <section id="afiliados" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" /> Programa Oficial de Afiliados en Hotmart
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              ¿Prefieres ganar comisiones recomendando OmniTag sin gestionar clientes?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Afíliate gratis a nuestro producto en <strong>Hotmart</strong>, comparte tu HotLink de afiliado y recibe comisiones automáticas directamente en tu cuenta de Hotmart por cada negocio o agencia que se suscriba con tu enlace.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto flex flex-col gap-3">
            <a
              href={affiliateSignupUrl}
              className="px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm text-center transition shadow-lg"
            >
              Solicitar Afiliación en Hotmart
            </a>
            <Link
              href="/activar-compra"
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-center text-slate-300 transition"
            >
              ¿Ya compraste tu licencia? Actívala aquí →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
