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
      q: '¿Mis clientes necesitan descargar alguna aplicación para usar el menú o reservar?',
      a: 'No, absolutamente ninguna. Todo funciona de forma instantánea en el navegador web de cualquier teléfono móvil (iPhone o Android) con solo escanear el código QR o acercar el smartphone a una placa o tarjeta física NFC. Sin fricción, sin registros tediosos y sin ocupar espacio en el teléfono.',
      badge: 'Cero Fricción'
    },
    {
      q: '¿Cómo funciona el Menú Digital inteligente para restaurantes?',
      a: 'El menú detecta automáticamente la hora y prioriza el turno activo del restaurante (por ejemplo: Desayunos en la mañana, Almuerzos al mediodía o Cenas en la noche). Además, cuenta con una sección dedicada para el "Plato del Día" que cambia a diario y no se repite, y permite a los comensales pedir directamente a la cocina por número de mesa (#Mesa QR) o cambiar para ver toda la carta con un solo clic.',
      badge: 'Restaurantes'
    },
    {
      q: '¿Cómo recibo las comandas de los platos o las reservas de citas?',
      a: 'Llegan estructuradas y detalladas al instante a tu número de WhatsApp (con número de mesa o especialista, notas especiales, hora y total a pagar), y al mismo tiempo quedan guardadas en tu panel de control y comandera en tiempo real para tu equipo.',
      badge: 'WhatsApp + Cloud'
    },
    {
      q: '¿Cómo protege a mi negocio el Escudo de Reseñas de Google?',
      a: 'Cuando un cliente escanea el QR o acerca su teléfono a la placa NFC Tap-to-Rate: si califica con 4 o 5 estrellas, se le redirige directamente a Google Maps para publicar su reseña y subir tu posición local. Si califica con 1 a 3 estrellas, se abre un buzón confidencial para que gerencia resuelva la queja en privado antes de que dañe la reputación pública del negocio.',
      badge: 'Google Reviews'
    },
    {
      q: '¿Qué incluye la prueba de 10 días y necesito tarjeta de crédito?',
      a: 'Tienes 10 días completos con todas las herramientas PRO desbloqueadas (Menús digitales con comandas, agendas de citas, escudo de reseñas Google, club de sellos, vCards y generador QR dinámico). No solicitamos ninguna tarjeta de crédito para registrarte.',
      badge: '100% Gratis'
    },
    {
      q: '¿Cómo funciona la promoción del 50% de descuento?',
      a: 'Si durante tus primeros 3 días de prueba decides activar tu membresía mediante depósito o transferencia bancaria, tu primer mes te queda a solo L. 275 HNL ($10 USD). La mensualidad regular es de L. 550 HNL. No hay contratos forzosos ni cargos ocultos.',
      badge: 'Promoción'
    },
    {
      q: '¿Tienen tarjetas o placas físicas NFC disponibles?',
      a: 'Sí. En nuestra Tienda Oficial contamos con Tarjetas de Presentación Inteligentes (Matte Black) y Placas de Mostrador en vinil sobre PVC de alta durabilidad para reseñas y mesas. Lo mejor es que cada dispositivo físico ya incluye 1 Año Completo de membresía PRO y envíos a toda Honduras.',
      badge: 'Hardware NFC'
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
