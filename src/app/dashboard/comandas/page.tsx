export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'
import { getUserPlanInfo } from '@/lib/plans'
import ProFeaturePaywall from '@/components/ProFeaturePaywall'
import ComandasClient from './ComandasClient'

export const metadata = {
  title: 'Comandas & Registro de Ventas | OmniTag',
  description: 'Tablero de pedidos en cocina en tiempo real, registro de ventas, control de mesas y canje de premios.'
}

export default async function ComandasPage() {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)
  if (!user) redirect('/login')
  const db = isImpersonating ? getAdminClient() : supabase

  const planInfo = await getUserPlanInfo(db, user.id)
  if (!planInfo.canAccessProSuite && !isImpersonating) {
    return (
      <ProFeaturePaywall 
        featureName="Panel de Comandas & Ventas"
        featureDescription="La comandera digital en vivo, control de pedidos de mesa y registro de ventas forman parte del Plan PRO Mensual."
        hardwareType={planInfo.hardwareType}
      />
    )
  }

  // 1. Obtener menús del restaurante
  const { data: menus } = await db
    .from('menus')
    .select('id, name, slug, currency, whatsapp_number')
    .eq('user_id', user.id)

  const activeMenus = menus || []
  const menuIds = activeMenus.map(m => m.id)

  // 2. Obtener pedidos recientes del restaurante
  let orders: any[] = []
  if (menuIds.length > 0) {
    const { data: fetchedOrders, error } = await db
      .from('restaurant_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200)

    if (!error && fetchedOrders) {
      orders = fetchedOrders
    }
  }

  const defaultCurrency = activeMenus[0]?.currency || 'HNL'

  return (
    <div className="space-y-6">
      <ComandasClient 
        userMenus={activeMenus} 
        initialOrders={orders} 
        currency={defaultCurrency}
      />
    </div>
  )
}
