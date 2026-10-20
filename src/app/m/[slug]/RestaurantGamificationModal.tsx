'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Sparkles, 
  Gift, 
  Star, 
  Clock, 
  Check, 
  Copy, 
  ExternalLink, 
  X, 
  Disc, 
  Layers, 
  AlertCircle,
  Send,
  CheckCircle2,
  Lock
} from 'lucide-react'

interface PrizeItem {
  id: string
  label: string
  icon: string
  bg_color: string
  text_color: string
  reward_type: string
}

interface RestaurantGamificationModalProps {
  isOpen: boolean
  onClose: () => void
  menu: any
  wheel: any
  items: PrizeItem[]
  reviewDevice?: any
  initialTable?: string
  onApplyCouponToCart?: (coupon: { label: string; code: string }) => void
}

export default function RestaurantGamificationModal({
  isOpen,
  onClose,
  menu,
  wheel,
  items,
  reviewDevice,
  initialTable = '',
  onApplyCouponToCart
}: RestaurantGamificationModalProps) {
  // Estado del juego
  const [gameMode, setGameMode] = useState<'scratch' | 'wheel'>('scratch')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [table, setTable] = useState(initialTable || '')
  const [isSpinning, setIsSpinning] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [leadSubmitted, setLeadSubmitted] = useState(false)

  // Premio ganado
  const [wonPrize, setWonPrize] = useState<{
    prize: PrizeItem
    couponCode: string
    expiresAt: string
  } | null>(null)

  // Calificación de estrellas (Filtro inteligente de reseñas)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [privateFeedbackText, setPrivateFeedbackText] = useState('')
  const [isSendingFeedback, setIsSendingFeedback] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>('45:00')

  // Scratch Card Canvas Refs
  const scratchCanvasRef = useRef<HTMLCanvasElement>(null)
  const [scratchPercent, setScratchPercent] = useState(0)
  const isScratchingRef = useRef(false)
  const [isRevealed, setIsRevealed] = useState(false)

  // Wheel Canvas Refs
  const wheelCanvasRef = useRef<HTMLCanvasElement>(null)
  const [currentRotation, setCurrentRotation] = useState(0)

  // Web Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null)

  // 1. Recuperar premio guardado de la sesión de hoy si existe
  useEffect(() => {
    if (!menu?.id) return
    try {
      const storageKey = `omnitag_restaurant_reward_${menu.id}`
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        const ageHours = (Date.now() - (parsed.timestamp || 0)) / (1000 * 3600)
        if (ageHours < (wheel?.cooldown_hours || 24)) {
          setWonPrize(parsed.wonPrize)
          setLeadSubmitted(true)
          setIsRevealed(true)
          if (parsed.wonPrize && onApplyCouponToCart) {
            onApplyCouponToCart({
              label: parsed.wonPrize.prize.label,
              code: parsed.wonPrize.couponCode
            })
          }
        } else {
          localStorage.removeItem(storageKey)
        }
      }
    } catch {
      // Ignorar fallos de localStorage privado
    }
  }, [menu?.id, wheel?.cooldown_hours])

  // 2. Temporizador regresivo de expiración del cupón
  useEffect(() => {
    if (!wonPrize?.expiresAt) return
    const updateCountdown = () => {
      const diff = new Date(wonPrize.expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Expirado')
        return
      }
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`)
    }
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [wonPrize?.expiresAt])

  // Sonidos con Web Audio API
  const playSound = (type: 'tick' | 'win' | 'scratch') => {
    try {
      if (typeof window === 'undefined') return
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (AudioCtx) audioCtxRef.current = new AudioCtx()
      }
      const ctx = audioCtxRef.current
      if (!ctx) return
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      if (type === 'scratch') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(320 + Math.random() * 160, ctx.currentTime)
        gain.gain.setValueAtTime(0.03, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.04)
      } else if (type === 'tick') {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(750, ctx.currentTime)
        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.03)
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12)
          gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.12)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(ctx.currentTime + idx * 0.12)
          osc.stop(ctx.currentTime + idx * 0.12 + 0.35)
        })
      }
    } catch {
      // Ignorar restricciones de audio del navegador
    }
  }

  // Animación de Confeti Canvas
  const launchConfetti = () => {
    if (typeof window === 'undefined') return
    const cCanvas = document.createElement('canvas')
    cCanvas.className = 'fixed inset-0 pointer-events-none z-60'
    cCanvas.width = window.innerWidth
    cCanvas.height = window.innerHeight
    document.body.appendChild(cCanvas)
    const cCtx = cCanvas.getContext('2d')
    if (!cCtx) return

    const particles: any[] = []
    const colors = ['#F59E0B', '#EC4899', '#6366F1', '#10B981', '#3B82F6', '#F43F5E', '#FBBF24']

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: cCanvas.width / 2,
        y: cCanvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12
      })
    }

    let frame = 0
    const render = () => {
      cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.38
        p.rotation += p.rotSpeed
        cCtx.save()
        cCtx.translate(p.x, p.y)
        cCtx.rotate((p.rotation * Math.PI) / 180)
        cCtx.fillStyle = p.color
        cCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        cCtx.restore()
      })
      frame++
      if (frame < 120) {
        requestAnimationFrame(render)
      } else {
        cCanvas.remove()
      }
    }
    requestAnimationFrame(render)
  }

  // Pintar lámina de oro/brillo sobre la tarjeta raspable
  const paintScratchFoil = useCallback(() => {
    const canvas = scratchCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Restablecer modo de dibujo normal
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, width, height)

    // Gradiente metálico dorado y brillante
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#B45309')
    gradient.addColorStop(0.2, '#D97706')
    gradient.addColorStop(0.45, '#FDE68A')
    gradient.addColorStop(0.55, '#F59E0B')
    gradient.addColorStop(0.8, '#D97706')
    gradient.addColorStop(1, '#92400E')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Destellos dorados decorativos
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
    for (let i = 0; i < 30; i++) {
      const rx = (Math.sin(i * 123) * 0.5 + 0.5) * width
      const ry = (Math.cos(i * 87) * 0.5 + 0.5) * height
      ctx.beginPath()
      ctx.arc(rx, ry, (i % 3) + 2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Texto de instrucción sobre la lámina
    ctx.fillStyle = '#78350F'
    ctx.font = 'bold 15px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✨ RASPA CON TU DEDO ✨', width / 2, height / 2 - 12)

    ctx.fillStyle = '#92400E'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText('¡Descubre tu premio sorpresa!', width / 2, height / 2 + 14)
  }, [])

  // Inicializar la lámina cuando el canvas se monte en el DOM
  useEffect(() => {
    if (wonPrize && !isRevealed && gameMode === 'scratch') {
      const timer = setTimeout(() => {
        paintScratchFoil()
      }, 60)
      return () => clearTimeout(timer)
    }
  }, [wonPrize, isRevealed, gameMode, paintScratchFoil])

  // Lógica de raspado táctil o con cursor
  const handleScratchAction = (clientX: number, clientY: number) => {
    const canvas = scratchCanvasRef.current
    if (!canvas || isRevealed) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * canvas.width
    const y = ((clientY - rect.top) / rect.height) * canvas.height

    // Borrador circular sobre la lámina
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 26, 0, Math.PI * 2)
    ctx.fill()

    playSound('scratch')

    // Muestreo de transparencia
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imgData.data
      let transparentCount = 0
      const totalSampled = pixels.length / 32

      for (let i = 3; i < pixels.length; i += 32) {
        if (pixels[i] === 0) transparentCount++
      }
      const percent = Math.min(100, Math.round((transparentCount / totalSampled) * 100))
      setScratchPercent(percent)

      if (percent >= 35 && !isRevealed) {
        setIsRevealed(true)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        triggerWinCelebration()
      }
    } catch {
      // Ignorar fallos de muestreo
    }
  }

  // Dibujar Ruleta en Canvas
  const drawWheel = (rotation: number) => {
    const canvas = wheelCanvasRef.current
    if (!canvas || items.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const cx = width / 2
    const cy = height / 2
    const radius = cx - 12
    const arcSize = (2 * Math.PI) / items.length

    ctx.clearRect(0, 0, width, height)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)

    // Segmentos
    items.forEach((item, i) => {
      const angle = i * arcSize
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, angle, angle + arcSize)
      ctx.closePath()
      ctx.fillStyle = item.bg_color || '#B45309'
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = '#FFFFFF33'
      ctx.stroke()

      ctx.save()
      ctx.rotate(angle + arcSize / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = item.text_color || '#FFFFFF'
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText(item.icon || '🎁', radius - 15, 6)
      ctx.font = 'bold 12px sans-serif'
      ctx.fillText(item.label.substring(0, 16), radius - 45, 5)
      ctx.restore()
    })

    // Clavijas perimetrales
    for (let i = 0; i < items.length * 2; i++) {
      const pAngle = (i * Math.PI) / items.length
      const px = Math.cos(pAngle) * (radius - 5)
      const py = Math.sin(pAngle) * (radius - 5)
      ctx.beginPath()
      ctx.arc(px, py, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()
    }

    ctx.restore()

    // Centro
    ctx.beginPath()
    ctx.arc(cx, cy, 26, 0, Math.PI * 2)
    ctx.fillStyle = '#1E293B'
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#F59E0B'
    ctx.stroke()
  }

  useEffect(() => {
    if (isOpen && leadSubmitted && gameMode === 'wheel') {
      drawWheel(currentRotation)
    }
  }, [isOpen, leadSubmitted, gameMode, currentRotation, items])

  // Celebración de premio
  const triggerWinCelebration = () => {
    playSound('win')
    launchConfetti()
    if (wonPrize && onApplyCouponToCart) {
      onApplyCouponToCart({
        label: wonPrize.prize.label,
        code: wonPrize.couponCode
      })
    }
  }

  // Generar premio en el servidor
  const handleStartGame = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Por favor escribe tu Nombre y WhatsApp para recibir tu beneficio.')
      return
    }

    setErrorMsg('')
    setIsSpinning(true)

    try {
      const res = await fetch('/api/wheel/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: wheel.slug,
          name: customerName.trim(),
          phone: customerPhone.trim(),
          table: table || initialTable || 'Mesa'
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo generar el premio')
      }

      const generatedPrize = {
        prize: data.item,
        couponCode: data.couponCode,
        expiresAt: data.expiresAt
      }

      setWonPrize(generatedPrize)
      setLeadSubmitted(true)

      // Guardar en localStorage
      const storageKey = `omnitag_restaurant_reward_${menu.id}`
      localStorage.setItem(storageKey, JSON.stringify({
        timestamp: Date.now(),
        wonPrize: generatedPrize
      }))

      if (gameMode === 'wheel') {
        // Animación de la Ruleta
        const winningIndex = data.winningIndex ?? 0
        const arcSize = (2 * Math.PI) / items.length
        const targetAngle = (3 * Math.PI / 2) - (winningIndex * arcSize + arcSize / 2)
        const fullRotations = (5 + Math.floor(Math.random() * 3)) * (2 * Math.PI)
        const finalAngle = fullRotations + targetAngle

        let startTime: number | null = null
        const duration = 4000

        const animateWheel = (timestamp: number) => {
          if (!startTime) startTime = timestamp
          const elapsed = timestamp - startTime
          const progress = Math.min(elapsed / duration, 1)
          const easeOut = 1 - Math.pow(1 - progress, 3)
          const currentA = easeOut * finalAngle

          setCurrentRotation(currentA)
          drawWheel(currentA)

          if (progress < 1) {
            if (Math.random() > 0.7) playSound('tick')
            requestAnimationFrame(animateWheel)
          } else {
            setIsSpinning(false)
            setIsRevealed(true)
            triggerWinCelebration()
          }
        }
        requestAnimationFrame(animateWheel)
      } else {
        // Modo Tarjeta Raspable: listo para raspar
        setIsSpinning(false)
        setIsRevealed(false)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error. Intenta de nuevo.')
      setIsSpinning(false)
    }
  }

  // Enviar Feedback Privado (1 a 3 Estrellas)
  const handleSubmitPrivateFeedback = async () => {
    if (!reviewDevice?.id) {
      setFeedbackSent(true)
      return
    }
    setIsSendingFeedback(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: reviewDevice.id,
          rating: selectedRating || 2,
          message: privateFeedbackText || 'Comentario privado desde menú digital.',
          customer_name: customerName || 'Comensal en Mesa',
          customer_phone: customerPhone || ''
        })
      })
      setFeedbackSent(true)
    } catch {
      setFeedbackSent(true)
    } finally {
      setIsSendingFeedback(false)
    }
  }

  // URL Directa de Reseña de Google Maps
  const googleReviewUrl = reviewDevice?.place_id
    ? `https://search.google.com/local/writereview?placeid=${reviewDevice.place_id}`
    : reviewDevice?.redirect_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(menu?.name || 'Restaurante')}`

  const copyCouponCode = () => {
    if (!wonPrize?.couponCode) return
    navigator.clipboard.writeText(wonPrize.couponCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-black/10 flex flex-col max-h-[92vh]">
        
        {/* Cabecera con Botón de Cierre */}
        <div className="p-4 bg-linear-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-200 fill-current" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                {wonPrize && isRevealed ? '¡Tienes un Premio en Mesa!' : '¡Prueba tu Suerte Hoy!'}
              </h3>
              <p className="text-[11px] text-amber-100 opacity-90">
                {menu?.name || 'Beneficio exclusivo para tu visita'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer text-white/90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Principal con Scroll */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* VISTA 1: FORMULARIO DE INGRESO (Antes de Jugar) */}
          {!leadSubmitted && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <span className="text-3xl">🎁</span>
                <h4 className="font-extrabold text-gray-900 text-base">
                  Gana un beneficio instantáneo para tu cuenta
                </h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Postres de cortesía, descuentos especiales o bebidas gratis hoy.
                </p>
              </div>

              {/* Selector de Modo de Juego */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setGameMode('scratch')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    gameMode === 'scratch'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Raspa y Gana</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGameMode('wheel')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    gameMode === 'wheel'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Disc className="w-3.5 h-3.5" />
                  <span>Ruleta 3D</span>
                </button>
              </div>

              {/* Formulario de Captura */}
              <form onSubmit={handleStartGame} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Tu Nombre
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofía Morales"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Tu WhatsApp (Para validar tu cupón)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. +504 9999-9999"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSpinning}
                  className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>{gameMode === 'scratch' ? 'Comenzar a Raspar' : 'Girar la Ruleta'}</span>
                </button>

                <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Máximo 1 intento por mesa / visita.
                </p>
              </form>
            </div>
          )}

          {/* VISTA 2: EL JUEGO (Lámina Raspable Touch) */}
          {leadSubmitted && !isRevealed && wonPrize && gameMode === 'scratch' && (
            <div className="text-center space-y-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold mb-1">
                  ✨ Desliza tu dedo sobre la tarjeta dorada
                </span>
                <p className="text-xs text-gray-500">
                  Raspa al menos la mitad para revelar tu beneficio.
                </p>
              </div>

              {/* Contenedor del Raspable con Touch-None para evitar scroll accidental */}
              <div className="relative w-64 h-44 mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-400 select-none touch-none bg-slate-900 flex items-center justify-center">
                {/* Lo que está oculto debajo de la lámina */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-white text-center bg-linear-to-br from-amber-600 via-orange-600 to-amber-700">
                  <span className="text-4xl mb-1 animate-bounce">{wonPrize.prize.icon || '🎁'}</span>
                  <p className="font-black text-sm uppercase tracking-wide leading-tight">
                    {wonPrize.prize.label}
                  </p>
                  <span className="text-[10px] text-amber-200 mt-1 font-bold">
                    ¡Código generado!
                  </span>
                </div>

                {/* Lienzo Canvas que se raspa */}
                <canvas
                  ref={scratchCanvasRef}
                  width={256}
                  height={176}
                  className="absolute inset-0 cursor-pointer z-10 w-full h-full touch-none"
                  onMouseDown={(e) => {
                    isScratchingRef.current = true
                    handleScratchAction(e.clientX, e.clientY)
                  }}
                  onMouseUp={() => {
                    isScratchingRef.current = false
                  }}
                  onMouseLeave={() => {
                    isScratchingRef.current = false
                  }}
                  onMouseMove={(e) => {
                    if (isScratchingRef.current) handleScratchAction(e.clientX, e.clientY)
                  }}
                  onTouchStart={(e) => {
                    isScratchingRef.current = true
                    if (e.touches && e.touches[0]) {
                      handleScratchAction(e.touches[0].clientX, e.touches[0].clientY)
                    }
                  }}
                  onTouchEnd={() => {
                    isScratchingRef.current = false
                  }}
                  onTouchMove={(e) => {
                    if (e.cancelable) e.preventDefault()
                    if (e.touches && e.touches[0]) {
                      handleScratchAction(e.touches[0].clientX, e.touches[0].clientY)
                    }
                  }}
                />
              </div>

              {scratchPercent > 0 && (
                <div className="w-48 mx-auto bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full transition-all duration-150"
                    style={{ width: `${Math.min(scratchPercent * 2.8, 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* VISTA 2B: MODO RULETA ACTIVA */}
          {leadSubmitted && isSpinning && gameMode === 'wheel' && (
            <div className="text-center space-y-3">
              <p className="font-extrabold text-amber-600 text-xs animate-pulse">
                🎡 Girando la ruleta de la suerte...
              </p>
              <div className="relative w-64 h-64 mx-auto">
                <canvas
                  ref={wheelCanvasRef}
                  width={256}
                  height={256}
                  className="w-full h-full rounded-full shadow-lg"
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-500" />
              </div>
            </div>
          )}

          {/* VISTA 3: PREMIO GANADO + HOOK DE RESEÑAS EN GOOGLE */}
          {wonPrize && isRevealed && !isSpinning && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              
              {/* Tarjeta de Cupón Ganado */}
              <div className="bg-linear-to-br from-amber-50 to-orange-50 border-2 border-amber-400 p-4 rounded-2xl text-center space-y-2 relative overflow-hidden">
                <span className="text-4xl inline-block">{wonPrize.prize.icon || '🎉'}</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
                    Premio Obtenido
                  </span>
                  <h4 className="font-black text-lg text-gray-900 mt-1">
                    {wonPrize.prize.label}
                  </h4>
                </div>

                {/* Código de Cupón con Copiado */}
                <div className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between gap-2 max-w-xs mx-auto shadow-xs">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-gray-400 font-bold text-left">
                      Código de Mesa
                    </span>
                    <span className="font-mono font-extrabold text-sm text-amber-800">
                      {wonPrize.couponCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyCouponCode}
                    className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 transition cursor-pointer text-xs flex items-center gap-1 font-bold"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                {/* Temporizador de Mesa */}
                <div className="text-[11px] font-bold text-gray-600 flex items-center justify-center gap-1.5 pt-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Válido hoy en tu mesa ({timeLeft})</span>
                </div>
              </div>

              {/* EL HOOK DE RESEÑA: FILTRO INTELIGENTE */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center space-y-3">
                <div>
                  <h5 className="font-extrabold text-xs text-gray-800">
                    ¿Cómo calificarías tu experiencia hoy?
                  </h5>
                  <p className="text-[11px] text-gray-500">
                    Tu opinión nos ayuda a seguir brindándote la mejor atención.
                  </p>
                </div>

                {/* Estrellas Interactivas */}
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      className="p-1 text-2xl transition hover:scale-125 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (selectedRating || 0) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* CASO A: 4 O 5 ESTRELLAS -> REDIRECCIÓN A GOOGLE MAPS */}
                {selectedRating && selectedRating >= 4 && (
                  <div className="pt-2 space-y-2 animate-in fade-in duration-200">
                    <p className="text-xs font-bold text-green-700">
                      ⭐ ¡Nos alegra mucho! Déjanos una reseña rápida en Google para apoyar a nuestro restaurante:
                    </p>
                    <a
                      href={googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
                    >
                      <span>Publicar Reseña en Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <p className="text-[10px] text-gray-400">
                      Se abrirá Google Maps en 1 clic para dejar tus estrellas.
                    </p>
                  </div>
                )}

                {/* CASO B: 1 A 3 ESTRELLAS -> FEEDBACK PRIVADO A GERENCIA */}
                {selectedRating && selectedRating <= 3 && !feedbackSent && (
                  <div className="pt-2 space-y-2 text-left animate-in fade-in duration-200">
                    <p className="text-xs font-bold text-amber-800">
                      💬 Lamentamos que no haya sido perfecto. Cuéntale directamente al Gerente para solucionarlo en tu mesa:
                    </p>
                    <textarea
                      rows={2}
                      placeholder="¿Qué platillo o detalle podemos mejorar hoy?"
                      value={privateFeedbackText}
                      onChange={(e) => setPrivateFeedbackText(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                    />
                    <button
                      type="button"
                      disabled={isSendingFeedback}
                      onClick={handleSubmitPrivateFeedback}
                      className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingFeedback ? 'Enviando...' : 'Enviar a Gerencia en Privado'}</span>
                    </button>
                  </div>
                )}

                {feedbackSent && (
                  <div className="p-2.5 bg-green-50 text-green-700 rounded-xl text-xs flex items-center justify-center gap-1.5 font-bold animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Mensaje recibido por el equipo. ¡Gracias por ayudarnos!</span>
                  </div>
                )}
              </div>

              {/* Botón de Aplicar en la Cuenta */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer"
              >
                Volver al Menú con mi Cupón Activo
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
