'use client'

import { useEffect, useState } from 'react'
import { initializePaddle, Paddle } from '@paddle/paddle-js'
import { CreditCard, Loader2 } from 'lucide-react'

interface PaddleCheckoutButtonProps {
  priceId?: string
  userEmail?: string
  userId?: string
  className?: string
  children?: React.ReactNode
}

let paddleInstance: Paddle | null = null

export default function PaddleCheckoutButton({
  priceId,
  userEmail,
  userId,
  className,
  children
}: PaddleCheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [paddleReady, setPaddleReady] = useState(false)

  const targetPriceId = priceId || process.env.NEXT_PUBLIC_PADDLE_PLAN_PRO_PRICE_ID || 'pri_01m7695stt6jtf8rcvh232a8gj'
  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || 'test_f3ac6fe9263ed769d869f31c3d3'
  const environment = (process.env.NEXT_PUBLIC_PADDLE_ENV as 'sandbox' | 'production') || 'sandbox'

  useEffect(() => {
    let mounted = true
    async function init() {
      if (paddleInstance) {
        if (mounted) setPaddleReady(true)
        return
      }
      try {
        const paddle = await initializePaddle({
          environment,
          token: clientToken,
          checkout: {
            settings: {
              displayMode: 'overlay',
              theme: 'light',
              locale: 'es'
            }
          }
        })
        if (paddle && mounted) {
          paddleInstance = paddle
          setPaddleReady(true)
        }
      } catch (err) {
        console.error('Error inicializando Paddle:', err)
      }
    }
    init()
    return () => {
      mounted = false
    }
  }, [clientToken, environment])

  const handleCheckout = () => {
    if (!paddleInstance) {
      alert('Cargando pasarela de pago segura de Paddle...')
      return
    }

    setLoading(true)
    try {
      paddleInstance.Checkout.open({
        items: [
          {
            priceId: targetPriceId,
            quantity: 1
          }
        ],
        customer: userEmail ? { email: userEmail } : undefined,
        customData: userId ? { userId } : undefined
      })
    } catch (err) {
      console.error('Error abriendo checkout de Paddle:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className={
        className ||
        'w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3 px-4 rounded-xl transition text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer'
      }
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4" />
      )}
      <span>{children || 'Pagar con Tarjeta Segura (Paddle)'}</span>
    </button>
  )
}
