import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import { ArrowLeft, ShieldCheck, Sparkles, CreditCard, ArrowRight, Building2 } from 'lucide-react'
import FriendlyErrorAlert from '@/components/FriendlyErrorAlert'
import RegisterForm from './RegisterForm'
import LanguageSelector from '@/components/LanguageSelector'
import { getPartnerBrandById } from '@/lib/whitelabel'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; token?: string; partner?: string }>
}) {
  const params = await searchParams
  const headersList = await headers()
  const effectivePartnerId = params?.partner || headersList.get('x-partner-id') || undefined
  const isCustomDomain = Boolean(headersList.get('x-custom-domain'))
  const isAgencyPortal = headersList.get('x-agency-portal') === 'true'
  const partnerBrand = await getPartnerBrandById(effectivePartnerId)
  const hasValidInviteOrToken = Boolean(params?.token || partnerBrand)

  const displayBrandName = partnerBrand?.brand_name || (isAgencyPortal ? 'Portal SaaS' : 'OmniTag')
  const displayLogo = partnerBrand?.logo_url || '/logo-light.png'
  const loginHref = partnerBrand && effectivePartnerId && !isCustomDomain
    ? `/login?partner=${encodeURIComponent(effectivePartnerId)}`
    : '/login'
  const homeUrl = partnerBrand?.website_url || (partnerBrand || isAgencyPortal ? loginHref : '/')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans antialiased">
      {/* Barra superior con botón volver y selector de idioma */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        {((!partnerBrand && !isAgencyPortal) || Boolean(partnerBrand?.website_url)) ? (
          <Link 
            href={homeUrl} 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition bg-white hover:bg-gray-100 px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Inicio</span>
          </Link>
        ) : (
          <div />
        )}
        <LanguageSelector variant="pill" />
      </div>

      <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="text-center">
          <Link href={homeUrl} title="Volver a la página principal" className="inline-block hover:scale-105 transition-transform mb-3">
            {displayLogo.startsWith('/') ? (
              <Image
                src={displayLogo}
                alt={displayBrandName}
                width={64}
                height={64}
                className="w-16 h-16 object-contain mx-auto"
                priority
              />
            ) : (
              <img
                src={displayLogo}
                alt={displayBrandName}
                className="w-16 h-16 object-contain mx-auto rounded-xl"
              />
            )}
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950">
            {hasValidInviteOrToken ? 'Activa tu Cuenta' : 'Acceso Exclusivo con Licencia'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 font-medium">
            {hasValidInviteOrToken
              ? `Completa tus datos para comenzar en ${displayBrandName}`
              : 'Para crear tu cuenta necesitas contar con una suscripción activa o un código de activación digital.'}
          </p>
        </div>

        {params?.error && (
          <FriendlyErrorAlert error={params.error} />
        )}

        {params?.message && (
          <div className="text-emerald-700 text-sm text-center bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
            {params.message}
          </div>
        )}

        {hasValidInviteOrToken ? (
          <RegisterForm 
            token={params?.token} 
            partnerId={partnerBrand ? effectivePartnerId : undefined}
            error={params?.error} 
            message={params?.message} 
          />
        ) : (
          /* Pantalla de suscripción y registro digital */
          <div className="space-y-4">
            {/* Opción 1: Contratar Suscripción Digital */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-purple-600" />
                1. Suscripción Digital PRO
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Obtén acceso inmediato a todas las herramientas digitales profesionales (Menús QR, Agendas, Fidelización y vCard) con facturación oficial por Paddle:
              </p>
              <Link
                href="/pricing"
                className="w-full py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs"
              >
                <span>Ver Planes y Suscribirme ($25 USD/mes)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Opción 2: Tiene código de Invitación o Canje Digital */}
            <form action="/register" method="GET" className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5">
              <div className="flex items-center gap-2 text-gray-800 font-extrabold text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-gray-600" />
                2. ¿Tienes un Código de Canje o Cupón Digital?
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="token"
                  required
                  placeholder="Código de canje o activación"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white text-gray-900 focus:border-black focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs transition cursor-pointer shrink-0"
                >
                  Validar
                </button>
              </div>
            </form>
          </div>
        )}

        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta activa?{' '}
          <Link href={loginHref} className="font-bold text-black hover:underline">
            Inicia sesión aquí
          </Link>
        </p>

        <div className="pt-4 border-t border-gray-100 text-center">
          <Link 
            href="/privacidad" 
            target="_blank" 
            className="text-[11px] font-bold text-gray-400 hover:text-black hover:underline"
          >
            Políticas de Privacidad & Tratamiento de Datos
          </Link>
        </div>
      </div>
    </div>
  )
}
