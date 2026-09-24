import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getOrCreateWheel } from './actions'
import WheelManagerClient from './WheelManagerClient'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'
import { getUserPlanInfo } from '@/lib/plans'
import ProFeaturePaywall from '@/components/ProFeaturePaywall'

export const metadata = {
  title: 'Ruleta de Premios & Gamificación | Dashboard OmniTag',
  description: 'Gestiona la ruleta de la fortuna, configura premios, probabilidades, días especiales y cupones de fidelización.'
}

export default async function DashboardRuletaPage() {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)
  if (!user) redirect('/login')

  const planInfo = await getUserPlanInfo(supabase, user.id)
  if (!planInfo.canAccessProSuite) {
    return (
      <ProFeaturePaywall 
        featureName="Ruleta de Premios & Gamificación"
        featureDescription="La ruleta de la fortuna y cupones interactivos para clientes son parte exclusiva del Plan PRO Mensual."
        hardwareType={planInfo.hardwareType}
      />
    )
  }

  // Obtener o inicializar la ruleta
  const wheel = await getOrCreateWheel()

  // Obtener historial de giros y cupones recientes
  const { data: spins } = await supabase
    .from('prize_wheel_spins')
    .select('*, prize_wheel_items(label, icon, bg_color)')
    .eq('wheel_id', wheel.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Métricas agregadas
  const totalSpins = spins?.length || 0
  const redeemedSpins = spins?.filter(s => s.status === 'redeemed').length || 0
  const pendingSpins = spins?.filter(s => s.status === 'pending').length || 0

  return (
    <div className="space-y-6">
      <WheelManagerClient 
        initialWheel={wheel}
        initialSpins={spins || []}
        metrics={{
          totalSpins,
          redeemedSpins,
          pendingSpins
        }}
      />
    </div>
  )
}
