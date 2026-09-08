export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreditCard } from 'lucide-react'
import BillingClient from './BillingClient'
import { getUserPlanInfo } from '@/lib/plans'

export default async function BillingPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Obtener plan del usuario (Admins siempre son PRO, incluye prueba gratis y descuento)
  const planInfo = await getUserPlanInfo(supabase, user.id)

  // 2. Obtener transferencias enviadas por el usuario
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
            Suscripción y Pagos por Depósito Bancario
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Gestiona tu plan, consulta los datos bancarios para depósito o transferencia BAC y notifica tu pago para activar tu Plan PRO de OmniTag.
          </p>
        </div>

        <BillingClient 
          currentPlan={planInfo.plan}
          userEmail={user.email || ''}
          transfers={transfers}
          planInfo={planInfo}
        />
      </div>
    </div>
  )
}
