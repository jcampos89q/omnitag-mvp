export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'
import { getUserPlanInfo } from '@/lib/plans'
import GoogleBusinessManager from './GoogleBusinessManager'

export default async function GoogleBusinessPage() {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    redirect('/login')
  }

  const [planInfo, { data: profile }, { data: devices }, { data: vcard }] = await Promise.all([
    getUserPlanInfo(supabase, user.id),
    supabase.from('users').select('full_name, currency, currency_symbol').eq('id', user.id).maybeSingle(),
    supabase.from('devices').select('id, name, device_type, redirect_url, google_place_id, business_name').eq('user_id', user.id),
    supabase.from('vcards').select('company_name, first_name, slug, phone, website').eq('user_id', user.id).limit(1).maybeSingle()
  ])

  // Detectar si el usuario ya tiene un Place ID configurado en alguna de sus placas
  const deviceWithPlace = devices?.find(d => d.google_place_id || (d.redirect_url && d.redirect_url.includes('placeid=')))
  let preloadedPlaceId: string | null = null

  if (deviceWithPlace?.google_place_id) {
    preloadedPlaceId = deviceWithPlace.google_place_id
  } else if (deviceWithPlace?.redirect_url && deviceWithPlace.redirect_url.includes('placeid=')) {
    const match = deviceWithPlace.redirect_url.match(/placeid=([^&]+)/)
    if (match) preloadedPlaceId = match[1]
  }

  const defaultBusinessName = vcard?.company_name || vcard?.first_name || profile?.full_name || 'Mi Negocio'

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <GoogleBusinessManager
        isPro={planInfo.isPro}
        businessName={defaultBusinessName}
        preloadedPlaceId={preloadedPlaceId}
        userDevices={devices || []}
      />
    </div>
  )
}
