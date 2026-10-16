import { getAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'
import { after } from 'next/server'

export interface LogScanOptions {
  vcardId?: string
  menuId?: string
  loyaltyProgramId?: string
  deviceId?: string
  targetUserId?: string
  sourceType: 'vcard' | 'menu' | 'loyalty' | 'nfc_device' | 'qr' | 'wallet_pass'
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
 * Inserta el registro de escaneo directamente de forma robusta
 */
export async function recordScanDirect(options: LogScanOptions): Promise<void> {
  try {
    let userAgent = options.userAgent || ''
    let country = options.country || ''

    if (!userAgent || !country) {
      try {
        const headerList = await headers()
        if (!userAgent) userAgent = headerList.get('user-agent') || ''
        if (!country) country = headerList.get('x-vercel-ip-country') || 'Desconocido'
      } catch {
        // Headers no disponibles en este contexto
      }
    }

    if (!country) country = 'Desconocido'

    const { os, deviceType } = detectDeviceAndOS(userAgent)
    const supabaseAdmin = getAdminClient()

    const { error } = await supabaseAdmin.from('scans').insert({
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

    if (error) {
      console.error('Error insertando escaneo en tabla scans:', error)
    }
  } catch (err) {
    console.error('Error registrando escaneo/visita:', err)
  }
}

/**
 * Registra una visita / escaneo de forma asíncrona y no bloqueante
 * Usa `after()` de Next.js para que el cliente reciba la página o redirección en 0ms
 */
export function recordPageViewScan(options: LogScanOptions): void {
  try {
    after(() => recordScanDirect(options))
  } catch {
    void recordScanDirect(options)
  }
}
