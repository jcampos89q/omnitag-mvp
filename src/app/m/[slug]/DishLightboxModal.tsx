'use client'

import { X, Plus, Minus, Flame, Leaf, WheatOff, Clock, Sparkles } from 'lucide-react'

interface DishLightboxModalProps {
  item: any | null
  isOpen: boolean
  onClose: () => void
  currencySymbol: string
  primaryColor: string
  btnRadiusClass: string
  cardRadiusClass: string
  textColor: string
  cardBg: string
  quantity: number
  onAddToCart: () => void
  onRemoveFromCart: () => void
  isRestaurant: boolean
  hasWhatsApp: boolean
  onSingleBooking?: () => void
}

export default function DishLightboxModal({
  item,
  isOpen,
  onClose,
  currencySymbol,
  primaryColor,
  btnRadiusClass,
  cardRadiusClass,
  textColor,
  cardBg,
  quantity,
  onAddToCart,
  onRemoveFromCart,
  isRestaurant,
  hasWhatsApp,
  onSingleBooking
}: DishLightboxModalProps) {
  if (!isOpen || !item) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] border border-white/10 ${cardRadiusClass}`}
        style={{ backgroundColor: cardBg, color: textColor }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen en Grande */}
        <div className="relative w-full aspect-4/3 bg-black/10 overflow-hidden shrink-0">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.name} 
              className="w-full h-full object-cover select-none"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-4xl">🍽️</span>
              <p className="text-xs font-semibold mt-2">Sin fotografía disponible</p>
            </div>
          )}

          {/* Botón flotante para cerrar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition backdrop-blur-xs cursor-pointer shadow-md"
            aria-label="Cerrar vista de plato"
          >
            <X className="w-5 h-5" />
          </button>

          {item.is_featured && (
            <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              Destacado
            </div>
          )}
        </div>

        {/* Detalle del Plato */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: textColor }}>
                {item.name}
              </h3>
              {item.duration_minutes && (
                <p className="text-xs font-semibold flex items-center gap-1 mt-1 opacity-80" style={{ color: primaryColor }}>
                  <Clock className="w-3.5 h-3.5" /> Duración: {item.duration_minutes}
                </p>
              )}
            </div>

            <div className="text-right shrink-0">
              <span className="text-xl sm:text-2xl font-black block" style={{ color: primaryColor }}>
                {item.price_type === 'starting_at' ? 'Desde ' : item.price_type === 'consultation' ? 'Valoración ' : ''}{currencySymbol} {item.price}
              </span>
            </div>
          </div>

          {item.description ? (
            <p className="text-sm opacity-80 leading-relaxed font-normal">
              {item.description}
            </p>
          ) : (
            <p className="text-xs opacity-50 italic">
              Platillo preparado con ingredientes frescos y la receta de la casa.
            </p>
          )}

          {/* Alérgenos e Insignias */}
          {item.allergens?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-black/5">
              {item.allergens.includes('vegan') && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase">
                  <Leaf className="w-3.5 h-3.5" /> Vegano
                </span>
              )}
              {item.allergens.includes('spicy') && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full uppercase">
                  <Flame className="w-3.5 h-3.5" /> Picante
                </span>
              )}
              {item.allergens.includes('gluten_free') && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full uppercase">
                  <WheatOff className="w-3.5 h-3.5" /> Sin Gluten
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer con Acción */}
        <div className="p-4 border-t border-black/10 bg-black/2 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs font-bold opacity-60 hover:opacity-100 px-3 py-2 cursor-pointer transition"
          >
            Volver al Menú
          </button>

          {!item.is_available ? (
            <span className="text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-3 py-2 rounded-xl">
              No disponible actualmente
            </span>
          ) : onSingleBooking ? (
            <button
              onClick={() => {
                onSingleBooking()
                onClose()
              }}
              style={{ backgroundColor: primaryColor }}
              className={`text-white text-xs sm:text-sm font-bold px-5 py-2.5 transition cursor-pointer shadow-md ${btnRadiusClass}`}
            >
              Reservar Servicio
            </button>
          ) : hasWhatsApp ? (
            quantity === 0 ? (
              <button
                onClick={onAddToCart}
                style={{ backgroundColor: primaryColor }}
                className={`text-white text-xs sm:text-sm font-bold px-5 py-2.5 flex items-center gap-1.5 transition cursor-pointer shadow-md hover:opacity-90 ${btnRadiusClass}`}
              >
                <Plus className="w-4 h-4" />
                <span>Agregar al Pedido ({currencySymbol} {item.price})</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold opacity-75">En tu comanda:</span>
                <div className={`inline-flex items-center bg-black/5 p-1 ${btnRadiusClass}`}>
                  <button 
                    onClick={onRemoveFromCart} 
                    className="p-1.5 text-gray-700 hover:text-black rounded-lg transition cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-extrabold text-sm min-w-[2rem] text-center">{quantity}</span>
                  <button 
                    onClick={onAddToCart} 
                    className="p-1.5 text-gray-700 hover:text-black rounded-lg transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}
