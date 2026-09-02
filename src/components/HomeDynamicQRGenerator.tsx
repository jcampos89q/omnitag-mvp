'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  QrCode, 
  Download, 
  Sparkles, 
  Palette, 
  Check, 
  ArrowRight, 
  UploadCloud, 
  MessageSquare, 
  Globe, 
  Wifi, 
  Coffee, 
  Share2,
  ExternalLink,
  Layers,
  X
} from 'lucide-react'
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType, GradientType } from 'qr-code-styling'
import Link from 'next/link'

interface PresetGradient {
  id: string
  name: string
  colors: string[]
  type: GradientType
  rotation: number
}

const PRESET_GRADIENTS: PresetGradient[] = [
  { id: 'instagram', name: 'Instagram Sunset', colors: ['#833AB4', '#FD1D1D', '#FCB045'], type: 'linear', rotation: 45 },
  { id: 'luxury_gold', name: 'Luxury Gold', colors: ['#92400E', '#D97706', '#FDE68A'], type: 'linear', rotation: 45 },
  { id: 'cyber_emerald', name: 'Cyber Emerald', colors: ['#064E3B', '#10B981', '#6EE7B7'], type: 'linear', rotation: 45 },
  { id: 'electric_blue', name: 'Ocean Electric', colors: ['#1E3A8A', '#2563EB', '#60A5FA'], type: 'linear', rotation: 45 },
  { id: 'dark_violet', name: 'Neon Purple', colors: ['#4C1D95', '#7C3AED', '#C084FC'], type: 'linear', rotation: 45 },
  { id: 'monochrome', name: 'Negro Ónix', colors: ['#000000', '#18181B'], type: 'linear', rotation: 0 },
]

const QUICK_ICONS = [
  { id: 'none', label: 'Sin logo' },
  { id: 'wa', label: 'WhatsApp', url: 'https://api.iconify.design/logos:whatsapp-icon.svg' },
  { id: 'ig', label: 'Instagram', url: 'https://api.iconify.design/skill-icons:instagram.svg' },
  { id: 'star', label: 'Reseña Google', url: 'https://api.iconify.design/flat-color-icons:google.svg' },
  { id: 'food', label: 'Restaurante', url: 'https://api.iconify.design/emojione:shallow-pan-of-food.svg' }
]

