import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicMenuClient from './PublicMenuClient'

export default async function PublicMenuPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient()
  const { slug } = await params

  // 1. Buscar el menú de forma segura
  const { data: menu } = await supabase
    .from('menus')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!menu) {
    notFound()
  }

  // 2. Buscar categorías e ítems
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*, menu_items(*)')
    .eq('menu_id', menu.id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Cabecera del Menú */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          {menu.logo_url && (
            <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden shadow-md border-2 border-gray-100 bg-white flex items-center justify-center">
              <img src={menu.logo_url} alt={menu.name} className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {menu.name}
          </h1>
          {menu.description && (
            <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto">{menu.description}</p>
          )}
        </div>
      </header>

      {/* Componente interactivo del carrito y catálogo */}
      <div className="flex-1">
        <PublicMenuClient menu={menu} categories={categories || []} />
      </div>

      <footer className="mt-8 text-center pb-8 border-t border-gray-200 pt-8">
        <p className="text-xs text-gray-400 font-medium">
          Digitalizado por <span className="text-gray-800 font-bold">OmniTag</span>
        </p>
      </footer>
    </div>
  )
}
