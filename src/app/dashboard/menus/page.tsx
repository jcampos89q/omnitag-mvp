import { createClient } from '@/lib/supabase/server'
import { createMenu, createCategory, createMenuItem, updateMenu } from './actions'
import { Coffee, Plus, Image as ImageIcon, Flame, Leaf, WheatOff, Save } from 'lucide-react'

export default async function MenusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar menú del usuario (asumimos 1 por ahora para el MVP)
  const { data: menu } = await supabase
    .from('menus')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  // Si tiene menú, buscar categorías con sus ítems
  let categories = []
  if (menu) {
    const { data: cats } = await supabase
      .from('menu_categories')
      .select('*, menu_items(*)')
      .eq('menu_id', menu.id)
      .order('created_at', { ascending: true })
    categories = cats || []
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestor de Menú Digital</h1>
            <p className="text-gray-500 mt-1">Crea tu catálogo interactivo y actualízalo en tiempo real.</p>
          </div>
          {menu && (
            <a href={`/m/${menu.slug}`} target="_blank" className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md font-medium text-sm border border-blue-100 hover:bg-blue-100 transition whitespace-nowrap">
              Ver Menú Público
            </a>
          )}
        </div>

        {!menu ? (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-center py-12">
            <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no tienes un menú</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">Crea tu primer menú para empezar a añadir categorías y platillos.</p>
            
            <form action={createMenu} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input type="text" name="name" placeholder="Nombre (ej. Mi Restaurante)" required className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none" />
              <button type="submit" className="w-full sm:w-auto bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition whitespace-nowrap">
                Crear Menú
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Configuración del Menú (WhatsApp) */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Configuración de Pedidos (WhatsApp)</h3>
              <form action={updateMenu} className="flex flex-col sm:flex-row items-end gap-3 max-w-lg">
                <input type="hidden" name="menu_id" value={menu.id} />
                <div className="w-full">
                  <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700 mb-1">Número de WhatsApp del Local</label>
                  <input 
                    type="tel" name="whatsapp_number" id="whatsapp_number" 
                    defaultValue={menu.whatsapp_number || ''} placeholder="Ej. +34600000000"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none text-sm" 
                  />
                </div>
                <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition flex items-center gap-2 h-[38px]">
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">Si configuras un número, los clientes verán un carrito para enviarte sus pedidos por WhatsApp.</p>
            </div>

            {/* Formulario de nueva categoría */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
              <span className="font-medium text-gray-700 whitespace-nowrap">Añadir Categoría:</span>
              <form action={createCategory} className="flex flex-1 w-full gap-2">
                <input type="hidden" name="menu_id" value={menu.id} />
                <input type="text" name="name" placeholder="Ej. Entradas, Postres, Bebidas..." required className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
                <button type="submit" className="bg-black text-white px-4 py-1.5 rounded-md text-sm hover:bg-gray-800 flex items-center gap-1 font-medium">
                  <Plus className="w-4 h-4" /> Añadir
                </button>
              </form>
            </div>

            {/* Listado de Categorías e Ítems */}
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                  </div>
                  
                  <div className="p-5 bg-white">
                    {/* Grid de platillos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                      {category.menu_items?.map((item: any) => (
                        <div key={item.id} className="flex gap-4 p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition">
                          <div className="w-24 h-24 bg-gray-50 rounded-md flex items-center justify-center shrink-0 overflow-hidden relative border border-gray-200">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-gray-900 truncate pr-2">{item.name}</h4>
                              <span className="font-bold text-blue-600">${item.price}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {item.is_featured && <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded-sm uppercase border border-yellow-200">⭐ Destacado</span>}
                              {item.allergens?.includes('vegan') && <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-sm uppercase"><Leaf className="w-3 h-3"/> Vegano</span>}
                              {item.allergens?.includes('spicy') && <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-sm uppercase"><Flame className="w-3 h-3"/> Picante</span>}
                              {item.allergens?.includes('gluten_free') && <span className="flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded-sm uppercase"><WheatOff className="w-3 h-3"/> Sin Gluten</span>}
                              
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm ${item.is_available ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'}`}>
                                {item.is_available ? 'Disponible' : 'Agotado'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Formulario de nuevo ítem */}
                    <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Añadir nuevo platillo a "{category.name}"</p>
                      <form action={createMenuItem} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="hidden" name="category_id" value={category.id} />
                        <div>
                          <input type="text" name="name" placeholder="Nombre del plato *" required className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
                        </div>
                        <div>
                          <input type="number" step="0.01" name="price" placeholder="Precio * (ej. 12.50)" required className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                          <input type="text" name="description" placeholder="Descripción breve..." className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                          <input type="url" name="image_url" placeholder="URL de la imagen (Opcional)" className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
                        </div>
                        <div className="sm:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <label className="flex items-center gap-1.5 cursor-pointer bg-yellow-50 px-2 py-1 rounded border border-yellow-200 text-yellow-800">
                              <input type="checkbox" name="is_featured" className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500" /> 
                              ⭐ Destacar
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" name="allergen_vegan" className="rounded border-gray-300 text-black focus:ring-black" /> 
                              <Leaf className="w-4 h-4 text-green-600"/> Vegano
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" name="allergen_spicy" className="rounded border-gray-300 text-black focus:ring-black" /> 
                              <Flame className="w-4 h-4 text-red-500"/> Picante
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" name="allergen_gluten_free" className="rounded border-gray-300 text-black focus:ring-black" /> 
                              <WheatOff className="w-4 h-4 text-orange-500"/> Sin Gluten
                            </label>
                          </div>
                          <button type="submit" className="w-full sm:w-auto bg-black text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-800 whitespace-nowrap">
                            Guardar Platillo
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
