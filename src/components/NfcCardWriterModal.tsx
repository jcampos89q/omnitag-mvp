'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Radio, 
  X, 
  Check, 
  Copy, 
  Smartphone, 
  AlertCircle, 
  CheckCircle2, 
  RotateCw, 
  Sparkles, 
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Wifi
} from 'lucide-react'

interface NfcCardWriterModalProps {
  isOpen: boolean
  onClose: () => void
  initialUrl?: string
  initialTitle?: string
}

export default function NfcCardWriterModal({
  isOpen,
  onClose,
  initialUrl = '',
  initialTitle = 'Tarjeta NFC'
}: NfcCardWriterModalProps) {
  const [url, setUrl] = useState<string>(initialUrl)
  const [isSupported, setIsSupported] = useState<boolean>(false)
  const [status, setStatus] = useState<'idle' | 'waiting' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [copied, setCopied] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'write' | 'read' | 'guide'>('write')
  const [scannedInfo, setScannedInfo] = useState<{ serialNumber?: string, records?: string[] } | null>(null)
  const [wifiMode, setWifiMode] = useState<'native' | 'web'>('native')

  const abortControllerRef = useRef<AbortController | null>(null)

  // Función para construir el payload binario oficial Wi-Fi Alliance WSC (TLV Big-Endian)
  const buildWfaWscPayload = (ssid: string, password: string, encryption: string = 'WPA'): Uint8Array => {
    const encoder = new TextEncoder()
    const ssidBytes = encoder.encode(ssid)
    const passBytes = encoder.encode(password)
    const isWpa = encryption !== 'nopass'
    const isWep = encryption === 'WEP'

    const parts: number[] = []

    // 1. Network Index (0x1026, len 1, val 1)
    parts.push(0x10, 0x26, 0x00, 0x01, 0x01)

    // 2. SSID (0x1045)
    parts.push(0x10, 0x45, (ssidBytes.length >> 8) & 0xff, ssidBytes.length & 0xff, ...Array.from(ssidBytes))

    // 3. Authentication Type (0x1003, len 2)
    // WPA2-Personal = 0x0020, WPA-Personal = 0x0002, Open = 0x0001
    const authVal = isWpa ? 0x0020 : isWep ? 0x0002 : 0x0001
    parts.push(0x10, 0x03, 0x00, 0x02, (authVal >> 8) & 0xff, authVal & 0xff)

    // 4. Encryption Type (0x100F, len 2)
    // AES = 0x0008, TKIP = 0x0004, None = 0x0001
    const encVal = isWpa ? 0x0008 : isWep ? 0x0004 : 0x0001
    parts.push(0x10, 0x0F, 0x00, 0x02, (encVal >> 8) & 0xff, encVal & 0xff)

    // 5. Network Key (0x1027)
    if (isWpa || isWep) {
      parts.push(0x10, 0x27, (passBytes.length >> 8) & 0xff, passBytes.length & 0xff, ...Array.from(passBytes))
    }

    // 6. MAC Address (0x1020, len 6, broadcast)
    parts.push(0x10, 0x20, 0x00, 0x06, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff)

    return new Uint8Array(parts)
  }

  const getWifiDetails = () => {
    let raw = url || initialUrl || ''
    if (raw.startsWith('WIFI:')) {
      const ssid = raw.match(/S:([^;]+)/)?.[1] || 'WiFi'
      const pass = raw.match(/P:([^;]+)/)?.[1] || ''
      const enc = raw.match(/T:([^;]+)/)?.[1] || 'WPA'
      return { isWifi: true, ssid, pass, enc }
    }
    if (raw.includes('/wifi?')) {
      try {
        const query = raw.split('?')[1] || ''
        const params = new URLSearchParams(query)
        const ssid = params.get('ssid') || 'WiFi'
        const pass = params.get('pass') || ''
        const enc = params.get('enc') || 'WPA'
        return { isWifi: true, ssid, pass, enc }
      } catch {
        return { isWifi: false, ssid: '', pass: '', enc: '' }
      }
    }
    return { isWifi: false, ssid: '', pass: '', enc: '' }
  }

  const normalizeNfcUrl = (raw: string): string => {
    let clean = (raw || '').trim()
    if (clean.startsWith('WIFI:')) {
      const ssidMatch = clean.match(/S:([^;]+)/)
      const passMatch = clean.match(/P:([^;]+)/)
      const encMatch = clean.match(/T:([^;]+)/)
      const ssid = ssidMatch ? ssidMatch[1] : 'WiFi'
      const pass = passMatch ? passMatch[1] : ''
      const enc = encMatch ? encMatch[1] : 'WPA'
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.omnitag.site'
      return `${origin}/wifi?ssid=${encodeURIComponent(ssid)}&pass=${encodeURIComponent(pass)}&enc=${encodeURIComponent(enc)}`
    }
    return clean
  }

  useEffect(() => {
    setUrl(normalizeNfcUrl(initialUrl))
  }, [initialUrl])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('NDEFReader' in window)
    }
  }, [])

  // Limpiar abort controller al cerrar o desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const cancelOperation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setStatus('idle')
    setStatusMessage('')
  }

  // 1. Grabar Tarjeta NFC vía Web NFC API
  const handleWriteNFC = async () => {
    const cleanUrl = normalizeNfcUrl(url)
    if (!cleanUrl) {
      setStatus('error')
      setStatusMessage('Por favor introduce o selecciona una URL válida.')
      return
    }

    if (!isSupported) {
      setStatus('error')
      setStatusMessage('Web NFC no está disponible en este navegador. Revisa la pestaña de "Guía Alternativa" abajo.')
      return
    }

    try {
      setStatus('waiting')
      setStatusMessage('📡 Acerca tu tarjeta, llavero o placa NFC a la parte trasera de tu teléfono...')

      const NDEFReaderClass = (window as any).NDEFReader
      const ndef = new NDEFReaderClass()
      abortControllerRef.current = new AbortController()

      const wifi = getWifiDetails()
      if (wifi.isWifi && wifiMode === 'native') {
        const payload = buildWfaWscPayload(wifi.ssid, wifi.pass, wifi.enc)
        await ndef.write(
          {
            records: [
              {
                recordType: 'mime',
                mediaType: 'application/vnd.wfa.wsc',
                data: payload
              }
            ]
          },
          { signal: abortControllerRef.current.signal }
        )

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([100, 50, 150])
        }

        setStatus('success')
        setStatusMessage(`🎉 ¡Chip NFC grabado en modo Wi-Fi Nativo Offline (${wifi.ssid})! Los teléfonos Android se conectarán automáticamente al tocarlo sin necesidad de datos móviles ni internet previo.`)
        return
      }

      await ndef.write(
        {
          records: [
            {
              recordType: 'url',
              data: cleanUrl
            }
          ]
        },
        { signal: abortControllerRef.current.signal }
      )

      // Vibración de éxito si está disponible
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 150])
      }

      setStatus('success')
      setStatusMessage('🎉 ¡Tarjeta NFC grabada con éxito! Ya está lista para ser tocada por tus clientes.')
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setStatus('idle')
        setStatusMessage('')
        return
      }

      console.error('NFC Write Error:', err)
      setStatus('error')
      if (err.name === 'NotAllowedError') {
        setStatusMessage('Permiso denegado. Asegúrate de autorizar el acceso a NFC en tu navegador.')
      } else if (err.name === 'NotSupportedError') {
        setStatusMessage('Este dispositivo no cuenta con hardware NFC o está apagado en los ajustes.')
      } else {
        setStatusMessage(err.message || 'Ocurrió un error al intentar escribir en la tarjeta NFC.')
      }
    }
  }

  // 2. Leer Tarjeta NFC vía Web NFC API
  const handleReadNFC = async () => {
    if (!isSupported) {
      setStatus('error')
      setStatusMessage('Web NFC no está disponible en este navegador.')
      return
    }

    try {
      setStatus('waiting')
      setStatusMessage('🔍 Acerca una tarjeta NFC a la parte trasera para diagnosticarla...')
      setScannedInfo(null)

      const NDEFReaderClass = (window as any).NDEFReader
      const ndef = new NDEFReaderClass()
      abortControllerRef.current = new AbortController()

      await ndef.scan({ signal: abortControllerRef.current.signal })

      ndef.onreading = (event: any) => {
        const recordsData: string[] = []
        for (const record of event.message.records) {
          if (record.recordType === 'url') {
            const textDecoder = new TextDecoder()
            recordsData.push(`URL: ${textDecoder.decode(record.data)}`)
          } else if (record.recordType === 'text') {
            const textDecoder = new TextDecoder(record.encoding)
            recordsData.push(`Texto: ${textDecoder.decode(record.data)}`)
          } else {
            recordsData.push(`Tipo: ${record.recordType}`)
          }
        }

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(100)
        }

        setScannedInfo({
          serialNumber: event.serialNumber || 'Chip Estándar NTAG',
          records: recordsData
        })
        setStatus('success')
        setStatusMessage('✅ ¡Tarjeta NFC leída correctamente!')
      }

      ndef.onreadingerror = () => {
        setStatus('error')
        setStatusMessage('No se pudo leer la tarjeta. Mantenla fija en la parte trasera.')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setStatus('idle')
        return
      }
      setStatus('error')
      setStatusMessage(err.message || 'Error al inicializar el lector NFC.')
    }
  }

  const copyUrl = () => {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-black text-white p-6 relative">
          <button
            onClick={() => {
              cancelOperation()
              onClose()
            }}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-900/50 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                <Zap className="w-3 h-3 text-emerald-400" /> Herramienta de Grabación Web NFC
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                Grabador de Tarjetas NFC
              </h2>
            </div>
          </div>
          <p className="text-xs text-gray-300 mt-2">
            Escribe y configura tarjetas, llaveros o placas físicas NFC directamente desde tu navegador.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/70 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => {
              cancelOperation()
              setActiveTab('write')
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'write'
                ? 'bg-white text-black shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Grabar Tarjeta</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cancelOperation()
              setActiveTab('read')
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'read'
                ? 'bg-white text-black shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Leer / Diagnosticar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cancelOperation()
              setActiveTab('guide')
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-white text-black shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>iPhone & Guía</span>
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="p-6 space-y-5">
          {/* TAB 1: GRABAR TARJETA */}
          {activeTab === 'write' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Enlace de Destino a Grabar en el Chip NFC:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.omnitag.site/..."
                    className="flex-1 text-xs font-mono font-medium px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition cursor-pointer"
                    title="Copiar enlace"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Este es el enlace que se abrirá en el teléfono de cualquier cliente al aproximarse.
                </p>
              </div>

              {/* Selector de Modo Wi-Fi para NFC */}
              {getWifiDetails().isWifi && (
                <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-950 flex items-center gap-1.5 uppercase tracking-wider">
                      <Wifi className="w-3.5 h-3.5 text-purple-600" /> Red Wi-Fi Detectada: {getWifiDetails().ssid}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWifiMode('native')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        wifiMode === 'native'
                          ? 'border-purple-600 bg-white shadow-xs'
                          : 'border-purple-200 bg-purple-50/50 hover:bg-white text-gray-600'
                      }`}
                    >
                      <p className="text-xs font-bold text-purple-950 flex items-center gap-1">
                        <span>⚡ Wi-Fi Nativo Offline</span>
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                        Para Android: conecta <b>100% sin internet ni datos móviles</b> con 1 toque al chip.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWifiMode('web')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        wifiMode === 'web'
                          ? 'border-purple-600 bg-white shadow-xs'
                          : 'border-purple-200 bg-purple-50/50 hover:bg-white text-gray-600'
                      }`}
                    >
                      <p className="text-xs font-bold text-purple-950 flex items-center gap-1">
                        <span>🌐 Tarjeta Web Wi-Fi</span>
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                        Abre la página web con copia de clave y enlace a tu menú digital.
                      </p>
                    </button>
                  </div>

                  <p className="text-[11px] text-purple-900 leading-relaxed bg-white/90 p-2.5 rounded-xl border border-purple-100">
                    💡 <b>¿Tienes clientes con iPhone sin internet?</b> Apple no permite que chips NFC conecten a Wi-Fi en segundo plano. Para conectar iPhones sin datos móviles, la solución oficial e infalible es el <b>Código QR impreso</b> (lo escanean con la cámara y conecta de inmediato de forma 100% offline).
                  </p>
                </div>
              )}

              {/* Estado de compatibilidad */}
              {!isSupported && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">
                        Navegador o Dispositivo sin Web NFC directo
                      </h4>
                      <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                        La grabación NFC en vivo mediante navegador requiere <b>Google Chrome en Android</b> con NFC activado. Si estás en una PC o iPhone, puedes:
                      </p>
                      <ul className="text-[11px] text-amber-800 list-disc list-inside mt-1 space-y-0.5 font-medium">
                        <li>Abrir este panel en tu teléfono Android con Chrome.</li>
                        <li>O grabar el enlace copiado con la app gratuita <b>NFC Tools</b> (ver pestaña Guía).</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback de Estado */}
              {status === 'waiting' && (
                <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl text-center space-y-3 animate-in fade-in">
                  <div className="w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                    <Radio className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-purple-950">Esperando Tarjeta NFC...</h4>
                    <p className="text-xs text-purple-700 mt-1">{statusMessage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={cancelOperation}
                    className="text-xs font-bold text-gray-500 hover:text-black underline cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {status === 'success' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-emerald-900">¡Grabación Exitosa!</h4>
                    <p className="text-xs text-emerald-700 leading-relaxed">{statusMessage}</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-red-900">Atención</h4>
                    <p className="text-xs text-red-700 leading-relaxed">{statusMessage}</p>
                  </div>
                </div>
              )}

              {/* Botón de Acción Principal */}
              {status !== 'waiting' && (
                <button
                  type="button"
                  onClick={handleWriteNFC}
                  disabled={!isSupported}
                  className={`w-full py-4 rounded-2xl font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                    isSupported
                      ? 'bg-black hover:bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>{isSupported ? 'Tocar para Grabar Tarjeta NFC' : 'Web NFC No Disponible en este Navegador'}</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 2: LEER Y DIAGNOSTICAR */}
          {activeTab === 'read' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-xs font-extrabold text-gray-900">Diagnóstico de Chips NFC</h4>
                <p className="text-xs text-gray-500">
                  Acerca cualquier tarjeta o llavero NFC para verificar qué datos tiene grabados y comprobar si funciona correctamente.
                </p>
              </div>

              {scannedInfo ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="text-xs font-bold text-gray-600">Número de Serie (UID):</span>
                    <span className="font-mono text-xs font-black text-purple-700">{scannedInfo.serialNumber}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-600">Registros Encontrados:</span>
                    {scannedInfo.records && scannedInfo.records.length > 0 ? (
                      scannedInfo.records.map((rec, idx) => (
                        <p key={idx} className="font-mono text-xs p-2 bg-white rounded-lg border border-gray-200 break-all">
                          {rec}
                        </p>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">Tarjeta limpia / Sin registros NDEF</p>
                    )}
                  </div>
                </div>
              ) : null}

              {status === 'waiting' && (
                <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md animate-pulse">
                    <RotateCw className="w-6 h-6 animate-spin" />
                  </div>
                  <p className="text-xs font-extrabold text-blue-950">{statusMessage}</p>
                  <button
                    type="button"
                    onClick={cancelOperation}
                    className="text-xs font-bold text-gray-500 hover:text-black underline cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {status !== 'waiting' && (
                <button
                  type="button"
                  onClick={handleReadNFC}
                  disabled={!isSupported}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                    isSupported
                      ? 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <RotateCw className="w-4 h-4 text-purple-700" />
                  <span>Escanear Tarjeta NFC</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 3: GUÍA PARA IPHONE & COMPATIBILIDAD */}
          {activeTab === 'guide' && (
            <div className="space-y-3.5 text-xs text-gray-600 leading-relaxed">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-1 text-purple-950">
                <p className="font-extrabold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-700" /> ¿Por qué Apple Safari no permite Web NFC?
                </p>
                <p className="text-[11px] text-purple-800">
                  Los iPhones pueden <b>leer placas NFC de fondo al instante</b> (sin abrir ninguna app), pero Apple aún no habilita la API de <i>escritura en navegador</i> para Safari.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-extrabold text-gray-900">
                  Cómo grabar tus tarjetas NFC en 3 pasos con cualquier móvil:
                </p>

                <ol className="space-y-2 list-decimal list-inside text-[11px]">
                  <li className="p-2 bg-gray-50 rounded-xl border border-gray-200">
                    <b>Copia tu enlace:</b> Haz clic en el botón de copiar enlace arriba:
                    <span className="block font-mono text-[10px] text-purple-700 bg-white p-1 rounded mt-1 truncate">
                      {url || 'https://www.omnitag.site/...'}
                    </span>
                  </li>

                  <li className="p-2 bg-gray-50 rounded-xl border border-gray-200">
                    <b>Descarga NFC Tools:</b> Abre la app gratuita <b>NFC Tools</b> en tu iPhone o Android (disponible en App Store y Google Play).
                  </li>

                  <li className="p-2 bg-gray-50 rounded-xl border border-gray-200">
                    <b>Grabar:</b> Ve a <b>Escribir</b> &rarr; <b>Añadir un registro</b> &rarr; <b>URL / Enlace</b>, pega el enlace y acerca la tarjeta a tu teléfono. ¡Listo!
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 font-medium">
            Compatible con chips NTAG213, NTAG215 y NTAG216
          </span>
          <button
            type="button"
            onClick={() => {
              cancelOperation()
              onClose()
            }}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
