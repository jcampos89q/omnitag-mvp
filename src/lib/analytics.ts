import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { after } from 'next/server'

export interface LogScanOptions {
  vcardId?: string
  menuId?: string
  loyaltyProgramId?: string
  deviceId?: string
  targetUserId?: string
  sourceType: 'vcard' | 'menu' | 'loyalty' | 'nfc_device' | 'qr'
  userAgent?: string
  country?: string
}

/**
 * Detecta con alta precisión el sistema operativo y el tipo de dispositivo del visitante
 */
export function detectDeviceAndOS(userAgent: string): { os: string; deviceType: string } {
  const ua = userAgent.toLowerCase()
  let os = 'Desktop'
  let deviceType = 'PC / Computadora'

  if (ua.includes('iphone')) {
    os = 'Apple'
    deviceType = 'iPhone'
  } else if (ua.includes('ipad')) {
    os = 'Apple'
    deviceType = 'iPad'
  } else if (ua.includes('android')) {
    os = 'Android'
    if (ua.includes('samsung') || ua.includes('sm-')) {
      deviceType = 'Samsung Galaxy'
    } else if (ua.includes('xiaomi') || ua.includes('redmi') || ua.includes('mi ')) {
      deviceType = 'Xiaomi / Redmi'
    } else if (ua.includes('huawei') || ua.includes('honor')) {
      deviceType = 'Huawei'
    } else if (ua.includes('pixel')) {
      deviceType = 'Google Pixel'
    } else if (ua.includes('motorola') || ua.includes('moto')) {
      deviceType = 'Motorola'
    } else {
      deviceType = 'Móvil Android'
    }
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    os = 'Apple'
    deviceType = 'MacBook / Mac'
  } else if (ua.includes('windows')) {
    os = 'Windows'
    deviceType = 'PC Windows'
  } else if (ua.includes('linux')) {
    os = 'Linux'
    deviceType = 'Linux Desktop'
  }

  return { os, deviceType }
}

/**
 * Registra una visita / escaneo de forma asíncrona y no bloqueante
 * Usa `after()` de Next.js para que el cliente reciba la página o redirección en 0ms
 * y garantiza que la inserción en base de datos no sea cancelada por el servidor en la nube.
 */
export function recordPageViewScan(options: LogScanOptions): void {
  const executeScan = async () => {
    try {
      let userAgent = options.userAgent || ''
      let country = options.country || ''

      // Si no se pasaron headers directamente, intentar obtenerlos del contexto de Server Component
      if (!userAgent || !country) {
        try {
          const headerList = await headers()
          if (!userAgent) userAgent = headerList.get('user-agent') || ''
          if (!country) country = headerList.get('x-vercel-ip-country') || 'Desconocido'
        } catch {
          // Ignorar si headers() no está disponible en este contexto
        }
      }

      if (!country) country = 'Desconocido'

      const { os, deviceType } = detectDeviceAndOS(userAgent)
      const supabase = await createClient()

      await supabase.from('scans').insert({
        vcard_id: options.vcardId || null,
        menu_id: options.menuId || null,
        loyalty_program_id: options.loyaltyProgramId || null,
        device_id: options.deviceId || null,
        target_user_id: options.targetUserId || null,
        source_type: options.sourceType,
        os,
        country,
        user_agent: userAgent ? `${deviceType} | ${userAgent.substring(0, 150)}` : deviceType,
      })
    } catch (err) {
      console.error('Error silencioso registrando escaneo/visita:', err)
    }
  }

  // Programar en segundo plano con after() para que nunca demore la carga ni se cancele en Vercel
  try {
    after(executeScan)
  } catch {
    // Si after() se llama fuera del scope de un request compatible, ejecutar en background seguro
    void executeScan()
  }
}
