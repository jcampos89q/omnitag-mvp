import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FilterClient from './FilterClient'

export default async function ReviewFilterPage({
  params
}: {
  params: Promise<{ tag_id: string }>
}) {
  const supabase = await createClient()
  const { tag_id } = await params

  const { data: device } = await supabase
    .from('devices')
    .select('id, redirect_url, review_filter_enabled')
    .eq('tag_id', tag_id)
    .single()

  if (!device || !device.review_filter_enabled) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <FilterClient deviceId={device.id} redirectUrl={device.redirect_url} />
    </div>
  )
}
