'use client'

import { useState, useEffect } from 'react'
import { 
  Coffee, 
  Trash2, 
  Plus, 
  Clock, 
  Sparkles, 
  Image as ImageIcon, 
  Check, 
  Palette, 
  QrCode, 
  UtensilsCrossed, 
  Pencil, 
  Tag, 
  Layers, 
  Type, 
  SlidersHorizontal,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Star,
  Filter,
  CheckCircle2
} from 'lucide-react'
import ImageUploadInput from '@/components/ImageUploadInput'
import ThemeSelector from '@/components/ThemeSelector'
import TableQRGeneratorModal from './TableQRGeneratorModal'
import SaveButton from '@/components/SaveButton'
import Link from 'next/link'
import { 
  updateMenu, 
  createCategory, 
  deleteCategory, 
  deleteMenuItem, 
  setDailySpecial, 
  deleteDailySpecial, 
  removeDailySpecialItem,
  addMenuTable, 
  generateBatchTables, 
  deleteMenuTable,
  toggleMenuItemFeatured
} from './actions'
import EditMenuItemModal from './components/EditMenuItemModal'
import AddMenuItemModal from './components/AddMenuItemModal'
import CategoryScheduleModal from './components/CategoryScheduleModal'
import SmartScheduleTab from './components/SmartScheduleTab'
import { resolveCategorySchedule, formatTime24To12 } from '@/lib/menuSchedule'

interface MenuManagerProps {
  menu: any
  categories: any[]
  isPro?: boolean
}

type TabKey = 'items' | 'schedule' | 'brand' | 'theme' | 'typography' | 'tables' | 'special'

