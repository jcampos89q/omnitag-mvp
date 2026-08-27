'use client'

import { useState, useEffect } from 'react'
import { Bell, BellRing, Check, X, Smartphone, Sparkles } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationPrompt({ userId }: { userId?: string }) {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !userId) return

    // Verificar si el navegador soporta Service Worker y Push
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true)

      // Verificar si ya está suscrito
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          if (subscription) {
            setIsSubscribed(true)
          }
        })
      })

      if (Notification.permission === 'granted') {
        setIsSubscribed(true)
      }
    }

    const dismissed = localStorage.getItem('omnitag_push_dismissed')
    if (dismissed) {
      setIsDismissed(true)
    }
  }, [userId])

  const handleSubscribe = async () => {
    if (!isSupported || !userId) return
    setLoading(true)

    try {
      // 1. Pedir permiso al usuario
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setLoading(false)
        return
      }

      // 2. Registrar el Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // 3. Suscribirse a Web Push con la clave VAPID pública
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BGT3Kz8txr0vXdMgVYRB6FT_zAT_nc6V3S8BU6h364ID5vkMjJKJzpWdprWFjTj834YURYtAoEbB6BaajnF3OO8'
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        })
      }

      // 4. Guardar en la base de datos
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      })

      setIsSubscribed(true)
      setSuccessMessage(true)
      setTimeout(() => setSuccessMessage(false), 5000)
    } catch (err) {
      console.error('Error al suscribir notificaciones push:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('omnitag_push_dismissed', 'true')
  }

  if (!isSupported || isSubscribed || isDismissed) {
    if (successMessage) {
      return (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>¡Alertas activadas! Recibirás avisos flotantes en tu pantalla aunque la app esté cerrada.</span>
          </div>
          <button onClick={() => setSuccessMessage(false)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-linear-to-r from-gray-900 via-purple-950 to-black text-white p-4 sm:p-5 rounded-2xl shadow-xl border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 text-yellow-300">
          <BellRing className="w-5 h-5 animate-bounce" />
        </div>
        <div className="space-y-0.5">
          <h4 className="font-extrabold text-sm flex items-center gap-1.5">
            <span>¿Recibir avisos de clientes en tu pantalla?</span>
            <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.2 rounded-full font-black uppercase">
              Flotantes
            </span>
          </h4>
          <p className="text-xs text-purple-200 leading-relaxed">
            Te avisaremos en tu pantalla con sonido/vibración cuando un cliente <b>guarde tu contacto</b>, <b>deje una reseña</b> o <b>acumule un sello</b>, aunque tengas la app cerrada.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
        <button
          type="button"
          onClick={handleDismiss}
          className="text-xs text-gray-400 hover:text-white px-3 py-2 rounded-xl transition cursor-pointer"
        >
          Más tarde
        </button>

        <button
          type="button"
          onClick={handleSubscribe}
          disabled={loading}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
        >
          <Bell className="w-3.5 h-3.5 fill-black" />
          <span>{loading ? 'Activando...' : '🔔 Activar Alertas en Pantalla'}</span>
        </button>
      </div>
    </div>
  )
}
