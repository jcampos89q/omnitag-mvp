'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Star, 
  Plus, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  Palette, 
  FileSpreadsheet, 
  ExternalLink, 
  AlertCircle,
  Eye,
  CheckCircle2,
  X,
  Smartphone,
  Printer,
  FileDown,
  Loader2,
  Building2,
  MapPin,
  Phone,
  ShieldCheck
} from 'lucide-react'
import QRCodeStyling, { DotType, CornerSquareType } from 'qr-code-styling'
import { createNfcBatch, deleteNfcBatch, toggleNfcCardStatus } from './nfcActions'
import NfcCardWriterModal from '@/components/NfcCardWriterModal'
import { generateReviewPlatesSheetPdf } from '@/lib/nfcPdfGenerator'

interface NfcCard {
  id: string
  card_token: string
  status: 'unclaimed' | 'active' | 'disabled'
  claimed_by_user_id?: string | null
  claimed_at?: string | null
  plan_duration_days: number
  created_at: string
}

interface NfcBatch {
  id: string
  batch_name: string
  total_cards: number
  qr_style: any
  batch_type?: string
  created_at: string
  nfc_cards: NfcCard[]
}

interface ConnectedDevice {
  id: string
  tag_id: string
  device_type: string
  business_name?: string | null
  business_address?: string | null
  business_phone?: string | null
  place_id?: string | null
  redirect_url?: string | null
  review_filter_enabled?: boolean
  is_active?: boolean
  user_id?: string | null
  user_email?: string | null
  user_full_name?: string | null
  user_personal_phone?: string | null
}

const dotTypes: { id: DotType; name: string }[] = [
  { id: 'rounded', name: 'Redondeados' },
  { id: 'dots', name: 'Puntos Circulares' },
  { id: 'classy', name: 'Elegante (Classy)' },
  { id: 'classy-rounded', name: 'Elegante Curvo' },
  { id: 'square', name: 'Cuadrados Clásicos' },
  { id: 'extra-rounded', name: 'Extra Suave' }
]

const cornerSquareTypes: { id: CornerSquareType; name: string }[] = [
  { id: 'extra-rounded', name: 'Esquinas Suaves' },
  { id: 'dot', name: 'Esquinas Circulares' },
  { id: 'square', name: 'Esquinas Clásicas' }
]

const colorPresets = [
  { name: 'Azul Google Reviews', dots: '#1a73e8', corners: '#1557b0' },
  { name: 'Dorado & 5 Estrellas', dots: '#d97706', corners: '#b45309' },
  { name: 'Negro Mate Obsidiana', dots: '#111827', corners: '#000000' },
  { name: 'Esmeralda Confianza', dots: '#059669', corners: '#047857' },
  { name: 'Rojo Google', dots: '#ea4335', corners: '#c5221f' },
]

