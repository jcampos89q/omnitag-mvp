import Link from 'next/link'
import Image from 'next/image'
import {
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react'
import CanvaWorkspaceShowcase from './CanvaWorkspaceShowcase'
import PaddleCheckoutButton from '@/components/PaddleCheckoutButton'

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
      {/* 1. HEADER LIMPIO Y 100% RESPONSIVO (MÓVIL, TABLET Y DESKTOP) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <Image
                src="/logo-light.png"
                alt="OmniTag"
                width={30}
                height={30}
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition group-hover:scale-105"
                priority
              />
              <span className="text-lg sm:text-xl font-black tracking-tight text-gray-950">OmniTag</span>
              <span className="hidden xs:inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Partners
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs lg:text-sm font-bold text-gray-600">
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

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link
              href="/activar-compra"
              className="text-xs font-bold text-gray-700 hover:text-gray-950 px-2.5 sm:px-3.5 py-2 rounded-xl hover:bg-gray-100 transition"
            >
              Activar Compra
            </Link>
            <a
              href="#planes-agencia"
              className="bg-gray-950 hover:bg-gray-800 text-white text-xs font-extrabold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition shadow-2xs flex items-center gap-1.5"
            >
              <span>Ver Planes</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO RESPONSIVO + EXPLORADOR DE CATEGORÍAS ESTILO CANVA */}
        <section id="explorar-app" className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-20 px-4 sm:px-6">
          <div className="absolute inset-x-0 top-0 -z-10 flex justify-center pointer-events-none">
            <div className="w-full max-w-[850px] h-[340px] bg-gradient-to-r from-purple-200/35 via-amber-100/35 to-purple-100/35 blur-3xl rounded-full" />
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-5 mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-purple-800 text-[11px] sm:text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Plataforma SaaS en Marca Blanca • Lista Para Vender</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-950 leading-[1.12]">
              Tu propia plataforma de software,{' '}
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 bg-clip-text text-transparent">
                con tu Logo y tus Precios.
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed px-1">
              Véndele suscripciones mensuales a Restaurantes, Barberías, Clínicas y Tiendas bajo tu propia marca y <b>quédate con el 100% de lo que cobres</b>.
            </p>
          </div>

          {/* PANEL DE CATEGORÍAS ESTILO CANVA */}
          <CanvaWorkspaceShowcase
            starterCheckoutUrl={starterHotmartUrl}
            agencyCheckoutUrl={agencyHotmartUrl}
            enterpriseCheckoutUrl={enterpriseHotmartUrl}
          />
        </section>

        {/* 3. CÓMO FUNCIONA (3 PASOS CLAROS, RESPONSIVOS EN MÓVIL/TABLET/DESKTOP) */}
        <section id="como-funciona" className="py-14 sm:py-20 px-4 sm:px-6 bg-gray-50/70 border-y border-gray-100">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-700">
                Sin programar nada
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-950">
                ¿Cómo funciona tu Agencia Marca Blanca?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-base flex items-center justify-center">
                  1
                </div>
                <h3 className="text-lg font-black text-gray-950">
                  Sube tu Logo y Nombre
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Al adquirir tu plan entras a tu Consola Partner, subes tu logo y defines el nombre de tu agencia. Tus clientes jamás ven OmniTag.
                </p>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-base flex items-center justify-center">
                  2
                </div>
                <h3 className="text-lg font-black text-gray-950">
                  Pon tus Precios y Pasarela
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Tú decides cuánto cobrarle a cada cliente (ej. $25 USD/mes) y conectas tu propio Stripe, Hotmart, Tilopay, PayPal o cuenta bancaria.
                </p>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-3 sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-base flex items-center justify-center">
                  3
                </div>
                <h3 className="text-lg font-black text-gray-950">
                  Crea Cuentas en 1 Clic
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Creas la cuenta de tu cliente, seleccionas su giro (Restaurante, Barbería, Clínica o Tienda) y controlas su fecha de vencimiento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. PLANES Y PRECIOS PROPORCIONADOS Y ELEGANTES (SIN BOTONES VERDES) */}
        <section id="planes-agencia" className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2.5">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Suscripciones Oficiales en Hotmart
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950">
                Elige el plan de tu Agencia
              </h2>
              <p className="text-xs sm:text-base text-gray-600 font-medium">
                Con 2 o 3 clientes recuperas tu mensualidad; el resto de tus cupos es ganancia neta para ti.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch">
              {/* PLAN 1: STARTER PARTNER */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-2xs flex flex-col justify-between hover:border-gray-300 transition">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                      Starter Partner
                    </span>
                    <span className="text-[11px] font-bold bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full">
                      10 Clientes
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-950">Licencia Inicial 10</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl sm:text-4xl font-black text-gray-950">$49</span>
                      <span className="text-xs font-bold text-gray-500">USD / mes</span>
                    </div>
                    <p className="text-xs text-purple-700 font-semibold mt-1">
                      Facturas hasta $250 USD/mes ($25/cliente)
                    </p>
                  </div>

                  <ul className="pt-4 border-t border-gray-100 space-y-2.5 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Hasta <b>10 cuentas de clientes</b> activas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><b>Tu propio Logo y Marca</b> en el panel</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><b>Tus propios links de cobro</b> (100% tuyo)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Los <b>5 giros comerciales</b> incluidos</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 space-y-2">
                  <PaddleCheckoutButton
                    priceId={process.env.NEXT_PUBLIC_PADDLE_AGENCY_STARTER_PRICE_ID || 'pri_01m7b4yqxqmn1x4bbc7kd8b4rz'}
                    className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <span>Pagar con Tarjeta / PayPal ($49/mes)</span>
                  </PaddleCheckoutButton>
                  <a
                    href={starterHotmartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                    <span>Alternativa: Pagar en Hotmart</span>
                  </a>
                </div>
              </div>

              {/* PLAN 2: AGENCY PARTNER (DESTACADO) */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border-2 border-purple-600 shadow-lg flex flex-col justify-between relative">
                <div className=" -top-3 left-1/2 -translate-x-1/2 absolute bg-purple-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3.5 py-0.5 rounded-full whitespace-nowrap">
                  ⭐ Más Popular
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-700">
                      Agency Partner
                    </span>
                    <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                      25 Clientes
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-950">Licencia Agencia 25</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl sm:text-4xl font-black text-purple-700">$99</span>
                      <span className="text-xs font-bold text-gray-500">USD / mes</span>
                    </div>
                    <p className="text-xs text-purple-700 font-semibold mt-1">
                      Facturas hasta $625 USD/mes ($25/cliente)
                    </p>
                  </div>

                  <ul className="pt-4 border-t border-gray-100 space-y-2.5 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Hasta <b>25 cuentas de clientes</b> activas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><b>100% Marca Blanca</b> sin rastro de OmniTag</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><b>Link de invitación propio</b> con tu logo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><b>Pasarela de pago propia</b> (0% comisión)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><b>Menús, Citas, ECE Médico, Ruleta y NFC</b></span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 space-y-2">
                  <PaddleCheckoutButton
                    priceId={process.env.NEXT_PUBLIC_PADDLE_AGENCY_PRO_PRICE_ID || 'pri_01m7b5999d227mew1kmd1mn0gd'}
                    className="w-full bg-linear-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <span>Pagar con Tarjeta / PayPal ($99/mes)</span>
                  </PaddleCheckoutButton>
                  <a
                    href={agencyHotmartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                    <span>Alternativa: Pagar en Hotmart</span>
                  </a>
                </div>
              </div>

              {/* PLAN 3: COUNTRY PARTNER */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-2xs flex flex-col justify-between hover:border-gray-300 transition">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-700">
                      Country Partner
                    </span>
                    <span className="text-[11px] font-bold bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full">
                      100 Clientes
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-950">Licencia Nacional 100</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl sm:text-4xl font-black text-gray-950">$199</span>
                      <span className="text-xs font-bold text-gray-500">USD / mes</span>
                    </div>
                    <p className="text-xs text-purple-700 font-semibold mt-1">
                      Facturas +$2,500 USD/mes (&lt;$2 por cuenta)
                    </p>
                  </div>

                  <ul className="pt-4 border-t border-gray-100 space-y-2.5 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Hasta <b>100 cuentas de clientes</b> activas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><b>Marca Blanca Total</b> para escalar en tu país</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><b>Menor costo por cuenta</b> ($1.99 USD c/u)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><b>Soporte prioritario</b> directo por WhatsApp</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 space-y-2">
                  <PaddleCheckoutButton
                    priceId={process.env.NEXT_PUBLIC_PADDLE_AGENCY_ENTERPRISE_PRICE_ID || 'pri_01m7b5c5zsva2rb1g2za305nbh'}
                    className="w-full bg-linear-to-r from-gray-900 to-gray-950 hover:from-black hover:to-gray-900 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer border border-gray-800"
                  >
                    <span>Pagar con Tarjeta / PayPal ($199/mes)</span>
                  </PaddleCheckoutButton>
                  <a
                    href={enterpriseHotmartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                    <span>Alternativa: Pagar en Hotmart</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SECCIÓN LIMPIA DE AFILIADOS HOTMART (SIN BOTONES VERDES CHILLONES) */}
        <section id="afiliados" className="py-12 sm:py-16 px-4 sm:px-6 bg-gray-50/70 border-t border-gray-100">
          <div className="max-w-5xl mx-auto bg-gray-950 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-2.5 text-center md:text-left max-w-xl">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                Programa Oficial de Afiliados Hotmart
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
                ¿Prefieres recomendar la plataforma y ganar comisiones?
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Únete gratis con 1 clic en Hotmart, comparte tus HotLinks de los planes ($49, $99 y $199) y recibe comisiones automáticas en dólares por cada venta.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
              <a
                href={affiliateSignupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-gray-100 text-gray-950 font-bold py-3 px-5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <span>Afiliarme Gratis en Hotmart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <Link
                href="/activar-compra"
                className="bg-white/10 hover:bg-white/15 text-white font-semibold py-2.5 px-5 rounded-xl text-xs text-center transition"
              >
                Activar Licencia Comprada
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 6. FOOTER SIMPLE Y RESPONSIVO */}
      <footer className="border-t border-gray-200 bg-white py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-light.png"
              alt="OmniTag"
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
            />
            <span className="font-black text-base text-gray-900">OmniTag</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Pagos Seguros y Facturación Digital Oficial</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
            <Link href="/" className="hover:text-purple-700 transition">
              Inicio
            </Link>
            <Link href="/privacidad" className="hover:text-purple-700 transition">
              Términos y Privacidad
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
