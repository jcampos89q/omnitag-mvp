'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  UtensilsCrossed, 
  ChefHat, 
  Bell, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  Printer, 
  Sparkles, 
  Search, 
  Calendar, 
  CreditCard, 
  Banknote, 
  QrCode, 
  X, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

interface OrderItem {
  item: {
    id: string
    name: string
    price: number
  }
  quantity: number
}

interface RestaurantOrder {
  id: string
  menu_id: string
  daily_order_number: number
  table_number: string
  order_type: string
  customer_name: string
  customer_phone?: string
  items: OrderItem[]
  subtotal: number
  discount_amount: number
  total_amount: number
  currency: string
  applied_coupon_code?: string
  applied_coupon_label?: string
  notes?: string
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid'
  payment_method?: 'cash' | 'card' | 'transfer' | 'other'
  paid_at?: string
  created_at: string
}

interface ComandasClientProps {
  userMenus: any[]
  initialOrders: RestaurantOrder[]
  currency: string
}

export default function ComandasClient({
  userMenus,
  initialOrders,
  currency = 'HNL'
}: ComandasClientProps) {
  const [orders, setOrders] = useState<RestaurantOrder[]>(initialOrders)
  const [activeTab, setActiveTab] = useState<'kds' | 'sales'>('kds')
  const [selectedMenuId, setSelectedMenuId] = useState<string>(userMenus[0]?.id || '')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today')

  // Modal de Cobro
  const [orderToPay, setOrderToPay] = useState<RestaurantOrder | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash')
  const [isProcessingPay, setIsProcessingPay] = useState(false)

  // Web Audio Context para alerta de cocina (Ding!)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const previousOrderCountRef = useRef(initialOrders.length)

  const playKitchenChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (AudioCtx) audioCtxRef.current = new AudioCtx()
      }
      const ctx = audioCtxRef.current
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume()

      // Tono de campana de cocina de dos notas (Ding - Dong)
      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(880, now) // A5
      gain1.gain.setValueAtTime(0.25, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.6)

      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(659.25, now + 0.18) // E5
      gain2.gain.setValueAtTime(0.3, now + 0.18)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.18)
      osc2.stop(now + 0.8)
    } catch {
      // Ignorar restricciones de audio
    }
  }

  // Refresco en vivo periódico (Auto-polling cada 8 segundos)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders/list?menu_id=${selectedMenuId || ''}`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.orders)) {
            // Si hay nuevas órdenes pendientes, sonar campana
            const newPending = data.orders.filter((o: RestaurantOrder) => o.status === 'pending').length
            const prevPending = orders.filter((o: RestaurantOrder) => o.status === 'pending').length
            if (newPending > prevPending) {
              playKitchenChime()
            }
            setOrders(data.orders)
          }
        }
      } catch {
        // Ignorar fallos de red silenciosos
      }
    }

    const interval = setInterval(fetchOrders, 8000)
    return () => clearInterval(interval)
  }, [selectedMenuId, orders])

  // Actualizar estado de una orden
  const updateOrderStatus = async (orderId: string, newStatus: RestaurantOrder['status']) => {
    // Actualización optimista
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))

    try {
      await fetch('/api/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          status: newStatus
        })
      })
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  // Confirmar cobro de mesa
  const handleConfirmPayment = async () => {
    if (!orderToPay) return
    setIsProcessingPay(true)

    try {
      const res = await fetch('/api/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderToPay.id,
          status: 'completed',
          payment_status: 'paid',
          payment_method: paymentMethod
        })
      })

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderToPay.id ? { 
          ...o, 
          status: 'completed', 
          payment_status: 'paid', 
          payment_method: paymentMethod,
          paid_at: new Date().toISOString()
        } : o))
        setOrderToPay(null)
      }
    } catch (err) {
      console.error('Error confirming payment:', err)
    } finally {
      setIsProcessingPay(false)
    }
  }

  // Imprimir Ticket Térmico de Comanda
  const handlePrintTicket = (order: RestaurantOrder) => {
    const printWindow = window.open('', '_blank', 'width=350,height=600')
    if (!printWindow) return

    const symbol = order.currency === 'HNL' ? 'L. ' : '$ '
    const itemsHtml = order.items.map(it => `
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
        <span><strong>${it.quantity}x</strong> ${it.item.name}</span>
        <span>${symbol}${(it.item.price * it.quantity).toFixed(2)}</span>
      </div>
    `).join('')

    const couponHtml = order.applied_coupon_label ? `
      <div style="border: 1px dashed #000; padding: 4px; margin: 8px 0; font-size: 11px; text-align: center;">
        <strong>PREMIO CANJEADO:</strong><br/>
        ${order.applied_coupon_label} (${order.applied_coupon_code || ''})
      </div>
    ` : ''

    printWindow.document.write(`
      <html>
        <head>
          <title>Comanda #${order.daily_order_number} - ${order.table_number}</title>
          <style>
            body { font-family: monospace; padding: 10px; width: 280px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
            .total { border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px; font-weight: bold; font-size: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin: 0; font-size: 18px;">COMANDA #${order.daily_order_number}</h2>
            <p style="margin: 3px 0; font-size: 14px; font-weight: bold;">${order.table_number}</p>
            <p style="margin: 0; font-size: 11px;">Cliente: ${order.customer_name}</p>
            <p style="margin: 0; font-size: 10px;">${new Date(order.created_at).toLocaleTimeString()}</p>
          </div>
          <div style="margin: 10px 0;">
            ${itemsHtml}
          </div>
          ${order.notes ? `<div style="font-size: 11px; font-style: italic; margin-bottom: 6px;">Nota: ${order.notes}</div>` : ''}
          ${couponHtml}
          <div class="total" style="display: flex; justify-content: space-between;">
            <span>TOTAL:</span>
            <span>${symbol}${Number(order.total_amount).toFixed(2)}</span>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Filtrado de pedidos según fecha
  const filteredOrders = orders.filter(o => {
    if (selectedMenuId && o.menu_id !== selectedMenuId) return false

    const orderDate = new Date(o.created_at)
    const now = new Date()

    if (dateFilter === 'today') {
      return orderDate.toDateString() === now.toDateString()
    } else if (dateFilter === 'week') {
      const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24)
      return diffDays <= 7
    } else if (dateFilter === 'month') {
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
    }
    return true
  })

  // Búsqueda por texto
  const searchedOrders = filteredOrders.filter(o => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      o.customer_name?.toLowerCase().includes(term) ||
      o.table_number?.toLowerCase().includes(term) ||
      o.applied_coupon_code?.toLowerCase().includes(term) ||
      String(o.daily_order_number).includes(term)
    )
  })

  // Agrupación por columnas de cocina (KDS)
  const pendingOrders = searchedOrders.filter(o => o.status === 'pending')
  const preparingOrders = searchedOrders.filter(o => o.status === 'preparing')
  const readyOrders = searchedOrders.filter(o => o.status === 'ready')
  const completedOrders = searchedOrders.filter(o => o.status === 'completed')

  // Métricas financieras para el Registro de Ventas
  const totalSales = searchedOrders
    .filter(o => o.payment_status === 'paid' || o.status === 'completed')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

  const totalDiscounts = searchedOrders
    .reduce((sum, o) => sum + Number(o.discount_amount || 0), 0)

  const paidOrdersCount = searchedOrders.filter(o => o.payment_status === 'paid' || o.status === 'completed').length
  const averageTicket = paidOrdersCount > 0 ? totalSales / paidOrdersCount : 0
  const totalCouponsClaimed = searchedOrders.filter(o => Boolean(o.applied_coupon_code)).length

  return (
    <div className="space-y-6">
      
      {/* Barra Superior con Selector de Menú, Modo y Sonido */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2.5">
            <UtensilsCrossed className="w-6 h-6 text-amber-600" />
            <span>Comandas & Registro de Ventas</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Recepción de pedidos de mesa en vivo, comanda de cocina, control de cobros y canje de premios.
          </p>
        </div>

        {/* Acciones y Selector de Modo */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Selector de Pestañas */}
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab('kds')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'kds'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <ChefHat className="w-4 h-4 text-amber-600" />
              <span>Cocina en Vivo ({pendingOrders.length + preparingOrders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'sales'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Registro de Ventas</span>
            </button>
          </div>

          {/* Toggle de Alerta Sonora */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Silenciar timbre de cocina' : 'Activar timbre de cocina'}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              soundEnabled 
                ? 'bg-amber-50 border-amber-200 text-amber-700' 
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: TABLERO KDS DE COCINA (EN VIVO) */}
      {activeTab === 'kds' && (
        <div className="space-y-4">
          
          {/* Columnas Kanban de Cocina */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* COLUMNA 1: NUEVOS / PENDIENTES */}
            <div className="bg-amber-50/60 rounded-2xl border-2 border-amber-200 p-3.5 space-y-3 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <span className="font-extrabold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  Nuevos ({pendingOrders.length})
                </span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                  Por Iniciar
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {pendingOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    currency={currency}
                    onMoveToNext={() => updateOrderStatus(order.id, 'preparing')}
                    nextLabel="👨‍🍳 A Cocina"
                    onPrint={() => handlePrintTicket(order)}
                    onPay={() => setOrderToPay(order)}
                    onCancel={() => updateOrderStatus(order.id, 'cancelled')}
                  />
                ))}
                {pendingOrders.length === 0 && (
                  <div className="text-center py-12 text-xs text-amber-800/60 font-medium">
                    Sin pedidos pendientes en este momento.
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA 2: EN PREPARACIÓN */}
            <div className="bg-blue-50/60 rounded-2xl border-2 border-blue-200 p-3.5 space-y-3 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <span className="font-extrabold text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-blue-600" />
                  En Cocina ({preparingOrders.length})
                </span>
                <span className="text-[10px] bg-blue-200/80 text-blue-900 font-bold px-2 py-0.5 rounded-md">
                  Preparando
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {preparingOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    currency={currency}
                    onMoveToNext={() => updateOrderStatus(order.id, 'ready')}
                    nextLabel="🛎️ Listo p/ Servir"
                    onPrint={() => handlePrintTicket(order)}
                    onPay={() => setOrderToPay(order)}
                  />
                ))}
                {preparingOrders.length === 0 && (
                  <div className="text-center py-12 text-xs text-blue-800/60 font-medium">
                    No hay platos cocinándose actualmente.
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA 3: LISTOS PARA SERVIR */}
            <div className="bg-emerald-50/60 rounded-2xl border-2 border-emerald-200 p-3.5 space-y-3 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-emerald-600" />
                  Para Servir ({readyOrders.length})
                </span>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-md">
                  Mesero Llevar
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {readyOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    currency={currency}
                    onMoveToNext={() => setOrderToPay(order)}
                    nextLabel="💵 Cobrar Mesa"
                    onPrint={() => handlePrintTicket(order)}
                    onPay={() => setOrderToPay(order)}
                  />
                ))}
                {readyOrders.length === 0 && (
                  <div className="text-center py-12 text-xs text-emerald-800/60 font-medium">
                    No hay platos esperando ser llevados a mesa.
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA 4: COBRADOS Y CERRADOS */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-3.5 space-y-3 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="font-extrabold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" />
                  Cobrados ({completedOrders.length})
                </span>
                <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded-md">
                  Venta Cerrada
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {completedOrders.slice(0, 10).map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    currency={currency}
                    isCompleted={true}
                    onPrint={() => handlePrintTicket(order)}
                  />
                ))}
                {completedOrders.length === 0 && (
                  <div className="text-center py-12 text-xs text-gray-400 font-medium">
                    Aún no hay comandas cobradas en este filtro.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PESTAÑA 2: REGISTRO DE VENTAS & CIERRE DE CAJA */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          
          {/* Selector de Rango de Fechas */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-bold text-gray-700">Filtrar período:</span>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {(['today', 'week', 'month', 'all'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setDateFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition capitalize ${
                      dateFilter === f
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {f === 'today' ? 'Hoy' : f === 'week' ? 'Esta Semana' : f === 'month' ? 'Este Mes' : 'Histórico'}
                  </button>
                ))}
              </div>
            </div>

            {/* Buscador de Comandas */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cliente, mesa, cupón..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Tarjetas KPI de Ventas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Ventas Totales
              </span>
              <p className="text-2xl font-black text-emerald-600">
                {currency} {totalSales.toFixed(2)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                {paidOrdersCount} pedidos cobrados
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Comandas Atendidas
              </span>
              <p className="text-2xl font-black text-gray-900">
                {searchedOrders.length}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Mesas activas y cerradas
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Ticket Promedio
              </span>
              <p className="text-2xl font-black text-blue-600">
                {currency} {averageTicket.toFixed(2)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Gasto promedio por mesa
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Premios & Descuentos
              </span>
              <p className="text-2xl font-black text-amber-600 flex items-center gap-1.5">
                <span>{totalCouponsClaimed}</span>
                <span className="text-xs text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">Ruleta</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Cupones canjeados en caja
              </p>
            </div>

          </div>

          {/* Tabla de Registro de Ventas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900">
                Detalle de Ventas & Comandas
              </h3>
              <span className="text-xs text-gray-500 font-medium">
                {searchedOrders.length} registros encontrados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5"># Orden</th>
                    <th className="p-3.5">Mesa / Ubicación</th>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5">Platos & Bebidas</th>
                    <th className="p-3.5">Premio Aplicado</th>
                    <th className="p-3.5">Total</th>
                    <th className="p-3.5">Pago</th>
                    <th className="p-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {searchedOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50/70 transition">
                      <td className="p-3.5 font-bold font-mono">
                        #{order.daily_order_number}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                          {order.table_number}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-gray-900">{order.customer_name}</div>
                        {order.customer_phone && (
                          <div className="text-[10px] text-gray-400 font-mono">{order.customer_phone}</div>
                        )}
                      </td>
                      <td className="p-3.5 max-w-xs truncate">
                        {order.items.map(it => `${it.quantity}x ${it.item.name}`).join(', ')}
                      </td>
                      <td className="p-3.5">
                        {order.applied_coupon_label ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            🎁 {order.applied_coupon_label}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="p-3.5 font-black text-gray-900">
                        {currency} {Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.payment_status === 'paid' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.payment_status === 'paid' ? `Pagado (${order.payment_method || 'Efectivo'})` : 'Pendiente'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handlePrintTicket(order)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition cursor-pointer"
                          title="Imprimir Ticket"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {searchedOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        No se encontraron registros de ventas en este período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL DE COBRO DE MESA */}
      {orderToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h4 className="font-extrabold text-base text-gray-900">
                  Cobrar Orden #{orderToPay.daily_order_number}
                </h4>
                <p className="text-xs text-gray-500 font-bold">
                  {orderToPay.table_number} • {orderToPay.customer_name}
                </p>
              </div>
              <button 
                onClick={() => setOrderToPay(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total a Pagar */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 block">
                Total a Cobrar
              </span>
              <p className="text-3xl font-black text-emerald-700 mt-1">
                {currency} {Number(orderToPay.total_amount).toFixed(2)}
              </p>
              {orderToPay.applied_coupon_label && (
                <span className="text-[11px] text-amber-700 font-bold mt-1 block">
                  🎁 Incluye beneficio: {orderToPay.applied_coupon_label}
                </span>
              )}
            </div>

            {/* Método de Pago */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                Selecciona Forma de Pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Banknote className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-[11px] block">Efectivo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-[11px] block">Tarjeta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                    paymentMethod === 'transfer'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-[11px] block">Transfer</span>
                </button>
              </div>
            </div>

            {/* Botón de Confirmación */}
            <button
              type="button"
              disabled={isProcessingPay}
              onClick={handleConfirmPayment}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isProcessingPay ? 'Procesando...' : 'Confirmar Cobro & Cerrar Mesa'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// Componente Individual de Tarjeta de Comanda (KDS)
function OrderCard({
  order,
  currency,
  isCompleted = false,
  onMoveToNext,
  nextLabel,
  onPrint,
  onPay,
  onCancel
}: {
  order: RestaurantOrder
  currency: string
  isCompleted?: boolean
  onMoveToNext?: () => void
  nextLabel?: string
  onPrint?: () => void
  onPay?: () => void
  onCancel?: () => void
}) {
  const timeElapsed = () => {
    const diff = (Date.now() - new Date(order.created_at).getTime()) / 60000
    if (diff < 1) return 'Hace un instante'
    if (diff < 60) return `Hace ${Math.floor(diff)} min`
    return `${Math.floor(diff / 60)}h ${Math.floor(diff % 60)}m`
  }

  return (
    <div className={`bg-white rounded-2xl border p-3.5 shadow-sm space-y-2.5 transition hover:shadow-md ${
      order.status === 'pending' ? 'border-amber-300' : 'border-gray-200'
    }`}>
      {/* Cabecera de la Comanda */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-7 h-7 rounded-lg bg-black text-white font-black text-xs flex items-center justify-center">
            #{order.daily_order_number}
          </span>
          <div>
            <span className="font-extrabold text-xs text-gray-900 block leading-tight">
              {order.table_number}
            </span>
            <span className="text-[10px] text-gray-400">
              {order.customer_name}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 justify-end">
            <Clock className="w-3 h-3" />
            {timeElapsed()}
          </span>
        </div>
      </div>

      {/* Lista de Platos y Cantidades */}
      <div className="bg-gray-50 rounded-xl p-2.5 space-y-1.5 border border-black/5 text-xs">
        {order.items.map((it, idx) => (
          <div key={idx} className="flex justify-between items-start gap-2">
            <span className="text-gray-800 font-bold">
              <span className="text-amber-700 font-black">{it.quantity}x</span> {it.item.name}
            </span>
            <span className="text-gray-400 font-mono text-[11px] shrink-0">
              {currency} {(it.item.price * it.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        {order.notes && (
          <p className="text-[11px] text-amber-900 italic pt-1 border-t border-black/5 font-medium">
            Nota: {order.notes}
          </p>
        )}
      </div>

      {/* Premio Aplicado de Ruleta / Raspable */}
      {order.applied_coupon_label && (
        <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-current shrink-0" />
          <span className="truncate">Premio: {order.applied_coupon_label}</span>
        </div>
      )}

      {/* Total a Pagar y Acciones */}
      <div className="pt-1 flex items-center justify-between border-t border-gray-100">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Total</span>
          <span className="font-black text-sm text-gray-900">
            {currency} {Number(order.total_amount).toFixed(2)}
          </span>
        </div>

        {!isCompleted && (
          <div className="flex items-center gap-1">
            {onPrint && (
              <button
                onClick={onPrint}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 cursor-pointer"
                title="Imprimir Comanda"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            )}
            {onMoveToNext && (
              <button
                onClick={onMoveToNext}
                className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span>{nextLabel || 'Avanzar'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
