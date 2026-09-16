'use client'

import { useState } from 'react'
import { Star, ShieldCheck, ArrowRight, User, Mail, Lock, Phone, Sparkles, AlertCircle } from 'lucide-react'
import GooglePlaceSearchInput, { PlaceDetails } from '@/components/GooglePlaceSearchInput'
import { activatePlateAndRegister } from './actions'

interface ActivatePlateClientProps {
  tagId: string
  currentUser: { id: string; email: string } | null
  serverError?: string
}

export default function ActivatePlateClient({
  tagId,
  currentUser,
  serverError
}: ActivatePlateClientProps) {
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null)
  const [reviewFilter, setReviewFilter] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Campos personales
  const [fullName, setFullName] = useState('')
  const [personalPhone, setPersonalPhone] = useState('') // WhatsApp personal
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="max-w-md w-full bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
      {/* Cabecera */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-300 text-black rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          <Star className="w-7 h-7 fill-black" />
        </div>
        <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Placa NFC de Reseñas Google</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Activa tu Placa Inteligente
        </h1>
        <p className="text-xs text-gray-400">
          Placa ID: <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">{tagId}</span>
        </p>
      </div>

      {serverError && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form action={activatePlateAndRegister} onSubmit={() => setSubmitting(true)} className="space-y-5">
        <input type="hidden" name="tag_id" value={tagId} />

        {/* 1. Buscador oficial de Google Maps */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
            1. Busca tu Negocio en Google Maps *
          </label>
          <GooglePlaceSearchInput
            onPlaceSelected={(place) => {
              setSelectedPlace(place)
            }}
            initialPlace={selectedPlace}
          />
        </div>

        {/* Campos ocultos de Google Places para enviar en el FormData */}
        <input type="hidden" name="place_id" value={selectedPlace?.place_id || ''} />
        <input type="hidden" name="business_name" value={selectedPlace?.name || ''} />
        <input type="hidden" name="business_address" value={selectedPlace?.formatted_address || ''} />
        <input type="hidden" name="business_phone" value={selectedPlace?.formatted_phone_number || ''} />
        <input type="hidden" name="direct_review_url" value={selectedPlace?.direct_review_url || ''} />
        <input type="hidden" name="google_types" value={JSON.stringify(selectedPlace?.types || [])} />

        {/* 2. Escudo Anti-Quejas */}
        <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="review_filter"
              checked={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-400 mt-0.5"
            />
            <div className="text-xs">
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Activar Escudo Inteligente Anti-Quejas
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Las calificaciones de <b>4 y 5 estrellas</b> van a Google Maps. Las de <b>1 a 3 estrellas</b> van a tu buzón privado para resolver el problema antes de que dañe tu reputación.
              </p>
            </div>
          </label>
        </div>

        {/* 3. Datos del Dueño para Acceso al Panel */}
        {!currentUser ? (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-300">
              2. Tus Datos de Acceso al Panel de Control
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">Nombre Completo *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="full_name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">
                WhatsApp Personal del Administrador *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input
                  type="tel"
                  name="personal_phone"
                  required
                  value={personalPhone}
                  onChange={(e) => setPersonalPhone(e.target.value)}
                  placeholder="Ej. +504 9999-9999"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Para avisarte de quejas privadas o soporte directo de tu suscripción.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">Correo Electrónico *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">Crea tu Contraseña *</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-300">
            <p className="font-bold">Sesión iniciada como: {currentUser.email}</p>
            <p className="text-[11px] opacity-80 mt-0.5">La placa se vinculará directamente a tu cuenta existente.</p>
          </div>
        )}

        {/* Botón de Activación */}
        <button
          type="submit"
          disabled={!selectedPlace || submitting}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-extrabold text-sm hover:brightness-110 transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{submitting ? 'Activando Placa...' : 'Activar Placa & 1 Año de Servicio'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
