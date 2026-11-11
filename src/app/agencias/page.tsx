import Link from 'next/link'
import Image from 'next/image'
import {
  Building2,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  ShoppingCart
} from 'lucide-react'
import CanvaWorkspaceShowcase from './CanvaWorkspaceShowcase'

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

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-purple-600 selection:text-white font-sans antialiased text-gray-900">
      {/* 1. HEADER MINIMALISTA ESTILO CANVA */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <Image
                src="/logo-light.png"
                alt="OmniTag"
                width={32}
                height={32}
                className="w-8 h-8 object-contain transition group-hover:scale-105"
                priority
              />
              <span className="text-xl font-black tracking-tight text-gray-950">OmniTag</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Partners
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-600">
              <a href="#explorar-app" className="hover:text-purple-700 transition">
                Qué Incluye
              </a>
              <a href="#como-funciona" className="hover:text-purple-700 transition">
                Cómo Funciona
              </a>
              <a href="#planes-agencia" className="hover:text-purple-700 transition">
                Planes y Precios
              </a>
              <a href="#afiliados" className="hover:text-purple-700 transition">
                Afiliados
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/activar-compra"
              className="text-xs sm:text-sm font-bold text-gray-700 hover:text-gray-950 px-3.5 py-2 rounded-full hover:bg-gray-100 transition"
            >
              Activar Compra
            </Link>
            <a
              href="#planes-agencia"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-extrabold px-4 sm:px-5 py-2.5 rounded-full transition shadow-sm flex items-center gap-1.5"
            >
              <span>Ver Planes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO LIMPIO Y ORDENADO ESTILO CANVA + SELECTOR CLARO */}
        <section id="explorar-app" className="relative overflow-hidden pt-10 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-6">
          <div className="absolute inset-x-0 top-0 -z-10 flex justify-center pointer-events-none">
            <div className="w-[900px] h-[420px] bg-gradient-to-r from-purple-200/40 via-amber-100/40 to-emerald-200/40 blur-3xl rounded-full" />
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-5 mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200/80 text-purple-800 text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Plataforma SaaS en Marca Blanca • Lista Para Vender</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-950 leading-[1.08]">
              Tu propia plataforma de software,{' '}
              <span className="bg-gradient-to-r from-purple-600 via-amber-500 to-emerald-600 bg-clip-text text-transparent">
                con tu Logo y tus Precios.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Véndele suscripciones mensuales a Restaurantes, Barberías, Clínicas y Tiendas bajo tu propia marca y <b>quédate con el 100% de lo que cobres</b>.
            </p>
          </div>

          {/* PANEL DE CATEGORÍAS Y COMPRA DIRECTA ESTILO CANVA */}
          <CanvaWorkspaceShowcase
            starterCheckoutUrl={starterHotmartUrl}
            agencyCheckoutUrl={agencyHotmartUrl}
            enterpriseCheckoutUrl={enterpriseHotmartUrl}
          />
        </section>

        {/* 3. CÓMO FUNCIONA (3 PASOS CLAROS ESTILO CANVA) */}
        <section id="como-funciona" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50/70 border-y border-gray-100">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-700">
                Sin programar nada
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">
                ¿Cómo funciona tu Agencia Marca Blanca?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-b from-purple-50/90 to-white rounded-3xl p-7 border border-purple-100 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
                  1
                </div>
                <h3 className="text-xl font-black text-gray-950">
                  Sube tu Logo y Nombre
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Al adquirir tu plan entras a tu Consola Partner, subes tu logo y defines el nombre de tu agencia. Tus clientes jamás ven OmniTag.
                </p>
              </div>

              <div className="bg-gradient-to-b from-amber-50/90 to-white rounded-3xl p-7 border border-amber-100 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shadow-sm">
                  2
                </div>
                <h3 className="text-xl font-black text-gray-950">
                  Pon tus Precios y Pasarela
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tú decides cuánto cobrarle a cada cliente (ej. $25 USD/mes) y conectas tu propio Stripe, Hotmart, Tilopay, PayPal o cuenta bancaria.
                </p>
              </div>

              <div className="bg-gradient-to-b from-emerald-50/90 to-white rounded-3xl p-7 border border-emerald-100 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
                  3
                </div>
                <h3 className="text-xl font-black text-gray-950">
                  Crea Cuentas en 1 Clic
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Creas la cuenta de tu cliente, seleccionas su giro (Restaurante, Barbería, Clínica o Tienda) y controlas su fecha de vencimiento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. PLANES Y PRECIOS CON BOTONES 100% VISIBLES Y DIRECTOS */}
        <section id="planes-agencia" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3.5 py-1 rounded-full border border-purple-200">
                Suscripciones Oficiales en Hotmart
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
                Elige y compra el plan de tu Agencia
              </h2>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Haz clic en el botón del plan que prefieras para completar tu suscripción segura en Hotmart y activar tu consola de inmediato.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {/* PLAN 1: STARTER PARTNER */}
              <div className="bg-white rounded-3xl p-7 border-2 border-gray-200 shadow-sm flex flex-col justify-between hover:border-gray-400 transition">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-600">
                      Starter Partner
                    </span>
                    <span className="text-xs font-extrabold bg-gray-100 text-gray-900 px-3 py-1 rounded-full">
                      10 Clientes
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-gray-950 mb-1">Licencia Inicial 10</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-gray-950">$49</span>
                      <span className="text-xs font-bold text-gray-500">USD / mes</span>
                    </div>
                    <p className="text-xs text-emerald-700 font-bold mt-1.5">
                      💡 Ganas $250 USD/mes cobrando $25 por cliente
                    </p>
                  </div>

                  <ul className="pt-4 border-t border-gray-100 space-y-3 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Hasta <b>10 cuentas de clientes</b> activas</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Tu propio Logo y Marca</b> en el panel</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Tus propios links de cobro</b> (100% tuyo)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Los <b>5 giros comerciales</b> incluidos</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-7">
                  <a
                    href={starterHotmartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gray-950 hover:bg-gray-800 text-white font-black py-4 px-5 rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Comprar Starter ($49/mes)</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* PLAN 2: AGENCY PARTNER (DESTACADO) */}
              <div className="bg-gradient-to-b from-purple-50/70 via-white to-white rounded-3xl p-7 border-2 border-purple-600 shadow-xl flex flex-col justify-between relative md:-translate-y-2">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-sm whitespace-nowrap">
                  ⭐ Más Popular • Recomendado
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-700">
                      Agency Partner
                    </span>
                    <span className="text-xs font-extrabold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                      25 Clientes
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-gray-950 mb-1">Licencia Agencia 25</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-purple-700">$99</span>
                      <span className="text-xs font-bold text-gray-500">USD / mes</span>
                    </div>
                    <p className="text-xs text-emerald-700 font-bold mt-1.5">
                      💡 Ganas $625 USD/mes cobrando $25 por cliente
                    </p>
                  </div>

                  <ul className="pt-4 border-t border-gray-100 space-y-3 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Hasta <b>25 cuentas de clientes</b> activas</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>100% Marca Blanca</b> sin rastro de OmniTag</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Link de invitación propio</b> con tu logo</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Pasarela de pago propia</b> (0% comisión)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Menús, Citas, ECE Médico, Ruleta y NFC</b></span>
                    </li>
                  </ul>
                </div>

                <div className="pt-7">
                  <a
                    href={agencyHotmartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 px-5 rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Comprar Agency ($99/mes)</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* PLAN 3: COUNTRY PARTNER */}
              <div className="bg-white rounded-3xl p-7 border-2 border-gray-200 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                      Country Partner
                    </span>
                    <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                      100 Clientes
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-gray-950 mb-1">Licencia Nacional 100</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-gray-950">$199</span>
                      <span className="text-xs font-bold text-gray-500">USD / mes</span>
                    </div>
                    <p className="text-xs text-purple-700 font-bold mt-1.5">
                      💡 Ganas +$2,500 USD/mes (&lt;$2 USD por cuenta)
                    </p>
                  </div>

                  <ul className="pt-4 border-t border-gray-100 space-y-3 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Hasta <b>100 cuentas de clientes</b> activas</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Marca Blanca Total</b> para escalar en tu país</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Menor costo por cuenta</b> ($1.99 USD c/u)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>Soporte prioritario</b> directo por WhatsApp</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-7">
                  <a
                    href={enterpriseHotmartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-5 rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Comprar Country ($199/mes)</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SECCIÓN LIMPIA DE AFILIADOS HOTMART */}
        <section id="afiliados" className="py-12 sm:py-16 px-4 sm:px-6 bg-gray-50/70 border-t border-gray-100">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <span className="inline-block text-[11px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-3 py-1 rounded-full">
                Programa Oficial de Afiliados Hotmart
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                ¿Solo quieres recomendar la plataforma y ganar comisiones?
              </h2>
              <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                Únete gratis con 1 clic en Hotmart, comparte tus HotLinks de los planes ($49, $99 y $199) y recibe comisiones automáticas en dólares por cada venta.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
              <a
                href={affiliateSignupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black px-6 py-3.5 rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Afiliarme Gratis en Hotmart</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/activar-compra"
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-full text-xs sm:text-sm text-center transition"
              >
                Activar Licencia Comprada
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 6. FOOTER SIMPLE Y LIMPIO */}
      <footer className="border-t border-gray-200 bg-white py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-light.png"
              alt="OmniTag"
              width={26}
              height={26}
              className="w-6 h-6 object-contain"
            />
            <span className="font-black text-base text-gray-900">OmniTag</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pagos Seguros y Activación Inmediata vía Hotmart</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
            <Link href="/" className="hover:text-purple-700 transition">
              Inicio
            </Link>
            <Link href="/activar-compra" className="hover:text-purple-700 transition">
              Activar Compra
            </Link>
            <Link href="/login" className="hover:text-purple-700 transition">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
