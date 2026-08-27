import { createClient } from '@/lib/supabase/server'
import { Star, ShieldCheck, QrCode } from 'lucide-react'
import DevicesManager from './DevicesManager'

export default async function DevicesPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string, error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { success, error } = await searchParams

  // 1. Obtener placas del usuario
  const { data: devices } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  // 2. Obtener vCard, Menú y Fidelización para vinculación rápida
  const [
    { data: vcard },
    { data: menu },
    { data: loyalty }
  ] = await Promise.all([
    supabase.from('vcards').select('id, slug, first_name, company_name').eq('user_id', user?.id).maybeSingle(),
    supabase.from('menus').select('id, slug, name').eq('user_id', user?.id).maybeSingle(),
    supabase.from('loyalty_programs').select('id, slug, name').eq('user_id', user?.id).maybeSingle()
  ])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Escudo de Reputación Online
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            Reseñas de Google & Placas Tap-to-Rate
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Configura el destino de tus placas físicas NFC y códigos de mostrador con <b>Escudo Anti-Quejas inteligente</b>. Las calificaciones de 5 estrellas van directo a Google Maps y las quejas se capturan en tu buzón privado.
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-sm font-semibold flex items-center gap-2">
            <span>✅ ¡Placa / Enlace configurado correctamente!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm font-semibold flex items-center gap-2">
            <span>❌ Hubo un error al guardar. Verifica la URL de destino e intenta de nuevo.</span>
          </div>
        )}

        <DevicesManager 
          devices={devices || []}
          vcard={vcard}
          menu={menu}
          loyalty={loyalty}
        />
      </div>
    </div>
  )
}
