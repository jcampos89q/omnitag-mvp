'use client'

import { useState } from 'react'
import {
  Check,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  ShieldCheck,
  Building2
} from 'lucide-react'

interface CanvaWorkspaceShowcaseProps {
  starterCheckoutUrl: string
  agencyCheckoutUrl: string
  enterpriseCheckoutUrl: string
}

const CATEGORIES = [
  {
    id: 'brand',
    label: 'Tu Marca Blanca',
    emoji: '🎨',
    activePill: 'bg-purple-600 text-white shadow-md',
    inactivePill: 'bg-white text-gray-700 hover:bg-purple-50 border-gray-200',
    cardBg: 'from-purple-50/90 via-indigo-50/50 to-white',
    badge: '100% Tu Propia Marca y Logo',
    headline: 'Vende la plataforma como si fuera tuya',
    description: 'Sube tu logo, escribe el nombre de tu agencia y pon tus propios precios. Tus clientes jamás ven el nombre OmniTag.',
    cards: [
      {
        icon: '🏷️',
        title: 'Tu Logo en Todo el Sistema',
        text: 'El panel del cliente y el link de registro muestran únicamente tu marca comercial.'
      },
      {
        icon: '💳',
        title: 'Tú Cobras el 100%',
        text: 'Conecta tu propio Stripe, Hotmart, Tilopay, PayPal o cuenta bancaria sin comisiones.'
      },
      {
        icon: '🔒',
        title: 'Control de Sub-Clientes',
        text: 'Activa cuentas por 30 días, 1 año o pausa clientes morosos con un solo clic.'
      }
    ]
  },
  {
    id: 'restaurant',
    label: 'Restaurantes',
    emoji: '🍽️',
    activePill: 'bg-amber-500 text-white shadow-md',
    inactivePill: 'bg-white text-gray-700 hover:bg-amber-50 border-gray-200',
    cardBg: 'from-amber-50/90 via-orange-50/50 to-white',
    badge: 'Sistema para Restaurantes, Bares y Cafés',
    headline: 'Menú QR Interactivo, Pedidos y Ruleta en Mesa',
    description: 'Cuando creas una cuenta con el giro Restaurante, tu cliente recibe automáticamente estas herramientas listas para usar:',
    cards: [
      {
        icon: '🍔',
        title: 'Menú Digital por Turnos',
        text: 'Platos con fotos, precios, variantes y horarios automáticos (Desayuno, Almuerzo, Cena).'
      },
      {
        icon: '📲',
        title: 'Comandas a WhatsApp y Mesa',
        text: 'El comensal arma su pedido desde la mesa o a domicilio y llega directo al restaurante.'
      },
      {
        icon: '🎰',
        title: 'Ruleta y Raspa y Gana',
        text: 'Juegos de premios en mesa para capturar WhatsApp de clientes y subir reseñas en Google.'
      }
    ]
  },
  {
    id: 'beauty',
    label: 'Barberías & Salones',
    emoji: '💈',
    activePill: 'bg-pink-600 text-white shadow-md',
    inactivePill: 'bg-white text-gray-700 hover:bg-pink-50 border-gray-200',
    cardBg: 'from-pink-50/90 via-rose-50/50 to-white',
    badge: 'Sistema para Barberías, Spas y Salones',
    headline: 'Agenda de Citas 24/7, Especialistas y Club de Sellos',
    description: 'Ideal para venderle a barberías, salones de uñas, estéticas y spas de tu ciudad:',
    cards: [
      {
        icon: '📅',
        title: 'Reservas Online 24/7',
        text: 'El cliente elige servicio, barbero o estilista y hora disponible sin tener que llamar.'
      },
      {
        icon: '⭐',
        title: 'Tarjeta Digital de Sellos',
        text: 'Fidelización automática (ej. "En tu 5to corte recibe 50% de descuento").'
      },
      {
        icon: '🎁',
        title: 'Gift Cards con Código QR',
        text: 'Tarjetas de regalo digitales listas para vender y canjear en el local.'
      }
    ]
  },
  {
    id: 'health',
    label: 'Clínicas & Médicos',
    emoji: '🩺',
    activePill: 'bg-sky-600 text-white shadow-md',
    inactivePill: 'bg-white text-gray-700 hover:bg-sky-50 border-gray-200',
    cardBg: 'from-sky-50/90 via-cyan-50/50 to-white',
    badge: 'Sistema para Consultorios, Dentistas y Clínicas',
    headline: 'Expediente Clínico Electrónico (ECE) y Agenda Médica',
    description: 'Uno de los nichos que mejor paga mensualidades. Entrégale a cualquier doctor o clínica su propio portal médico:',
    cards: [
      {
        icon: '📋',
        title: 'Expediente Clínico (ECE)',
        text: 'Registro de pacientes, historial de consultas, signos vitales, alergias y notas médicas.'
      },
      {
        icon: '🩺',
        title: 'Citas por Especialista',
        text: 'Agenda médica organizada por doctor con confirmación rápida por WhatsApp.'
      },
      {
        icon: '⭐',
        title: 'Prestigio Médico en Google',
        text: 'Filtro inteligente de reseñas 5 estrellas para posicionar el consultorio.'
      }
    ]
  },
  {
    id: 'retail',
    label: 'Tiendas & Negocios',
    emoji: '🛍️',
    activePill: 'bg-emerald-600 text-white shadow-md',
    inactivePill: 'bg-white text-gray-700 hover:bg-emerald-50 border-emerald-200',
    cardBg: 'from-emerald-50/90 via-teal-50/50 to-white',
    badge: 'Sistema para Tiendas, Boutiques y Profesionales',
    headline: 'Catálogo con Carrito a WhatsApp, vCard NFC y Cupones',
    description: 'Para todo comercio local o profesional que quiera vender más por WhatsApp y usar tarjetas NFC:',
    cards: [
      {
        icon: '🛒',
        title: 'Catálogo Online con Carrito',
        text: 'Tus clientes suben sus productos con fotos y reciben pedidos listos en su WhatsApp.'
      },
      {
        icon: '💳',
        title: 'Compatible con Tarjetas NFC',
        text: 'Puedes venderles tarjetas o placas NFC físicas junto con la mensualidad del software.'
      },
      {
        icon: '🎟️',
        title: 'Cupones y Descuentos VIP',
        text: 'Captura de prospectos y clientes frecuentes con validación por PIN.'
      }
    ]
  }
]

