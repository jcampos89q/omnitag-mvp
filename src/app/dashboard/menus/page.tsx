import { createClient } from '@/lib/supabase/server'
import { createMenu } from './actions'
import { Coffee, Scissors, Stethoscope, ShoppingBag } from 'lucide-react'
import MenuManager from './MenuManager'

export default async function MenusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar menú del usuario
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
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              Catálogo Interactivo y Menú Digital
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Diseñado para <b>Restaurantes, Cafeterías, Salones de Belleza, Barberías y Clínicas Dentales</b>.
            </p>
          </div>
          {menu && (
            <a 
              href={`/m/${menu.slug}`} 
              target="_blank" 
              className="bg-black text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-800 transition whitespace-nowrap shadow-xs"
            >
              Ver Catálogo Público &rarr;
            </a>
          )}
        </div>

        {!menu ? (
          <div className="bg-gray-50 p-6 sm:p-10 rounded-2xl border border-gray-200 text-center max-w-xl mx-auto">
            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Coffee className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Crea tu Primer Catálogo o Menú</h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-6">
              Elige tu tipo de negocio y publica tus servicios o platillos con fotos y precios.
            </p>
            
            <form action={createMenu} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Comercial del Negocio *</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Ej. Barbería Deluxe / Clínica Dental San Lucas / Bistro Café" 
                  required 
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo de Negocio *</label>
                <select
                  name="business_type"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none font-medium"
                >
                  <option value="restaurant">🍽️ Restaurante / Cafetería / Bar (Platos, alérgenos y pedidos)</option>
                  <option value="salon">💈 Salón de Belleza / Barbería / Spa (Cortes y reserva de turnos)</option>
                  <option value="dental">🦷 Clínica Dental / Médica (Tratamientos y citas de valoración)</option>
                  <option value="services">🛍️ Tienda / Boutique / Servicios Profesionales</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-md cursor-pointer mt-2"
              >
                Crear Mi Catálogo Digital
              </button>
            </form>
          </div>
        ) : (
          <MenuManager menu={menu} categories={categories} />
        )}
      </div>
    </div>
  )
}
