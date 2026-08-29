'use client'

import { useState } from 'react'
import { 
  Scissors, 
  Calendar, 
  Clock, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Star, 
  User, 
  ChevronRight,
  RefreshCw,
  Sparkles,
  Lock,
  Plus,
  Trash2,
  X,
  Coffee,
  Utensils
} from 'lucide-react'
import { updateBookingStatus } from '@/app/dashboard/appointments/actions'
import { staffCreateScheduleBlock, staffDeleteBooking } from '@/app/b/[slug]/actions'
import { generateTimeSlotsForDate } from '@/lib/schedule'

interface Specialist {
  id: string
  name: string
  role_title: string
  avatar_url?: string | null
  phone?: string | null
  business_id: string
}

interface Booking {
  id: string
  customer_name: string
  customer_phone: string
  customer_email?: string | null
  booking_date: string
  booking_time: string
  status: string
  notes?: string | null
  appointment_services?: {
    name: string
    price: number
    duration_minutes: number
  } | null
}

export default function StaffPortalClient({
  business,
  specialist,
  initialBookings,
  reviews
}: {
  business: any
  specialist: Specialist
  initialBookings: Booking[]
  reviews: any[]
}) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false)
  const [blockTime, setBlockTime] = useState<string>('01:00 PM')
  const [blockReason, setBlockReason] = useState<string>('🥗 Almuerzo / Comida')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const timeSlots = generateTimeSlotsForDate(business?.schedule_config, selectedDate)

  // Siguientes 7 días
  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      dateStr: d.toISOString().slice(0, 10),
      dayName: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : d.toLocaleDateString('es-HN', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('es-HN', { month: 'short' })
    }
  })

  // Filtrar citas del día seleccionado
  const dayBookings = initialBookings.filter(b => b.booking_date === selectedDate)

  // Promedio de estrellas
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0'

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('business_id', business.id)
    formData.append('specialist_id', specialist.id)
    formData.append('booking_date', selectedDate)
    formData.append('booking_time', blockTime)
    formData.append('reason', blockReason)
    formData.append('slug', business.slug)

    await staffCreateScheduleBlock(formData)
    setIsSubmitting(false)
    setShowBlockModal(false)
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-16">
      {/* Cabecera del Especialista */}
      <header className="bg-linear-to-b from-gray-900 to-black text-white p-6 rounded-b-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-black px-2.5 py-0.5 rounded-full">
            Portal del Especialista
          </span>
          <span className="text-xs text-gray-400 font-bold">{business.name}</span>
        </div>

        <div className="flex items-center gap-3.5 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-gray-800 overflow-hidden border-2 border-white/20 shrink-0">
            {specialist.avatar_url ? (
              <img src={specialist.avatar_url} alt={specialist.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-full h-full p-3 text-gray-400" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{specialist.name}</h1>
            <p className="text-xs text-gray-300">{specialist.role_title}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-extrabold text-xs text-white">{avgRating}</span>
              <span className="text-[10px] text-gray-400">({reviews.length} opiniones)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Selector de Días */}
      <main className="p-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {nextDays.map((d) => (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => setSelectedDate(d.dateStr)}
              className={`p-3 rounded-2xl text-center min-w-[70px] transition cursor-pointer border ${
                selectedDate === d.dateStr
                  ? 'bg-black text-white border-black shadow-md'
                  : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <p className="text-[10px] uppercase font-bold opacity-75">{d.dayName}</p>
              <p className="text-lg font-black">{d.dayNumber}</p>
              <p className="text-[10px] uppercase opacity-75">{d.monthName}</p>
            </button>
          ))}
        </div>

        {/* Botón para Bloquear Horario / Almuerzo */}
        <div className="flex items-center justify-between gap-2 px-1">
          <h2 className="font-extrabold text-sm text-gray-900">
            Agenda de {selectedDate === new Date().toISOString().slice(0, 10) ? 'Hoy' : selectedDate}
          </h2>

          <button
            type="button"
            onClick={() => setShowBlockModal(true)}
            className="text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Bloquear Turno / Almuerzo</span>
          </button>
        </div>

        {/* Lista de Citas */}
        {dayBookings.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-gray-200 space-y-2">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="font-bold text-sm text-gray-700">Sin citas agendadas para este día</p>
            <p className="text-xs text-gray-400">Tus nuevos turnos aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayBookings.map((b) => {
              const isBlock = b.customer_name.startsWith('🔒')
              const waMessage = encodeURIComponent(
                `¡Hola ${b.customer_name}! Te saluda ${specialist.name} de ${business.name}. Te recordamos tu cita hoy a las ${b.booking_time} para ${b.appointment_services?.name || 'tu servicio'}. ¡Te esperamos!`
              )
              const waUrl = `https://wa.me/${b.customer_phone.replace(/\D/g, '')}?text=${waMessage}`

              return (
                <div 
                  key={b.id} 
                  className={`p-4 rounded-2xl border shadow-xs space-y-3 ${
                    isBlock 
                      ? 'bg-amber-50/70 border-amber-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${
                          isBlock ? 'bg-amber-200 text-amber-950' : 'bg-purple-100 text-purple-800'
                        }`}>
                          ⏰ {b.booking_time}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isBlock
                            ? 'bg-amber-200/60 text-amber-900'
                            : b.status === 'confirmed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isBlock ? 'Horario Bloqueado' : b.status === 'confirmed' ? 'Confirmada' : b.status}
                        </span>
                      </div>

                      <h3 className="font-black text-base text-gray-900 mt-2">{b.customer_name}</h3>
                      
                      {!isBlock && (
                        <p className="text-xs text-gray-600 font-semibold mt-0.5">
                          ✂️ {b.appointment_services?.name || 'Servicio General'} 
                          {b.appointment_services?.price ? ` • $${b.appointment_services.price}` : ''}
                        </p>
                      )}

                      {b.notes && (
                        <p className="text-xs text-gray-500 italic mt-1 bg-gray-50 p-2 rounded-xl border border-gray-100">
                          📝 "{b.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones para el Barbero / Especialista */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    {isBlock ? (
                      <form action={staffDeleteBooking}>
                        <input type="hidden" name="booking_id" value={b.id} />
                        <input type="hidden" name="specialist_id" value={specialist.id} />
                        <input type="hidden" name="slug" value={business.slug} />
                        <button
                          type="submit"
                          className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Desbloquear Horario</span>
                        </button>
                      </form>
                    ) : (
                      <>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#25D366] hover:bg-[#1EBE57] text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <MessageCircle className="w-4 h-4 fill-white" />
                          <span>WhatsApp Cliente</span>
                        </a>

                        <form action={updateBookingStatus}>
                          <input type="hidden" name="booking_id" value={b.id} />
                          <input type="hidden" name="status" value={b.status === 'completed' ? 'confirmed' : 'completed'} />
                          <button
                            type="submit"
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                              b.status === 'completed' 
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                : 'bg-black text-white hover:bg-gray-800'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{b.status === 'completed' ? 'Reabrir' : 'Completado'}</span>
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Modal para Bloquear Horario / Almuerzo */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full space-y-4 relative">
            <button
              onClick={() => setShowBlockModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-black rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-base">
                Bloquear Mi Horario
              </h3>
              <p className="text-xs text-gray-500">
                Reserva tu hora de comida, descanso o salida para que ningún cliente agende en ese momento.
              </p>
            </div>

            <form onSubmit={handleBlockSubmit} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hora a Bloquear</label>
                <select
                  value={blockTime}
                  onChange={(e) => setBlockTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-black focus:outline-none"
                >
                  {timeSlots.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Motivo / Razón</label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-black focus:outline-none"
                >
                  <option value="🥗 Hora de Almuerzo / Comida">🥗 Hora de Almuerzo / Comida</option>
                  <option value="☕ Descanso / Break de 30 min">☕ Descanso / Break de 30 min</option>
                  <option value="🏃 Salida Temprana / Permiso">🏃 Salida Temprana / Permiso</option>
                  <option value="🩺 Cita Médica / Personal">🩺 Cita Médica / Personal</option>
                  <option value="✂️ Cita Presencial en Local">✂️ Cita Presencial en Local</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black hover:bg-gray-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Bloqueando...' : 'Confirmar Bloqueo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
