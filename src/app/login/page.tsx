import { login } from '@/app/auth/actions'
import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import FriendlyErrorAlert from '@/components/FriendlyErrorAlert'
import { getPartnerBrandById } from '@/lib/whitelabel'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string; partner?: string }>
}) {
  const params = await searchParams
  const headersList = await headers()
  const effectivePartnerId = params?.partner || headersList.get('x-partner-id') || undefined
  const isCustomDomain = Boolean(headersList.get('x-custom-domain'))
  const isAgencyPortal = headersList.get('x-agency-portal') === 'true'
  const partnerBrand = await getPartnerBrandById(effectivePartnerId)
  const isWhiteLabel = Boolean(partnerBrand)
  const hideOmniTagLinks = isWhiteLabel || isAgencyPortal

  const brandName = partnerBrand?.brand_name || (isAgencyPortal ? 'Portal SaaS' : 'OmniTag')
  const brandLogo = partnerBrand?.logo_url || '/logo-light.png'
  const homeUrl = partnerBrand?.website_url || (hideOmniTagLinks ? '#' : '/')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      {/* Botón superior: solo si NO es marca blanca ni portal de agencia */}
      {!hideOmniTagLinks && (
        <div className="w-full max-w-md mb-3 flex items-center justify-between">
          <Link 
            href={homeUrl} 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition bg-white hover:bg-gray-100 px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Inicio</span>
          </Link>
          <span className="text-xs font-medium text-gray-400">OmniTag Web</span>
        </div>
      )}

      {isWhiteLabel && partnerBrand?.website_url && (
        <div className="w-full max-w-md mb-3 flex items-center justify-between">
          <a 
            href={partnerBrand.website_url} 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition bg-white hover:bg-gray-100 px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a {brandName}</span>
          </a>
          <span className="text-xs font-medium text-gray-400">Acceso Seguro</span>
        </div>
      )}

      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="inline-block mb-3">
            {brandLogo.startsWith('/') ? (
              <Image
                src={brandLogo}
                alt={brandName}
                width={64}
                height={64}
                className="w-16 h-16 object-contain mx-auto"
                priority
              />
            ) : (
              <img
                src={brandLogo}
                alt={brandName}
                className="w-16 h-16 object-contain mx-auto rounded-xl"
              />
            )}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
            {isWhiteLabel ? `Portal ${brandName}` : isAgencyPortal ? 'Portal de Acceso' : 'Bienvenido a OmniTag'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <form className="mt-8 space-y-5" action={login}>
          {params?.next && (
            <input type="hidden" name="next" value={params.next} />
          )}
          {isWhiteLabel && effectivePartnerId && !isCustomDomain && (
            <input type="hidden" name="partner" value={effectivePartnerId} />
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none text-sm shadow-2xs"
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase">
                  Contraseña
                </label>
                <Link
                  href={isWhiteLabel && effectivePartnerId && !isCustomDomain ? `/forgot-password?partner=${encodeURIComponent(effectivePartnerId)}` : '/forgot-password'}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none text-sm shadow-2xs"
                placeholder="••••••••"
              />
            </div>
          </div>

          {params?.error && (
            <FriendlyErrorAlert error={params.error} />
          )}

          {params?.message && (
            <div className="text-emerald-800 text-xs text-center bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-medium">
              {params.message}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center rounded-xl bg-black px-4 py-3 text-sm font-extrabold text-white hover:bg-gray-800 focus:outline-none shadow-md transition cursor-pointer"
            >
              Iniciar sesión
            </button>
          </div>
        </form>

        {/* Enlaces inferiores: solo para usuarios directos de OmniTag */}
        {!hideOmniTagLinks ? (
          <div className="text-center text-xs sm:text-sm text-gray-600 space-y-1.5">
            <p>
              ¿Ya realizaste tu pago en Hotmart?{' '}
              <Link href="/activar-compra" className="font-extrabold text-purple-700 hover:underline">
                Activa tu acceso aquí
              </Link>
            </p>
            <p className="text-xs text-gray-500">
              ¿Aún no tienes licencia?{' '}
              <Link href="/agencias" className="font-bold text-black hover:underline">
                Ver Licencias Marca Blanca
              </Link>{' '}
              o{' '}
              <Link href="/pricing" className="font-bold text-purple-700 hover:underline">
                Ver Planes para Comercios
              </Link>
            </p>
          </div>
        ) : (
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p className="font-medium">
              Plataforma tecnológica exclusiva para clientes de <b>{brandName}</b>.
            </p>
          </div>
        )}

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
