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
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            Contactos Recolectados (CRM)
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Personas que dejaron sus datos a través de tu vCard pública.
          </p>
        </div>

        {!vcard?.lead_capture_enabled && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-xs sm:text-sm">
            <strong>Atención:</strong> Tienes desactivado el "Modo Captura de Leads". Ve a la sección de vCard para activarlo si deseas recolectar contactos.
          </div>
        )}

        {leads.length === 0 ? (
          <div className="p-12 text-center text-gray-500 border border-gray-100 rounded-2xl bg-gray-50/50">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-800">Aún no tienes contactos recolectados</p>
            <p className="text-xs sm:text-sm mt-1">Comparte tu vCard para que los visitantes toquen "Intercambiar Contacto".</p>
          </div>
        ) : (
          <>
            {/* Vista Móvil (Tarjetas táctiles para pantallas pequeñas) */}
            <div className="block md:hidden space-y-3">
              {leads.map((lead) => (
                <div key={lead.id} className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-base">{lead.name}</h3>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 pt-1 text-xs">
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                        <Mail className="w-4 h-4 text-gray-400" /> {lead.email}
                      </a>
                    )}
                    {lead.phone && (
                      <a href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`} target="_blank" className="flex items-center gap-2 text-emerald-700 font-medium">
                        <Phone className="w-4 h-4 text-emerald-600" /> {lead.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Vista Escritorio (Tabla tradicional) */}
            <div className="hidden md:block border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                    <th className="px-6 py-3.5">Nombre</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Teléfono</th>
                    <th className="px-6 py-3.5">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{lead.name}</td>
                      <td className="px-6 py-4">
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm">
                            <Mail className="w-4 h-4" /> {lead.email}
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {lead.phone ? (
                          <a href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`} target="_blank" className="flex items-center gap-2 text-gray-600 hover:text-green-600 text-sm">
                            <Phone className="w-4 h-4" /> {lead.phone}
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
