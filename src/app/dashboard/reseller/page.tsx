export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'
import { resolveUserWhiteLabel } from '@/lib/whitelabel'
import ResellerDashboardClient, { SubClientItem, DistributorSummaryItem } from './ResellerDashboardClient'

export default async function ResellerPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const params = await searchParams
  const requestedView = params?.view === 'master' ? 'master' : 'agency'

  const supabase = await createClient()
  const { user: effectiveUser, realAdmin, isImpersonating } = await getEffectiveUser(supabase)

  if (!effectiveUser) {
    redirect('/login')
  }

  const realUserId = realAdmin?.id || effectiveUser.id
  const { data: realProfile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', realUserId)
    .maybeSingle()

  const isAdmin = Boolean(realProfile?.is_admin) && !isImpersonating
  const wlInfo = await resolveUserWhiteLabel(effectiveUser.id, isAdmin)

  // Si el usuario NO es Distribuidor ni Super Admin, mostrar página de venta de la Licencia Partner Marca Blanca
  if (!wlInfo.isReseller && !isAdmin) {
    const buildOfferUrl = (offCode: string) => {
      return `https://pay.hotmart.com/F108380682J?checkoutMode=2&off=${offCode}&email=${encodeURIComponent(effectiveUser.email || '')}&sck=${encodeURIComponent(effectiveUser.id)}`
    }
    const starterResellerUrl = buildOfferUrl('7p2sbzur')
    const hotmartResellerUrl = buildOfferUrl('ozwefg5c')
    const countryResellerUrl = buildOfferUrl('50u8dbyw')

    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-indigo-500/30 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-extrabold uppercase tracking-wider">
            <Building2 className="w-4 h-4" /> Programa Partner & Marca Blanca
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Conviértete en Distribuidor Oficial con tu Propia Marca Blanca
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Vende suscripciones de menús digitales, agendas médicas/barberías, tarjetas NFC y placas de reseñas Google bajo <strong>tu propio nombre comercial y tu propio logo</strong>, cobrándole directamente a tus clientes con tu pasarela.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              'Reemplaza el logo y nombre por el de tu Agencia en todo el panel',
              'Link de registro propio (/register?partner=tu-id) con tu marca',
              'Conecta tu propio Hotmart, Stripe, Tilopay o cuenta bancaria',
              'Crea y administra sub-clientes eligiendo su giro de negocio',
              'Tus clientes nunca ven la marca OmniTag ni nuestros precios',
              'Conserva el 100% de lo que cobres a tus sub-clientes',
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-200 font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href={starterResellerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white transition"
            >
              <span className="text-[10px] uppercase font-bold text-indigo-200">Starter Partner</span>
              <span className="text-lg font-black mt-0.5">$49/mes • 10 Cuentas</span>
            </a>
            <a
              href={hotmartResellerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col items-center justify-center p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 text-white transition shadow-lg"
            >
              <span className="text-[10px] uppercase font-extrabold text-amber-300">⭐ Más Popular • Agency</span>
              <span className="text-lg font-black mt-0.5">$99/mes • 25 Cuentas</span>
            </a>
            <a
              href={countryResellerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white transition"
            >
              <span className="text-[10px] uppercase font-bold text-emerald-300">Country Partner</span>
              <span className="text-lg font-black mt-0.5">$199/mes • 100 Cuentas</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Obtener lista de usuarios desde Auth y public.users para armar sub-clientes y distribuidores
  const adminClient = getAdminClient()
  const [{ data: authList }, { data: publicUsers }] = await Promise.all([
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
    adminClient
      .from('users')
      .select('id, email, full_name, industry, subscription_expires_at, trial_expires_at, created_at')
      .order('created_at', { ascending: false }),
  ])

  const publicMap = new Map((publicUsers || []).map(u => [u.id, u]))
  const allAuthUsers = authList?.users || []

  // 1. Sub-clientes que pertenecen a este Distribuidor
  const subClients: SubClientItem[] = []
  for (const au of allAuthUsers) {
    const meta = au.user_metadata || {}
    if (meta.parent_reseller_id === effectiveUser.id) {
      const pub = publicMap.get(au.id)
      subClients.push({
        id: au.id,
        email: au.email || pub?.email || '',
        full_name: pub?.full_name || meta.full_name || 'Cliente',
        industry: pub?.industry || meta.industry || 'professional',
        subscription_expires_at: pub?.subscription_expires_at || pub?.trial_expires_at || null,
        created_at: au.created_at,
        parent_reseller_id: meta.parent_reseller_id,
      })
    }
  }

  // 2. Si es Super Admin de OmniTag, armar también el listado de todos los Distribuidores Marca Blanca (incluida su propia cuenta de Agencia como un suscriptor más)
  const allDistributors: DistributorSummaryItem[] = []
  if (isAdmin) {
    const countByReseller = new Map<string, number>()
    for (const au of allAuthUsers) {
      const pid = au.user_metadata?.parent_reseller_id
      if (pid) {
        countByReseller.set(pid, (countByReseller.get(pid) || 0) + 1)
      }
    }

    for (const au of allAuthUsers) {
      const meta = au.user_metadata || {}
      const isSelfAgency = au.id === effectiveUser.id
      if (meta.is_reseller || isSelfAgency) {
        const pub = publicMap.get(au.id)
        const wlCfg = meta.white_label_config || {}
        const exp = meta.reseller_expires_at || pub?.subscription_expires_at || null
        const isActive = !exp || new Date(exp) > new Date()

        allDistributors.push({
          id: au.id,
          email: au.email || pub?.email || '',
          full_name: pub?.full_name || meta.full_name || (isSelfAgency ? 'Mi Agencia Propia' : 'Distribuidor'),
          brand_name: wlCfg.brand_name || (isSelfAgency ? 'Mi Agencia (Sin nombre aún)' : 'Sin configurar aún'),
          logo_url: wlCfg.logo_url || '',
          quota: Number(meta.reseller_quota || 25),
          used_clients: countByReseller.get(au.id) || 0,
          expires_at: exp,
          is_active: isActive,
          is_owner_agency: isSelfAgency,
        })
      }
    }

    // Ordenar para que tu propia cuenta de Agencia aparezca de primera en la tabla de suscriptores
    allDistributors.sort((a, b) => (b.is_owner_agency ? 1 : 0) - (a.is_owner_agency ? 1 : 0))
  }

  return (
    <ResellerDashboardClient
      resellerId={effectiveUser.id}
      resellerEmail={effectiveUser.email || ''}
      isAdmin={isAdmin}
      viewMode={isAdmin && requestedView === 'master' ? 'master' : 'agency'}
      isResellerActive={wlInfo.isResellerActive}
      quota={wlInfo.resellerQuota}
      expiresAt={wlInfo.resellerExpiresAt}
      initialBrandConfig={wlInfo.ownBrandConfig}
      subClients={subClients}
      allDistributors={allDistributors}
    />
  )
}
