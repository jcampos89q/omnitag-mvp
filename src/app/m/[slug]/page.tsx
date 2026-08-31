import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, UserCircle2 } from 'lucide-react'
import PublicMenuClient from './PublicMenuClient'
import { resolveTheme, getGoogleFontUrl, getFontFamilyCss } from '@/lib/themes'
import { recordPageViewScan } from '@/lib/analytics'

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params

  const { data: menu } = await supabase
    .from('menus')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!menu) {
    return {
      title: 'Menú Digital | OmniTag',
    }
  }

  const title = `${menu.name} | Menú Digital & Pedidos`
  const description = menu.description || `Explora el menú digital interactivo y catálogo de ${menu.name}. Haz tus pedidos directo por WhatsApp.`
  const imageUrl = menu.logo_url || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.omnitag.site/m/${slug}`,
      siteName: 'OmniTag Menús',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: menu.name,
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

export default async function PublicMenuPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ mesa?: string; table?: string }>
}) {
  const supabase = await createClient()
  const { slug } = await params
  const { mesa, table } = await searchParams
  const initialTable = mesa || table || ''

  // 1. Buscar el menú de forma segura con maybeSingle
  const { data: menu } = await supabase
    .from('menus')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!menu) {
    notFound()
  }

  // 2. Buscar si el negocio tiene una vCard principal para navegación cruzada
  const { data: ownerVcard } = await supabase
    .from('vcards')
    .select('slug, first_name, company_name')
    .eq('user_id', menu.user_id)
    .eq('is_active', true)
    .maybeSingle()

  // Registrar visita / escaneo del menú digital
  recordPageViewScan({
    menuId: menu.id,
    targetUserId: menu.user_id,
    sourceType: 'menu'
  })

  // 3. Buscar categorías e ítems
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*, menu_items(*)')
    .eq('menu_id', menu.id)
    .order('created_at', { ascending: true })

  const theme = resolveTheme(menu.theme)
  const fontUrl = getGoogleFontUrl(theme.font_family)
  const fontFamilyCss = getFontFamilyCss(theme.font_family)

  return (
    <>
      {/* Pre-conexión DNS y optimización de fuentes Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={fontUrl} />

      <div 
        className="min-h-screen flex flex-col transition-colors duration-300"
        style={{ 
          backgroundColor: theme.bg_color, 
          color: theme.text_color,
          fontFamily: fontFamilyCss
        }}
      >
        {/* Barra superior de regreso al Hub / vCard (si existe) */}
        {ownerVcard && (
          <div className="bg-black/10 backdrop-blur-xs py-2 px-4 text-center border-b border-black/5">
            <Link
              href={`/v/${ownerVcard.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline opacity-80 hover:opacity-100 transition"
              style={{ color: theme.text_color }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Tarjeta & Contacto de {ownerVcard.company_name || ownerVcard.first_name || menu.name}</span>
            </Link>
          </div>
        )}

        {/* Cabecera del Menú */}
        <header 
          className="shadow-sm sticky top-0 z-20 border-b border-black/5 backdrop-blur-md"
          style={{ backgroundColor: `${theme.card_bg}F0` }}
        >
          <div className="max-w-3xl mx-auto px-4 py-5 text-center">
            {menu.logo_url && (
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2.5 rounded-2xl overflow-hidden shadow-md border-2 bg-white flex items-center justify-center p-1"
                style={{ borderColor: theme.primary_color }}
              >
                <img 
                  src={menu.logo_url} 
                  alt={menu.name} 
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover rounded-xl" 
                />
              </div>
            )}
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight" style={{ color: theme.text_color }}>
              {menu.name}
            </h1>
            {menu.description && (
              <p className="mt-1 text-xs sm:text-sm opacity-75 max-w-lg mx-auto" style={{ color: theme.text_color }}>
                {menu.description}
              </p>
            )}
          </div>
        </header>

        {/* Componente interactivo del catálogo, comandas y carrito */}
        <div className="flex-1">
          <PublicMenuClient 
            menu={menu} 
            categories={categories || []} 
            theme={theme} 
            initialTable={initialTable}
          />
        </div>

        <footer className="mt-8 text-center pb-8 border-t border-black/5 pt-8 opacity-60">
          <p className="text-xs font-medium">
            Digitalizado por <span className="font-bold">OmniTag</span>
          </p>
        </footer>
      </div>
    </>
  )
}
