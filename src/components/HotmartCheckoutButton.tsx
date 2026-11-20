'use client'

import React, { useState } from 'react'
import { X, Loader2, ExternalLink, ShieldCheck } from 'lucide-react'

interface HotmartCheckoutButtonProps {
  plan?: 'monthly' | 'annual'
  offerCode?: string
  productId?: string
  checkoutUrl?: string
  userEmail?: string
  userId?: string
  className?: string
  children?: React.ReactNode
}

export default function HotmartCheckoutButton({
  plan = 'monthly',
  offerCode,
  productId = 'X108582072E',
  checkoutUrl,
  userEmail,
  userId,
  className = '',
  children
}: HotmartCheckoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)

  const selectedOffer = offerCode || (plan === 'annual' ? 'l8fb16kg' : '12wgidyv')

  let finalUrl = checkoutUrl || `https://pay.hotmart.com/${productId}?checkoutMode=2&off=${selectedOffer}`

  if (userEmail) {
    finalUrl += `${finalUrl.includes('?') ? '&' : '?'}email=${encodeURIComponent(userEmail)}`
  }
  if (userId) {
    finalUrl += `${finalUrl.includes('?') ? '&' : '?'}sck=${encodeURIComponent(userId)}`
  }

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    // En móviles pequeños, abrir directo en nueva pestaña para máxima comodidad de pago
    if (typeof window !== 'undefined' && window.innerWidth <= 640) {
      window.open(finalUrl, '_blank')
      return
    }
    // En tablets y escritorio, abrir modal flotante sin salir de la página
    setIframeLoading(true)
    setIsOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={className}
      >
        {children}
      </button>

      {/* Modal Overlay Nativo Seguro */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative w-full max-w-[620px] h-[92vh] max-h-[820px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pago 100% Seguro cifrado por Hotmart</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-black flex items-center gap-1 font-semibold p-1 hover:bg-gray-200 rounded-lg transition"
                  title="Abrir en pantalla completa"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pantalla Completa</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-200 rounded-full transition cursor-pointer"
                  title="Cerrar ventana"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenedor Iframe con Spinner de Carga */}
            <div className="relative flex-1 w-full bg-gray-50 overflow-hidden">
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white z-10 text-gray-500 text-xs font-semibold">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  <span>Cargando pasarela segura de pago de Hotmart...</span>
                </div>
              )}
              <iframe
                src={finalUrl}
                title="Checkout Hotmart"
                allow="payment"
                onLoad={() => setIframeLoading(false)}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
