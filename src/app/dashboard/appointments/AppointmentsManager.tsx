'use client'

import { useState } from 'react'
import { 
  Calendar, 
  Users, 
  Scissors, 
  Star, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Phone, 
  Sparkles,
  MessageCircle,
  ShieldCheck,
  User,
  Building2,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import ImageUploadInput from '@/components/ImageUploadInput'
import { createOrUpdateBusiness, createSpecialist, deleteSpecialist, createService, deleteService, updateBookingStatus, toggleSpecialistAvailability, createManualBlockOrBooking, deleteBooking } from './actions'
import { generateTimeSlotsForDate } from '@/lib/schedule'

interface AppointmentsManagerProps {
  business: any
  specialists: any[]
  services: any[]
  bookings: any[]
  reviews: any[]
  isPro?: boolean
}

export default function AppointmentsManager({
  business,
  specialists,
  services,
  bookings,
  reviews,
  isPro = false
}: AppointmentsManagerProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'specialists' | 'services' | 'reviews' | 'business'>('bookings')
  const [showAddSpecialist, setShowAddSpecialist] = useState(false)
  const [showAddService, setShowAddService] = useState(false)
  const [showAddBlock, setShowAddBlock] = useState(false)

  const timeSlots = generateTimeSlotsForDate(
    business?.schedule_config,
    new Date().toISOString().slice(0, 10)
  ).length > 0 ? generateTimeSlotsForDate(business?.schedule_config, new Date().toISOString().slice(0, 10)) : [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM'
  ]

  return (
    <div className="space-y-6">
      {/* Cabecera con Enlace Público */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 bg-linear-to-r from-gray-900 via-purple-950 to-black text-white rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3 fill-black" /> Módulo de Agendas & Especialistas
          </div>
          <h2 className="text-xl sm:text-2xl font-black">{business.name}</h2>
          <p className="text-xs text-purple-200">
            {specialists.length} especialistas • {services.length} servicios activos • {bookings.length} citas registradas
          </p>
        </div>

        <a
          href={`/b/${business.slug}`}
          target="_blank"
          rel="noreferrer"
          className="bg-white hover:bg-gray-100 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
        >
          <span>Ver Enlace de Reservas</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex gap-2 overflow-x-auto pb-1 bg-gray-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'bookings' ? 'bg-white text-black shadow-xs' : 'text-gray-600 hover:text-black'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agenda de Citas ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('specialists')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'specialists' ? 'bg-white text-black shadow-xs' : 'text-gray-600 hover:text-black'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Barberos & Especialistas ({specialists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'services' ? 'bg-white text-black shadow-xs' : 'text-gray-600 hover:text-black'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Servicios & Precios ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'reviews' ? 'bg-white text-black shadow-xs' : 'text-gray-600 hover:text-black'
          }`}
        >
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>Muro de Calificaciones ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('business')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'business' ? 'bg-white text-black shadow-xs' : 'text-gray-600 hover:text-black'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Configuración</span>
        </button>
      </div>

      {/* PESTAÑA 1: AGENDA DE CITAS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Agenda de Turnos & Citas</h3>
              <span className="text-xs text-gray-500 font-medium">Sincronizado en tiempo real</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAddBlock(!showAddBlock)}
              className="bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-gray-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-yellow-400" />
              <span>{showAddBlock ? 'Cerrar' : '+ Bloquear Horario / Salida Temprana'}</span>
            </button>
          </div>

          {/* Formulario de Bloqueo de Horario o Cita Presencial */}
          {showAddBlock && (
            <form action={createManualBlockOrBooking} className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-4 animate-in fade-in">
              <input type="hidden" name="business_id" value={business.id} />
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">🔒</span>
                <h4 className="font-extrabold text-sm text-amber-950">Bloquear Horario o Registrar Cita en Local</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Especialista</label>
                  <select name="specialist_id" className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none">
                    <option value="">Todos los especialistas</option>
                    {specialists.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha *</label>
                  <input type="date" name="booking_date" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hora a Bloquear *</label>
                  <select name="booking_time" required className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none">
                    {timeSlots.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Motivo / Razón</label>
                  <input type="text" name="reason" placeholder="Salida Temprana / Asunto Personal" defaultValue="Salida Temprana" className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowAddBlock(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-black cursor-pointer">Cancelar</button>
                <button type="submit" className="bg-black text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer shadow-xs">Bloquear Horario en Web</button>
              </div>
            </form>
          )}

          {bookings.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-700 text-sm">No hay citas registradas todavía</p>
              <p className="text-xs text-gray-400">Comparte tu enlace de reservas con tus clientes por WhatsApp o Instagram.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const spec = specialists.find(s => s.id === b.specialist_id)
                const serv = services.find(s => s.id === b.service_id)

                return (
                  <div key={b.id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900">{b.customer_name}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : b.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {b.status === 'confirmed' ? 'Confirmada' : b.status === 'completed' ? 'Completada' : b.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <span className="font-bold text-purple-700">📅 {b.booking_date} a las {b.booking_time}</span>
                        <span>✂️ {serv?.name || 'Servicio General'}</span>
                        <span>👤 {spec?.name || 'Cualquiera'}</span>
                      </div>

                      {b.notes && (
                        <p className="text-xs text-gray-400 italic">"{b.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={`https://wa.me/${b.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${b.customer_name}! Te saludamos de ${business.name}. Te recordamos tu cita para el ${b.booking_date} a las ${b.booking_time}. ¿Confirmas tu asistencia?`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#25D366] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#1EBE57] transition flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>WhatsApp</span>
                      </a>

                      <form action={updateBookingStatus}>
                        <input type="hidden" name="booking_id" value={b.id} />
                        <input type="hidden" name="status" value={b.status === 'completed' ? 'confirmed' : 'completed'} />
                        <button
                          type="submit"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          {b.status === 'completed' ? 'Reabrir' : 'Completar'}
                        </button>
                      </form>

                      <form action={deleteBooking}>
                        <input type="hidden" name="booking_id" value={b.id} />
                        <button
                          type="submit"
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                          title="Eliminar cita o desbloquear horario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: ESPECIALISTAS Y BARBEROS */}
      {activeTab === 'specialists' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-base">Equipo de Trabajo</h3>
            <button
              onClick={() => setShowAddSpecialist(!showAddSpecialist)}
              className="bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-gray-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Agregar Especialista</span>
            </button>
          </div>

          {/* Formulario para agregar especialista */}
          {showAddSpecialist && (
            <form action={createSpecialist} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 animate-in fade-in">
              <input type="hidden" name="business_id" value={business.id} />
              <h4 className="font-extrabold text-sm text-gray-900">Nuevo Especialista / Barbero</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Completo *</label>
                  <input type="text" name="name" required placeholder="Ej. Carlos Rivera" className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cargo / Especialidad</label>
                  <input type="text" name="role_title" placeholder="Ej. Master Barber, Colorista Pro" defaultValue="Especialista" className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">WhatsApp Directo</label>
                  <input type="tel" name="phone" placeholder="+504 9988-6256" className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none" />
                </div>
              </div>

              <div>
                <ImageUploadInput
                  name="avatar"
                  label="Foto de Perfil del Especialista"
                  shape="circle"
                  helpText="Foto circular de buena calidad para inspirar confianza a los clientes."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddSpecialist(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-black cursor-pointer">Cancelar</button>
                <button type="submit" className="bg-black text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer shadow-xs">Guardar Especialista</button>
              </div>
            </form>
          )}

          {/* Listado de Especialistas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {specialists.map((s) => {
              const specReviews = reviews.filter(r => r.specialist_id === s.id)
              const avg = specReviews.length > 0
                ? (specReviews.reduce((sum, r) => sum + r.rating, 0) / specReviews.length).toFixed(1)
                : '5.0'

              return (
                <div key={s.id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                      {s.avatar_url ? (
                        <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-full h-full p-2.5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.role_title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-black text-xs text-gray-800">{avg}</span>
                        <span className="text-[10px] text-gray-400">({specReviews.length} opiniones)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botón Ver Portal de Agenda del Especialista */}
                    <a
                      href={`/b/${business.slug}/staff/${s.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-extrabold transition flex items-center gap-1"
                      title="Ver portal móvil de citas para este especialista"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ver Agenda</span>
                    </a>

                    {/* Botón Enviar Agenda por WhatsApp al Especialista */}
                    {s.phone && (
                      <a
                        href={`https://wa.me/${s.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${s.name}! Aquí tienes tu enlace de acceso para consultar tus citas y turnos en ${business.name}:\n\n🔗 https://www.omnitag.site/b/${business.slug}/staff/${s.id}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-xl transition"
                        title="Enviar enlace de agenda por WhatsApp al especialista"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                      </a>
                    )}

                    {/* Switch de Disponibilidad Inmediata */}
                    <form action={toggleSpecialistAvailability}>
                      <input type="hidden" name="specialist_id" value={s.id} />
                      <input type="hidden" name="is_active" value={s.is_active ? 'false' : 'true'} />
                      <button
                        type="submit"
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                          s.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title={s.is_active ? 'Marcar como ausente hoy / no disponible' : 'Marcar como activo y disponible'}
                      >
                        <span className={`w-2 h-2 rounded-full ${s.is_active ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        <span>{s.is_active ? 'Activo' : 'Ausente'}</span>
                      </button>
                    </form>

                    <form action={deleteSpecialist}>
                      <input type="hidden" name="specialist_id" value={s.id} />
                      <button type="submit" className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition cursor-pointer" title="Eliminar definitivamente">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: SERVICIOS Y TARIFAS */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-base">Servicios Disponibles</h3>
            <button
              onClick={() => setShowAddService(!showAddService)}
              className="bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-gray-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Agregar Servicio</span>
            </button>
          </div>

          {/* Formulario nuevo servicio */}
          {showAddService && (
            <form action={createService} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 animate-in fade-in">
              <input type="hidden" name="business_id" value={business.id} />
              <h4 className="font-extrabold text-sm text-gray-900">Nuevo Servicio</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre del Servicio *</label>
                  <input type="text" name="name" required placeholder="Ej. Corte Degradado + Barba" className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Precio ($ / Lempiras) *</label>
                  <input type="number" step="0.01" name="price" required placeholder="150" className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Duración Estimada del Servicio *</label>
                  <select
                    name="duration_minutes"
                    defaultValue={45}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none"
                  >
                    <option value={15}>⏱️ 15 min (Corte Express / Cejas / Perfilado)</option>
                    <option value={30}>⏱️ 30 min (Corte Clásico / Arreglo de Barba)</option>
                    <option value={45}>⏱️ 45 min (Corte Tradicional / Manicura)</option>
                    <option value={60}>⏱️ 60 min - 1 Hora (Corte + Barba / Pedicura)</option>
                    <option value={90}>⏱️ 90 min - 1.5 Horas (Uñas Acrílicas / Tratamiento)</option>
                    <option value={120}>⏱️ 120 min - 2 Horas (Balayage / Alisado / Color)</option>
                    <option value={180}>⏱️ 180 min - 3 Horas (Decoloración / Extensión)</option>
                    <option value={240}>⏱️ 240 min - 4 Horas (Transformación / Paquete Novias)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción Breve</label>
                  <input type="text" name="description" placeholder="Incluye lavado, toalla caliente y peinado..." className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddService(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-black cursor-pointer">Cancelar</button>
                <button type="submit" className="bg-black text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer shadow-xs">Guardar Servicio</button>
              </div>
            </form>
          )}

          {/* Listado de Servicios */}
          <div className="space-y-2.5">
            {services.map((serv) => (
              <div key={serv.id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-gray-900">{serv.name}</p>
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                      ⏱️ {serv.duration_minutes} min
                    </span>
                  </div>
                  {serv.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{serv.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-base text-gray-900">${serv.price}</span>
                  <form action={deleteService}>
                    <input type="hidden" name="service_id" value={serv.id} />
                    <button type="submit" className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 4: MURO DE CALIFICACIONES */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-base">Opiniones & Calificaciones de Clientes</h3>
          </div>

          {reviews.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <Star className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-700 text-sm">Aún no hay calificaciones de clientes</p>
              <p className="text-xs text-gray-400">Tus clientes pueden calificar a sus especialistas favoritos desde la página de reservas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reviews.map((r) => {
                const spec = specialists.find(s => s.id === r.specialist_id)

                return (
                  <div key={r.id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-xs text-gray-900">{r.customer_name}</p>
                        <p className="text-[10px] text-purple-700 font-semibold">Atendido por {spec?.name || 'Especialista'}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    {r.comment && (
                      <p className="text-xs text-gray-600 leading-relaxed italic">"{r.comment}"</p>
                    )}

                    <p className="text-[10px] text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 5: CONFIGURACIÓN DEL NEGOCIO */}
      {activeTab === 'business' && (
        <form action={createOrUpdateBusiness} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-gray-900 text-base">Datos del Negocio</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Comercial *</label>
              <input type="text" name="name" defaultValue={business.name} required className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-black focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Categoría del Negocio</label>
              <select name="category" defaultValue={business.category || 'barbershop'} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-black focus:outline-none">
                <option value="dental">🦷 Clínica Dental & Odontología</option>
                <option value="medical">🩺 Consultorio Médico / Especialidades</option>
                <option value="barbershop">💈 Barbería & Peluquería Masculina</option>
                <option value="salon">💇‍♀️ Salón de Belleza, Estilismo & Uñas</option>
                <option value="spa">💆 Spa, Fisioterapia & Estética</option>
                <option value="tattoo">🎨 Estudio de Tatuajes & Piercing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Dirección Física</label>
              <input type="text" name="address" defaultValue={business.address || ''} placeholder="Plaza Central, Local 4" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-black focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">WhatsApp para Confirmaciones</label>
              <input type="tel" name="whatsapp" defaultValue={business.whatsapp || ''} placeholder="+504 9988-6256" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-black focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Instagram (@usuario)</label>
              <input type="text" name="instagram" defaultValue={business.instagram || ''} placeholder="@mibarberia" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-black focus:outline-none" />
            </div>
          </div>

          {/* 6. HORARIOS DE ATENCIÓN Y APERTURA PERSONALIZADOS */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-700" />
                <span>Horarios de Atención & Días Laborables</span>
              </h4>
              <p className="text-xs text-gray-500">
                Define qué días abre tu negocio, la hora de apertura y cierre, el intervalo entre turnos y si tienen pausa de almuerzo.
              </p>
            </div>

            {/* Intervalo y Almuerzo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Intervalo entre Turnos (Minutos)
                </label>
                <select
                  name="slot_interval"
                  defaultValue={business?.schedule_config?.slot_interval || 30}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none"
                >
                  <option value={15}>Cada 15 minutos (ej. 08:00, 08:15, 08:30)</option>
                  <option value={30}>Cada 30 minutos (ej. 08:00, 08:30, 09:00)</option>
                  <option value={45}>Cada 45 minutos (ej. 08:00, 08:45, 09:30)</option>
                  <option value={60}>Cada 1 hora (ej. 08:00, 09:00, 10:00)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    name="lunch_break_enabled"
                    defaultChecked={business?.schedule_config?.lunch_break?.enabled ?? true}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs font-bold text-gray-800">Pausa General de Almuerzo / Comida</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase">Inicio Almuerzo</span>
                    <select
                      name="lunch_break_start"
                      defaultValue={business?.schedule_config?.lunch_break?.start || '12:00 PM'}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none"
                    >
                      {['11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase">Fin Almuerzo</span>
                    <select
                      name="lunch_break_end"
                      defaultValue={business?.schedule_config?.lunch_break?.end || '01:00 PM'}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none"
                    >
                      {['12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de Días de la Semana */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Horario por Día de la Semana
              </label>

              <div className="space-y-2">
                {[
                  { key: 'monday', label: 'Lunes' },
                  { key: 'tuesday', label: 'Martes' },
                  { key: 'wednesday', label: 'Miércoles' },
                  { key: 'thursday', label: 'Jueves' },
                  { key: 'friday', label: 'Viernes' },
                  { key: 'saturday', label: 'Sábado' },
                  { key: 'sunday', label: 'Domingo' }
                ].map(({ key, label }) => {
                  const dayData = business?.schedule_config?.days?.[key] || {
                    enabled: key !== 'sunday',
                    open: key === 'saturday' ? '09:00 AM' : '08:00 AM',
                    close: key === 'saturday' ? '07:00 PM' : '07:00 PM'
                  }

                  const timeOptions = [
                    '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
                    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
                    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
                    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
                    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
                    '09:00 PM', '09:30 PM', '10:00 PM', '11:00 PM'
                  ]

                  return (
                    <div key={key} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <label className="flex items-center gap-2.5 font-bold text-gray-900 w-32 cursor-pointer">
                        <input
                          type="checkbox"
                          name={`${key}_enabled`}
                          defaultChecked={dayData.enabled}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>{label}</span>
                      </label>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-[11px] text-gray-500">De</span>
                        <select
                          name={`${key}_open`}
                          defaultValue={dayData.open || '08:00 AM'}
                          className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-medium focus:border-black focus:outline-none flex-1 sm:flex-none"
                        >
                          {timeOptions.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>

                        <span className="text-[11px] text-gray-500">a</span>
                        <select
                          name={`${key}_close`}
                          defaultValue={dayData.close || '07:00 PM'}
                          className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-medium focus:border-black focus:outline-none flex-1 sm:flex-none"
                        >
                          {timeOptions.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer shadow-md">
              Guardar Configuración & Horarios
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
