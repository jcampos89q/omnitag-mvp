import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('industry, account_type')
    .eq('id', user.id)
    .single()

  const currentIndustry = profile?.industry || 'general'
  const currentAccountType = profile?.account_type || 'professional'

  const industryLabels: Record<string, string> = {
    'general': 'General (Restaurantes, Tiendas, etc.)',
    'health': 'Salud y Clínicas',
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
          Información básica de tu perfil en OmniTag.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Perfil del Negocio</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Cuenta
            </label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-600">
              {accountTypeLabels[currentAccountType] || currentAccountType}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sector / Industria
            </label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-600">
              {industryLabels[currentIndustry] || currentIndustry}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              El sector se define al crear la cuenta para adaptar las herramientas (ej. módulos médicos) a tu negocio.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
