'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  QrCode, 
  Download, 
  Sparkles, 
  Image as ImageIcon, 
  Layers, 
  Palette, 
  Type, 
  Check, 
  Smartphone, 
  ExternalLink,
  Crown,
  FileImage,
  Share2,
  Lock,
  Eye,
  CheckCircle2,
  X,
  Zap,
  ArrowRight,
  Printer,
  Wifi,
  Radio
} from 'lucide-react'
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType, GradientType } from 'qr-code-styling'
import ImageUploadInput from '@/components/ImageUploadInput'
import ProFeatureModal from '@/components/ProFeatureModal'
import NfcCardWriterModal from '@/components/NfcCardWriterModal'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface QRStudioClientProps {
  vcard?: any
  menu?: any
  loyalty?: any
  devices?: any[]
  isPro?: boolean
}

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
  { id: 'monochrome', name: 'Negro Clásico (Gratis)', colors: ['#000000', '#111827'], type: 'linear', rotation: 0 },
]

const FRAME_STYLES = [
  { id: 'none', name: 'Sin Marco (Solo Código QR)', isPro: false },
  { id: 'instagram_nametag', name: 'Estilo Nametag / Instagram (Con cabecera y botón)', isPro: true },
  { id: 'table_tent', name: 'Placa de Mostrador / Mesa (Con llamado a la acción)', isPro: true },
  { id: 'badge', name: 'Tarjeta / Badge Oscuro', isPro: true },
]

