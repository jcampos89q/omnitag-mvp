import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { recordPageViewScan } from '@/lib/analytics'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag_id: string }> }
) {
  const supabase = await createClient()
  const { tag_id } = await params

  // 1. Buscar el dispositivo de forma segura con maybeSingle
  const { data: device } = await supabase
    .from('devices')
    .select('*')
    .eq('tag_id', tag_id)
    .eq('is_active', true)
    .maybeSingle()

  // Si no existe o está inactivo, mostrar error o redirigir a la landing de OmniTag
  if (!device) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. Registrar el escaneo asíncronamente
  recordPageViewScan({
    deviceId: device.id,
    targetUserId: device.user_id,
    sourceType: 'nfc_device'
  })

  // Si tiene el filtro inteligente, lo enviamos primero a la pantalla de estrellitas
  if (device.review_filter_enabled) {
    return NextResponse.redirect(new URL(`/r/${tag_id}/filter`, request.url))
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
