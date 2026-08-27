import { createClient } from '@/lib/supabase/server'
import { MessageSquareWarning, Star, Calendar, Phone, Mail, MessageCircle, CheckCircle2, Building2 } from 'lucide-react'

export default async function FeedbackPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar dispositivos del usuario
  const { data: devices } = await supabase
    .from('devices')
    .select('id, tag_id')
    .eq('user_id', user?.id)

  const deviceIds = devices?.map(d => d.id) || []

  let feedbacks: any[] = []
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold mb-2">
            <MessageSquareWarning className="w-3.5 h-3.5" /> Libro Digital de Quejas y Sugerencias
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            Buzón Privado de Quejas y Reclamos
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Reseñas negativas (1 a 3 estrellas) interceptadas por tu <b>Escudo Anti-Quejas</b> antes de que pudieran publicarse en Google Maps. Úsalas para contactar al cliente, solucionar su inconformidad y convertirlo en un cliente fiel.
          </p>
        </div>

        {feedbacks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 border border-gray-100 rounded-2xl bg-gray-50/50">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-gray-800 text-base">¡Excelente! No tienes quejas pendientes</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Tu escudo de Google Reviews está activo. Cualquier calificación baja será capturada aquí en privado.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map((fb) => {
                const cleanPhone = fb.customer_phone ? fb.customer_phone.replace(/\D/g, '') : null

                return (
                  <div key={fb.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between hover:border-gray-300 transition space-y-3">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-extrabold text-xs text-gray-900">{fb.rating} / 5 Estrellas</span>
                        </div>

                        <span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                          Placa: {fb.devices?.tag_id}
                        </span>
                      </div>

                      {/* Mensaje de la Queja */}
                      <div className="bg-red-50/60 p-3.5 rounded-xl border border-red-100 text-xs sm:text-sm text-red-950 font-medium leading-relaxed">
                        {fb.message ? `"${fb.message}"` : <span className="text-gray-400 italic">El cliente no especificó un texto.</span>}
                      </div>

                      {/* Datos del Cliente */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                        <p className="font-bold text-gray-900">
                          Cliente: {fb.customer_name || 'Anónimo'}
                        </p>
                        {fb.customer_phone && (
                          <p className="text-gray-700 font-mono flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" /> {fb.customer_phone}
                          </p>
                        )}
                        {fb.customer_email && (
                          <p className="text-gray-600 flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-gray-400" /> {fb.customer_email}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 pt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(fb.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Acciones para resolver */}
                    {cleanPhone && (
                      <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${fb.customer_name || ''}! Recibimos tus comentarios en nuestro libro de atención al cliente. Queremos disculparnos y ofrecerte una solución de inmediato.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 bg-[#25D366] text-white py-2 px-3 rounded-xl font-bold text-xs hover:bg-[#1EBE57] transition flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <MessageCircle className="w-4 h-4 fill-white" />
                          <span>Contactar por WhatsApp para Resolver</span>
                        </a>

                        <a
                          href={`tel:${fb.customer_phone}`}
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
                          title="Llamar"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
