'use client'

import { useState } from 'react'
import { saveLead } from './actions'
import { Users, X, CheckCircle2, Send } from 'lucide-react'
import { ThemeConfig } from '@/lib/themes'

export default function LeadCaptureModal({ 
  vcardId, 
  slug, 
  mainColor,
  theme 
}: { 
  vcardId: string
  slug: string
  mainColor?: string
  theme?: ThemeConfig 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(true)

  const primaryColor = theme?.primary_color || mainColor || '#0F172A'
  const isDark = theme?.is_dark || false
  const cardBg = theme?.card_bg || '#FFFFFF'
  const textColor = theme?.text_color || '#0F172A'
  const inputBg = isDark ? '#1E293B' : '#FFFFFF'
  const inputTextColor = isDark ? '#F8FAFC' : '#0F172A'
  const inputBorder = isDark ? '#334155' : '#E2E8F0'

  const btnRadiusClass = theme?.border_style === 'square' 
    ? 'rounded-none' 
    : theme?.border_style === 'pill' 
    ? 'rounded-full' 
    : 'rounded-xl'

  const modalRadiusClass = theme?.border_style === 'square' 
    ? 'rounded-none' 
    : theme?.border_style === 'pill' 
    ? 'rounded-3xl' 
    : 'rounded-2xl'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    const formElement = e.currentTarget
    const formData = new FormData(formElement)
    const res = await saveLead(formData)
    setLoading(false)

    if (res?.success) {
      setSubmitted(true)
      formElement.reset()
      setTimeout(() => {
        setIsOpen(false)
        setSubmitted(false)
      }, 2800)
    } else {
      setErrorMsg(res?.error || 'No se pudo guardar la información. Por favor verifica tus datos e intenta de nuevo.')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-center gap-2 border-2 px-6 py-3.5 font-bold text-xs sm:text-sm transition-all shadow-xs mt-3 cursor-pointer ${btnRadiusClass}`}
        style={{ 
          borderColor: primaryColor, 
          color: primaryColor,
          backgroundColor: isDark ? `${primaryColor}15` : '#FFFFFF' 
        }}
      >
        <Users className="w-4 h-4" />
        Intercambiar Contacto / Dejar Mis Datos
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className={`w-full max-w-sm overflow-hidden shadow-2xl border border-black/10 transition-all ${modalRadiusClass}`}
            style={{ 
              backgroundColor: cardBg,
              color: textColor 
            }}
          >
            {submitted ? (
              <div className="p-8 text-center animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primaryColor}20` }}>
                  <CheckCircle2 className="w-10 h-10" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-xl font-bold mb-1" style={{ color: textColor }}>¡Contacto enviado!</h3>
                <p className="opacity-70 text-xs leading-relaxed">
                  Tus datos han sido compartidos con éxito.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center px-6 py-4 border-b border-black/5">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg" style={{ color: textColor }}>Intercambiar Contacto</h3>
                    <p className="text-xs opacity-60">Comparte tu información directamente</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsOpen(false)} 
                    className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 transition cursor-pointer"
                    style={{ color: textColor }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <input type="hidden" name="vcard_id" value={vcardId} />
                  <input type="hidden" name="slug" value={slug} />

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed">
                      {errorMsg}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-1.5" style={{ color: textColor }}>
                      Nombre Completo *
                    </label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      placeholder="Ej. Juan Pérez"
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 font-medium" 
                      style={{ 
                        backgroundColor: inputBg,
                        color: inputTextColor,
                        borderColor: inputBorder 
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-1.5" style={{ color: textColor }}>
                      Teléfono / WhatsApp
                    </label>
                    <input 
                      type="tel" 
                      name="phone" 
                      placeholder="Ej. +504 9988-0000"
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 font-medium" 
                      style={{ 
                        backgroundColor: inputBg,
                        color: inputTextColor,
                        borderColor: inputBorder 
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-1.5" style={{ color: textColor }}>
                      Correo Electrónico
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="juan@empresa.com"
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 font-medium" 
                      style={{ 
                        backgroundColor: inputBg,
                        color: inputTextColor,
                        borderColor: inputBorder 
                      }}
                    />
                  </div>
                  
                  {/* Aceptación de Políticas de Privacidad */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer text-[11px] opacity-80 select-none leading-snug" style={{ color: textColor }}>
                      <input 
                        type="checkbox" 
                        required 
                        checked={acceptedPrivacy}
                        onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                        className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-black cursor-pointer shrink-0" 
                      />
                      <span>
                        Acepto compartir mis datos y acepto la{' '}
                        <a 
                          href="/privacidad" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="underline font-bold hover:opacity-100"
                          style={{ color: primaryColor }}
                        >
                          Política de Privacidad
                        </a>.
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={loading || !acceptedPrivacy}
                      style={{ backgroundColor: primaryColor }}
                      className={`w-full text-white font-bold py-3.5 text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${btnRadiusClass}`}
                    >
                      <Send className="w-4 h-4" />
                      {loading ? 'Guardando...' : 'Enviar Mis Datos'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
