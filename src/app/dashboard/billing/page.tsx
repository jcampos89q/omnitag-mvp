import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreditCard } from 'lucide-react'
import BillingClient from './BillingClient'

export default async function BillingPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener el plan actual del workspace
  const { data: workspaceMember } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle()

  let currentPlan = 'free'
  
  if (workspaceMember) {
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id, plan')
      .eq('id', workspaceMember.workspace_id)
      .maybeSingle()
    
    currentPlan = workspace?.plan || 'free'
  }

  // Obtener transferencias enviadas por el usuario
  const { data: transfersData } = await supabase
    .from('bank_transfers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const transfers = transfersData || []

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-gray-900" />
            Suscripción, Pagos y Facturación
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Gestiona tu plan, consulta los métodos de pago disponibles (Transferencia BAC / Tarjeta) y accede a todas las funciones PRO de OmniTag.
          </p>
        </div>

        <BillingClient 
          currentPlan={currentPlan}
          userEmail={user.email || ''}
          transfers={transfers}
        />
      </div>
    </div>
  )
}
