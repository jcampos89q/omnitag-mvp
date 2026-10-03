'use client'

import { useState } from 'react'
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare, 
  Search, 
  FileSpreadsheet, 
  UserPlus, 
  Gift, 
  UserCircle, 
  Sparkles, 
  ArrowRight, 
  Scissors, 
  Coffee, 
  Star,
  CheckCircle2,
  TrendingUp,
  Loader2,
  Copy,
  Check,
  X,
  Wallet,
  Plus,
  Trash2
} from 'lucide-react'

import Link from 'next/link'
import ProFeatureModal from '@/components/ProFeatureModal'
import { updateLeadStatus, createManualLead, deleteLead, LeadStatus } from './actions'


export interface Lead {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  created_at: string
  vcard_id?: string | null
  source?: 'vcard' | 'loyalty' | 'appointment' | 'menu' | 'review'
  loyaltyStamps?: number
  serviceName?: string
  notes?: string | null
  status?: LeadStatus
  category?: string | null
  deal_value?: number
  hasWallet?: boolean
}

export const LEAD_STATUS_CONFIG: Record<LeadStatus, {
  label: string
  shortLabel: string
  badgeBg: string
  badgeText: string
  border: string
  dotColor: string
  emoji: string
}> = {
  lead: {
    label: 'Nuevo Prospecto',
    shortLabel: 'Prospecto',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    border: 'border-amber-200',
    dotColor: 'bg-amber-500',
    emoji: '🟡'
  },
  contacted: {
    label: 'Contactado',
    shortLabel: 'Contactado',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    border: 'border-blue-200',
    dotColor: 'bg-blue-500',
    emoji: '🔵'
  },
  negotiation: {
    label: 'En Negociación / Visita',
    shortLabel: 'Negociación',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    border: 'border-purple-200',
    dotColor: 'bg-purple-500',
    emoji: '🟣'
  },
  won: {
    label: 'Venta Completada',
    shortLabel: 'Completada',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    emoji: '🟢'
  },
  lost: {
    label: 'Descartado / Perdido',
    shortLabel: 'Descartado',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-700',
    border: 'border-gray-200',
    dotColor: 'bg-gray-400',
    emoji: '⚪'
  }
}

export function getStageWhatsAppMessage(lead: Lead): string {
  const currentStatus = lead.status || 'lead'
  switch (currentStatus) {
    case 'negotiation':
      return `¡Hola ${lead.name}! Te escribo para dar seguimiento a nuestra conversación sobre la propuesta / propiedad. ¿Pudiste revisarla o te gustaría coordinar una visita presencial?`
    case 'won':
      return `¡Hola ${lead.name}! Espero que te encuentres excelente. Quería agradecerte nuevamente tu confianza y compartirte en primicia una novedad exclusiva para nuestros clientes preferenciales.`
    case 'contacted':
      return `¡Hola ${lead.name}! Un gusto saludarte de nuevo. ¿Te gustaría que coordinemos una breve llamada para responder cualquier duda sobre la información que te compartí?`
    case 'lost':
      return `¡Hola ${lead.name}! Quería saludarte y consultarte si en este momento te interesaría conocer nuevas oportunidades con condiciones especiales.`
    case 'lead':
    default:
      if (lead.source === 'appointment') {
        return `¡Hola ${lead.name}! Te saludamos de tu cita en nuestro negocio. ¿Cómo podemos ayudarte hoy?`
      }
      if (lead.source === 'loyalty') {
        return `¡Hola ${lead.name}! Tienes ${lead.loyaltyStamps || 1} sellos acumulados en nuestro Club de Fidelización. ¡Te esperamos para tu próxima visita!`
      }
      return `¡Hola ${lead.name}! Gracias por conectar conmigo a través de mi tarjeta digital. ¿Cómo puedo ayudarte hoy con la información o propiedad que buscas?`
  }
}

