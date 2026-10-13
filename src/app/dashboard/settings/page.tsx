import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CurrencySettingsForm from './CurrencySettingsForm'
import IndustrySettingsForm from './IndustrySettingsForm'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('industry, account_type, currency, currency_symbol')
    .eq('id', user.id)
    .single()

  const currentIndustry = profile?.industry || 'general'
  const currentAccountType = profile?.account_type || 'professional'
  const currencyCode = profile?.currency || 'HNL'
  const currencySymbol = profile?.currency_symbol || 'L.'

  const accountTypeLabels: Record<string, string> = {
    'business': 'Negocio / Empresa',
    'professional': 'Profesional / Marca Personal',
    'review_plate': 'Placa de Reseñas (Exclusivo)'
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Configuración de Cuenta</h1>
        <p className="text-sm text-gray-500 mt-1">
          Personaliza tu giro de negocio, moneda del sistema y perfil comercial.
        </p>
      </div>

      {/* Selector de Giro de Negocio / Industria */}
      <IndustrySettingsForm initialIndustry={currentIndustry} />

      {/* Selector de Moneda Predeterminada */}
      <CurrencySettingsForm 
        initialCurrencyCode={currencyCode}
        initialCurrencySymbol={currencySymbol}
      />

      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Detalles de la Cuenta</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Tipo de Cuenta
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
