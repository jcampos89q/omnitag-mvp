'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Coffee, 
  Gift, 
  Scissors, 
  Disc, 
  QrCode, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Building2,
  ChevronRight,
  TrendingUp,
  Zap
} from 'lucide-react'

interface FeatureAd {
  id: string
  tag: string
  title: string
  subtitle: string
  description: string
  benefits: string[]
  icon: any
  iconBg: string
  accentColor: string
  ctaText: string
}

const BUSINESS_FEATURES: FeatureAd[] = [
  {
    id: 'menus',
    tag: 'CATÁLOGO DIGITAL',
    title: 'Menú & Catálogo con Pedidos Directos a WhatsApp',
    subtitle: 'Vende sin intermediarios ni comisiones de delivery',
    description: 'Tus clientes escanean en mesa o entran desde redes sociales, eligen sus platillos favoritos con fotos apetitosas y envían el pedido listo a tu WhatsApp empresarial.',
    benefits: [
      'Cero comisiones por venta (ahorra el 30% de apps de delivery)',
      'Fotos en alta resolución, categorías, precios y extras',
      'Botón "Pedir por WhatsApp" que envía el resumen formateado',
      'Actualizaciones de precios al instante sin reimprimir papel'
    ],
    icon: Coffee,
    iconBg: 'bg-amber-500 text-white',
    accentColor: 'border-amber-500/30 bg-amber-50/40 text-amber-900',
    ctaText: 'Sumar Menú Digital por L. 550/mes'
  },
  {
    id: 'loyalty',
    tag: 'FIDELIZACIÓN INTELIGENTE',
    title: 'Club de Sellos Digitales para Clientes Frecuentes',
    subtitle: 'Haz que tus clientes regresen 3 veces más seguido',
    description: 'Despídete de las tarjetas de cartón que siempre se pierden en la billetera. Tus clientes acumulan sellos escaneando tu código en caja y ganan recompensas exclusivas.',
    benefits: [
      'Multiplica visitas repetidas premiando la lealtad',
      'Validación antifraude con PIN privado de cajero o dueño',
      'Base de datos de clientes fieles con nombre y teléfono',
      'Diseño personalizado con el logo y colores de tu marca'
    ],
    icon: Gift,
    iconBg: 'bg-purple-600 text-white',
    accentColor: 'border-purple-500/30 bg-purple-50/40 text-purple-900',
    ctaText: 'Activar Club de Sellos por L. 550/mes'
  },
  {
    id: 'appointments',
    tag: 'AUTOMATIZACIÓN DE CITAS',
    title: 'Sistema de Agendas & Citas Online 24/7',
    subtitle: 'Elimina los mensajes interminables de "a qué hora tienes libre"',
    description: 'Diseñado para barberías, salones de belleza, spas, consultorios y terapeutas. Tus clientes eligen el servicio, seleccionan a su especialista preferido y reservan su turno.',
    benefits: [
      'Agenda abierta las 24 horas del día incluso cuando duermes',
      'Gestión de especialistas con fotos, turnos y horarios',
      'Control de días festivos, descansos y duración por servicio',
      'Notificaciones y confirmaciones directas por WhatsApp'
    ],
    icon: Scissors,
    iconBg: 'bg-indigo-600 text-white',
    accentColor: 'border-indigo-500/30 bg-indigo-50/40 text-indigo-900',
    ctaText: 'Tener Agenda Online por L. 550/mes'
  },
  {
    id: 'ruleta',
    tag: 'GAMIFICACIÓN & VENTAS',
    title: 'Ruleta de Premios Interactiva para Mesas',
    subtitle: 'Divierte a tus clientes en mesa y captura sus datos',
    description: 'Una experiencia interactiva que encanta a los comensales. Los clientes giran la ruleta en su móvil para ganar descuentos, postres gratis o cortesías configuradas por ti.',
    benefits: [
      'Aumenta el consumo y el ticket promedio en mesa',
      'Control de probabilidades y límites de stock para evitar pérdidas',
      'Captura nombre y WhatsApp antes de permitir el giro',
      'Cupones con código único para canje inmediato en caja'
    ],
    icon: Disc,
    iconBg: 'bg-rose-600 text-white',
    accentColor: 'border-rose-500/30 bg-rose-50/40 text-rose-900',
    ctaText: 'Instalar Ruleta por L. 550/mes'
  },
  {
    id: 'qr_studio',
    tag: 'DISEÑO PARA IMPRENTA',
    title: 'Estudio QR en Alta Definición (2000px & SVG)',
    subtitle: 'Códigos QR profesionales que tus clientes sí quieren escanear',
    description: 'Genera códigos QR de ultra alta resolución con degradados estilo Instagram, marcos prediseñados para acrílicos de mesa y tu logotipo en el centro, listos para imprenta.',
    benefits: [
      'Descargas en PNG de 2000px y vectores SVG para rotulación',
      'Marcos con llamadas a la acción ("Escanea para el Menú", "Síguenos")',
      'Inserción de logotipo central en alta calidad sin pixelarse',
      'Control de colores corporativos y redondeo de puntos'
    ],
    icon: QrCode,
    iconBg: 'bg-emerald-600 text-white',
    accentColor: 'border-emerald-500/30 bg-emerald-50/40 text-emerald-900',
    ctaText: 'Desbloquear Estudio QR HD por L. 550/mes'
  }
]

