import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

interface LogScanOptions {
  vcardId?: string
  menuId?: string
  loyaltyProgramId?: string
  deviceId?: string
  targetUserId?: string
  sourceType: 'vcard' | 'menu' | 'loyalty' | 'nfc_device' | 'qr'
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
 * Registra una visita / escaneo de forma asíncrona sin bloquear la carga de la página
 */
export async function recordPageViewScan(options: LogScanOptions) {
  try {
    const headerList = await headers()
    const userAgent = headerList.get('user-agent') || ''
    const country = headerList.get('x-vercel-ip-country') || 'Desconocido'

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
      user_agent: `${deviceType} | ${userAgent.substring(0, 150)}`,
    })
  } catch (err) {
    console.error('Error silencioso registrando escaneo/visita:', err)
  }
}
