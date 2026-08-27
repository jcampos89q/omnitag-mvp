import { createClient } from '@/lib/supabase/server'
import { Users, Gift, UserCircle } from 'lucide-react'
import LeadsClient, { Lead } from './LeadsClient'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Buscar vCards del usuario
  const { data: vcards } = await supabase
    .from('vcards')
    .select('id, slug, lead_capture_enabled')
    .eq('user_id', user?.id)

  const vcardIds = vcards?.map(v => v.id) || []

  // 2. Buscar programas de fidelización del usuario
  const { data: loyaltyPrograms } = await supabase
    .from('loyalty_programs')
    .select('id, name, slug')
    .eq('user_id', user?.id)

  const loyaltyIds = loyaltyPrograms?.map(l => l.id) || []

  // 3. Obtener leads de vCards y miembros de fidelización en paralelo
  const [
    { data: vcardLeadsData },
    { data: loyaltyMembersData }
  ] = await Promise.all([
    vcardIds.length > 0 
      ? supabase.from('leads').select('*').in('vcard_id', vcardIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    loyaltyIds.length > 0
      ? supabase.from('loyalty_members').select('*').in('program_id', loyaltyIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] })
  ])

  // Formatear leads de vCards
  const vcardLeads: Lead[] = (vcardLeadsData || []).map(l => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    created_at: l.created_at,
    vcard_id: l.vcard_id,
    source: 'vcard'
  }))

  // Formatear miembros del club de fidelización
  const loyaltyLeads: Lead[] = (loyaltyMembersData || []).map(m => ({
    id: m.id,
    name: m.customer_name,
    email: null,
    phone: m.customer_phone,
    created_at: m.created_at,
    vcard_id: m.program_id,
    source: 'loyalty',
    loyaltyStamps: m.current_stamps
  }))

  // Unificar todos los contactos ordenados por fecha
  const allLeads: Lead[] = [...vcardLeads, ...loyaltyLeads].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const hasLeadCaptureDisabled = vcards?.some(v => !v.lead_capture_enabled) && vcards?.length > 0

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            Contactos y Clientes (CRM)
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Personas que intercambiaron sus datos en tu <b>vCard digital</b> o se registraron en tu <b>Tarjeta de Fidelización & Sellos</b>. Puedes contactarlas por WhatsApp o guardarlas en la agenda de tu móvil con un toque.
          </p>
        </div>

        <LeadsClient leads={allLeads} />
      </div>
    </div>
  )
}
