import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import { ArrowLeft, ShieldCheck, Sparkles, CreditCard, ArrowRight, Building2 } from 'lucide-react'
import FriendlyErrorAlert from '@/components/FriendlyErrorAlert'
import RegisterForm from './RegisterForm'
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
  const partnerBrand = await getPartnerBrandById(effectivePartnerId)
  const hasValidInviteOrToken = Boolean(params?.token || partnerBrand)

  const displayBrandName = partnerBrand?.brand_name || 'OmniTag'
  const displayLogo = partnerBrand?.logo_url || '/logo-light.png'
  const loginHref = partnerBrand && effectivePartnerId && !isCustomDomain
    ? `/login?partner=${encodeURIComponent(effectivePartnerId)}`
    : '/login'
  const homeUrl = partnerBrand?.website_url || (partnerBrand ? loginHref : '/')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans antialiased">
      {/* Botón para regresar al inicio de la web */}
      {(!partnerBrand || Boolean(partnerBrand.website_url)) && (
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        <Link 
          href={homeUrl} 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition bg-white hover:bg-gray-100 px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Inicio</span>
        </Link>
        <span className="text-xs font-medium text-gray-400">{displayBrandName}</span>
      </div>
      )}

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
              : 'Para crear tu cuenta necesitas haber adquirido tu suscripción en Hotmart o contar con un dispositivo físico NFC.'}
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
          /* Pantalla de bloqueo de registro libre sin pago */
          <div className="space-y-4">
            {/* Opción 1: Ya compró en Hotmart */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                1. ¿Ya realizaste tu pago en Hotmart?
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Si ya compraste tu suscripción o Licencia Marca Blanca en Hotmart, activa tu cuenta y contraseña en un paso:
              </p>
              <Link
                href="/activar-compra"
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Activar Mi Compra de Hotmart</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Opción 2: Comprar Licencia / Suscripción */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-purple-600" />
                2. ¿Aún no tienes una Licencia Activa?
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Adquiere tu suscripción para negocio o tu Licencia de Agencia SaaS Marca Blanca en Hotmart:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link
                  href="/agencias"
                  className="py-2.5 px-3 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs text-center transition"
                >
                  Licencia Marca Blanca
                </Link>
                <Link
                  href="/#precios"
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-bold text-xs text-center transition"
                >
                  Planes para mi Negocio
                </Link>
              </div>
            </div>

            {/* Opción 3: Tiene código de Tarjeta Física NFC */}
            <form action="/register" method="GET" className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5">
              <div className="flex items-center gap-2 text-gray-800 font-extrabold text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-gray-600" />
                3. ¿Tienes una Tarjeta o Placa NFC física?
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="token"
                  required
                  placeholder="Código de tu tarjeta NFC"
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
