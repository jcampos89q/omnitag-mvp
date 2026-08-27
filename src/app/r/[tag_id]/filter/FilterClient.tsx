'use client'

import { useState } from 'react'
import { Star, CheckCircle } from 'lucide-react'
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
  const cardBg = theme?.card_bg || '#FFFFFF'
  const textColor = theme?.text_color || '#0F172A'

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
        <h2 className="text-xl font-bold mb-2">Gracias por tu opinión</h2>
        <p className="opacity-70 text-sm leading-relaxed">Valoramos mucho tus comentarios directos para seguir mejorando nuestro servicio.</p>
      </div>
    )
  }

  return (
    <div 
      className={`p-8 shadow-2xl max-w-sm w-full mx-4 border border-black/5 transition-all ${cardRadiusClass}`}
      style={{ backgroundColor: cardBg, color: textColor }}
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold mb-2" style={{ color: textColor }}>
          ¿Cómo fue tu experiencia hoy?
        </h1>
        <p className="text-xs sm:text-sm opacity-70">
          Toca una estrella para calificar tu visita
        </p>
      </div>

      {!showForm ? (
        <div className="flex justify-center gap-1.5 mb-4">
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
                className={`w-10 h-10 sm:w-11 sm:h-11 transition-colors ${
                  (hoveredRating || rating) >= star 
                    ? 'fill-amber-400 text-amber-400' 
                    : 'text-gray-300'
                }`} 
              />
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold opacity-80 mb-2">
              Lamentamos no haber cumplido tus expectativas. ¿En qué podemos mejorar?
            </label>
            <textarea 
              name="message" 
              required 
              rows={4}
              placeholder="Cuéntanos qué sucedió para resolverlo de inmediato..."
              className="w-full rounded-xl border border-gray-300 bg-white/70 px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:outline-none resize-none text-gray-900"
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ backgroundColor: primaryColor }}
            className={`w-full text-white font-bold py-3.5 text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-md cursor-pointer ${btnRadiusClass}`}
          >
            {loading ? 'Enviando...' : 'Enviar Comentarios Privados'}
          </button>
        </form>
      )}
    </div>
  )
}
