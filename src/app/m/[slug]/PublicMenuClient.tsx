'use client'

import { useState, useEffect } from 'react'
import { 
  Image as ImageIcon, 
  Flame, 
  Leaf, 
  WheatOff, 
  Minus, 
  Plus, 
  ShoppingBag, 
  MessageCircle, 
  Clock, 
  Sparkles, 
  Calendar, 
  Scissors, 
  Stethoscope, 
  CheckCircle2,
  MapPin,
  UtensilsCrossed,
  User,
  FileText,
  ChevronRight,
  Gift,
  X,
  Maximize2,
  Filter
} from 'lucide-react'
import { ThemeConfig } from '@/lib/themes'
import RestaurantGamificationModal from './RestaurantGamificationModal'
import DishLightboxModal from './DishLightboxModal'
import { resolveCategorySchedule, isScheduleActiveNow, formatTime24To12 } from '@/lib/menuSchedule'

type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  price_type?: 'fixed' | 'starting_at' | 'consultation'
  duration_minutes?: string
  image_url: string
  is_available: boolean
  is_featured: boolean
  allergens: string[]
}

type Category = {
  id: string
  name: string
  menu_items: MenuItem[]
}

type CartItem = {
  item: MenuItem
  quantity: number
}

export default function PublicMenuClient({ 
  menu, 
  categories,
  theme,
  initialTable = '',
  wheel,
  reviewDevice
}: { 
  menu: any, 
  categories: Category[],
  theme?: ThemeConfig,
  initialTable?: string,
  wheel?: any,
  reviewDevice?: any
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [tableNumber, setTableNumber] = useState<string>(initialTable)
  const [orderType, setOrderType] = useState<'table' | 'takeout' | 'delivery'>(
    initialTable ? 'table' : 'table'
  )
  const [customerName, setCustomerName] = useState<string>('')
  const [orderNotes, setOrderNotes] = useState<string>('')

  // Estado del juego de Ruleta / Raspa y Gana y Cupón de Mesa
  const [isGamificationOpen, setIsGamificationOpen] = useState(false)
  const [activeCoupon, setActiveCoupon] = useState<{ label: string; code: string } | null>(null)
  const [placedOrder, setPlacedOrder] = useState<{ dailyOrderNumber: number; total: number; table: string; timestamp: string } | null>(null)

  const hasActiveWheel = wheel?.is_active && Array.isArray(wheel.prize_wheel_items) && wheel.prize_wheel_items.length > 0

  // Estado de Navegación por Categorías, Filtros Inteligentes y Lightbox
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  // Modo de visualización: 'active_shift' (Turno Activo primordial) o 'all' (Todo el Menú)
  const [viewMode, setViewMode] = useState<'active_shift' | 'all'>('active_shift')
  const [previewDish, setPreviewDish] = useState<MenuItem | null>(null)
  const [currentMinutes, setCurrentMinutes] = useState<number>(() => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  })

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes())
    }
    updateTime()
    const timer = setInterval(updateTime, 60000)
    return () => clearInterval(timer)
  }, [])

  const storedSchedules = menu.catalog_settings?.category_schedules || {}

  const businessType = menu.business_type || 'restaurant'
  const isRestaurant = businessType === 'restaurant'
  const isSalon = businessType === 'salon'
  const isDental = businessType === 'dental'

  const cardRadiusClass = theme?.border_style === 'square' 
    ? 'rounded-none' 
    : theme?.border_style === 'pill' 
    ? 'rounded-3xl' 
    : 'rounded-2xl'

  const btnRadiusClass = theme?.border_style === 'square' 
    ? 'rounded-none' 
    : theme?.border_style === 'pill' 
    ? 'rounded-full' 
    : 'rounded-xl'

  const primaryColor = theme?.primary_color || '#B45309'
  const cardBg = theme?.card_bg || '#FFFFFF'
  const textColor = theme?.text_color || '#292524'
  const currencySymbol = menu.currency || 'L.'

  // Verificar Plato del Día (Auto-expira si la fecha no es hoy)
  const todayStr = new Date().toISOString().slice(0, 10)
  const dailySpecial = menu.daily_special
  const hasValidDailySpecial = Boolean(dailySpecial?.is_active && dailySpecial?.date === todayStr)

  // Configuración de Horario del Plato del Día (por defecto Almuerzos: 10:30 AM a 3:30 PM)
  const dailySpecialSchedule = {
    type: (dailySpecial?.schedule_type || 'lunch') as 'all_day' | 'breakfast' | 'lunch' | 'dinner' | 'custom',
    start_time: dailySpecial?.schedule_start || '10:30',
    end_time: dailySpecial?.schedule_end || '15:30',
    label: dailySpecial?.schedule_label || 'Almuerzos (10:30 AM - 3:30 PM)'
  }
  const isDailySpecialActiveNow = isScheduleActiveNow(dailySpecialSchedule, currentMinutes)

  // Categorías que pertenecen al turno activo según la hora actual
  const activeShiftCategories = categories.filter(c => {
    const s = resolveCategorySchedule(c.id, c.name, storedSchedules)
    return s.type !== 'all_day' && isScheduleActiveNow(s, currentMinutes)
  })

  // Detección del nombre y horario del turno activo
  const activeShiftName = activeShiftCategories[0]?.name || (
    currentMinutes >= 420 && currentMinutes < 630 ? 'Desayunos' :
    currentMinutes >= 630 && currentMinutes < 930 ? 'Almuerzos' :
    currentMinutes >= 1080 && currentMinutes < 1380 ? 'Cenas' : 'Turno Activo'
  )

  const activeShiftSchedule = activeShiftCategories[0] 
    ? resolveCategorySchedule(activeShiftCategories[0].id, activeShiftCategories[0].name, storedSchedules)
    : null

  const activeShiftHours = activeShiftSchedule 
    ? `${formatTime24To12(activeShiftSchedule.start_time)} - ${formatTime24To12(activeShiftSchedule.end_time)}`
    : (
      currentMinutes >= 420 && currentMinutes < 630 ? '7:00 AM - 10:30 AM' :
      currentMinutes >= 630 && currentMinutes < 930 ? '10:30 AM - 3:30 PM' :
      currentMinutes >= 1080 && currentMinutes < 1380 ? '6:00 PM - 11:00 PM' : ''
    )
  
  // Platos especiales únicos de hoy (pueden ser 1 o varias opciones)
  const dailySpecialItems: MenuItem[] = hasValidDailySpecial
    ? (Array.isArray(dailySpecial.items) && dailySpecial.items.length > 0
        ? dailySpecial.items.map((it: any) => ({
            id: it.id || 'daily_special',
            name: it.name || it.title || 'Plato del Día',
            description: it.description || '',
            price: Number(it.price) || 0,
            image_url: it.image_url || '',
            is_available: true,
            is_featured: true,
            allergens: []
          }))
        : (dailySpecial.name || dailySpecial.title)
        ? [{
            id: 'daily_special_1',
            name: dailySpecial.name || dailySpecial.title,
            description: dailySpecial.description || '',
            price: Number(dailySpecial.price) || 0,
            image_url: dailySpecial.image_url || '',
            is_available: true,
            is_featured: true,
            allergens: []
          }]
        : []
      )
    : []

  const featuredItemsCount = categories.reduce((acc, c) => 
    acc + (c.menu_items || []).filter(item => item.is_featured).length, 0
  )

  const activeAndAllDayCategories = categories.filter(c => {
    const s = resolveCategorySchedule(c.id, c.name, storedSchedules)
    return s.type === 'all_day' || isScheduleActiveNow(s, currentMinutes)
  })

  const pillCategories = (isRestaurant && viewMode === 'active_shift' && activeShiftCategories.length > 0)
    ? activeAndAllDayCategories
    : categories

  const currentViewTotalDishes = (isRestaurant && viewMode === 'active_shift' && activeShiftCategories.length > 0)
    ? activeAndAllDayCategories.reduce((a, c) => a + (c.menu_items?.length || 0), 0)
    : categories.reduce((a, c) => a + (c.menu_items?.length || 0), 0)

  const addToCart = (item: MenuItem) => {
    if (!item.is_available) return
    setCart(prev => {
      const existing = prev.find(p => p.item.id === item.id)
      if (existing) {
        return prev.map(p => p.item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p)
      }
      return [...prev, { item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(p => p.item.id === itemId)
      if (existing && existing.quantity > 1) {
        return prev.map(p => p.item.id === itemId ? { ...p, quantity: p.quantity - 1 } : p)
      }
      return prev.filter(p => p.item.id !== itemId)
    })
  }

  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0)
  const totalPrice = cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0)

  // Reserva individual para Salones y Clínicas
  const handleSingleServiceBooking = (item: MenuItem) => {
    if (!menu.whatsapp_number) return
    const cleanPhone = menu.whatsapp_number.replace(/\D/g, '')

    let text = ''
    if (isSalon) {
      text = `¡Hola *${menu.name}*! Me gustaría agendar una cita para:%0A%0A✂️ *Servicio:* ${item.name}%0A💰 *Precio:* ${currencySymbol} ${item.price.toFixed(2)}${item.duration_minutes ? `%0A⏱️ *Duración estimada:* ${item.duration_minutes}` : ''}%0A%0A¿Qué horarios tienen disponibles para hoy o mañana?`
    } else if (isDental) {
      text = `¡Hola *${menu.name}*! Me interesa solicitar una cita de valoración médica para el tratamiento:%0A%0A🦷 *Tratamiento:* ${item.name}%0A💰 *Tarifa:* ${item.price_type === 'starting_at' ? 'Desde ' : ''}${currencySymbol} ${item.price.toFixed(2)}%0A%0A¿Podrían indicarme los horarios disponibles para consulta?`
    } else {
      text = `¡Hola *${menu.name}*! Me interesa consultar información sobre *${item.name}* (${currencySymbol} ${item.price.toFixed(2)}).`
    }

    const url = `https://wa.me/${cleanPhone}?text=${text}`
    window.open(url, '_blank')
  }

  // Pedido estructurado con COMANDERA Y MESA para Restaurantes
  const sendWhatsAppOrder = () => {
    if (!menu.whatsapp_number) return
    const cleanPhone = menu.whatsapp_number.replace(/\D/g, '')

    const currencySymbol = menu.currency === 'HNL' ? 'L. ' : menu.currency === 'EUR' ? '€' : menu.currency === 'MXN' ? 'MX$' : menu.currency === 'GTQ' ? 'Q ' : '$'

    const locationHeader = orderType === 'table'
      ? tableNumber 
        ? (tableNumber.toLowerCase().startsWith('mesa') || tableNumber.toLowerCase().startsWith('barra') || tableNumber.toLowerCase().startsWith('terraza') || tableNumber.toLowerCase().startsWith('patio'))
          ? `📍 *UBICACIÓN:* ${tableNumber}`
          : `📍 *MESA:* #${tableNumber}`
        : '📍 *UBICACIÓN:* En el local'
      : orderType === 'takeout'
      ? '📦 *TIPO:* Para Llevar / Takeout'
      : '🛵 *TIPO:* A Domicilio / Delivery'

    let text = `===============================%0A`
    text += `🍽️ *NUEVO PEDIDO DIGITAL - ${menu.name.toUpperCase()}*%0A`
    text += `${locationHeader}%0A`
    if (customerName.trim()) {
      text += `👤 *Cliente:* ${customerName.trim()}%0A`
    }
    text += `===============================%0A%0A`

    text += `*DETALLE DE LA ORDEN:*%0A`
    cart.forEach(c => {
      text += `• ${c.quantity}x ${c.item.name} — ${currencySymbol}${(c.item.price * c.quantity).toFixed(2)}%0A`
    })

    if (orderNotes.trim()) {
      text += `%0A📝 *Notas / Instrucciones:* ${orderNotes.trim()}%0A`
    }

    if (activeCoupon?.label) {
      text += `%0A🎁 *CUPÓN DE PREMIO CANJEADO:*%0A`
      text += `• Beneficio: ${activeCoupon.label}%0A`
      text += `• Código Único: ${activeCoupon.code}%0A`
    }

    text += `%0A-------------------------------%0A`
    text += `💰 *TOTAL A PAGAR: ${currencySymbol}${totalPrice.toFixed(2)}*%0A`
    text += `⏰ *Hora:* ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}%0A`
    text += `===============================%0A`
    text += `¿Podrían confirmarme la recepción y tiempo estimado? ¡Muchas gracias!`

    // Registrar comanda en la base de datos en paralelo
    try {
      fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_id: menu.id,
          table_number: tableNumber || 'Mesa',
          order_type: orderType,
          customer_name: customerName,
          items: cart,
          subtotal: totalPrice,
          total_amount: totalPrice,
          applied_coupon_code: activeCoupon?.code,
          applied_coupon_label: activeCoupon?.label,
          notes: orderNotes
        })
      }).then(res => res.json()).then(data => {
        if (data.dailyOrderNumber) {
          setPlacedOrder({
            dailyOrderNumber: data.dailyOrderNumber,
            total: totalPrice,
            table: tableNumber || 'Mesa',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          setIsCartOpen(false)
          setCart([])
        }
      }).catch(err => console.error('Silent order save error:', err))
    } catch {
      // Ignorar fallos de red silenciosos
    }

    const url = `https://wa.me/${cleanPhone}?text=${text}`
    window.open(url, '_blank')
  }

  return (
    <div className="pb-28">
      <main className="max-w-3xl mx-auto px-4 mt-4 space-y-6">

        {/* TICKET DE COMANDA ENVIADA CON ÉXITO */}
        {placedOrder && (
          <div className="bg-emerald-500/10 border-2 border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                #{placedOrder.dailyOrderNumber}
              </span>
              <div>
                <p className="font-extrabold text-sm text-emerald-950 flex items-center gap-1.5">
                  <span>¡Comanda Recibida en Cocina!</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                </p>
                <p className="text-[11px] text-emerald-800 opacity-90 mt-0.5">
                  {placedOrder.table} • En preparación ({placedOrder.timestamp})
                </p>
              </div>
            </div>
            <button
              onClick={() => setPlacedOrder(null)}
              className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* BANNER INTERACTIVO: RULETA / TARJETA RASPABLE DE PREMIOS */}
        {hasActiveWheel && (
          <button
            type="button"
            onClick={() => setIsGamificationOpen(true)}
            className="w-full relative overflow-hidden p-3.5 sm:p-4 rounded-2xl bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200 cursor-pointer text-left border border-amber-300/40 group select-none"
          >
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shrink-0 group-hover:rotate-12 transition-transform shadow-xs">
                  🎁
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm sm:text-base leading-tight">
                      {activeCoupon?.label ? '¡Tienes un Cupón Activo en tu Mesa!' : '¡Raspa o Gira y Gana tu Beneficio de Hoy!'}
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-200 fill-current animate-pulse" />
                  </div>
                  <p className="text-[11px] text-amber-100 opacity-95 mt-0.5">
                    {activeCoupon?.label 
                      ? `Beneficio: ${activeCoupon.label} (${activeCoupon.code}) • Toca para ver cupón y reseña` 
                      : 'Postres de cortesía, descuentos y bebidas para tu orden • Toca para jugar'}
                  </p>
                </div>
              </div>
              <div className="bg-white/20 text-white font-black text-xs px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1 group-hover:bg-white group-hover:text-amber-700 transition">
                <span>{activeCoupon?.label ? 'Ver' : 'Jugar'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        )}
        
        {/* BANNER DE MESA (Si se escaneó desde una mesa con QR) */}
        {tableNumber ? (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0">
                #{tableNumber}
              </span>
              <div>
                <p className="font-bold text-gray-900">Estás en la Mesa #{tableNumber}</p>
                <p className="text-[11px] opacity-75">Tus pedidos llegarán directo a esta mesa.</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-xs font-bold text-amber-700 underline shrink-0 cursor-pointer"
            >
              Cambiar
            </button>
          </div>
        ) : null}

        {/* SELECTOR HERO DESTACADO: TURNO ACTIVO vs TODO EL MENÚ */}
        {isRestaurant && categories.length > 0 && (
          <div className="bg-white rounded-2xl p-3 sm:p-4 border-2 border-amber-500/25 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-950">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>¿Qué deseas ordenar hoy?</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Hora: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setViewMode('active_shift')
                  setSelectedCategory('all')
                }}
                className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                  viewMode === 'active_shift'
                    ? 'bg-amber-600 text-white shadow-md scale-[1.01]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-200/70'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${viewMode === 'active_shift' ? 'bg-white animate-pulse' : 'bg-emerald-500'}`} />
                <span className="truncate">
                  {activeShiftCategories.length > 0 
                    ? `🟢 Turno: ${activeShiftName}` 
                    : '🟢 Turno Activo'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('all')
                  setSelectedCategory('all')
                }}
                className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                  viewMode === 'all'
                    ? 'bg-black text-white shadow-md scale-[1.01]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-200/70'
                }`}
              >
                <span>👁️ Ver Todo el Menú</span>
              </button>
            </div>

            {/* Subtítulo explicativo contextual con botón de acción directa */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5 pt-0.5 px-1">
              {viewMode === 'active_shift' ? (
                <div className="flex items-center gap-1.5 text-gray-600 truncate">
                  <span>🍽️ Mostrando platos de <strong>{activeShiftName}</strong> {activeShiftHours && `(${activeShiftHours})`} y bebidas.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-gray-600 truncate">
                  <span>📖 Mostrando la carta completa de todos los turnos y horarios.</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setViewMode(viewMode === 'active_shift' ? 'all' : 'active_shift')
                  setSelectedCategory('all')
                }}
                className="text-amber-800 font-black underline hover:text-amber-950 text-[11px] cursor-pointer self-start sm:self-auto shrink-0"
              >
                {viewMode === 'active_shift' ? '¿Quieres ver otros horarios? Ver todo el menú' : '← Volver al turno activo ahora'}
              </button>
            </div>
          </div>
        )}

        {/* BARRA HORIZONTAL DE FILTROS POR CATEGORÍA & HORARIO INTELIGENTE */}
        {categories.length > 0 && (
          <div className="sticky top-2 z-30 space-y-2 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-md border border-black/5">
            {/* Píldoras Horizontales de Categorías Deslizables */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
              {/* Píldora de Plato del Día Único si está activo hoy en este turno o en vista general */}
              {dailySpecialItems.length > 0 && (viewMode === 'all' || isDailySpecialActiveNow) && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('daily_special')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer border ${
                    selectedCategory === 'daily_special'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-black'
                      : 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
                  }`}
                  style={selectedCategory === 'daily_special' ? { backgroundColor: primaryColor } : undefined}
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current text-amber-400" />
                  <span>Plato del Día ⭐</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === 'daily_special' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {dailySpecialItems.length}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === 'all'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-black/5 text-gray-700 hover:bg-black/10'
                }`}
              >
                <span>{isRestaurant && viewMode === 'active_shift' ? `✨ ${activeShiftName}` : '✨ Todo el Menú'}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-black/10 text-gray-700'
                }`}>
                  {currentViewTotalDishes}
                </span>
              </button>

              {pillCategories.map((c) => {
                const schedule = resolveCategorySchedule(c.id, c.name, storedSchedules)
                const isSelected = selectedCategory === c.id
                const isActive = isScheduleActiveNow(schedule, currentMinutes)

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'text-white shadow-xs border-transparent'
                        : 'bg-black/5 text-gray-700 border-black/5 hover:bg-black/10'
                    }`}
                    style={isSelected ? { backgroundColor: primaryColor } : undefined}
                  >
                    <span>
                      {schedule.type === 'breakfast' ? '🍳' : schedule.type === 'lunch' ? '🍲' : schedule.type === 'dinner' ? '🌙' : '🍽️'}
                    </span>
                    <span>{c.name}</span>
                    <span className="opacity-70 text-[10px]">
                      ({c.menu_items?.length || 0})
                    </span>
                    {!isScheduleActiveNow(schedule, currentMinutes) && schedule.type !== 'all_day' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Fuera de turno actual" />
                    )}
                  </button>
                )
              })}

              {/* Botón rápido para alternar a ver todo el menú si está en turno activo */}
              {isRestaurant && viewMode === 'active_shift' && activeShiftCategories.length > 0 && categories.length > activeAndAllDayCategories.length && (
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('all')
                    setSelectedCategory('all')
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 shrink-0"
                >
                  <span>👁️ + Ver otros turnos</span>
                </button>
              )}

              {/* Píldora de Recomendados del Chef si hay */}
              {featuredItemsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('featured')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer border ${
                    selectedCategory === 'featured'
                      ? 'text-white shadow-xs border-transparent'
                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  }`}
                  style={selectedCategory === 'featured' ? { backgroundColor: primaryColor } : undefined}
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current text-amber-400" />
                  <span>Recomendados</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === 'featured' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {featuredItemsCount}
                  </span>
                </button>
              )}
            </div>

            {/* Barra de Turno Activo sincronizada con el Switcher */}
            {isRestaurant && (
              <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-600 font-medium truncate">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">
                    {viewMode === 'active_shift'
                      ? `Turno actual: ${activeShiftName} ${activeShiftHours ? `(${activeShiftHours})` : ''}`
                      : 'Viendo todo el menú • Todos los horarios disponibles'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode(viewMode === 'active_shift' ? 'all' : 'active_shift')
                    setSelectedCategory('all')
                  }}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer shrink-0 border ${
                    viewMode === 'active_shift'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {viewMode === 'active_shift' ? '🟢 Turno activo' : '👁️ Todo el menú'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN PROPIA Y DEDICADA: 🌟 PLATO DEL DÍA (EXCLUSIVO DE HOY) */}
        {dailySpecialItems.length > 0 && 
          (selectedCategory === 'all' || selectedCategory === 'daily_special') &&
          (viewMode === 'all' || isDailySpecialActiveNow || selectedCategory === 'daily_special') && (
          <section className="animate-in fade-in slide-in-from-top-3 duration-300 space-y-3">
            <div className="flex items-center justify-between border-b border-black/10 pb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm font-black shadow-xs">
                  🌟
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight" style={{ color: textColor }}>
                    Plato del Día
                  </h2>
                  <p className="text-[11px] opacity-75">
                    Preparación fresca y única de hoy • No se repite en la semana
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span 
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-xs ${
                    isDailySpecialActiveNow 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-amber-100 text-amber-950 border border-amber-300'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>
                    {isDailySpecialActiveNow 
                      ? `🟢 Sirviendo ahora (${dailySpecialSchedule.label})` 
                      : `⏰ ${dailySpecialSchedule.label}`}
                  </span>
                </span>
              </div>
            </div>

            <div className={`grid gap-4 ${dailySpecialItems.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {dailySpecialItems.map((dish) => (
                <article 
                  key={dish.id}
                  className={`p-4 sm:p-5 border-2 transition-all flex gap-4 items-center justify-between shadow-md hover:shadow-lg ${cardRadiusClass}`}
                  style={{ 
                    backgroundColor: cardBg,
                    borderColor: `${primaryColor}60`,
                    color: textColor
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <div className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-400/40">
                        ⭐ Especial del Día
                      </div>
                      <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isDailySpecialActiveNow 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        <Clock className="w-2.5 h-2.5 text-amber-600" />
                        <span>{dailySpecialSchedule.label}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-black text-base sm:text-lg leading-tight mb-0.5" style={{ color: textColor }}>
                        {dish.name}
                      </h3>
                      <span className="font-black text-lg shrink-0" style={{ color: primaryColor }}>
                        {currencySymbol} {dish.price}
                      </span>
                    </div>

                    {dish.description && (
                      <p className="text-xs sm:text-sm opacity-80 mt-1 line-clamp-3 leading-relaxed">
                        {dish.description}
                      </p>
                    )}

                    <div className="mt-3.5">
                      {menu.whatsapp_number ? (
                        <button
                          onClick={() => addToCart({
                            id: dish.id,
                            name: `⭐ ${dish.name} (Plato del Día)`,
                            description: dish.description,
                            price: Number(dish.price) || 0,
                            image_url: dish.image_url || '',
                            is_available: true,
                            is_featured: true,
                            allergens: []
                          })}
                          style={{ backgroundColor: primaryColor }}
                          className={`text-xs sm:text-sm font-bold text-white px-4 py-2 hover:opacity-90 transition cursor-pointer shadow-sm flex items-center gap-1.5 ${btnRadiusClass}`}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Pedir Plato del Día</span>
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {dish.image_url && (
                    <div 
                      onClick={() => setPreviewDish(dish)}
                      className={`w-24 h-24 sm:w-28 sm:h-28 bg-black/5 flex items-center justify-center shrink-0 overflow-hidden border border-black/5 cursor-pointer hover:opacity-95 ${cardRadiusClass}`}
                    >
                      <img 
                        src={dish.image_url} 
                        alt={dish.name} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* CATÁLOGO DE CATEGORÍAS E ÍTEMS */}
        {categories.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <p className="text-sm font-semibold">El catálogo está en preparación...</p>
          </div>
        ) : (
          categories
            .filter((category) => {
              if (selectedCategory === 'daily_special') {
                return false
              }
              if (selectedCategory === 'featured') {
                return (category.menu_items || []).some(item => item.is_featured)
              }
              if (selectedCategory !== 'all' && category.id !== selectedCategory) {
                return false
              }
              if (isRestaurant && viewMode === 'active_shift') {
                const schedule = resolveCategorySchedule(category.id, category.name, storedSchedules)
                const isActive = isScheduleActiveNow(schedule, currentMinutes)
                // Si hay categorías que son del turno activo, mostrar solo las activas o las de todo el día (bebidas, entradas)
                if (activeShiftCategories.length > 0) {
                  return isActive || schedule.type === 'all_day'
                }
                return true
              }
              return true
            })
            .map((category) => {
              const displayItems = selectedCategory === 'featured'
                ? (category.menu_items || []).filter(item => item.is_featured)
                : (category.menu_items || [])

              if (!displayItems || displayItems.length === 0) return null

              const schedule = resolveCategorySchedule(category.id, category.name, storedSchedules)
              const isActive = isScheduleActiveNow(schedule, currentMinutes)
              const isAllDay = schedule.type === 'all_day'

              return (
                <section key={category.id} className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-black/5 pb-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-extrabold tracking-tight" style={{ color: textColor }}>
                        {selectedCategory === 'featured' ? `⭐ Platos del Día (${category.name})` : category.name}
                      </h2>
                      <span className="text-xs opacity-50 font-bold">({displayItems.length})</span>
                    </div>

                    {/* Insignia de Horario */}
                    {!isAllDay && selectedCategory !== 'featured' && (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full self-start sm:self-auto border ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {isActive
                          ? `🟢 Sirviendo ahora (${formatTime24To12(schedule.start_time)} - ${formatTime24To12(schedule.end_time)})`
                          : `⏰ Horario: ${formatTime24To12(schedule.start_time)} a ${formatTime24To12(schedule.end_time)}`}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {displayItems.map((item) => {
                      const inCart = cart.find(c => c.item.id === item.id)
                      const quantity = inCart?.quantity || 0

                      return (
                        <article 
                          key={item.id}
                          className={`p-4 sm:p-5 border transition-all flex gap-4 items-center justify-between shadow-xs hover:shadow-md ${cardRadiusClass}`}
                          style={{ 
                            backgroundColor: cardBg,
                            borderColor: item.is_featured ? `${primaryColor}40` : 'rgba(0,0,0,0.06)',
                            color: textColor
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            {item.is_featured && (
                              <div className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 border border-yellow-400/40">
                                ⭐ {isSalon ? 'Servicio Estrella' : isDental ? 'Tratamiento Recomendado' : 'Recomendación del Chef'}
                              </div>
                            )}
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-bold text-base sm:text-lg leading-tight mb-0.5" style={{ color: textColor }}>
                                {item.name}
                              </h3>
                              <span className="font-extrabold text-base shrink-0" style={{ color: primaryColor }}>
                                {item.price_type === 'starting_at' ? 'Desde ' : item.price_type === 'consultation' ? 'Valoración ' : ''}{currencySymbol} {item.price}
                              </span>
                            </div>

                            {/* Duración (para Salones y Clínicas) */}
                            {item.duration_minutes && (
                              <p className="text-xs font-semibold flex items-center gap-1 mt-0.5 opacity-80" style={{ color: primaryColor }}>
                                <Clock className="w-3.5 h-3.5" /> {item.duration_minutes}
                              </p>
                            )}
                            
                            {item.description && (
                              <p className="text-xs sm:text-sm opacity-70 mt-1 line-clamp-3 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            {/* Alérgenos (para Restaurantes) */}
                            {isRestaurant && item.allergens?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {item.allergens.includes('vegan') && <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded uppercase"><Leaf className="w-3 h-3"/> Vegano</span>}
                                {item.allergens.includes('spicy') && <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded uppercase"><Flame className="w-3 h-3"/> Picante</span>}
                                {item.allergens.includes('gluten_free') && <span className="flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded uppercase"><WheatOff className="w-3 h-3"/> Sin Gluten</span>}
                              </div>
                            )}

                            {/* Botón de Acción Adaptativo por Industria */}
                            <div className="mt-3.5">
                              {!item.is_available ? (
                                <span className="inline-block text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                  No disponible
                                </span>
                              ) : isSalon || isDental ? (
                                <button
                                  onClick={() => handleSingleServiceBooking(item)}
                                  style={{ backgroundColor: primaryColor }}
                                  className={`text-xs sm:text-sm font-bold text-white px-4 py-2 hover:opacity-90 transition cursor-pointer shadow-xs inline-flex items-center gap-1.5 ${btnRadiusClass}`}
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  {isSalon ? 'Reservar Turno' : 'Agendar Consulta'}
                                </button>
                              ) : menu.whatsapp_number ? (
                                quantity === 0 ? (
                                  <button 
                                    onClick={() => addToCart(item)}
                                    style={{ backgroundColor: primaryColor }}
                                    className={`text-xs sm:text-sm font-bold text-white px-4 py-2 hover:opacity-90 transition cursor-pointer shadow-xs ${btnRadiusClass}`}
                                  >
                                    + Agregar al Pedido
                                  </button>
                                ) : (
                                  <div className={`inline-flex items-center bg-black/5 p-1 ${btnRadiusClass}`}>
                                    <button onClick={() => removeFromCart(item.id)} className="p-1 text-gray-600 hover:text-black rounded-lg transition cursor-pointer"><Minus className="w-4 h-4"/></button>
                                    <span className="px-3 font-bold text-xs sm:text-sm min-w-[2rem] text-center">{quantity}</span>
                                    <button onClick={() => addToCart(item)} className="p-1 text-gray-600 hover:text-black rounded-lg transition cursor-pointer"><Plus className="w-4 h-4"/></button>
                                  </div>
                                )
                              ) : null}
                            </div>
                          </div>

                          {/* Imagen del Ítem / Servicio con Lightbox Modal al hacer clic */}
                          <div 
                            onClick={() => item.image_url ? setPreviewDish(item) : null}
                            className={`w-24 h-24 sm:w-28 sm:h-28 bg-black/5 flex items-center justify-center shrink-0 overflow-hidden border border-black/5 ${cardRadiusClass} ${
                              item.image_url ? 'cursor-pointer hover:opacity-95 relative group/img' : ''
                            }`}
                            title={item.image_url ? 'Toca para ver foto en grande' : undefined}
                          >
                            {item.image_url ? (
                              <>
                                <img 
                                  src={item.image_url} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover/img:scale-105" 
                                  loading="lazy" 
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <span className="p-1.5 rounded-full bg-black/60 text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                    <Maximize2 className="w-3 h-3" />
                                    <span>Ver</span>
                                  </span>
                                </div>
                              </>
                            ) : (
                              <ImageIcon className="w-8 h-8 text-gray-400 opacity-50" />
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              )
            })
        )}

        {/* BANNER INFORMATIVO AL FINAL DE LA LISTA EN MODO TURNO ACTIVO */}
        {isRestaurant && viewMode === 'active_shift' && activeShiftCategories.length > 0 && categories.length > activeAndAllDayCategories.length && (
          <div className="mt-8 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-2xs">
            <div>
              <p className="font-extrabold text-sm text-amber-950 flex items-center justify-center sm:justify-start gap-1.5">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>¿Deseas consultar platillos de otros horarios o turnos?</span>
              </p>
              <p className="text-xs text-amber-900/75 mt-0.5">
                Ahora estás viendo los platos del turno de <strong>{activeShiftName}</strong> {activeShiftHours && `(${activeShiftHours})`} y bebidas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setViewMode('all')
                setSelectedCategory('all')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="bg-amber-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-amber-950 transition cursor-pointer shrink-0 shadow-xs whitespace-nowrap"
            >
              👁️ Ver Todo el Menú Completo
            </button>
          </div>
        )}
      </main>

      {/* Modal Lightbox de Foto Ampliada */}
      <DishLightboxModal
        isOpen={Boolean(previewDish)}
        item={previewDish}
        onClose={() => setPreviewDish(null)}
        currencySymbol={currencySymbol}
        primaryColor={primaryColor}
        btnRadiusClass={btnRadiusClass}
        cardRadiusClass={cardRadiusClass}
        textColor={textColor}
        cardBg={cardBg}
        quantity={previewDish ? (cart.find(c => c.item.id === previewDish.id)?.quantity || 0) : 0}
        onAddToCart={() => previewDish && addToCart(previewDish)}
        onRemoveFromCart={() => previewDish && removeFromCart(previewDish.id)}
        isRestaurant={isRestaurant}
        hasWhatsApp={Boolean(menu.whatsapp_number)}
        onSingleBooking={
          isSalon || isDental 
            ? () => previewDish && handleSingleServiceBooking(previewDish) 
            : undefined
        }
      />

      {/* Botón Flotante del Carrito (Restaurantes con varios ítems) */}
      {isRestaurant && menu.whatsapp_number && totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-40 max-w-3xl mx-auto pointer-events-none">
          <div 
            className="pointer-events-auto text-white rounded-2xl shadow-2xl p-2.5 flex items-center justify-between border border-white/10"
            style={{ backgroundColor: '#0F172A' }}
          >
            <div className="flex flex-col pl-3">
              <span className="text-xs font-medium text-gray-400">
                {tableNumber ? `Mesa #${tableNumber} • ` : ''}{totalItems} {totalItems === 1 ? 'producto' : 'productos'}
              </span>
              <span className="font-extrabold text-base sm:text-lg">{currencySymbol} {totalPrice.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              style={{ backgroundColor: primaryColor }}
              className={`text-white font-bold px-5 py-2.5 text-xs sm:text-sm flex items-center gap-2 hover:opacity-90 transition cursor-pointer shadow-md ${btnRadiusClass}`}
            >
              <ShoppingBag className="w-4 h-4" /> Ver Mi Pedido
            </button>
          </div>
        </div>
      )}

      {/* Modal / Comandera del Carrito */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right"
            style={{ 
              backgroundColor: cardBg,
              color: textColor
            }}
          >
            {/* Cabecera del Pedido */}
            <div className="p-5 border-b border-black/5 flex justify-between items-center bg-black/5">
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" style={{ color: primaryColor }} /> 
                <span>Comanda de Pedido</span>
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="opacity-70 hover:opacity-100 p-2 rounded-full cursor-pointer text-base">
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
              {/* 1. Selección de Mesa / Modalidad */}
              <div className="p-4 bg-black/5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 opacity-80">
                    <MapPin className="w-4 h-4" style={{ color: primaryColor }} /> Ubicación del Pedido
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setOrderType('table')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        orderType === 'table' ? 'bg-black text-white' : 'bg-white/80 text-gray-700'
                      }`}
                    >
                      En Mesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('takeout')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        orderType === 'takeout' ? 'bg-black text-white' : 'bg-white/80 text-gray-700'
                      }`}
                    >
                      Llevar
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        orderType === 'delivery' ? 'bg-black text-white' : 'bg-white/80 text-gray-700'
                      }`}
                    >
                      Domicilio
                    </button>
                  </div>
                </div>

                {orderType === 'table' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold opacity-70">Número / Nombre de Mesa:</span>
                    <input
                      type="text"
                      placeholder="Ej. 4, Terraza 2, Barra"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-black/10 bg-white text-xs font-bold focus:outline-none focus:ring-1"
                    />
                  </div>
                )}
              </div>

              {/* 2. Datos del Cliente & Notas */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Tu Nombre (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Carlos Mendoza"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/10 bg-white text-xs font-medium focus:outline-none focus:ring-1"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Notas Especiales para la Cocina
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Sin cebolla, aderezo aparte, bien cocido..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/10 bg-white text-xs font-medium focus:outline-none focus:ring-1 resize-none"
                  />
                </div>
              </div>

              {/* 3. Lista de Productos en el Carrito */}
              <div className="space-y-3 pt-2">
                <p className="font-extrabold text-xs uppercase tracking-wider opacity-60">Platos & Bebidas Seleccionados:</p>
                {cart.map((c) => (
                  <div key={c.item.id} className="flex justify-between items-center gap-4 border-b border-black/5 pb-3">
                    <div className="flex-1">
                      <p className="font-bold text-sm" style={{ color: textColor }}>{c.item.name}</p>
                      <p className="opacity-60 text-xs font-medium">{currencySymbol} {c.item.price} c/u</p>
                    </div>
                    <div className="flex items-center gap-2 bg-black/5 p-1 rounded-xl">
                      <button onClick={() => removeFromCart(c.item.id)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-xs text-gray-700 cursor-pointer"><Minus className="w-3.5 h-3.5"/></button>
                      <span className="font-bold text-xs w-4 text-center">{c.quantity}</span>
                      <button onClick={() => addToCart(c.item)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-xs text-gray-700 cursor-pointer"><Plus className="w-3.5 h-3.5"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie de Página / Enviar a Cocina y WhatsApp */}
            <div className="p-5 border-t border-black/5 bg-black/5 space-y-3">
              {activeCoupon?.label && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎁</span>
                    <div>
                      <span className="font-extrabold text-amber-950 block leading-tight">{activeCoupon.label}</span>
                      <span className="text-[10px] text-amber-800 font-mono font-bold">Cupón: {activeCoupon.code}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded-md">
                    Aplicado
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="font-medium opacity-70 text-xs sm:text-sm">Total a Pagar:</span>
                <span className="font-extrabold text-xl sm:text-2xl" style={{ color: primaryColor }}>{currencySymbol} {totalPrice.toFixed(2)}</span>
              </div>
              <button 
                onClick={sendWhatsAppOrder}
                className={`w-full bg-[#25D366] hover:bg-[#1EBE57] text-white font-extrabold px-6 py-3.5 flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer text-sm ${btnRadiusClass}`}
              >
                <MessageCircle className="w-5 h-5 fill-white" /> 
                <span>Enviar Pedido a Cocina por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gamificación (Ruleta / Raspa y Gana + Reseñas en Google) */}
      {hasActiveWheel && (
        <RestaurantGamificationModal
          isOpen={isGamificationOpen}
          onClose={() => setIsGamificationOpen(false)}
          menu={menu}
          wheel={wheel}
          items={wheel.prize_wheel_items || []}
          reviewDevice={reviewDevice}
          initialTable={tableNumber}
          onApplyCouponToCart={(coupon) => setActiveCoupon(coupon)}
        />
      )}
    </div>
  )
}
