'use client'

import React, { useState, useTransition, useRef, useEffect } from 'react'
import { 
  Disc, 
  Sparkles, 
  Settings, 
  Calendar, 
  Clock, 
  Check, 
  Copy, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Save, 
  Power, 
  AlertCircle, 
  ShieldCheck, 
  QrCode, 
  Gift, 
  Users, 
  CheckCircle2, 
  XCircle,
  Play
} from 'lucide-react'
import Link from 'next/link'
import { toggleWheelStatus, saveWheelItems, updateWheelSettings } from './actions'

interface WheelManagerClientProps {
  initialWheel: any
  initialSpins: any[]
  metrics: {
    totalSpins: number
    redeemedSpins: number
    pendingSpins: number
  }
}

export default function WheelManagerClient({
  initialWheel,
  initialSpins,
  metrics
}: WheelManagerClientProps) {
  const [wheel, setWheel] = useState(initialWheel)
  const [items, setItems] = useState<any[]>(initialWheel.prize_wheel_items || [])
  const [spins, setSpins] = useState<any[]>(initialSpins)
  const [activeTab, setActiveTab] = useState<'prizes' | 'schedule' | 'settings' | 'history' | 'preview'>('prizes')

  const [isPending, startTransition] = useTransition()
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  const [activeEmojiIndex, setActiveEmojiIndex] = useState<number | null>(null)

  // Categorías de Emojis para Premios
  const EMOJI_CATEGORIES = [
    { name: '☕ Bebidas & Café', emojis: ['☕', '🍹', '🍸', '🍺', '🥤', '🧃', '🧉', '🧋', '🥂', '🍷', '🥛', '🫖'] },
    { name: '🍰 Postres & Dulces', emojis: ['🍰', '🍦', '🍩', '🧁', '🍪', '🥐', '🥞', '🍫', '🍮', '🍯', '🥧', '🍧'] },
    { name: '🍔 Comida & Platos', emojis: ['🍔', '🍕', '🌮', '🌯', '🍟', '🌭', '🥪', '🍣', '🍜', '🥩', '🍗', '🍤', '🥘'] },
    { name: '🏷️ Descuentos & Ofertas', emojis: ['🏷️', '💰', '💵', '💳', '💸', '🪙', '🧾', '📉', '%', '💲', '🛒'] },
    { name: '⭐ Fidelización & VIP', emojis: ['⭐', '🌟', '👑', '💎', '🏆', '🥇', '🥈', '🥉', '🎖️', '✨', '⚜️'] },
    { name: '🎟️ Cupones & Eventos', emojis: ['🎟️', '🎫', '🎪', '🎬', '🎳', '🎯', '🎲', '🎰', '🎮', '🍿'] },
    { name: '🎁 Regalos & Sorpresas', emojis: ['🎁', '🎈', '🎉', '🎊', '🪄', '📦', '🛍️', '🧸', '💌'] },
    { name: '💈 Belleza & Cuidado', emojis: ['✂️', '💈', '💅', '💄', '🧖‍♀️', '💆‍♂️', '🧴', '🌸', '🪮', '💆‍♀️'] }
  ]

  const selectEmoji = (emoji: string) => {
    if (activeEmojiIndex !== null) {
      updateItem(activeEmojiIndex, 'icon', emoji)
      setActiveEmojiIndex(null)
    }
  }

  // Estados de Configuración
  const [scheduleMode, setScheduleMode] = useState(wheel.schedule_mode || 'always')
  const [activeDays, setActiveDays] = useState<string[]>(
    Array.isArray(wheel.active_days) ? wheel.active_days : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  )
  const [startDate, setStartDate] = useState(wheel.start_date ? wheel.start_date.substring(0, 16) : '')
  const [endDate, setEndDate] = useState(wheel.end_date ? wheel.end_date.substring(0, 16) : '')
  const [pausedMessage, setPausedMessage] = useState(wheel.paused_message || 'La ruleta de premios está temporalmente en pausa.')
  const [pinCode, setPinCode] = useState(wheel.pin_code || '1234')
  const [cooldownHours, setCooldownHours] = useState(wheel.cooldown_hours || 24)

  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/w/${wheel.slug}` 
    : `/w/${wheel.slug}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Toggle Master de Ruleta (Activar / Pausar)
  const handleToggleMaster = () => {
    startTransition(async () => {
      try {
        const res = await toggleWheelStatus(wheel.id, wheel.is_active)
        setWheel((prev: any) => ({ ...prev, is_active: res.isActive }))
        setFeedbackMsg({
          type: 'success',
          text: res.isActive ? '¡Ruleta activada para tus clientes!' : 'Ruleta pausada con éxito.'
        })
      } catch (err: any) {
        setFeedbackMsg({ type: 'error', text: err.message || 'Error al cambiar estado.' })
      }
    })
  }

  // Actualizar Item de la lista
  const updateItem = (index: number, field: string, value: any) => {
    const next = [...items]
    next[index] = { ...next[index], [field]: value }
    setItems(next)
  }

  // Agregar Nuevo Premio
  const addItem = () => {
    if (items.length >= 12) {
      alert('Máximo 12 premios para garantizar legibilidad en pantalla.')
      return
    }
    const colors = ['#7C3AED', '#D97706', '#059669', '#DC2626', '#2563EB', '#DB2777', '#4F46E5']
    const randomCol = colors[items.length % colors.length]
    setItems([
      ...items,
      {
        label: 'Nuevo Premio',
        icon: '🎁',
        bg_color: randomCol,
        text_color: '#FFFFFF',
        probability_weight: 10,
        reward_type: 'discount',
        stamp_count: 1,
        max_daily_stock: null,
        is_active: true
      }
    ])
  }

  // Eliminar Premio
  const removeItem = (index: number) => {
    if (items.length <= 3) {
      alert('La ruleta requiere al menos 3 premios.')
      return
    }
    setItems(items.filter((_, i) => i !== index))
  }

  // Guardar Premios en Base de Datos
  const handleSaveItems = () => {
    startTransition(async () => {
      try {
        await saveWheelItems(wheel.id, items)
        setFeedbackMsg({ type: 'success', text: '¡Premios y probabilidades guardados con éxito!' })
      } catch (err: any) {
        setFeedbackMsg({ type: 'error', text: err.message || 'Error al guardar premios.' })
      }
    })
  }

  // Guardar Horarios y Ajustes
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('wheel_id', wheel.id)
        formData.append('name', wheel.name)
        formData.append('description', wheel.description || '')
        formData.append('schedule_mode', scheduleMode)
        activeDays.forEach(d => formData.append('active_days', d))
        if (startDate) formData.append('start_date', startDate)
        if (endDate) formData.append('end_date', endDate)
        formData.append('paused_message', pausedMessage)
        formData.append('pin_code', pinCode)
        formData.append('cooldown_hours', cooldownHours.toString())

        await updateWheelSettings(formData)
        setFeedbackMsg({ type: 'success', text: '¡Horarios y ajustes guardados correctamente!' })
      } catch (err: any) {
        setFeedbackMsg({ type: 'error', text: err.message || 'Error al guardar ajustes.' })
      }
    })
  }

  const toggleDay = (day: string) => {
    if (activeDays.includes(day)) {
      if (activeDays.length === 1) {
        alert('Debes mantener al menos 1 día activo.')
        return
      }
      setActiveDays(activeDays.filter(d => d !== day))
    } else {
      setActiveDays([...activeDays, day])
    }
  }

  // Suma total de probabilidades ponderadas
  const totalWeight = items.reduce((acc, it) => acc + (parseInt(it.probability_weight) || 0), 0)

  return (
    <div className="space-y-6">
      
      {/* 1. CABECERA & CONTROL MASTER */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-600 flex items-center justify-center text-2xl shadow-xs">
            🎰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900">Ruleta de Premios & Gamificación</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                VIP
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Incentiva visitas recurrentes, captura leads en el CRM y estampa sellos de fidelización.
            </p>
          </div>
        </div>

        {/* Master Toggle On/Off */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-800">
              {wheel.is_active ? '🟢 Ruleta Activa' : '🔴 Ruleta en Pausa'}
            </p>
            <p className="text-[10px] text-gray-400">
              {wheel.is_active ? 'Visible para clientes' : 'Bloqueada al público'}
            </p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={handleToggleMaster}
            className={`p-3 rounded-2xl font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-sm ${
              wheel.is_active 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{wheel.is_active ? 'ENCENDIDA' : 'PAUSADA'}</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK NOTIFICATION */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in duration-200 ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* 2. ENLACE PÚBLICO & MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Caja de Enlace Público y QR */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-black text-amber-400 tracking-wider">
              Enlace Público de tu Ruleta
            </span>
            <Link
              href={`/dashboard/qr-studio`}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Diseñar QR de Mesa</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
            <input 
              type="text" 
              readOnly 
              value={publicUrl}
              className="w-full bg-transparent text-xs font-mono text-slate-200 px-2 focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
            </button>
            <a
              href={`/w/${wheel.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-[11px] text-slate-400">
            💡 <b>Tip Pro:</b> Coloca este enlace en tus habladores de mesa QR o vincúlalo a tus tarjetas NFC para que los comensales jueguen en su mesa.
          </p>
        </div>

        {/* Métricas Agregadas */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-gray-500">Métricas de Participación</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Total Giros</p>
              <p className="text-lg font-black text-gray-900">{metrics.totalSpins}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <p className="text-[10px] text-emerald-600 font-bold uppercase">Canjeados</p>
              <p className="text-lg font-black text-emerald-700">{metrics.redeemedSpins}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 text-center">
            {metrics.pendingSpins} cupones pendientes por canjear
          </p>
        </div>

      </div>

      {/* 3. PESTAÑAS DE GESTIÓN */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('prizes')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'prizes' 
              ? 'bg-amber-500 text-slate-950 shadow-xs' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Premios & Probabilidades ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'schedule' 
              ? 'bg-amber-500 text-slate-950 shadow-xs' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Horarios & Días Especiales</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'settings' 
              ? 'bg-amber-500 text-slate-950 shadow-xs' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Ajustes & PIN de Cajero</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'history' 
              ? 'bg-amber-500 text-slate-950 shadow-xs' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Historial de Cupones ({spins.length})</span>
        </button>
      </div>

      {/* 4. CONTENIDO DE PESTAÑAS */}

      {/* PESTAÑA A: PREMIOS Y PROBABILIDADES */}
      {activeTab === 'prizes' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-black text-gray-900">Configuración de Gajos & Premios</h3>
              <p className="text-xs text-gray-500">
                Personaliza los textos, emojis, colores, tipo de premio y el porcentaje de probabilidad ponderado.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar Premio</span>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSaveItems}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{isPending ? 'Guardando...' : 'Guardar Premios'}</span>
              </button>
            </div>
          </div>

          {/* Lista de Premios */}
          <div className="space-y-3">
            {items.map((item, index) => {
              const probPercent = totalWeight > 0 
                ? Math.round(((parseInt(item.probability_weight) || 0) / totalWeight) * 100) 
                : 0

              return (
                <div 
                  key={index}
                  className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col md:flex-row md:items-center gap-3"
                >
                  {/* Emoji & Texto */}
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => setActiveEmojiIndex(index)}
                      title="Haz clic para elegir un ícono para este premio"
                      className="w-11 h-9 rounded-xl bg-white border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50/50 flex items-center justify-center text-lg shadow-2xs transition cursor-pointer shrink-0"
                    >
                      <span>{item.icon || '🎁'}</span>
                    </button>
                    <input 
                      type="text" 
                      value={item.label} 
                      onChange={(e) => updateItem(index, 'label', e.target.value)}
                      placeholder="Nombre del Premio (ej. Postre 2x1)"
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-900 font-bold shadow-2xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Selector de Color */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400">Color:</span>
                    <input 
                      type="color" 
                      value={item.bg_color || '#7C3AED'} 
                      onChange={(e) => updateItem(index, 'bg_color', e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                  </div>

                  {/* Tipo de Recompensa */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400">Tipo:</span>
                    <select
                      value={item.reward_type || 'discount'}
                      onChange={(e) => updateItem(index, 'reward_type', e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-2xs"
                    >
                      <option value="discount">🏷️ Descuento</option>
                      <option value="free_item">☕ Cortesía / Regalo</option>
                      <option value="stamp">⭐ Sello en Tarjeta</option>
                      <option value="custom">🎟️ Otro Beneficio</option>
                    </select>
                  </div>

                  {/* Stock Diario Máximo */}
                  <div className="flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-1 rounded-xl shadow-2xs">
                    <span className="text-[10px] text-gray-400 font-bold">Tope/Día:</span>
                    <input 
                      type="number" 
                      min="1" 
                      placeholder="∞"
                      value={item.max_daily_stock || ''} 
                      onChange={(e) => updateItem(index, 'max_daily_stock', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-10 text-xs font-mono font-bold text-gray-800 text-center focus:outline-none"
                    />
                  </div>

                  {/* Probabilidad Ponderada */}
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                    <span className="text-[10px] text-amber-800 font-bold">Probabilidad:</span>
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      value={item.probability_weight} 
                      onChange={(e) => updateItem(index, 'probability_weight', parseInt(e.target.value) || 1)}
                      className="w-10 text-xs font-mono font-black text-amber-900 text-center bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] font-black text-amber-700 bg-amber-200/80 px-1.5 py-0.5 rounded-md">
                      {probPercent}%
                    </span>
                  </div>

                  {/* Botón Eliminar */}
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Eliminar Premio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 font-medium">
            <span>🛡️ <b>Escudo Anti-Sobregiros:</b> Si fijas un Tope/Día (ej. 5 postres), el sistema dejará de entregarlo al alcanzar la meta diaria y repartirá los giros entre los demás premios.</span>
            <span className="font-mono font-black text-sm bg-amber-200 px-3 py-1 rounded-xl">
              Total: {totalWeight} pts (100%)
            </span>
          </div>
        </div>
      )}

      {/* PESTAÑA B: HORARIOS & DÍAS ESPECIALES */}
      {activeTab === 'schedule' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-gray-900">Programación de Calendario & Días Especiales</h3>
            <p className="text-xs text-gray-500">
              Decide si la ruleta funciona todos los días, solo días específicos (ej. Martes y Jueves) o en fechas especiales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            <label className={`p-4 rounded-2xl border-2 cursor-pointer transition space-y-1 ${
              scheduleMode === 'always' ? 'border-amber-500 bg-amber-50/50' : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <input 
                type="radio" 
                name="mode" 
                value="always" 
                checked={scheduleMode === 'always'} 
                onChange={() => setScheduleMode('always')}
                className="sr-only"
              />
              <p className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <span>🌟</span> Permanente (24/7)
              </p>
              <p className="text-[11px] text-gray-500">
                La ruleta está activa todos los días en cualquier visita.
              </p>
            </label>

            <label className={`p-4 rounded-2xl border-2 cursor-pointer transition space-y-1 ${
              scheduleMode === 'days_of_week' ? 'border-amber-500 bg-amber-50/50' : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <input 
                type="radio" 
                name="mode" 
                value="days_of_week" 
                checked={scheduleMode === 'days_of_week'} 
                onChange={() => setScheduleMode('days_of_week')}
                className="sr-only"
              />
              <p className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <span>📅</span> Días de la Semana
              </p>
              <p className="text-[11px] text-gray-500">
                Solo activa en días promocionales específicos (ej. Martes o Jueves).
              </p>
            </label>

            <label className={`p-4 rounded-2xl border-2 cursor-pointer transition space-y-1 ${
              scheduleMode === 'date_range' ? 'border-amber-500 bg-amber-50/50' : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <input 
                type="radio" 
                name="mode" 
                value="date_range" 
                checked={scheduleMode === 'date_range'} 
                onChange={() => setScheduleMode('date_range')}
                className="sr-only"
              />
              <p className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <span>🎉</span> Evento o Fechas Especiales
              </p>
              <p className="text-[11px] text-gray-500">
                Para semanas de aniversario, San Valentín o eventos puntuales.
              </p>
            </label>

          </div>

          {/* Días de la semana interactivos */}
          {scheduleMode === 'days_of_week' && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <label className="block text-xs font-bold text-gray-700">
                Selecciona los días en que la ruleta estará abierta:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'monday', label: 'Lunes' },
                  { key: 'tuesday', label: 'Martes' },
                  { key: 'wednesday', label: 'Miércoles' },
                  { key: 'thursday', label: 'Jueves' },
                  { key: 'friday', label: 'Viernes' },
                  { key: 'saturday', label: 'Sábado' },
                  { key: 'sunday', label: 'Domingo' }
                ].map(d => {
                  const isChecked = activeDays.includes(d.key)
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => toggleDay(d.key)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                        isChecked 
                          ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs' 
                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {isChecked ? '✓ ' : ''}{d.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Rango de Fechas */}
          {scheduleMode === 'date_range' && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha & Hora de Inicio:</label>
                <input 
                  type="datetime-local" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha & Hora de Fin:</label>
                <input 
                  type="datetime-local" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900"
                />
              </div>
            </div>
          )}

          {/* Mensaje de Pausa Personalizado */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Mensaje a mostrar cuando la ruleta esté en pausa o fuera de horario:
            </label>
            <input 
              type="text" 
              value={pausedMessage} 
              onChange={(e) => setPausedMessage(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? 'Guardando...' : 'Guardar Programación'}</span>
            </button>
          </div>
        </form>
      )}

      {/* PESTAÑA C: AJUSTES & PIN DE CAJERO */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-gray-900">Seguridad & Ajustes de Redención</h3>
            <p className="text-xs text-gray-500">
              Controla los límites de giros por cliente y el PIN de validación en caja.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tiempo de Espera entre Giros por Cliente (Cooldown):
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1" 
                  max="168"
                  value={cooldownHours} 
                  onChange={(e) => setCooldownHours(parseInt(e.target.value) || 24)}
                  className="w-24 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900"
                />
                <span className="text-xs text-gray-500">Horas (Recomendado: 24h = 1 giro por día)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                PIN de Mesero / Cajero para Canjear Cupones:
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="password" 
                  value={pinCode} 
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-28 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-center font-bold text-gray-900"
                />
                <span className="text-xs text-gray-500">PIN rápido para validar en mesa</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? 'Guardando...' : 'Guardar Ajustes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* PESTAÑA D: HISTORIAL DE CUPONES EMITIDOS */}
      {activeTab === 'history' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-gray-900">Historial de Cupones Emitidos</h3>
              <p className="text-xs text-gray-500">
                Auditoría en tiempo real de los premios ganados y estado de canje en caja.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-gray-500">
              {spins.length} registros
            </span>
          </div>

          {spins.length === 0 ? (
            <div className="text-center py-10 text-gray-400 space-y-2">
              <Disc className="w-10 h-10 mx-auto text-gray-300 animate-spin" />
              <p className="text-xs font-bold">Aún no se han registrado giros.</p>
              <p className="text-[11px]">Comparte tu enlace o coloca el código QR en tus mesas para comenzar a premiar a tus clientes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-[10px] uppercase font-bold text-gray-400">
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3">WhatsApp</th>
                    <th className="py-2.5 px-3">Premio Ganado</th>
                    <th className="py-2.5 px-3">Fecha & Hora</th>
                    <th className="py-2.5 px-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {spins.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="py-3 px-3 font-mono font-black text-amber-700">
                        {s.coupon_code}
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-900">
                        {s.customer_name}
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-600">
                        {s.customer_phone}
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-800">
                        <span className="inline-flex items-center gap-1.5">
                          <span>{s.prize_wheel_items?.icon || '🎁'}</span>
                          <span>{s.prize_wheel_items?.label || 'Premio'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500 text-[11px]">
                        {new Date(s.created_at).toLocaleString('es-ES', { 
                          day: '2-digit', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {s.status === 'redeemed' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ Canjeado
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                            ⏱️ Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL SELECTOR VISUAL DE EMOJIS / ÍCONOS */}
      {activeEmojiIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <div>
                  <h3 className="text-sm font-black text-gray-900">Seleccionar Ícono para el Premio</h3>
                  <p className="text-[11px] text-gray-500">
                    Premio: <b>{items[activeEmojiIndex]?.label || 'Premio'}</b>
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveEmojiIndex(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Categorías de Emojis */}
            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {EMOJI_CATEGORIES.map((cat, cIdx) => (
                <div key={cIdx} className="space-y-1.5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                    {cat.name}
                  </p>
                  <div className="grid grid-cols-6 gap-2">
                    {cat.emojis.map((em, eIdx) => (
                      <button
                        key={eIdx}
                        type="button"
                        onClick={() => selectEmoji(em)}
                        className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition cursor-pointer border ${
                          items[activeEmojiIndex]?.icon === em
                            ? 'bg-amber-100 border-amber-500 scale-105 shadow-xs'
                            : 'bg-gray-50 border-gray-200 hover:bg-amber-50 hover:border-amber-300 hover:scale-105'
                        }`}
                      >
                        <span>{em}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Input personalizado manual */}
            <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
              <span className="text-[11px] text-gray-500 font-bold whitespace-nowrap">O escribe uno:</span>
              <input 
                type="text" 
                maxLength={4}
                placeholder="Ej. 🎁 o ☕"
                value={items[activeEmojiIndex]?.icon || ''}
                onChange={(e) => updateItem(activeEmojiIndex, 'icon', e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-center font-bold text-gray-900 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setActiveEmojiIndex(null)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
