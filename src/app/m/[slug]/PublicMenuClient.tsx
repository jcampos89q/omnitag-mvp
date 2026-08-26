'use client'

import { useState } from 'react'
import { Image as ImageIcon, Flame, Leaf, WheatOff, Minus, Plus, ShoppingBag, MessageCircle } from 'lucide-react'

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
  categories 
}: { 
  menu: any, 
  categories: Category[] 
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

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

    const url = `https://wa.me/${menu.whatsapp_number.replace(/\+/g, '')}?text=${text}`
    window.open(url, '_blank')
  }

  return (
    <div className="pb-24"> {/* Espacio extra para el botón flotante */}
      {/* Catálogo / Categorías */}
      <main className="max-w-3xl mx-auto px-4 mt-8 space-y-10">
        {!categories || categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Este menú aún no tiene platillos.
          </div>
        ) : (
          categories.map((category) => {
            const items = category.menu_items || []
            if (items.length === 0) return null

            return (
              <section key={category.id} className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-900 border-b-2 border-black pb-2 mb-6 inline-block">
                  {category.name}
                </h2>

                <div className="space-y-4">
                  {items.map((item) => {
                    const cartItem = cart.find(c => c.item.id === item.id)
                    const quantity = cartItem?.quantity || 0

                    return (
                      <article 
                        key={item.id} 
                        className={`bg-white rounded-2xl p-4 shadow-sm border ${item.is_featured ? 'border-yellow-400 ring-4 ring-yellow-50' : 'border-gray-100'} flex gap-4 transition ${!item.is_available ? 'opacity-60' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          {item.is_featured && (
                            <div className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2">
                              ⭐ Recomendación del Chef
                            </div>
                          )}
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                              {item.name}
                            </h3>
                            <span className="font-bold text-gray-900 shrink-0">
                              ${item.price}
                            </span>
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-3">
                              {item.description}
                            </p>
                          )}

                          {/* Alérgenos */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.allergens?.includes('vegan') && <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-sm uppercase"><Leaf className="w-3 h-3"/> Vegano</span>}
                            {item.allergens?.includes('spicy') && <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-sm uppercase"><Flame className="w-3 h-3"/> Picante</span>}
                            {item.allergens?.includes('gluten_free') && <span className="flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded-sm uppercase"><WheatOff className="w-3 h-3"/> Sin Gluten</span>}
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
                                  className="text-sm font-medium bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition"
                                >
                                  Agregar
                                </button>
                              ) : (
                                <div className="inline-flex items-center bg-gray-100 rounded-full">
                                  <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 rounded-full transition"><Minus className="w-4 h-4"/></button>
                                  <span className="px-3 font-bold text-sm min-w-[2rem] text-center">{quantity}</span>
                                  <button onClick={() => addToCart(item)} className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 rounded-full transition"><Plus className="w-4 h-4"/></button>
                                </div>
                              )
                            ) : null}
                          </div>
                        </div>

                        {/* Imagen */}
                        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-gray-300" />
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
          <div className="pointer-events-auto bg-black text-white rounded-2xl shadow-2xl p-2 flex items-center justify-between">
            <div className="flex flex-col pl-4">
              <span className="text-xs font-medium text-gray-400">Total ({totalItems} items)</span>
              <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="bg-white text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-100 transition"
            >
              <ShoppingBag className="w-5 h-5" /> Ver Pedido
            </button>
          </div>
        </div>
      )}

      {/* Modal del Carrito */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Tu Pedido
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-black p-2 bg-white rounded-full shadow-sm">
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map((c) => (
                <div key={c.item.id} className="flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{c.item.name}</p>
                    <p className="text-gray-500 font-medium">${c.item.price} c/u</p>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-full border border-gray-100">
                    <button onClick={() => removeFromCart(c.item.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 hover:text-black"><Minus className="w-4 h-4"/></button>
                    <span className="font-bold w-4 text-center">{c.quantity}</span>
                    <button onClick={() => addToCart(c.item)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 hover:text-black"><Plus className="w-4 h-4"/></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center mb-6 text-lg">
                <span className="font-medium text-gray-500">Total a pagar:</span>
                <span className="font-bold text-2xl">${totalPrice.toFixed(2)}</span>
              </div>
              <button 
                onClick={sendWhatsAppOrder}
                className="w-full bg-[#25D366] hover:bg-[#1EBE57] text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-green-200 transition-all"
              >
                <MessageCircle className="w-6 h-6" /> Enviar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
