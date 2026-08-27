'use client'

import { useState } from 'react'
import { Image as ImageIcon, Flame, Leaf, WheatOff, Minus, Plus, ShoppingBag, MessageCircle } from 'lucide-react'
import { ThemeConfig } from '@/lib/themes'

type MenuItem = {
  id: string
  name: string
  description: string
  price: number
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

  const sendWhatsAppOrder = () => {
    if (!menu.whatsapp_number) return

    let text = `*NUEVO PEDIDO - ${menu.name}*%0A%0A`
    cart.forEach(c => {
      text += `${c.quantity}x ${c.item.name} ($${(c.item.price * c.quantity).toFixed(2)})%0A`
    })
    text += `%0A*Total: $${totalPrice.toFixed(2)}*`

    const cleanPhone = menu.whatsapp_number.replace(/\D/g, '')
    const url = `https://wa.me/${cleanPhone}?text=${text}`
    window.open(url, '_blank')
  }

  return (
    <div className="pb-28">
      {/* Catálogo / Categorías */}
      <main className="max-w-3xl mx-auto px-4 mt-8 space-y-10">
        {!categories || categories.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            Este menú aún no tiene platillos disponibles.
          </div>
        ) : (
          categories.map((category) => {
            const items = category.menu_items || []
            if (items.length === 0) return null

            return (
              <section key={category.id} className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
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
                            <div className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 border border-yellow-400/40">
                              ⭐ Recomendación
                            </div>
                          )}
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-base sm:text-lg leading-tight mb-1" style={{ color: textColor }}>
                              {item.name}
                            </h3>
                            <span className="font-extrabold text-base shrink-0" style={{ color: primaryColor }}>
                              ${item.price}
                            </span>
                          </div>
                          
                          {item.description && (
                            <p className="text-xs sm:text-sm opacity-70 mt-1 line-clamp-3 leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          {/* Alérgenos */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {item.allergens?.includes('vegan') && <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded uppercase"><Leaf className="w-3 h-3"/> Vegano</span>}
                            {item.allergens?.includes('spicy') && <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded uppercase"><Flame className="w-3 h-3"/> Picante</span>}
                            {item.allergens?.includes('gluten_free') && <span className="flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded uppercase"><WheatOff className="w-3 h-3"/> Sin Gluten</span>}
                          </div>

                          <div className="mt-4">
                            {!item.is_available ? (
                              <span className="inline-block text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                Agotado
                              </span>
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

                        {/* Imagen del Plato */}
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

      {/* Botón Flotante del Carrito */}
      {menu.whatsapp_number && totalItems > 0 && (
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
