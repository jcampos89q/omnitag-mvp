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
    .select('industry')
    .eq('id', user.id)
    .single()

  const currentIndustry = profile?.industry || 'general'

  async function updateIndustry(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const industry = formData.get('industry') as string

    await supabase
      .from('users')
      .update({ industry })
      .eq('id', user.id)

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Configuración de Cuenta</h1>
        <p className="text-sm text-gray-500 mt-1">
          Personaliza tu experiencia en OmniTag seleccionando tu tipo de negocio.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Perfil del Negocio</h2>
        
        <form action={updateIndustry} className="space-y-4">
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
              Sector / Industria
            </label>
            <select
              id="industry"
              name="industry"
              defaultValue={currentIndustry}
              className="w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none border"
            >
              <option value="general">General (Restaurantes, Tiendas, Profesionales)</option>
              <option value="health">Salud y Clínicas (CRM Médico, Fichas de Pacientes)</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Seleccionar "Salud y Clínicas" habilitará el módulo de Fichas Médicas y ocultará herramientas no relacionadas como los Menús QR.
            </p>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition"
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  )
}
