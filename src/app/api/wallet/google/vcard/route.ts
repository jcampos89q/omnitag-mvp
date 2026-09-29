import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateVCardWalletUrl } from '@/lib/googleWallet'
import { resolveTheme } from '@/lib/themes'
import { sendPushNotificationToUser } from '@/lib/push'
import { detectDeviceAndOS } from '@/lib/analytics'

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
    const theme = resolveTheme(vcard.theme || vcard.theme_config)
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
      avatarUrl: vcard.avatar_url || '',
      coverUrl: vcard.cover_url || '',
      bio: vcard.bio || '',
      primaryColor: theme.primary_color,
      publicUrl
    })

    // 2. Si se generó el enlace con éxito, registrar en analítica y notificar al dueño
    if (result.success && vcard.user_id) {
      try {
        const userAgent = req.headers.get('user-agent') || ''
        const country = req.headers.get('x-vercel-ip-country') || 'Desconocido'
        const { os, deviceType } = detectDeviceAndOS(userAgent)

        await supabase.from('scans').insert({
          vcard_id: vcard.id,
          target_user_id: vcard.user_id,
          source_type: 'wallet_pass',
          os,
          country,
          user_agent: userAgent ? `Google Wallet | ${deviceType}` : 'Google Wallet'
        })
      } catch (scanErr) {
        console.error('Error registrando scan de wallet vcard:', scanErr)
      }
      try {
        // Antispam / Cooldown de 2 minutos para no saturar si el usuario recarga la página
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
        const { data: recentNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', vcard.user_id)
          .ilike('title', '%Google Wallet%')
          .gt('created_at', twoMinutesAgo)
          .limit(1)

        if (!recentNotif || recentNotif.length === 0) {
          const cardName = vcard.first_name || vcard.company_name || 'tu tarjeta digital'

          // A. Notificación en el Panel de OmniTag (Campanita)
          await supabase.from('notifications').insert({
            user_id: vcard.user_id,
            title: '📱 ¡Tarjeta Añadida a Google Wallet!',
            message: `Un nuevo cliente acaba de guardar tu tarjeta "${cardName}" en su billetera móvil de Google Wallet.`,
            type: 'success',
            link: '/dashboard/vcard'
          })

          // B. Notificación Push nativa al celular del dueño
          await sendPushNotificationToUser(vcard.user_id, {
            title: '📱 ¡Tarjeta Guardada en Google Wallet!',
            body: `Un cliente acaba de añadir tu tarjeta "${cardName}" a su billetera móvil.`,
            url: '/dashboard/vcard'
          })
        }
      } catch (notifErr) {
        console.error('Error enviando notificación de wallet a dueño:', notifErr)
      }
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Error en /api/wallet/google/vcard:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
