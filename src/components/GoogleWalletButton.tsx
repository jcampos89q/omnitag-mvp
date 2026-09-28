'use client'

import { useState } from 'react'
import { Wallet, Loader2, AlertCircle, CheckCircle2, X, ExternalLink } from 'lucide-react'

interface GoogleWalletButtonProps {
  type: 'loyalty' | 'vcard'
  slug: string
  phone?: string
  name?: string
  className?: string
  style?: React.CSSProperties
}

export default function GoogleWalletButton({
  type,
  slug,
  phone,
  name,
  className = '',
  style
}: GoogleWalletButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAddToWallet = async () => {
    setLoading(true)
    setErrorMsg('')

    try {
      const endpoint = type === 'loyalty'
        ? `/api/wallet/google/loyalty?slug=${encodeURIComponent(slug)}&phone=${encodeURIComponent(phone || '')}&name=${encodeURIComponent(name || '')}`
        : `/api/wallet/google/vcard?slug=${encodeURIComponent(slug)}`

      const res = await fetch(endpoint)
      const data = await res.json()

      if (data.success && data.url) {
        // Redirigir a Google Wallet directamente
        window.location.href = data.url
      } else if (data.isDemo || data.error?.includes('faltan credenciales')) {
        // Si aún faltan las credenciales de Google Wallet en el servidor
        setShowDemoModal(true)
      } else {
        setErrorMsg(data.error || 'No se pudo generar el pase de Google Wallet.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el servicio de Wallet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleAddToWallet}
        disabled={loading}
        style={style}
        className={`w-full bg-black hover:bg-neutral-900 active:scale-[0.99] text-white border border-neutral-700/60 font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer select-none text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        title="Guardar en Google Wallet"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Generando Pase de Google Wallet...</span>
          </>
        ) : (
          <>
            {/* Icono Oficial Multicolores de Google Wallet */}
            <GoogleWalletIcon className="w-5 h-5 shrink-0" />
            <span className="font-extrabold tracking-tight">Añadir a Google Wallet</span>
          </>
        )}
      </button>

      {errorMsg && (
        <div className="mt-2 p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Modal Informativo cuando faltan las credenciales en .env */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white text-gray-900 max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
                  <GoogleWalletIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900">Google Wallet Listo</h3>
                  <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Plantilla Dinámica Integrada
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <p>
                <b>¡La arquitectura de pases con marca personalizada ya está implementada y lista en tu código!</b>
              </p>
              <p>
                Para habilitar la descarga directa en los teléfonos móviles de tus clientes finales, solo debes agregar en tu archivo <code>.env.local</code> de producción las 3 credenciales que Google te entrega al aprobar tu consola:
              </p>

              <div className="bg-gray-900 text-gray-200 p-3.5 rounded-xl font-mono text-[10px] space-y-1 overflow-x-auto">
                <div>GOOGLE_WALLET_ISSUER_ID=3388000000...</div>
                <div>GOOGLE_WALLET_CLIENT_EMAIL=omnitag@...iam.gserviceaccount.com</div>
                <div>GOOGLE_WALLET_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."</div>
              </div>

              <p className="text-[11px] text-gray-500">
                Una vez agregadas, el botón generará automáticamente el token firmado oficial y abrirá la app nativa de Google Wallet en el teléfono del usuario con su nombre, sellos, colores y logo.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="w-full bg-black hover:bg-gray-800 text-white font-extrabold py-3 rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function GoogleWalletIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      {/* Tarjeta azul */}
      <rect x="2" y="5" width="20" height="14" rx="3" fill="#1E293B" />
      <path d="M2 9h20" stroke="#334155" strokeWidth="1.5" />
      {/* Bandas oficiales Google (Azul, Rojo, Amarillo, Verde) */}
      <circle cx="7" cy="14" r="2" fill="#4285F4" />
      <circle cx="10.5" cy="14" r="2" fill="#EA4335" />
      <circle cx="14" cy="14" r="2" fill="#FBBC04" />
      <circle cx="17.5" cy="14" r="2" fill="#34A853" />
    </svg>
  )
}
