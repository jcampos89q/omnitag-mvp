export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'
import { getUserPlanInfo } from '@/lib/plans'
import GoogleBusinessManager from './GoogleBusinessManager'

import { Suspense } from 'react'

export default async function GoogleBusinessPage() {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    redirect('/login')
  }

  const [planInfo, { data: profile }, { data: devices }, { data: vcard }, { data: menus }, { data: googleConnection }] = await Promise.all([
    getUserPlanInfo(supabase, user.id),
    supabase.from('users').select('full_name, currency, currency_symbol').eq('id', user.id).maybeSingle(),
    supabase.from('devices').select('id, device_type, redirect_url, place_id, business_name, tag_id, review_filter_enabled').eq('user_id', user.id),
    supabase.from('vcards').select('id, company_name, first_name, slug, phone, website, business_address, business_hours, bio, avatar_url, cover_url').eq('user_id', user.id).limit(1).maybeSingle(),
    supabase.from('menus').select('id, name, slug').eq('user_id', user.id).limit(5),
    supabase.from('google_business_connections').select('id, email, business_name, account_id, location_id, scope, status, created_at').eq('user_id', user.id).maybeSingle()
  ])

  // Obtener dispositivos y sus quejas privadas capturadas por el Escudo Anti-Quejas
  const userDevices = devices || []
  const deviceIds = userDevices.map(d => d.id)

  let privateFeedbacks: any[] = []
  if (deviceIds.length > 0) {
    const { data: feedbacks } = await supabase
      .from('private_feedbacks')
      .select('id, device_id, rating, message, customer_name, customer_phone, customer_email, status, resolution_notes, created_at, devices(tag_id, business_name)')
      .in('device_id', deviceIds)
      .order('created_at', { ascending: false })

    privateFeedbacks = feedbacks || []
  }

  // Detectar si el usuario ya tiene un Place ID configurado en alguna de sus placas
  const deviceWithPlace = userDevices.find(d => d.place_id || (d.redirect_url && d.redirect_url.includes('placeid=')))
  let preloadedPlaceId: string | null = null

  if (deviceWithPlace?.place_id) {
    preloadedPlaceId = deviceWithPlace.place_id
  } else if (deviceWithPlace?.redirect_url && deviceWithPlace.redirect_url.includes('placeid=')) {
    const match = deviceWithPlace.redirect_url.match(/placeid=([^&]+)/)
    if (match) preloadedPlaceId = match[1]
  }

  const defaultBusinessName = vcard?.company_name || vcard?.first_name || profile?.full_name || 'Mi Negocio'

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Suspense fallback={<div className="p-8 text-center text-gray-400 font-bold">Cargando Centro de Control...</div>}>
        <GoogleBusinessManager
          isPro={planInfo.isPro}
          businessName={defaultBusinessName}
          preloadedPlaceId={preloadedPlaceId}
          userDevices={userDevices}
          initialFeedbacks={privateFeedbacks}
          vcardProfile={vcard || null}
          userMenus={menus || []}
          initialGoogleConnection={googleConnection || null}
        />
      </Suspense>
    </div>
  )
}
