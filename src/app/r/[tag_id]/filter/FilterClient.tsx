'use client'

import { useState } from 'react'
import { Star, CheckCircle, ShieldCheck, Send, MessageSquareHeart } from 'lucide-react'
import { submitPrivateFeedback } from './actions'
import { ThemeConfig } from '@/lib/themes'

export default function FilterClient({ 
  deviceId, 
  redirectUrl,
  theme
}: { 
  deviceId: string
  redirectUrl: string
  theme?: ThemeConfig
}) {
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const cardRadiusClass = theme?.border_style === 'square' 
    ? 'rounded-none' 
    : theme?.border_style === 'pill' 
    ? 'rounded-3xl' 
    : 'rounded-3xl'

  const btnRadiusClass = theme?.border_style === 'square' 
    ? 'rounded-none' 
    : theme?.border_style === 'pill' 
    ? 'rounded-full' 
    : 'rounded-xl'

  const primaryColor = theme?.primary_color || '#0F172A'
  const isDark = theme?.is_dark || false
  const cardBg = theme?.card_bg || '#FFFFFF'
  const textColor = theme?.text_color || '#0F172A'
  const inputBg = isDark ? '#1E293B' : '#FFFFFF'
  const inputTextColor = isDark ? '#F8FAFC' : '#0F172A'
  const inputBorder = isDark ? '#334155' : '#E2E8F0'

  const handleRating = (value: number) => {
    setRating(value)
    
    // Si la calificación es buena (4 o 5), va directo a Google Maps
    if (value >= 4) {
      window.location.href = redirectUrl
    } else {
      // Si es 1, 2 o 3, mostramos el formulario de quejas privado
      setShowForm(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append('device_id', deviceId)
    formData.append('rating', rating.toString())
    
    await submitPrivateFeedback(formData)
    
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div 
        className={`text-center p-8 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in border border-black/5 ${cardRadiusClass}`}
        style={{ backgroundColor: cardBg, color: textColor }}
      >
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-extrabold mb-2">Comentario recibido</h2>
        <p className="opacity-75 text-xs sm:text-sm leading-relaxed">
          Tu opinión ha sido enviada de forma directa y privada a la administración para resolver cualquier inconveniente a la brevedad.
        </p>
      </div>
    )
  }

  return (
    <div 
      className={`p-6 sm:p-8 shadow-2xl max-w-md w-full mx-4 border border-black/5 transition-all ${cardRadiusClass}`}
      style={{ backgroundColor: cardBg, color: textColor }}
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> Tu opinión es importante
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold mb-1.5" style={{ color: textColor }}>
          ¿Cómo calificarías tu experiencia hoy?
        </h1>
        <p className="text-xs sm:text-sm opacity-70">
          Toca una estrella para calificar el servicio
        </p>
      </div>

      {/* Selector de Estrellas */}
      <div className="flex justify-center gap-1.5 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => handleRating(star)}
            className="transition-transform hover:scale-125 p-1 cursor-pointer focus:outline-none"
          >
            <Star 
              className={`w-9 h-9 sm:w-11 sm:h-11 transition-colors ${
                (hoveredRating || rating) >= star 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-gray-300'
              }`} 
            />
          </button>
        ))}
      </div>

      {/* Formulario de Quejas y Sugerencias Privado */}
      {showForm && (
        <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-3 space-y-4 pt-2 border-t border-black/5">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs">
            <p className="font-bold text-amber-900 flex items-center gap-1.5">
              <MessageSquareHeart className="w-4 h-4 text-amber-700" />
              Lamentamos no haber alcanzado tus expectativas.
            </p>
            <p className="opacity-80 mt-0.5 text-[11px]">
              Queremos corregir el error de inmediato. Déjanos tus comentarios y datos para que la gerencia se comunique contigo.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
              ¿Qué sucedió? / Sugerencia o Motivo *
            </label>
            <textarea 
              name="message" 
              required 
              rows={3}
              placeholder="Explícanos brevemente qué sucedió durante tu visita..."
              className="w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none font-medium"
              style={{
                backgroundColor: inputBg,
                color: inputTextColor,
                borderColor: inputBorder
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
                Tu Nombre (Opcional)
              </label>
              <input 
                type="text" 
                name="customer_name" 
                placeholder="Ej. Carlos Mendoza"
                className="w-full rounded-xl border px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black font-medium"
                style={{
                  backgroundColor: inputBg,
                  color: inputTextColor,
                  borderColor: inputBorder
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
                Teléfono / WhatsApp
              </label>
              <input 
                type="tel" 
                name="customer_phone" 
                placeholder="Ej. +504 9988-0000"
                className="w-full rounded-xl border px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black font-medium"
                style={{
                  backgroundColor: inputBg,
                  color: inputTextColor,
                  borderColor: inputBorder
                }}
              />
            </div>
          </div>

          <div className="pt-1">
            <button 
              type="submit" 
              disabled={loading}
              style={{ backgroundColor: primaryColor }}
              className={`w-full text-white font-bold py-3 text-xs sm:text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-md cursor-pointer flex items-center justify-center gap-2 ${btnRadiusClass}`}
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Enviando...' : 'Enviar al Buzón de Gerencia'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
