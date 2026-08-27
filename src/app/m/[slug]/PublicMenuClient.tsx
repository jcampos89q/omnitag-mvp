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
  CheckCircle2 
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
  theme
}: { 
  menu: any, 
  categories: Category[],
  theme?: ThemeConfig
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

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

  // Pedido general del carrito (Restaurantes)
  const sendWhatsAppOrder = () => {
    if (!menu.whatsapp_number) return
    const cleanPhone = menu.whatsapp_number.replace(/\D/g, '')

    let text = `*NUEVO PEDIDO - ${menu.name}*%0A%0A`
    cart.forEach(c => {
      text += `• ${c.quantity}x ${c.item.name} ($${(c.item.price * c.quantity).toFixed(2)})%0A`
    })
    text += `%0A*Total a Pagar: $${totalPrice.toFixed(2)}*%0A%0A¿Podrían confirmar la recepción de mi pedido?`

    const url = `https://wa.me/${cleanPhone}?text=${text}`
    window.open(url, '_blank')
  }

  return (
    <div className="pb-28">
      <main className="max-w-3xl mx-auto px-4 mt-6 space-y-8">
        
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
                  <Sparkles className="w-3.5 h-3.5" /> ESPECIAL DEL DÍA (Solo por Hoy)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                {dailySpecial.image_url && (
                  <div className={`w-full sm:w-36 h-36 rounded-xl overflow-hidden shrink-0 shadow-md border border-black/5`}>
                    <img src={dailySpecial.image_url} alt={dailySpecial.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl sm:text-2xl font-extrabold" style={{ color: textColor }}>
                      {dailySpecial.name}
                    </h3>
                    <span className="text-xl sm:text-2xl font-extrabold ml-2" style={{ color: primaryColor }}>
                      ${dailySpecial.price}
                    </span>
                  </div>
                  {dailySpecial.description && (
                    <p className="opacity-75 text-xs sm:text-sm mt-1.5 leading-relaxed">
                      {dailySpecial.description}
                    </p>
                  )}

                  <div className="mt-4">
                    {menu.whatsapp_number && (
                      <button
                        onClick={() => handleSingleServiceBooking({
                          id: 'daily_special',
                          name: `🔥 Plato del Día: ${dailySpecial.name}`,
                          price: dailySpecial.price,
                          description: dailySpecial.description,
                          image_url: dailySpecial.image_url,
                          is_available: true,
                          is_featured: true,
                          allergens: []
                        })}
                        style={{ backgroundColor: primaryColor }}
                        className={`text-white text-xs sm:text-sm font-bold px-5 py-2.5 flex items-center gap-2 hover:opacity-90 transition cursor-pointer shadow-md ${btnRadiusClass}`}
                      >
                        <MessageCircle className="w-4 h-4" /> Pedir Plato del Día por WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Catálogo / Categorías */}
        {!categories || categories.length === 0 ? (
          <div className="text-center py-16 opacity-60">
            Este catálogo aún no tiene ítems disponibles.
          </div>
        ) : (
          categories.map((category) => {
            const items = category.menu_items || []
            if (items.length === 0) return null

            return (
              <section key={category.id} className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-5">
                  <h2 
                    className="text-lg sm:text-xl font-extrabold pb-1 inline-block border-b-2"
                    style={{ 
                      color: textColor,
                      borderColor: primaryColor 
                    }}
                  >
                    {category.name}
                  </h2>
                  <div className="h-px flex-1 bg-black/5" />
                </div>

                <div className="space-y-4">
                  {items.map((item) => {
                    const cartItem = cart.find(c => c.item.id === item.id)
                    const quantity = cartItem?.quantity || 0

                    return (
                      <article 
                        key={item.id} 
                        className={`p-4 shadow-sm border ${cardRadiusClass} flex gap-4 transition ${
                          item.is_featured ? 'ring-2 ring-yellow-400/60' : 'border-black/5'
                        } ${!item.is_available ? 'opacity-60' : ''}`}
                        style={{ 
                          backgroundColor: cardBg,
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
              <span className="text-xs font-medium text-gray-400">Total ({totalItems} productos)</span>
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

      {/* Modal del Carrito */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right"
            style={{ 
              backgroundColor: cardBg,
              color: textColor
            }}
          >
            <div className="p-6 border-b border-black/5 flex justify-between items-center bg-black/5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" style={{ color: primaryColor }} /> Resumen del Pedido
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="opacity-70 hover:opacity-100 p-2 rounded-full cursor-pointer text-base">
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
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

            <div className="p-6 border-t border-black/5 bg-black/5">
              <div className="flex justify-between items-center mb-6">
                <span className="font-medium opacity-70 text-sm">Total del Pedido:</span>
                <span className="font-extrabold text-2xl" style={{ color: primaryColor }}>${totalPrice.toFixed(2)}</span>
              </div>
              <button 
                onClick={sendWhatsAppOrder}
                className={`w-full bg-[#25D366] hover:bg-[#1EBE57] text-white font-bold px-6 py-4 flex items-center justify-center gap-3 shadow-lg transition-all cursor-pointer ${btnRadiusClass}`}
              >
                <MessageCircle className="w-5 h-5" /> Enviar Pedido por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
