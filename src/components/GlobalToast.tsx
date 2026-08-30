'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react'

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('omnitag-toast', { detail: { message, type } }))
  }
}

export default function GlobalToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; id: number } | null>(null)

  // Escuchar parámetros de URL como ?success=true o ?error=...
  useEffect(() => {
    const successParam = searchParams.get('success')
    const errorParam = searchParams.get('error')

    if (successParam) {
      const message = successParam === 'true' 
        ? '¡Cambios guardados con éxito!' 
        : decodeURIComponent(successParam)
      
      setToast({ message, type: 'success', id: Date.now() })

      // Limpiar el parámetro de la URL limpiamente sin recargar la página
      const nextParams = new URLSearchParams(searchParams.toString())
      nextParams.delete('success')
      const newQuery = nextParams.toString() ? `?${nextParams.toString()}` : ''
      window.history.replaceState(null, '', `${pathname}${newQuery}`)
    } else if (errorParam) {
      const message = decodeURIComponent(errorParam)
      setToast({ message, type: 'error', id: Date.now() })

      const nextParams = new URLSearchParams(searchParams.toString())
      nextParams.delete('error')
      const newQuery = nextParams.toString() ? `?${nextParams.toString()}` : ''
      window.history.replaceState(null, '', `${pathname}${newQuery}`)
    }
  }, [searchParams, pathname])

  // Escuchar eventos personalizados de cliente
  useEffect(() => {
    const handleCustomToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; type: 'success' | 'error' }>
      if (customEvent.detail) {
        setToast({
          message: customEvent.detail.message,
          type: customEvent.detail.type || 'success',
          id: Date.now()
        })
      }
    }

    window.addEventListener('omnitag-toast', handleCustomToast)
    return () => window.removeEventListener('omnitag-toast', handleCustomToast)
  }, [])

  // Auto-dismiss después de 4.5 segundos
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      setToast(null)
    }, 4500)
    return () => clearTimeout(timer)
  }, [toast])

  if (!toast) return null

  const isSuccess = toast.type === 'success'

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto">
      <div 
        className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-xl ${
          isSuccess 
            ? 'bg-gray-900/95 border-emerald-500/30 text-white shadow-emerald-950/30' 
            : 'bg-red-950/95 border-red-500/40 text-white shadow-red-950/30'
        }`}
      >
        <div 
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-black uppercase tracking-wider opacity-60">
            {isSuccess ? 'Confirmación del Sistema' : 'Atención'}
          </p>
          <p className="text-xs sm:text-sm font-semibold mt-0.5 leading-snug">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setToast(null)}
          className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
