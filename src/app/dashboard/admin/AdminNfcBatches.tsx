'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  CreditCard, 
  Plus, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Radio, 
  Sparkles, 
  Palette, 
  FileSpreadsheet, 
  ExternalLink, 
  UserCheck, 
  Clock, 
  AlertCircle,
  Eye,
  CheckCircle2,
  X,
  Smartphone
} from 'lucide-react'
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling'
import { createNfcBatch, deleteNfcBatch, toggleNfcCardStatus, assignNfcCardToUser } from './nfcActions'
import NfcCardWriterModal from '@/components/NfcCardWriterModal'

interface NfcCard {
  id: string
  card_token: string
  status: 'unclaimed' | 'active' | 'disabled'
  claimed_by_user_id?: string | null
  claimed_at?: string | null
  plan_duration_days: number
  created_at: string
  users?: {
    full_name?: string
    email?: string
  } | null
}

interface NfcBatch {
  id: string
  batch_name: string
  total_cards: number
  qr_style: any
  created_at: string
  nfc_cards: NfcCard[]
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
  { name: 'Negro Clásico', dots: '#000000', corners: '#000000' },
  { name: 'Azul Ejecutivo', dots: '#1e3a8a', corners: '#1d4ed8' },
  { name: 'Púrpura VIP', dots: '#581c87', corners: '#7e22ce' },
  { name: 'Oro & Lujo', dots: '#b45309', corners: '#d97706' },
  { name: 'Esmeralda', dots: '#065f46', corners: '#059669' },
]

