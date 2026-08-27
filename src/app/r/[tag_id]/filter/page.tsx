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
  const { tag_id } = await params

  const { data: device } = await supabase
    .from('devices')
    .select('id, redirect_url, review_filter_enabled, theme')
    .eq('tag_id', tag_id)
    .maybeSingle()

  if (!device || !device.review_filter_enabled) {
    notFound()
  }

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
        />
      </div>
    </>
  )
}
