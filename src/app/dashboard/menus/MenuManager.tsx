'use client'

import { useState } from 'react'
import { 
  Coffee, 
  Scissors, 
  Stethoscope, 
  ShoppingBag, 
  Flame, 
  Leaf, 
  WheatOff, 
  Save, 
  Trash2, 
  Plus, 
  Clock, 
  Sparkles, 
  CalendarDays,
  Image as ImageIcon,
  Check,
  Palette
} from 'lucide-react'
import ImageUploadInput from '@/components/ImageUploadInput'
import ThemeSelector from '@/components/ThemeSelector'
import { updateMenu, createCategory, deleteCategory, createMenuItem, deleteMenuItem, setDailySpecial, deleteDailySpecial } from './actions'

interface MenuManagerProps {
  menu: any
  categories: any[]
}

const BUSINESS_TYPES = [
  { id: 'restaurant', name: 'Restaurante / Cafetería / Bar', icon: Coffee, desc: 'Alérgenos, combos, plato del día y pedidos por WhatsApp.' },
  { id: 'salon', name: 'Salón de Belleza / Barbería / Spa', icon: Scissors, desc: 'Duración en minutos, cortes, estética y reserva de turnos.' },
  { id: 'dental', name: 'Clínica Dental / Médica / Salud', icon: Stethoscope, desc: 'Tratamientos, precios desde o previa valoración y citas.' },
  { id: 'services', name: 'Tienda / Comercio / Servicios', icon: ShoppingBag, desc: 'Catálogo de productos, venta directa y cotizaciones.' },
]

