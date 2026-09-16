import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ActivatePlateClient from './ActivatePlateClient'

export default async function ActivatePlatePage({
  params,
  searchParams
}: {
  params: Promise<{ tag_id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { tag_id } = await params
  const { error } = await searchParams
  const supabase = await createClient()

  const { data: device } = await supabase
    .from('devices')
    .select('id, user_id, redirect_url, is_active')
    .eq('tag_id', tag_id)
    .maybeSingle()

  // Si ya tiene un negocio configurado con redirect_url válido, redirigir al flujo normal
  if (device && device.redirect_url && device.user_id) {
    redirect(`/r/${tag_id}`)
  }

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-950 via-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
      <ActivatePlateClient 
        tagId={tag_id}
        currentUser={user ? { id: user.id, email: user.email || '' } : null}
        serverError={error}
      />
    </div>
  )
}
