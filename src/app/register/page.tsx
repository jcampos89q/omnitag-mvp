import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import FriendlyErrorAlert from '@/components/FriendlyErrorAlert'
import RegisterForm from './RegisterForm'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; token?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      {/* Botón para regresar al inicio de la web */}
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

      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <div className="text-center">
          <Link href="/" title="Volver a la página principal" className="inline-block hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-md">
              O
            </div>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Crea tu cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Únete a OmniTag hoy mismo
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

        <RegisterForm 
          token={params?.token} 
          error={params?.error} 
          message={params?.message} 
        />
        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-medium text-black hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
