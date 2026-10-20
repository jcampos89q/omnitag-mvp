export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { createMenu } from './actions'
import { Coffee, Scissors, Stethoscope, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import MenuManager from './MenuManager'
import { getUserPlanInfo } from '@/lib/plans'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'
import ProFeaturePaywall from '@/components/ProFeaturePaywall'
import FriendlyErrorAlert from '@/components/FriendlyErrorAlert'

export default async function MenusPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  const db = isImpersonating ? getAdminClient() : supabase
  const params = searchParams ? await searchParams : {}

  // 1. Obtener estado del plan
  const planInfo = await getUserPlanInfo(db, user?.id)
  const isPro = planInfo.isPro

  if (!planInfo.canAccessProSuite) {
    return (
      <ProFeaturePaywall 
        featureName="Menú & Catálogo Digital QR"
        featureDescription="La creación de menús interactivos, listas de precios y cartas digitales está disponible con el Plan PRO Mensual."
        hardwareType={planInfo.hardwareType}
      />
    )
  }

  // 2. Buscar menú del usuario
  const { data: menu } = await db
    .from('menus')
    .select('*')
    .eq('user_id', user?.id)
    .maybeSingle()

  // Si tiene menú, buscar categorías con sus ítems
  let categories = []
  if (menu) {
    const { data: cats } = await db
      .from('menu_categories')
      .select('*, menu_items(*)')
      .eq('menu_id', menu.id)
      .order('created_at', { ascending: true })
    categories = cats || []
  }

  const userIndustry = user?.industry || 'general'
  const isRestaurant = menu?.business_type === 'restaurant' || userIndustry === 'restaurant'
  const isBeauty = menu?.business_type === 'salon' || userIndustry === 'beauty'
  const isRetail = menu?.business_type === 'services' || userIndustry === 'retail'

  const pageTitle = isRestaurant 
    ? 'Menú Digital Gastronómico & Comandas' 
    : isBeauty 
    ? 'Catálogo de Servicios & Estética' 
    : isRetail 
    ? 'Catálogo de Productos & WhatsApp' 
    : 'Catálogo Interactivo y Menú Digital'

  const pageSubtitle = isRestaurant
    ? 'Administra tus platillos, desayunos, almuerzos, precios del día y pedidos organizados por WhatsApp o mesa.'
    : isBeauty
    ? 'Muestra tus tratamientos capilares, cortes y cambios de look con precios actualizados.'
    : isRetail
    ? 'Exhibe tus productos con fotos, precios y variantes para recibir compras directas a WhatsApp.'
    : 'Configura tu menú digital, platillos y presentación para tus comensales y clientes.'

  return (
    <div className="space-y-8">
      {params.error && (
        <FriendlyErrorAlert error={params.error} />
      )}
      {params.success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold shadow-xs animate-in fade-in slide-in-from-top-2">
          ✅ {params.success}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              {pageTitle}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {pageSubtitle}
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

        {menu && (
          <div className="mb-6 p-4 rounded-2xl bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                🎡
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                  <span>Ruleta & Raspa y Gana en tu Menú Digital</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">Activo</span>
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Tus comensales pueden raspar una tarjeta o girar la ruleta en mesa para ganar premios, registrar su WhatsApp y dejarte reseñas en Google Maps al pagar.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/dashboard/comandas"
                className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs whitespace-nowrap flex items-center gap-1.5"
              >
                <span>👨‍🍳 Tablero Comandas</span>
              </Link>
              <Link
                href="/dashboard/ruleta"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs whitespace-nowrap flex items-center gap-1.5"
              >
                <span>Configurar Premios</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}

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
                  placeholder={
                    isRestaurant 
                      ? "Ej. Restaurante Delicias Salomé / Café Bistro" 
                      : isBeauty 
                      ? "Ej. Salón Deluxe / Barbería El Rey" 
                      : isRetail 
                      ? "Ej. Boutique Linda / Tienda Express" 
                      : "Ej. Mi Negocio / Restaurante Delicias Salomé"
                  } 
                  required 
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>

              {/* Si la industria ya está preseleccionada en el negocio, no molestamos con opciones redundantes */}
              {userIndustry && userIndustry !== 'general' ? (
                <div>
                  <input type="hidden" name="business_type" value={isBeauty ? 'salon' : isRestaurant ? 'restaurant' : 'services'} />
                  <div className="p-3 bg-gray-100 rounded-xl flex items-center justify-between text-xs text-gray-700">
                    <span className="font-semibold">
                      Tipo de negocio detectado:
                    </span>
                    <span className="font-extrabold text-black">
                      {isRestaurant ? '🍽️ Restaurante / Cafetería' : isBeauty ? '💈 Salón de Belleza / Estética' : '🛍️ Comercio / Tienda'}
                    </span>
                  </div>
                </div>
              ) : (
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
              )}

              <button 
                type="submit" 
                className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-md cursor-pointer mt-2"
              >
                Crear Mi Catálogo Digital
              </button>
            </form>
          </div>
        ) : (
          <MenuManager menu={menu} categories={categories} isPro={isPro} />
        )}
      </div>
    </div>
  )
}
