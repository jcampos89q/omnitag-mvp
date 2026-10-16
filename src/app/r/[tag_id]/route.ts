export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { recordScanDirect } from '@/lib/analytics'

function createNoCacheRedirect(url: string | URL): NextResponse {
  const response = NextResponse.redirect(url)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  return response
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag_id: string }> }
) {
  const supabase = await createClient()
  const rawTagId = (await params).tag_id
  const cleanTagId = decodeURIComponent(rawTagId || '').trim()

  // 1. Buscar el dispositivo con relaciones precargadas en una SOLA consulta
  const { data: device } = await supabase
    .from('devices')
    .select('id, user_id, tag_id, device_type, redirect_url, review_filter_enabled, is_active, vcard_id, loyalty_program_id, vcards(slug), loyalty_programs(slug)')
    .or(`tag_id.eq.${cleanTagId},tag_id.eq.${encodeURIComponent(cleanTagId)}`)
    .maybeSingle()

  // Si no existe, no está activo o no tiene enlace de destino configurado, enviarlo a la pantalla de activación
  if (!device || !device.redirect_url || !device.user_id || device.is_active === false) {
    return createNoCacheRedirect(new URL(`/r/${encodeURIComponent(cleanTagId)}/activate`, request.url))
  }

  // 2. Registrar el escaneo de forma garantizada sin almacenamiento en caché CDN
  const userAgent = request.headers.get('user-agent') || ''
  const country = request.headers.get('x-vercel-ip-country') || 'Desconocido'

  // Ejecutamos el registro de escaneo
  await recordScanDirect({
    deviceId: device.id,
    targetUserId: device.user_id,
    sourceType: 'nfc_device',
    userAgent,
    country,
  })

  // Si es tap_to_rate y tiene el filtro inteligente, enviarlo a la pantalla de calificación
  if (device.device_type === 'tap_to_rate' && device.review_filter_enabled) {
    return createNoCacheRedirect(new URL(`/r/${encodeURIComponent(device.tag_id)}/filter`, request.url))
  }

  // 3. Redirección para vCard vinculada
  if (device.device_type === 'vcard') {
    const vcardSlug = (device.vcards as any)?.slug
    if (vcardSlug) {
      return createNoCacheRedirect(new URL(`/v/${vcardSlug}`, request.url))
    }
  }

  // Redirección para programa de fidelización vinculado
  if (device.device_type === 'loyalty') {
    const loyaltySlug = (device.loyalty_programs as any)?.slug
    if (loyaltySlug) {
      return createNoCacheRedirect(new URL(`/l/${loyaltySlug}`, request.url))
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
