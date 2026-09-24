export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { QrCode, CreditCard } from 'lucide-react'
import VCardForm from './VCardForm'
import { getUserPlanInfo } from '@/lib/plans'
import FriendlyErrorAlert from '@/components/FriendlyErrorAlert'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'
import ProFeaturePaywall from '@/components/ProFeaturePaywall'

export default async function VCardBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)
  const params = await searchParams

  if (!user) {
    redirect('/login')
  }

  // 1. Obtener estado del plan y hardware vinculado
  const planInfo = await getUserPlanInfo(supabase, user.id)
  const { isPro, hasNfcCard, nfcCardToken } = planInfo

  if (!planInfo.canAccessVCard) {
    return (
      <ProFeaturePaywall 
        featureName="Perfil Digital vCard"
        featureDescription="Tu cuenta tiene configurada una Placa de Reseñas NFC. Para habilitar un Perfil Digital vCard, adquiere una Tarjeta NFC o activa la Suscripción PRO Mensual."
        hardwareType={planInfo.hardwareType}
      />
    )
  }

  // 2. Obtener la vCard y el tipo de cuenta
  const [{ data: vcard }, { data: profile }] = await Promise.all([
    supabase.from('vcards').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('users').select('account_type').eq('id', user.id).maybeSingle()
  ])
  
  const accountType = profile?.account_type || 'professional'

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
            <div className="mt-4">
              <FriendlyErrorAlert error={params.error} />
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
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <Link
                  href="/dashboard/qr-studio"
                  className="text-xs font-extrabold bg-white text-gray-800 border border-gray-300 px-3.5 py-2 rounded-lg hover:bg-gray-100 transition shadow-2xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <QrCode className="w-4 h-4 text-purple-600" />
                  <span>Personalizar & Descargar QR (HD)</span>
                </Link>
                <a 
                  href={`/v/${vcard.slug}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs font-extrabold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-xs whitespace-nowrap cursor-pointer"
                >
                  Ver Mi Perfil Público &rarr;
                </a>
              </div>
            </div>
          )}

          {/* Banner de Tarjeta NFC: Si ya la tiene vinculada, mostrar estado activo; si no la tiene, invitar a pedirla */}
          {hasNfcCard ? (
            <div className="mt-4 p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-emerald-500/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm text-white">Tarjeta Inteligente NFC Vinculada</h3>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                      ✓ ACTIVA Y PROGRAMADA
                    </span>
                    {nfcCardToken && (
                      <span className="font-mono text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded">
                        {nfcCardToken}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 mt-1 max-w-xl leading-relaxed">
                    Tu credencial física NFC está configurada con tu vCard. Cualquier cambio que guardes aquí se actualizará de inmediato al acercar la tarjeta a cualquier teléfono celular.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Link
                  href="/dashboard/qr-studio"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition border border-white/15 flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
                >
                  <QrCode className="w-3.5 h-3.5 text-purple-400" />
                  <span>Código QR HD</span>
                </Link>
              </div>
            </div>
          ) : accountType !== 'review_plate' ? (
            <div className="mt-4 p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950 text-white rounded-2xl border border-purple-900/40 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">¿Deseas tu Tarjeta Inteligente NFC Física?</h3>
                    <span className="bg-purple-500/30 text-purple-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-500/40">
                      L. 1,200 HNL
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1 max-w-xl leading-relaxed">
                    Lleva tu credencial de bolsillo en acabado <b>Matte Black</b> con chip NFC universal y código QR HD vinculado a tu vCard. <b>Incluye 1 año completo de suscripción PRO</b> y envío a toda Honduras.
                  </p>
                </div>
              </div>

              <Link
                href="/tienda"
                className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pedir Tarjeta NFC (L. 1,200)</span>
              </Link>
            </div>
          ) : null}
        </div>

        {/* Formulario Principal interactivo */}
        <VCardForm vcard={vcard} isPro={isPro} accountType={accountType} />
      </div>
    </div>
  )
}
