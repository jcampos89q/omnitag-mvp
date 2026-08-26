import { login } from '@/app/auth/actions'
import Link from 'next/link'

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
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Bienvenido a OmniTag
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <form className="mt-8 space-y-6" action={login}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                placeholder="Correo electrónico"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                placeholder="Contraseña"
              />
            </div>
          </div>

          {params?.error && (
            <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 p-3 rounded-lg">
              {params.error}
            </div>
          )}

          {params?.message && (
            <div className="text-emerald-700 text-sm text-center bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
              {params.message}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors cursor-pointer"
            >
              Iniciar sesión
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="font-medium text-black hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
