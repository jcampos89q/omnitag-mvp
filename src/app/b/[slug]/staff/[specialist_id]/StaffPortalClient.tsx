'use client'

import { useState, useEffect } from 'react'
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
  Utensils,
  KeyRound,
  ShieldCheck,
  LogOut
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
  access_pin?: string | null
  is_active?: boolean
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false)
  const [inputPin, setInputPin] = useState<string>('')
  const [pinError, setPinError] = useState<string | null>(null)

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false)
  const [blockTime, setBlockTime] = useState<string>('01:00 PM')
  const [blockReason, setBlockReason] = useState<string>('🥗 Almuerzo / Comida')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    const savedPin = localStorage.getItem(`staff_pin_${specialist.id}`)
    const correctPin = specialist.access_pin || '1234'
    if (savedPin === correctPin) {
      setIsAuthenticated(true)
    }
    setIsAuthChecked(true)
  }, [specialist.id, specialist.access_pin])

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const correctPin = specialist.access_pin || '1234'
    if (inputPin.trim() === correctPin) {
      localStorage.setItem(`staff_pin_${specialist.id}`, correctPin)
      setIsAuthenticated(true)
      setPinError(null)
    } else {
      setPinError('PIN incorrecto. Intenta de nuevo o consulta con tu administrador.')
    }
  }

  const handleLockSession = () => {
    localStorage.removeItem(`staff_pin_${specialist.id}`)
    setIsAuthenticated(false)
    setInputPin('')
  }

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

  // 1. Cargando verificación de PIN
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 2. Si el especialista está inactivo
  if (specialist.is_active === false) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-xs space-y-4">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-3xl flex items-center justify-center mx-auto border border-red-500/30">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black">Acceso Deshabilitado</h2>
          <p className="text-xs text-gray-400">
            Tu acceso a la agenda móvil ha sido pausado por la administración de {business.name}.
          </p>
        </div>
      </div>
    )
  }

  // 3. Pantalla de Bloqueo por PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex flex-col justify-between p-6">
        <div className="max-w-xs mx-auto w-full pt-10 space-y-6 text-center animate-in fade-in zoom-in-95">
          {/* Avatar del Especialista */}
          <div className="relative mx-auto w-24 h-24">
            <div className="w-24 h-24 rounded-3xl bg-gray-800 overflow-hidden border-2 border-yellow-400/50 shadow-2xl shadow-yellow-400/10">
              {specialist.avatar_url ? (
                <img src={specialist.avatar_url} alt={specialist.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-full h-full p-6 text-gray-400" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black p-1.5 rounded-xl shadow-md">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 text-yellow-400 px-2.5 py-0.5 rounded-full border border-white/10">
              {business.name}
            </span>
            <h2 className="text-xl font-black">{specialist.name}</h2>
            <p className="text-xs text-gray-400">{specialist.role_title}</p>
          </div>

          {/* Formulario de PIN */}
          <form onSubmit={handlePinSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300">Ingresa tu PIN de Seguridad (4 dígitos)</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                placeholder="••••"
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value)}
                className="w-full text-center text-2xl tracking-[0.4em] font-black py-3 px-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
              />
              {pinError && (
                <p className="text-xs text-red-400 font-semibold animate-in fade-in">
                  {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3.5 px-4 rounded-2xl text-sm transition shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Desbloquear Mi Agenda</span>
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-500 pb-4">
          OmniTag Security • Consulta tu PIN con la administración
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-16">
      {/* Cabecera del Especialista */}
      <header className="bg-gradient-to-b from-gray-900 to-black text-white p-6 rounded-b-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-black px-2.5 py-0.5 rounded-full">
            Portal del Especialista
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">{business.name}</span>
            <button
              onClick={handleLockSession}
              title="Bloquear sesión con PIN"
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
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