export default function CanvaWorkspaceShowcase({
  starterCheckoutUrl,
  agencyCheckoutUrl,
  enterpriseCheckoutUrl
}: CanvaWorkspaceShowcaseProps) {
  const [selectedId, setSelectedId] = useState('brand')
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'agency' | 'country'>('agency')

  const current = CATEGORIES.find((c) => c.id === selectedId) || CATEGORIES[0]

  const plans = {
    starter: {
      name: 'Starter Partner (10 Clientes)',
      price: '$49 USD/mes',
      earning: 'Ganas hasta $250 USD/mes (cobrando $25 por cliente)',
      url: starterCheckoutUrl
    },
    agency: {
      name: 'Agency Partner (25 Clientes)',
      price: '$99 USD/mes',
      earning: 'Ganas hasta $625 USD/mes (cobrando $25 por cliente)',
      url: agencyCheckoutUrl
    },
    country: {
      name: 'Country Partner (100 Clientes)',
      price: '$199 USD/mes',
      earning: 'Ganas hasta $2,500 USD/mes (cobrando $25 por cliente)',
      url: enterpriseCheckoutUrl
    }
  }

  const activePlan = plans[selectedPlan]

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 1. PÍLDORAS ESTILO CANVA PARA EXPLORAR QUÉ INCLUYE LA APP */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === selectedId
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedId(cat.id)}
              className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center gap-2 cursor-pointer border ${
                isActive ? `${cat.activePill} border-transparent scale-[1.02]` : cat.inactivePill
              }`}
            >
              <span className="text-base">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* 2. PANEL VISUAL LIMPIO Y ORDENADO ESTILO CANVA */}
      <div className={`rounded-3xl border border-gray-200 shadow-xl bg-gradient-to-br ${current.cardBg} p-6 sm:p-10 space-y-8 text-left`}>
        {/* Encabezado claro de la categoría seleccionada */}
        <div className="max-w-3xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-black text-purple-700 shadow-2xs">
            <span>{current.emoji}</span>
            <span>{current.badge}</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight">
            {current.headline}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* 3 Tarjetas limpias estilo Canva mostrando qué hace el módulo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {current.cards.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl">
                  {card.icon}
                </div>
                <h3 className="text-base sm:text-lg font-black text-gray-950">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {card.text}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-extrabold text-emerald-700">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Incluido en tu licencia</span>
              </div>
            </div>
          ))}
        </div>

        {/* BARRA DE COMPRA DIRECTA DESDE AQUÍ MISMO */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-purple-200 shadow-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-wider text-purple-700">
              1. Elige tu licencia aquí mismo:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedPlan('starter')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                  selectedPlan === 'starter'
                    ? 'bg-gray-950 text-white border-gray-950'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Starter (10 Clientes) • $49/mes
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlan('agency')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                  selectedPlan === 'agency'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                }`}
              >
                ⭐ Agency (25 Clientes) • $99/mes
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlan('country')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                  selectedPlan === 'country'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Country (100 Clientes) • $199/mes
              </button>
            </div>
            <p className="text-xs text-emerald-700 font-bold">
              💡 {activePlan.earning}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <a
              href={activePlan.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-sm sm:text-base px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Comprar {activePlan.name} ({activePlan.price})</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
