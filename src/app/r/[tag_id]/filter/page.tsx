import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FilterClient from './FilterClient'
import { resolveTheme, getGoogleFontUrl, getFontFamilyCss } from '@/lib/themes'

export default async function ReviewFilterPage({
  params
}: {
  params: Promise<{ tag_id: string }>
}) {
  const supabase = await createClient()
  const rawTagId = (await params).tag_id
  const cleanTagId = decodeURIComponent(rawTagId || '').trim()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: device } = await supabase
    .from('devices')
    .select('id, user_id, redirect_url, review_filter_enabled, theme, business_name')
    .or(`tag_id.eq.${cleanTagId},tag_id.eq.${encodeURIComponent(cleanTagId)}`)
    .maybeSingle()

  if (!device || !device.review_filter_enabled) {
    notFound()
  }

  const isOwner = Boolean(user && user.id === device.user_id)
  const theme = resolveTheme(device.theme)
  const fontUrl = getGoogleFontUrl(theme.font_family)
  const fontFamilyCss = getFontFamilyCss(theme.font_family)

  return (
    <>
      <link rel="stylesheet" href={fontUrl} />

      <div 
        className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
        style={{ 
          backgroundColor: theme.bg_color,
          fontFamily: fontFamilyCss 
        }}
      >
        <FilterClient 
          deviceId={device.id} 
          redirectUrl={device.redirect_url} 
          theme={theme}
          businessName={device.business_name}
          isOwner={isOwner}
        />
      </div>
    </>
  )
}
