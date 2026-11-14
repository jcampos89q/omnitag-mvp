import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Check, ShieldCheck, ArrowRight, Zap, Building2, Store } from 'lucide-react'
import PaddleCheckoutButton from '@/components/PaddleCheckoutButton'

export const metadata: Metadata = {
  title: 'Planes y Precios Oficiales | OmniTag',
  description: 'Conoce los planes de suscripción para comercios y negocios en OmniTag. Fidelización, reseñas Google y herramientas interactivas.',
}

export default function PricingPage() {
  const proPriceId = process.env.NEXT_PUBLIC_PADDLE_PLAN_PRO_PRICE_ID || 'pri_01m7b4g3v0p8jdrszjpa3bbyfy'

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-black selection:text-white">
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
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-gray-600 hover:text-black transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-blue-200">
            <Zap className="w-4 h-4 text-blue-600" />
            Precios Transparentes para Comercios
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
            Planes y Precios Oficiales
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Impulsa las ventas recurrentes de tu negocio, captura datos de clientes y multiplica tus reseñas de Google.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Plan Negocio PRO (Cliente Final) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-600 shadow-xl flex flex-col justify-between relative">
            <div className=" -top-3 left-1/2 -translate-x-1/2 absolute bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-0.5 rounded-full whitespace-nowrap">
              ⭐ Plan Comercio Recomendado
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-blue-700">
                  Comercio / Negocio Directo
                </span>
                <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                  1 Negocio
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-950">OmniTag Negocio PRO</h2>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-blue-700">$25</span>
                  <span className="text-xs font-bold text-gray-500">USD / mes</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Acceso completo sin contratos de permanencia. Cancela cuando quieras.
                </p>
              </div>

              <ul className="pt-4 border-t border-gray-100 space-y-3 text-xs sm:text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span><b>Captura Inteligente de Reseñas Google 5 Estrellas</b></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span><b>Tarjetas Digitales de Fidelización y Sellos</b></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span><b>Ruleta de Premios Interactiva</b> para mesas y mostradores</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span><b>Generador de Códigos QR HD</b> en vectores para imprenta</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Soporte técnico directo y actualizaciones continuas</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <PaddleCheckoutButton
                priceId={proPriceId}
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                <span>Suscribirme al Plan PRO ($25/mes)</span>
              </PaddleCheckoutButton>
            </div>
          </div>

          {/* Card 2: Licencias para Agencias (Marca Blanca) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs flex flex-col justify-between hover:border-gray-300 transition">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-purple-700">
                  Agencias y Revendedores
                </span>
                <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                  Multi-Cuentas
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-950">Planes Marca Blanca</h2>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-xs font-bold text-gray-500">Desde</span>
                  <span className="text-4xl font-black text-gray-950">$49</span>
                  <span className="text-xs font-bold text-gray-500">USD / mes</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Revende la plataforma a tus clientes bajo tu propio nombre y logo.
                </p>
              </div>

              <ul className="pt-4 border-t border-gray-100 space-y-3 text-xs sm:text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span><b>100% Marca Blanca:</b> Sin mención de OmniTag ante tus clientes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Panel para crear y gestionar <b>10, 25 o 100 negocios</b></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span><b>Cobro directo del 100%</b> a tus clientes a tus cuentas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Dominio propio y logo personalizado en todas las apps</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="https://agencias.omnitag.site"
                className="w-full bg-gray-950 hover:bg-gray-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs"
              >
                <span>Ver Planes para Agencias ($49 - $199)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Garantías legales visibles */}
        <div className="border-t border-gray-200 pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Garantía de reembolso de 7 días</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Activación inmediata 100% digital</span>
          </div>
          <Link href="/terms" className="hover:text-black underline">
            Términos de servicio
          </Link>
          <Link href="/privacidad" className="hover:text-black underline">
            Políticas de privacidad
          </Link>
          <Link href="/refunds" className="hover:text-black underline">
            Política de reembolso
          </Link>
        </div>
      </main>
    </div>
  )
}
