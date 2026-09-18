export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { recordPageViewScan } from '@/lib/analytics'

/**
 * Genera una redirección instantánea asegurando cabeceras anti-caché
 * para que cada toque NFC o escaneo QR se registre como nueva visita.
 */
function createNoCacheRedirect(url: string | URL): NextResponse {
  const response = NextResponse.redirect(url)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  return response
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag_id: string }> }
) {
  const supabase = await createClient()
  const rawTagId = (await params).tag_id
  const cleanTagId = decodeURIComponent(rawTagId || '').trim()

  // 1. Buscar el dispositivo de forma segura soportando formato normal o URL-encoded
  const { data: device } = await supabase
    .from('devices')
    .select('*')
    .or(`tag_id.eq.${cleanTagId},tag_id.eq.${encodeURIComponent(cleanTagId)}`)
    .maybeSingle()

  // Si no existe o no tiene enlace de destino configurado, enviarlo a la pantalla de activación
  if (!device || !device.redirect_url || !device.user_id) {
    return createNoCacheRedirect(new URL(`/r/${encodeURIComponent(cleanTagId)}/activate`, request.url))
  }

  // 2. Registrar el escaneo en segundo plano con los headers reales del dispositivo móvil
  const userAgent = request.headers.get('user-agent') || ''
  const country = request.headers.get('x-vercel-ip-country') || 'Desconocido'

  recordPageViewScan({
    deviceId: device.id,
    targetUserId: device.user_id,
    sourceType: 'nfc_device',
    userAgent,
    country,
  })

  // Si es tap_to_rate y tiene el filtro inteligente, enviarlo a la pantalla de estrellitas
  if (device.device_type === 'tap_to_rate' && device.review_filter_enabled) {
    return createNoCacheRedirect(new URL(`/r/${encodeURIComponent(device.tag_id)}/filter`, request.url))
  }

  // 3. Redirección para vCard vinculada
  if (device.device_type === 'vcard' && device.vcard_id) {
    const { data: vcard } = await supabase
      .from('vcards')
      .select('slug')
      .eq('id', device.vcard_id)
      .maybeSingle()
      
    if (vcard) {
      return createNoCacheRedirect(new URL(`/v/${vcard.slug}`, request.url))
    }
  }

  // Redirección para programa de fidelización vinculado
  if (device.device_type === 'loyalty' && device.loyalty_program_id) {
    const { data: program } = await supabase
      .from('loyalty_programs')
      .select('slug')
      .eq('id', device.loyalty_program_id)
      .maybeSingle()
      
    if (program) {
      return createNoCacheRedirect(new URL(`/l/${program.slug}`, request.url))
    }
  }

  // Comportamiento por defecto (Tap-to-Rate directo a Google Reviews o Enlace Genérico)
  if (device.redirect_url) {
    const safeUrl = device.redirect_url.startsWith('http://') || device.redirect_url.startsWith('https://')
      ? device.redirect_url
      : `https://${device.redirect_url}`
    return createNoCacheRedirect(safeUrl)
  }

  return createNoCacheRedirect(new URL('/', request.url))
}
