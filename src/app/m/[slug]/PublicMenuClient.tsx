'use client'

import { useState } from 'react'
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
  FileText
} from 'lucide-react'
import { ThemeConfig } from '@/lib/themes'

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
  initialTable = ''
}: { 
  menu: any, 
  categories: Category[],
  theme?: ThemeConfig,
  initialTable?: string
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [tableNumber, setTableNumber] = useState<string>(initialTable)
  const [orderType, setOrderType] = useState<'table' | 'takeout' | 'delivery'>(
    initialTable ? 'table' : 'table'
  )
  const [customerName, setCustomerName] = useState<string>('')
  const [orderNotes, setOrderNotes] = useState<string>('')

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

  // Verificar Plato del Día (Auto-expira si la fecha no es hoy)
  const todayStr = new Date().toISOString().slice(0, 10)
  const dailySpecial = menu.daily_special
  const hasValidDailySpecial = dailySpecial?.is_active && dailySpecial?.date === todayStr

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
      text = `¡Hola *${menu.name}*! Me gustaría agendar una cita para:%0A%0A✂️ *Servicio:* ${item.name}%0A💰 *Precio:* $${item.price.toFixed(2)}${item.duration_minutes ? `%0A⏱️ *Duración estimada:* ${item.duration_minutes}` : ''}%0A%0A¿Qué horarios tienen disponibles para hoy o mañana?`
    } else if (isDental) {
      text = `¡Hola *${menu.name}*! Me interesa solicitar una cita de valoración médica para el tratamiento:%0A%0A🦷 *Tratamiento:* ${item.name}%0A💰 *Tarifa:* ${item.price_type === 'starting_at' ? 'Desde ' : ''}$${item.price.toFixed(2)}%0A%0A¿Podrían indicarme los horarios disponibles para consulta?`
    } else {
      text = `¡Hola *${menu.name}*! Me interesa consultar información sobre *${item.name}* ($${item.price.toFixed(2)}).`
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

    text += `%0A-------------------------------%0A`
    text += `💰 *TOTAL A PAGAR: ${currencySymbol}${totalPrice.toFixed(2)}*%0A`
    text += `⏰ *Hora:* ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}%0A`
    text += `===============================%0A`
    text += `¿Podrían confirmarme la recepción y tiempo estimado? ¡Muchas gracias!`

    const url = `https://wa.me/${cleanPhone}?text=${text}`
    window.open(url, '_blank')
  }

  return (
    <div className="pb-28">
      <main className="max-w-3xl mx-auto px-4 mt-4 space-y-6">
        
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

        {/* BANNER DESTACADO: PLATO / ESPECIAL DEL DÍA */}
        {hasValidDailySpecial && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-300">
            <div 
              className={`p-5 sm:p-6 shadow-xl border-2 overflow-hidden relative ${cardRadiusClass}`}
              style={{ 
                backgroundColor: cardBg,
                borderColor: primaryColor,
                color: textColor 
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-extrabold uppercase tracking-wider shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  {isSalon ? 'Especial de Hoy' : isDental ? 'Promoción del Día' : 'Plato del Día'}
                </span>
                <span className="text-xs opacity-60 font-medium">Solo por hoy</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1" style={{ color: textColor }}>
                    {dailySpecial.title}
                  </h3>
                  <p className="text-xs sm:text-sm opacity-75 mb-4 leading-relaxed">
                    {dailySpecial.description}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black" style={{ color: primaryColor }}>
                      ${dailySpecial.price}
                    </span>
                    {menu.whatsapp_number && (
                      <button
                        onClick={() => addToCart({
                          id: 'daily_special',
                          name: `⭐ ${dailySpecial.title} (Especial del Día)`,
                          description: dailySpecial.description,
                          price: Number(dailySpecial.price) || 0,
                          image_url: dailySpecial.image_url || '',
                          is_available: true,
                          is_featured: true,
                          allergens: []
                        })}
                        style={{ backgroundColor: primaryColor }}
                        className={`text-white text-xs sm:text-sm font-bold px-4 py-2.5 hover:opacity-90 transition cursor-pointer shadow-md flex items-center gap-1.5 ${btnRadiusClass}`}
                      >
                        <Plus className="w-4 h-4" />
                        Pedir Especial
                      </button>
                    )}
                  </div>
                </div>

                {dailySpecial.image_url && (
                  <div className={`w-full sm:w-36 h-36 bg-black/5 rounded-xl overflow-hidden shrink-0 shadow-xs border border-black/5 ${cardRadiusClass}`}>
                    <img 
                      src={dailySpecial.image_url} 
                      alt={dailySpecial.title} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* CATÁLOGO DE CATEGORÍAS E ÍTEMS */}
        {categories.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <p className="text-sm font-semibold">El catálogo está en preparación...</p>
          </div>
        ) : (
          categories.map((category) => {
            if (!category.menu_items || category.menu_items.length === 0) return null

            return (
              <section key={category.id} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight" style={{ color: textColor }}>
                    {category.name}
                  </h2>
                  <span className="text-xs opacity-50 font-bold">({category.menu_items.length})</span>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {category.menu_items.map((item) => {
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
                              {item.price_type === 'starting_at' ? 'Desde ' : item.price_type === 'consultation' ? 'Valoración ' : ''}${item.price}
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

                        {/* Imagen del Ítem / Servicio */}
                        <div className={`w-24 h-24 sm:w-28 sm:h-28 bg-black/5 flex items-center justify-center shrink-0 overflow-hidden border border-black/5 ${cardRadiusClass}`}>
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
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
      </main>

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
              <span className="font-extrabold text-base sm:text-lg">${totalPrice.toFixed(2)}</span>
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
                      <p className="opacity-60 text-xs font-medium">${c.item.price} c/u</p>
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
              <div className="flex justify-between items-center">
                <span className="font-medium opacity-70 text-xs sm:text-sm">Total a Pagar:</span>
                <span className="font-extrabold text-xl sm:text-2xl" style={{ color: primaryColor }}>${totalPrice.toFixed(2)}</span>
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
    </div>
  )
}
