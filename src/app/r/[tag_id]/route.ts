import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { recordPageViewScan } from '@/lib/analytics'

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
    return NextResponse.redirect(new URL(`/r/${encodeURIComponent(cleanTagId)}/activate`, request.url))
  }

  // 2. Registrar el escaneo asíncronamente
  recordPageViewScan({
    deviceId: device.id,
    targetUserId: device.user_id,
    sourceType: 'nfc_device'
  })

  // Si es tap_to_rate y tiene el filtro inteligente, lo enviamos primero a la pantalla de estrellitas
  if (device.device_type === 'tap_to_rate' && device.review_filter_enabled) {
    return NextResponse.redirect(new URL(`/r/${encodeURIComponent(device.tag_id)}/filter`, request.url))
  }

  // 3. Redirección en milisegundos
  if (device.device_type === 'vcard' && device.vcard_id) {
    const { data: vcard } = await supabase
      .from('vcards')
      .select('slug')
      .eq('id', device.vcard_id)
      .maybeSingle()
      
    if (vcard) {
      return NextResponse.redirect(new URL(`/v/${vcard.slug}`, request.url))
    }
  }

  if (device.device_type === 'loyalty' && device.loyalty_program_id) {
    const { data: program } = await supabase
      .from('loyalty_programs')
      .select('slug')
      .eq('id', device.loyalty_program_id)
      .maybeSingle()
      
    if (program) {
      return NextResponse.redirect(new URL(`/l/${program.slug}`, request.url))
    }
  }

  // Comportamiento por defecto (Tap-to-Rate o Enlace Genérico)
  if (device.redirect_url) {
    return NextResponse.redirect(device.redirect_url)
  }

  return NextResponse.redirect(new URL('/', request.url))
}
