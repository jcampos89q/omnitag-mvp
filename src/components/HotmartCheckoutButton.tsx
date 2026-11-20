'use client'

import React, { useEffect, useCallback } from 'react'

interface HotmartCheckoutButtonProps {
  plan?: 'monthly' | 'annual'
  offerCode?: string
  productId?: string
  checkoutUrl?: string
  userEmail?: string
  userId?: string
  className?: string
  children?: React.ReactNode
}

export default function HotmartCheckoutButton({
  plan = 'monthly',
  offerCode,
  productId = 'X108582072E',
  checkoutUrl,
  userEmail,
  userId,
  className = '',
  children
}: HotmartCheckoutButtonProps) {
  const selectedOffer = offerCode || (plan === 'annual' ? 'l8fb16kg' : '12wgidyv')

  let finalUrl = checkoutUrl || `https://pay.hotmart.com/${productId}?checkoutMode=2&off=${selectedOffer}`

  if (userEmail) {
    finalUrl += `${finalUrl.includes('?') ? '&' : '?'}email=${encodeURIComponent(userEmail)}`
  }
  if (userId) {
    finalUrl += `${finalUrl.includes('?') ? '&' : '?'}sck=${encodeURIComponent(userId)}`
  }

  const bindFancybox = useCallback(() => {
    if (typeof window !== 'undefined') {
      const w = window as any
      if (w.jQuery && typeof w.jQuery === 'function') {
        try {
          const isMobile =
            screen.width <= 600 ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

          if (!isMobile && w.jQuery.fn && w.jQuery.fn.fancybox) {
            w.jQuery('.hotmart-fb').fancybox({
              type: 'iframe',
              toolbar: false,
              smallBtn: true,
              iframe: {
                css: {
                  width: '600px'
                },
                attr: {
                  allowpaymentrequest: 'true'
                }
              }
            })
          }
        } catch {
          // Si ocurre algún fallo de jQuery, el enlace href normal funciona perfectamente
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Inyectar CSS de Hotmart
    const cssId = 'hotmart-fb-css'
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link')
      link.id = cssId
      link.rel = 'stylesheet'
      link.type = 'text/css'
      link.href = 'https://static.hotmart.com/css/hotmart-fb.min.css'
      document.head.appendChild(link)
    }

    // 2. Inyectar Script del Widget de Hotmart
    const scriptId = 'hotmart-widget-js'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://static.hotmart.com/checkout/widget.min.js'
      script.async = true
      script.onload = () => {
        setTimeout(bindFancybox, 400)
      }
      document.head.appendChild(script)
    } else {
      setTimeout(bindFancybox, 200)
    }
  }, [bindFancybox])

  return (
    <a
      href={finalUrl}
      onMouseEnter={bindFancybox}
      className={`hotmart-fb hotmart__button-checkout ${className}`}
    >
      {children}
    </a>
  )
}