export default function AdminNfcBatches({ 
  batches: initialBatches,
  users = []
}: { 
  batches: NfcBatch[]
  users?: any[]
}) {
  const [batches, setBatches] = useState<NfcBatch[]>(initialBatches || [])
  const [selectedBatchId, setSelectedBatchId] = useState<string>(initialBatches?.[0]?.id || '')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  // Estados para asignación manual a usuario
  const [assigningCard, setAssigningCard] = useState<NfcCard | null>(null)
  const [selectedUserIdToAssign, setSelectedUserIdToAssign] = useState<string>('')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [loadingAssign, setLoadingAssign] = useState(false)

  // Estados para modal de escritura NFC
  const [nfcWriterOpen, setNfcWriterOpen] = useState(false)
  const [nfcWriterUrl, setNfcWriterUrl] = useState('')
  const [nfcWriterTitle, setNfcWriterTitle] = useState('')

  // Estados del creador de lote
  const [batchName, setBatchName] = useState('Lote 10 Tarjetas NFC')
  const [cardCount, setCardCount] = useState<number>(10)
  const [tokenPrefix, setTokenPrefix] = useState('NFC')
  const [dotsColor, setDotsColor] = useState('#000000')
  const [cornersColor, setCornersColor] = useState('#000000')
  const [dotsStyle, setDotsStyle] = useState<DotType>('rounded')
  const [cornersStyle, setCornersStyle] = useState<CornerSquareType>('extra-rounded')
  const [previewQrContainer, setPreviewQrContainer] = useState<HTMLDivElement | null>(null)

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

  const selectedBatch = batches.find(b => b.id === selectedBatchId) || batches[0]

  // Actualizar previsualización de QR en el modal de creación
  useEffect(() => {
    if (!isCreateModalOpen || !previewDivRef.current) return

    if (!qrCodeModalRef.current) {
      qrCodeModalRef.current = new QRCodeStyling({
        width: 180,
        height: 180,
        data: `${baseUrl}/t/NFC-PREVIEW`,
        dotsOptions: { color: dotsColor, type: dotsStyle },
        cornersSquareOptions: { color: cornersColor, type: cornersStyle },
        cornersDotOptions: { color: cornersColor },
        backgroundOptions: { color: '#ffffff' }
      })
      previewDivRef.current.innerHTML = ''
      qrCodeModalRef.current.append(previewDivRef.current)
    } else {
      qrCodeModalRef.current.update({
        dotsOptions: { color: dotsColor, type: dotsStyle },
        cornersSquareOptions: { color: cornersColor, type: cornersStyle },
        cornersDotOptions: { color: cornersColor }
      })
    }
  }, [isCreateModalOpen, dotsColor, cornersColor, dotsStyle, cornersStyle, baseUrl])

  // Métricas globales de tarjetas
  const totalCardsCreated = batches.reduce((acc, b) => acc + (b.nfc_cards?.length || 0), 0)
  const totalCardsClaimed = batches.reduce(
    (acc, b) => acc + (b.nfc_cards?.filter(c => c.status === 'active')?.length || 0), 
    0
  )
  const totalCardsAvailable = batches.reduce(
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
      alert('Error al crear lote: ' + err.message)
    } finally {
      setLoadingCreate(false)
    }
  }

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('¿Estás seguro de eliminar este lote y sus tarjetas disponibles? Esta acción no se puede deshacer.')) return
    try {
      await deleteNfcBatch(batchId)
      setBatches(batches.filter(b => b.id !== batchId))
      if (selectedBatchId === batchId) {
        setSelectedBatchId(batches.find(b => b.id !== batchId)?.id || '')
      }
    } catch (err: any) {
      alert('Error al eliminar lote: ' + err.message)
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
      .map(c => `${baseUrl}/t/${c.card_token}`)
      .join('\n')
    navigator.clipboard.writeText(links)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2500)
  }

  const exportToCsv = () => {
    if (!selectedBatch) return
    const headers = ['Token', 'URL_NFC', 'Estado', 'Duracion_Dias', 'Reclamado_Por', 'Fecha_Creacion']
    const rows = selectedBatch.nfc_cards.map(c => [
      c.card_token,
      `${baseUrl}/t/${c.card_token}`,
      c.status,
      c.plan_duration_days,
      c.users?.email || 'N/A',
      c.created_at
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${selectedBatch.batch_name.replace(/\s+/g, '_')}_tarjetas.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadSingleQr = (card: NfcCard) => {
    const style = selectedBatch.qr_style || {}
    const qr = new QRCodeStyling({
      width: 1000,
      height: 1000,
      data: `${baseUrl}/t/${card.card_token}`,
      dotsOptions: { 
        color: style.dotsColor || '#000000', 
        type: style.dotsStyle || 'rounded' 
      },
      cornersSquareOptions: { 
        color: style.cornersColor || '#000000', 
        type: style.cornersStyle || 'extra-rounded' 
      },
      cornersDotOptions: { 
        color: style.cornersColor || '#000000' 
      },
      backgroundOptions: { color: '#ffffff' }
    })

    qr.download({
      name: `QR_${card.card_token}`,
      extension: 'png'
    })
  }

  return (
    <div className="space-y-6">
      {/* 1. Encabezado y Métricas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5 text-amber-700" /> Producción Física NFC
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            Gestor de Lotes de Tarjetas NFC
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Genera lotes de tarjetas con enlaces únicos, QR personalizables y 1 año de membresía para venta física.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-black hover:bg-gray-800 text-white text-xs font-extrabold px-4 py-3 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Generar Nuevo Lote</span>
        </button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Fabricadas</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{totalCardsCreated}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">En {batches.length} lotes creados</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Activas / Vendidas</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{totalCardsClaimed}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Reclamadas por profesionales</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Disponibles en Stock</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{totalCardsAvailable}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Listas para grabar y vender</div>
        </div>
      </div>

      {/* 2. Selector de Lote & Mesa de Trabajo */}
      {batches.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
            <CreditCard className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-gray-900 text-base">No hay lotes creados aún</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Genera tu primer lote de tarjetas NFC para obtener los enlaces cortos y los códigos QR listos para llevar a imprenta y grabado.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-2 bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-gray-800 transition cursor-pointer"
          >
            Crear Lote de 10 o 50 Tarjetas
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
                      ? 'bg-black text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{batch.batch_name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {claimed}/{batch.nfc_cards?.length || 0}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Mesa de Trabajo del Lote Seleccionado */}
          {selectedBatch && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <span>{selectedBatch.batch_name}</span>
                    <span className="text-xs font-normal text-gray-500">
                      ({selectedBatch.nfc_cards?.length || 0} tarjetas generadas)
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Estilo de QR: Puntos <span className="font-semibold">{selectedBatch.qr_style?.dotsStyle || 'redondeados'}</span> | Color <span className="font-mono font-bold" style={{ color: selectedBatch.qr_style?.dotsColor || '#000' }}>{selectedBatch.qr_style?.dotsColor || '#000000'}</span>
                  </p>
                </div>

                {/* Botones de acción masiva */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={copyAllLinks}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    title="Copia todas las URLs de este lote al portapapeles"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAll ? '¡Enlaces Copiados!' : 'Copiar Todos los Enlaces'}</span>
                  </button>

                  <button
                    onClick={exportToCsv}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    title="Descargar archivo Excel / CSV para control de producción"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Exportar CSV</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBatch(selectedBatch.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition cursor-pointer"
                    title="Eliminar lote"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabla de Tarjetas del Lote */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Token & Enlace</th>
                      <th className="py-3 px-3">Estado</th>
                      <th className="py-3 px-3">Beneficio</th>
                      <th className="py-3 px-3">Dueño / Activado</th>
                      <th className="py-3 px-3 text-right">Acciones Físicas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {selectedBatch.nfc_cards?.map((card) => {
                      const fullUrl = `${baseUrl}/t/${card.card_token}`
                      const isClaimed = card.status === 'active'

                      return (
                        <tr key={card.id} className="hover:bg-gray-50/80 transition">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">
                                {card.card_token}
                              </span>
                              <button
                                onClick={() => copyToClipboard(fullUrl, card.card_token)}
                                className="text-gray-400 hover:text-black transition cursor-pointer"
                                title="Copiar URL para grabar en chip NFC"
                              >
                                {copiedToken === card.card_token ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-400 hover:text-blue-600 transition"
                                title="Abrir enlace de prueba"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5 font-mono truncate max-w-xs">
                              {fullUrl}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            {card.status === 'unclaimed' && (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <Clock className="w-3 h-3" /> Disponible
                              </span>
                            )}
                            {card.status === 'active' && (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Reclamada
                              </span>
                            )}
                            {card.status === 'disabled' && (
                              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                Inactiva
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <span className="text-gray-700 font-bold">
                              {card.plan_duration_days} Días PRO
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            {isClaimed && card.users ? (
                              <div>
                                <div className="font-bold text-gray-900">{card.users.full_name || 'Sin nombre'}</div>
                                <div className="text-[10px] text-gray-500">{card.users.email}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Esperando cliente...</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Botón Asignar a Usuario Registrado */}
                              {card.status === 'unclaimed' && (
                                <button
                                  onClick={() => {
                                    setAssigningCard(card)
                                    setSelectedUserIdToAssign('')
                                    setUserSearchQuery('')
                                  }}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Asignar manualmente a un cliente ya registrado"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>Asignar</span>
                                </button>
                              )}

                              {/* Botón para grabar con chip NFC del móvil */}
                              <button
                                onClick={() => {
                                  setNfcWriterUrl(fullUrl)
                                  setNfcWriterTitle(`Tarjeta ${card.card_token}`)
                                  setNfcWriterOpen(true)
                                }}
                                className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Grabar en chip NFC con este celular"
                              >
                                <Radio className="w-3 h-3" />
                                <span>Grabar NFC</span>
                              </button>

                              {/* Botón Descargar QR HD */}
                              <button
                                onClick={() => downloadSingleQr(card)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Descargar código QR para imprenta"
                              >
                                <Download className="w-3 h-3" />
                                <span>QR HD</span>
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

      {/* 3. Modal de Creación de Lote */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  Generar Nuevo Lote de Tarjetas NFC
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Se crearán enlaces únicos listos para llevar a producción física.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-black p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nombre del Lote
                </label>
                <input
                  type="text"
                  required
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="Ej. Lote 200 - Profesionales Septiembre"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Cantidad de Tarjetas
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    required
                    value={cardCount}
                    onChange={(e) => setCardCount(parseInt(e.target.value) || 10)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:border-black focus:outline-none"
                  />
                  {/* Atajos rápidos de cantidad */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {[10, 25, 50, 100, 200].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setCardCount(cnt)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                          cardCount === cnt ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Prefijo de Código
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={tokenPrefix}
                    onChange={(e) => setTokenPrefix(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono font-bold focus:border-black focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400">Ej. {tokenPrefix}-8A3X9K</span>
                </div>
              </div>

              {/* Personalizador de Estilo QR para este lote */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  <Palette className="w-4 h-4 text-purple-600" />
                  <span>Estilo de Código QR para este Lote</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  {/* Previsualización en vivo */}
                  <div className="shrink-0 text-center">
                    <div 
                      ref={previewDivRef} 
                      className="bg-white p-2 rounded-xl shadow-xs border border-gray-200 inline-block"
                    />
                    <div className="text-[10px] text-gray-400 font-bold mt-1">Muestra de QR</div>
                  </div>

                  {/* Controles de estilo */}
                  <div className="flex-1 space-y-3 w-full">
                    {/* Presets de Color */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">
                        Paleta de Color
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {colorPresets.map(preset => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setDotsColor(preset.dots)
                              setCornersColor(preset.corners)
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                              dotsColor === preset.dots ? 'bg-white border-black shadow-xs ring-1 ring-black' : 'bg-white border-gray-200 text-gray-700'
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: preset.dots }} />
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selector de Forma de Puntos */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                        Forma de los Puntos
                      </label>
                      <select
                        value={dotsStyle}
                        onChange={(e) => setDotsStyle(e.target.value as DotType)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium bg-white focus:outline-none"
                      >
                        {dotTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Selector de Esquinas */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                        Forma de las Esquinas
                      </label>
                      <select
                        value={cornersStyle}
                        onChange={(e) => setCornersStyle(e.target.value as CornerSquareType)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium bg-white focus:outline-none"
                      >
                        {cornerSquareTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingCreate}
                  className="bg-black hover:bg-gray-800 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {loadingCreate ? 'Generando lote...' : `Crear Lote de ${cardCount} Tarjetas`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal de Asignación Manual a Usuario Existente */}
      {assigningCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span>Asignar Tarjeta a Usuario</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Tarjeta <span className="font-mono font-bold text-black">{assigningCard.card_token}</span> (1 Año PRO)
                </p>
              </div>
              <button
                onClick={() => setAssigningCard(null)}
                className="text-gray-400 hover:text-black p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                Buscar Usuario Registrado
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-black focus:outline-none"
              />

              <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-xl">
                {users
                  .filter((u: any) => {
                    const q = userSearchQuery.toLowerCase()
                    return (
                      (u.email && u.email.toLowerCase().includes(q)) ||
                      (u.full_name && u.full_name.toLowerCase().includes(q))
                    )
                  })
                  .slice(0, 10)
                  .map((u: any) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUserIdToAssign(u.id)}
                      className={`w-full text-left p-2.5 transition flex items-center justify-between cursor-pointer ${
                        selectedUserIdToAssign === u.id
                          ? 'bg-emerald-50 border-l-4 border-emerald-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-gray-900">{u.full_name || 'Sin nombre'}</div>
                        <div className="text-[11px] text-gray-500">{u.email}</div>
                      </div>
                      {selectedUserIdToAssign === u.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setAssigningCard(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selectedUserIdToAssign || loadingAssign}
                onClick={async () => {
                  if (!assigningCard || !selectedUserIdToAssign) return
                  setLoadingAssign(true)
                  try {
                    await assignNfcCardToUser(assigningCard.id, selectedUserIdToAssign)
                    setAssigningCard(null)
                    window.location.reload()
                  } catch (err: any) {
                    alert('Error asignando tarjeta: ' + err.message)
                  } finally {
                    setLoadingAssign(false)
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {loadingAssign ? 'Asignando...' : 'Asignar & Activar 1 Año'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Grabación NFC en Tiempo Real */}
      <NfcCardWriterModal
        isOpen={nfcWriterOpen}
        onClose={() => setNfcWriterOpen(false)}
        initialUrl={nfcWriterUrl}
        initialTitle={nfcWriterTitle}
      />
    </div>
  )
}