export const SEGMENT_TEMPLATES: Record<LeadStatus, {
  title: string
  subtitle: string
  items: { tag: string; title: string; text: string }[]
}> = {
  lead: {
    title: '🟡 Nuevos Prospectos (Primer Contacto & Calificación)',
    subtitle: 'Objetivo: Romper el hielo, presentarse y detectar qué están buscando en 1 toque.',
    items: [
      {
        tag: 'Inmobiliaria',
        title: 'Presentación y Ficha de Propiedad',
        text: '¡Hola [Nombre]! Gracias por guardar mi tarjeta de contacto. Vi que tienes interés en opciones inmobiliarias. ¿Buscas comprar para habitar de inmediato o te interesa invertir para renta/plusvalía?'
      },
      {
        tag: 'Liquidación / Ofertas',
        title: 'Disponibilidad de Modelos en Liquidación',
        text: '¡Hola [Nombre]! Gracias por conectar. Te comparto que tenemos liquidación activa en equipos seleccionados. ¿Qué modelo o capacidad estabas cotizando para apartarte el precio?'
      },
      {
        tag: 'General / Asesoría',
        title: 'Bienvenida Profesional Directa',
        text: '¡Hola [Nombre]! Un gusto saludarte. Vi que revisaste mi tarjeta digital. ¿En qué proyecto o servicio te puedo asesorar hoy?'
      }
    ]
  },
  contacted: {
    title: '🔵 Contactados (Seguimiento & Profundización)',
    subtitle: 'Objetivo: Dar el siguiente paso después de la primera respuesta y coordinar llamada o visita.',
    items: [
      {
        tag: 'Inmobiliaria',
        title: 'Coordinación de Visita a la Propiedad',
        text: '¡Hola [Nombre]! Quería consultarte si pudiste ver las fotos y ubicación que te envié. Esta semana estaremos mostrando el inmueble, ¿qué día te queda más cómodo para ir?'
      },
      {
        tag: 'Ventas',
        title: 'Resolución de Dudas & Presupuesto',
        text: '¡Hola [Nombre]! Te preparé los números de la propuesta que conversamos. ¿Te parece bien si te los envío por aquí o prefieres una llamada rápida de 5 minutos?'
      }
    ]
  },
  negotiation: {
    title: '🟣 En Negociación (Impulso de Cierre & Urgencia)',
    subtitle: 'Objetivo: Resolver las últimas objeciones y cerrar la reserva o firma.',
    items: [
      {
        tag: 'Inmobiliaria',
        title: 'Congelamiento de Precio / Reserva de Lote',
        text: '¡Hola [Nombre]! Te comento que tuvimos otras consultas por la misma propiedad. Si te interesa avanzar, podemos bloquear la unidad hoy mismo con las condiciones acordadas.'
      },
      {
        tag: 'Comercio',
        title: 'Últimas Unidades con Envío Prioritario',
        text: '¡Hola [Nombre]! Solo nos quedan 2 unidades disponibles con el descuento de liquidación. ¿Deseas que te reserve una con entrega prioritaria hoy?'
      }
    ]
  },
  won: {
    title: '🟢 Ventas Ganadas (Fidelización, Referidos & Nuevos Lanzamientos)',
    subtitle: 'Objetivo: Maximizar el valor de por vida del cliente y conseguir nuevos prospectos recomendados.',
    items: [
      {
        tag: 'Exclusivo VIP',
        title: 'Lanzamiento Exclusivo en Preventa',
        text: '¡Hola [Nombre]! Como cliente preferencial, te comparto en primicia este nuevo proyecto antes de su anuncio público. Tiene precios especiales de preventa que seguro te gustarán.'
      },
      {
        tag: 'Referidos',
        title: 'Recomendación con Beneficio Especial',
        text: '¡Hola [Nombre]! Espero que estés disfrutando tu compra. Si tienes algún amigo o familiar buscando opciones, refiérelo conmigo y le damos atención VIP con descuento.'
      }
    ]
  },
  lost: {
    title: '⚪ Descartados / Inactivos (Reactivación Inteligente)',
    subtitle: 'Objetivo: Recuperar prospectos dormidos con una oportunidad irrechazable sin ser invasivo.',
    items: [
      {
        tag: 'Oportunidad Única',
        title: 'Propiedad con Rebaja de Precio de Ocasión',
        text: '¡Hola [Nombre]! Sé que anteriormente no era el momento para comprar, pero acaba de liberarse una opción con precio rebajado por debajo del mercado. Pensé en ti de inmediato, ¿te gustaría verla?'
      }
    ]
  }
}

