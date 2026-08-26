'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { submitPrivateFeedback } from './actions'

export default function FilterClient({ deviceId, redirectUrl }: { deviceId: string, redirectUrl: string }) {
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

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
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm w-full animate-in fade-in zoom-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Gracias por tu opinión</h2>
        <p className="text-gray-500">Valoramos mucho tus comentarios para seguir mejorando nuestro servicio.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full mx-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">¿Cómo fue tu experiencia hoy?</h1>
        <p className="text-gray-500 text-sm">Toca una estrella para calificar tu visita</p>
      </div>

      {!showForm ? (
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => handleRating(star)}
              className="transition-transform hover:scale-110 p-1"
            >
              <Star 
                className={`w-12 h-12 transition-colors ${
                  (hoveredRating || rating) >= star 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-200'
                }`} 
              />
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lamentamos no haber cumplido tus expectativas. ¿En qué podemos mejorar?
            </label>
            <textarea 
              name="message" 
              required 
              rows={4}
              placeholder="Cuéntanos qué pasó..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none resize-none"
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Comentarios'}
          </button>
        </form>
      )}
    </div>
  )
}
