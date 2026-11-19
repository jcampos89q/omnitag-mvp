import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Check, ShieldCheck, ArrowRight, Zap } from 'lucide-react'
import PaddleCheckoutButton from '@/components/PaddleCheckoutButton'
import LanguageSelector from '@/components/LanguageSelector'
import { getServerDictionary } from '@/lib/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getServerDictionary()
  return {
    title: `${dict.pricingPage.title} | OmniTag`,
    description: dict.pricingPage.subtitle,
    openGraph: {
      title: `${dict.pricingPage.title} | OmniTag`,
      description: dict.pricingPage.subtitle,
      locale: locale === 'en' ? 'en_US' : 'es_ES',
    },
  }
}

export default async function PricingPage() {
  const { dict } = await getServerDictionary()
  const proPriceId = process.env.NEXT_PUBLIC_PADDLE_PLAN_PRO_PRICE_ID || 'pri_01m7b4g3v0p8jdrszjpa3bbyfy'

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-black selection:text-white flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition">
            <Image
              src="/logo-light.png"
              alt="OmniTag"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span className="font-black text-xl tracking-tight text-gray-900">OmniTag</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector variant="pill" />
            <Link
              href="/login"
              className="text-xs font-bold text-gray-600 hover:text-black transition px-2 py-1.5"
            >
              {dict.common.login}
            </Link>
            <Link
              href="/register"
              className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs"
            >
              {dict.common.register}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12 flex-1 w-full">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-blue-200">
            <Zap className="w-4 h-4 text-blue-600" />
            {dict.pricingPage.badge}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
            {dict.pricingPage.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            {dict.pricingPage.subtitle}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Plan Negocio PRO (Cliente Final) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-600 shadow-xl flex flex-col justify-between relative">
            <div className="-top-3 left-1/2 -translate-x-1/2 absolute bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-0.5 rounded-full whitespace-nowrap">
              {dict.pricingPage.proCardBadge}
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-blue-700">
                  {dict.pricingPage.proCardType}
                </span>
                <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                  {dict.pricingPage.proCardScope}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-950">{dict.pricingPage.proPlanName}</h2>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-blue-700">{dict.pricingPage.proPlanPrice}</span>
                  <span className="text-xs font-bold text-gray-500">{dict.pricingPage.proPlanPeriod}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {dict.pricingPage.proPlanNotice}
                </p>
              </div>

              <ul className="pt-4 border-t border-gray-100 space-y-3 text-xs sm:text-sm text-gray-700">
                {dict.pricingPage.featuresList.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <PaddleCheckoutButton
                priceId={proPriceId}
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                <span>{dict.pricingPage.paddlePayBtn}</span>
              </PaddleCheckoutButton>
            </div>
          </div>

          {/* Card 2: Licencias para Agencias (Marca Blanca) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs flex flex-col justify-between hover:border-gray-300 transition">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-purple-700">
                  {dict.pricingPage.agencyBoxBadge}
                </span>
                <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                  Multi-Client
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-950">{dict.pricingPage.agencyBoxTitle}</h2>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-xs font-bold text-gray-500">From</span>
                  <span className="text-4xl font-black text-gray-950">$49</span>
                  <span className="text-xs font-bold text-gray-500">USD / mo</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {dict.pricingPage.agencyBoxDesc}
                </p>
              </div>

              <ul className="pt-4 border-t border-gray-100 space-y-3 text-xs sm:text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span><b>100% White-Label:</b> Zero mention of OmniTag to your clients</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Portal to create and manage <b>10, 25 or 100 businesses</b></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span><b>Keep 100% of client revenue</b> deposited directly to your bank</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Custom domain and logo on all web applications</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/agencias"
                className="w-full bg-gray-950 hover:bg-gray-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs"
              >
                <span>{dict.pricingPage.agencyBoxCta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Garantías legales visibles */}
        <div className="border-t border-gray-200 pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>7-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Instant 100% digital cloud activation</span>
          </div>
          <Link href="/terms" className="hover:text-black underline">
            {dict.common.terms}
          </Link>
          <Link href="/privacidad" className="hover:text-black underline">
            {dict.common.privacy}
          </Link>
          <Link href="/refunds" className="hover:text-black underline">
            {dict.common.refunds}
          </Link>
        </div>
      </main>

      {/* Footer selector */}
      <footer className="border-t border-gray-200 bg-white py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} OmniTag. {dict.common.allRightsReserved}</span>
          <LanguageSelector variant="footer" />
        </div>
      </footer>
    </div>
  )
}
