import { resetPassword } from '@/app/auth/actions'
import { LockKeyhole, Sparkles } from 'lucide-react'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <LockKeyhole className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Establecer Nueva Contraseña
          </h2>
          <p className="mt-1.5 text-xs text-gray-500">
            Ingresa tu nueva contraseña para acceder a tu cuenta de OmniTag.
          </p>
        </div>

        <form className="space-y-4" action={resetPassword}>
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Nueva Contraseña (mínimo 6 caracteres)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="block w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 text-xs font-medium focus:border-black focus:outline-none"
            />
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
            Guardar Nueva Contraseña & Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
