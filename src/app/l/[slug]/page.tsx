import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import LoyaltyCardClient from './LoyaltyCardClient'
import { resolveTheme, getGoogleFontUrl, getFontFamilyCss } from '@/lib/themes'

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params

  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!program) {
    return {
      title: 'Club de Fidelización | OmniTag',
    }
  }

  const title = `Club de Fidelización & Sellos | ${program.name}`
  const description = `Acumula ${program.total_stamps_required} sellos y gana: ${program.reward_title}. Tarjeta digital interactiva sin descargar apps.`
  const imageUrl = program.logo_url || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.omnitag.site/l/${slug}`,
      siteName: 'OmniTag Loyalty',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: program.name,
        }
      ] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function PublicLoyaltyPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient()
  const { slug } = await params

  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!program) {
    notFound()
  }

  const theme = resolveTheme(program.theme)
  const fontUrl = getGoogleFontUrl(theme.font_family)
  const fontFamilyCss = getFontFamilyCss(theme.font_family)

  return (
    <>
      <link rel="stylesheet" href={fontUrl} />

      <div 
        className="min-h-screen py-8 sm:py-14 px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-center transition-colors duration-300"
        style={{ 
          backgroundColor: theme.bg_color,
          fontFamily: fontFamilyCss,
          color: theme.text_color
        }}
      >
        <LoyaltyCardClient program={program} theme={theme} />

        <footer className="mt-8 text-center pb-4 opacity-60">
          <p className="text-xs font-medium">
            Fidelización digital impulsada por <span className="font-bold">OmniTag</span>
          </p>
        </footer>
      </div>
    </>
  )
}
