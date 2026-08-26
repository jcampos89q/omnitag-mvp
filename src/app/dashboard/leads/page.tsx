import { createClient } from '@/lib/supabase/server'
import { Users, Mail, Phone, Calendar } from 'lucide-react'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Find user's vcard id
  const { data: vcard } = await supabase
    .from('vcards')
    .select('id, lead_capture_enabled')
    .eq('user_id', user?.id)
    .single()

  let leads = []
  if (vcard) {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('vcard_id', vcard.id)
      .order('created_at', { ascending: false })
    
    leads = data || []
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            Contactos Recolectados (CRM)
          </h1>
          <p className="text-gray-500 mt-1">Lista de personas que dejaron sus datos a través de tu vCard pública.</p>
        </div>

        {!vcard?.lead_capture_enabled && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm">
            <strong>Atención:</strong> Actualmente tienes desactivado el "Modo Captura de Leads". Ve a la sección de vCard para activarlo si deseas recolectar contactos.
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {leads.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium">Aún no tienes contactos recolectados</p>
              <p className="text-sm mt-1">Comparte tu vCard y pídele a las personas que toquen "Intercambiar Contacto".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Teléfono</th>
                    <th className="px-6 py-4">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{lead.name}</td>
                      <td className="px-6 py-4">
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                            <Mail className="w-4 h-4" /> {lead.email}
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {lead.phone ? (
                          <a href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`} target="_blank" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
                            <Phone className="w-4 h-4" /> {lead.phone}
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
