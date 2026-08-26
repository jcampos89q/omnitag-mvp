import { createClient } from '@/lib/supabase/server'
import { CreditCard, Check, Zap, Sparkles } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function BillingPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const resolvedSearchParams = await searchParams

  if (!user) redirect('/login')

  // Obtener el plan actual del workspace de forma segura con maybeSingle
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

    if (resolvedSearchParams?.mock_success === 'true' && currentPlan === 'free' && workspace) {
      await supabase
        .from('workspaces')
        .update({ plan: 'pro' })
        .eq('id', workspace.id)
      
      currentPlan = 'pro'
    }
  }

  return (
    <div className="space-y-6">
      {resolvedSearchParams?.mock_success === 'true' && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl flex items-center justify-between text-sm">
          <span>🎉 <b>¡Pago simulado exitoso!</b> Tu cuenta ha sido actualizada a PRO.</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-gray-900" />
            Suscripción y Facturación
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Gestiona tu plan y accede a todas las funciones PRO de OmniTag.
          </p>
        </div>

        <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Plan Actual</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {currentPlan === 'free' ? 'Plan Gratuito (MVP)' : 'Plan PRO'}
            </h2>
          </div>
          {currentPlan === 'pro' && (
            <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" /> Suscripción Activa
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-2xl p-6 sm:p-8 bg-white relative flex flex-col justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Básico</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 mb-4">Para empezar a digitalizarte.</p>
              <div className="mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-gray-500 text-sm"> /mes</span>
              </div>
              
              <ul className="space-y-2.5 mb-6 text-sm">
                <li className="flex items-center gap-2.5 text-gray-600"><Check className="w-4 h-4 text-gray-400 shrink-0" /> 1 vCard Básica</li>
                <li className="flex items-center gap-2.5 text-gray-600"><Check className="w-4 h-4 text-gray-400 shrink-0" /> 1 Menú Digital (10 items)</li>
                <li className="flex items-center gap-2.5 text-gray-600"><Check className="w-4 h-4 text-gray-400 shrink-0" /> 1 Enlace Tap-to-Rate</li>
              </ul>
            </div>

            <button 
              disabled={currentPlan === 'free'}
              className="w-full py-3 rounded-xl font-bold text-sm transition-colors border-2 border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-50 disabled:bg-gray-50"
            >
              {currentPlan === 'free' ? 'Plan Actual' : 'Cambiar al Básico'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-black rounded-2xl p-6 sm:p-8 bg-white relative shadow-xl transform md:-translate-y-2 flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-black text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
              RECOMENDADO
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" /> PRO
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 mb-4">El ecosistema completo para vender más.</p>
              <div className="mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">$29</span>
                <span className="text-gray-500 text-sm"> /mes</span>
              </div>
              
              <ul className="space-y-2.5 mb-6 text-sm font-medium">
                <li className="flex items-center gap-2.5 text-gray-900"><Check className="w-4 h-4 text-black shrink-0" /> vCards, Menús y QRs <b>Ilimitados</b></li>
                <li className="flex items-center gap-2.5 text-gray-900"><Check className="w-4 h-4 text-black shrink-0" /> Captura de Leads (CRM)</li>
                <li className="flex items-center gap-2.5 text-gray-900"><Check className="w-4 h-4 text-black shrink-0" /> Filtro Inteligente Anti-Quejas</li>
                <li className="flex items-center gap-2.5 text-gray-900"><Check className="w-4 h-4 text-black shrink-0" /> Pedidos por WhatsApp</li>
                <li className="flex items-center gap-2.5 text-gray-900"><Check className="w-4 h-4 text-black shrink-0" /> Estadísticas Avanzadas</li>
              </ul>
            </div>

            {currentPlan === 'pro' ? (
              <button disabled className="w-full bg-gray-100 text-gray-500 font-bold py-3 rounded-xl border border-gray-200 text-sm">
                Plan Actual Activo
              </button>
            ) : (
              <form action="/api/stripe/checkout" method="POST">
                <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer">
                  Mejorar a PRO
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
