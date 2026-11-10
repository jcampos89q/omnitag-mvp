import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, ArrowLeft, Sparkles } from 'lucide-react'
import ActivatePurchaseClient from './ActivatePurchaseClient'

export const metadata = {
  title: 'Activar Compra Hotmart | OmniTag',
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans antialiased">
      {/* Barra superior estilo /login y /register de OmniTag */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        <Link
          href="/agencias"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition bg-white hover:bg-gray-100 px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Activación Oficial Hotmart
        </span>
      </div>

      <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block hover:scale-105 transition-transform mb-1">
            <Image
              src="/logo-light.png"
              alt="OmniTag"
              width={60}
              height={60}
              className="w-15 h-15 object-contain mx-auto"
              priority
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-purple-600 fill-current" /> Acceso Inmediato
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950">
            Activa tu Compra de Hotmart
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
            Ingresa el correo con el que realizaste tu pago en Hotmart para configurar tu contraseña y entrar a tu panel.
          </p>
        </div>

        <ActivatePurchaseClient initialEmail={initialEmail} />

        <div className="pt-4 border-t border-gray-100 text-center space-y-2">
          <p className="text-xs text-gray-600">
            ¿Ya habías configurado tu contraseña antes?{' '}
            <Link href="/login" className="font-extrabold text-black hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
