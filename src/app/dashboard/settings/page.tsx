import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import CurrencySettingsForm from './CurrencySettingsForm'
import IndustrySettingsForm from './IndustrySettingsForm'
import BusinessPaymentSettingsForm from './BusinessPaymentSettingsForm'
import CustomPublicBrandForm from './CustomPublicBrandForm'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'
import { normalizeIndustry } from '@/lib/industries'
import { resolveUserWhiteLabel } from '@/lib/whitelabel'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { user, isImpersonating, realAdmin } = await getEffectiveUser(supabase)

  if (!user) {
    redirect('/login')
  }

  const db = isImpersonating ? getAdminClient() : supabase

  const [{ data: profile }, { data: authTarget }, wlInfo] = await Promise.all([
    db
      .from('users')
      .select('industry, account_type, currency, currency_symbol, is_admin')
      .eq('id', user.id)
      .single(),
    getAdminClient().auth.admin.getUserById(user.id),
    resolveUserWhiteLabel(user.id, false)
  ])

  const currentIndustry = normalizeIndustry(profile?.industry)
  const currentAccountType = profile?.account_type || 'professional'
  const currencyCode = profile?.currency || 'HNL'
  const currencySymbol = profile?.currency_symbol || 'L.'
  const isAdmin = Boolean(profile?.is_admin || realAdmin)
  const isSubClient = wlInfo.isWhiteLabeledClient

  const targetMeta = authTarget?.user?.user_metadata || {}
  const lastIndustryChangedAt = (targetMeta.industry_changed_at as string) || null
  const businessPaymentConfig = targetMeta.business_payment_config || null
  const customPublicBrand = (targetMeta.custom_public_brand as string) || ''
  const inheritedBrand = wlInfo.activeBrand.brand_name || 'OmniTag'

  const accountTypeLabels: Record<string, string> = {
    'business': 'Negocio / Empresa Comercial',
    'professional': 'Profesional / Servicios B2B',
    'review_plate': 'Placa de Reseñas NFC'
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Configuración del Negocio y Cuenta</h1>
        <p className="text-sm text-gray-500 mt-1">
          Administra el giro oficial de tu negocio (protegido por períodos de 30 días), tu pasarela de cobro para clientes y la moneda del sistema.
        </p>
      </div>

      {/* 1. Panel de Giro del Negocio (Bloqueado con regla de 30 días y transición técnica) */}
      <IndustrySettingsForm 
        initialIndustry={currentIndustry} 
        lastChangedAt={lastIndustryChangedAt}
        isAdmin={isAdmin}
      />

      {/* 1B. Marca Propia en Herramientas Públicas (vCard, Menú, Citas, Sellos, Ruleta, Gift Cards) */}
      <CustomPublicBrandForm
        initialBrand={customPublicBrand}
        inheritedBrand={inheritedBrand}
      />

      {/* 2. Mi Pasarela y Métodos de Cobro Propios del Negocio (Solo para cuentas directas o negocios que cobran pedidos/citas) */}
      {!isSubClient && (
        <>
          <BusinessPaymentSettingsForm initialConfig={businessPaymentConfig} />
          <CurrencySettingsForm 
            initialCurrencyCode={currencyCode}
            initialCurrencySymbol={currencySymbol}
          />
        </>
      )}

      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Detalles Técnicos de la Cuenta</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Modalidad de Suscripción / Cuenta
            </label>
            <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs sm:text-sm text-gray-700 font-medium">
              {accountTypeLabels[currentAccountType] || currentAccountType}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
