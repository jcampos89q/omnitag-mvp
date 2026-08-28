'use client'

import { useState, useRef, useEffect } from 'react'
import { QrCode, Download, X, Sparkles, Check, ChevronRight, UtensilsCrossed, Layers } from 'lucide-react'

interface TableQRGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  menuSlug: string
  menuName: string
  isPro?: boolean
}

export default function TableQRGeneratorModal({
  isOpen,
  onClose,
  menuSlug,
  menuName,
  isPro = false
}: TableQRGeneratorModalProps) {
  const [tableCount, setTableCount] = useState<number>(5)
  const [tablePrefix, setTablePrefix] = useState<string>('Mesa')
  const [selectedTable, setSelectedTable] = useState<number>(1)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Generar lista de mesas
  const maxAllowedTables = isPro ? 50 : 3
  const tables = Array.from({ length: Math.min(tableCount, maxAllowedTables) }, (_, i) => i + 1)

  const currentTableLabel = `${tablePrefix} #${selectedTable}`
  const currentTableUrl = `https://www.omnitag.site/m/${menuSlug}?mesa=${selectedTable}`

  // Renderizar QR en Canvas con Marco Imprimible
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 600
    const height = 800
    canvas.width = width
    canvas.height = height

    // Fondo blanco elegante con bordes redondeados
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)

    // Cabecera superior
    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, width, 140)

    // Nombre del restaurante
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(menuName.toUpperCase(), width / 2, 50)

    // Título de la mesa
    ctx.fillStyle = '#FBBF24' // Dorado
    ctx.font = 'black 36px system-ui, -apple-system, sans-serif'
    ctx.fillText(currentTableLabel.toUpperCase(), width / 2, 105)

    // Cargar y dibujar el Código QR
    const qrImg = new Image()
    qrImg.crossOrigin = 'anonymous'
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=380x380&margin=10&data=${encodeURIComponent(currentTableUrl)}`
    
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 110, 190, 380, 380)

      // Borde suave alrededor del QR
      ctx.strokeStyle = '#E2E8F0'
      ctx.lineWidth = 4
      ctx.strokeRect(105, 185, 390, 390)

      // Instrucciones inferiores
      ctx.fillStyle = '#0F172A'
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
      ctx.fillText('¡ESCANEA PARA ORDENAR!', width / 2, 630)

      ctx.fillStyle = '#64748B'
      ctx.font = '16px system-ui, -apple-system, sans-serif'
      ctx.fillText('Abre la cámara de tu celular, elige tus platos', width / 2, 665)
      ctx.fillText('y tu orden llegará directo a la cocina.', width / 2, 690)

      // Pie de página
      ctx.fillStyle = '#94A3B8'
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif'
      ctx.fillText('DIGITALIZADO POR OMNITAG.SITE', width / 2, 760)
    }
    qrImg.src = qrApiUrl
  }, [isOpen, selectedTable, tablePrefix, currentTableLabel, currentTableUrl, menuName])

  const handleDownloadSingle = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `QR_${menuSlug}_${tablePrefix.toLowerCase()}_${selectedTable}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Panel Izquierdo: Configuración de Mesas */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Generador de QRs por Mesa</h3>
                <p className="text-xs text-gray-500">Imprime un código QR único para cada mesa de tu restaurante.</p>
              </div>
            </div>
          </div>

          {/* Opciones de Configuración */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Prefijo / Zona
                </label>
                <input
                  type="text"
                  value={tablePrefix}
                  onChange={(e) => setTablePrefix(e.target.value)}
                  placeholder="Ej. Mesa, Terraza, Barra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Cantidad de Mesas ({isPro ? 'Hasta 50' : 'Hasta 3 en Gratis'})
                </label>
                <input
                  type="number"
                  min={1}
                  max={maxAllowedTables}
                  value={tableCount}
                  onChange={(e) => setTableCount(Math.max(1, Math.min(maxAllowedTables, parseInt(e.target.value) || 1)))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-black focus:outline-none"
                />
              </div>
            </div>

            {/* Selector de Mesas para Vista Previa */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Selecciona la mesa para vista previa:
              </label>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-2xl border border-gray-200">
                {tables.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSelectedTable(num)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      selectedTable === num
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    #{num}
                  </button>
                ))}
              </div>
            </div>

            {/* Aviso PRO */}
            {!isPro && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center justify-between">
                <span>⭐ Con <b>Plan PRO</b> puedes generar códigos para hasta 50 mesas y barras.</span>
              </div>
            )}

            {/* Botón de Descarga */}
            <div className="pt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleDownloadSingle}
                className="w-full bg-black text-white font-extrabold text-xs py-3.5 px-4 rounded-xl hover:bg-gray-800 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Cartel para {currentTableLabel} (PNG)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Vista Previa del Cartel Imprimible */}
        <div className="bg-gray-100 p-6 md:p-8 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-200 shrink-0">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Vista Previa de Impresión
            </span>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-black rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="shadow-2xl rounded-2xl overflow-hidden border border-gray-300 bg-white max-w-[280px]">
            <canvas ref={canvasRef} className="w-full h-auto block" />
          </div>

          <p className="text-[11px] text-gray-400 text-center mt-3 max-w-xs">
            Diseñado en proporción estándar para portamenús acrílicos o stickers de mesa.
          </p>
        </div>
      </div>
    </div>
  )
}
