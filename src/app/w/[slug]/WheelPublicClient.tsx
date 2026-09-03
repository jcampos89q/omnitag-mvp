'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, Gift, Check, Clock, AlertCircle, ShieldCheck, Lock, RefreshCw, X } from 'lucide-react'

interface WheelItem {
  id: string
  label: string
  icon: string
  bg_color: string
  text_color: string
  probability_weight: number
  reward_type: string
  stamp_count?: number
}

interface WheelPublicClientProps {
  wheel: any
  items: WheelItem[]
  isClosed: boolean
  closedReason: string
  table?: string
}

export default function WheelPublicClient({
  wheel,
  items,
  isClosed,
  closedReason,
  table: initialTable
}: WheelPublicClientProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [table, setTable] = useState(initialTable || '')
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [spinStatus, setSpinStatus] = useState('✨ Toca GIRAR para probar tu suerte')
  
  // Estado del Premio Ganado
  const [wonPrize, setWonPrize] = useState<{
    prize: any
    couponCode: string
    expiresAt: string
  } | null>(null)

  // Estado de Redención en Caja (Mesero)
  const [showRedeemModal, setShowRedeemModal] = useState(false)
  const [cashierPin, setCashierPin] = useState('')
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [redeemedSuccess, setRedeemedSuccess] = useState(false)
  const [redeemError, setRedeemError] = useState('')

  // Canvas Refs & Animation
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef<HTMLDivElement>(null)
  const [currentRotation, setCurrentRotation] = useState(0)
  const [ledBlinkPhase, setLedBlinkPhase] = useState(0)

  // Web Audio Context para sonidos de Tick y Fanfarria
  const audioCtxRef = useRef<AudioContext | null>(null)

  const playTickSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        audioCtxRef.current = new AudioCtx()
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
      const osc = audioCtxRef.current.createOscillator()
      const gain = audioCtxRef.current.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(700, audioCtxRef.current.currentTime)
      osc.frequency.exponentialRampToValueAtTime(120, audioCtxRef.current.currentTime + 0.035)
      gain.gain.setValueAtTime(0.25, audioCtxRef.current.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.035)
      osc.connect(gain)
      gain.connect(audioCtxRef.current.destination)
      osc.start()
      osc.stop(audioCtxRef.current.currentTime + 0.035)
    } catch {
      // Ignorar restricciones de audio del navegador
    }
  }

  const playWinFanfare = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        audioCtxRef.current = new AudioCtx()
      }
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]
      notes.forEach((freq, idx) => {
        if (!audioCtxRef.current) return
        const osc = audioCtxRef.current.createOscillator()
        const gain = audioCtxRef.current.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime + idx * 0.1)
        gain.gain.setValueAtTime(0.35, audioCtxRef.current.currentTime + idx * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + idx * 0.1 + 0.45)
        osc.connect(gain)
        gain.connect(audioCtxRef.current.destination)
        osc.start(audioCtxRef.current.currentTime + idx * 0.1)
        osc.stop(audioCtxRef.current.currentTime + idx * 0.1 + 0.45)
      })
    } catch {
      // Ignorar si el usuario tiene audio silenciado
    }
  }

  // Dibujar Ruleta 100% Concéntrica
  const drawWheel = (rotation: number, phase: number) => {
    const canvas = canvasRef.current
    if (!canvas || items.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const cx = w / 2
    const cy = h / 2
    const outerRadius = w / 2 - 10
    const rimWidth = 42
    const wheelRadius = outerRadius - rimWidth

    ctx.clearRect(0, 0, w, h)

    // 1. MARCO EXTERIOR FIJO: Bisel Dorado de Lujo
    const goldGrad = ctx.createRadialGradient(cx, cy, wheelRadius, cx, cy, outerRadius)
    goldGrad.addColorStop(0, '#78350F')
    goldGrad.addColorStop(0.3, '#D97706')
    goldGrad.addColorStop(0.6, '#FDE68A')
    goldGrad.addColorStop(0.85, '#B45309')
    goldGrad.addColorStop(1, '#451A03')

    ctx.beginPath()
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2)
    ctx.arc(cx, cy, wheelRadius, 0, Math.PI * 2, true)
    ctx.fillStyle = goldGrad
    ctx.fill()

    ctx.lineWidth = 4
    ctx.strokeStyle = '#FEF3C7'
    ctx.beginPath()
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2)
    ctx.stroke()

    // Luces LED perimetrales
    const totalLeds = 14
    for (let i = 0; i < totalLeds; i++) {
      const ledAngle = (i * 2 * Math.PI) / totalLeds
      const ledDist = outerRadius - (rimWidth / 2)
      const lx = cx + Math.cos(ledAngle) * ledDist
      const ly = cy + Math.sin(ledAngle) * ledDist

      ctx.beginPath()
      ctx.arc(lx, ly, 6.5, 0, Math.PI * 2)
      ctx.fillStyle = (i + phase) % 2 === 0 ? '#FEF08A' : '#F59E0B'
      ctx.shadowColor = '#FBBF24'
      ctx.shadowBlur = 10
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.lineWidth = 1.5
      ctx.strokeStyle = '#78350F'
      ctx.stroke()
    }

    // 2. RUEDA INTERIOR GIRATORIA
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)

    const numSegments = items.length
    const arcSize = (2 * Math.PI) / numSegments

    for (let i = 0; i < numSegments; i++) {
      const angle = i * arcSize

      ctx.beginPath()
      ctx.fillStyle = items[i].bg_color || '#7C3AED'
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, wheelRadius, angle, angle + arcSize)
      ctx.lineTo(0, 0)
      ctx.fill()

      ctx.lineWidth = 4
      ctx.strokeStyle = '#FEF08A'
      ctx.stroke()

      ctx.save()
      ctx.rotate(angle + arcSize / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = items[i].text_color || '#FFFFFF'

      // Icono
      ctx.font = 'bold 30px sans-serif'
      ctx.fillText(items[i].icon || '🎁', wheelRadius - 20, 10)

      // Texto del Premio con sombra para máxima legibilidad
      ctx.font = 'bold 22px sans-serif'
      ctx.shadowColor = 'rgba(0,0,0,0.9)'
      ctx.shadowBlur = 6
      ctx.fillText(items[i].label, wheelRadius - 65, 8)
      ctx.restore()
    }

    // Clavijas perimetrales
    for (let i = 0; i < numSegments * 2; i++) {
      const pinAngle = (i * Math.PI) / numSegments
      const px = Math.cos(pinAngle) * (wheelRadius - 12)
      const py = Math.sin(pinAngle) * (wheelRadius - 12)

      ctx.beginPath()
      ctx.arc(px, py, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#F59E0B'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(px - 1.5, py - 1.5, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()
    }

    ctx.restore()

    // 3. ANILLO CENTRAL
    ctx.beginPath()
    ctx.arc(cx, cy, 58, 0, Math.PI * 2)
    ctx.fillStyle = '#0F172A'
    ctx.fill()
    ctx.lineWidth = 4
    ctx.strokeStyle = '#F59E0B'
    ctx.stroke()
  }

  useEffect(() => {
    drawWheel(currentRotation, ledBlinkPhase)
  }, [items, currentRotation, ledBlinkPhase])

  // Iniciar flujo de Giro: Si no tiene datos, pedir WhatsApp
  const handleInitiateSpin = () => {
    if (isClosed || isSpinning) return
    if (!name.trim() || !phone.trim()) {
      setShowLeadModal(true)
      return
    }
    executeSpin()
  }

  // Ejecución segura del giro comunicando con API
  const executeSpin = async () => {
    if (isSpinning) return
    setIsSpinning(true)
    setErrorMsg('')
    setShowLeadModal(false)
    setSpinStatus('⚡ Girando ruleta...')

    try {
      const res = await fetch('/api/wheel/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: wheel.slug,
          name,
          phone,
          table
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setIsSpinning(false)
        setErrorMsg(data.error || 'No se pudo girar la ruleta.')
        setSpinStatus('⚠️ No fue posible girar')
        return
      }

      // Animación con física Quintic Ease-Out
      const winningIndex = data.winningIndex
      const numSegments = items.length
      const arcSize = (2 * Math.PI) / numSegments
      // Puntero arriba en 3*PI/2 (270 grados)
      const targetAngle = (3 * Math.PI / 2) - (winningIndex * arcSize + arcSize / 2)
      
      const totalSpins = 7 + Math.floor(Math.random() * 2)
      const startRotation = currentRotation % (2 * Math.PI)
      const endRotation = startRotation + totalSpins * (2 * Math.PI) + (targetAngle - startRotation)

      const duration = 5200
      const startTime = performance.now()
      let lastSegment = -1

      const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5)

      const animate = (time: number) => {
        const elapsed = time - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = easeOutQuint(progress)

        const newRot = startRotation + (endRotation - startRotation) * easeProgress
        setCurrentRotation(newRot)
        setLedBlinkPhase(Math.floor(time / 200))
        drawWheel(newRot, Math.floor(time / 200))

        // Tick del puntero
        const normalizedAngle = newRot % (2 * Math.PI)
        const currentSegment = Math.floor((normalizedAngle / (2 * Math.PI)) * (numSegments * 2))
        if (currentSegment !== lastSegment) {
          lastSegment = currentSegment
          playTickSound()
          if (pointerRef.current) {
            pointerRef.current.style.transform = 'rotate(-24deg)'
            setTimeout(() => {
              if (pointerRef.current) pointerRef.current.style.transform = 'rotate(0deg)'
            }, 45)
          }
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsSpinning(false)
          setSpinStatus('🎉 ¡Felicidades! Has desbloqueado tu premio')
          playWinFanfare()
          launchConfetti()
          setWonPrize({
            prize: data.prize,
            couponCode: data.couponCode,
            expiresAt: data.expiresAt
          })
        }
      }

      requestAnimationFrame(animate)
    } catch (err: any) {
      setIsSpinning(false)
      setErrorMsg(err.message || 'Error de conexión.')
    }
  }

  // Confeti
  const launchConfetti = () => {
    if (typeof window === 'undefined') return
    const cCanvas = document.createElement('canvas')
    cCanvas.className = 'fixed inset-0 pointer-events-none z-50'
    cCanvas.width = window.innerWidth
    cCanvas.height = window.innerHeight
    document.body.appendChild(cCanvas)
    const cCtx = cCanvas.getContext('2d')
    if (!cCtx) return

    const particles: any[] = []
    const colors = ['#F59E0B', '#EC4899', '#6366F1', '#10B981', '#3B82F6', '#F43F5E', '#FBBF24']

    for (let i = 0; i < 110; i++) {
      particles.push({
        x: cCanvas.width / 2,
        y: cCanvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 9 + 4,
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
      if (frame < 130) {
        requestAnimationFrame(render)
      } else {
        cCanvas.remove()
      }
    }
    render()
  }

  // Canjear Cupón con PIN de Cajero
  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wonPrize) return
    setIsRedeeming(true)
    setRedeemError('')

    try {
      const res = await fetch('/api/wheel/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: wonPrize.couponCode,
          pinCode: cashierPin
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setRedeemError(data.error || 'Error al validar cupón.')
        setIsRedeeming(false)
        return
      }
      setRedeemedSuccess(true)
      setIsRedeeming(false)
    } catch {
      setRedeemError('Error de conexión.')
      setIsRedeeming(false)
    }
  }

  // SI LA RULETA ESTÁ PAUSADA O FUERA DE HORARIO
  if (isClosed) {
    return (
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-inner">
          🎰
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {wheel.name || 'Ruleta de Premios'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {closedReason}
          </p>
        </div>
        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
          <p className="font-bold text-slate-300">💡 ¿Quieres consultar otros servicios?</p>
          <p>Pide a tu mesero tu tarjeta de sellos o consulta nuestro catálogo en la mesa.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6">
      
      {/* Luces de ambiente */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Cabecera VIP */}
      <div className="text-center relative z-10 space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-black uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>{table ? `Mesa ${table}` : 'Premio de Visita Exclusivo'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <span>🎰</span>
          <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            {wheel.name || 'Ruleta de la Fortuna'}
          </span>
        </h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          {wheel.description || 'Gira y desbloquea un beneficio instantáneo en tu visita.'}
        </p>
      </div>

      {/* Escenario de la Ruleta */}
      <div className="relative flex flex-col items-center justify-center py-2 z-10">
        
        {/* Puntero Superior Metálico 3D */}
        <div className="absolute -top-2.5 z-30 pointer-events-none drop-shadow-2xl">
          <div ref={pointerRef} className="w-9 h-12 transition-transform origin-top flex items-center justify-center">
            <svg viewBox="0 0 36 48" className="w-full h-full">
              <defs>
                <linearGradient id="goldPointerGradPublic" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE082" />
                  <stop offset="50%" stopColor="#FFB300" />
                  <stop offset="100%" stopColor="#E65100" />
                </linearGradient>
              </defs>
              <path d="M18 46 L4 10 C4 4, 10 2, 18 2 C26 2, 32 4, 32 10 Z" fill="url(#goldPointerGradPublic)" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="18" cy="12" r="5.5" fill="#DC2626" stroke="#FEF08A" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Canvas de la Ruleta */}
        <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] flex items-center justify-center">
          <canvas ref={canvasRef} width={800} height={800} className="w-full h-full cursor-pointer" onClick={handleInitiateSpin} />
          
          {/* Botón Central de Giro */}
          <button 
            type="button"
            disabled={isSpinning}
            onClick={handleInitiateSpin}
            className="absolute z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-700 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest shadow-2xl border-4 border-slate-950 flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer select-none disabled:opacity-80"
          >
            <span className="text-base sm:text-lg">🎲</span>
            <span className="tracking-tighter font-extrabold leading-none mt-0.5">GIRAR</span>
            <span className="text-[8px] font-black opacity-80 mt-0.5">GRATIS</span>
          </button>
        </div>

        {/* Estado o Mensaje de Error */}
        {errorMsg ? (
          <div className="mt-3 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <p>{errorMsg}</p>
          </div>
        ) : (
          <p className="mt-3 text-xs font-bold text-amber-400 tracking-wide animate-pulse">
            {spinStatus}
          </p>
        )}
      </div>

      {/* Modal / Tarjeta del Premio Ganador */}
      {wonPrize && (
        <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-5 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-300 relative z-20">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner animate-bounce">
            {wonPrize.prize.icon || '🎁'}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-900/60 border border-emerald-500/40 px-3 py-0.5 rounded-full">
              ¡Premio Desbloqueado!
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5">
              {wonPrize.prize.label}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xs mx-auto">
              Muestra esta pantalla a tu mesero o cajero para validar tu beneficio.
            </p>
          </div>

          {/* Cupón con Código Único & Cuenta Regresiva */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 max-w-sm mx-auto shadow-inner">
            <div className="text-left">
              <p className="text-[9px] uppercase font-bold text-slate-400">Código Único</p>
              <p className="text-base font-mono font-black text-amber-400 tracking-wider">
                {wonPrize.couponCode}
              </p>
            </div>
            <div className="text-right bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30">
              <p className="text-[9px] uppercase font-bold text-amber-400">Válido Durante</p>
              <p className="text-xs font-mono font-black text-amber-300">2 Horas</p>
            </div>
          </div>

          {/* Botón de Redención para el Mesero */}
          <div className="pt-1">
            {redeemedSuccess ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center justify-center gap-2 text-emerald-300 text-xs font-bold">
                <Check className="w-4 h-4" />
                <span>¡Cupón canjeado y aplicado a tu cuenta!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowRedeemModal(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>👨‍🍳 Botón para el Mesero: Marcar Canjeado</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CAPTURA DE DATOS (ANTES DE GIRAR) */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎰</span>
                <h3 className="text-base font-black text-white">¡Casi listo para girar!</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowLeadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Ingresa tu nombre y WhatsApp para guardar tu cupón y no perder tu premio.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); executeSpin(); }} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Tu Nombre:</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej. Carlos Mendoza" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Número de WhatsApp:</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="Ej. +504 9988-7766" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Mesa / Ubicación (Opcional):</label>
                <input 
                  type="text" 
                  placeholder="Ej. Mesa 4 o Barra" 
                  value={table} 
                  onChange={(e) => setTable(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSpinning}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>🎲 ¡GIRAR MI RULETA AHORA!</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE REDENCIÓN DEL MESERO */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Validación de Mesero</span>
              </h4>
              <button 
                type="button" 
                onClick={() => setShowRedeemModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-300">
              Presiona confirmar para aplicar este beneficio al consumo de la mesa.
            </p>

            {redeemError && (
              <p className="text-[10px] text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-800">
                {redeemError}
              </p>
            )}

            <form onSubmit={handleRedeemCoupon} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">PIN del Local (Opcional):</label>
                <input 
                  type="password" 
                  placeholder="PIN (por defecto 1234)" 
                  value={cashierPin} 
                  onChange={(e) => setCashierPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white text-center font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRedeemModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRedeeming}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 rounded-lg text-xs"
                >
                  {isRedeeming ? 'Validando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pie integrado */}
      <div className="pt-2 border-t border-slate-800 text-center">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <span>🔒</span>
          <span>Tecnología de Gamificación & Fidelización <b>OmniTag</b></span>
        </p>
      </div>

    </div>
  )
}
