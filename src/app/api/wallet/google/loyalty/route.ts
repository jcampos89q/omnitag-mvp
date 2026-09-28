import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateLoyaltyWalletUrl } from '@/lib/googleWallet'
import { resolveTheme } from '@/lib/themes'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const phone = searchParams.get('phone') || ''
  const name = searchParams.get('name') || ''

  if (!slug) {
    return NextResponse.json(
      { success: false, error: 'Parámetro slug requerido.' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    // 1. Obtener los datos del programa de fidelización
    const { data: program, error } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (error || !program) {
      return NextResponse.json(
        { success: false, error: 'Programa de fidelización no encontrado.' },
        { status: 404 }
      )
    }

    // 2. Obtener sellos actuales del cliente si proporcionó teléfono
    let currentStamps = 0
    let customerName = name

    if (phone) {
      const { data: member } = await supabase
        .from('loyalty_card_members')
        .select('current_stamps, customer_name')
        .eq('program_id', program.id)
        .eq('phone', phone)
        .maybeSingle()

      if (member) {
        currentStamps = member.current_stamps || 0
        if (!customerName && member.customer_name) {
          customerName = member.customer_name
        }
      }
    }

    // Resolver tema y colores de marca del negocio
    const theme = resolveTheme(program.theme_config)
    const publicUrl = `https://www.omnitag.site/l/${slug}`

    const result = generateLoyaltyWalletUrl({
      programId: program.id,
      programSlug: program.slug,
      businessName: program.name,
      rewardTitle: program.reward_title || 'Premio de Fidelización',
      logoUrl: program.logo_url,
      primaryColor: theme.primary_color,
      totalStampsRequired: program.total_stamps_required || 6,
      customerPhone: phone || 'Cliente',
      customerName: customerName || 'Miembro VIP',
      currentStamps,
      publicUrl
    })

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Error en /api/wallet/google/loyalty:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
