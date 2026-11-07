import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import ActivatePurchaseClient from './ActivatePurchaseClient'

export const metadata = {
  title: 'Activar Compra Hotmart | OmniTag SaaS',
  description: 'Activa tu acceso inmediato tras completar tu compra o suscripción en Hotmart.',
}

export default async function ActivatePurchasePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const params = await searchParams
  const initialEmail = params?.email || ''

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Inicio</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400">
          <ShieldCheck className="w-4 h-4" /> Activación Oficial Hotmart
        </span>
      </div>

      <div className="w-full max-w-md bg-white text-gray-900 rounded-3xl p-7 sm:p-8 shadow-2xl border border-gray-100 space-y-6">
        <div className="text-center space-y-2">
          <Image
            src="/logo-light.png"
            alt="OmniTag"
            width={56}
            height={56}
            className="w-14 h-14 object-contain mx-auto"
            priority
          />
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            ¡Gracias por tu compra!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Activa en un solo paso tu acceso al panel (Plan Negocio PRO o Licencia de Agencia Marca Blanca).
          </p>
        </div>

        <ActivatePurchaseClient initialEmail={initialEmail} />

        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            ¿Ya habías configurado tu contraseña antes?{' '}
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
