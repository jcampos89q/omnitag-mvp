'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Wifi, 
  Copy, 
  Check, 
  QrCode, 
  ShieldCheck, 
  ExternalLink, 
  Smartphone, 
  Coffee, 
  Star, 
  Sparkles,
  ArrowRight
} from 'lucide-react'
import QRCodeStyling from 'qr-code-styling'
import Link from 'next/link'

interface WifiConnectClientProps {
  ssid: string
  password?: string
  encryption?: string
  businessName?: string
  menuSlug?: string
  vcardSlug?: string
  reviewUrl?: string
}

export default function WifiConnectClient({
  ssid = 'Red_Clientes',
  password = '',
  encryption = 'WPA',
  businessName = 'OmniTag',
  menuSlug,
  vcardSlug,
  reviewUrl
}: WifiConnectClientProps) {
  const [copied, setCopied] = useState<boolean>(false)
  const [showQR, setShowQR] = useState<boolean>(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const qrInstance = useRef<QRCodeStyling | null>(null)

  const wifiPayload = `WIFI:S:${ssid};T:${encryption};P:${password};;`

  useEffect(() => {
    if (typeof window === 'undefined' || !showQR) return

    if (!qrInstance.current) {
      qrInstance.current = new QRCodeStyling({
        width: 220,
        height: 220,
        data: wifiPayload,
        margin: 6,
        qrOptions: { errorCorrectionLevel: 'Q' },
        dotsOptions: {
          type: 'dots',
          color: '#18181B'
        },
        cornersSquareOptions: {
          type: 'extra-rounded',
          color: '#7C3AED'
        },
        cornersDotOptions: {
          type: 'dot',
          color: '#7C3AED'
        },
        backgroundOptions: { color: '#FFFFFF' }
      })

      if (qrRef.current) {
        qrRef.current.innerHTML = ''
        qrInstance.current.append(qrRef.current)
      }
    }
  }, [showQR, wifiPayload])

  const copyPassword = () => {
    if (!password) return
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-purple-600 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        {/* Cabecera de bienvenida */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-black text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xs border border-white/20 shadow-md">
            <Wifi className="w-8 h-8 text-yellow-300" />
          </div>

          <span className="text-[11px] font-black uppercase tracking-widest text-purple-300 bg-white/10 px-3 py-0.5 rounded-full border border-white/10">
            Wi-Fi de Cortesía
          </span>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-2">
            {businessName}
          </h1>
          <p className="text-xs text-purple-200 mt-1">
            Conéctate a nuestra red Wi-Fi de alta velocidad gratis.
          </p>
        </div>

        {/* Tarjeta de credenciales */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Nombre de la Red */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-center space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
              Nombre de la Red (SSID)
            </p>
            <p className="text-lg font-black text-gray-900 flex items-center justify-center gap-1.5 font-mono">
              <Wifi className="w-4 h-4 text-purple-600" />
              <span>{ssid}</span>
            </p>
          </div>

          {/* Contraseña y botón de copia */}
          {password ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Contraseña
                </span>
                {copied && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" /> ¡Copiada al portapapeles!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 px-4 py-3 rounded-2xl font-mono text-sm font-bold text-gray-900 border border-gray-200 truncate select-all">
                  {password}
                </div>
                <button
                  type="button"
                  onClick={copyPassword}
                  className="bg-black hover:bg-gray-800 text-white p-3 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
                  title="Copiar contraseña"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <p className="text-[11px] text-gray-500 text-center pt-1">
                Toca <b>Copiar</b>, abre tus ajustes de Wi-Fi y pega la clave.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center border border-emerald-200">
              🎉 Esta es una red abierta. Puedes conectarte directamente sin contraseña.
            </div>
          )}

          {/* Alternativa: Ver Código QR para acompañantes */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowQR(!showQR)}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-purple-200"
            >
              <QrCode className="w-4 h-4 text-purple-700" />
              <span>{showQR ? 'Ocultar Código QR' : 'Mostrar Código QR para auto-conexión'}</span>
            </button>

            {showQR && (
              <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-inner flex flex-col items-center justify-center space-y-2 animate-in fade-in">
                <div ref={qrRef} className="flex items-center justify-center" />
                <p className="text-[11px] text-gray-500 text-center">
                  Apunta con la cámara de otro móvil para conectarse al instante.
                </p>
              </div>
            )}
          </div>

          {/* Enlaces de marketing del comercio */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 text-center">
              Mientras estás aquí, descubre más:
            </p>

            {menuSlug && (
              <Link
                href={`/m/${menuSlug}`}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition"
              >
                <div className="flex items-center gap-2.5">
                  <Coffee className="w-4 h-4 text-amber-600" />
                  <span>Ver Menú & Carta Digital</span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-700" />
              </Link>
            )}

            {reviewUrl && (
              <a
                href={reviewUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-900 text-xs font-bold transition"
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-yellow-600 fill-yellow-500" />
                  <span>Calificarnos en Google Maps</span>
                </div>
                <ExternalLink className="w-4 h-4 text-yellow-700" />
              </a>
            )}

            {vcardSlug && (
              <Link
                href={`/v/${vcardSlug}`}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold transition"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>Guardar Contacto en el Móvil</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-700" />
              </Link>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 font-medium">
            <span>Powered by</span>
            <span className="font-extrabold text-gray-900">OmniTag</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
