'use client'

import { useState, useEffect } from 'react'
import { Download, Share, PlusSquare, MoreVertical, Smartphone, X } from 'lucide-react'

export default function PwaInstallPrompt() {
  const [isStandalone, setIsStandalone] = useState(false)
  const [isDismissed, setIsDismissed] = useState(true)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Verificar si ya corre como app instalada (standalone)
    const isRunningStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isRunningStandalone) {
      setIsStandalone(true)
      return
    }

    // 2. Verificar si el usuario lo descartó previamente
    const dismissed = localStorage.getItem('omnitag_pwa_dismissed')
    if (!dismissed) {
      setIsDismissed(false)
    }

    // 3. Detectar plataforma
    const ua = window.navigator.userAgent.toLowerCase()
    const isIos = /iphone|ipad|ipod/.test(ua)
    const isAndroid = /android/.test(ua)

    if (isIos) {
      setPlatform('ios')
    } else if (isAndroid) {
      setPlatform('android')
    } else {
      setPlatform('other')
    }

    // 4. Capturar evento de instalación nativo en Android/Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', () => {
      setIsDismissed(true)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('omnitag_pwa_dismissed', 'true')
  }

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsDismissed(true)
    }
    setDeferredPrompt(null)
  }

  if (isStandalone || isDismissed) return null

  return (
    <div className="relative overflow-hidden bg-linear-to-r from-blue-900 via-indigo-950 to-gray-950 text-white p-4 sm:p-5 rounded-2xl shadow-xl border border-blue-500/30 animate-in fade-in slide-in-from-top-2">
      <button 
        onClick={handleDismiss} 
        className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        title="Cerrar aviso"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pr-6">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-300 shadow-inner">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h4 className="font-extrabold text-xs sm:text-sm text-white">
                Instala OmniTag en tu pantalla de inicio
              </h4>
              <span className="text-[9px] sm:text-[10px] bg-blue-400 text-black px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0">
                Como App Móvil
              </span>
            </div>
            <p className="text-xs text-blue-200/90 mt-1 leading-relaxed max-w-xl">
              Accede a tu panel en 1 segundo y recibe notificaciones flotantes de clientes sin abrir el navegador.
            </p>
          </div>
        </div>

        {/* Guía según dispositivo */}
        <div className="w-full md:w-auto shrink-0 flex items-center justify-between sm:justify-start gap-2 flex-wrap">
          {platform === 'ios' && (
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-3.5 py-2 text-[11px] text-blue-100 flex items-center gap-2">
              <span>Toca</span>
              <span className="inline-flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded font-bold text-white">
                <Share className="w-3 h-3" /> Compartir
              </span>
              <span>y luego</span>
              <span className="inline-flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded font-bold text-white">
                <PlusSquare className="w-3 h-3" /> Agregar al inicio
              </span>
            </div>
          )}

          {platform === 'android' && deferredPrompt && (
            <button
              onClick={handleInstallAndroid}
              className="bg-blue-400 hover:bg-blue-300 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Aplicación</span>
            </button>
          )}

          {platform === 'android' && !deferredPrompt && (
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-3.5 py-2 text-[11px] text-blue-100 flex items-center gap-2">
              <span>Toca</span>
              <span className="inline-flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded font-bold text-white">
                <MoreVertical className="w-3 h-3" /> Menú
              </span>
              <span>y elige</span>
              <span className="font-bold text-white">"Instalar aplicación"</span>
            </div>
          )}

          {platform === 'other' && (
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-3.5 py-2 text-[11px] text-blue-100">
              <span>Ábrelo desde tu móvil y agrégalo a tu pantalla de inicio.</span>
            </div>
          )}

          <button
            onClick={handleDismiss}
            className="text-xs text-gray-400 hover:text-white px-2.5 py-1.5 rounded-lg transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