export default function MenuManager({ menu, categories }: MenuManagerProps) {
  const [businessType, setBusinessType] = useState<string>(menu.business_type || 'restaurant')
  const [showDailySpecialForm, setShowDailySpecialForm] = useState(false)

  const todayStr = new Date().toISOString().slice(0, 10)
  const isDailySpecialActive = menu.daily_special?.is_active && menu.daily_special?.date === todayStr

  return (
    <div className="space-y-8">
      {/* 1. Selector de Tipo de Negocio / Industria */}
      <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Tipo de Catálogo o Negocio
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BUSINESS_TYPES.map((type) => {
            const Icon = type.icon
            const isSelected = businessType === type.id

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setBusinessType(type.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-black bg-white shadow-sm ring-2 ring-black/10'
                    : 'border-gray-200 bg-white/60 text-gray-600 hover:bg-white'
                }`}
              >
                <div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${
                    isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">{type.name}</p>
                  <p className="text-[11px] text-gray-500 mt-1 leading-snug">{type.desc}</p>
                </div>
                {isSelected && (
                  <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold text-black uppercase">
                    <Check className="w-3.5 h-3.5" /> Seleccionado
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. PLATO / ESPECIAL DEL DÍA (Exclusivo para Restaurantes y Cafeterías) */}
      {(businessType === 'restaurant' || businessType === 'services') && (
        <div className="bg-amber-50/70 border border-amber-200 p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" /> Función Diaria Inteligente
              </div>
              <h3 className="font-extrabold text-amber-950 text-base sm:text-lg">
                🌟 Plato o Especial del Día
              </h3>
              <p className="text-xs text-amber-900/80 mt-0.5">
                Configura un platillo exclusivo solo para hoy. Se mostrará en un banner destacado y <b>se desactiva automáticamente a la medianoche</b>.
              </p>
            </div>

            {isDailySpecialActive ? (
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Activo Hoy
                </span>
                <form action={deleteDailySpecial}>
                  <input type="hidden" name="menu_id" value={menu.id} />
                  <button type="submit" className="text-xs text-red-600 hover:underline font-bold px-2 py-1 cursor-pointer">
                    Desactivar
                  </button>
                </form>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDailySpecialForm(!showDailySpecialForm)}
                className="bg-amber-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-amber-950 transition cursor-pointer shadow-xs whitespace-nowrap"
              >
                {showDailySpecialForm ? 'Cancelar' : '+ Configurar Especial de Hoy'}
              </button>
            )}
          </div>

          {isDailySpecialActive && menu.daily_special && (
            <div className="bg-white p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {menu.daily_special.image_url && (
                <img 
                  src={menu.daily_special.image_url} 
                  alt={menu.daily_special.name} 
                  className="w-16 h-16 rounded-lg object-cover shrink-0 border"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-sm">{menu.daily_special.name}</h4>
                  <span className="font-extrabold text-amber-900 text-sm">${menu.daily_special.price}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{menu.daily_special.description}</p>
              </div>
            </div>
          )}

          {(!isDailySpecialActive || showDailySpecialForm) && (
            <form action={setDailySpecial} className="bg-white p-4 sm:p-5 rounded-xl border border-amber-200 space-y-4">
              <input type="hidden" name="menu_id" value={menu.id} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre del Plato Especial de Hoy *</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Ej. Sopa Marinera de la Casa / Parrillada Especial" 
                    required 
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Precio Especial *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    name="price" 
                    placeholder="12.50" 
                    required 
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción / Acompañamientos</label>
                <input 
                  type="text" 
                  name="description" 
                  placeholder="Incluye ensalada, guarnición y bebida. Válido solo por el día de hoy." 
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <ImageUploadInput
                  name="image"
                  label="Foto del Plato del Día (Opcional)"
                  shape="square"
                  helpText="Sube una foto atractiva del plato de hoy para captar la atención."
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-amber-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-amber-950 transition cursor-pointer shadow-sm"
                >
                  Publicar Plato del Día
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 3. Información del Negocio, Logotipo y Tema */}
      <div className="bg-gray-50/80 p-5 sm:p-6 rounded-2xl border border-gray-200 space-y-6">
        <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
          Información del {businessType === 'salon' ? 'Salón / Barbería' : businessType === 'dental' ? 'Consultorio / Clínica' : 'Menú / Catálogo'}
        </h3>
        
        <form action={updateMenu} className="space-y-6">
          <input type="hidden" name="menu_id" value={menu.id} />
          <input type="hidden" name="business_type" value={businessType} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nombre Comercial *</label>
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
              <label htmlFor="whatsapp_number" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                WhatsApp para {businessType === 'salon' || businessType === 'dental' ? 'Citas y Consultas' : 'Pedidos'}
              </label>
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
              placeholder={businessType === 'salon' ? 'Cortes modernos, afeitado clásico, spa y cuidado capilar' : businessType === 'dental' ? 'Odontología integral, blanqueamientos y ortodoncia digital' : 'Comida artesanal y bebidas frescas'}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
            />
          </div>

          {/* Subida de Logotipo */}
          <div>
            <ImageUploadInput
              name="logo"
              label="Logotipo del Negocio"
              defaultValue={menu.logo_url}
              shape="circle"
              helpText="Sube el logo de tu local o marca (JPG, PNG, WEBP, SVG)."
            />
          </div>

          {/* Personalización de Tema, Tipografía y Colores */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600" />
              Tema Visual y Tipografía del Catálogo
            </h4>
            <ThemeSelector initialTheme={menu.theme} fieldNamePrefix="theme" />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center gap-2 text-sm cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" /> Guardar Información y Tema
            </button>
          </div>
        </form>
      </div>

      {/* 4. Categorías & Servicios */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <span className="font-bold text-gray-800 text-sm whitespace-nowrap">
          {businessType === 'salon' || businessType === 'dental' ? 'Añadir Sección / Categoría de Servicios:' : 'Añadir Categoría:'}
        </span>
        <form action={createCategory} className="flex flex-1 w-full gap-2">
          <input type="hidden" name="menu_id" value={menu.id} />
          <input 
            type="text" 
            name="name" 
            placeholder={businessType === 'salon' ? 'Ej. Cortes de Cabello, Barba, Tintes, Tratamientos...' : businessType === 'dental' ? 'Ej. Limpiezas, Ortodoncia, Estética Dental, Implantes...' : 'Ej. Entradas, Platos Fuertes, Postres, Bebidas...'}
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

      {/* 5. Listado de Categorías e Ítems / Servicios */}
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
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar sección
                </button>
              </form>
            </div>
            
            <div className="p-5 bg-white">
              {/* Grid de servicios o platillos */}
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
                        <span className="font-extrabold text-gray-900 text-sm">
                          {item.price_type === 'starting_at' ? 'Desde ' : item.price_type === 'consultation' ? 'Valoración' : ''}${item.price}
                        </span>
                      </div>

                      {/* Duración (para Salones y Clínicas) */}
                      {item.duration_minutes && (
                        <p className="text-[11px] font-semibold text-blue-700 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> Duración: {item.duration_minutes}
                        </p>
                      )}

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
                        title="Eliminar ítem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>

              {/* Formulario adaptativo de nuevo servicio/platillo */}
              <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/70 p-4 rounded-xl">
                <p className="text-xs sm:text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" /> Añadir a "{category.name}"
                </p>
                <form action={createMenuItem} className="space-y-4">
                  <input type="hidden" name="category_id" value={category.id} />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {businessType === 'salon' || businessType === 'dental' ? 'Nombre del Servicio / Tratamiento *' : 'Nombre del Plato *'}
                      </label>
                      <input 
                        type="text" 
                        name="name" 
                        placeholder={businessType === 'salon' ? 'Ej. Corte Fade + Barba, Balayage, Manicura...' : businessType === 'dental' ? 'Ej. Limpieza Ultrasónica, Blanqueamiento Láser...' : 'Ej. Tacos al Pastor, Pizza Margarita...'} 
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
                        placeholder="15.00" 
                        required 
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm bg-white focus:border-black focus:outline-none" 
                      />
                    </div>
                  </div>

                  {/* Campos especializados según la industria */}
                  {businessType === 'salon' || businessType === 'dental' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-600" /> Duración Estimada
                        </label>
                        <input 
                          type="text" 
                          name="duration_minutes" 
                          placeholder="Ej. 30 min, 45 min, 1 hora, 1h 30 min" 
                          className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm bg-white focus:border-black focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Tarifa</label>
                        <select
                          name="price_type"
                          className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm bg-white focus:border-black focus:outline-none"
                        >
                          <option value="fixed">Precio Fijo</option>
                          <option value="starting_at">Desde $ (Precio base)</option>
                          <option value="consultation">Previa Valoración / Diagnóstico</option>
                        </select>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Descripción / Detalles</label>
                    <input 
                      type="text" 
                      name="description" 
                      placeholder={businessType === 'salon' ? 'Incluye lavado, peinado con cera mate y toalla caliente...' : businessType === 'dental' ? 'Eliminación de sarro, pulido con pasta profiláctica y flúor...' : 'Ingredientes, preparación y detalles...'} 
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm bg-white focus:border-black focus:outline-none" 
                    />
                  </div>

                  {/* Subida de Imagen del Platillo / Servicio */}
                  <div>
                    <ImageUploadInput
                      name="image"
                      label={businessType === 'salon' || businessType === 'dental' ? 'Foto del Servicio / Resultado (Recomendado)' : 'Foto del Platillo (Recomendado)'}
                      shape="square"
                      helpText="Una foto de alta calidad aumenta hasta 3 veces las reservas y pedidos."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700">
                      <label className="flex items-center gap-1.5 cursor-pointer bg-yellow-50 px-2 py-1 rounded border border-yellow-200 text-yellow-800 font-bold">
                        <input type="checkbox" name="is_featured" className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500" /> 
                        ⭐ Destacar en el Catálogo
                      </label>
                      {businessType === 'restaurant' && (
                        <>
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
                        </>
                      )}
                    </div>
                    
                    <button 
                      type="submit" 
                      className="w-full sm:w-auto bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 whitespace-nowrap transition cursor-pointer shadow-xs"
                    >
                      Guardar {businessType === 'salon' || businessType === 'dental' ? 'Servicio' : 'Platillo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
