import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CurrencySettingsForm from './CurrencySettingsForm'
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

  const industryLabels: Record<string, string> = {
    'general': 'General (Restaurantes, Tiendas, etc.)',
    'health': 'Salud y Clínicas (Expediente Clínico ECE)',
    'lawyer': 'Abogados y Servicios Legales',
    'real_estate': 'Bienes Raíces',
    'beauty': 'Belleza y Spas'
  }

  const accountTypeLabels: Record<string, string> = {
    'business': 'Negocio / Empresa',
    'professional': 'Profesional / Marca Personal',
    'review_plate': 'Placa de Reseñas (Exclusivo)'
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Configuración de Cuenta</h1>
        <p className="text-sm text-gray-500 mt-1">
          Personaliza la moneda del sistema, precios y perfil de tu negocio.
        </p>
      </div>

      {/* Selector de Moneda Predeterminada */}
      <CurrencySettingsForm 
        initialCurrencyCode={currencyCode}
        initialCurrencySymbol={currencySymbol}
      />

      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Perfil del Negocio</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Tipo de Cuenta
            </label>
            <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs sm:text-sm text-gray-700 font-medium">
              {accountTypeLabels[currentAccountType] || currentAccountType}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Sector / Industria
            </label>
            <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs sm:text-sm text-gray-700 font-medium">
              {industryLabels[currentIndustry] || currentIndustry}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              El sector se define al crear la cuenta para adaptar las herramientas (ej. módulos médicos y ECE) a tu negocio.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
