'use client'

import { useState, useTransition } from 'react'
import { 
  Gift, 
  Plus, 
  Sparkles, 
  Search, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Clock, 
  Send, 
  Printer, 
  Copy, 
  Check, 
  Eye, 
  Share2, 
  X, 
  ShieldCheck, 
  KeyRound,
  ArrowRight,
  TrendingUp,
  Receipt,
  Scissors,
  ExternalLink,
  ChevronDown
} from 'lucide-react'
import { createGiftCard, redeemGiftCard, cancelGiftCard } from './actions'
import ImageUploadInput from '@/components/ImageUploadInput'


interface GiftCard {
  id: string
  code: string
  security_pin: string
  title: string
  card_type: 'amount' | 'service'
  service_name: string | null
  initial_amount: number
  current_balance: number
  currency: string
  currency_symbol: string
  status: 'active' | 'redeemed' | 'cancelled' | 'expired'
  buyer_name: string | null
  buyer_phone: string | null
  buyer_email: string | null
  recipient_name: string
  recipient_phone: string | null
  recipient_email: string | null
  gift_message: string | null
  theme_color: string
  logo_url?: string | null
  card_image_url?: string | null
  require_pin?: boolean
  source?: string | null
  expires_at: string | null
  created_at: string
}

interface Redemption {
  id: string
  amount: number
  previous_balance: number
  new_balance: number
  notes: string | null
  created_at: string
  gift_cards?: {
    code: string
    recipient_name: string
    title: string
    currency_symbol: string
  }
}

interface Props {
  initialCards: GiftCard[]
  initialRedemptions: Redemption[]
  businessName: string
  currencySymbol: string
  existingLogos?: { label: string; url: string }[]
}

const THEME_OPTIONS = [
  { id: 'luxury_gold', name: 'Black & Gold VIP', hex: '#18181b', accent: '#fbbf24', desc: 'Lujo oscuro y oro' },
  { id: 'spa_rose', name: 'Rosa Spa & Glamour', hex: '#ec4899', accent: '#fbcfe8', desc: 'Estética y belleza' },
  { id: 'emerald_botanic', name: 'Esmeralda Wellness', hex: '#059669', accent: '#a7f3d0', desc: 'Spas botánicos' },
  { id: 'champagne', name: 'Dorado Champagne', hex: '#d97706', accent: '#fef3c7', desc: 'Aniversarios y gala' },
  { id: 'festive_red', name: 'Celebración Festiva', hex: '#dc2626', accent: '#fecaca', desc: 'Cumpleaños y lazo' },
]

