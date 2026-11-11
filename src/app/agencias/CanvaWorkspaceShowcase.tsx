'use client'

import { useState } from 'react'
import {
  Palette,
  Utensils,
  Scissors,
  Stethoscope,
  ShoppingBag,
  DollarSign,
  Check,
  Sparkles,
  ArrowRight,
  Lock,
  Smartphone,
  LayoutDashboard
} from 'lucide-react'

interface CanvaWorkspaceShowcaseProps {
  agencyCheckoutUrl: string
}

const WORKSPACE_TABS = [
  {
    id: 'brand',
    label: 'Tu Marca Blanca',
    emoji: '🎨',
    pillColor: 'bg-purple-600 text-white shadow-purple-200',
    inactiveColor: 'bg-purple-50 text-purple-800 hover:bg-purple-100 border-purple-200',
    accentBg: 'from-purple-50 via-indigo-50/40 to-white',
    badge: 'Personalización en 1 Clic',
    title: 'Ponle tu nombre y logo a toda la plataforma',
    subtitle: 'Tus clientes entran a un panel limpio con tu identidad. Jamás ven el nombre OmniTag.',
    clientViewTitle: 'Panel General de Agencia',
    clientBusiness: 'Vista de tu Consola Partner',
    features: [
      { label: 'Logo y Nombre Propio', value: 'Activo en barra y login', status: 'Listo' },
      { label: 'Link de Invitación', value: 'omnitag.site/register?partner=tu-marca', status: 'Único' },
      { label: 'Pasarela Directa', value: '100% de los cobros van a tu cuenta', status: 'Directo' }
    ],
    mobileCard: {
      tag: 'VISTA DEL SUB-CLIENTE',
      heading: 'Bienvenido a tu Panel',
      desc: 'El cliente ve tu marca en el menú superior y te paga su mensualidad directamente a ti.',
      buttonText: 'Configurar Mi Negocio'
    }
  },
  {
    id: 'restaurant',
    label: 'Restaurantes',
    emoji: '🍽️',
    pillColor: 'bg-amber-500 text-white shadow-amber-200',
    inactiveColor: 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200',
    accentBg: 'from-amber-50 via-orange-50/40 to-white',
    badge: 'Giro Gastronómico',
    title: 'Menús QR, Comandas y Ruleta de Premios',
    subtitle: 'Actívale este giro a restaurantes, bares y cafeterías con un solo clic.',
    clientViewTitle: 'Módulo Restaurante Activo',
    clientBusiness: 'Ej. La Parrilla Gourmet',
    features: [
      { label: 'Menú Interactivo por Turno', value: 'Desayuno, Almuerzo y Cena', status: 'Incluido' },
      { label: 'Pedidos a WhatsApp / Mesa', value: 'Carrito listo sin comisiones', status: 'Incluido' },
      { label: 'Ruleta y Raspa en Mesa', value: 'Captura clientes y reseñas 5★', status: 'Incluido' }
    ],
    mobileCard: {
      tag: 'MENÚ DIGITAL + JUEGOS',
      heading: 'Pide desde tu Mesa 🍔',
      desc: 'Tus clientes escanean el QR o tarjeta NFC, piden al instante y giran la ruleta.',
      buttonText: 'Ver Menú & Ordenar'
    }
  },
  {
    id: 'beauty',
    label: 'Barberías & Spas',
    emoji: '💈',
    pillColor: 'bg-pink-600 text-white shadow-pink-200',
    inactiveColor: 'bg-pink-50 text-pink-900 hover:bg-pink-100 border-pink-200',
    accentBg: 'from-pink-50 via-rose-50/40 to-white',
    badge: 'Giro Belleza & Citas',
    title: 'Agenda de Citas 24/7, Especialistas y Tarjeta de Sellos',
    subtitle: 'Ideal para barberías, salones de uñas, spas y estudios de tatuaje.',
    clientViewTitle: 'Módulo de Citas & Lealtad',
    clientBusiness: 'Ej. Royal Barber Studio',
    features: [
      { label: 'Agenda por Especialista', value: 'Reserva de hora sin llamadas', status: 'Incluido' },
      { label: 'Tarjeta Digital de Sellos', value: 'Ej. 5to corte gratis automático', status: 'Incluido' },
      { label: 'Gift Cards Digitales', value: 'Tarjetas de regalo con código QR', status: 'Incluido' }
    ],
    mobileCard: {
      tag: 'RESERVA EN 30 SEGUNDOS',
      heading: 'Agenda tu Cita Online ✂️',
      desc: 'Elige servicio, barbero o estilista, fecha disponible y acumula sellos.',
      buttonText: 'Reservar Ahora'
    }
  },
  {
    id: 'health',
    label: 'Clínicas & Médicos',
    emoji: '🩺',
    pillColor: 'bg-sky-600 text-white shadow-sky-200',
    inactiveColor: 'bg-sky-50 text-sky-900 hover:bg-sky-100 border-sky-200',
    accentBg: 'from-sky-50 via-cyan-50/40 to-white',
    badge: 'Giro Salud & Consultorios',
    title: 'Expediente Clínico Electrónico (ECE) y Citas Médicas',
    subtitle: 'Véndele a dentistas, médicos generales, psicólogos, fisioterapeutas y veterinarias.',
    clientViewTitle: 'Módulo Clínico & Pacientes',
    clientBusiness: 'Ej. Clínica Dental Sonrisa',
    features: [
      { label: 'Expediente Clínico (ECE)', value: 'Historial, notas y recetas PDF', status: 'Incluido' },
      { label: 'Agenda de Consultas', value: 'Recordatorios por WhatsApp', status: 'Incluido' },
      { label: 'Filtro de Reseñas Google', value: 'Posiciona al médico en su ciudad', status: 'Incluido' }
    ],
    mobileCard: {
      tag: 'PORTAL DEL PACIENTE',
      heading: 'Agendar Consulta Médica 🩺',
      desc: 'Ficha profesional del especialista, ubicación en mapa y reserva de cita.',
      buttonText: 'Agendar Consulta'
    }
  },
  {
    id: 'retail',
    label: 'Tiendas & Comercios',
    emoji: '🛍️',
    pillColor: 'bg-emerald-600 text-white shadow-emerald-200',
    inactiveColor: 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border-emerald-200',
    accentBg: 'from-emerald-50 via-teal-50/40 to-white',
    badge: 'Giro Retail & Catálogo',
    title: 'Catálogo con Carrito a WhatsApp, Gift Cards y Club VIP',
    subtitle: 'Perfecto para boutiques, tiendas de regalos, ferreterías y emprendimientos.',
    clientViewTitle: 'Módulo Catálogo & Ventas',
    clientBusiness: 'Ej. Boutique Moda Viva',
    features: [
      { label: 'Catálogo con Precios y Fotos', value: 'Pedidos directos a WhatsApp', status: 'Incluido' },
      { label: 'Gift Cards y Cupones', value: 'Canje con PIN de seguridad', status: 'Incluido' },
      { label: 'vCard + Redes Sociales', value: 'Todo en un solo link o placa NFC', status: 'Incluido' }
    ],
    mobileCard: {
      tag: 'TIENDA EN LÍNEA RÁPIDA',
      heading: 'Explora el Catálogo 🛍️',
      desc: 'Tus clientes eligen productos, aplican cupones y envían su pedido en 1 clic.',
      buttonText: 'Comprar por WhatsApp'
    }
  }
]

