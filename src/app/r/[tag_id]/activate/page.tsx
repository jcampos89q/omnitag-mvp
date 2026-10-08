import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ActivatePlateClient from './ActivatePlateClient'
import PendingPlateScreen from './PendingPlateScreen'

export default async function ActivatePlatePage({
  params,
  searchParams
}: {
  params: Promise<{ tag_id: string }>
  searchParams: Promise<{ error?: string; email?: string; auth_mode?: string; edit?: string }>
}) {
  const rawTagId = (await params).tag_id
  const cleanTagId = decodeURIComponent(rawTagId || '').trim()
  const { error, email, auth_mode, edit } = await searchParams
  const supabase = await createClient()

  const { data: device } = await supabase
    .from('devices')
    .select('id, tag_id, user_id, redirect_url, is_active, device_type, review_filter_enabled, business_name, place_id, business_address, business_phone')
    .or(`tag_id.eq.${cleanTagId},tag_id.eq.${encodeURIComponent(cleanTagId)}`)
    .maybeSingle()

  const { data: { user } } = await supabase.auth.getUser()

  // Si ya tiene un negocio configurado con redirect_url válido, enviarlo directo a calificar o a su destino (a menos que el dueño esté editando)
  if (device && device.redirect_url && device.user_id && device.is_active) {
    const isOwnerEditing = edit === 'true' && user && user.id === device.user_id
    if (!isOwnerEditing) {
      if (device.device_type === 'tap_to_rate' && device.review_filter_enabled) {
        redirect(`/r/${encodeURIComponent(device.tag_id)}/filter`)
      } else {
        redirect(device.redirect_url)
      }
    }
  }

  // Si la placa ya fue registrada por un usuario pero está en espera de aprobación de Google
  if (device && device.user_id && (!device.place_id || !device.redirect_url || device.is_active === false)) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-950 via-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
        <PendingPlateScreen
          tagId={cleanTagId}
          businessName={device.business_name || 'Tu Negocio'}
          businessAddress={device.business_address}
          businessPhone={device.business_phone}
        />
      </div>
    )
  }

  // Obtener negocios ya registrados en la cuenta del usuario para vinculación en 1 clic
  let existingBusinesses: {
    id: string
    businessName: string
    placeId: string | null
    directReviewUrl: string | null
    businessAddress: string | null
    businessPhone: string | null
    googleTypes: string[]
    reviewFilterEnabled: boolean
  }[] = []

  let userProfile: {
    fullName: string | null
    personalPhone: string | null
  } | null = null

  if (user) {
    const [{ data: userDevices }, { data: profile }] = await Promise.all([
      supabase
        .from('devices')
        .select('id, business_name, place_id, redirect_url, business_address, business_phone, google_types, review_filter_enabled')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('users')
        .select('full_name, personal_phone')
        .eq('id', user.id)
        .maybeSingle()
    ])

    if (profile) {
      userProfile = {
        fullName: profile.full_name || null,
        personalPhone: profile.personal_phone || null
      }
    }

    if (userDevices && userDevices.length > 0) {
      const seen = new Set<string>()
      for (const d of userDevices) {
        if (!d.business_name && !d.place_id && !d.redirect_url) continue
        const key = `${d.place_id || ''}-${d.business_name || ''}-${d.redirect_url || ''}`
        if (!seen.has(key)) {
          seen.add(key)
          existingBusinesses.push({
            id: d.id,
            businessName: d.business_name || 'Mi Negocio',
            placeId: d.place_id,
            directReviewUrl: d.redirect_url,
            businessAddress: d.business_address,
            businessPhone: d.business_phone,
            googleTypes: Array.isArray(d.google_types) ? d.google_types : [],
            reviewFilterEnabled: d.review_filter_enabled ?? true
          })
        }
      }
    }

    // Si aún no tiene dispositivos pero tiene vCard con nombre comercial
    if (existingBusinesses.length === 0) {
      const { data: vcard } = await supabase
        .from('vcards')
        .select('id, company_name, first_name, phone, business_address')
        .eq('user_id', user.id)
        .maybeSingle()
      if (vcard && (vcard.company_name || vcard.first_name)) {
        existingBusinesses.push({
          id: vcard.id,
          businessName: vcard.company_name || vcard.first_name,
          placeId: null,
          directReviewUrl: null,
          businessAddress: vcard.business_address,
          businessPhone: vcard.phone,
          googleTypes: ['Comercio'],
          reviewFilterEnabled: true
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-950 via-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
      <ActivatePlateClient 
        tagId={cleanTagId}
        currentUser={user ? { id: user.id, email: user.email || '' } : null}
        existingBusinesses={existingBusinesses}
        userProfile={userProfile}
        serverError={error}
        initialEmail={email}
        initialAuthMode={auth_mode}
      />
    </div>
  )
}
