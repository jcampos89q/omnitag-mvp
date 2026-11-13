import { forgotPassword } from '@/app/auth/actions'
import Link from 'next/link'
import { KeyRound, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import { getPartnerBrandById } from '@/lib/whitelabel'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; email?: string; partner?: string }>
}) {
  const params = await searchParams
  const partnerBrand = await getPartnerBrandById(params?.partner)
  const isWhiteLabel = Boolean(partnerBrand)
  const loginHref = isWhiteLabel ? `/login?partner=${encodeURIComponent(params.partner!)}` : '/login'
  const homeHref = isWhiteLabel ? loginHref : '/'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      {/* Botón para regresar al inicio de la web (solo OmniTag directo) */}
      {!isWhiteLabel && (
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition bg-white hover:bg-gray-100 px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Inicio</span>
        </Link>
        <span className="text-xs font-medium text-gray-400">OmniTag Web</span>
      </div>
      )}

      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <div className="text-center">
          <Link href={homeHref} title="Volver" className="inline-block hover:scale-105 transition-transform">
            {isWhiteLabel && partnerBrand?.logo_url && !partnerBrand.logo_url.startsWith('/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={partnerBrand.logo_url} alt={partnerBrand.brand_name} className="w-14 h-14 object-contain mx-auto mb-3 rounded-xl" />
            ) : (
            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
              <KeyRound className="w-6 h-6" />
            </div>
            )}
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-1.5 text-xs text-gray-500">
            Ingresa tu correo electrónico registrado y te enviaremos las instrucciones para restablecer tu contraseña.
          </p>
        </div>

        {params?.success ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-sm">¡Correo de recuperación enviado!</p>
              <p className="leading-relaxed">
                Hemos enviado un enlace seguro a <b>{params.email}</b>. Revisa tu bandeja de entrada o carpeta de spam para restablecer tu clave.
              </p>
            </div>

            <Link
              href={loginHref}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-black hover:underline pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Iniciar Sesión</span>
            </Link>
          </div>
        ) : (
          <form className="space-y-4" action={forgotPassword}>
            {isWhiteLabel && <input type="hidden" name="partner" value={params.partner} />}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>
            </div>

            {params?.error && (
              <div className="text-red-600 text-xs text-center bg-red-50 border border-red-200 p-3 rounded-xl font-medium">
                {params.error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center rounded-xl bg-black px-4 py-3 text-xs font-extrabold text-white hover:bg-gray-800 focus:outline-none shadow-md transition cursor-pointer"
            >
              Enviar Enlace de Recuperación
            </button>

            <div className="text-center pt-2">
              <Link
                href={loginHref}
                className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-black hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Iniciar Sesión</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
