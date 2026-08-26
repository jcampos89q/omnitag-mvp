import { createClient } from '@/lib/supabase/server'
import { MessageSquareWarning, Star } from 'lucide-react'

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
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquareWarning className="w-6 h-6 text-red-500" />
            Buzón de Quejas (Privado)
          </h1>
          <p className="text-gray-500 mt-1">
            Reseñas negativas de 1 a 3 estrellas interceptadas por el Filtro Inteligente antes de llegar a Google Maps.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {feedbacks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium">No tienes quejas registradas</p>
              <p className="text-sm mt-1">El filtro inteligente está activo, pero aún nadie ha dejado malas calificaciones.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                    <th className="px-6 py-4">Dispositivo</th>
                    <th className="px-6 py-4">Calificación</th>
                    <th className="px-6 py-4">Mensaje del Cliente</th>
                    <th className="px-6 py-4">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {feedbacks.map((fb: any) => (
                    <tr key={fb.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">{fb.devices?.tag_id}</td>
                      <td className="px-6 py-4 flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{fb.rating}/5</span>
                      </td>
                      <td className="px-6 py-4 text-gray-800 max-w-md">
                        {fb.message ? `"${fb.message}"` : <span className="text-gray-400 italic">Sin mensaje</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(fb.created_at).toLocaleDateString()} {new Date(fb.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
