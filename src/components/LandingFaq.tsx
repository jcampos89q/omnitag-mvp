'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

interface FaqItem {
  q: string
  a: string
  badge?: string
}

export default function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs: FaqItem[] = [
    {
      q: '¿Cómo funciona la Ruleta de Premios y las Tarjetas Raspables en las mesas?',
      a: 'Tus comensales escanean el código QR en su mesa (#Mesa QR) y pueden girar la ruleta virtual o raspar la tarjeta dorada interactiva directamente en su smartphone sin descargar ninguna app. Pueden ganar premios configurados por ti (postres de cortesía, 10% de descuento o bebidas gratis) con un temporizador de mesa de 45 minutos. El premio se añade automáticamente a su comanda de WhatsApp y tú capturas su nombre y teléfono para tu CRM.',
      badge: 'Gamificación'
    },
    {
      q: '¿Cómo funcionan las Gift Cards o Tarjetas de Regalo digitales?',
      a: 'Permiten a tus clientes comprar o regalar saldo de consumo en tu restaurante, salón o comercio para obsequiar en cumpleaños, aniversarios o fechas especiales. Tu negocio cobra el dinero por adelantado (mejorando tu flujo de caja) y genera un cupón digital con dedicatoria ("De: Juan, Para: María") que el homenajeado canjea en caja de forma segura mediante un código QR o PIN antifraude.',
      badge: 'Gift Cards'
    },
    {
      q: '¿Mis clientes necesitan descargar alguna aplicación para ordenar o reservar?',
      a: 'No, absolutamente ninguna. Todo funciona de forma instantánea en el navegador web de cualquier teléfono móvil (iPhone o Android) con solo escanear el código QR o acercar el smartphone a una placa o tarjeta física NFC. Cero fricción y sin ocupar espacio en la memoria de su teléfono.',
      badge: 'Cero Fricción'
    },
    {
      q: '¿Cómo funciona el Menú Digital con turnos activos y platos del día?',
      a: 'El menú detecta automáticamente la hora y muestra de entrada el turno activo correspondiente (por ejemplo: Desayunos en la mañana, Almuerzos al mediodía o Cenas por la noche). Además, cuenta con una sección dedicada para el "Plato del Día" exclusivo que cambia a diario y no se repite, permitiendo a los clientes cambiar a ver toda la carta con un solo clic.',
      badge: 'Restaurantes'
    },
    {
      q: '¿Cómo recibo los pedidos y comandas de los comensales?',
      a: 'Llegan estructuradas y detalladas al instante a tu número de WhatsApp (con número de mesa, platos elegidos, notas de cocina, cupones canjeados y total a pagar), y al mismo tiempo quedan registradas en tu comandera y panel de control en tiempo real.',
      badge: 'WhatsApp + Cloud'
    },
    {
      q: '¿Cómo protege a mi negocio el Escudo de Reseñas de Google Maps?',
      a: 'Cuando un cliente escanea el QR o acerca su teléfono a la placa NFC Tap-to-Rate: si califica con 4 o 5 estrellas, se le redirige directo a Google Maps para publicar su reseña y subir tu posición local. Si califica con 1 a 3 estrellas, se abre un buzón confidencial para que gerencia resuelva la queja en privado antes de que dañe la reputación pública del negocio.',
      badge: 'Google Reviews'
    },
    {
      q: '¿Qué incluye la prueba de 10 días y necesito tarjeta de crédito?',
      a: 'Tienes 10 días completos con todas las herramientas PRO desbloqueadas: Menús con turnos y comandas por mesa, Ruleta & Raspables interactivos, Gift Cards, agendas de citas, escudo de reseñas Google, club de sellos, vCards y generador QR dinámico. No solicitamos ninguna tarjeta de crédito para registrarte.',
      badge: '100% Gratis'
    },
    {
      q: '¿Cómo funciona el precio y la promoción del 50% de descuento?',
      a: 'Si durante tus 10 días de prueba decides activar tu membresía, tu primer mes te queda con un 50% de descuento a solo L. 275 HNL ($10 USD). La tarifa regular mensual es de L. 550 HNL ($20 USD) sin contratos forzosos. Y si adquieres una Placa o Tarjeta física NFC por L. 1,200, ¡incluye 1 año completo PRO de cortesía!',
      badge: 'Precios Claros'
    }
  ]

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index
        return (
          <div
            key={index}
            className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
              isOpen 
                ? 'border-gray-900 bg-white shadow-md' 
                : 'border-gray-200 bg-white/70 hover:bg-white hover:border-gray-300'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 shrink-0">
                  {faq.badge || 'FAQ'}
                </span>
                <span className="font-extrabold text-sm sm:text-base text-gray-950">
                  {faq.q}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-black' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                {faq.a}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
