import { createClient } from '@/lib/supabase/server'
import { MessageSquareWarning, Star, Calendar } from 'lucide-react'

export default async function FeedbackPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar dispositivos del usuario
  const { data: devices } = await supabase
    .from('devices')
    .select('id, tag_id')
    .eq('user_id', user?.id)

  const deviceIds = devices?.map(d => d.id) || []

  let feedbacks = []
  if (deviceIds.length > 0) {
    const { data } = await supabase
      .from('private_feedbacks')
      .select('*, devices(tag_id)')
      .in('device_id', deviceIds)
      .order('created_at', { ascending: false })
    
    feedbacks = data || []
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <MessageSquareWarning className="w-6 h-6 text-red-500" />
            Buzón de Quejas (Privado)
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Reseñas negativas de 1 a 3 estrellas interceptadas por el Filtro Inteligente antes de llegar a Google Maps.
          </p>
        </div>

        {feedbacks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 border border-gray-100 rounded-2xl bg-gray-50/50">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-800">No tienes quejas registradas</p>
            <p className="text-xs sm:text-sm mt-1">El filtro inteligente está activo, pero aún nadie ha dejado malas calificaciones.</p>
          </div>
        ) : (
          <>
            {/* Vista Móvil (Tarjetas para teléfonos) */}
            <div className="block md:hidden space-y-3">
              {feedbacks.map((fb: any) => (
                <div key={fb.id} className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                      ID: {fb.devices?.tag_id}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-sm text-gray-900">{fb.rating}/5</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-800 italic bg-white p-3 rounded-lg border border-gray-100">
                    {fb.message ? `"${fb.message}"` : <span className="text-gray-400">Sin mensaje adicional</span>}
                  </p>

                  <div className="text-[11px] text-gray-400 flex items-center justify-end gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(fb.created_at).toLocaleDateString()} {new Date(fb.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>

            {/* Vista Escritorio (Tabla tradicional) */}
            <div className="hidden md:block border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                    <th className="px-6 py-3.5">Dispositivo</th>
                    <th className="px-6 py-3.5">Calificación</th>
                    <th className="px-6 py-3.5">Mensaje del Cliente</th>
                    <th className="px-6 py-3.5">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {feedbacks.map((fb: any) => (
                    <tr key={fb.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">{fb.devices?.tag_id}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-bold text-sm text-gray-900">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {fb.rating}/5
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-800 text-sm max-w-md">
                        {fb.message ? `"${fb.message}"` : <span className="text-gray-400 italic">Sin mensaje</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(fb.created_at).toLocaleDateString()} {new Date(fb.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
