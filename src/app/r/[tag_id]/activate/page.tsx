import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ActivatePlateClient from './ActivatePlateClient'
import PendingPlateScreen from './PendingPlateScreen'

export default async function ActivatePlatePage({
  params,
  searchParams
}: {
  params: Promise<{ tag_id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const rawTagId = (await params).tag_id
  const cleanTagId = decodeURIComponent(rawTagId || '').trim()
  const { error } = await searchParams
  const supabase = await createClient()

  const { data: device } = await supabase
    .from('devices')
    .select('id, tag_id, user_id, redirect_url, is_active, device_type, review_filter_enabled, business_name, place_id, business_address, business_phone')
    .or(`tag_id.eq.${cleanTagId},tag_id.eq.${encodeURIComponent(cleanTagId)}`)
    .maybeSingle()

  // Si ya tiene un negocio configurado con redirect_url válido, enviarlo directo a calificar o a su destino (sin rebotar a /r/[tag_id])
  if (device && device.redirect_url && device.user_id && device.is_active) {
    if (device.device_type === 'tap_to_rate' && device.review_filter_enabled) {
      redirect(`/r/${encodeURIComponent(device.tag_id)}/filter`)
    } else {
      redirect(device.redirect_url)
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

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-950 via-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
      <ActivatePlateClient 
        tagId={cleanTagId}
        currentUser={user ? { id: user.id, email: user.email || '' } : null}
        serverError={error}
      />
    </div>
  )
}