export default function MenuManager({ menu, categories, isPro = false }: MenuManagerProps) {
  // Pestaña activa: por defecto en 'items' (Platos y Categorías)
  const [activeTab, setActiveTab] = useState<TabKey>('items')
  
  // Categorías locales sincronizadas para actualizaciones optimistas instantáneas (ej. estrella plato del día)
  const [localCategories, setLocalCategories] = useState(categories)
  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  // Pestaña / filtro de categoría seleccionada: 'all' | category.id | 'featured'
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all')

  // Estado de categorías colapsadas (acordeón para no tener que hacer scroll infinito)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({})

  // Estado para indicar si se está guardando el toggle de destacado
  const [isTogglingFeatured, setIsTogglingFeatured] = useState<string | null>(null)

  const [businessType] = useState<string>(menu.business_type || 'restaurant')
  const [showDailySpecialForm, setShowDailySpecialForm] = useState(false)
  const [showTableQRModal, setShowTableQRModal] = useState(false)

  // Estados de Modales de Edición y Creación
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [addingToCategory, setAddingToCategory] = useState<any | null>(null)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)

  const todayStr = new Date().toISOString().slice(0, 10)
  const dailySpecial = menu.daily_special
  const isDailySpecialActive = Boolean(dailySpecial?.is_active && dailySpecial?.date === todayStr)
  
  // Platos especiales únicos de hoy (con soporte para 1 o varias opciones)
  const dailySpecialDishes: Array<{ id: string; name: string; price: number; description?: string; image_url?: string }> = isDailySpecialActive
    ? (Array.isArray(dailySpecial.items) && dailySpecial.items.length > 0
        ? dailySpecial.items
        : (dailySpecial.name || dailySpecial.title)
        ? [{
            id: dailySpecial.id || 'single',
            name: dailySpecial.name || dailySpecial.title,
            price: Number(dailySpecial.price) || 0,
            description: dailySpecial.description || '',
            image_url: dailySpecial.image_url || ''
          }]
        : []
      )
    : []

  const [editingDailySpecialItem, setEditingDailySpecialItem] = useState<any | null>(null)
  const [showAddDailySpecialForm, setShowAddDailySpecialForm] = useState(false)
  const currencySymbol = menu.currency || 'L.'

  const isRestaurant = businessType === 'restaurant'
  const totalDishes = localCategories.reduce((acc, c) => acc + (c.menu_items?.length || 0), 0)
  const storedSchedules = menu.catalog_settings?.category_schedules || {}

  // Lista consolidada de todos los platillos para platos del día / destacados
  const allDishes = localCategories.flatMap(c => 
    (c.menu_items || []).map((it: any) => ({ ...it, categoryName: c.name, categoryId: c.id }))
  )
  const featuredDishes = allDishes.filter(it => it.is_featured)
  const nonFeaturedDishes = allDishes.filter(it => !it.is_featured)
  const featuredCount = featuredDishes.length

  // Funciones de colapso de categorías
  const toggleCollapse = (catId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }))
  }

  const areAllCollapsed = localCategories.length > 0 && localCategories.every(c => collapsedCategories[c.id])

  const toggleAllCollapse = () => {
    if (areAllCollapsed) {
      setCollapsedCategories({})
    } else {
      const all: Record<string, boolean> = {}
      localCategories.forEach(c => { all[c.id] = true })
      setCollapsedCategories(all)
    }
  }

  // Toggle instantáneo de Plato del Día / Destacado
  const handleToggleFeatured = async (itemId: string, newFeatured: boolean) => {
    setIsTogglingFeatured(itemId)
    // Actualización optimista inmediata
    setLocalCategories(prev => prev.map(cat => ({
      ...cat,
      menu_items: (cat.menu_items || []).map((it: any) => 
        it.id === itemId ? { ...it, is_featured: newFeatured } : it
      )
    })))

    try {
      const res = await toggleMenuItemFeatured(itemId, newFeatured)
      if (!res?.success) {
        setLocalCategories(categories)
        alert(res?.error || 'No se pudo actualizar el estado de plato del día')
      }
    } catch {
      setLocalCategories(categories)
    } finally {
      setIsTogglingFeatured(null)
    }
  }

  const HUB_ITEMS = [
    {
      id: 'items' as TabKey,
      title: 'Menú & Platillos',
      desc: `${localCategories.length} categorías • ${totalDishes} platillos`,
      icon: '🍽️',
      badge: `${totalDishes} platos`,
      color: 'border-black hover:border-black'
    },
    {
      id: 'special' as TabKey,
      title: 'Plato del Día & Destacados',
      desc: featuredCount > 0 
        ? `${featuredCount} platos del día activos` 
        : (isDailySpecialActive ? 'Plato especial activo' : 'Configura tus platos estrella de hoy'),
      icon: '🌟',
      badge: featuredCount > 0 ? `${featuredCount} activos` : (isDailySpecialActive ? 'Activo' : 'Especial'),
      color: 'border-amber-400 hover:border-amber-500'
    },
    {
      id: 'schedule' as TabKey,
      title: 'Horarios Inteligentes',
      desc: 'Turnos: Desayunos, Almuerzos y Todo el día',
      icon: '⏰',
      badge: 'Turnos',
      color: 'border-amber-400 hover:border-amber-500'
    },
    {
      id: 'brand' as TabKey,
      title: 'Imagen de Marca',
      desc: 'Logo, Nombre, WhatsApp de comandas y Slogan',
      icon: '🏷️',
      badge: 'Identidad',
      color: 'border-blue-400 hover:border-blue-500'
    },
    {
      id: 'theme' as TabKey,
      title: 'Tema Visual & Colores',
      desc: 'Paletas de diseño y colores para el restaurante',
      icon: '🎨',
      badge: 'Diseño',
      color: 'border-purple-400 hover:border-purple-500'
    },
    {
      id: 'tables' as TabKey,
      title: 'Mesas & QR Studio',
      desc: `${Array.isArray(menu.tables) ? menu.tables.length : 0} mesas registradas para comanda`,
      icon: '🪑',
      badge: 'Mesas',
      color: 'border-slate-700 hover:border-slate-800'
    }
  ]

  return (
    <div className="space-y-6">
      {/* 1. HUB DE SELECCIÓN: EL CLIENTE ELIGE QUÉ CONFIGURAR */}
      <div className="bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">
              ¿Qué deseas configurar en tu menú hoy?
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Selecciona una sección para editarla de forma limpia sin distracciones ni ruido visual.
            </p>
          </div>

          {isRestaurant && isDailySpecialActive && (
            <button
              onClick={() => setActiveTab('special')}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-current" />
              <span>Plato del Día Activo</span>
            </button>
          )}
        </div>

        {/* Cuadrícula de Módulos (Cards de Navegación Clara) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {HUB_ITEMS.map((item) => {
            const isSelected = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  isSelected
                    ? 'border-black bg-white shadow-md ring-2 ring-black/15'
                    : 'border-gray-200 bg-white/70 hover:bg-white hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="font-extrabold text-xs text-gray-900 leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-snug">
                    {item.desc}
                  </p>
                </div>

                {isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] font-black text-black uppercase">
                    <span>Activo</span>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. SECCIÓN: MENÚ & PLATILLOS (CON NAVEGACIÓN RÁPIDA, ACORDEÓN Y PLATOS DESTACADOS) */}
      {activeTab === 'items' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Header de la sección de menú */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <span>🍽️ Carta, Categorías y Platillos</span>
                <span className="text-xs bg-black text-white px-2.5 py-0.5 rounded-full font-bold">
                  {localCategories.length} {localCategories.length === 1 ? 'Categoría' : 'Categorías'}
                </span>
                {featuredCount > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600 fill-current" />
                    {featuredCount} {featuredCount === 1 ? 'Plato del Día' : 'Platos del Día'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Crea categorías, añade platillos con fotos y precios, o edita cualquier plato existente con 1 clic.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowNewCategoryModal(true)}
              className="bg-black text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nueva Categoría</span>
            </button>
          </div>

          {/* BARRA HORIZONTAL DE ACCESO DIRECTO ENTRE CATEGORÍAS & PLATOS DEL DÍA */}
          {localCategories.length > 0 && (
            <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-black uppercase tracking-wider">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filtrar por sección / Saltar a:</span>
                </div>

                <button
                  type="button"
                  onClick={toggleAllCollapse}
                  className="text-[11px] font-bold text-gray-600 hover:text-black flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  title="Expandir o colapsar todas las categorías para ver el resumen"
                >
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                  <span>{areAllCollapsed ? 'Expandir Todo' : 'Colapsar Todo'}</span>
                </button>
              </div>

              {/* Píldoras deslizables con acceso directo */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                {/* 1. Acceso Directo Exclusivo a Plato del Día */}
                <button
                  type="button"
                  onClick={() => setSelectedCategoryTab('daily_special')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 border ${
                    selectedCategoryTab === 'daily_special'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-black'
                      : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${selectedCategoryTab === 'daily_special' ? 'text-amber-200' : 'text-amber-600'} fill-current`} />
                  <span>🌟 Plato del Día</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    selectedCategoryTab === 'daily_special' ? 'bg-white/25 text-white' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {dailySpecialDishes.length > 0 ? `${dailySpecialDishes.length} hoy` : 'Especial'}
                  </span>
                </button>

                {/* 2. Botón Ver Toda la Carta */}
                <button
                  type="button"
                  onClick={() => setSelectedCategoryTab('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 border ${
                    selectedCategoryTab === 'all'
                      ? 'bg-black text-white border-black shadow-xs font-black'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <span>✨ Toda la Carta</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategoryTab === 'all' ? 'bg-white/20 text-white' : 'bg-white text-gray-700'
                  }`}>
                    {localCategories.length}
                  </span>
                </button>

                {/* 3. Botones por Categoría (Desayunos, Almuerzos, etc.) */}
                {localCategories.map((c) => {
                  const isSelected = selectedCategoryTab === c.id
                  const schedule = resolveCategorySchedule(c.id, c.name, storedSchedules)
                  const icon = schedule.type === 'breakfast' ? '🍳' : schedule.type === 'lunch' ? '🍲' : schedule.type === 'dinner' ? '🌙' : '🍽️'
                  const count = c.menu_items?.length || 0

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryTab(c.id)
                        setCollapsedCategories(prev => ({ ...prev, [c.id]: false }))
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-xs font-black'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span>{icon} {c.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  )
                })}

                {/* 4. Recomendados / Destacados del Chef */}
                {featuredCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryTab('featured')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 border ${
                      selectedCategoryTab === 'featured'
                        ? 'bg-black text-white border-black shadow-xs font-black'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>⭐ Recomendados ({featuredCount})</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SECCIÓN PROPIA Y DEDICADA: 🌟 PLATO DEL DÍA (ESPECIAL QUE CAMBIA A DIARIO) */}
          {(selectedCategoryTab === 'all' || selectedCategoryTab === 'daily_special') && (
            <div className="border-2 border-amber-300 rounded-2xl overflow-hidden shadow-xs bg-linear-to-b from-amber-50/70 via-white to-white animate-in fade-in duration-150">
              {/* Header de la Sección Plato del Día */}
              <div className="bg-amber-100/90 px-4 sm:px-6 py-4 border-b border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-xs shrink-0">
                    🌟
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-black text-base sm:text-lg text-amber-950">
                        Sección: Plato del Día (Especial de Hoy)
                      </h4>
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                        isDailySpecialActive && dailySpecialDishes.length > 0
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-white text-gray-600 border-gray-300'
                      }`}>
                        {isDailySpecialActive && dailySpecialDishes.length > 0
                          ? `🟢 Publicado para hoy (${dailySpecialDishes.length} ${dailySpecialDishes.length === 1 ? 'plato' : 'platos'})`
                          : '⚪ No has publicado el plato de hoy'}
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/80 mt-0.5">
                      Plato especial preparado hoy que cambia a diario y no se repite en la semana. Se muestra de primero a tus comensales.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDailySpecialItem(null)
                      setShowAddDailySpecialForm(!showAddDailySpecialForm)
                    }}
                    className="bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddDailySpecialForm ? 'Cerrar Formulario' : (dailySpecialDishes.length > 0 ? '+ Agregar otra opción' : '+ Publicar Plato de Hoy')}</span>
                  </button>

                  {isDailySpecialActive && dailySpecialDishes.length > 0 && (
                    <form action={deleteDailySpecial} onSubmit={(e) => {
                      if (!confirm('¿Desactivar el plato del día para hoy?')) e.preventDefault()
                    }}>
                      <input type="hidden" name="menu_id" value={menu.id} />
                      <button
                        type="submit"
                        className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition cursor-pointer whitespace-nowrap"
                        title="Desactivar platos del día para hoy"
                      >
                        Desactivar
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Formulario Inline para Publicar / Editar Plato del Día */}
              {(showAddDailySpecialForm || editingDailySpecialItem || (!isDailySpecialActive && selectedCategoryTab === 'daily_special')) && (
                <div className="p-4 sm:p-6 bg-white border-b border-amber-200 animate-in fade-in duration-150">
                  <div className="max-w-2xl mx-auto space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div>
                        <h5 className="font-extrabold text-sm sm:text-base text-gray-900 flex items-center gap-1.5">
                          <span>{editingDailySpecialItem ? '✏️ Editar Plato del Día' : '✨ Publicar Plato Especial de Hoy'}</span>
                        </h5>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Escribe el platillo único preparado para hoy con su precio y descripción.
                        </p>
                      </div>

                      {(showAddDailySpecialForm || editingDailySpecialItem) && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddDailySpecialForm(false)
                            setEditingDailySpecialItem(null)
                          }}
                          className="text-xs text-gray-500 hover:text-black font-bold cursor-pointer px-2 py-1"
                        >
                          ✕ Cancelar
                        </button>
                      )}
                    </div>

                    <form action={setDailySpecial} className="space-y-4">
                      <input type="hidden" name="menu_id" value={menu.id} />
                      {editingDailySpecialItem?.id && (
                        <input type="hidden" name="dish_id" value={editingDailySpecialItem.id} />
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Nombre del Plato del Día *
                          </label>
                          <input
                            type="text"
                            name="name"
                            defaultValue={editingDailySpecialItem?.name || ''}
                            placeholder="Ej. Sopa Marinera de la Casa / Pollo al Horno con Tajadas"
                            required
                            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:border-black focus:outline-none font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Precio ({currencySymbol}) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            name="price"
                            defaultValue={editingDailySpecialItem?.price || ''}
                            placeholder="120.00"
                            required
                            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:border-black focus:outline-none font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                          Acompañamientos / Descripción del Plato
                        </label>
                        <textarea
                          name="description"
                          defaultValue={editingDailySpecialItem?.description || ''}
                          rows={2}
                          placeholder="Ej. Incluye arroz blanco, tajadas de plátano, ensalada fresca y vaso de fresco natural..."
                          className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:border-black focus:outline-none resize-none"
                        />
                      </div>

                      <div>
                        <ImageUploadInput
                          name="image"
                          label="Foto del Plato del Día (Opcional pero recomendado)"
                          defaultValue={editingDailySpecialItem?.image_url}
                          shape="square"
                          helpText="Sube una foto atractiva del plato recién servido para cautivar a los clientes."
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        {(showAddDailySpecialForm || editingDailySpecialItem) && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddDailySpecialForm(false)
                              setEditingDailySpecialItem(null)
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                          >
                            Cancelar
                          </button>
                        )}
                        <SaveButton
                          label={editingDailySpecialItem ? 'Guardar Cambios' : 'Publicar Plato del Día'}
                          loadingLabel="Publicando..."
                          className="bg-amber-900 hover:bg-amber-950 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shadow-sm"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Lista de Platos del Día Activos para Hoy */}
              <div className="p-4 sm:p-5">
                {dailySpecialDishes.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 space-y-2">
                    <p className="text-sm font-bold text-amber-950">
                      Aún no has definido el plato especial para hoy ({new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })})
                    </p>
                    <p className="text-xs text-amber-900/70 max-w-sm mx-auto">
                      Como los platos del día no se repiten en la semana, ingresa aquí lo que preparaste hoy para que tus clientes lo pidan directamente.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDailySpecialItem(null)
                        setShowAddDailySpecialForm(true)
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 bg-amber-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-amber-950 transition cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ingresar Plato de Hoy</span>
                    </button>
                  </div>
                ) : (
                  <div className={`grid gap-3.5 ${dailySpecialDishes.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    {dailySpecialDishes.map((dish: any) => (
                      <div 
                        key={dish.id}
                        className="p-3.5 rounded-xl border border-amber-200 bg-white shadow-2xs flex gap-3.5 items-start relative group hover:border-amber-300 transition"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 overflow-hidden border border-amber-200">
                          {dish.image_url ? (
                            <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-amber-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-16">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-600 fill-current" />
                              <span>Exclusivo de Hoy</span>
                            </span>
                          </div>
                          <h5 className="font-extrabold text-sm sm:text-base text-gray-900 leading-tight truncate">
                            {dish.name}
                          </h5>
                          <p className="font-black text-sm text-amber-900 mt-0.5">
                            {currencySymbol} {dish.price}
                          </p>
                          {dish.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                              {dish.description}
                            </p>
                          )}
                        </div>

                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDailySpecialItem(dish)
                              setShowAddDailySpecialForm(true)
                            }}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition cursor-pointer border border-gray-200 shadow-2xs"
                            title="Editar plato del día"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <form action={removeDailySpecialItem} onSubmit={(e) => {
                            if (!confirm(`¿Eliminar "${dish.name}" de los platos del día de hoy?`)) e.preventDefault()
                          }}>
                            <input type="hidden" name="menu_id" value={menu.id} />
                            <input type="hidden" name="dish_id" value={dish.id} />
                            <button
                              type="submit"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Eliminar plato del día"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VISTA ESPECÍFICA: SOLO RECOMENDADOS / DESTACADOS */}
          {selectedCategoryTab === 'featured' && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 sm:p-6 space-y-5 animate-in fade-in duration-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider mb-1 border border-amber-300">
                    <Sparkles className="w-3 h-3 text-amber-600 fill-current" />
                    <span>Recomendaciones del Menú</span>
                  </div>
                  <h4 className="font-extrabold text-base sm:text-lg text-amber-950">
                    ⭐ Platillos Destacados del Chef ({featuredCount})
                  </h4>
                  <p className="text-xs text-amber-900/80 mt-0.5 max-w-xl">
                    Platos de la carta regular con distintivo especial de recomendación.
                  </p>
                </div>

                {nonFeaturedDishes.length > 0 && (
                  <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleToggleFeatured(e.target.value, true)
                          e.target.value = ''
                        }
                      }}
                      defaultValue=""
                      className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-950 focus:border-amber-600 focus:outline-none shadow-2xs cursor-pointer w-full sm:w-auto"
                    >
                      <option value="" disabled>+ Destacar otro platillo...</option>
                      {nonFeaturedDishes.map((dish: any) => (
                        <option key={dish.id} value={dish.id}>
                          {dish.categoryName}: {dish.name} ({currencySymbol} {dish.price})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {featuredDishes.length === 0 ? (
                <div className="text-center py-10 bg-white/80 rounded-xl border border-dashed border-amber-300 space-y-2.5 p-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-xl">
                    ⭐
                  </div>
                  <p className="text-sm font-bold text-amber-950">No hay platos destacados en la carta fija</p>
                  <p className="text-xs text-amber-900/70 max-w-sm mx-auto">
                    Toca la estrella ☆ en cualquiera de tus platillos regulares para destacarlo.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {featuredDishes.map((item: any) => (
                    <div 
                      key={item.id}
                      className="p-3.5 rounded-xl border border-amber-200 bg-white shadow-2xs flex gap-3.5 items-start relative group hover:shadow-xs transition"
                    >
                      <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-7 h-7 text-gray-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-18">
                        <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md inline-block uppercase mb-1 border border-amber-200">
                          {item.categoryName}
                        </span>
                        <h5 className="font-extrabold text-sm text-gray-900 truncate">{item.name}</h5>
                        <p className="font-black text-sm text-amber-900 mt-0.5">{currencySymbol} {item.price}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                        )}
                      </div>

                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(item.id, false)}
                          className="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition cursor-pointer"
                          title="Quitar de destacados"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition cursor-pointer border border-gray-200 shadow-2xs"
                          title="Editar platillo"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LISTADO DE CATEGORÍAS (FILTRADAS SEGÚN SELECCIÓN CON ACORDEÓN) */}
          {selectedCategoryTab !== 'featured' && selectedCategoryTab !== 'daily_special' && (
            <>
              {/* Notificación si se está filtrando una sola categoría */}
              {selectedCategoryTab !== 'all' && (
                <div className="flex items-center justify-between bg-black/5 px-4 py-2.5 rounded-xl border border-black/10 text-xs">
                  <span className="font-bold text-gray-700">
                    Mostrando únicamente la categoría: <b className="text-gray-950 font-black">{localCategories.find(c => c.id === selectedCategoryTab)?.name}</b>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryTab('all')}
                    className="text-xs font-black text-black underline hover:opacity-75 cursor-pointer ml-2"
                  >
                    Ver todas las categorías
                  </button>
                </div>
              )}

              {localCategories.length === 0 ? (
                <div className="p-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto text-xl text-gray-500">
                    🍽️
                  </div>
                  <p className="text-base font-bold text-gray-900">No hay categorías en tu menú todavía</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Crea tu primera categoría como "Desayunos", "Almuerzos", "Postres" o "Bebidas" para comenzar a añadir tus platillos.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryModal(true)}
                    className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition cursor-pointer shadow-xs"
                  >
                    + Crear Primera Categoría
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {localCategories
                    .filter((category) => selectedCategoryTab === 'all' || category.id === selectedCategoryTab)
                    .map((category) => {
                      const schedule = resolveCategorySchedule(category.id, category.name, storedSchedules)
                      const isAllDay = schedule.type === 'all_day'
                      const isCollapsed = Boolean(collapsedCategories[category.id])
                      const itemsCount = category.menu_items?.length || 0

                      return (
                        <div key={category.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs bg-white transition-all">
                          {/* Header de la Categoría con botón de acordeón */}
                          <div className="bg-gray-50/90 px-4 sm:px-6 py-3.5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2.5">
                              {/* Botón de Colapso / Despliegue */}
                              <button
                                type="button"
                                onClick={() => toggleCollapse(category.id)}
                                className="p-1 -ml-1 text-gray-500 hover:text-black hover:bg-gray-200/80 rounded-lg transition cursor-pointer"
                                title={isCollapsed ? 'Desplegar categoría' : 'Colapsar categoría'}
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '-rotate-90 text-gray-400' : 'text-gray-700'}`} />
                              </button>

                              <h4 
                                onClick={() => toggleCollapse(category.id)}
                                className="font-extrabold text-base sm:text-lg text-gray-900 cursor-pointer hover:text-black flex items-center gap-2 select-none"
                              >
                                {category.name}
                              </h4>
                              
                              {/* Badge de Horario Inteligente */}
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                schedule.type === 'breakfast'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : schedule.type === 'lunch'
                                  ? 'bg-orange-100 text-orange-900 border-orange-300'
                                  : schedule.type === 'dinner'
                                  ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {isAllDay ? '✨ Todo el día' : `${schedule.label?.split('(')[0].trim()}: ${formatTime24To12(schedule.start_time)} - ${formatTime24To12(schedule.end_time)}`}
                              </span>

                              <span className="text-xs text-gray-400 font-bold">
                                • {itemsCount} {itemsCount === 1 ? 'ítem' : 'ítems'}
                              </span>
                            </div>

                            {/* Acciones de la Categoría */}
                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => setAddingToCategory(category)}
                                className="bg-black text-white hover:bg-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-2xs whitespace-nowrap"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Agregar Platillo</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditingCategory(category)}
                                className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                title="Renombrar categoría o cambiar horario"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Editar Horario</span>
                              </button>

                              <form action={deleteCategory} onSubmit={(e) => {
                                if (!confirm(`¿Eliminar la categoría "${category.name}" y todos sus platillos?`)) {
                                  e.preventDefault()
                                }
                              }}>
                                <input type="hidden" name="category_id" value={category.id} />
                                <button
                                  type="submit"
                                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                                  title="Eliminar categoría"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </form>
                            </div>
                          </div>

                          {/* Estado Colapsado Rápido */}
                          {isCollapsed ? (
                            <div 
                              onClick={() => toggleCollapse(category.id)}
                              className="px-5 py-3 bg-gray-50/50 hover:bg-gray-100/60 transition cursor-pointer flex items-center justify-between text-xs text-gray-500 border-t border-dashed border-gray-200"
                            >
                              <span className="font-semibold">
                                Categoría colapsada ({itemsCount} {itemsCount === 1 ? 'platillo' : 'platillos'})
                              </span>
                              <span className="text-black font-extrabold flex items-center gap-1 text-[11px]">
                                <span>Toca para desplegar platillos</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          ) : (
                            /* Listado de Platillos Desplegado */
                            <div className="p-4 sm:p-5">
                              {(!category.menu_items || category.menu_items.length === 0) ? (
                                <div className="p-6 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 space-y-2">
                                  <p className="text-xs font-bold text-gray-600">No hay platillos en "{category.name}"</p>
                                  <button
                                    type="button"
                                    onClick={() => setAddingToCategory(category)}
                                    className="text-xs font-bold text-black underline cursor-pointer"
                                  >
                                    + Agregar el primer platillo
                                  </button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  {category.menu_items.map((item: any) => (
                                    <div 
                                      key={item.id} 
                                      className={`p-3.5 rounded-xl border transition-all flex gap-3.5 items-start bg-white shadow-2xs hover:shadow-xs relative group ${
                                        item.is_available === false ? 'opacity-60 bg-gray-50 border-gray-200' : item.is_featured ? 'border-amber-300 ring-1 ring-amber-300/50' : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      {/* Foto miniatura */}
                                      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative border border-gray-200">
                                        {item.image_url ? (
                                          <img 
                                            src={item.image_url} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover" 
                                            loading="lazy"
                                          />
                                        ) : (
                                          <ImageIcon className="w-7 h-7 text-gray-300" />
                                        )}
                                      </div>

                                      {/* Información del platillo */}
                                      <div className="flex-1 min-w-0 pr-22">
                                        <h5 className="font-extrabold text-sm text-gray-900 leading-tight truncate">
                                          {item.name}
                                        </h5>

                                        <p className="font-black text-sm text-gray-900 mt-0.5">
                                          {currencySymbol} {item.price}
                                        </p>

                                        {item.description && (
                                          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                            {item.description}
                                          </p>
                                        )}

                                        {/* Tags */}
                                        <div className="flex flex-wrap items-center gap-1 mt-2">
                                          {item.is_available === false && (
                                            <span className="text-[10px] font-extrabold text-red-700 bg-red-100 px-1.5 py-0.5 rounded uppercase">
                                              Agotado
                                            </span>
                                          )}
                                          {item.is_featured && (
                                            <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 uppercase flex items-center gap-1 shadow-2xs">
                                              <Sparkles className="w-2.5 h-2.5 text-amber-600 fill-current" />
                                              <span>Plato del Día</span>
                                            </span>
                                          )}
                                          {item.allergens?.includes('vegan') && (
                                            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded uppercase">
                                              Vegano
                                            </span>
                                          )}
                                          {item.allergens?.includes('spicy') && (
                                            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded uppercase">
                                              Picante
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Botones de Acción directos del Ítem */}
                                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                                        {/* Botón Estrella: 1 Clic para Plato del Día / Destacado */}
                                        <button
                                          type="button"
                                          onClick={() => handleToggleFeatured(item.id, !item.is_featured)}
                                          disabled={isTogglingFeatured === item.id}
                                          className={`p-1.5 rounded-lg transition cursor-pointer border ${
                                            item.is_featured
                                              ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 shadow-2xs'
                                              : 'bg-white text-gray-400 hover:text-amber-500 hover:bg-amber-50 border-gray-200'
                                          }`}
                                          title={item.is_featured ? 'Quitar de Plato del Día' : '⭐ Marcar como Plato del Día / Destacado'}
                                        >
                                          <Star className={`w-3.5 h-3.5 ${item.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => setEditingItem(item)}
                                          className="p-1.5 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition cursor-pointer border border-gray-200 shadow-2xs"
                                          title="Editar platillo"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>

                                        <form 
                                          action={deleteMenuItem} 
                                          onSubmit={(e) => {
                                            if (!confirm(`¿Eliminar el platillo "${item.name}"?`)) {
                                              e.preventDefault()
                                            }
                                          }}
                                        >
                                          <input type="hidden" name="item_id" value={item.id} />
                                          <button
                                            type="submit"
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                            title="Eliminar platillo"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </form>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 3. SECCIÓN: HORARIOS INTELIGENTES POR TURNOS */}
      {activeTab === 'schedule' && (
        <div className="animate-in fade-in duration-150">
          <SmartScheduleTab menu={menu} categories={categories} />
        </div>
      )}

      {/* 4. SECCIÓN: IDENTIDAD & MARCA */}
      {activeTab === 'brand' && (
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
              Identidad de Marca & Contacto
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Configura el nombre del restaurante, número de WhatsApp para comandas y logotipo oficial.
            </p>
          </div>

          <form action={updateMenu} className="space-y-5">
            <input type="hidden" name="menu_id" value={menu.id} />
            <input type="hidden" name="business_type" value={businessType} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nombre Comercial del Negocio *
                </label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={menu.name || ''} 
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-semibold focus:border-black focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  WhatsApp para Pedidos / Comandas *
                </label>
                <input 
                  type="tel" 
                  name="whatsapp_number" 
                  defaultValue={menu.whatsapp_number || ''} 
                  placeholder="+504 9988-6256"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-semibold focus:border-black focus:outline-none" 
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  A este número llegarán los pedidos con número de mesa y notas del cliente.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Descripción o Slogan del Negocio
              </label>
              <input 
                type="text" 
                name="description" 
                defaultValue={menu.description || ''} 
                placeholder="Ej. Más que un antojo • Desayunos típicos y comida casera"
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-black focus:outline-none" 
              />
            </div>

            <div>
              <ImageUploadInput
                name="logo"
                label="Logotipo del Negocio"
                defaultValue={menu.logo_url}
                shape="circle"
                helpText="Sube el logo de tu local o restaurante (JPG, PNG, WEBP)."
              />
            </div>

            <div className="pt-2 flex justify-end">
              <SaveButton
                label="Guardar Información de Marca"
                loadingLabel="Guardando cambios..."
                className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-800 transition cursor-pointer shadow-sm"
              />
            </div>
          </form>
        </div>
      )}

      {/* 5. SECCIÓN: TEMA VISUAL & COLORES */}
      {activeTab === 'theme' && (
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="font-extrabold text-gray-900 text-base sm:text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              Tema Visual y Colores del Menú
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Personaliza la atmósfera visual de tu menú con paletas de diseño preconfiguradas.
            </p>
          </div>

          <form action={updateMenu} className="space-y-6">
            <input type="hidden" name="menu_id" value={menu.id} />
            <input type="hidden" name="business_type" value={businessType} />
            <input type="hidden" name="name" value={menu.name || ''} />
            <input type="hidden" name="whatsapp_number" value={menu.whatsapp_number || ''} />
            <input type="hidden" name="description" value={menu.description || ''} />
            <input type="hidden" name="logo_url" value={menu.logo_url || ''} />

            <ThemeSelector initialTheme={menu.theme} fieldNamePrefix="theme" />

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <SaveButton
                label="Guardar Tema Visual"
                loadingLabel="Guardando tema..."
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shadow-sm"
              />
            </div>
          </form>
        </div>
      )}

      {/* 6. SECCIÓN: TIPOGRAFÍA & FUENTES */}
      {activeTab === 'typography' && (
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-200 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="font-extrabold text-gray-900 text-base sm:text-lg flex items-center gap-2">
              <Type className="w-5 h-5 text-teal-600" />
              Tipografía y Estilo de Marca
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Configura la fuente tipográfica y la forma de las tarjetas y botones en tu carta.
            </p>
          </div>

          <form action={updateMenu} className="space-y-6">
            <input type="hidden" name="menu_id" value={menu.id} />
            <input type="hidden" name="business_type" value={businessType} />
            <input type="hidden" name="name" value={menu.name || ''} />
            <input type="hidden" name="whatsapp_number" value={menu.whatsapp_number || ''} />
            <input type="hidden" name="description" value={menu.description || ''} />
            <input type="hidden" name="logo_url" value={menu.logo_url || ''} />

            <ThemeSelector initialTheme={menu.theme} fieldNamePrefix="theme" />

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <SaveButton
                label="Guardar Tipografía y Estilo"
                loadingLabel="Guardando estilo..."
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shadow-sm"
              />
            </div>
          </form>
        </div>
      )}

      {/* 7. SECCIÓN: MESAS & ZONAS */}
      {activeTab === 'tables' && (
        <div className="bg-slate-900 text-white p-5 sm:p-7 rounded-2xl border border-slate-800 space-y-6 shadow-xl animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider">
                <QrCode className="w-3 h-3" /> Mesas & Comandas
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                🪑 Configuración de Mesas del Restaurante
              </h3>
              <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
                Asigna nombres a tus mesas (ej. <b>Mesa 1, Mesa 2, Barra, Terraza VIP</b>). Luego puedes generar e imprimir sus códigos QR en QR Studio.
              </p>
            </div>

            <Link
              href={`/dashboard/qr-studio?source=menu`}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold px-5 py-3 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
            >
              <Palette className="w-4 h-4" />
              <span>Ir a QR Studio Imprimible</span>
            </Link>
          </div>

          {/* Formularios para Agregar Mesas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <form action={addMenuTable} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
              <input type="hidden" name="menu_id" value={menu.id} />
              <label className="block text-xs font-bold text-gray-200">
                + Agregar Mesa o Zona Individual
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="table_name"
                  required
                  placeholder="Ej. Mesa 1 / Barra / Terraza VIP"
                  className="flex-1 rounded-xl border border-slate-600 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
                />
                <SaveButton
                  label="Agregar"
                  loadingLabel="Agregando..."
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-xs whitespace-nowrap flex items-center gap-1"
                />
              </div>
            </form>

            <form action={generateBatchTables} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
              <input type="hidden" name="menu_id" value={menu.id} />
              <label className="block text-xs font-bold text-gray-200">
                ⚡ Generar Lote Automático de Mesas
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="prefix"
                  defaultValue="Mesa"
                  placeholder="Prefijo (ej. Mesa)"
                  className="w-28 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
                />
                <select
                  name="count"
                  defaultValue="5"
                  className="rounded-xl border border-slate-600 bg-slate-900 px-2.5 py-2 text-xs text-white focus:border-yellow-400 focus:outline-none font-bold"
                >
                  <option value="3">3 mesas</option>
                  <option value="5">5 mesas</option>
                  <option value="10">10 mesas</option>
                  <option value="15">15 mesas</option>
                  <option value="20">20 mesas</option>
                </select>
                <SaveButton
                  label="Generar"
                  loadingLabel="Generando..."
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer border border-white/20 whitespace-nowrap flex items-center gap-1"
                />
              </div>
            </form>
          </div>

          {/* Listado de Mesas */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
              <span>Mesas Registradas ({Array.isArray(menu.tables) ? menu.tables.length : 0})</span>
              <span>Acción en QR Studio</span>
            </div>

            {(!Array.isArray(menu.tables) || menu.tables.length === 0) ? (
              <div className="p-8 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center space-y-2">
                <p className="text-sm font-bold text-gray-300">No has registrado mesas todavía</p>
                <p className="text-xs text-gray-400">
                  Agrega una mesa individual arriba o genera un lote automático para diseñar sus QRs imprimibles.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {menu.tables.map((t: any) => (
                  <div
                    key={t.id || t.name}
                    className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between gap-3 shadow-xs hover:border-slate-600 transition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <p className="font-extrabold text-sm text-white truncate">{t.name}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
                        /m/{menu.slug}?mesa={encodeURIComponent(t.name)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        href={`/dashboard/qr-studio?source=menu&table=${encodeURIComponent(t.name)}`}
                        className="bg-yellow-400/15 text-yellow-300 hover:bg-yellow-400 hover:text-black border border-yellow-400/30 px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        title="Personalizar e imprimir QR para esta mesa"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Diseñar QR</span>
                      </Link>

                      <form action={deleteMenuTable}>
                        <input type="hidden" name="menu_id" value={menu.id} />
                        <input type="hidden" name="table_id" value={t.id} />
                        <button
                          type="submit"
                          className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition cursor-pointer"
                          title="Eliminar mesa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. SECCIÓN: PLATO DEL DÍA & DESTACADOS (CENTRO DE CONTROL COMPLETO) */}
      {activeTab === 'special' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* MÓDULO 1: GESTIÓN DE UNO O VARIOS PLATOS DEL DÍA / DESTACADOS */}
          <div className="bg-white border border-amber-200 p-5 sm:p-6 rounded-2xl shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider mb-1 border border-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-600 fill-current" />
                  <span>Platos Estrella & Recomendaciones</span>
                </div>
                <h3 className="font-extrabold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                  <span>🌟 Platos del Día / Destacados en la Carta</span>
                  <span className="text-xs bg-amber-500 text-white px-2.5 py-0.5 rounded-full font-bold">
                    {featuredCount} {featuredCount === 1 ? 'activo' : 'activos'}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
                  Puedes destacar uno o varios platillos (tanto en Desayunos como en Almuerzos). Se mostrarán con insignia dorada ⭐ y acceso directo preferencial para tus comensales.
                </p>
              </div>

              {/* Selector Rápido para Añadir Plato a Destacados */}
              {nonFeaturedDishes.length > 0 && (
                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleToggleFeatured(e.target.value, true)
                        e.target.value = ''
                      }
                    }}
                    defaultValue=""
                    className="rounded-xl border border-amber-300 bg-amber-50/60 px-3 py-2 text-xs font-bold text-amber-950 focus:border-amber-600 focus:outline-none shadow-2xs cursor-pointer w-full sm:w-auto"
                  >
                    <option value="" disabled>+ Añadir un plato a Platos del Día...</option>
                    {nonFeaturedDishes.map((dish: any) => (
                      <option key={dish.id} value={dish.id}>
                        {dish.categoryName}: {dish.name} ({currencySymbol} {dish.price})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {featuredDishes.length === 0 ? (
              <div className="text-center py-10 bg-amber-50/50 rounded-xl border border-dashed border-amber-200 space-y-2.5 p-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto text-xl">
                  ⭐
                </div>
                <p className="text-sm font-bold text-gray-900">No tienes ningún plato marcado como Plato del Día</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Usa el selector de arriba para elegir qué platos destacar hoy, o toca la estrella ☆ directamente en cualquier platillo de tu menú.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('items')}
                  className="mt-1 text-xs font-bold bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition cursor-pointer"
                >
                  Ir al listado de platillos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {featuredDishes.map((item: any) => (
                  <div 
                    key={item.id}
                    className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 hover:bg-amber-50/60 transition shadow-2xs flex gap-3.5 items-start relative group"
                  >
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-7 h-7 text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-18">
                      <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md inline-block uppercase mb-1 border border-amber-200">
                        {item.categoryName}
                      </span>
                      <h5 className="font-extrabold text-sm text-gray-900 truncate">{item.name}</h5>
                      <p className="font-black text-sm text-amber-900 mt-0.5">{currencySymbol} {item.price}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                      )}
                    </div>

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(item.id, false)}
                        className="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition cursor-pointer"
                        title="Quitar de Plato del Día"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition cursor-pointer border border-gray-200 shadow-2xs"
                        title="Editar platillo"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MÓDULO 2: BANNER DESTACADO DIARIO CON PRECIO ESPECIAL (OPCIONAL) */}
          <div className="bg-amber-50/70 border border-amber-200 p-5 sm:p-6 rounded-2xl space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" /> Banner Promocional de Hoy
                </div>
                <h3 className="font-extrabold text-amber-950 text-base sm:text-lg">
                  📢 Banner de Promoción o Menú Ejecutivo del Día
                </h3>
                <p className="text-xs text-amber-900/80 mt-0.5">
                  Muestra un banner flotante arriba de todo en tu menú digital con precio único solo por el día de hoy.
                </p>
              </div>

              {isDailySpecialActive ? (
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Banner Activo Hoy
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
                  {showDailySpecialForm ? 'Cancelar' : '+ Configurar Banner de Hoy'}
                </button>
              )}
            </div>

            {isDailySpecialActive && menu.daily_special && (
              <div className="bg-white p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xs">
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
                    <span className="font-extrabold text-amber-900 text-sm">{currencySymbol} {menu.daily_special.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{menu.daily_special.description}</p>
                </div>
              </div>
            )}

            {(!isDailySpecialActive || showDailySpecialForm) && (
              <form action={setDailySpecial} className="bg-white p-4 sm:p-5 rounded-xl border border-amber-200 space-y-4 shadow-2xs">
                <input type="hidden" name="menu_id" value={menu.id} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre del Plato / Menú Ejecutivo *</label>
                    <input 
                      type="text" 
                      name="name" 
                      placeholder="Ej. Sopa Marinera de la Casa / Parrillada Especial" 
                      required 
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Precio Especial ({currencySymbol}) *</label>
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
                    Publicar Banner del Día
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODALES DE ACCIÓN */}

      {/* 1. Modal para Agregar Platillo a Categoría */}
      <AddMenuItemModal
        isOpen={Boolean(addingToCategory)}
        onClose={() => setAddingToCategory(null)}
        category={addingToCategory}
        categories={categories}
        currencySymbol={currencySymbol}
        businessType={businessType}
      />

      {/* 2. Modal para Editar Platillo Existente */}
      <EditMenuItemModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        categories={categories}
        currencySymbol={currencySymbol}
        businessType={businessType}
      />

      {/* 3. Modal para Crear Nueva Categoría */}
      <CategoryScheduleModal
        isOpen={showNewCategoryModal}
        onClose={() => setShowNewCategoryModal(false)}
        menuId={menu.id}
        category={null}
      />

      {/* 4. Modal para Editar Categoría Existente y su Horario */}
      <CategoryScheduleModal
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        menuId={menu.id}
        category={editingCategory}
        currentSchedule={editingCategory ? resolveCategorySchedule(editingCategory.id, editingCategory.name, storedSchedules) : undefined}
      />

      {/* 5. Modal Generador de Códigos QR por Mesa */}
      <TableQRGeneratorModal
        isOpen={showTableQRModal}
        onClose={() => setShowTableQRModal(false)}
        menuSlug={menu.slug}
        menuName={menu.name}
        isPro={isPro}
      />
    </div>
  )
}