export default function QRStudioClient({ 
  vcard, 
  menu, 
  loyalty, 
  devices = [], 
  isPro = false 
}: QRStudioClientProps) {
  const searchParams = useSearchParams()
  const urlSource = searchParams?.get('source') as any
  const urlTable = searchParams?.get('table') || ''

  // 1. Tipo de Destino
  const [sourceType, setSourceType] = useState<'vcard' | 'menu' | 'loyalty' | 'device' | 'wifi' | 'custom'>(
    urlSource && ['vcard', 'menu', 'loyalty', 'device', 'wifi', 'custom'].includes(urlSource)
      ? urlSource
      : vcard ? 'vcard' : menu ? 'menu' : loyalty ? 'loyalty' : 'custom'
  )
  const [selectedTable, setSelectedTable] = useState<string>(urlTable)
  const [customUrl, setCustomUrl] = useState('https://')
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || '')

  // 1.5. Datos de Conexión Wi-Fi
  const [wifiSsid, setWifiSsid] = useState<string>('Clientes_WiFi')
  const [wifiPassword, setWifiPassword] = useState<string>('bienvenido2026')
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA')
  const [wifiHidden, setWifiHidden] = useState<boolean>(false)
  const [showWifiPassword, setShowWifiPassword] = useState<boolean>(false)

  // 2. Personalización de Estilo
  const [dotStyle, setDotStyle] = useState<DotType>('dots')
  const [cornerSquareStyle, setCornerSquareStyle] = useState<CornerSquareType>('extra-rounded')
  const [cornerDotStyle, setCornerDotStyle] = useState<CornerDotType>('dot')
  const [colorPreset, setColorPreset] = useState<string>(isPro ? 'instagram' : 'monochrome')
  const [customColor, setCustomColor] = useState<string>('#000000')
  const [useGradient, setUseGradient] = useState<boolean>(isPro)

  // 3. Logo en el Centro
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [frameStyle, setFrameStyle] = useState<string>(isPro ? (urlTable ? 'table_tent' : 'instagram_nametag') : 'none')
  const [frameText, setFrameText] = useState<string>('ESCANÉAME CON TU CÁMARA')
  const [frameTitle, setFrameTitle] = useState<string>('')
  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  // 4. Modal para Guardar en Fotos (Mobile Helper)
  const [previewDownloadImage, setPreviewDownloadImage] = useState<string | null>(null)
  const [showProModal, setShowProModal] = useState<boolean>(false)
  const [proModalInfo, setProModalInfo] = useState({ name: '', desc: '' })
  const [showNfcWriter, setShowNfcWriter] = useState<boolean>(false)

  // Referencias
  const qrRef = useRef<HTMLDivElement>(null)
  const qrCodeInstance = useRef<QRCodeStyling | null>(null)

  // Calcular la URL final
  const getTargetUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.omnitag.site'
    switch (sourceType) {
      case 'vcard':
        return vcard ? `${origin}/v/${vcard.slug}` : `${origin}`
      case 'menu': {
        if (!menu) return `${origin}`
        if (selectedTable) {
          return `${origin}/m/${menu.slug}?mesa=${encodeURIComponent(selectedTable)}`
        }
        return `${origin}/m/${menu.slug}`
      }
      case 'loyalty':
        return loyalty ? `${origin}/l/${loyalty.slug}` : `${origin}`
      case 'device': {
        const dev = devices.find(d => d.id === selectedDeviceId)
        return dev ? `${origin}/r/${dev.tag_id}` : `${origin}`
      }
      case 'wifi': {
        const enc = wifiEncryption === 'nopass' ? 'nopass' : wifiEncryption
        const pass = wifiEncryption === 'nopass' ? '' : wifiPassword
        const hidden = wifiHidden ? 'H:true;' : ''
        return `WIFI:S:${wifiSsid};T:${enc};P:${pass};${hidden};`
      }
      case 'custom':
      default:
        return customUrl || `${origin}`
    }
  }

  // URL específica para NFC (Garantiza https:// para compatibilidad total con teléfonos)
  const getNfcUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.omnitag.site'
    if (sourceType === 'wifi') {
      const enc = wifiEncryption === 'nopass' ? 'nopass' : wifiEncryption
      const pass = wifiEncryption === 'nopass' ? '' : wifiPassword
      const title = frameTitle || 'Red Wi-Fi'
      const menuSlug = menu?.slug || ''
      return `${origin}/wifi?ssid=${encodeURIComponent(wifiSsid)}&pass=${encodeURIComponent(pass)}&enc=${encodeURIComponent(enc)}&name=${encodeURIComponent(title)}&menu=${encodeURIComponent(menuSlug)}`
    }
    return getTargetUrl()
  }

  // Pre-cargar valores según origen
  useEffect(() => {
    if (sourceType === 'vcard' && vcard) {
      if (isPro) setLogoUrl(vcard.avatar_url || '')
      setFrameTitle(vcard.first_name ? `${vcard.first_name} ${vcard.last_name || ''}` : vcard.company_name || 'Mi Perfil')
      setFrameText('GUARDA MI CONTACTO')
    } else if (sourceType === 'menu' && menu) {
      if (isPro) setLogoUrl(menu.logo_url || '')
      if (selectedTable) {
        setFrameTitle(`${menu.name} • ${selectedTable}`)
        setFrameText('ESCANEA PARA ORDENAR')
        if (isPro) setFrameStyle('table_tent')
      } else {
        setFrameTitle(menu.name || 'Menú Digital')
        setFrameText('ESCANEA PARA VER EL MENÚ')
      }
    } else if (sourceType === 'loyalty' && loyalty) {
      if (isPro) setLogoUrl(loyalty.logo_url || '')
      setFrameTitle(loyalty.name || 'Club de Premios')
      setFrameText('ACUMULA SELLOS Y GANA PREMIOS')
    } else if (sourceType === 'device') {
      setFrameTitle('Google Reviews')
      setFrameText('TOCA O ESCANEA PARA CALIFICAR')
    } else if (sourceType === 'wifi') {
      setFrameTitle('WI-FI GRATIS')
      setFrameText('CONÉCTATE CON TU CÁMARA')
      if (isPro) setFrameStyle('table_tent')
    }
  }, [sourceType, selectedTable, vcard, menu, loyalty, isPro])

  // Inicializar y actualizar QRCodeStyling para vista previa responsiva
  useEffect(() => {
    const targetUrl = getTargetUrl()
    const selectedPreset = PRESET_GRADIENTS.find(p => p.id === colorPreset) || PRESET_GRADIENTS[0]

    const dotsOptions: any = {
      type: dotStyle,
    }

    if (useGradient && selectedPreset.colors.length > 1) {
      dotsOptions.gradient = {
        type: selectedPreset.type,
        rotation: (selectedPreset.rotation || 45) * (Math.PI / 180),
        colorStops: selectedPreset.colors.map((color, index) => ({
          offset: index / (selectedPreset.colors.length - 1),
          color: color
        }))
      }
    } else {
      dotsOptions.color = customColor
    }

    const qrOptions: any = {
      width: 220,
      height: 220,
      data: targetUrl,
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
        color: useGradient ? selectedPreset.colors[0] : customColor
      },
      cornersDotOptions: {
        type: cornerDotStyle,
        color: useGradient ? selectedPreset.colors[0] : customColor
      },
      backgroundOptions: {
        color: '#FFFFFF'
      },
      image: logoUrl || ''
    }

    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling(qrOptions)
      if (qrRef.current) {
        qrRef.current.innerHTML = ''
        qrCodeInstance.current.append(qrRef.current)
      }
    } else {
      qrCodeInstance.current.update(qrOptions)
    }
  }, [
    sourceType, 
    customUrl, 
    selectedDeviceId, 
    dotStyle, 
    cornerSquareStyle, 
    cornerDotStyle, 
    colorPreset, 
    customColor, 
    useGradient, 
    logoUrl,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden
  ])

  // Función robusta para Guardar en Fototeca / Galería Móvil o Descargar en PC
  const processSaveOrShare = async (blob: Blob, filename: string, isSvg: boolean = false) => {
    const downloadUrl = URL.createObjectURL(blob)
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    // 1. Si es móvil y PNG, intentar Web Share API nativo directo a la fototeca
    if (!isSvg && isMobile && typeof navigator !== 'undefined' && navigator.canShare) {
      try {
        const file = new File([blob], filename, { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          setPreviewDownloadImage(downloadUrl)
          await navigator.share({
            files: [file],
            title: 'Guardar Código QR',
            text: 'Código QR de OmniTag'
          })
          return
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return
      }
    }

    // 2. Si es móvil, mostrar modal interactivo para guardar en fotos
    if (isMobile && !isSvg) {
      setPreviewDownloadImage(downloadUrl)
    }

    // 3. Descarga estándar de navegador
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Manejo de descarga estándar o PRO
  const handleDownload = async (format: 'png' | 'svg', forcePro: boolean = false) => {
    // Si intenta descargar función PRO sin plan
    if (!isPro && forcePro) {
      setProModalInfo({
        name: 'Estudio QR HD (2000px), Degradados & Marcos',
        desc: 'Descarga tus códigos QR en resolución ultra alta (2000px) listos para imprenta, con marcos para acrílico de mesa y degradados estilo Instagram.'
      })
      setShowProModal(true)
      return
    }

    setIsDownloading(true)
    try {
      if (frameStyle === 'none' || (!isPro && !forcePro)) {
        // Descarga directa del QR estándar (500px)
        if (qrCodeInstance.current) {
          const rawBlob = await qrCodeInstance.current.getRawData(format)
          if (rawBlob) {
            const filename = `omnitag_qr_${sourceType}_${isPro ? '2000px_hd' : '500px'}.${format}`
            await processSaveOrShare(rawBlob as Blob, filename, format === 'svg')
          }
        }
        return
      }

      // Renderizar marco completo en ultra alta resolución (1800 x 2250 px) para imprenta
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const scale = 3
      const width = 600 * scale
      const height = 750 * scale
      canvas.width = width
      canvas.height = height

      const selectedPreset = PRESET_GRADIENTS.find(p => p.id === colorPreset) || PRESET_GRADIENTS[0]

      // Fondo del marco con gradiente o color
      if (frameStyle === 'instagram_nametag') {
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, selectedPreset.colors[0])
        gradient.addColorStop(0.5, selectedPreset.colors[1] || selectedPreset.colors[0])
        gradient.addColorStop(1, selectedPreset.colors[2] || selectedPreset.colors[0])
        ctx.fillStyle = gradient
      } else if (frameStyle === 'table_tent') {
        ctx.fillStyle = '#0F172A'
      } else {
        ctx.fillStyle = '#18181B'
      }
      ctx.fillRect(0, 0, width, height)

      // Cabecera / Título
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `bold ${28 * scale}px "Plus Jakarta Sans", -apple-system, system-ui, sans-serif`
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

      // Renderizar QR en alta resolución sobre la tarjeta
      const highResDots: any = {
        type: dotStyle,
      }
      if (useGradient && selectedPreset.colors.length > 1) {
        highResDots.gradient = {
          type: selectedPreset.type,
          rotation: (selectedPreset.rotation || 45) * (Math.PI / 180),
          colorStops: selectedPreset.colors.map((c, i) => ({ offset: i / (selectedPreset.colors.length - 1), color: c }))
        }
      } else {
        highResDots.color = customColor
      }

      const highResQr = new QRCodeStyling({
        width: 420 * scale,
        height: 420 * scale,
        data: getTargetUrl(),
        margin: 8 * scale,
        qrOptions: { errorCorrectionLevel: 'Q' },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.35, margin: 4 * scale, crossOrigin: 'anonymous' },
        dotsOptions: highResDots,
        cornersSquareOptions: { type: cornerSquareStyle, color: selectedPreset.colors[0] },
        cornersDotOptions: { type: cornerDotStyle, color: selectedPreset.colors[0] },
        backgroundOptions: { color: 'transparent' },
        image: logoUrl || undefined
      })

      const rawBlob = await highResQr.getRawData('png')
      if (rawBlob) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        const url = URL.createObjectURL(rawBlob as Blob)
        img.src = url
        await new Promise(resolve => { 
          img.onload = resolve
          img.onerror = resolve
        })

        ctx.drawImage(img, cardX + 30 * scale, cardY + 30 * scale, 420 * scale, 420 * scale)
        URL.revokeObjectURL(url)
      }

      // Botón / Llamada a la acción inferior
      const btnY = 620 * scale
      const btnHeight = 65 * scale
      const btnWidth = 440 * scale
      const btnX = (width - btnWidth) / 2

      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.beginPath()
      ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 20 * scale)
      ctx.fill()

      ctx.fillStyle = '#000000'
      ctx.font = `bold ${16 * scale}px "Plus Jakarta Sans", -apple-system, system-ui, sans-serif`
      ctx.fillText(frameText.toUpperCase(), width / 2, btnY + 40 * scale)

      // Convertir Canvas a imagen descargable
      canvas.toBlob(async (blob) => {
        if (!blob) return
        const filename = `omnitag_qr_imprimible_${sourceType}_hd.png`
        await processSaveOrShare(blob, filename, false)
      }, 'image/png', 1.0)

    } catch (err) {
      console.error('Error generando QR:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* BANNER EDUCATIVO PRO vs BÁSICO (Para que el cliente conozca todas las opciones PRO) */}
      {!isPro && (
        <div className="bg-linear-to-r from-purple-900 via-indigo-900 to-black text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3 fill-black" /> Desbloquea el Estudio QR Profesional
            </div>
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
              ¿Quieres tus QRs listos para imprenta con tu Logo y Degradados?
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              En el <b>Plan Básico</b> puedes descargar QRs estándar en 500px. Con <b>OmniTag PRO</b> obtienes descargas en <b>Ultra HD (2000px)</b>, formato <b>SVG Vectorial</b>, marcos para acrílicos de mesa/mostrador y tu logotipo central.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setProModalInfo({
                name: 'Estudio QR HD, Degradados & Marcos para Imprenta',
                desc: 'Descarga tus códigos QR en resolución ultra alta (2000px y SVG) listos para imprenta, con marcos para acrílico de mesa y degradados estilo Instagram.'
              })
              setShowProModal(true)
            }}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Ver Opciones PRO (L. 550 / $20)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* PANEL IZQUIERDO: CONTROLES DE DISEÑO */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Seleccionar Qué Vincular */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              1. ¿Qué deseas vincular a este Código QR?
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSourceType('vcard')}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex flex-col justify-between ${
                  sourceType === 'vcard'
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-gray-200 bg-gray-50/60 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>📇 Mi vCard</span>
                <span className="text-[10px] opacity-75 font-normal truncate mt-1">{vcard?.slug || 'No creada'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('menu')}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex flex-col justify-between ${
                  sourceType === 'menu'
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-gray-200 bg-gray-50/60 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>🍽️ Menú / Catálogo</span>
                <span className="text-[10px] opacity-75 font-normal truncate mt-1">{menu?.name || 'No creado'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('loyalty')}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex flex-col justify-between ${
                  sourceType === 'loyalty'
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-gray-200 bg-gray-50/60 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>🎁 Fidelización / Sellos</span>
                <span className="text-[10px] opacity-75 font-normal truncate mt-1">{loyalty?.name || 'No creado'}</span>
              </button>

              {devices.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSourceType('device')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex flex-col justify-between ${
                    sourceType === 'device'
                      ? 'border-black bg-black text-white shadow-xs'
                      : 'border-gray-200 bg-gray-50/60 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>⭐ Placa Google Reviews</span>
                  <span className="text-[10px] opacity-75 font-normal mt-1">{devices.length} Placa(s)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSourceType('wifi')}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex flex-col justify-between ${
                  sourceType === 'wifi'
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-gray-200 bg-gray-50/60 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>📶 Conexión Wi-Fi</span>
                <span className="text-[10px] opacity-75 font-normal mt-1">Conexión automática</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('custom')}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex flex-col justify-between ${
                  sourceType === 'custom'
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-gray-200 bg-gray-50/60 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>🌐 Enlace Web Libre</span>
                <span className="text-[10px] opacity-75 font-normal mt-1">Cualquier URL</span>
              </button>
            </div>

            {sourceType === 'wifi' && (
              <div className="pt-2 p-4 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Wifi className="w-4 h-4 text-purple-700" /> Parámetros de la Red Wi-Fi
                  </span>
                  <span className="text-[10px] bg-purple-200/80 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                    Conexión directa en iPhone y Android
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la Red (SSID):</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="Ej. MiNegocio_Clientes"
                      className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Seguridad:</label>
                    <select
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value as any)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Recomendada)</option>
                      <option value="WEP">WEP (Antigua)</option>
                      <option value="nopass">Sin contraseña (Red Abierta)</option>
                    </select>
                  </div>
                </div>

                {wifiEncryption !== 'nopass' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">Contraseña de la Red Wi-Fi:</label>
                      <button
                        type="button"
                        onClick={() => setShowWifiPassword(!showWifiPassword)}
                        className="text-[11px] font-bold text-purple-700 hover:underline cursor-pointer"
                      >
                        {showWifiPassword ? 'Ocultar clave' : 'Mostrar clave'}
                      </button>
                    </div>
                    <input
                      type={showWifiPassword ? 'text' : 'password'}
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Contraseña del router"
                      className="w-full text-xs font-mono font-medium px-3.5 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-xs text-gray-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-black focus:ring-black"
                    />
                    <span className="text-[11px] font-medium">¿Es una red oculta?</span>
                  </label>
                  <span className="text-[10px] text-gray-400">
                    Estándar oficial WIFI:S:...
                  </span>
                </div>
              </div>
            )}

            {sourceType === 'custom' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Introduce la URL de Destino:</label>
                <input 
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://tu-sitio-web.com"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            )}

            {/* Si elige Menú: Selector de Mesa o Ubicación */}
            {sourceType === 'menu' && menu && (
              <div className="pt-2 p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5" /> Mesa o Ubicación para este QR
                  </span>
                  <Link href="/dashboard/menus" className="text-[11px] text-gray-400 hover:text-white underline">
                    + Administrar lista de mesas &rarr;
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTable('')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      !selectedTable
                        ? 'bg-yellow-400 text-black shadow-xs'
                        : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>🌟 Menú General (Sin Mesa)</span>
                    {!selectedTable && <Check className="w-3 h-3" />}
                  </button>

                  {Array.isArray(menu.tables) && menu.tables.map((t: any) => (
                    <button
                      key={t.id || t.name}
                      type="button"
                      onClick={() => setSelectedTable(t.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        selectedTable === t.name
                          ? 'bg-yellow-400 text-black shadow-xs'
                          : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>🪑 {t.name}</span>
                      {selectedTable === t.name && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">O escribir mesa personalizada:</span>
                  <input
                    type="text"
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    placeholder="Ej. Mesa 4 / Barra / Terraza VIP"
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                {selectedTable && (
                  <p className="text-[11px] text-yellow-300/90 font-medium">
                    ✨ El comensal que escanee este QR abrirá el menú con la <b>{selectedTable}</b> preseleccionada y su pedido llegará a WhatsApp con esta ubicación.
                  </p>
                )}
              </div>
            )}

            {sourceType === 'device' && devices.length > 0 && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Selecciona la Placa NFC / QR:</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>Placa {d.tag_id} ({d.device_type})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. Paletas de Colores & Degradados Tipo Instagram */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                2. Paleta de Color y Degradados
              </label>
              {!isPro && (
                <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" /> Degradados PRO
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESET_GRADIENTS.map((p) => {
                const isSelected = colorPreset === p.id && useGradient
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (!isPro && p.id !== 'monochrome') {
                        setProModalInfo({
                          name: 'Degradados de Color Estilo Instagram',
                          desc: 'Desbloquea degradados vibrantes y paletas exclusivas para que tus códigos QR resalten y atraigan más escaneos.'
                        })
                        setShowProModal(true)
                      }
                      setColorPreset(p.id)
                      setUseGradient(p.id !== 'monochrome')
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected ? 'border-black ring-2 ring-black/10 bg-gray-50 font-bold' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div 
                        className="w-6 h-6 rounded-full shrink-0 shadow-xs border border-white"
                        style={{
                          background: p.colors.length > 1 
                            ? `linear-gradient(135deg, ${p.colors.join(', ')})`
                            : p.colors[0]
                        }}
                      />
                      <span className="text-xs text-gray-900 truncate">{p.name}</span>
                    </div>

                    {!isPro && p.id !== 'monochrome' && (
                      <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Forma de Puntos y Esquinas (Dots & Eyes) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              3. Patrón de Puntos y Esquinas
            </label>

            {/* Tipo de puntos */}
            <div>
              <span className="block text-xs font-semibold text-gray-700 mb-2">Forma de los Puntos:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'dots', name: 'Puntos Circulares (Instagram)' },
                  { id: 'rounded', name: 'Burbujas Suaves' },
                  { id: 'classy', name: 'Elegante / Tech' },
                  { id: 'square', name: 'Cuadrado Clásico' },
                ].map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDotStyle(d.id as DotType)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                      dotStyle === d.id ? 'border-black bg-black text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Ojos / Esquinas */}
            <div>
              <span className="block text-xs font-semibold text-gray-700 mb-2">Diseño de las Esquinas (Ojos):</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'extra-rounded', name: 'Curvas Suaves' },
                  { id: 'dot', name: 'Círculo Interior' },
                  { id: 'square', name: 'Cuadrado Limpio' },
                ].map(e => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => {
                      setCornerSquareStyle(e.id as CornerSquareType)
                      setCornerDotStyle(e.id === 'dot' ? 'dot' : 'square')
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                      cornerSquareStyle === e.id ? 'border-black bg-black text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {e.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Logotipo Central & Marco de Impresión */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                4. Logotipo Central y Marco para Impresión
              </label>
              {!isPro && (
                <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3 text-purple-600" /> Marcos HD PRO
                </span>
              )}
            </div>

            <ImageUploadInput
              name="logo"
              label="Logotipo en el Centro del QR"
              defaultValue={logoUrl}
              shape="circle"
              onImageChange={(url) => {
                if (!isPro && url) {
                  setProModalInfo({
                    name: 'Logotipo Central en Código QR',
                    desc: 'Incrusta el logotipo o foto de tu marca directamente en el centro del código QR sin afectar la legibilidad de lectura.'
                  })
                  setShowProModal(true)
                }
                setLogoUrl(url)
              }}
              helpText="Tu logo quedará protegido en el centro sin afectar la lectura del QR."
            />

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Estilo de Marco Imprimible:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FRAME_STYLES.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      if (!isPro && f.isPro) {
                        setProModalInfo({
                          name: 'Marcos de Impresión para Negocios',
                          desc: 'Descarga marcos profesionales para acrílicos de mesa, mostrador y tarjetas con tu nombre y llamado a la acción.'
                        })
                        setShowProModal(true)
                      }
                      setFrameStyle(f.id)
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                      frameStyle === f.id ? 'border-black bg-black text-white' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span>{f.name}</span>
                    {!isPro && f.isPro && (
                      <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {frameStyle !== 'none' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Título de la Cabecera:</label>
                  <input 
                    type="text"
                    value={frameTitle}
                    onChange={(e) => setFrameTitle(e.target.value)}
                    placeholder="Ej. NEXORIA DIGITAL / MI NEGOCIO"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Texto del Botón Inferior:</label>
                  <input 
                    type="text"
                    value={frameText}
                    onChange={(e) => setFrameText(e.target.value)}
                    placeholder="Ej. ESCANÉAME CON TU CÁMARA"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: VISTA PREVIA EN VIVO Y BOTÓN DE DESCARGA */}
        <div className="lg:col-span-5 sticky top-6 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-lg text-center overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-extrabold uppercase tracking-wider mb-4">
              <Crown className="w-3.5 h-3.5" /> Generador de Impresión HD
            </div>

            {/* VISTA PREVIA PERFECTAMENTE RESPONSIVA Y CENTRADA */}
            <div className="flex justify-center items-center py-2 px-1">
              {frameStyle === 'none' ? (
                <div className="p-3 sm:p-4 bg-white rounded-3xl shadow-md border border-gray-200 inline-flex items-center justify-center max-w-full">
                  <div 
                    ref={qrRef} 
                    className="flex items-center justify-center [&>canvas]:max-w-full [&>canvas]:h-auto [&>svg]:max-w-full [&>svg]:h-auto" 
                  />
                </div>
              ) : (
                <div 
                  className="w-full max-w-[280px] sm:max-w-xs rounded-3xl p-4 sm:p-5 shadow-2xl text-white transition-all text-center mx-auto overflow-hidden flex flex-col items-center justify-between"
                  style={{
                    background: frameStyle === 'instagram_nametag'
                      ? `linear-gradient(135deg, ${PRESET_GRADIENTS.find(p => p.id === colorPreset)?.colors.join(', ') || '#833AB4, #FD1D1D, #FCB045'})`
                      : frameStyle === 'table_tent'
                      ? '#0F172A'
                      : '#18181B'
                  }}
                >
                  <h4 className="font-extrabold text-xs sm:text-sm tracking-tight mb-3 uppercase truncate w-full px-2">
                    {frameTitle || 'OMNITAG'}
                  </h4>

                  {/* Contenedor blanco del QR */}
                  <div className="bg-white rounded-2xl p-2 shadow-md w-[220px] h-[220px] max-w-full flex items-center justify-center overflow-hidden mx-auto">
                    <div 
                      ref={qrRef} 
                      className="w-full h-full flex items-center justify-center [&>canvas]:max-w-full [&>canvas]:h-auto [&>svg]:max-w-full [&>svg]:h-auto" 
                    />
                  </div>

                  <div className="mt-3.5 bg-white/95 text-black font-extrabold text-[11px] sm:text-xs py-2 px-3 rounded-xl shadow-xs uppercase tracking-wider w-full truncate">
                    {frameText || 'ESCANÉAME'}
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-4 leading-relaxed truncate px-2">
              Destino: <span className="font-mono font-bold text-gray-700">{getTargetUrl()}</span>
            </p>

            {/* BOTONES DE DESCARGA CON DIFERENCIACIÓN CLARA */}
            <div className="mt-6 space-y-2.5">
              {/* Botón 1: Descarga Estándar Gratuita (Para usuarios Básico) o Descarga Ultra HD (Para PRO) */}
              <button
                type="button"
                disabled={isDownloading}
                onClick={() => handleDownload('png', false)}
                className={`w-full font-extrabold py-3.5 px-5 rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer text-xs sm:text-sm disabled:opacity-50 ${
                  isPro 
                    ? 'bg-black hover:bg-gray-800 text-white' 
                    : 'bg-gray-900 hover:bg-black text-white'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>
                  {isDownloading 
                    ? 'Generando imagen...' 
                    : isPro 
                    ? 'Descargar en Ultra HD (PNG 2000px)' 
                    : 'Descargar Código QR Estándar (500px)'}
                </span>
              </button>

              {/* Botón 2: Botón de Descarga PRO para usuarios Free (Desbloquear 2000px / Marcos) */}
              {!isPro && (
                <button
                  type="button"
                  onClick={() => handleDownload('png', true)}
                  className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md text-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Desbloquear Descarga HD para Imprenta (2000px / SVG)</span>
                </button>
              )}

              {/* Botón 3: SVG Vectorial para usuarios PRO */}
              {isPro && frameStyle === 'none' && (
                <button
                  type="button"
                  onClick={() => handleDownload('svg', false)}
                  className="w-full bg-gray-100 text-gray-800 font-bold py-2.5 px-4 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <FileImage className="w-4 h-4" />
                  <span>Descargar en SVG Vectorial (Imprenta)</span>
                </button>
              )}

              {/* Botón 4: Grabar este enlace en tarjeta NFC física */}
              <button
                type="button"
                onClick={() => setShowNfcWriter(true)}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-extrabold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer shadow-xs"
              >
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>Grabar este Enlace en Tarjeta NFC</span>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-left text-[11px] text-gray-500 space-y-1">
              <p className="font-semibold text-gray-700">📱 En tu teléfono móvil:</p>
              <p>• Al presionar descargar, se guardará el archivo y se abrirá una ventana para guardarlo directo en tu <b>Fototeca o Carrete de Fotos</b>.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Ayudar a Guardar en Fotos en Móviles */}
      {previewDownloadImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewDownloadImage(null)}
        >
          <div 
            className="relative max-w-sm w-full bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ¡Código QR Listo!
              </h4>
              <button 
                onClick={() => setPreviewDownloadImage(null)}
                className="p-1 text-gray-400 hover:text-black rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 bg-gray-50 rounded-2xl flex items-center justify-center max-h-[50vh] overflow-hidden">
              <img 
                src={previewDownloadImage} 
                alt="QR Generado" 
                className="max-h-full max-w-full object-contain rounded-xl shadow-xs" 
              />
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(previewDownloadImage)
                    const blob = await res.blob()
                    const file = new File([blob], `omnitag_qr_${sourceType}.png`, { type: 'image/png' })
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                      await navigator.share({
                        files: [file],
                        title: 'Guardar Código QR',
                        text: 'Código QR de OmniTag'
                      })
                    } else {
                      alert('Mantén presionada la imagen arriba y selecciona "Guardar en Fotos".')
                    }
                  } catch {
                    alert('Mantén presionada la imagen arriba y selecciona "Guardar en Fotos".')
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>📲 Guardar en Carrete / Fotos</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDownloadImage(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upgrade PRO */}
      <ProFeatureModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        featureName={proModalInfo.name}
        featureDescription={proModalInfo.desc}
      />

      {/* Modal del Grabador Web NFC */}
      <NfcCardWriterModal
        isOpen={showNfcWriter}
        onClose={() => setShowNfcWriter(false)}
        initialUrl={getNfcUrl()}
        initialTitle={`QR ${sourceType}`}
      />
    </div>
  )
}
