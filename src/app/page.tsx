import Link from 'next/link'
import Image from 'next/image'
import { 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ChevronRight, 
  Tag, 
  Check, 
  ShieldCheck
} from 'lucide-react'
import LandingNavbar from '@/components/LandingNavbar'
import InteractiveHeroShowcase from '@/components/InteractiveHeroShowcase'
import LandingFaq from '@/components/LandingFaq'
import LanguageSelector from '@/components/LanguageSelector'
import PaddleCheckoutButton from '@/components/PaddleCheckoutButton'
import HotmartCheckoutButton from '@/components/HotmartCheckoutButton'
import { getServerDictionary } from '@/lib/i18n/server'

export default async function LandingPage() {
  const { dict, locale } = await getServerDictionary()
  const isEn = locale === 'en'

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-black selection:text-white font-sans antialiased">
      {/* 0. CINTILLO SUPERIOR DE OFERTA */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-emerald-700 text-white py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
        <span className="bg-yellow-400 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">
          {dict.banner.badge}
        </span>
        <span className="truncate sm:overflow-visible sm:whitespace-normal">
          {dict.banner.text}
        </span>
        <a 
          href="#precios" 
          className="hidden sm:inline-flex items-center gap-1 underline font-black text-yellow-300 hover:text-white transition ml-1 shrink-0"
        >
          <span>{dict.banner.cta}</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* 1. NAVEGACIÓN PRINCIPAL */}
      <LandingNavbar />

      {/* 2. HERO SECTION */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-10 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 border-b border-gray-100 bg-gradient-to-b from-white via-gray-50/50 to-white">
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] bg-gradient-to-tr from-amber-100/40 via-purple-100/40 to-emerald-50/40 rounded-full blur-3xl opacity-80" />
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-current animate-pulse" />
              <span>{dict.hero.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-950 leading-[1.08]">
              {dict.hero.titleLine1} <br />
              <span className="bg-gradient-to-r from-purple-600 via-amber-600 to-emerald-600 bg-clip-text text-transparent">
                {dict.hero.titleLine2}
              </span>
            </h1>

            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
              {dict.hero.description}
            </p>

            {/* Botones de Acción */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
              <a 
                href="#precios" 
                className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl font-black text-sm sm:text-base hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl cursor-pointer"
              >
                <span>{dict.hero.ctaPricing}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link 
                href="/pricing" 
                className="w-full sm:w-auto bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-6 py-4 rounded-2xl font-bold text-sm sm:text-base transition flex items-center justify-center gap-2"
              >
                <Tag className="w-4 h-4 text-purple-700" />
                <span>{dict.common.pricing}</span>
              </Link>
            </div>

            {/* Badges de Garantía y Beneficios */}
            <div className="pt-1 flex flex-wrap items-center justify-center gap-y-2 gap-x-4 text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <b>{isEn ? 'Instant cloud activation' : 'Activación inmediata'}</b> {isEn ? 'via secure encrypted billing' : 'con facturación digital segura'}
              </span>
              <span className="flex items-center gap-1.5 text-gray-700">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                {dict.industries.subtitle}
              </span>
              <span className="flex items-center gap-1.5 text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                <Tag className="w-3.5 h-3.5 text-purple-600" />
                {isEn ? '$15 USD / month • Cancel anytime' : 'Suscripción mensual $15 USD (~L 427 HNL) • Cancela cuando quieras'}
              </span>
            </div>

            {/* MOCKUP INTERACTIVO EN VIVO */}
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
                {isEn ? 'TAILORED FOR YOUR BUSINESS INDUSTRY' : 'ADAPTADO A LA MEDIDA DE TU COMERCIO'}
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                {dict.industries.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {dict.industries.items.map((ind, i) => (
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
              {dict.features.badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
              {dict.features.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              {dict.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* CARD 1: RESTAURANTES & MENÚS CON TURNOS */}
            <div id="restaurantes" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xl shadow-xs">
                    🍽️
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {dict.features.menu.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-amber-900 transition">
                    {dict.features.menu.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    {dict.features.menu.desc}
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-gray-100">
                  {dict.features.menu.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <a
                  href="#precios"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-900 hover:text-amber-700 transition"
                >
                  <span>{isEn ? 'Create digital menu' : 'Crear menú para mi restaurante'}</span>
                  <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* CARD 2: RULETA DE PREMIOS EN MESA */}
            <div id="gamificacion" className="bg-gradient-to-b from-amber-50/50 via-white to-white rounded-3xl p-6 sm:p-7 border-2 border-amber-400 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-xs">
                    🎰
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600 fill-current" />
                    <span>{dict.features.wheel.tag}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-amber-950 transition">
                    {dict.features.wheel.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    {dict.features.wheel.desc}
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-amber-100">
                  {dict.features.wheel.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <a
                  href="#precios"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-900 hover:text-amber-700 transition"
                >
                  <span>{isEn ? 'Activate Prize Wheel' : 'Activar ruleta y promociones'}</span>
                  <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* CARD 3: CITAS & AGENDAS */}
            <div id="citas" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-purple-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xl shadow-xs">
                    💈
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                    {dict.features.appointments.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-purple-900 transition">
                    {dict.features.appointments.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    {dict.features.appointments.desc}
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-gray-100">
                  {dict.features.appointments.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <a
                  href="#precios"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-900 hover:text-purple-700 transition"
                >
                  <span>{isEn ? 'Enable 24/7 booking' : 'Activar agenda para mi salón o clínica'}</span>
                  <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* CARD 4: RESEÑAS GOOGLE & SMART REVIEW */}
            <div id="reputacion" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-yellow-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-700 flex items-center justify-center font-black text-xl shadow-xs">
                    ⭐
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-900 border border-yellow-300">
                    {dict.features.reviews.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-yellow-900 transition">
                    {dict.features.reviews.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    {dict.features.reviews.desc}
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-gray-100">
                  {dict.features.reviews.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <a
                  href="#precios"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-yellow-950 hover:text-yellow-700 transition"
                >
                  <span>{isEn ? 'Shield Google reputation' : 'Blindar mi reputación en Google'}</span>
                  <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </a>
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
                    {dict.features.vcard.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-blue-900 transition">
                    {dict.features.vcard.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    {dict.features.vcard.desc}
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-gray-100">
                  {dict.features.vcard.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <a
                  href="#precios"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-900 hover:text-blue-700 transition"
                >
                  <span>{isEn ? 'Create professional vCard' : 'Diseñar mi vCard profesional'}</span>
                  <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* CARD 6: ESTUDIO QR */}
            <div id="estudio-qr" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-pink-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center font-black text-xl shadow-xs">
                    🎨
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-50 text-pink-800 border border-pink-200">
                    {dict.features.qrStudio.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-pink-900 transition">
                    {dict.features.qrStudio.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    {dict.features.qrStudio.desc}
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-gray-100">
                  {dict.features.qrStudio.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <a
                  href="#precios"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-pink-900 hover:text-pink-700 transition"
                >
                  <span>{isEn ? 'Generate vector QRs' : 'Descargar códigos QR en HD'}</span>
                  <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CÓMO FUNCIONA EN 3 PASOS */}
        <section className="py-16 sm:py-24 bg-gray-50 border-y border-gray-200 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                {dict.howItWorks.tag}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                {dict.howItWorks.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                {dict.howItWorks.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-3 text-center">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto shadow-xs">
                  1
                </div>
                <h3 className="font-extrabold text-base text-gray-900">{dict.howItWorks.step1.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {dict.howItWorks.step1.desc}
                </p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-3 text-center">
                <div className="w-12 h-12 bg-purple-700 text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto shadow-xs">
                  2
                </div>
                <h3 className="font-extrabold text-base text-gray-900">{dict.howItWorks.step2.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {dict.howItWorks.step2.desc}
                </p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-3 text-center">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto shadow-xs">
                  3
                </div>
                <h3 className="font-extrabold text-base text-gray-900">{dict.howItWorks.step3.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {dict.howItWorks.step3.desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. TABLA DE PRECIOS */}
        <section id="precios" className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-white via-purple-50/20 to-white">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                {dict.pricingSection.tag}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                {dict.pricingSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                {dict.pricingSection.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6 lg:gap-8 items-stretch">
              {/* PLAN 1: MENSUALIDAD PRO */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-purple-600 shadow-xl flex flex-col justify-between relative transform md:-translate-y-2">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md whitespace-nowrap">
                  ⭐ {dict.pricingSection.proPlan.badge}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-700">{isEn ? 'Monthly Access' : 'Membresía Completa'}</span>
                    <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                      {isEn ? 'All Included' : 'Todo Incluido'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{dict.pricingSection.proPlan.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{dict.pricingSection.proPlan.billedMonthly}</p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-purple-700">{dict.pricingSection.proPlan.priceMonthly}</span>
                      <span className="text-xs text-gray-500 font-bold ml-1">{dict.pricingSection.proPlan.periodMonthly}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium mt-1">
                      {dict.pricingSection.proPlan.billedMonthly}
                    </p>
                  </div>

                  <div className="pt-4 space-y-2.5 border-t border-gray-100 text-xs text-gray-700">
                    {dict.pricingSection.proPlan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <HotmartCheckoutButton
                    plan="monthly"
                    className="w-full bg-black hover:bg-gray-800 text-white font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <span>{dict.pricingSection.proPlan.ctaMonthly}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </HotmartCheckoutButton>
                </div>
              </div>

              {/* PLAN 2: PLAN ANUAL PRO CLOUD */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700">{isEn ? 'Annual Cloud SaaS' : 'Plan Anual SaaS'}</span>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {dict.pricingSection.annualBadge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{isEn ? 'Annual Business PRO' : 'Suscripción Anual PRO'}</h3>
                    <p className="text-xs text-gray-500 mt-1">{dict.pricingSection.proPlan.billedAnnual}</p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline flex-wrap gap-1.5">
                      <span className="text-4xl font-black text-gray-900">{dict.pricingSection.proPlan.priceAnnual}</span>
                      <span className="text-xs text-gray-500 font-bold">{dict.pricingSection.proPlan.periodAnnual}</span>
                      <span className="text-sm text-gray-400 line-through font-bold ml-1">$180 USD</span>
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {isEn ? 'SAVE $80 USD • 44% OFF' : 'AHORRAS $80 USD • 44% OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-bold mt-1.5">
                      {dict.pricingSection.proPlan.billedAnnual}
                    </p>
                  </div>

                  <div className="pt-4 space-y-2.5 border-t border-gray-100 text-xs text-gray-700">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isEn ? '🔥 5+ Free Months Included ($80 USD savings)' : '🔥 Más de 5 meses gratis incluidos (Ahorras $80 USD directos)'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><b>{isEn ? '12 months of PRO access' : '12 meses de suscripción PRO'}</b> {isEn ? 'fully included' : 'completamente incluidos'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isEn ? 'HD QR Code Generator and unlimited cloud vCards' : 'Generador QR HD y vCards digitales ilimitadas'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isEn ? 'Prize Wheel and interactive cloud catalog' : 'Ruleta de premios y catálogo interactivo en la nube'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isEn ? 'Priority customer support and instant updates' : 'Soporte prioritario y actualizaciones continuas'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <HotmartCheckoutButton
                    plan="annual"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <span>{dict.pricingSection.proPlan.ctaAnnual}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </HotmartCheckoutButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PREGUNTAS FRECUENTES (FAQ) */}
        <section id="faq" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              {dict.faqSection.tag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              {dict.faqSection.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              {dict.faqSection.subtitle}
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
                {dict.banner.badge}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {isEn ? 'Start digitizing your business today' : 'Empieza a digitalizar tu negocio hoy mismo'}
              </h2>
              <p className="text-xs sm:text-base text-gray-300 max-w-lg mx-auto font-medium leading-relaxed">
                {dict.hero.description}
              </p>
            </div>

            <div className="relative pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a 
                href="#precios" 
                className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition shadow-lg cursor-pointer"
              >
                {dict.hero.ctaPricing}
              </a>
              <Link 
                href="/pricing" 
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl text-xs sm:text-sm transition"
              >
                {dict.common.pricing}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 9. FOOTER PROFESIONAL */}
      <footer className="border-t border-gray-200 bg-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
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
            <span>{dict.common.securePaddleBilling}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 flex-wrap justify-center sm:justify-start">
            <Link href="/pricing" className="hover:text-black hover:underline">
              {dict.footer.links.pricing}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-black hover:underline">
              {dict.footer.links.terms}
            </Link>
            <span>•</span>
            <Link href="/privacidad" className="hover:text-black hover:underline">
              {dict.footer.links.privacy}
            </Link>
            <span>•</span>
            <Link href="/refunds" className="hover:text-black hover:underline">
              {dict.footer.links.refunds}
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-black hover:underline">
              {dict.footer.links.login}
            </Link>
          </div>

          <LanguageSelector variant="footer" />

          <p className="text-gray-400 text-xs font-medium">
            © {new Date().getFullYear()} OmniTag. {dict.common.allRightsReserved}
          </p>
        </div>
      </footer>
    </div>
  )
}