export default function HomeDynamicQRGenerator() {
  // 1. Tipo de contenido
  const [contentType, setContentType] = useState<'url' | 'whatsapp' | 'wifi' | 'menu'>('url')
  const [inputUrl, setInputUrl] = useState('https://www.instagram.com/tu_negocio')
  const [waNumber, setWaNumber] = useState('')
  const [waMessage, setWaMessage] = useState('¡Hola! Me gustaría pedir información.')
  const [wifiSsid, setWifiSsid] = useState('MiNegocio_Clientes')
  const [wifiPassword, setWifiPassword] = useState('bienvenido2026')
  const [menuUrl, setMenuUrl] = useState('https://omnitag.site/m/demo')

  // 2. Opciones de diseño
  const [colorPreset, setColorPreset] = useState<string>('instagram')
  const [dotStyle, setDotStyle] = useState<DotType>('dots')
  const [cornerSquareStyle, setCornerSquareStyle] = useState<CornerSquareType>('extra-rounded')
  const [cornerDotStyle, setCornerDotStyle] = useState<CornerDotType>('dot')
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [frameStyle, setFrameStyle] = useState<'none' | 'nametag' | 'table_tent'>('nametag')
  const [frameText, setFrameText] = useState<string>('ESCANÉAME CON TU CÁMARA')
  const [frameTitle, setFrameTitle] = useState<string>('TU NEGOCIO')
  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  // Referencias
  const qrContainerRef = useRef<HTMLDivElement>(null)
  const qrCodeInstance = useRef<QRCodeStyling | null>(null)

  // Obtener la URL/data final según el tipo
  const computeTargetData = () => {
    switch (contentType) {
      case 'whatsapp': {
        const clean = waNumber.replace(/\D/g, '')
        const phone = clean || '50499999999'
        return `https://wa.me/${phone}?text=${encodeURIComponent(waMessage || 'Hola')}`
      }
      case 'wifi':
        return `WIFI:S:${wifiSsid || 'WiFi'};T:WPA;P:${wifiPassword || ''};;`
      case 'menu':
        return menuUrl || 'https://omnitag.site'
      case 'url':
      default:
        return inputUrl || 'https://omnitag.site'
    }
  }

  // Inicializar o actualizar el QR en tiempo real
  useEffect(() => {
    if (typeof window === 'undefined') return

    const targetData = computeTargetData()
    const selectedPreset = PRESET_GRADIENTS.find(p => p.id === colorPreset) || PRESET_GRADIENTS[0]

    const dotsOptions: any = {
      type: dotStyle,
    }

    if (selectedPreset.colors.length > 1) {
      dotsOptions.gradient = {
        type: selectedPreset.type,
        rotation: (selectedPreset.rotation || 45) * (Math.PI / 180),
        colorStops: selectedPreset.colors.map((color, index) => ({
          offset: index / (selectedPreset.colors.length - 1),
          color: color
        }))
      }
    } else {
      dotsOptions.color = selectedPreset.colors[0]
    }

    const qrOptions: any = {
      width: 220,
      height: 220,
      data: targetData,
      margin: 6,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'Q'
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.35,
        margin: 4,
        crossOrigin: 'anonymous'
      },
      dotsOptions,
      cornersSquareOptions: {
        type: cornerSquareStyle,
        color: selectedPreset.colors[0]
      },
      cornersDotOptions: {
        type: cornerDotStyle,
        color: selectedPreset.colors[1] || selectedPreset.colors[0]
      },
      backgroundOptions: {
        color: '#FFFFFF'
      },
      image: logoUrl || ''
    }

    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling(qrOptions)
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = ''
        qrCodeInstance.current.append(qrContainerRef.current)
      }
    } else {
      qrCodeInstance.current.update(qrOptions)
    }
  }, [
    contentType,
    inputUrl,
    waNumber,
    waMessage,
    wifiSsid,
    wifiPassword,
    menuUrl,
    colorPreset,
    dotStyle,
    cornerSquareStyle,
    cornerDotStyle,
    logoUrl
  ])

  // Subir imagen personalizada (logo) en Base64
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogoUrl(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  // Descargar PNG en alta resolución (con o sin marco)
  const handleDownload = async (format: 'png' | 'svg') => {
    setIsDownloading(true)
    try {
      const selectedPreset = PRESET_GRADIENTS.find(p => p.id === colorPreset) || PRESET_GRADIENTS[0]
      const targetData = computeTargetData()

      // Si es SVG o sin marco, descarga directa
      if (format === 'svg' || frameStyle === 'none') {
        const exportQr = new QRCodeStyling({
          width: 1200,
          height: 1200,
          data: targetData,
          margin: 12,
          qrOptions: { errorCorrectionLevel: 'Q' },
          imageOptions: { hideBackgroundDots: true, imageSize: 0.35, margin: 8, crossOrigin: 'anonymous' },
          dotsOptions: {
            type: dotStyle,
            gradient: selectedPreset.colors.length > 1 ? {
              type: selectedPreset.type,
              rotation: (selectedPreset.rotation || 45) * (Math.PI / 180),
              colorStops: selectedPreset.colors.map((c, i) => ({ offset: i / (selectedPreset.colors.length - 1), color: c }))
            } : undefined,
            color: selectedPreset.colors[0]
          },
          cornersSquareOptions: { type: cornerSquareStyle, color: selectedPreset.colors[0] },
          cornersDotOptions: { type: cornerDotStyle, color: selectedPreset.colors[1] || selectedPreset.colors[0] },
          backgroundOptions: { color: '#FFFFFF' },
          image: logoUrl || undefined
        })

        await exportQr.download({
          name: `omnitag_qr_${colorPreset}`,
          extension: format
        })
        return
      }

      // Renderizar con marco exclusivo en Canvas de alta resolución
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const scale = 2
      const width = 600 * scale
      const height = 750 * scale
      canvas.width = width
      canvas.height = height

      // Fondo del marco
      if (frameStyle === 'nametag') {
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, selectedPreset.colors[0])
        gradient.addColorStop(0.5, selectedPreset.colors[1] || selectedPreset.colors[0])
        gradient.addColorStop(1, selectedPreset.colors[2] || selectedPreset.colors[0])
        ctx.fillStyle = gradient
      } else {
        ctx.fillStyle = '#0F172A' // Placa mesa / pizarra oscura
      }
      ctx.fillRect(0, 0, width, height)

      // Cabecera / Título
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `bold ${28 * scale}px "Plus Jakarta Sans", sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText((frameTitle || 'OMNITAG').toUpperCase(), width / 2, 70 * scale)

      // Tarjeta blanca para el QR
      const cardX = 60 * scale
      const cardY = 110 * scale
      const cardSize = 480 * scale
      const cardRadius = 35 * scale
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardSize, cardSize, cardRadius)
      ctx.fill()

      // Renderizar QR dentro de la tarjeta
      const highResQr = new QRCodeStyling({
        width: 420 * scale,
        height: 420 * scale,
        data: targetData,
        margin: 8 * scale,
        qrOptions: { errorCorrectionLevel: 'Q' },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.35, margin: 4 * scale, crossOrigin: 'anonymous' },
        dotsOptions: {
          type: dotStyle,
          gradient: selectedPreset.colors.length > 1 ? {
            type: selectedPreset.type,
            rotation: (selectedPreset.rotation || 45) * (Math.PI / 180),
            colorStops: selectedPreset.colors.map((c, i) => ({ offset: i / (selectedPreset.colors.length - 1), color: c }))
          } : undefined,
          color: selectedPreset.colors[0]
        },
        cornersSquareOptions: { type: cornerSquareStyle, color: selectedPreset.colors[0] },
        cornersDotOptions: { type: cornerDotStyle, color: selectedPreset.colors[1] || selectedPreset.colors[0] },
        backgroundOptions: { color: 'transparent' },
        image: logoUrl || undefined
      })

      const rawBlob = await highResQr.getRawData('png')
      if (rawBlob) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        const url = URL.createObjectURL(rawBlob as Blob)
        img.src = url
        await new Promise(res => { img.onload = res; img.onerror = res })
        ctx.drawImage(img, cardX + 30 * scale, cardY + 30 * scale, 420 * scale, 420 * scale)
        URL.revokeObjectURL(url)
      }

      // Botón o llamado a la acción inferior
      const btnY = 620 * scale
      const btnHeight = 65 * scale
      const btnWidth = 440 * scale
      const btnX = (width - btnWidth) / 2
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.beginPath()
      ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 20 * scale)
      ctx.fill()

      ctx.fillStyle = '#000000'
      ctx.font = `bold ${16 * scale}px "Plus Jakarta Sans", sans-serif`
      ctx.fillText(frameText.toUpperCase(), width / 2, btnY + 40 * scale)

      canvas.toBlob((blob) => {
        if (!blob) return
        const dlUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = dlUrl
        a.download = `omnitag_qr_exclusivo_${colorPreset}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(dlUrl)
      }, 'image/png')
    } catch (err) {
      console.error(err)
    } finally {
      setIsDownloading(false)
    }
  }

  const selectedPresetObj = PRESET_GRADIENTS.find(p => p.id === colorPreset) || PRESET_GRADIENTS[0]

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Cabecera del Generador */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-black text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-black text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 fill-black" /> Generador de QRs Exclusivos en Vivo
          </div>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            Diseña tu Código QR Gratis y en Tiempo Real
          </h3>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl font-medium">
            Personaliza colores degradados, puntos redondeados, marcos para imprimir y tu logotipo en el centro.
          </p>
        </div>

        <Link
          href="/register"
          className="bg-white hover:bg-gray-100 text-black font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Guardar QRs Dinámicos</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* PANEL IZQUIERDO: CONTROLES */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Selección de Tipo de Contenido */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
              1. ¿Qué quieres que abra tu Código QR?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setContentType('url')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  contentType === 'url' ? 'bg-black text-white border-black' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Enlace Web
              </button>
              <button
                type="button"
                onClick={() => setContentType('whatsapp')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  contentType === 'whatsapp' ? 'bg-[#25D366] text-white border-[#25D366]' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setContentType('menu')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  contentType === 'menu' ? 'bg-amber-600 text-white border-amber-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" /> Menú / Carta
              </button>
              <button
                type="button"
                onClick={() => setContentType('wifi')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  contentType === 'wifi' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" /> Conexión Wi-Fi
              </button>
            </div>

            {/* Inputs dinámicos */}
            <div className="mt-3">
              {contentType === 'url' && (
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://tu-pagina.com o tu perfil de Instagram"
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black font-medium"
                />
              )}

              {contentType === 'whatsapp' && (
                <div className="space-y-2">
                  <input
                    type="tel"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    placeholder="Número de WhatsApp con código de país (ej. 50499999999)"
                    className="w-full text-sm px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-black font-medium"
                  />
                  <input
                    type="text"
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder="Mensaje predeterminado de saludo..."
                    className="w-full text-xs px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-black font-medium"
                  />
                </div>
              )}

              {contentType === 'menu' && (
                <input
                  type="url"
                  value={menuUrl}
                  onChange={(e) => setMenuUrl(e.target.value)}
                  placeholder="https://omnitag.site/m/tu-restaurante"
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black font-medium"
                />
              )}

              {contentType === 'wifi' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="Nombre de la red Wi-Fi"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-black font-medium"
                  />
                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="Contraseña del Wi-Fi"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-black font-medium"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. Paletas de Degradados Exclusivos */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
              2. Elige un Degradado o Color Exclusivo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_GRADIENTS.map((p) => {
                const isSelected = colorPreset === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setColorPreset(p.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition cursor-pointer ${
                      isSelected ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20' : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-lg shrink-0 shadow-2xs"
                      style={{
                        background: `linear-gradient(45deg, ${p.colors.join(', ')})`
                      }}
                    />
                    <span className="text-xs font-bold text-gray-800 truncate">{p.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Forma de Puntos y Esquinas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                3. Estilo de Puntos
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'dots', label: 'Puntos Circulares' },
                  { id: 'rounded', label: 'Suaves Redondos' },
                  { id: 'classy-rounded', label: 'Clásico Elegante' },
                  { id: 'square', label: 'Cuadrados Pro' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setDotStyle(s.id as DotType)}
                    className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                      dotStyle === s.id ? 'bg-black text-white border-black' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                4. Esquinas & Marco
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'extra-rounded', label: 'Extra Redondas' },
                  { id: 'dot', label: 'Círculos' },
                  { id: 'square', label: 'Bisel Cuadrado' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCornerSquareStyle(s.id as CornerSquareType)}
                    className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                      cornerSquareStyle === s.id ? 'bg-black text-white border-black' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Logo en el Centro & Marco Imprimible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                5. Logo en el Centro
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition">
                  <UploadCloud className="w-3.5 h-3.5 text-purple-600" />
                  <span>Subir mi Logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200"
                    title="Eliminar logo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Iconos predeterminados */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {QUICK_ICONS.filter(i => i.id !== 'none').map((qi) => (
                  <button
                    key={qi.id}
                    type="button"
                    onClick={() => setLogoUrl(qi.url || '')}
                    className="text-[11px] font-bold px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                  >
                    {qi.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                6. Formato de Impresión
              </label>
              <div className="space-y-2">
                <select
                  value={frameStyle}
                  onChange={(e) => setFrameStyle(e.target.value as any)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none"
                >
                  <option value="nametag">Marco Nametag (Estilo Instagram)</option>
                  <option value="table_tent">Placa de Mostrador / Mesa</option>
                  <option value="none">Sin Marco (Solo Código QR)</option>
                </select>

                {frameStyle !== 'none' && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={frameTitle}
                      onChange={(e) => setFrameTitle(e.target.value)}
                      placeholder="Título superior"
                      className="text-[11px] px-2.5 py-1.5 rounded-lg border border-gray-200"
                    />
                    <input
                      type="text"
                      value={frameText}
                      onChange={(e) => setFrameText(e.target.value)}
                      placeholder="Texto botón"
                      className="text-[11px] px-2.5 py-1.5 rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: VISTA PREVIA & DESCARGAS */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
              Vista Previa en Vivo
            </span>
            <h4 className="text-base font-extrabold text-gray-900">
              Listo para Imprimir o Compartir
            </h4>
          </div>

          {/* Tarjeta simulada de previsualización */}
          <div 
            className="w-full max-w-[280px] p-4 rounded-3xl shadow-xl transition-all duration-300"
            style={{
              background: frameStyle === 'nametag'
                ? `linear-gradient(45deg, ${selectedPresetObj.colors.join(', ')})`
                : frameStyle === 'table_tent'
                ? '#0F172A'
                : '#FFFFFF',
              border: frameStyle === 'none' ? '1px solid #E5E7EB' : 'none'
            }}
          >
            {frameStyle !== 'none' && (
              <p className="text-white font-black text-xs uppercase tracking-wider mb-3 truncate">
                {frameTitle || 'TU NEGOCIO'}
              </p>
            )}

            <div className="bg-white p-3 rounded-2xl shadow-inner flex items-center justify-center">
              <div ref={qrContainerRef} className="flex items-center justify-center" />
            </div>

            {frameStyle !== 'none' && (
              <div className="mt-3 bg-white/90 backdrop-blur-xs py-1.5 px-3 rounded-xl shadow-xs">
                <p className="text-[10px] font-black text-black tracking-wide truncate">
                  {frameText || 'ESCANÉAME CON TU CÁMARA'}
                </p>
              </div>
            )}
          </div>

          {/* Botones de Descarga */}
          <div className="w-full space-y-2">
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => handleDownload('png')}
              className="w-full bg-black hover:bg-gray-800 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Generando...' : 'Descargar QR en Alta Calidad (PNG)'}</span>
            </button>

            <button
              type="button"
              disabled={isDownloading}
              onClick={() => handleDownload('svg')}
              className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs py-2.5 px-4 rounded-xl border border-gray-200 shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Descargar Vectorial (SVG para Imprenta)</span>
            </button>
          </div>

          {/* Gancho Dinámico OmniTag */}
          <div className="bg-purple-50 border border-purple-100 p-3 rounded-xl text-left space-y-1">
            <p className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-700" /> ¿Necesitas cambiar el enlace después de imprimir?
            </p>
            <p className="text-[10px] text-purple-700 leading-relaxed">
              Con un <b>QR Dinámico de OmniTag</b> puedes cambiar tu menú, teléfono o catálogo cuando quieras sin reimprimir el código, y ver analíticas en vivo.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-1 text-[11px] font-black text-purple-950 hover:underline pt-0.5"
            >
              <span>Crear cuenta gratis y activar QR dinámico</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}