export default function GiftCardsManager({
  initialCards,
  initialRedemptions,
  businessName,
  currencySymbol,
  existingLogos = []
}: Props) {
  const [cards, setCards] = useState<GiftCard[]>(initialCards)
  const [redemptions, setRedemptions] = useState<Redemption[]>(initialRedemptions)
  const [activeTab, setActiveTab] = useState<'cards' | 'history'>('cards')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'redeemed'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRedeemModal, setShowRedeemModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdCard, setCreatedCard] = useState<GiftCard | null>(null)
  const [selectedCardForRedeem, setSelectedCardForRedeem] = useState<GiftCard | null>(null)

  // Estados de formularios
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Formulario Crear
  const [cardType, setCardType] = useState<'amount' | 'service'>('amount')
  const [title, setTitle] = useState('Certificado de Regalo Spa')
  const [serviceName, setServiceName] = useState('')
  const [amount, setAmount] = useState('500')
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [giftMessage, setGiftMessage] = useState('¡Te mereces un momento de relajación y consentirte al máximo!')
  const [selectedThemeId, setSelectedThemeId] = useState('luxury_gold')
  const [themeColor, setThemeColor] = useState('#18181b')
  const [logoUrl, setLogoUrl] = useState<string>(existingLogos[0]?.url || '')
  const [requirePin, setRequirePin] = useState(false) // Por defecto False: al portador para que no haya fricción ni PIN expuesto
  const [expiresInMonths, setExpiresInMonths] = useState('6')

  // Formulario Canje (Redeem)
  const [redeemCodeInput, setRedeemCodeInput] = useState('')
  const [redeemPinInput, setRedeemPinInput] = useState('')
  const [redeemAmountInput, setRedeemAmountInput] = useState('')
  const [redeemNotesInput, setRedeemNotesInput] = useState('')
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState<string | null>(null)

  // Métricas
  const totalIssuedAmount = cards.reduce((acc, c) => acc + (Number(c.initial_amount) || 0), 0)
  const totalPendingBalance = cards.reduce((acc, c) => c.status === 'active' ? acc + (Number(c.current_balance) || 0) : acc, 0)
  const totalRedeemedAmount = redemptions.reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
  const activeCardsCount = cards.filter(c => c.status === 'active').length

  // Filtrado de tarjetas
  const filteredCards = cards.filter(c => {
    const matchesSearch = 
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.buyer_name && c.buyer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false
    if (filterStatus === 'active') return c.status === 'active'
    if (filterStatus === 'redeemed') return c.status === 'redeemed'
    return true
  })

  // Copiar al portapapeles
  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/g/${code}`
    navigator.clipboard.writeText(url)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  // Compartir por WhatsApp
  const handleShareWhatsApp = (card: GiftCard) => {
    const url = `${window.location.origin}/g/${card.code}`
    const pinText = card.require_pin === false
      ? '🎟️ *Modalidad:* Certificado oficial al portador (canje directo sin claves).'
      : `🔑 *PIN confidencial de canje:* ${card.security_pin}`
    const text = `🎉 ¡Hola ${card.recipient_name}! *${card.buyer_name || 'Alguien que te aprecia'}* te ha regalado una *Tarjeta de Regalo* para consentirte en *${businessName}*.\n\n🎁 *Detalle:* ${card.card_type === 'service' ? card.service_name : `${card.currency_symbol} ${card.current_balance}`}\n💬 "${card.gift_message || '¡Disfrútalo mucho!'}"\n\n👉 *Abre tu tarjeta y tu QR aquí:* ${url}\n${pinText}`
    const targetPhone = (card.recipient_phone || card.buyer_phone || '').replace(/[^0-9]/g, '')
    const waUrl = targetPhone 
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank')
  }

  // Enviar creación
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('card_type', cardType)
        formData.append('title', title)
        formData.append('service_name', serviceName)
        formData.append('amount', amount)
        formData.append('recipient_name', recipientName)
        formData.append('recipient_phone', recipientPhone)
        formData.append('buyer_name', buyerName)
        formData.append('buyer_phone', buyerPhone)
        formData.append('gift_message', giftMessage)
        formData.append('theme_color', themeColor)
        formData.append('card_image_url', selectedThemeId)
        formData.append('logo_url', logoUrl)
        formData.append('require_pin', String(requirePin))
        formData.append('expires_in_months', expiresInMonths)

        const res = await createGiftCard(formData)
        if (res.success && res.card) {
          setCards([res.card, ...cards])
          setCreatedCard(res.card)
          setShowCreateModal(false)
          setShowSuccessModal(true)
          
          // Reset form
          setRecipientName('')
          setRecipientPhone('')
          setBuyerName('')
          setBuyerPhone('')
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Error al emitir la tarjeta')
      }
    })
  }

  // Pre-cargar tarjeta para canje
  const handleOpenRedeemModal = (card?: GiftCard) => {
    setErrorMsg(null)
    setRedeemSuccessMsg(null)
    if (card) {
      setSelectedCardForRedeem(card)
      setRedeemCodeInput(card.code)
      setRedeemAmountInput(String(card.current_balance))
      setRedeemPinInput(card.require_pin === false ? '' : card.security_pin)
    } else {
      setSelectedCardForRedeem(null)
      setRedeemCodeInput('')
      setRedeemAmountInput('')
      setRedeemPinInput('')
    }
    setRedeemNotesInput('')
    setShowRedeemModal(true)
  }

  // Buscar tarjeta en modal de canje si escribe código
  const handleLookupCard = (code: string) => {
    setRedeemCodeInput(code)
    const found = cards.find(c => c.code.toLowerCase() === code.trim().toLowerCase())
    if (found) {
      setSelectedCardForRedeem(found)
      setRedeemAmountInput(String(found.current_balance))
      if (found.require_pin === false) {
        setRedeemPinInput('')
      }
    }
  }

  // Enviar canje
  const handleRedeemSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setRedeemSuccessMsg(null)

    startTransition(async () => {
      try {
        const res = await redeemGiftCard({
          codeOrId: redeemCodeInput,
          securityPin: redeemPinInput,
          amountToRedeem: selectedCardForRedeem?.card_type === 'service' ? 0 : parseFloat(redeemAmountInput),
          notes: redeemNotesInput
        })

        if (res.success) {
          setRedeemSuccessMsg(`¡Canje procesado exitosamente! Descontado: ${res.currencySymbol} ${res.deductedAmount.toFixed(2)}. Saldo restante: ${res.currencySymbol} ${res.newBalance.toFixed(2)}`)
          
          // Actualizar estado local
          setCards(prev => prev.map(c => {
            if (c.code.toUpperCase() === res.code.toUpperCase()) {
              return {
                ...c,
                current_balance: res.newBalance,
                status: res.newStatus
              }
            }
            return c
          }))

          // Agregar al historial local
          setRedemptions(prev => [
            {
              id: Math.random().toString(),
              amount: res.deductedAmount,
              previous_balance: res.newBalance + res.deductedAmount,
              new_balance: res.newBalance,
              notes: redeemNotesInput || 'Consumo en establecimiento',
              created_at: new Date().toISOString(),
              gift_cards: {
                code: res.code,
                recipient_name: selectedCardForRedeem?.recipient_name || 'Cliente',
                title: selectedCardForRedeem?.title || 'Tarjeta',
                currency_symbol: res.currencySymbol
              }
            },
            ...prev
          ])

          setTimeout(() => {
            setShowRedeemModal(false)
          }, 2000)
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Error al procesar el canje')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* 1. HEADER & ACCIONES PRINCIPALES */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-pink-100">
              <Gift className="w-3.5 h-3.5" />
              <span>Flujo de Caja Anticipado & Nuevos Clientes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Tarjetas de Regalo & Vouchers
            </h1>
            <p className="text-sm sm:text-base text-pink-100/90 leading-relaxed">
              Emite certificados de regalo físicos o digitales en segundos. Tus clientes compran regalos para sus seres queridos y atraen nuevos visitantes a <strong>{businessName}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={() => handleOpenRedeemModal()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-sm border border-white/30 transition-all cursor-pointer shadow-xs"
            >
              <KeyRound className="w-4 h-4 text-pink-200" />
              <span>Cobrar / Canjear</span>
            </button>

            <button
              onClick={() => {
                setErrorMsg(null)
                setShowCreateModal(true)
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-gray-900 font-black text-sm hover:bg-pink-50 transition-all shadow-lg hover:shadow-xl cursor-pointer"
            >
              <Plus className="w-4 h-4 text-pink-600 stroke-[3]" />
              <span>Emitir Gift Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPIS / MÉTRICAS CONTABLES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Cobrado</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {currencySymbol} {totalIssuedAmount.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            Dinero ingresado por adelantado
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo por Canjear</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">
            {currencySymbol} {totalPendingBalance.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Pasivo a favor de clientes
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Redimido</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {currencySymbol} {totalRedeemedAmount.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Servicios entregados en sala
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tarjetas Activas</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600">
            {activeCardsCount} <span className="text-xs font-semibold text-gray-400">/ {cards.length}</span>
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Clientes pendientes de visitar
          </p>
        </div>
      </div>

      {/* 3. TABS Y FILTROS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-black text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tarjetas Emitidas ({cards.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-black text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Historial de Canjes ({redemptions.length})
          </button>
        </div>

        {activeTab === 'cards' && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por código o persona..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="flex items-center bg-gray-100 p-0.5 rounded-xl text-xs font-semibold text-gray-600">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg transition ${filterStatus === 'all' ? 'bg-white text-black font-bold shadow-xs' : ''}`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-2.5 py-1 rounded-lg transition ${filterStatus === 'active' ? 'bg-white text-emerald-700 font-bold shadow-xs' : ''}`}
              >
                Activas
              </button>
              <button
                onClick={() => setFilterStatus('redeemed')}
                className={`px-2.5 py-1 rounded-lg transition ${filterStatus === 'redeemed' ? 'bg-white text-gray-900 font-bold shadow-xs' : ''}`}
              >
                Canjeadas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. CONTENIDO SEGÚN TAB */}
      {activeTab === 'cards' ? (
        filteredCards.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Aún no has emitido tarjetas de regalo</h3>
            <p className="text-sm text-gray-500 mb-6">
              Cuando un cliente pida una gift card en el spa para regalar a una amiga, mamá o pareja, presiona el botón inferior para generarla al instante.
            </p>
            <button
              onClick={() => {
                setErrorMsg(null)
                setShowCreateModal(true)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-md transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Emitir Mi Primera Gift Card</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCards.map((card) => {
              const isRedeemed = card.status === 'redeemed'
              const isCancelled = card.status === 'cancelled'
              const isExpired = card.expires_at && new Date() > new Date(card.expires_at)
              const cardUrl = `/g/${card.code}`

              return (
                <div
                  key={card.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  {/* Banner de la Tarjeta con degradado según su tema */}
                  <div 
                    className="p-5 text-white relative overflow-hidden"
                    style={{ backgroundColor: card.theme_color || '#ec4899' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-white/90">
                          {card.card_type === 'service' ? 'Certificado Servicio' : 'Tarjeta Saldo'}
                        </span>
                        {card.source === 'prize_wheel' ? (
                          <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                            🎡 Ruleta
                          </span>
                        ) : card.source === 'loyalty_reward' ? (
                          <span className="text-[9px] font-black bg-emerald-300 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                            ⭐ Fidelidad
                          </span>
                        ) : null}
                      </div>

                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                        isRedeemed 
                          ? 'bg-gray-900/60 text-gray-200' 
                          : isCancelled 
                          ? 'bg-red-900/60 text-red-200' 
                          : 'bg-emerald-400/90 text-gray-900'
                      }`}>
                        {isRedeemed ? 'Canjeada' : isCancelled ? 'Anulada' : isExpired ? 'Expirada' : 'Disponible'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="font-black text-lg tracking-tight drop-shadow-xs truncate">
                        {card.title}
                      </h4>
                      <p className="text-xs text-white/80 font-medium">
                        De: <span className="font-bold text-white">{card.buyer_name || 'Anónimo'}</span>
                      </p>
                      <p className="text-xs text-white/80 font-medium">
                        Para: <span className="font-bold text-white">{card.recipient_name}</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/20 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 block">
                          Saldo Disponible
                        </span>
                        <span className="text-2xl font-black tracking-tight text-white">
                          {card.card_type === 'service' 
                            ? (isRedeemed ? 'Canjeado' : '1x Servicio')
                            : `${card.currency_symbol} ${Number(card.current_balance).toLocaleString('es-HN', { minimumFractionDigits: 2 })}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono font-bold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded text-white block">
                          {card.code}
                        </span>
                        <span className="text-[9px] text-white/70 font-mono mt-0.5 block">
                          PIN: {card.security_pin}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo de la Tarjeta */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    {card.gift_message && (
                      <p className="text-xs italic text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 line-clamp-2">
                        "{card.gift_message}"
                      </p>
                    )}

                    <div className="text-[11px] text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Emitida:</span>
                        <span className="font-semibold text-gray-600">
                          {new Date(card.created_at).toLocaleDateString('es-HN')}
                        </span>
                      </div>
                      {card.expires_at && (
                        <div className="flex justify-between">
                          <span>Vence:</span>
                          <span className="font-semibold text-gray-600">
                            {new Date(card.expires_at).toLocaleDateString('es-HN')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botones de Acción */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleShareWhatsApp(card)}
                          title="Compartir por WhatsApp"
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopyLink(card.code)}
                          title="Copiar enlace del voucher"
                          className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                        >
                          {copiedCode === card.code ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a
                          href={cardUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Ver Voucher Digital"
                          className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <a
                          href={cardUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Imprimir Certificado de Lujo Oficial"
                          className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition cursor-pointer border border-purple-200"
                        >
                          <Printer className="w-4 h-4" />
                        </a>
                      </div>

                      {card.status === 'active' && !isExpired && (
                        <button
                          onClick={() => handleOpenRedeemModal(card)}
                          className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Cobrar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* HISTORIAL DE CANJES / LEDGER */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Registro de Transacciones & Auditoría</h3>
            </div>
            <span className="text-xs text-gray-400 font-medium">Últimos {redemptions.length} canjes</span>
          </div>

          {redemptions.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              No hay canjes registrados aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3">Fecha y Hora</th>
                    <th className="px-5 py-3">Tarjeta / Código</th>
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3 text-right">Monto Canjeado</th>
                    <th className="px-5 py-3 text-right">Saldo Restante</th>
                    <th className="px-5 py-3">Concepto / Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {redemptions.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3 text-gray-500 font-medium">
                        {new Date(r.created_at).toLocaleString('es-HN')}
                      </td>
                      <td className="px-5 py-3 font-mono font-bold text-gray-900">
                        {r.gift_cards?.code || 'N/A'}
                      </td>
                      <td className="px-5 py-3 font-semibold text-gray-800">
                        {r.gift_cards?.recipient_name || 'Cliente'}
                      </td>
                      <td className="px-5 py-3 text-right font-black text-emerald-600">
                        - {r.gift_cards?.currency_symbol || currencySymbol} {Number(r.amount).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-gray-700">
                        {r.gift_cards?.currency_symbol || currencySymbol} {Number(r.new_balance).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-gray-500 italic max-w-xs truncate">
                        {r.notes || 'Canje en mostrador'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. MODAL: EMITIR NUEVA GIFT CARD */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Emitir Tarjeta de Regalo</h3>
                  <p className="text-xs text-gray-500">Cobro presencial en mostrador o transferencia</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Tipo de Tarjeta */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
                  Tipo de Tarjeta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCardType('amount')
                      setTitle('Tarjeta de Regalo Spa')
                    }}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      cardType === 'amount'
                        ? 'border-pink-500 bg-pink-50/50 text-pink-900 font-bold shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-pink-600" />
                      <span className="text-sm font-black">Por Saldo / Monto</span>
                    </div>
                    <p className="text-[11px] text-gray-500">El cliente gasta lo que quiera y conserva saldo remanente.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCardType('service')
                      setTitle('Certificado Spa: Masaje Relajante')
                    }}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      cardType === 'service'
                        ? 'border-pink-500 bg-pink-50/50 text-pink-900 font-bold shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Scissors className="w-4 h-4 text-pink-600" />
                      <span className="text-sm font-black">Por Servicio Específico</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Se canjea en 1 solo uso por un paquete o tratamiento completo.</p>
                  </button>
                </div>
              </div>

              {/* Título y Monto / Servicio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Título de la Tarjeta / Promoción *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ej. Día de Spa & Relax, Facial Glow..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium text-xs text-gray-900"
                  />
                </div>

                {cardType === 'service' ? (
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">
                      Nombre del Servicio o Tratamiento *
                    </label>
                    <input
                      type="text"
                      required
                      value={serviceName}
                      onChange={e => setServiceName(e.target.value)}
                      placeholder="Ej. Masaje Descontracturante 60min + Aromaterapia"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium text-xs text-gray-900"
                    />
                  </div>
                ) : (
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">
                      Monto de Saldo ({currencySymbol}) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 font-black text-sm text-gray-900"
                      />
                    </div>
                    {/* Botones de montos rápidos */}
                    <div className="flex gap-2 mt-2">
                      {['300', '500', '1000', '1500', '2000'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-[11px] text-gray-700 transition"
                        >
                          {currencySymbol} {val}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Datos de Quién Regala y Quién Recibe */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <span className="font-black text-gray-900 block text-xs">
                  Participantes del Regalo
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Para (Nombre de quien lo recibe) *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      placeholder="Ej. María López"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs font-semibold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      WhatsApp de quien recibe (Opcional)
                    </label>
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={e => setRecipientPhone(e.target.value)}
                      placeholder="Ej. +504 9999-9999"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      De parte de (Comprador)
                    </label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={e => setBuyerName(e.target.value)}
                      placeholder="Ej. Carlos Martínez"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs font-semibold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      WhatsApp del Comprador (Opcional)
                    </label>
                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={e => setBuyerPhone(e.target.value)}
                      placeholder="Ej. +504 8888-8888"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1">
                    Mensaje Dedicatorio
                  </label>
                  <textarea
                    rows={2}
                    value={giftMessage}
                    onChange={e => setGiftMessage(e.target.value)}
                    placeholder="Escribe un mensaje de cariño o felicitación..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs text-gray-900"
                  />
                </div>
              </div>

              {/* Selector de Plantilla de Diseño Visual */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                  Diseño de Tarjeta / Plantilla (Estilo Visual)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {THEME_OPTIONS.map(th => {
                    const isSelected = selectedThemeId === th.id
                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => {
                          setSelectedThemeId(th.id)
                          setThemeColor(th.hex)
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-20 ${
                          isSelected 
                            ? 'border-black ring-2 ring-black shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                        }`}
                        style={{ backgroundColor: th.hex }}
                      >
                        <div className="flex items-center justify-between text-white">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded">
                            {th.name}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-white/80 font-medium">
                          {th.desc}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Selector de Logotipo de la Empresa */}
              <div className="space-y-3">
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                  Logotipo de la Tarjeta / Empresa
                </label>
                
                {existingLogos.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-500 font-semibold block">
                      Selecciona un logotipo guardado en tu cuenta:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {existingLogos.map((l, idx) => {
                        const isSelected = logoUrl === l.url
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setLogoUrl(l.url)}
                            className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected 
                                ? 'border-pink-500 bg-pink-50/70 ring-2 ring-pink-500' 
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center p-0.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={l.url} alt={l.label} className="object-contain w-full h-full" />
                            </div>
                            <span className="text-[11px] font-bold text-gray-800 truncate max-w-[130px]">
                              {l.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <span className="text-[10px] text-gray-500 font-semibold block mb-1.5">
                    O sube una nueva imagen desde tu dispositivo / pega enlace:
                  </span>
                  <ImageUploadInput
                    name="card_logo"
                    label=""
                    defaultValue={logoUrl}
                    shape="square"
                    helpText="Logo o emblema de tu negocio (PNG transparente o JPG)."
                    onImageChange={(url) => setLogoUrl(url)}
                  />
                </div>
              </div>

              {/* Selector de Seguridad de Canje: Al Portador vs Con PIN */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                  Seguridad de Canje en Caja
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRequirePin(false)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      !requirePin 
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-base">🎟️</span>
                      <span className="text-xs font-black text-gray-900">Al Portador (Sin PIN)</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Recomendado para regalos físicos. El agasajado solo presenta el certificado o QR y la cajera descuenta sin pedir claves.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequirePin(true)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      requirePin 
                        ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-500' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-base">🔒</span>
                      <span className="text-xs font-black text-gray-900">Con PIN de Seguridad</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Para ventas remotas. La cajera debe pedir el PIN de 4 dígitos enviado confidencialmente por WhatsApp al beneficiario.
                    </p>
                  </button>
                </div>
              </div>

              {/* Vigencia */}
              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                  Vigencia de la Tarjeta
                </label>
                <select
                  value={expiresInMonths}
                  onChange={e => setExpiresInMonths(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white text-xs text-gray-800 font-semibold"
                >
                  <option value="3">3 Meses</option>
                  <option value="6">6 Meses (Recomendado)</option>
                  <option value="12">1 Año (12 Meses)</option>
                  <option value="never">Sin Vencimiento</option>
                </select>
              </div>

              {/* Vista previa en tiempo real hiperrealista */}
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1.5">
                  Vista Previa de la Tarjeta Física & Digital
                </span>
                <div 
                  className="rounded-2xl p-5 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[170px] border border-white/20 select-none"
                  style={{ backgroundColor: themeColor }}
                >
                  {/* Microchip EMV y Logo */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-6 rounded bg-gradient-to-br from-amber-200 to-amber-500 border border-amber-300 shadow-xs flex flex-col justify-around p-0.5">
                        <div className="w-full h-px bg-amber-800/40" />
                        <div className="w-full h-px bg-amber-800/40" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-200">
                        GIFT CARD
                      </span>
                    </div>

                    {logoUrl ? (
                      <div className="w-8 h-8 rounded-lg bg-white/95 p-0.5 border border-white/40 shadow-xs overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoUrl} alt="Logo" className="object-contain w-full h-full" />
                      </div>
                    ) : (
                      <span className="text-[9px] uppercase font-bold tracking-widest bg-black/30 px-2 py-0.5 rounded">
                        {businessName}
                      </span>
                    )}
                  </div>

                  <div>
                    <h5 className="font-serif font-black text-base drop-shadow-xs">{title || 'Título de Tarjeta'}</h5>
                    <p className="text-xs text-white/90 font-medium">
                      Para: <strong className="text-white font-bold">{recipientName || 'Nombre del Agasajado'}</strong>
                    </p>
                  </div>

                  <div className="flex justify-between items-end pt-2 border-t border-white/20">
                    <span className="text-xl font-serif font-black drop-shadow-xs">
                      {cardType === 'service' ? (serviceName || '1x Servicio') : `${currencySymbol} ${amount || '0'}`}
                    </span>
                    <span className="text-[9px] text-amber-200/90 font-mono tracking-widest bg-black/30 px-2 py-0.5 rounded">
                      {!requirePin ? 'AL PORTADOR' : 'PIN: ••••'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-black transition cursor-pointer shadow-md flex items-center gap-2"
                >
                  {isPending ? 'Emitiendo...' : 'Crear & Emitir Tarjeta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: ÉXITO DE EMISIÓN (Con opciones de WhatsApp e impresión) */}
      {showSuccessModal && createdCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-black text-gray-900">¡Tarjeta de Regalo Emitida!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Ya está lista para ser entregada al cliente física o digitalmente.
              </p>
            </div>

            {/* Tarjeta resumen */}
            <div 
              className="p-5 rounded-2xl text-white text-left space-y-2 shadow-md relative overflow-hidden"
              style={{ backgroundColor: createdCard.theme_color || '#ec4899' }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-black/20 px-2 py-0.5 rounded">
                  {createdCard.title}
                </span>
                <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                  {createdCard.code}
                </span>
              </div>
              <p className="text-xs text-white/90">
                Para: <span className="font-bold text-white">{createdCard.recipient_name}</span>
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-white/20">
                <span className="text-xl font-black">
                  {createdCard.card_type === 'service' 
                    ? createdCard.service_name 
                    : `${createdCard.currency_symbol} ${Number(createdCard.current_balance).toFixed(2)}`}
                </span>
                <span className="text-xs font-mono bg-white text-gray-900 px-2 py-0.5 rounded font-black">
                  PIN: {createdCard.security_pin}
                </span>
              </div>
            </div>

            {/* Acciones para compartir */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleShareWhatsApp(createdCard)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar por WhatsApp al Cliente</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyLink(createdCard.code)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition cursor-pointer"
                >
                  {copiedCode === createdCard.code ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode === createdCard.code ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
                </button>

                <a
                  href={`/g/${createdCard.code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Voucher Digital</span>
                </a>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="text-xs text-gray-400 hover:text-gray-600 font-semibold cursor-pointer"
            >
              Cerrar y volver al listado
            </button>
          </div>
        </div>
      )}

      {/* 7. MODAL: TERMINAL DE CANJE RÁPIDO (POS) */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Cobrar con Gift Card</h3>
                  <p className="text-xs text-gray-500">Valida el saldo y aplica el consumo</p>
                </div>
              </div>
              <button
                onClick={() => setShowRedeemModal(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {redeemSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{redeemSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleRedeemSubmit} className="space-y-4 text-xs">
              {/* Código */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Código de la Tarjeta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. GC-8F4K"
                  value={redeemCodeInput}
                  onChange={e => handleLookupCard(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white font-mono font-bold text-sm tracking-widest uppercase text-gray-900"
                />
              </div>

              {/* Vista previa de tarjeta si fue encontrada */}
              {selectedCardForRedeem && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-900 text-xs">
                      {selectedCardForRedeem.recipient_name}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {selectedCardForRedeem.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {selectedCardForRedeem.title}
                  </p>
                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-gray-600">Saldo Disponible:</span>
                    <span className="text-base font-black text-emerald-700">
                      {selectedCardForRedeem.card_type === 'service'
                        ? (selectedCardForRedeem.service_name || '1x Servicio Completo')
                        : `${selectedCardForRedeem.currency_symbol} ${Number(selectedCardForRedeem.current_balance).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              )}

              {/* PIN de Seguridad */}
              {selectedCardForRedeem?.require_pin === false ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800">
                  <span className="text-xl">🎟️</span>
                  <div>
                    <p className="font-bold text-xs">Tarjeta al Portador (Sin PIN)</p>
                    <p className="text-[10px] text-emerald-600">
                      Esta tarjeta no requiere PIN para su cobro. Puedes proceder directamente.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    PIN de Seguridad (4 dígitos) {selectedCardForRedeem ? '*' : '(si aplica)'}
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required={Boolean(selectedCardForRedeem)}
                    placeholder="1234"
                    value={redeemPinInput}
                    onChange={e => setRedeemPinInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white font-mono font-black text-center text-lg tracking-widest text-gray-900"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 text-center">
                    El cliente lo tiene disponible de forma confidencial en su mensaje de WhatsApp.
                  </p>
                </div>
              )}

              {/* Monto a Cobrar (si es por saldo) */}
              {selectedCardForRedeem?.card_type !== 'service' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Monto a Descontar ({currencySymbol}) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={redeemAmountInput}
                      onChange={e => setRedeemAmountInput(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white font-black text-base text-gray-900"
                    />
                  </div>
                  {selectedCardForRedeem && (
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setRedeemAmountInput(String(selectedCardForRedeem.current_balance))}
                        className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-[10px] text-gray-700"
                      >
                        Cobro Total (100%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRedeemAmountInput(String((selectedCardForRedeem.current_balance / 2).toFixed(2)))}
                        className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-[10px] text-gray-700"
                      >
                        50%
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Concepto / Factura */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nota / Concepto del Consumo (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Masaje relajante, Factura #108"
                  value={redeemNotesInput}
                  onChange={e => setRedeemNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white text-xs text-gray-900"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRedeemModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black transition cursor-pointer shadow-md flex items-center gap-2"
                >
                  {isPending ? 'Verificando...' : 'Confirmar Canje'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
