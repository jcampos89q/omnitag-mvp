export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreditCard, ShieldCheck, ExternalLink, MessageCircle, Building2 } from 'lucide-react'
import BillingClient from './BillingClient'
import { getUserPlanInfo } from '@/lib/plans'
import { resolveUserWhiteLabel } from '@/lib/whitelabel'

export default async function BillingPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Obtener plan del usuario y estado de Marca Blanca (si pertenece a un Distribuidor)
  const [planInfo, { data: profile }, wlInfo] = await Promise.all([
    getUserPlanInfo(supabase, user.id),
    supabase.from('users').select('account_type, is_admin').eq('id', user.id).maybeSingle(),
    resolveUserWhiteLabel(user.id, false)
  ])

  const accountType = profile?.account_type || 'professional'

  // Si el usuario es sub-cliente de un Distribuidor Marca Blanca, mostrar la pasarela y datos del Distribuidor
  if (wlInfo.parentResellerId && !profile?.is_admin) {
    const brand = wlInfo.activeBrand
    const whatsappClean = (brand.support_whatsapp || '').replace(/\D/g, '')
    const whatsappLink = whatsappClean
      ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(`Hola ${brand.brand_name}, deseo renovar mi suscripción para la cuenta ${user.email}`)}`
      : null

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" /> Suscripción Gestionada por {brand.brand_name}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                Mi Plan y Renovación • {brand.brand_name}
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Activa o renueva tu membresía directamente con tu proveedor oficial ({brand.brand_name}).
              </p>
            </div>
            <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl text-right shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Estado Actual</p>
              <p className="text-sm font-black text-emerald-400">
                {planInfo.isExpired ? 'Plan Vencido' : `Activo (${planInfo.daysLeft} días restantes)`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Plan Mensual del Distribuidor */}
            <div className="border-2 border-indigo-600/20 bg-indigo-50/30 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">Suscripción Mensual</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900">${brand.price_monthly || '19'}</span>
                  <span className="text-xs font-bold text-gray-500">USD / mes</span>
                </div>
                <p className="text-xs text-gray-600">
                  Acceso completo a todas las herramientas configuradas para tu giro de negocio.
                </p>
              </div>

              {brand.checkout_monthly_url ? (
                <a
                  href={brand.checkout_monthly_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
                >
                  <span>Pagar Plan Mensual Online</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Solicitar Link Mensual por WhatsApp</span>
                </a>
              ) : null}
            </div>

            {/* Plan Anual del Distribuidor */}
            <div className="border-2 border-slate-900 bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">Suscripción Anual (Ahorro)</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">${brand.price_yearly || '190'}</span>
                  <span className="text-xs font-bold text-slate-300">USD / año</span>
                </div>
                <p className="text-xs text-slate-300">
                  12 meses de servicio continuo + soporte prioritario directo con {brand.brand_name}.
                </p>
              </div>

              {brand.checkout_yearly_url ? (
                <a
                  href={brand.checkout_yearly_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-slate-900 font-black text-sm flex items-center justify-center gap-2 transition"
                >
                  <span>Pagar Plan Anual Online</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-slate-900 font-black text-sm flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Solicitar Plan Anual por WhatsApp</span>
                </a>
              ) : null}
            </div>
          </div>

          {/* Datos Bancarios del Distribuidor si los configuró */}
          {brand.bank_name && brand.bank_account_number && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Pago por Transferencia Bancaria Directa a {brand.brand_name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-gray-200">
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Banco</p>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">{brand.bank_name}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200">
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Número de Cuenta</p>
                  <p className="font-mono font-bold text-gray-900 text-sm mt-0.5">{brand.bank_account_number}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200">
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Titular</p>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">
                    {brand.bank_account_holder || brand.brand_name}
                    {brand.bank_account_id_doc ? ` (${brand.bank_account_id_doc})` : ''}
                  </p>
                </div>
              </div>
              {whatsappLink && (
                <div className="pt-2">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar Comprobante por WhatsApp a {brand.brand_name}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

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
          userId={user.id}
          transfers={transfers}
          planInfo={planInfo}
          accountType={accountType}
        />
      </div>
    </div>
  )
}
