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
  Sparkles
} from 'lucide-react'
import { updateBookingStatus } from '@/app/dashboard/appointments/actions'

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

        {/* Resumen del Día */}
        <div className="flex items-center justify-between px-1">
          <h2 className="font-extrabold text-sm text-gray-900">
            Citas de {selectedDate === new Date().toISOString().slice(0, 10) ? 'Hoy' : selectedDate}
          </h2>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
            {dayBookings.length} {dayBookings.length === 1 ? 'turno' : 'turnos'}
          </span>
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
              const waMessage = encodeURIComponent(
                `¡Hola ${b.customer_name}! Te saluda ${specialist.name} de ${business.name}. Te recordamos tu cita hoy a las ${b.booking_time} para ${b.appointment_services?.name || 'tu servicio'}. ¡Te esperamos!`
              )
              const waUrl = `https://wa.me/${b.customer_phone.replace(/\D/g, '')}?text=${waMessage}`

              return (
                <div key={b.id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-lg">
                          ⏰ {b.booking_time}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {b.status === 'confirmed' ? 'Confirmada' : b.status}
                        </span>
                      </div>

                      <h3 className="font-black text-base text-gray-900 mt-2">{b.customer_name}</h3>
                      <p className="text-xs text-gray-600 font-semibold mt-0.5">
                        ✂️ {b.appointment_services?.name || 'Servicio General'} 
                        {b.appointment_services?.price ? ` • $${b.appointment_services.price}` : ''}
                      </p>

                      {b.notes && (
                        <p className="text-xs text-gray-500 italic mt-1 bg-gray-50 p-2 rounded-xl border border-gray-100">
                          📝 "{b.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones para el Barbero / Especialista */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
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
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
