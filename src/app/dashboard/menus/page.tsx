import { createClient } from '@/lib/supabase/server'
import { createMenu, createCategory, createMenuItem, updateMenu, deleteMenuItem, deleteCategory } from './actions'
import { Coffee, Plus, Image as ImageIcon, Flame, Leaf, WheatOff, Save, Trash2, Palette } from 'lucide-react'
import ImageUploadInput from '@/components/ImageUploadInput'
import ThemeSelector from '@/components/ThemeSelector'

export default async function MenusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar menú del usuario de forma segura con maybeSingle
  const { data: menu } = await supabase
    .from('menus')
    .select('*')
    .eq('user_id', user?.id)
    .maybeSingle()

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
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Gestor de Menú Digital y Catálogo</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Personaliza tu catálogo interactivo, añade fotos, precios y elige tu paleta de colores y tipografía.
            </p>
          </div>
          {menu && (
            <a 
              href={`/m/${menu.slug}`} 
              target="_blank" 
              className="bg-black text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-800 transition whitespace-nowrap shadow-xs"
            >
              Ver Menú Público &rarr;
            </a>
          )}
        </div>

        {!menu ? (
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center py-12">
            <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Aún no tienes un menú</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Crea tu primer menú para empezar a añadir categorías, platillos y personalizar tu diseño.</p>
            
            <form action={createMenu} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input 
                type="text" 
                name="name" 
                placeholder="Nombre del Restaurante / Menú" 
                required 
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
              />
              <button 
                type="submit" 
                className="w-full sm:w-auto bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition whitespace-nowrap cursor-pointer"
              >
                Crear Menú
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Configuración del Menú (Logo, Nombre, WhatsApp y Temas) */}
            <div className="bg-gray-50/80 p-5 sm:p-6 rounded-2xl border border-gray-200 space-y-6">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">1. Información del Menú y Logotipo</h3>
              <form action={updateMenu} className="space-y-6">
                <input type="hidden" name="menu_id" value={menu.id} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nombre del Menú / Local *</label>
                    <input 
                      type="text" 
                      name="name" 
                      id="name" 
                      defaultValue={menu.name || ''} 
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label htmlFor="whatsapp_number" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">WhatsApp para Pedidos</label>
                    <input 
                      type="tel" 
                      name="whatsapp_number" 
                      id="whatsapp_number" 
                      defaultValue={menu.whatsapp_number || ''} 
                      placeholder="+504 9988-6256"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Descripción / Slogan</label>
                  <input 
                    type="text" 
                    name="description" 
                    id="description" 
                    defaultValue={menu.description || ''} 
                    placeholder="Ej. Auténtica comida artesanal, café de especialidad y postres"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                  />
                </div>

                {/* Subida de Logotipo */}
                <div>
                  <ImageUploadInput
                    name="logo"
                    label="Logotipo del Negocio / Menú"
                    defaultValue={menu.logo_url}
                    shape="circle"
                    helpText="Sube el logo de tu local o restaurante (JPG, PNG, WEBP, SVG)."
                  />
                </div>

                {/* Personalización de Tema, Tipografía y Colores para el Menú */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-600" />
                    Tema Visual y Tipografía del Menú
                  </h4>
                  <ThemeSelector initialTheme={menu.theme} fieldNamePrefix="theme" />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center gap-2 text-sm cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4" /> Guardar Ajustes y Tema del Menú
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Formulario de nueva categoría */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
              <span className="font-bold text-gray-800 text-sm whitespace-nowrap">Añadir Categoría:</span>
              <form action={createCategory} className="flex flex-1 w-full gap-2">
                <input type="hidden" name="menu_id" value={menu.id} />
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Ej. Entradas, Platos Fuertes, Postres, Bebidas..." 
                  required 
                  className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-black focus:outline-none" 
                />
                <button 
                  type="submit" 
                  className="bg-black text-white px-5 py-2 rounded-xl text-sm hover:bg-gray-800 flex items-center gap-1.5 font-bold cursor-pointer transition whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> Añadir
                </button>
              </form>
            </div>

            {/* 3. Listado de Categorías e Ítems */}
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="bg-gray-50/80 px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900">{category.name}</h3>
                    <form action={deleteCategory}>
                      <input type="hidden" name="category_id" value={category.id} />
                      <button 
                        type="submit" 
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold transition cursor-pointer"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar categoría
                      </button>
                    </form>
                  </div>
                  
                  <div className="p-5 bg-white">
                    {/* Grid de platillos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                      {category.menu_items?.map((item: any) => (
                        <div key={item.id} className="flex gap-4 p-3.5 border border-gray-100 rounded-xl hover:border-gray-200 transition relative group bg-gray-50/30">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative border border-gray-200 shadow-xs">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-gray-900 text-sm truncate pr-2">{item.name}</h4>
                              <span className="font-extrabold text-gray-900 text-sm">${item.price}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              {item.is_featured && <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded uppercase border border-yellow-200">⭐ Destacado</span>}
                              {item.allergens?.includes('vegan') && <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded uppercase"><Leaf className="w-3 h-3"/> Vegano</span>}
                              {item.allergens?.includes('spicy') && <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded uppercase"><Flame className="w-3 h-3"/> Picante</span>}
                              {item.allergens?.includes('gluten_free') && <span className="flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded uppercase"><WheatOff className="w-3 h-3"/> Sin Gluten</span>}
                            </div>
                          </div>

                          <form action={deleteMenuItem} className="opacity-0 group-hover:opacity-100 transition absolute top-2 right-2">
                            <input type="hidden" name="item_id" value={item.id} />
                            <button 
                              type="submit" 
                              className="p-1.5 text-red-500 hover:text-red-700 bg-white rounded-lg shadow-xs border border-gray-200 cursor-pointer"
                              title="Eliminar platillo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>

                    {/* Formulario de nuevo ítem con subida de imagen */}
                    <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/70 p-4 rounded-xl">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-emerald-600" /> Añadir nuevo platillo a "{category.name}"
                      </p>
                      <form action={createMenuItem} className="space-y-4">
                        <input type="hidden" name="category_id" value={category.id} />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Plato *</label>
                            <input 
                              type="text" 
                              name="name" 
                              placeholder="Ej. Tacos al Pastor, Hamburguesa Especial..." 
                              required 
                              className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm bg-white focus:border-black focus:outline-none" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Precio *</label>
                            <input 
                              type="number" 
                              step="0.01" 
                              name="price" 
                              placeholder="12.50" 
                              required 
                              className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm bg-white focus:border-black focus:outline-none" 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                          <input 
                            type="text" 
                            name="description" 
                            placeholder="Ingredientes, preparación o detalles del plato..." 
                            className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm bg-white focus:border-black focus:outline-none" 
                          />
                        </div>

                        {/* Subida de Imagen del Platillo */}
                        <div>
                          <ImageUploadInput
                            name="image"
                            label="Foto del Platillo (Recomendado)"
                            shape="square"
                            helpText="Selecciona una fotografía del plato para atraer más clientes."
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700">
                            <label className="flex items-center gap-1.5 cursor-pointer bg-yellow-50 px-2 py-1 rounded border border-yellow-200 text-yellow-800 font-bold">
                              <input type="checkbox" name="is_featured" className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500" /> 
                              ⭐ Destacar
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" name="allergen_vegan" className="rounded border-gray-300 text-black focus:ring-black" /> 
                              <Leaf className="w-3.5 h-3.5 text-green-600"/> Vegano
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" name="allergen_spicy" className="rounded border-gray-300 text-black focus:ring-black" /> 
                              <Flame className="w-3.5 h-3.5 text-red-500"/> Picante
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" name="allergen_gluten_free" className="rounded border-gray-300 text-black focus:ring-black" /> 
                              <WheatOff className="w-3.5 h-3.5 text-orange-500"/> Sin Gluten
                            </label>
                          </div>
                          
                          <button 
                            type="submit" 
                            className="w-full sm:w-auto bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 whitespace-nowrap transition cursor-pointer"
                          >
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