export default function CanvaWorkspaceShowcase({
  agencyCheckoutUrl
}: CanvaWorkspaceShowcaseProps) {
  const [activeTabId, setActiveTabId] = useState('brand')
  const [brandName, setBrandName] = useState('Mi Agencia Digital')
  const [monthlyPrice, setMonthlyPrice] = useState('25')

  const activeTab = WORKSPACE_TABS.find((t) => t.id === activeTabId) || WORKSPACE_TABS[0]
  const displayBrand = brandName.trim() || 'Tu Propia Marca'

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 1. BARRA DE PÍLDORAS INTERACTIVAS ESTILO CANVA */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
        {WORKSPACE_TABS.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? `${tab.pillColor} border-transparent shadow-md scale-[1.03]`
                  : `${tab.inactiveColor}`
              }`}
            >
              <span className="text-base leading-none">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 2. BARRA RÁPIDA PARA PROBAR TU NOMBRE DE MARCA EN VIVO */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-2 sm:p-2.5 border border-gray-200/90 shadow-sm flex flex-col sm:flex-row items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 w-full sm:flex-1">
          <Palette className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Prueba tu marca aquí:</span>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            maxLength={28}
            placeholder="Escribe el nombre de tu agencia..."
            className="w-full text-xs sm:text-sm font-black text-gray-900 bg-purple-50/70 focus:bg-white px-3 py-1.5 rounded-xl border border-purple-200 focus:border-purple-500 focus:outline-none transition"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 border-t sm:border-t-0 sm:border-l border-gray-100 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Tu cobro/cliente:</span>
          <div className="flex items-center bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-1">
            <span className="text-xs font-black text-emerald-700">$</span>
            <input
              type="number"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              min={5}
              max={500}
              className="w-12 text-xs sm:text-sm font-black text-emerald-800 bg-transparent focus:outline-none text-center"
            />
            <span className="text-[11px] font-bold text-emerald-700">/mes</span>
          </div>
        </div>
      </div>

      {/* 3. LIENZO DE APLICACIÓN ESTILO CANVA (LIMPIO, VISUAL E INTUITIVO) */}
      <div className={`rounded-3xl border border-gray-200/90 shadow-2xl overflow-hidden bg-gradient-to-br ${activeTab.accentBg} transition-all duration-300`}>
        {/* Barra Superior de la App */}
        <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                {displayBrand.charAt(0).toUpperCase()}
              </div>
              <span className="font-black text-sm text-gray-900 tracking-tight">
                {displayBrand}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Marca Blanca Activa
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <span className="hidden md:inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
              <Lock className="w-3 h-3 text-emerald-600" />
              Giro bloqueado por 30 días
            </span>
            <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg font-extrabold">
              Cobras ${Number(monthlyPrice) || 25}/mes directo a tu cuenta
            </span>
          </div>
        </div>

        {/* Contenido Principal del Lienzo */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
          {/* Columna Izquierda: Explicación simple + Tarjetas de Funciones */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-700 bg-white px-3 py-1 rounded-full border border-purple-200 shadow-2xs">
                <span>{activeTab.emoji}</span>
                <span>{activeTab.badge}</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-tight">
                {activeTab.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                {activeTab.subtitle}
              </p>
            </div>

            {/* 3 Tarjetas visuales súper limpias */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeTab.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="bg-white/95 rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {feat.status}
                    </span>
                  </div>
                  <p className="font-extrabold text-xs sm:text-sm text-gray-900 pt-1">
                    {feat.label}
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {feat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Barra de Ganancia Simulada en Tiempo Real */}
            <div className="bg-gray-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                  Calculadora Rápida con {displayBrand}
                </p>
                <p className="text-sm sm:text-base font-black">
                  25 clientes × ${Number(monthlyPrice) || 25}/mes ={' '}
                  <span className="text-emerald-400">
                    ${(Number(monthlyPrice) || 25) * 25} USD/mes para ti
                  </span>
                </p>
              </div>
              <a
                href={agencyCheckoutUrl}
                className="hotmart-fb hotmart__button-checkout shrink-0 bg-white hover:bg-gray-100 text-gray-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Lanzar Mi Marca</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Columna Derecha: Simulador Visual del Celular / Panel del Cliente */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[320px] bg-white rounded-3xl border-4 border-gray-900 shadow-2xl overflow-hidden">
              {/* Cabecera del móvil con la marca del distribuidor */}
              <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                    {displayBrand.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-extrabold text-xs truncate max-w-[140px]">
                    {displayBrand}
                  </span>
                </div>
                <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-bold">
                  {activeTab.emoji} Activo
                </span>
              </div>

              {/* Cuerpo de la vista previa */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <p className="text-[10px] font-black uppercase text-purple-600">
                      {activeTab.mobileCard.tag}
                    </p>
                    <h4 className="text-base font-black text-gray-900 mt-0.5">
                      {activeTab.mobileCard.heading}
                    </h4>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-xl">
                    {activeTab.emoji}
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {activeTab.mobileCard.desc}
                </p>

                {/* Mini indicadores de la app */}
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-600">Proveedor del Sistema:</span>
                    <span className="font-black text-gray-900">{displayBrand}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-600">Suscripción del Cliente:</span>
                    <span className="font-black text-emerald-700">${Number(monthlyPrice) || 25} USD/mes</span>
                  </div>
                </div>

                <div className="w-full py-2.5 px-4 rounded-xl bg-gray-900 text-white text-center font-black text-xs shadow-sm">
                  {activeTab.mobileCard.buttonText}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