export default function LeadsClient({ 
  leads,
  isPro = false
}: { 
  leads: Lead[]
  isPro?: boolean
}) {
  const [leadsList, setLeadsList] = useState<Lead[]>(leads)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [showProModal, setShowProModal] = useState(false)
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [activeTemplateTab, setActiveTemplateTab] = useState<LeadStatus>('lead')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Nuevo contacto manual modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'lead' as LeadStatus,
    category: '',
    notes: ''
  })

  // Eliminar contacto
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLeadForm.name.trim()) {
      setCreateError('El nombre es obligatorio.')
      return
    }

    setCreateLoading(true)
    setCreateError(null)

    try {
      const res = await createManualLead({
        name: newLeadForm.name,
        phone: newLeadForm.phone || null,
        email: newLeadForm.email || null,
        status: newLeadForm.status,
        category: newLeadForm.category || null,
        notes: newLeadForm.notes || null
      })

      if (res.success && res.lead) {
        const created: Lead = {
          id: res.lead.id,
          name: res.lead.name,
          phone: res.lead.phone,
          email: res.lead.email,
          created_at: res.lead.created_at,
          source: 'vcard',
          status: (res.lead.status as LeadStatus) || 'lead',
          category: res.lead.category,
          notes: res.lead.notes,
          deal_value: res.lead.deal_value || 0
        }
        setLeadsList(prev => [created, ...prev])
        setShowCreateModal(false)
        setNewLeadForm({
          name: '',
          phone: '',
          email: '',
          status: 'lead',
          category: '',
          notes: ''
        })
      } else {
        setCreateError(res.error || 'No se pudo guardar el contacto.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al guardar contacto.'
      setCreateError(msg)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return
    setDeleteLoading(true)
    try {
      const res = await deleteLead(leadToDelete.id)
      if (res.success) {
        setLeadsList(prev => prev.filter(l => l.id !== leadToDelete.id))
        setLeadToDelete(null)
      } else {
        alert(res.error || 'No se pudo eliminar el contacto.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar contacto.'
      alert(msg)
    } finally {
      setDeleteLoading(false)
    }
  }


  const handleCopyTemplate = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }


  // Recuento de prospectos por fase del embudo
  const counts = {
    all: leadsList.length,
    lead: leadsList.filter(l => (l.status || 'lead') === 'lead').length,
    contacted: leadsList.filter(l => l.status === 'contacted').length,
    negotiation: leadsList.filter(l => l.status === 'negotiation').length,
    won: leadsList.filter(l => l.status === 'won').length,
    lost: leadsList.filter(l => l.status === 'lost').length,
  }

  const wonRate = counts.all > 0 ? ((counts.won / counts.all) * 100).toFixed(0) : '0'

  const handleStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
    const previousStatus = lead.status || 'lead'
    if (previousStatus === newStatus) return

    // Actualización optimista
    setLeadsList(prev => prev.map(item => item.id === lead.id ? { ...item, status: newStatus } : item))
    setUpdatingId(lead.id)

    try {
      const res = await updateLeadStatus({
        leadId: lead.id,
        status: newStatus,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        source: lead.source,
        notes: lead.notes,
        category: lead.category
      })

      if (!res.success) {
        // Rollback si falla
        setLeadsList(prev => prev.map(item => item.id === lead.id ? { ...item, status: previousStatus } : item))
        alert('No se pudo actualizar el estatus: ' + (res.error || 'Error desconocido'))
      }
    } catch {
      setLeadsList(prev => prev.map(item => item.id === lead.id ? { ...item, status: previousStatus } : item))
      alert('Error de conexión al actualizar el estatus.')
    } finally {

      setUpdatingId(null)
    }
  }

  // Filtrado compuesto (Búsqueda textual + Filtro por fase del embudo)
  const filteredLeads = leadsList.filter((lead) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = (
      lead.name.toLowerCase().includes(term) ||
      (lead.email && lead.email.toLowerCase().includes(term)) ||
      (lead.phone && lead.phone.includes(term)) ||
      (lead.notes && lead.notes.toLowerCase().includes(term)) ||
      (lead.category && lead.category.toLowerCase().includes(term))
    )

    const currentStatus = lead.status || 'lead'
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  // Generar y descargar vCard (.vcf) directamente en el móvil o PC
  const handleSaveToPhone = (lead: Lead) => {
    const nameParts = lead.name.trim().split(' ')
    const firstName = nameParts[0] || 'Contacto'
    const lastName = nameParts.slice(1).join(' ') || ''

    const note = lead.source === 'loyalty'
      ? `Cliente del Club de Fidelización OmniTag (${lead.loyaltyStamps || 1} sellos)`
      : lead.source === 'appointment'
      ? `Cliente de Citas (${lead.notes || 'Agendamiento'})`
      : lead.source === 'menu'
      ? `Cliente Menú Digital (${lead.notes || 'Pedido'})`
      : lead.source === 'review'
      ? `Cliente de Opiniones (${lead.notes || 'Calificación'})`
      : 'Contacto capturado vía OmniTag vCard'

    const vcfLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName};${firstName};;;`,
      `FN:${lead.name}`,
      lead.phone ? `TEL;TYPE=CELL:${lead.phone}` : '',
      lead.email ? `EMAIL;TYPE=INTERNET,HOME:${lead.email}` : '',
      `NOTE:${note}`,
      'END:VCARD'
    ].filter(Boolean).join('\r\n')

    const blob = new Blob([vcfLines], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${lead.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.vcf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Exportar lista completa a CSV para Excel / CRM (Función PRO)
  const handleExportCSV = () => {
    if (!isPro) {
      setShowProModal(true)
      return
    }

    if (leadsList.length === 0) return

    const headers = ['Nombre', 'Teléfono', 'Email', 'Estatus CRM', 'Sector / Etiqueta', 'Origen', 'En Billetera', 'Detalle / Notas', 'Fecha']
    const rows = leadsList.map(l => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${LEAD_STATUS_CONFIG[l.status || 'lead']?.label || 'Nuevo Prospecto'}"`,
      `"${(l.category || '').replace(/"/g, '""')}"`,
      `"${l.source === 'loyalty' ? 'Fidelización' : l.source === 'appointment' ? 'Citas' : l.source === 'menu' ? 'Menú Digital' : l.source === 'review' ? 'Calificación' : 'vCard'}"`,
      `"${l.hasWallet ? 'Sí (Google Wallet)' : 'No'}"`,
      `"${(l.notes || (l.source === 'loyalty' ? `${l.loyaltyStamps || 1} Sellos` : 'Intercambio directo')).replace(/"/g, '""')}"`,
      `"${new Date(l.created_at).toLocaleString()}"`
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `crm_contactos_omnitag_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* BANNER PRO SI EL USUARIO ESTÁ EN PLAN BÁSICO */}
      {!isPro && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-black text-white p-5 sm:p-6 rounded-2xl shadow-md border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3 fill-black" /> OmniTag PRO
            </div>
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
              Exporta tu base completa de clientes clasificados a Excel
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              En tu <b>Plan Gratis</b> ya puedes clasificar clientes en cada fase del embudo. Con <b>OmniTag PRO</b> desbloqueas la exportación directa a Excel para tus campañas de ventas y marketing.
            </p>
          </div>

          <Link
            href="/dashboard/billing#metodos-pago"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Mejorar a PRO</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* PIPELINE & MÉTRICAS DEL EMBUDO DE VENTAS */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Embudo Comercial & Clasificación de Clientes
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Mueve a tus prospectos por cada nivel de venta para hacer seguimiento efectivo y segmentar tus campañas.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tasa de Cierre: <b>{wonRate}%</b></span>
          </div>
        </div>

        {/* Pestañas de Filtro por Nivel del Embudo */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-black text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Todos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-white text-gray-700'}`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('lead')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'lead'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <span>🟡 Nuevos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'lead' ? 'bg-white/20 text-white' : 'bg-white text-amber-900'}`}>
              {counts.lead}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('contacted')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'contacted'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60'
            }`}
          >
            <span>🔵 Contactados</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'contacted' ? 'bg-white/20 text-white' : 'bg-white text-blue-900'}`}>
              {counts.contacted}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('negotiation')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'negotiation'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/60'
            }`}
          >
            <span>🟣 En Negociación</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'negotiation' ? 'bg-white/20 text-white' : 'bg-white text-purple-900'}`}>
              {counts.negotiation}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('won')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'won'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <span>🟢 Ventas Completadas</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'won' ? 'bg-white/20 text-white' : 'bg-white text-emerald-900'}`}>
              {counts.won}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('lost')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'lost'
                ? 'bg-gray-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <span>⚪ Descartados</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'lost' ? 'bg-white/20 text-white' : 'bg-white text-gray-700'}`}>
              {counts.lost}
            </span>
          </button>
        </div>
      </div>

      {/* Controles de Búsqueda y Exportación */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-50/80 p-3.5 sm:p-4 rounded-2xl border border-gray-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, notas o sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-gray-200 focus:border-black focus:outline-none shadow-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => {
              setCreateError(null)
              setShowCreateModal(true)
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Contacto</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTemplatesModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition shadow-2xs whitespace-nowrap cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Guía de Mensajes</span>
          </button>


          <button
            onClick={handleExportCSV}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap cursor-pointer ${
              isPro 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar a Excel (CSV)</span>
            {!isPro && (
              <span className="bg-purple-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md">
                PRO
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Lista Vacía o Resultados */}
      {filteredLeads.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="font-semibold text-gray-700">No hay contactos en este filtro</p>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Prueba cambiando el filtro de nivel o limpiando la búsqueda.'
              : 'Los clientes que usen el botón "Intercambiar Contacto" en tu vCard aparecerán registrados aquí automáticamente.'}
          </p>
        </div>
      ) : (
        <>
          {/* Vista Móvil (Tarjetas de Contacto) */}
          <div className="block md:hidden space-y-3">
            {filteredLeads.map((lead) => {
              const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : null
              const currentStatus = lead.status || 'lead'
              const statusCfg = LEAD_STATUS_CONFIG[currentStatus] || LEAD_STATUS_CONFIG.lead
              const isUpdating = updatingId === lead.id
              const waText = getStageWhatsAppMessage(lead)

              return (
                <div key={lead.id} className={`p-4 bg-white rounded-2xl border transition shadow-xs space-y-3 ${
                  currentStatus === 'won' ? 'border-emerald-200 bg-emerald-50/10' : 'border-gray-200'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-base">{lead.name}</h3>
                        {lead.source === 'loyalty' ? (
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Gift className="w-3 h-3" /> {lead.loyaltyStamps || 1} sellos
                          </span>
                        ) : lead.source === 'appointment' ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Scissors className="w-3 h-3" /> Cita
                          </span>
                        ) : lead.source === 'menu' ? (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Coffee className="w-3 h-3" /> Menú
                          </span>
                        ) : lead.source === 'review' ? (
                          <span className="text-[10px] bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" /> Opinión
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <UserCircle className="w-3 h-3" /> vCard
                          </span>
                        )}

                        {lead.hasWallet && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-200" title="Tarjeta en Google Wallet">
                            <Wallet className="w-3 h-3 text-indigo-600" /> Billetera
                          </span>
                        )}

                        {lead.category && (
                          <span className="text-[10px] bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded-md border border-gray-200">
                            #{lead.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {new Date(lead.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleSaveToPhone(lead)}
                        title="Guardar en agenda del móvil"
                        className="p-2 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 transition flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-blue-600" />
                        <span>Guardar</span>
                      </button>

                      <button
                        onClick={() => setLeadToDelete(lead)}
                        title="Eliminar contacto del CRM"
                        className="p-2 rounded-xl bg-white text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 transition flex items-center justify-center text-xs shadow-xs cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>


                  {/* Selector de Nivel / Estatus en Móvil */}
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">
                      Nivel en el Embudo CRM:
                    </label>
                    <div className="relative">
                      <select
                        value={currentStatus}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                        className={`w-full text-xs font-bold py-2 pl-3 pr-8 rounded-xl border appearance-none transition bg-white shadow-2xs ${statusCfg.badgeText} ${statusCfg.border}`}
                      >
                        <option value="lead">🟡 Nuevo Prospecto</option>
                        <option value="contacted">🔵 Contactado</option>
                        <option value="negotiation">🟣 En Negociación / Visita</option>
                        <option value="won">🟢 Venta Completada</option>
                        <option value="lost">⚪ Descartado / Perdido</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {isUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                        ) : (
                          <span className="text-xs text-gray-400">▼</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info & Notes */}
                  <div className="space-y-1 text-xs">
                    {lead.phone && (
                      <p className="flex items-center gap-2 text-gray-800 font-medium font-mono">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {lead.phone}
                      </p>
                    )}
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 truncate">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {lead.email}
                      </a>
                    )}
                    {lead.notes && (
                      <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-xl border border-gray-100 mt-1">
                        {lead.notes}
                      </p>
                    )}
                  </div>

                  {/* Botones de Acción Directa */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                    {cleanPhone ? (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 bg-[#25D366] text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs hover:bg-[#1EBE57] transition"
                      >
                        <MessageSquare className="w-4 h-4 fill-white" />
                        <span>WhatsApp</span>
                      </a>
                    ) : (
                      <button disabled className="bg-gray-200 text-gray-400 py-2 px-3 rounded-xl font-bold text-xs opacity-50 cursor-not-allowed">
                        Sin WhatsApp
                      </button>
                    )}

                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center justify-center gap-1.5 bg-black text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs hover:bg-gray-800 transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Llamar</span>
                      </a>
                    ) : lead.email ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs hover:bg-blue-700 transition"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Vista Escritorio (Tabla con Selector Interactivo de Nivel) */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                  <th className="px-5 py-3.5">Nombre</th>
                  <th className="px-4 py-3.5">Nivel / Estatus CRM</th>
                  <th className="px-5 py-3.5">Teléfono / WhatsApp</th>
                  <th className="px-4 py-3.5">Correo</th>
                  <th className="px-5 py-3.5">Origen / Detalle</th>
                  <th className="px-4 py-3.5">Fecha</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead) => {
                  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : null
                  const currentStatus = lead.status || 'lead'
                  const statusCfg = LEAD_STATUS_CONFIG[currentStatus] || LEAD_STATUS_CONFIG.lead
                  const isUpdating = updatingId === lead.id
                  const waText = getStageWhatsAppMessage(lead)

                  return (
                    <tr key={lead.id} className={`hover:bg-gray-50/80 transition-colors ${
                      currentStatus === 'won' ? 'bg-emerald-50/15' : ''
                    }`}>
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">{lead.name}</div>
                        {lead.category && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 font-medium px-1.5 py-0.5 rounded border border-gray-200 inline-block mt-0.5">
                            #{lead.category}
                          </span>
                        )}
                      </td>

                      {/* Selector Interactivo de Nivel del Embudo */}
                      <td className="px-4 py-4">
                        <div className="relative inline-block">
                          <select
                            value={currentStatus}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                            className={`text-xs font-bold py-1.5 pl-2.5 pr-7 rounded-xl border appearance-none transition bg-white shadow-2xs cursor-pointer focus:outline-none focus:ring-1 ${statusCfg.badgeText} ${statusCfg.border}`}
                          >
                            <option value="lead">🟡 Nuevo Prospecto</option>
                            <option value="contacted">🔵 Contactado</option>
                            <option value="negotiation">🟣 En Negociación</option>
                            <option value="won">🟢 Venta Ganada</option>
                            <option value="lost">⚪ Descartado</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                            ) : (
                              <span className="text-[10px] text-gray-400">▼</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {lead.phone ? (
                          <span className="font-mono text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" /> {lead.phone}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-xs">No provisto</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="text-gray-600 hover:text-blue-600 text-xs flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" /> {lead.email}
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-xs">No provisto</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {lead.source === 'loyalty' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                                <Gift className="w-3 h-3" /> {lead.loyaltyStamps || 1} sellos
                              </span>
                            ) : lead.source === 'appointment' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                <Scissors className="w-3 h-3" /> Cita / Reserva
                              </span>
                            ) : lead.source === 'menu' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                                <Coffee className="w-3 h-3" /> Menú Digital
                              </span>
                            ) : lead.source === 'review' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-yellow-800 bg-yellow-50 px-2.5 py-0.5 rounded-full border border-yellow-200">
                                <Star className="w-3 h-3" /> Opinión
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                                <UserCircle className="w-3 h-3" /> vCard
                              </span>
                            )}

                            {lead.hasWallet && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200" title="Tarjeta en Google Wallet">
                                <Wallet className="w-3 h-3 text-indigo-600" /> Billetera
                              </span>
                            )}
                          </div>

                          {lead.notes && (
                            <p className="text-[11px] text-gray-500 italic max-w-xs truncate" title={lead.notes}>
                              {lead.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSaveToPhone(lead)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer"
                            title="Guardar en agenda (.vcf)"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                            <span>Guardar</span>
                          </button>

                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE57] transition shadow-2xs"
                              title="Chatear en WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5 fill-white" />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          <button
                            onClick={() => setLeadToDelete(lead)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Eliminar contacto del CRM"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal de Upgrade PRO para exportación de Excel */}
      <ProFeatureModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        featureName="Exportación de Contactos a Excel (CSV)"
        featureDescription="Descarga tu base completa de clientes, teléfonos de WhatsApp y prospectos para sincronizar con tus campañas masivas de marketing o software de ventas."
      />

      {/* Modal de Guía de Mensajes & Plantillas por Nivel */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[88vh]">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-gray-900 to-indigo-950 text-white">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Copywriting Comercial
                </div>
                <h3 className="font-extrabold text-lg text-white">
                  Guía de Mensajes Persuasivos por Segmento
                </h3>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Textos probados para WhatsApp para mover prospectos al siguiente nivel del embudo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pestañas de Estatus */}
            <div className="flex items-center gap-1 p-2 bg-gray-100 border-b border-gray-200 overflow-x-auto scrollbar-none text-xs font-bold">
              {(['lead', 'contacted', 'negotiation', 'won', 'lost'] as LeadStatus[]).map((st) => {
                const cfg = LEAD_STATUS_CONFIG[st]
                const isActive = activeTemplateTab === st
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setActiveTemplateTab(st)}
                    className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                      isActive 
                        ? 'bg-white text-gray-900 shadow-xs' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{cfg.emoji}</span>
                    <span>{cfg.shortLabel}</span>
                  </button>
                )
              })}
            </div>

            {/* Lista de Plantillas para la pestaña activa */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <h4 className="font-extrabold text-sm text-gray-900">
                  {SEGMENT_TEMPLATES[activeTemplateTab].title}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {SEGMENT_TEMPLATES[activeTemplateTab].subtitle}
                </p>
              </div>

              <div className="space-y-3">
                {SEGMENT_TEMPLATES[activeTemplateTab].items.map((item, idx) => {
                  const key = `${activeTemplateTab}_${idx}`
                  const isCopied = copiedKey === key

                  return (
                    <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {item.tag}
                          </span>
                          <span className="font-bold text-xs text-gray-900">
                            {item.title}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyTemplate(item.text, key)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer ${
                            isCopied 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-gray-500" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed font-sans bg-white p-3 rounded-lg border border-gray-100">
                        &ldquo;{item.text}&rdquo;
                      </p>

                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>Recuerda cambiar <b>[Nombre]</b> por el nombre de tu cliente.</span>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="bg-gray-900 hover:bg-black text-white font-extrabold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Nuevo Contacto Manual */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-900 to-blue-950 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Nuevo Contacto (CRM)</h3>
                  <p className="text-[11px] text-gray-300">Agrega un cliente o prospecto a tu libreta</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 overflow-y-auto space-y-4">
              {createError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Gómez"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. +504 9988-0000"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="cliente@correo.com"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Fase en el Embudo
                  </label>
                  <select
                    value={newLeadForm.status}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, status: e.target.value as LeadStatus }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-xs font-bold focus:outline-none bg-white"
                  >
                    <option value="lead">🟡 Nuevo Prospecto</option>
                    <option value="contacted">🔵 Contactado</option>
                    <option value="negotiation">🟣 En Negociación</option>
                    <option value="won">🟢 Venta Ganada</option>
                    <option value="lost">⚪ Descartado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Etiqueta / Sector
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Inmobiliaria, VIP..."
                    value={newLeadForm.category}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Notas / Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre lo que busca o de dónde lo conociste..."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-medium focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Guardar Contacto</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">¿Eliminar contacto?</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                ¿Estás seguro de que deseas eliminar a <b>{leadToDelete.name}</b> de tu lista de contactos? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setLeadToDelete(null)}
                className="w-1/2 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Eliminar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

}
