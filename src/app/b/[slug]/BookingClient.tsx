'use client'

import { useState } from 'react'
import { 
  Scissors, 
  Clock, 
  Calendar, 
  User, 
  Star, 
  CheckCircle2, 
  ChevronRight, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck,
  Plus,
  X,
  MessageSquare
} from 'lucide-react'
import { createPublicBooking, createSpecialistReview } from './actions'

interface Specialist {
  id: string
  name: string
  role_title: string
  avatar_url?: string | null
  phone?: string | null
  bio?: string | null
  reviews?: Review[]
  avgRating?: number
}

interface Service {
  id: string
  name: string
  description?: string | null
  price: number
  duration_minutes: number
  specialist_id?: string | null
}

interface Review {
  id: string
  customer_name: string
  rating: number
  comment?: string | null
  created_at: string
}

export default function BookingClient({
  business,
  specialists,
  services,
  reviews
}: {
  business: any
  specialists: Specialist[]
  services: Service[]
  reviews: Review[]
}) {
  const [selectedService, setSelectedService] = useState<Service | null>(services[0] || null)
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null) // null = cualquiera
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM')
  const [customerName, setCustomerName] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [customerNotes, setCustomerNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [bookingSuccess, setBookingSuccess] = useState<any>(null)

  // Modal para Calificar Especialista
  const [reviewModalSpecialist, setReviewModalSpecialist] = useState<Specialist | null>(null)
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviewerName, setReviewerName] = useState<string>('')
  const [reviewerComment, setReviewerComment] = useState<string>('')
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false)

  // Calcular promedios de calificación por especialista
  const specialistsWithRatings = specialists.map(s => {
    const specReviews = reviews.filter(r => (r as any).specialist_id === s.id)
    const avg = specReviews.length > 0
      ? specReviews.reduce((sum, r) => sum + r.rating, 0) / specReviews.length
      : 5.0
    return { ...s, reviews: specReviews, avgRating: avg }
  })

  // Generar siguientes 7 días
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

  const timeSlots = [
    '09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM',
    '01:00 PM', '01:45 PM', '02:30 PM', '03:15 PM',
    '04:00 PM', '04:45 PM', '05:30 PM', '06:15 PM'
  ]

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService || !customerName.trim() || !customerPhone.trim()) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('business_id', business.id)
    if (selectedSpecialist) formData.append('specialist_id', selectedSpecialist.id)
    formData.append('service_id', selectedService.id)
    formData.append('customer_name', customerName.trim())
    formData.append('customer_phone', customerPhone.trim())
    formData.append('booking_date', selectedDate)
    formData.append('booking_time', selectedTime)
    formData.append('notes', customerNotes.trim())
    formData.append('slug', business.slug)

    const res = await createPublicBooking(formData)
    setIsSubmitting(false)

    if (res.success) {
      setBookingSuccess({
        service: selectedService,
        specialist: selectedSpecialist,
        date: selectedDate,
        time: selectedTime,
        customerName,
        customerPhone
      })
    } else {
      alert(res.error || 'Error al agendar la cita.')
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewModalSpecialist) return

    const formData = new FormData()
    formData.append('specialist_id', reviewModalSpecialist.id)
    formData.append('business_id', business.id)
    formData.append('customer_name', reviewerName.trim() || 'Cliente Satisfecho')
    formData.append('rating', reviewRating.toString())
    formData.append('comment', reviewerComment.trim())
    formData.append('slug', business.slug)

    await createSpecialistReview(formData)
    setReviewSuccess(true)
    setTimeout(() => {
      setReviewSuccess(false)
      setReviewModalSpecialist(null)
      setReviewerName('')
      setReviewerComment('')
    }, 2000)
  }

  // Si la cita fue agendada exitosamente
  if (bookingSuccess) {
    const specialistText = bookingSuccess.specialist ? bookingSuccess.specialist.name : 'Cualquiera disponible'
    const waText = encodeURIComponent(
      `¡Hola *${business.name}*! Acabo de agendar una cita online para:\n\n✂️ *Servicio:* ${bookingSuccess.service.name}\n👤 *Especialista:* ${specialistText}\n📅 *Fecha:* ${bookingSuccess.date}\n⏰ *Hora:* ${bookingSuccess.time}\n👤 *Cliente:* ${bookingSuccess.customerName} (${bookingSuccess.customerPhone})\n\n¿Me confirman la recepción? ¡Gracias!`
    )
    const waUrl = business.whatsapp 
      ? `https://wa.me/${business.whatsapp.replace(/\D/g, '')}?text=${waText}`
      : `https://wa.me/?text=${waText}`

    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-3xl shadow-2xl border border-gray-200 text-center space-y-5 animate-in zoom-in-95">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
            ¡Turno Apartado Exitosamente!
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
            ¡Tu cita está registrada!
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Te esperamos en <b>{business.name}</b>.
          </p>
        </div>

        {/* Resumen del Turno */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Servicio:</span>
            <span className="font-bold text-gray-900">{bookingSuccess.service.name} (${bookingSuccess.service.price})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Especialista:</span>
            <span className="font-bold text-gray-900">{specialistText}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Fecha & Hora:</span>
            <span className="font-bold text-purple-700">{bookingSuccess.date} a las {bookingSuccess.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Cliente:</span>
            <span className="font-bold text-gray-900">{bookingSuccess.customerName}</span>
          </div>
        </div>

        {/* Botón de Confirmación por WhatsApp */}
        <div className="space-y-2 pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#1EBE57] text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Confirmar en WhatsApp</span>
          </a>

          <button
            onClick={() => setBookingSuccess(null)}
            className="text-xs text-gray-500 hover:text-black font-semibold pt-1"
          >
            ← Agendar otra cita
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      
      {/* 1. SELECCIONAR SERVICIO */}
      <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-black text-white text-xs flex items-center justify-center font-bold">1</span>
            Elige tu Servicio
          </h2>
          <span className="text-xs text-gray-400 font-medium">{services.length} disponibles</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {services.map((service) => {
            const isSelected = selectedService?.id === service.id
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedService(service)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-black bg-black/5 ring-2 ring-black/10 shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-gray-900">{service.name}</p>
                    {service.duration_minutes && (
                      <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {service.duration_minutes} min
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{service.description}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-base text-gray-900">${service.price}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* 2. SELECCIONAR ESPECIALISTA / BARBERO (Con Fotos & Calificaciones) */}
      {specialistsWithRatings.length > 0 && (
        <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-black text-white text-xs flex items-center justify-center font-bold">2</span>
              Elige tu Especialista / Barbero
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opción Cualquiera */}
            <button
              type="button"
              onClick={() => setSelectedSpecialist(null)}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                selectedSpecialist === null
                  ? 'border-black bg-black/5 ring-2 ring-black/10'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold shrink-0">
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-gray-900">Cualquiera Disponible</p>
                <p className="text-[11px] text-gray-500">Atención más rápida</p>
              </div>
            </button>

            {/* Especialistas con calificaciones */}
            {specialistsWithRatings.map((spec) => {
              const isSelected = selectedSpecialist?.id === spec.id
              return (
                <div
                  key={spec.id}
                  className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'border-black bg-black/5 ring-2 ring-black/10'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedSpecialist(spec)}
                    className="flex items-center gap-3 text-left w-full cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0 border border-black/10">
                      {spec.avatar_url ? (
                        <img src={spec.avatar_url} alt={spec.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-full h-full p-2.5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-gray-900 truncate">{spec.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{spec.role_title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-black text-xs text-gray-800">{spec.avgRating?.toFixed(1)}</span>
                        <span className="text-[10px] text-gray-400">({spec.reviews?.length || 0})</span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewModalSpecialist(spec)}
                    className="text-[10px] font-bold text-purple-700 hover:underline flex items-center gap-1 self-end pt-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Calificar a {spec.name.split(' ')[0]}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 3. SELECCIONAR FECHA Y HORA */}
      <section className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs border border-gray-200 space-y-4">
        <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-black text-white text-xs flex items-center justify-center font-bold">3</span>
          Fecha y Horario
        </h2>

        {/* Días */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {nextDays.map((d) => (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => setSelectedDate(d.dateStr)}
              className={`p-3 rounded-2xl text-center min-w-[72px] transition cursor-pointer border ${
                selectedDate === d.dateStr
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <p className="text-[10px] uppercase font-bold opacity-75">{d.dayName}</p>
              <p className="text-lg font-black">{d.dayNumber}</p>
              <p className="text-[10px] uppercase opacity-75">{d.monthName}</p>
            </button>
          ))}
        </div>

        {/* Horarios */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Horas disponibles:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                  selectedTime === time
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TUS DATOS & CONFIRMAR RESERVA */}
      <form onSubmit={handleBookingSubmit} className="bg-white p-5 sm:p-6 rounded-3xl shadow-xs border border-gray-200 space-y-4">
        <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-black text-white text-xs flex items-center justify-center font-bold">4</span>
          Datos de Contacto
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              placeholder="Ej. Mario Rivera"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-black focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">WhatsApp / Teléfono *</label>
            <input
              type="tel"
              required
              placeholder="+504 9988-6256"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-black focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nota Especial (Opcional)</label>
          <input
            type="text"
            placeholder="Ej. Traigo corte de referencia, primera vez..."
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-medium focus:border-black focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black hover:bg-gray-800 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
        >
          <Calendar className="w-5 h-5" />
          <span>{isSubmitting ? 'Apartando turno...' : 'Confirmar Reserva de Turno'}</span>
        </button>
      </form>

      {/* MODAL PARA CALIFICAR Y DEJAR RESEÑA AL ESPECIALISTA */}
      {reviewModalSpecialist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4 relative">
            <button
              onClick={() => setReviewModalSpecialist(null)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-black rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto bg-gray-100 border border-gray-200">
                {reviewModalSpecialist.avatar_url ? (
                  <img src={reviewModalSpecialist.avatar_url} alt={reviewModalSpecialist.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full p-3 text-gray-400" />
                )}
              </div>
              <h3 className="font-extrabold text-gray-900 text-base">
                Calificar a {reviewModalSpecialist.name}
              </h3>
              <p className="text-xs text-gray-500">{reviewModalSpecialist.role_title}</p>
            </div>

            {reviewSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-center text-xs font-bold">
                ¡Gracias por tu opinión! Tu calificación ha sido registrada.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2 text-center">
                    ¿Cuántas estrellas le das?
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer transition hover:scale-110"
                      >
                        <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tu Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Roberto Martínez"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Comentario sobre la atención</label>
                  <textarea
                    rows={3}
                    placeholder="Excelente corte y atención, muy profesional..."
                    value={reviewerComment}
                    onChange={(e) => setReviewerComment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-medium focus:border-black focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition cursor-pointer shadow-md"
                >
                  Publicar Calificación
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
