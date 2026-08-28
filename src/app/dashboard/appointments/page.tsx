export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { Scissors, Sparkles } from 'lucide-react'
import AppointmentsManager from './AppointmentsManager'
import { createOrUpdateBusiness } from './actions'
import { getUserPlanInfo } from '@/lib/plans'

export default async function AppointmentsDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Obtener plan
  const { isPro } = await getUserPlanInfo(supabase, user?.id)

  // 2. Buscar negocio de citas del usuario
  const { data: business } = await supabase
    .from('appointment_businesses')
    .select('*')
    .eq('user_id', user?.id)
    .maybeSingle()

  let specialists: any[] = []
  let services: any[] = []
  let bookings: any[] = []
  let reviews: any[] = []

  if (business) {
    const [
      { data: specs },
      { data: servs },
      { data: bks },
      { data: revs }
    ] = await Promise.all([
      supabase.from('specialists').select('*').eq('business_id', business.id).order('order_index'),
      supabase.from('appointment_services').select('*').eq('business_id', business.id),
      supabase.from('bookings').select('*').eq('business_id', business.id).order('booking_date', { ascending: false }).limit(50),
      supabase.from('specialist_reviews').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(50)
    ])

    specialists = specs || []
    services = servs || []
    bookings = bks || []
    reviews = revs || []
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Scissors className="w-6 h-6 text-purple-600" />
              Agendas de Citas & Especialistas
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Diseñado para <b>Barberías, Salones de Belleza, Spas y Clínicas</b>. Permite a tus clientes reservar turnos, elegir su especialista favorito y calificar la atención.
            </p>
          </div>
        </div>

        {!business ? (
          <div className="bg-gray-50 p-6 sm:p-10 rounded-2xl border border-gray-200 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Scissors className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Crea tu Agenda Digital de Citas</h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-4">
              Configura tus especialistas, lista de servicios y permite a tus clientes apartar turno en 1 minuto.
            </p>

            <form action={createOrUpdateBusiness} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Comercial *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ej. Barbería Deluxe / Studio Belleza Glamour"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo de Negocio *</label>
                <select
                  name="category"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none font-medium"
                >
                  <option value="barbershop">💈 Barbería (Cortes, barba, diseño y especialistas)</option>
                  <option value="salon">✂️ Salón de Belleza / Peluquería (Estilistas, tinte, peinado)</option>
                  <option value="spa">💆 Spa & Estética (Tratamientos y masajes)</option>
                  <option value="clinic">🦷 Clínica Médica / Dental (Consultas y valoración)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">WhatsApp para Notificaciones</label>
                <input
                  type="tel"
                  name="whatsapp"
                  placeholder="+504 9988-6256"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-md cursor-pointer mt-2"
              >
                Activar Mi Agenda de Citas
              </button>
            </form>
          </div>
        ) : (
          <AppointmentsManager
            business={business}
            specialists={specialists}
            services={services}
            bookings={bookings}
            reviews={reviews}
            isPro={isPro}
          />
        )}
      </div>
    </div>
  )
}