export default function AdminReviewPlateBatches({ 
  batches: initialBatches = [],
  devices = [],
  users = []
}: { 
  batches: NfcBatch[]
  devices?: ConnectedDevice[]
  users?: any[]
}) {
  const [batches, setBatches] = useState<NfcBatch[]>(initialBatches || [])
  const [selectedBatchId, setSelectedBatchId] = useState<string>(initialBatches?.[0]?.id || '')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [pdfProgress, setPdfProgress] = useState({ current: 0, total: 0 })

  // Estados para modal de escritura NFC
  const [nfcWriterOpen, setNfcWriterOpen] = useState(false)
  const [nfcWriterUrl, setNfcWriterUrl] = useState('')
  const [nfcWriterTitle, setNfcWriterTitle] = useState('')

  // Estados del creador de lote
  const [batchName, setBatchName] = useState('Lote 10 Placas Reseñas Google')
  const [cardCount, setCardCount] = useState<number>(10)
  const [tokenPrefix, setTokenPrefix] = useState('REV')
  const [dotsColor, setDotsColor] = useState('#1a73e8')
  const [cornersColor, setCornersColor] = useState('#1557b0')
  const [dotsStyle, setDotsStyle] = useState<DotType>('rounded')
  const [cornersStyle, setCornersStyle] = useState<CornerSquareType>('extra-rounded')

  // Referencia QR para previsualización modal
  const qrCodeModalRef = useRef<QRCodeStyling | null>(null)
  const previewDivRef = useRef<HTMLDivElement | null>(null)

  // Base URL
  const [baseUrl, setBaseUrl] = useState('https://omnitag.site')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin)
    }
  }, [])

  // Sincronizar lotes iniciales
  useEffect(() => {
    setBatches(initialBatches)
    if (initialBatches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(initialBatches[0].id)
    }
  }, [initialBatches, selectedBatchId])

  const selectedBatch = batches.find(b => b.id === selectedBatchId) || batches[0]

  // Mapa de dispositivos por tag_id para rápida consulta de negocios activados
  const deviceMap = new Map<string, ConnectedDevice>()
  devices.forEach(d => {
    if (d.tag_id) {
      deviceMap.set(d.tag_id.toUpperCase(), d)
      try {
        deviceMap.set(decodeURIComponent(d.tag_id).toUpperCase(), d)
      } catch {}
    }
  })

  // Actualizar previsualización de QR en el modal de creación
  useEffect(() => {
    if (!isCreateModalOpen || !previewDivRef.current) return

    if (!qrCodeModalRef.current) {
      qrCodeModalRef.current = new QRCodeStyling({
        width: 180,
        height: 180,
        data: `${baseUrl}/r/REV-PREVIEW`,
        dotsOptions: { color: dotsColor, type: dotsStyle },
        cornersSquareOptions: { color: cornersColor, type: cornersStyle },
        cornersDotOptions: { color: cornersColor },
        backgroundOptions: { color: '#ffffff' }
      })
      previewDivRef.current.innerHTML = ''
      qrCodeModalRef.current.append(previewDivRef.current)
    } else {
      qrCodeModalRef.current.update({
        data: `${baseUrl}/r/REV-PREVIEW`,
        dotsOptions: { color: dotsColor, type: dotsStyle },
        cornersSquareOptions: { color: cornersColor, type: cornersStyle },
        cornersDotOptions: { color: cornersColor }
      })
    }
  }, [isCreateModalOpen, dotsColor, cornersColor, dotsStyle, cornersStyle, baseUrl])

  // Métricas globales de placas
  const totalPlatesCreated = batches.reduce((acc, b) => acc + (b.nfc_cards?.length || 0), 0)
  const totalPlatesClaimed = batches.reduce(
    (acc, b) => acc + (b.nfc_cards?.filter(c => c.status === 'active')?.length || 0), 
    0
  )
  const totalPlatesAvailable = batches.reduce(
    (acc, b) => acc + (b.nfc_cards?.filter(c => c.status === 'unclaimed')?.length || 0), 
    0
  )

  const handleCreateBatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoadingCreate(true)

    const formData = new FormData()
    formData.append('batch_name', batchName)
    formData.append('card_count', cardCount.toString())
    formData.append('token_prefix', tokenPrefix)
    formData.append('batch_type', 'review_plate')
    formData.append('plan_days', '365')
    formData.append('qr_style', JSON.stringify({
      dotsColor,
      cornersColor,
      dotsStyle,
      cornersStyle,
    }))

    try {
      await createNfcBatch(formData)
      setIsCreateModalOpen(false)
      window.location.reload()
    } catch (err: any) {
      alert('Error al crear lote de placas: ' + err.message)
    } finally {
      setLoadingCreate(false)
    }
  }

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('¿Estás seguro de eliminar este lote de placas? Las placas que no hayan sido vinculadas se borrarán.')) return
    try {
      await deleteNfcBatch(batchId)
      const updated = batches.filter(b => b.id !== batchId)
      setBatches(updated)
      if (selectedBatchId === batchId) {
        setSelectedBatchId(updated[0]?.id || '')
      }
    } catch (err: any) {
      alert('Error al eliminar lote: ' + err.message)
    }
  }

  const handleToggleStatus = async (cardId: string, currentStatus: string) => {
    try {
      const res = await toggleNfcCardStatus(cardId, currentStatus)
      if (res.success && selectedBatch) {
        const updatedCards = selectedBatch.nfc_cards.map(c => 
          c.id === cardId ? { ...c, status: res.newStatus as any } : c
        )
        const updatedBatches = batches.map(b => 
          b.id === selectedBatch.id ? { ...b, nfc_cards: updatedCards } : b
        )
        setBatches(updatedBatches)
      }
    } catch (err: any) {
      alert('Error al cambiar estado: ' + err.message)
    }
  }

  const copyToClipboard = (text: string, token: string) => {
    navigator.clipboard.writeText(text)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const copyAllLinks = () => {
    if (!selectedBatch) return
    const links = selectedBatch.nfc_cards
      .map(c => `${baseUrl}/r/${c.card_token}`)
      .join('\n')
    navigator.clipboard.writeText(links)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2500)
  }

  const exportToExcel = () => {
    if (!selectedBatch) return

    const formatStatus = (s: string) => {
      if (s === 'active') return 'VINCULADA'
      if (s === 'unclaimed') return 'DISPONIBLE'
      return 'DESHABILITADA'
    }

    const rowsHtml = selectedBatch.nfc_cards.map((c, i) => {
      const isClaimed = c.status === 'active'
      const statusColor = isClaimed ? '#059669' : '#d97706'
      const statusBg = isClaimed ? '#d1fae5' : '#fef3c7'
      const dateFormatted = new Date(c.created_at).toLocaleDateString('es-HN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })

      const dev = deviceMap.get(c.card_token.toUpperCase())
      const businessName = dev?.business_name || (isClaimed ? 'Negocio Vinculado' : 'Sin activar')
      const businessPhone = dev?.business_phone || dev?.user_personal_phone || '-'
      const clientEmail = dev?.user_email || '-'
      const clientName = dev?.user_full_name || '-'

      return `
        <tr>
          <td style="text-align:center;mso-number-format:'\\@';">${i + 1}</td>
          <td style="font-weight:bold;font-family:monospace;background:#f8fafc;text-align:center;mso-number-format:'\\@';">${c.card_token}</td>
          <td style="color:#2563eb;text-decoration:underline;">${baseUrl}/r/${c.card_token}</td>
          <td style="text-align:center;font-weight:bold;color:${statusColor};background:${statusBg};">${formatStatus(c.status)}</td>
          <td style="font-weight:bold;">${businessName}</td>
          <td>${businessPhone}</td>
          <td>${clientName} (${clientEmail})</td>
          <td style="text-align:center;">${c.plan_duration_days} Días (1 Año)</td>
          <td style="text-align:center;">${dateFormatted}</td>
        </tr>
      `
    }).join('')

    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
          <style>
            th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #cbd5e1; padding: 8px; }
            td { border: 1px solid #cbd5e1; padding: 6px; font-family: Arial, sans-serif; font-size: 11px; }
          </style>
        </head>
        <body>
          <h2>OMNITAG - REPORTE DE PLACAS DE RESEÑAS GOOGLE</h2>
          <p>Lote: <b>${selectedBatch.batch_name}</b> | Generado el ${new Date().toLocaleDateString('es-HN')}</p>
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Código Placa</th>
                <th>Enlace Directo Reseña</th>
                <th>Estado</th>
                <th>Negocio Vinculado</th>
                <th>WhatsApp Negocio / Cliente</th>
                <th>Titular</th>
                <th>Vigencia PRO</th>
                <th>Fecha Fabricación</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Placas_Resenas_${selectedBatch.batch_name.replace(/\s+/g, '_')}.xls`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadSheetPdf = async () => {
    if (!selectedBatch) return
    try {
      setIsPdfGenerating(true)
      setPdfProgress({ current: 0, total: selectedBatch.nfc_cards.length })
      await generateReviewPlatesSheetPdf(selectedBatch, baseUrl, (current, total) => {
        setPdfProgress({ current, total })
      })
    } catch (err: any) {
      alert('Error al generar PDF: ' + err.message)
    } finally {
      setIsPdfGenerating(false)
    }
  }

  const downloadSingleQr = (card: NfcCard) => {
    if (!selectedBatch) return
    const style = selectedBatch.qr_style || {}
    const qr = new QRCodeStyling({
      width: 1000,
      height: 1000,
      data: `${baseUrl}/r/${card.card_token}`,
      dotsOptions: { 
        color: style.dotsColor || '#1a73e8', 
        type: style.dotsStyle || 'rounded' 
      },
      cornersSquareOptions: { 
        color: style.cornersColor || '#1557b0', 
        type: style.cornersStyle || 'extra-rounded' 
      },
      cornersDotOptions: { 
        color: style.cornersColor || '#1557b0' 
      },
      backgroundOptions: { color: '#ffffff' }
    })

    qr.download({
      name: `QR_PLACA_${card.card_token}`,
      extension: 'png'
    })
  }

  return (
    <div className="space-y-6">
      {/* 1. Encabezado y Métricas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-blue-800/40 shadow-sm text-white">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-blue-400/30">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Placas NFC & QR para Mostrador
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
            Gestor de Lotes: Placas de Reseñas Google
          </h2>
          <p className="text-xs text-blue-200/80 mt-1 max-w-xl">
            Fabrica lotes de placas acrílicas con QR de alta resolución y chips NFC programables. Cada placa incluye 1 año de suscripción PRO para el negocio.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-4 py-3 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Generar Nuevo Lote de Placas</span>
        </button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Fabricadas</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{totalPlatesCreated}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">En {batches.length} lotes de placas</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Vinculadas con Negocios</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{totalPlatesClaimed}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Activadas y recolectando opiniones</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Disponibles en Stock</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{totalPlatesAvailable}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Listas para instalar o vender</div>
        </div>
      </div>

      {/* 2. Selector de Lote & Mesa de Trabajo */}
      {batches.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <Star className="w-7 h-7 fill-amber-400" />
          </div>
          <h3 className="font-extrabold text-gray-900 text-base">No hay lotes de placas de reseñas creados</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Genera tu primer lote de placas para obtener los enlaces de activación (`/r/REV-...`), códigos QR para imprenta y plantillas acrílicas para mostrador.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            Crear Lote de 10 o 25 Placas
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Barra de pestañas de lotes */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {batches.map(batch => {
              const isSelected = batch.id === selectedBatch?.id
              const claimed = batch.nfc_cards?.filter(c => c.status === 'active')?.length || 0
              return (
                <button
                  key={batch.id}
                  onClick={() => setSelectedBatchId(batch.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
                  <span>{batch.batch_name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {claimed}/{batch.nfc_cards?.length || 0}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Barra de Herramientas del Lote Seleccionado */}
          {selectedBatch && (
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm">{selectedBatch.batch_name}</h3>
                  <p className="text-xs text-gray-500">
                    Creado el {new Date(selectedBatch.created_at).toLocaleDateString('es-HN')} • {selectedBatch.nfc_cards?.length || 0} Placas con enlace directo <span className="font-mono text-blue-600 font-bold">/r/...</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={copyAllLinks}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? '¡Enlaces Copiados!' : 'Copiar Enlaces'}</span>
                </button>

                <button
                  onClick={exportToExcel}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Exportar Excel</span>
                </button>

                <button
                  onClick={handleDownloadSheetPdf}
                  disabled={isPdfGenerating}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-blue-200 cursor-pointer disabled:opacity-50"
                >
                  {isPdfGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Generando Stand ({pdfProgress.current}/{pdfProgress.total})...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-3.5 h-3.5 text-blue-600" />
                      <span>Descargar Plantilla Stand (PDF)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDeleteBatch(selectedBatch.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  title="Eliminar lote"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tabla de Placas del Lote */}
          {selectedBatch && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">#</th>
                      <th className="py-3.5 px-4">Código / Token</th>
                      <th className="py-3.5 px-4">Enlace de Reseña</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-4">Negocio Vinculado</th>
                      <th className="py-3.5 px-4">WhatsApp / Contacto</th>
                      <th className="py-3.5 px-4 text-center">Acciones de Producción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedBatch.nfc_cards?.map((card, idx) => {
                      const isClaimed = card.status === 'active'
                      const isAvailable = card.status === 'unclaimed'
                      const plateUrl = `${baseUrl}/r/${card.card_token}`
                      const dev = deviceMap.get(card.card_token.toUpperCase())

                      return (
                        <tr key={card.id} className="hover:bg-gray-50/80 transition">
                          <td className="py-3 px-4 text-gray-400 font-mono">{idx + 1}</td>
                          
                          {/* Código Token */}
                          <td className="py-3 px-4 font-mono font-bold text-gray-900">
                            <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-lg border border-slate-200">
                              {card.card_token}
                            </span>
                          </td>

                          {/* Enlace Directo */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-blue-600 font-semibold truncate max-w-[180px]">
                                /r/{card.card_token}
                              </span>
                              <button
                                onClick={() => copyToClipboard(plateUrl, card.card_token)}
                                className="p-1 hover:bg-gray-200 rounded-md transition text-gray-400 hover:text-gray-700 cursor-pointer"
                                title="Copiar URL completa"
                              >
                                {copiedToken === card.card_token ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Estado */}
                          <td className="py-3 px-4">
                            {isClaimed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VINCULADA
                              </span>
                            ) : isAvailable ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                                <AlertCircle className="w-3 h-3 text-amber-600" /> DISPONIBLE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-600">
                                DESHABILITADA
                              </span>
                            )}
                          </td>

                          {/* Negocio Vinculado */}
                          <td className="py-3 px-4">
                            {dev?.business_name ? (
                              <div className="flex items-start gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-bold text-gray-900 leading-tight">{dev.business_name}</div>
                                  {dev.business_address && (
                                    <div className="text-[10px] text-gray-500 truncate max-w-[160px] flex items-center gap-0.5 mt-0.5">
                                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                                      {dev.business_address}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : isClaimed ? (
                              <span className="text-gray-500 italic">Negocio activado</span>
                            ) : (
                              <span className="text-gray-400 italic">Sin vincular (Pendiente)</span>
                            )}
                          </td>

                          {/* WhatsApp / Contacto del Dueño */}
                          <td className="py-3 px-4">
                            {dev?.business_phone || dev?.user_personal_phone ? (
                              <div className="flex items-center gap-1 font-semibold text-emerald-700">
                                <Phone className="w-3 h-3" />
                                <span>{dev.business_phone || dev.user_personal_phone}</span>
                              </div>
                            ) : dev?.user_email ? (
                              <span className="text-gray-600 text-[11px] truncate max-w-[140px] block">
                                {dev.user_email}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Acciones de Producción */}
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Grabar Chip NFC */}
                              <button
                                onClick={() => {
                                  setNfcWriterUrl(plateUrl)
                                  setNfcWriterTitle(`Placa Reseñas ${card.card_token}`)
                                  setNfcWriterOpen(true)
                                }}
                                className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg border border-purple-200 transition flex items-center gap-1 cursor-pointer"
                                title="Grabar Chip NFC con Teléfono Móvil"
                              >
                                <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                                <span>Grabar NFC</span>
                              </button>

                              {/* Descargar QR HD */}
                              <button
                                onClick={() => downloadSingleQr(card)}
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition cursor-pointer"
                                title="Descargar Código QR HD (1000x1000 PNG)"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              {/* Probar Flujo */}
                              <a
                                href={plateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition cursor-pointer"
                                title="Probar Flujo de la Placa (Pestaña nueva)"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              {/* Alternar Estado */}
                              <button
                                onClick={() => handleToggleStatus(card.id, card.status)}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  card.status === 'disabled'
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                    : 'bg-gray-100 text-gray-400 hover:text-red-600 hover:bg-red-50'
                                }`}
                                title={card.status === 'disabled' ? 'Reactivar placa' : 'Deshabilitar placa'}
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Crear Nuevo Lote de Placas */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Generar Lote de Placas de Reseñas</h3>
                  <p className="text-xs text-gray-500">Crea códigos únicos y QR personalizados listos para placas acrílicas</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Nombre del Lote</label>
                  <input
                    type="text"
                    required
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="Ej. Lote 25 Stands de Mesa Google"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:border-black focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Cantidad de Placas</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={cardCount}
                    onChange={(e) => setCardCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:border-black focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Prefijo de Código</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={tokenPrefix}
                    onChange={(e) => setTokenPrefix(e.target.value.toUpperCase())}
                    placeholder="REV"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:border-black focus:outline-none font-mono uppercase"
                  />
                  <p className="text-[10px] text-gray-400">Generará códigos como: {tokenPrefix || 'REV'}-8A3X9K</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Vigencia para el Cliente</label>
                  <input
                    type="text"
                    disabled
                    value="365 Días (1 Año PRO)"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-100 text-gray-600 rounded-xl border border-gray-200 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Personalizador Visual de Códigos QR */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-extrabold text-slate-900">Estilo del Código QR para Placas</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Previsualización en tiempo real</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Contenedor del QR Preview */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center shrink-0">
                    <div ref={previewDivRef} className="w-[180px] h-[180px] flex items-center justify-center" />
                    <div className="mt-2 text-[10px] font-mono text-slate-500 text-center font-bold">
                      omnitag.site/r/{tokenPrefix}-PREVIEW
                    </div>
                  </div>

                  {/* Opciones de Estilo */}
                  <div className="space-y-3 w-full">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Paleta de Colores:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {colorPresets.map(preset => (
                          <button
                            type="button"
                            key={preset.name}
                            onClick={() => {
                              setDotsColor(preset.dots)
                              setCornersColor(preset.corners)
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                              dotsColor === preset.dots
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.dots }} />
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Patrón de Puntos:</label>
                        <select
                          value={dotsStyle}
                          onChange={(e) => setDotsStyle(e.target.value as DotType)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-200"
                        >
                          {dotTypes.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Esquinas:</label>
                        <select
                          value={cornersStyle}
                          onChange={(e) => setCornersStyle(e.target.value as CornerSquareType)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-200"
                        >
                          {cornerSquareTypes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón Submit */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingCreate}
                  className="px-6 py-2.5 text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loadingCreate ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Fabricando {cardCount} Placas...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Confirmar y Fabricar Lote</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Grabación de Chips NFC */}
      <NfcCardWriterModal
        isOpen={nfcWriterOpen}
        onClose={() => setNfcWriterOpen(false)}
        initialUrl={nfcWriterUrl}
        initialTitle={nfcWriterTitle}
      />
    </div>
  )
}
