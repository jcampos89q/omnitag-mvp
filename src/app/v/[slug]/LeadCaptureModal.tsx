'use client'

import { useState } from 'react'
import { saveLead } from './actions'
import { Users, X, CheckCircle2 } from 'lucide-react'

export default function LeadCaptureModal({ vcardId, slug, mainColor }: { vcardId: string, slug: string, mainColor: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await saveLead(formData)
    setSubmitted(true)
    setTimeout(() => {
      setIsOpen(false)
      setSubmitted(false)
    }, 3000)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-white border-2 px-6 py-3 rounded-xl font-medium transition-colors shadow-sm mt-3 hover:bg-gray-50"
        style={{ borderColor: mainColor, color: mainColor }}
      >
        <Users className="w-5 h-5" />
        Intercambiar Contacto
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {submitted ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: mainColor }} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">¡Datos enviados!</h3>
                <p className="text-gray-500">Gracias por compartir tu información.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                  <h3 className="font-bold text-lg text-gray-900">Compartir mis datos</h3>
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <input type="hidden" name="vcard_id" value={vcardId} />
                  <input type="hidden" name="slug" value={slug} />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                    <input type="text" name="name" required className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-2 focus:outline-none" placeholder="Ej. Juan Pérez" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input type="email" name="email" className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-2 focus:outline-none" placeholder="juan@empresa.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (WhatsApp)</label>
                    <input type="tel" name="phone" className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-2 focus:outline-none" placeholder="+34 600..." />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full text-white font-bold py-3 rounded-xl mt-6 transition-opacity hover:opacity-90 shadow-md"
                    style={{ backgroundColor: mainColor }}
                  >
                    Enviar mis datos
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
