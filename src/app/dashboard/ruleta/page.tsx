import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getOrCreateWheel } from './actions'
import WheelManagerClient from './WheelManagerClient'

export const metadata = {
  title: 'Ruleta de Premios & Gamificación | Dashboard OmniTag',
  description: 'Gestiona la ruleta de la fortuna, configura premios, probabilidades, días especiales y cupones de fidelización.'
}

export default async function DashboardRuletaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
