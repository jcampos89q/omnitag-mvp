export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VCardForm from './VCardForm'
import { getUserPlanInfo } from '@/lib/plans'

export default async function VCardBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  if (!user) {
    redirect('/login')
  }

  // 1. Obtener estado del plan
  const { isPro } = await getUserPlanInfo(supabase, user.id)

  // 2. Obtener la vCard actual de forma segura con maybeSingle
  const { data: vcard } = await supabase
    .from('vcards')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Configurar mi Perfil Digital (vCard)</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Personaliza tu tarjeta digital para uso <b>Profesional</b> o de <b>Empresa</b>, y elige tu tema y colores favoritos.
          </p>
          
          {params?.success && (
            <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-sm flex items-center gap-2">
              <span>✅</span>
              <span>¡Tus datos, tema y diseño se han guardado correctamente!</span>
            </div>
          )}

          {params?.error && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm">
              <strong>Error:</strong> {params.error}
            </div>
          )}

          {vcard && (
            <div className="mt-4 p-4 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  Tu vCard está activa
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Enlace público: <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded font-bold">/v/{vcard.slug}</span>
                </p>
              </div>
              <a 
                href={`/v/${vcard.slug}`} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs sm:text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-xs whitespace-nowrap"
              >
                Ver Mi Perfil Público &rarr;
              </a>
            </div>
          )}
        </div>

        {/* Formulario Principal interactivo */}
        <VCardForm vcard={vcard} isPro={isPro} />
      </div>
    </div>
  )
}
