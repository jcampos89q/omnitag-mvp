import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateVCardWalletUrl } from '@/lib/googleWallet'
import { resolveTheme } from '@/lib/themes'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json(
      { success: false, error: 'Parámetro slug requerido.' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    // 1. Obtener la vCard desde Supabase
    const { data: vcard, error } = await supabase
      .from('vcards')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (error || !vcard) {
      return NextResponse.json(
        { success: false, error: 'Tarjeta de presentación no encontrada.' },
        { status: 404 }
      )
    }

    const isBusiness = vcard.card_type === 'business'
    const fullName = isBusiness
      ? (vcard.company_name || vcard.first_name || 'Perfil Empresarial')
      : [vcard.first_name, vcard.last_name].filter(Boolean).join(' ') || 'Contacto Profesional'

    const contactInfo = vcard.contact_info || {}
    const businessInfo = vcard.business_info || {}
    const theme = resolveTheme(vcard.theme_config)
    const publicUrl = `https://www.omnitag.site/v/${slug}`

    const result = generateVCardWalletUrl({
      vcardId: vcard.id,
      vcardSlug: vcard.slug,
      fullName,
      jobTitle: vcard.job_title || (isBusiness ? 'Empresa / Negocio' : 'Profesional'),
      companyName: vcard.company_name || 'OmniTag',
      phone: contactInfo.phone || '',
      email: contactInfo.email || '',
      address: businessInfo.address || '',
      avatarUrl: vcard.avatar_url || vcard.cover_url || '',
      primaryColor: theme.primary_color,
      publicUrl
    })

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Error en /api/wallet/google/vcard:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
