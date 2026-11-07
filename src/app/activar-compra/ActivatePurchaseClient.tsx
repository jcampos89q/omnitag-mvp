'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  Building2,
  RefreshCw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import { verifyHotmartBuyerEmailAction, claimHotmartAccountAction } from './actions'

export default function ActivatePurchaseClient({
  initialEmail = ''
}: {
  initialEmail?: string
}) {
  const router = useRouter()
  const [email, setEmail] = useState(initialEmail)
  const [verifying, setVerifying] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [step, setStep] = useState<'verify' | 'claim' | 'already_claimed' | 'not_found'>('verify')
  const [isReseller, setIsReseller] = useState(false)
  const [buyerName, setBuyerName] = useState('')
  const [password, setPassword] = useState('')

  const handleVerifyEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!email.trim()) return

    setVerifying(true)
    setErrorMsg(null)
    try {
      const res = await verifyHotmartBuyerEmailAction(email)
      setIsReseller(res.isReseller)
      setBuyerName(res.buyerName)

      if (res.status === 'ready_to_claim') {
        setStep('claim')
      } else if (res.status === 'already_claimed') {
        setStep('already_claimed')
      } else {
        setStep('not_found')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al verificar tu correo.')
    } finally {
      setVerifying(false)
    }
  }

  const handleClaimAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setClaiming(true)
    setErrorMsg(null)
    try {
      const fd = new FormData()
      fd.set('email', email)
      fd.set('full_name', buyerName)
      fd.set('password', password)

      const res = await claimHotmartAccountAction(fd)
      router.push(res.redirectTo)
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo activar el acceso.')
      setClaiming(false)
    }
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerifyEmail} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              Correo electrónico usado en Hotmart *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              Ingresa exactamente el mismo correo que escribiste en la pantalla de pago de Hotmart.
            </p>
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Buscando tu licencia en Hotmart...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Activar Mi Cuenta Ahora</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {step === 'claim' && (
        <form onSubmit={handleClaimAccount} className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {isReseller
                ? '¡Licencia de Agencia Marca Blanca Confirmada!'
                : '¡Suscripción PRO Confirmada en Hotmart!'}
            </div>
            <p className="text-xs text-emerald-700">
              Encontramos tu compra asociada a <strong>{email}</strong>. Crea tu contraseña abajo para entrar a tu panel.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Tu Nombre o Nombre de tu Agencia / Negocio
            </label>
            <input
              type="text"
              required
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Elige tu Contraseña de Acceso (Mín. 6 caracteres) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={claiming}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg"
          >
            {claiming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Configurando tu panel...</span>
              </>
            ) : (
              <>
                {isReseller ? <Building2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                <span>
                  {isReseller
                    ? 'Guardar Contraseña e Ir a Mi Consola Marca Blanca'
                    : 'Guardar Contraseña e Ir a Mi Panel PRO'}
                </span>
              </>
            )}
          </button>
        </form>
      )}

      {step === 'already_claimed' && (
        <div className="space-y-4 animate-in fade-in text-center">
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1.5 text-left">
            <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              Tu compra ya está vinculada a tu cuenta
            </div>
            <p className="text-xs text-indigo-700 leading-relaxed">
              El correo <strong>{email}</strong> ya cuenta con una contraseña activa y tu suscripción de Hotmart ya fue aplicada automáticamente.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link
              href="/login"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <span>Iniciar Sesión con mi Contraseña</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-indigo-600 hover:underline py-1"
            >
              ¿Olvidaste tu contraseña? Recupérala aquí
            </Link>
          </div>
        </div>
      )}

      {step === 'not_found' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
            <p className="text-xs font-extrabold text-amber-900 uppercase">
              Aún procesando notificación de Hotmart...
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Si acabas de pagar hace unos segundos, Hotmart puede tardar entre 15 y 40 segundos en confirmar el pago para <strong>{email}</strong>.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => handleVerifyEmail()}
              disabled={verifying}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
              <span>Volver a Verificar ({email})</span>
            </button>
            <button
              type="button"
              onClick={() => setStep('verify')}
              className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs cursor-pointer"
            >
              Probar con otro correo electrónico
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
