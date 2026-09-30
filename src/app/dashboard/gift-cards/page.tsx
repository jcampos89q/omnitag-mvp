import { createClient } from '@/lib/supabase/server'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'
import { getUserPlanInfo } from '@/lib/plans'
import ProFeaturePaywall from '@/components/ProFeaturePaywall'
import GiftCardsManager from './GiftCardsManager'

export default async function GiftCardsPage() {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

  const planInfo = await getUserPlanInfo(supabase, user?.id)
  if (!planInfo.canAccessProSuite) {
    return (
      <ProFeaturePaywall 
        featureName="Tarjetas de Regalo (Gift Cards)"
        featureDescription="Emite certificados y tarjetas de regalo digitales o físicas para inyectar flujo de caja anticipado a tu negocio y captar nuevos clientes referidos. Disponible con el Plan PRO Mensual."
        hardwareType={planInfo.hardwareType}
      />
    )
  }

  // Obtener perfil y moneda del negocio
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, currency, currency_symbol, avatar_url')
    .eq('id', user?.id)
    .maybeSingle()

  // Obtener nombre de vCard como nombre comercial si existe
  const { data: vcard } = await supabase
    .from('vcards')
    .select('company_name, first_name')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const businessName = vcard?.company_name || vcard?.first_name || profile?.full_name || 'Mi Negocio'
  const currencySymbol = profile?.currency_symbol || 'L.'

  // Cargar fuentes de logos existentes del usuario (vCards, Menús, Perfil)
  const [{ data: vcardsList }, { data: menusList }] = await Promise.all([
    supabase
      .from('vcards')
      .select('first_name, company_name, theme, contact_info')
      .eq('user_id', user?.id),
    supabase
      .from('menus')
      .select('name, logo_url')
      .eq('user_id', user?.id)
  ])

  const existingLogos: { label: string; url: string }[] = []
  if (profile?.avatar_url) {
    existingLogos.push({ label: 'Foto de Perfil', url: profile.avatar_url })
  }
  vcardsList?.forEach((v: any) => {
    const vTheme = typeof v.theme === 'object' && v.theme !== null ? v.theme : {}
    const vContact = typeof v.contact_info === 'object' && v.contact_info !== null ? v.contact_info : {}
    const logo = vTheme.logo_url || vContact.logo_url || vTheme.avatar_url
    if (logo && !existingLogos.some(l => l.url === logo)) {
      existingLogos.push({ label: `vCard: ${v.company_name || v.first_name || 'Mi Tarjeta'}`, url: logo })
    }
  })
  menusList?.forEach((m: any) => {
    if (m.logo_url && !existingLogos.some(l => l.url === m.logo_url)) {
      existingLogos.push({ label: `Menú: ${m.name || 'Mi Catálogo'}`, url: m.logo_url })
    }
  })

  // Cargar Gift Cards emitidas
  const { data: cards } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  // Cargar Redenciones recientes
  const { data: redemptions } = await supabase
    .from('gift_card_redemptions')
    .select(`
      id,
      amount,
      previous_balance,
      new_balance,
      notes,
      created_at,
      gift_cards (
        code,
        recipient_name,
        title,
        currency_symbol
      )
    `)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const normalizedRedemptions = (redemptions || []).map((r: any) => ({
    ...r,
    gift_cards: Array.isArray(r.gift_cards) ? r.gift_cards[0] : r.gift_cards
  }))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <GiftCardsManager 
        initialCards={cards || []} 
        initialRedemptions={normalizedRedemptions}
        businessName={businessName}
        currencySymbol={currencySymbol}
        existingLogos={existingLogos}
      />
    </div>
  )
}
