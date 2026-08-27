'use client'

import { useState, useEffect } from 'react'
import { 
  Gift, 
  Award, 
  Sparkles, 
  Check, 
  KeyRound, 
  X, 
  Phone, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Store,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import { ThemeConfig } from '@/lib/themes'
import { validateAndAddStamp, claimLoyaltyReward } from '@/app/dashboard/loyalty/actions'

interface LoyaltyCardClientProps {
  program: any
  theme?: ThemeConfig
}

export default function LoyaltyCardClient({ program, theme }: LoyaltyCardClientProps) {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [isIdentified, setIsIdentified] = useState(false)
  const [currentStamps, setCurrentStamps] = useState<number>(0)
  const [totalClaimed, setTotalClaimed] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  
  // Modales
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinAction, setPinAction] = useState<'stamp' | 'claim'>('stamp')
  const [pinInput, setPinInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const primaryColor = theme?.primary_color || '#0F172A'
  const cardBg = theme?.card_bg || '#FFFFFF'
  const textColor = theme?.text_color || '#0F172A'
  const isDark = theme?.is_dark || false

  const cardRadiusClass = theme?.border_style === 'square' 
    ? 'rounded-none' 
    : theme?.border_style === 'pill' 
    ? 'rounded-3xl' 
    : 'rounded-2xl'

  const btnRadiusClass = theme?.border_style === 'square' 
    ? 'rounded-none' 
    : theme?.border_style === 'pill' 
    ? 'rounded-full' 
    : 'rounded-xl'

  const totalRequired = program.total_stamps_required || 6
  const isRewardUnlocked = currentStamps >= totalRequired

  // Cargar teléfono recordado en el dispositivo
  useEffect(() => {
    const savedPhone = localStorage.getItem(`omnitag_loyalty_${program.id}_phone`)
    const savedName = localStorage.getItem(`omnitag_loyalty_${program.id}_name`)
    if (savedPhone) {
      setPhone(savedPhone)
      if (savedName) setName(savedName)
      fetchMemberData(savedPhone, savedName || '')
    }
  }, [program.id])

  const fetchMemberData = async (clientPhone: string, clientName: string) => {
    setIsLoading(true)
    try {
      // Usar Supabase cliente o llamada a servidor
      const res = await fetch(`/api/loyalty/member?program_id=${program.id}&phone=${encodeURIComponent(clientPhone)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.member) {
          setCurrentStamps(data.member.current_stamps || 0)
          setTotalClaimed(data.member.total_rewards_claimed || 0)
          if (data.member.customer_name) setName(data.member.customer_name)
        }
      }
      setIsIdentified(true)
    } catch {
      setIsIdentified(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleIdentification = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return
    localStorage.setItem(`omnitag_loyalty_${program.id}_phone`, phone)
    localStorage.setItem(`omnitag_loyalty_${program.id}_name`, name)
    fetchMemberData(phone, name)
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pinInput.length < 4) return
    setIsLoading(true)
    setErrorMessage('')

    const formData = new FormData()
    formData.append('program_id', program.id)
    formData.append('phone', phone)
    formData.append('name', name || 'Cliente')
    formData.append('pin', pinInput)

    if (pinAction === 'stamp') {
      const result = await validateAndAddStamp(formData)
      setIsLoading(false)

      if (!result.success) {
        setErrorMessage(result.error || 'PIN incorrecto.')
        setPinInput('')
      } else {
        setCurrentStamps(result.newStamps || 0)
        setSuccessMessage('🎉 ¡Visita verificada! +1 Sello acumulado.')
        setShowPinModal(false)
        setPinInput('')
        setTimeout(() => setSuccessMessage(''), 4000)
      }
    } else {
      const result = await claimLoyaltyReward(formData)
      setIsLoading(false)

      if (!result.success) {
        setErrorMessage(result.error || 'PIN incorrecto.')
        setPinInput('')
      } else {
        setCurrentStamps(0)
        setTotalClaimed(prev => prev + 1)
        setSuccessMessage('🎁 ¡Felicidades! Tu premio ha sido canjeado.')
        setShowPinModal(false)
        setPinInput('')
        setTimeout(() => setSuccessMessage(''), 4000)
      }
    }
  }

  const openPinModal = (action: 'stamp' | 'claim') => {
    setPinAction(action)
    setPinInput('')
    setErrorMessage('')
    setShowPinModal(true)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 1. Paso de Identificación (Solo si es la primera vez en este móvil) */}
      {!isIdentified ? (
        <div 
          className={`p-6 sm:p-8 shadow-2xl border transition-all ${cardRadiusClass}`}
          style={{ backgroundColor: cardBg, color: textColor, borderColor: 'rgba(0,0,0,0.08)' }}
        >
          <div className="text-center mb-6">
            {program.logo_url ? (
              <div 
                className="w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden shadow-md border-2 p-1 bg-white"
                style={{ borderColor: primaryColor }}
              >
                <img src={program.logo_url} alt={program.name} className="w-full h-full object-cover rounded-xl" />
              </div>
            ) : (
              <div 
                className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                <Gift className="w-8 h-8" />
              </div>
            )}
            <h1 className="text-2xl font-extrabold" style={{ color: textColor }}>{program.name}</h1>
            <p className="text-xs sm:text-sm opacity-75 mt-1">Club de Fidelización & Premios</p>
          </div>

          <div 
            className="p-4 rounded-xl mb-6 text-center border"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: 'rgba(0,0,0,0.06)' }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">Premio a Desbloquear:</span>
            <p className="text-base font-extrabold mt-0.5" style={{ color: primaryColor }}>
              🎁 {program.reward_title}
            </p>
            <p className="text-xs opacity-70 mt-1">Acumula {totalRequired} sellos en tus visitas y gánalo gratis.</p>
          </div>

          <form onSubmit={handleIdentification} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">
                Tu Número de WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 opacity-40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. +504 9988-6256"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  style={{ 
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    borderColor: isDark ? '#334155' : '#E2E8F0' 
                  }}
                />
              </div>
              <p className="text-[11px] opacity-60 mt-1">
                Tus sellos quedarán guardados de forma segura en tu número.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">
                Tu Nombre (Opcional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 opacity-40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  style={{ 
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    borderColor: isDark ? '#334155' : '#E2E8F0' 
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{ backgroundColor: primaryColor }}
              className={`w-full text-white font-extrabold py-3.5 text-sm shadow-md hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2 ${btnRadiusClass}`}
            >
              <span>Ver Mi Tarjeta de Sellos</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* 2. TARJETA DIGITAL DE SELLOS INTERACTIVA */
        <div 
          className={`shadow-2xl border overflow-hidden transition-all ${cardRadiusClass}`}
          style={{ backgroundColor: cardBg, color: textColor, borderColor: 'rgba(0,0,0,0.08)' }}
        >
          {/* Banner de Cabecera */}
          <div 
            className="p-6 text-center text-white relative overflow-hidden"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="relative z-10">
              {program.logo_url && (
                <div className="w-16 h-16 mx-auto mb-2 rounded-2xl overflow-hidden shadow-lg border-2 border-white/40 bg-white p-0.5">
                  <img src={program.logo_url} alt={program.name} className="w-full h-full object-cover rounded-xl" />
                </div>
              )}
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{program.name}</h2>
              <p className="text-xs text-white/80 mt-0.5 font-medium">Tarjeta de Lealtad Digital</p>

              {name && (
                <div className="mt-2 inline-flex items-center gap-1 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
                  <span>Hola, {name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notificación de Éxito */}
          {successMessage && (
            <div className="p-4 bg-emerald-500 text-white text-xs sm:text-sm font-bold text-center animate-in fade-in flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Recompensa Destacada */}
          <div className="p-6 text-center border-b border-black/5">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider opacity-60">
              {isRewardUnlocked ? '🎉 ¡META ALCANZADA!' : 'PREMIO POR COMPLETAR:'}
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold mt-1" style={{ color: primaryColor }}>
              🎁 {program.reward_title}
            </h3>
            {program.reward_description && (
              <p className="text-xs opacity-75 mt-1 max-w-xs mx-auto leading-relaxed">
                {program.reward_description}
              </p>
            )}
          </div>

          {/* REJILLA DE SELLOS DIGITALES */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 sm:gap-5 justify-items-center">
              {Array.from({ length: totalRequired }).map((_, index) => {
                const stampIndex = index + 1
                const isStamped = stampIndex <= currentStamps
                const isFinalReward = stampIndex === totalRequired

                return (
                  <div key={stampIndex} className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center transition-all relative border-2 ${
                        isStamped
                          ? 'shadow-md scale-105 animate-in zoom-in-95'
                          : 'border-dashed border-black/15 bg-black/5 opacity-60'
                      }`}
                      style={{
                        backgroundColor: isStamped ? `${primaryColor}15` : undefined,
                        borderColor: isStamped ? primaryColor : undefined,
                      }}
                    >
                      {isStamped ? (
                        <>
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <Check className="w-5 h-5 stroke-[3]" />
                          </div>
                          <span className="text-[10px] font-bold mt-1" style={{ color: primaryColor }}>
                            Visita #{stampIndex}
                          </span>
                        </>
                      ) : isFinalReward ? (
                        <>
                          <Gift className="w-6 h-6 text-amber-500 animate-bounce" />
                          <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-tighter mt-0.5">
                            ¡Premio!
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-base sm:text-lg font-extrabold opacity-40">
                            {stampIndex}
                          </span>
                          <span className="text-[9px] uppercase font-semibold opacity-40">Sello</span>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Estado del Progreso */}
            <div className="mt-8 text-center">
              {isRewardUnlocked ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 animate-pulse">
                  <p className="font-extrabold text-sm sm:text-base">¡Tienes un premio listo para canjear!</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Muestra esta pantalla al cajero para reclamarlo.</p>
                </div>
              ) : (
                <p className="text-xs sm:text-sm font-semibold opacity-75">
                  Llevas <span className="font-extrabold text-base" style={{ color: primaryColor }}>{currentStamps}</span> de <span className="font-extrabold text-base">{totalRequired}</span> sellos acumulados.
                  <br />
                  <span className="opacity-70 text-xs">
                    (Te faltan {totalRequired - currentStamps} visitas para ganar tu premio)
                  </span>
                </p>
              )}
            </div>

            {/* BOTONES DE ACCIÓN EN CAJA */}
            <div className="mt-6 space-y-3">
              {isRewardUnlocked ? (
                <button
                  type="button"
                  onClick={() => openPinModal('claim')}
                  className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition ${btnRadiusClass}`}
                >
                  <Gift className="w-5 h-5" />
                  <span>Canjear Mi Premio en Caja</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openPinModal('stamp')}
                  style={{ backgroundColor: primaryColor }}
                  className={`w-full text-white font-extrabold py-3.5 text-sm shadow-md hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer transition ${btnRadiusClass}`}
                >
                  <Award className="w-5 h-5" />
                  <span>Sellar Mi Visita de Hoy (+1 Sello)</span>
                </button>
              )}

              <p className="text-[11px] text-center opacity-50">
                🔒 El personal del local introducirá el PIN de autorización para validar la visita.
              </p>
            </div>

            {totalClaimed > 0 && (
              <div className="mt-6 pt-4 border-t border-black/5 text-center text-xs opacity-60">
                ⭐ Has ganado y canjeado <b>{totalClaimed} premio(s)</b> en este negocio.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MODAL DE VALIDACIÓN POR PIN DE CAJERO */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className={`w-full max-w-sm overflow-hidden shadow-2xl border p-6 text-center ${cardRadiusClass}`}
            style={{ 
              backgroundColor: cardBg,
              color: textColor,
              borderColor: 'rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                Validación del Personal
              </span>
              <button 
                onClick={() => setShowPinModal(false)}
                className="p-1 opacity-60 hover:opacity-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div 
              className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: pinAction === 'claim' ? '#059669' : primaryColor }}
            >
              <KeyRound className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-extrabold mb-1">
              {pinAction === 'claim' ? 'Autorizar Canje de Premio' : 'PIN de Validación del Cajero'}
            </h3>
            <p className="text-xs opacity-70 mb-4">
              El cajero o empleado debe introducir el PIN de 4 dígitos para confirmar.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full text-center tracking-[1em] text-2xl font-mono font-extrabold py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                style={{ 
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  borderColor: isDark ? '#334155' : '#CBD5E1' 
                }}
              />

              <button
                type="submit"
                disabled={pinInput.length < 4 || isLoading}
                style={{ backgroundColor: pinAction === 'claim' ? '#059669' : primaryColor }}
                className={`w-full text-white font-extrabold py-3.5 text-sm shadow-md hover:opacity-90 transition disabled:opacity-50 cursor-pointer ${btnRadiusClass}`}
              >
                {isLoading ? 'Validando...' : pinAction === 'claim' ? 'Confirmar Entrega de Premio' : 'Validar Sello (+1)'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
