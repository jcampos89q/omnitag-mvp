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

  // Obtener el plan actual del workspace
  const { data: workspaceMember } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  let currentPlan = 'free'
  
  if (workspaceMember) {
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id, plan')
      .eq('id', workspaceMember.workspace_id)
      .single()
    
    currentPlan = workspace?.plan || 'free'

    // [MVP ONLY] Mocking success to upgrade local db without real webhooks
    if (resolvedSearchParams?.mock_success === 'true' && currentPlan === 'free' && workspace) {
      await supabase
        .from('workspaces')
        .update({ plan: 'pro' })
        .eq('id', workspace.id)
      
      currentPlan = 'pro'
    }
  }

  return (
    <div className="space-y-8">
      {resolvedSearchParams?.mock_success === 'true' && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center justify-between">
          <span>🎉 <b>¡Pago simulado exitoso!</b> Tu cuenta ha sido actualizada a PRO. (Esto es un mock local porque no hay claves de Stripe).</span>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-gray-900" />
            Suscripción y Facturación
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona tu plan y accede a todas las funciones PRO de OmniTag.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Plan Actual</p>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentPlan === 'free' ? 'Plan Gratuito (MVP)' : 'Plan PRO'}
            </h2>
          </div>
          {currentPlan === 'pro' && (
            <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Activo
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-2xl p-8 bg-white relative">
            <h3 className="text-xl font-bold text-gray-900">Básico</h3>
            <p className="text-gray-500 text-sm mt-2 mb-6">Para empezar a digitalizarte.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-gray-900">$0</span>
              <span className="text-gray-500"> /mes</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-gray-600"><Check className="w-5 h-5 text-gray-400" /> 1 vCard Básica</li>
              <li className="flex items-center gap-3 text-gray-600"><Check className="w-5 h-5 text-gray-400" /> 1 Menú Digital (10 items)</li>
              <li className="flex items-center gap-3 text-gray-600"><Check className="w-5 h-5 text-gray-400" /> 1 Enlace Tap-to-Rate</li>
            </ul>

            <button 
              disabled={currentPlan === 'free'}
              className="w-full py-3 rounded-xl font-bold transition-colors border-2 border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-50 disabled:bg-gray-50 disabled:border-gray-100"
            >
              {currentPlan === 'free' ? 'Plan Actual' : 'Cambiar al Básico'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-black rounded-2xl p-8 bg-white relative shadow-xl transform md:-translate-y-2">
            <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
              RECOMENDADO
            </div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" /> PRO
            </h3>
            <p className="text-gray-500 text-sm mt-2 mb-6">El ecosistema completo para vender más.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-gray-900">$29</span>
              <span className="text-gray-500"> /mes</span>
            </div>
            
            <ul className="space-y-3 mb-8 font-medium">
              <li className="flex items-center gap-3 text-gray-900"><Check className="w-5 h-5 text-black" /> vCards, Menús y QRs <b>Ilimitados</b></li>
              <li className="flex items-center gap-3 text-gray-900"><Check className="w-5 h-5 text-black" /> Captura de Leads (CRM)</li>
              <li className="flex items-center gap-3 text-gray-900"><Check className="w-5 h-5 text-black" /> Filtro Inteligente Anti-Quejas</li>
              <li className="flex items-center gap-3 text-gray-900"><Check className="w-5 h-5 text-black" /> Pedidos por WhatsApp y Upselling</li>
              <li className="flex items-center gap-3 text-gray-900"><Check className="w-5 h-5 text-black" /> Estadísticas Avanzadas</li>
            </ul>

            {currentPlan === 'pro' ? (
              <button disabled className="w-full bg-gray-100 text-gray-500 font-bold py-3 rounded-xl border border-gray-200">
                Plan Actual Activo
              </button>
            ) : (
              <form action="/api/stripe/checkout" method="POST">
                <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition shadow-md flex items-center justify-center gap-2">
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
