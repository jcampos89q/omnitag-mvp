import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateLoyaltyWalletUrl } from '@/lib/googleWallet'
import { resolveTheme } from '@/lib/themes'
import { sendPushNotificationToUser } from '@/lib/push'

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
    const theme = resolveTheme(program.theme || program.theme_config)
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
      publicUrl,
      latitude: program.latitude ? Number(program.latitude) : undefined,
      longitude: program.longitude ? Number(program.longitude) : undefined
    })

    // 3. Si se generó el enlace con éxito, notificar al dueño del negocio
    if (result.success && program.user_id) {
      try {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
        const { data: recentNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', program.user_id)
          .ilike('title', '%Fidelidad en Billetera%')
          .gt('created_at', twoMinutesAgo)
          .limit(1)

        if (!recentNotif || recentNotif.length === 0) {
          const clientIdentifier = customerName && customerName !== 'Miembro VIP' ? customerName : phone ? `Cliente (${phone})` : 'Un cliente'

          // A. Notificación en el Panel de OmniTag (Campanita)
          await supabase.from('notifications').insert({
            user_id: program.user_id,
            title: '⭐ ¡Tarjeta de Fidelidad en Billetera!',
            message: `${clientIdentifier} acaba de guardar la tarjeta de sellos de "${program.name}" en su Google Wallet.`,
            type: 'success',
            link: '/dashboard/loyalty'
          })

          // B. Notificación Push nativa al celular del dueño
          await sendPushNotificationToUser(program.user_id, {
            title: '⭐ ¡Tarjeta de Fidelidad en Billetera!',
            body: `${clientIdentifier} ha añadido tu tarjeta de sellos a su Google Wallet.`,
            url: '/dashboard/loyalty'
          })
        }
      } catch (notifErr) {
        console.error('Error enviando notificación de loyalty wallet a dueño:', notifErr)
      }
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Error en /api/wallet/google/loyalty:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
