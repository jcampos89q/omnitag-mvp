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
  Building2
} from 'lucide-react'
import Link from 'next/link'
import ImageUploadInput from '@/components/ImageUploadInput'
import { createOrUpdateBusiness, createSpecialist, deleteSpecialist, createService, deleteService, updateBookingStatus } from './actions'

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
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-base">Citas Registradas</h3>
            <span className="text-xs text-gray-500 font-medium">Actualizado en vivo</span>
          </div>

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

                  <form action={deleteSpecialist}>
                    <input type="hidden" name="specialist_id" value={s.id} />
                    <button type="submit" className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition cursor-pointer" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
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
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Duración Estimada (Minutos)</label>
                  <input type="number" name="duration_minutes" defaultValue={45} className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:border-black focus:outline-none" />
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
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Categoría</label>
              <select name="category" defaultValue={business.category || 'barbershop'} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-black focus:outline-none">
                <option value="barbershop">💈 Barbería</option>
                <option value="salon">✂️ Salón de Belleza / Peluquería</option>
                <option value="spa">💆 Spa & Estética</option>
                <option value="clinic">🦷 Clínica Médica / Dental</option>
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

          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer shadow-md">
              Guardar Cambios
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
