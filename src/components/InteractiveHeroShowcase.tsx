'use client'

import { useState } from 'react'
import { 
  UtensilsCrossed, 
  Scissors, 
  Star, 
  Gift, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  MessageCircle,
  ShieldCheck,
  Calendar,
  MapPin,
  Heart
} from 'lucide-react'

type TabKey = 'menu' | 'citas' | 'reviews' | 'sellos'

export default function InteractiveHeroShowcase() {
  const [activeTab, setActiveTab] = useState<TabKey>('menu')

  return (
    <div className="w-full max-w-4xl mx-auto pt-4 pb-2">
      {/* Botones de Selección de Vista Interactiva */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 bg-gray-100/90 backdrop-blur-md rounded-2xl max-w-xl mx-auto border border-gray-200/80 shadow-inner overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'menu'
              ? 'bg-white text-gray-950 shadow-md scale-[1.02]'
              : 'text-gray-600 hover:text-black hover:bg-white/50'
          }`}
        >
          <span>🍽️</span>
          <span>Menú & Turnos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('citas')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'citas'
              ? 'bg-white text-gray-950 shadow-md scale-[1.02]'
              : 'text-gray-600 hover:text-black hover:bg-white/50'
          }`}
        >
          <span>💈</span>
          <span>Citas 24/7</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'bg-white text-gray-950 shadow-md scale-[1.02]'
              : 'text-gray-600 hover:text-black hover:bg-white/50'
          }`}
        >
          <span>⭐</span>
          <span>Reseñas Google</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sellos')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sellos'
              ? 'bg-white text-gray-950 shadow-md scale-[1.02]'
              : 'text-gray-600 hover:text-black hover:bg-white/50'
          }`}
        >
          <span>🎁</span>
          <span>Club de Sellos</span>
        </button>
      </div>

      {/* Mockup de Teléfono Móvil con Pantalla Dinámica */}
      <div className="mt-6 relative max-w-sm sm:max-w-md mx-auto">
        {/* Resplandor decorativo de fondo */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-amber-500/20 to-emerald-500/20 rounded-[44px] blur-xl opacity-75 -z-10" />

        {/* Marco de Smartphone */}
        <div className="bg-gray-950 p-3 sm:p-3.5 rounded-[40px] shadow-2xl border-4 border-gray-800">
          {/* Isla dinámica / Speaker */}
          <div className="w-24 h-4 bg-gray-900 rounded-full mx-auto mb-2 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-950/80 mr-1" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-950" />
          </div>

          {/* Pantalla del Smartphone */}
          <div className="bg-white rounded-[28px] overflow-hidden min-h-[440px] flex flex-col justify-between border border-gray-100">
            {/* VISTA 1: MENÚ RESTAURANTE */}
            {activeTab === 'menu' && (
              <div className="p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
                {/* Cabecera del Restaurante */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm font-black shadow-xs">
                      🔥
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-gray-900 leading-tight">La Fogata Parrillada</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-amber-600" />
                        <span>Mesa #4 • En el local</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Abierto
                  </span>
                </div>

                {/* Switcher de Turno Activo */}
                <div className="bg-amber-50 border border-amber-200/80 p-2 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-black text-amber-950 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-700" />
                      <span>Turno Activo: Almuerzos</span>
                    </span>
                    <span className="font-bold text-amber-800">10:30 AM - 3:30 PM</span>
                  </div>
                  <p className="text-[9px] text-amber-900/80">
                    Mostrando platos del turno actual. ¿Deseas ver todo? <span className="underline font-bold">Ver Todo</span>
                  </p>
                </div>

                {/* Plato del Día Único de Hoy */}
                <div className="p-2.5 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-700 fill-current" />
                      <span>Plato del Día de Hoy</span>
                    </span>
                    <span className="text-xs font-black text-amber-900">L. 140.00</span>
                  </div>
                  <p className="font-extrabold text-xs text-gray-900">Sopa Marinera Especial de la Casa</p>
                  <p className="text-[10px] text-gray-600 line-clamp-1">
                    Con camarón, caracol, pescado frito, arroz blanco y tajaditas.
                  </p>
                </div>

                {/* Platillos del Menú */}
                <div className="space-y-2">
                  <div className="p-2 rounded-xl border border-gray-100 flex items-center justify-between hover:border-gray-200 bg-gray-50/50">
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-gray-900">Puyazo a la Parrilla 8oz</p>
                      <p className="text-[10px] text-gray-500">Acompañado de frijoles fritos, chismol y queso.</p>
                      <p className="text-xs font-black text-gray-900">L. 220.00</p>
                    </div>
                    <button type="button" className="p-1.5 rounded-lg bg-black text-white hover:bg-gray-800 text-xs">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2 rounded-xl border border-gray-100 flex items-center justify-between hover:border-gray-200 bg-gray-50/50">
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-gray-900">Costillitas BBQ Ahumadas</p>
                      <p className="text-[10px] text-gray-500">Bañadas en salsa BBQ artesanal con papas fritas.</p>
                      <p className="text-xs font-black text-gray-900">L. 195.00</p>
                    </div>
                    <button type="button" className="p-1.5 rounded-lg bg-black text-white hover:bg-gray-800 text-xs">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Botón Flotante de Comanda a WhatsApp */}
                <div className="pt-1">
                  <div className="bg-emerald-600 text-white p-2.5 rounded-xl flex items-center justify-between text-xs font-extrabold shadow-md">
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Pedir a Cocina (Mesa #4)</span>
                    </div>
                    <span>L. 360.00 →</span>
                  </div>
                </div>
              </div>
            )}

            {/* VISTA 2: CITAS & SALONES */}
            {activeTab === 'citas' && (
              <div className="p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm font-black shadow-xs">
                      ✂️
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-gray-900 leading-tight">Studio VIP Barbería</p>
                      <p className="text-[10px] text-purple-700 font-semibold">Reserva en línea 24/7</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                    4.9 ⭐ (128)
                  </span>
                </div>

                {/* Selector de Especialista */}
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Elige tu Especialista:</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="p-1.5 rounded-xl border-2 border-black bg-black/5 text-center">
                      <p className="text-xs font-bold text-gray-900">Carlos</p>
                      <p className="text-[9px] text-gray-500 font-semibold">Master</p>
                    </div>
                    <div className="p-1.5 rounded-xl border border-gray-200 bg-white text-center">
                      <p className="text-xs font-bold text-gray-700">Mariana</p>
                      <p className="text-[9px] text-gray-400">Estilista</p>
                    </div>
                    <div className="p-1.5 rounded-xl border border-gray-200 bg-white text-center">
                      <p className="text-xs font-bold text-gray-700">David</p>
                      <p className="text-[9px] text-gray-400">Barbero</p>
                    </div>
                  </div>
                </div>

                {/* Servicio Elegido */}
                <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-purple-950">Corte Ejecutivo + Barba</span>
                    <span className="font-black text-purple-900">L. 250.00</span>
                  </div>
                  <p className="text-[10px] text-purple-900/80 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-700" />
                    <span>Duración: 45 min • Incluye toalla caliente y lavado</span>
                  </p>
                </div>

                {/* Horarios Disponibles en Vivo */}
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Horarios para Hoy:</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <span className="p-1.5 rounded-lg border border-purple-400 bg-purple-600 text-white text-[11px] font-black text-center shadow-xs">
                      3:30 PM
                    </span>
                    <span className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-[11px] font-bold text-center">
                      4:30 PM
                    </span>
                    <span className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-[11px] font-bold text-center">
                      5:30 PM
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button type="button" className="w-full bg-black text-white text-xs font-black py-2.5 rounded-xl shadow-md hover:bg-gray-800 transition">
                    Confirmar Reserva con Carlos
                  </button>
                </div>
              </div>
            )}

            {/* VISTA 3: RESEÑAS GOOGLE NFC */}
            {activeTab === 'reviews' && (
              <div className="p-4 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center text-xl font-black mx-auto shadow-xs">
                  ⭐
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-black text-gray-900">¿Cómo fue tu experiencia hoy?</p>
                  <p className="text-[10px] text-gray-500">Toca las estrellas para calificar nuestro servicio en 1 segundo:</p>
                </div>

                {/* Estrellas Interactivas */}
                <div className="flex items-center justify-center gap-2 text-yellow-400 py-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-7 h-7 fill-current stroke-yellow-500 transition hover:scale-110 cursor-pointer" />
                  ))}
                </div>

                {/* Escudo Inteligente de Reputación */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Escudo Antirreclamos Inteligente</span>
                  </div>
                  <p className="text-[10px] text-emerald-800/90 leading-relaxed">
                    <b>5 Estrellas:</b> Se abren en Google Maps en 1 toque.<br />
                    <b>1 a 3 Estrellas:</b> Se envían a un buzón privado para resolver la queja de inmediato sin dañar tu reputación pública.
                  </p>
                </div>

                <div className="bg-blue-600 text-white text-xs font-black py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2">
                  <span>Publicar en Google Reviews (5★)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* VISTA 4: CLUB DE SELLOS Y FIDELIZACIÓN */}
            {activeTab === 'sellos' && (
              <div className="p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm font-black shadow-xs">
                      🎁
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-gray-900 leading-tight">Café & Bistró Gourmet</p>
                      <p className="text-[10px] text-purple-700 font-semibold">Tarjeta de Fidelización Digital</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    Nivel Oro
                  </span>
                </div>

                {/* Tarjeta de Sellos con Progreso */}
                <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white p-3.5 rounded-2xl shadow-md space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold opacity-80">Progreso de Visitas</span>
                    <span className="font-black text-yellow-300">6 de 8 Sellos</span>
                  </div>

                  {/* Cuadrícula de 8 Sellos */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                      <div key={idx} className="h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-yellow-400/60 shadow-xs">
                        <Sparkles className="w-4 h-4 text-yellow-300 fill-current" />
                      </div>
                    ))}
                    <div className="h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 opacity-50">
                      <span className="text-xs font-bold">7</span>
                    </div>
                    <div className="h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black text-sm shadow-md animate-pulse">
                      🎁
                    </div>
                  </div>

                  <p className="text-[10px] text-yellow-200/90 pt-1">
                    ¡Completa 2 visitas más y tu siguiente bebida de especialidad es <b>100% GRATIS</b>!
                  </p>
                </div>

                {/* Sellado Rápido con PIN */}
                <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-[10px]">
                  <span className="text-gray-600 font-medium">Validación en caja por PIN antifraude:</span>
                  <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Sin App • Directo al Móvil
                  </span>
                </div>
              </div>
            )}

            {/* Pie de Pantalla del Smartphone */}
            <div className="bg-gray-50 p-2.5 text-center border-t border-gray-100 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-gray-500">
                Experiencia móvil en tiempo real sin descargar aplicaciones
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
