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
 * Registra una visita / escaneo de forma asíncrona sin bloquear la carga de la página
 */
export async function recordPageViewScan(options: LogScanOptions) {
  try {
    const headerList = await headers()
    const userAgent = headerList.get('user-agent') || ''
    const country = headerList.get('x-vercel-ip-country') || 'Desconocido'

    let os = 'Desktop'
    if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod')) {
      os = 'Apple'
    } else if (userAgent.includes('Android')) {
      os = 'Android'
    } else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) {
      os = 'Apple'
    } else if (userAgent.includes('Windows')) {
      os = 'Windows'
    } else if (userAgent.includes('Linux')) {
      os = 'Linux'
    }

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
      user_agent: userAgent.substring(0, 200),
    })
  } catch (err) {
    console.error('Error silencioso registrando escaneo/visita:', err)
  }
}
