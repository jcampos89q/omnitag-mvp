import { login } from '@/app/auth/actions'
import Link from 'next/link'
import FriendlyErrorAlert from '@/components/FriendlyErrorAlert'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-md">
            O
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Bienvenido a OmniTag
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <form className="mt-8 space-y-5" action={login}>
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
                  href="/forgot-password"
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

        <p className="text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="font-bold text-black hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
