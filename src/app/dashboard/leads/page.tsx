import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import LeadsClient, { Lead } from './LeadsClient'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar vCard del usuario
  const { data: vcard } = await supabase
    .from('vcards')
    .select('id, lead_capture_enabled')
    .eq('user_id', user?.id)
    .maybeSingle()

  let leads: Lead[] = []
  if (vcard) {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('vcard_id', vcard.id)
      .order('created_at', { ascending: false })
    
    leads = (data as Lead[]) || []
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            Contactos y Prospectos (CRM)
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Personas que intercambiaron sus datos contigo a través de tu vCard. Puedes contactarlas por WhatsApp o guardarlas en la agenda de tu teléfono con un toque.
          </p>
        </div>

        {!vcard?.lead_capture_enabled && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm">
            <strong>Consejo:</strong> Tienes desactivado el modo de captura de leads. Ve a la sección de vCard para activarlo y permitir que los visitantes te dejen sus datos.
          </div>
        )}

        <LeadsClient leads={leads} />
      </div>
    </div>
  )
}