export default function BusinessUpgradesShowcase({
  currentAccountType = 'professional'
}: {
  currentAccountType?: 'professional' | 'review_plate' | string
}) {
  // Iniciar en un anuncio aleatorio para que cada visita/recarga sea una novedad fresca
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    // Escoge aleatoriamente un índice al montar en el cliente
    const randomIndex = Math.floor(Math.random() * BUSINESS_FEATURES.length)
    setSelectedIndex(randomIndex)
  }, [])

  const activeAd = BUSINESS_FEATURES[selectedIndex]
  const IconComponent = activeAd.icon

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs p-5 sm:p-7 space-y-6 overflow-hidden relative">
      {/* Cabecera del Showcase */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-linear-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" />
              ECOSISTEMA EMPRESARIAL OMNITAG
            </span>
            <span className="text-xs font-bold text-gray-500 hidden sm:inline">
              • Suscripción Mensual
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
            Descubre las aplicaciones de marketing que puedes sumar a tu cuenta
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {currentAccountType === 'review_plate'
              ? 'Tu Placa NFC incluye 1 año de Reseñas Google. Si tu negocio también necesita catálogo, citas o fidelización, puedes sumarlos con la membresía mensual.'
              : 'Tu perfil actual cuenta con vCard Digital. Puedes transformar tu cuenta en una central completa de ventas y marketing con nuestra suite mensual.'}
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0 bg-gray-50 px-3.5 py-2 rounded-2xl border border-gray-100">
          <div className="text-xs font-bold text-gray-500">Suite Completa</div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-gray-900">L. 550</span>
            <span className="text-[10px] text-gray-500 font-medium">HNL / mes</span>
          </div>
        </div>
      </div>

      {/* Selector de pestañas interactivas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {BUSINESS_FEATURES.map((item, idx) => {
          const TabIcon = item.icon
          const isSelected = idx === selectedIndex
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{item.tag}</span>
            </button>
          )
        })}
      </div>

      {/* Contenedor del Anuncio Destacado */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${activeAd.accentColor}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${activeAd.iconBg}`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block mb-0.5">
                  Herramienta de la Suite de Negocio
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900 leading-snug">
                  {activeAd.title}
                </h3>
                <p className="text-xs font-semibold text-gray-600 mt-0.5">
                  {activeAd.subtitle}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-black/5">
              {activeAd.description}
            </p>

            {/* Lista de beneficios de esta herramienta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {activeAd.benefits.map((benefit, bIdx) => (
                <div key={bIdx} className="flex items-start gap-2 text-gray-800">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-tight">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta de Acción / Upgrade */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Precio de Membresía
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-gray-900">L. 550</span>
                <span className="text-xs text-gray-500 font-medium">HNL / mes</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Incluye <b>todas</b> las herramientas de marketing, menús, sellos, citas, ruleta y QR HD para tu negocio.
              </p>
            </div>

            <div className="space-y-2">
              <Link
                href="/dashboard/billing#metodos-pago"
                className="w-full bg-black hover:bg-gray-800 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>{activeAd.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="https://wa.me/50498877763?text=Hola%20OmniTag,%20tengo%20una%20cuenta%20anual%20y%20me%20gustar%C3%ADa%20activar%20la%20Suite%20Empresarial%20mensual"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 border border-emerald-200"
              >
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
