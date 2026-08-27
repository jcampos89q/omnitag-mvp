import { createClient } from '@/lib/supabase/server'
import { Gift, Sparkles, ShieldCheck } from 'lucide-react'
import { createLoyaltyProgram } from './actions'
import LoyaltyManager from './LoyaltyManager'

export default async function LoyaltyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar programa de fidelización del usuario
  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('user_id', user?.id)
    .maybeSingle()

  let members: any[] = []
  let logs: any[] = []

  if (program) {
    const { data: mList } = await supabase
      .from('loyalty_members')
      .select('*')
      .eq('program_id', program.id)
      .order('last_stamp_at', { ascending: false, nullsFirst: false })

    const { data: lList } = await supabase
      .from('loyalty_logs')
      .select('*')
      .eq('program_id', program.id)
      .order('created_at', { ascending: false })
      .limit(100)

    members = mList || []
    logs = lList || []
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
              <Gift className="w-6 h-6 text-purple-600" />
              Programa de Fidelización y Tarjetas de Sellos
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Fideliza a tus clientes mediante <b>sellos digitales interactivos</b> con protección antifraude por PIN.
            </p>
          </div>
          {program && (
            <a 
              href={`/l/${program.slug}`} 
              target="_blank" 
              className="bg-black text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-800 transition whitespace-nowrap shadow-xs"
            >
              Ver Tarjeta de Sellos &rarr;
            </a>
          )}
        </div>

        {!program ? (
          <div className="bg-gray-50 p-6 sm:p-10 rounded-2xl border border-gray-200 text-center max-w-xl mx-auto">
            <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Gift className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Crea tu Primer Club de Fidelización</h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-6">
              Premia a tus clientes recurrentes con sellos digitales y aumenta tus visitas semanales hasta un 40%.
            </p>
            
            <form action={createLoyaltyProgram} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Comercial *</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Ej. Barbería Deluxe / Café Aroma / Clínica Sonrisas" 
                  required 
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo de Negocio *</label>
                <select
                  name="business_type"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none font-medium"
                >
                  <option value="restaurant">🍽️ Restaurante / Cafetería / Bar</option>
                  <option value="salon">💈 Salón de Belleza / Barbería / Spa</option>
                  <option value="dental">🦷 Clínica Dental / Médica</option>
                  <option value="services">🛍️ Tienda / Comercio / Servicios</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">🎁 Premio al Completar los Sellos *</label>
                <input 
                  type="text" 
                  name="reward_title" 
                  placeholder="Ej. 1 Corte de Cabello Gratis / 1 Café Americano Gratis" 
                  required 
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Meta de Sellos</label>
                  <select
                    name="total_stamps_required"
                    defaultValue="6"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-black focus:outline-none font-bold"
                  >
                    <option value="4">4 Sellos</option>
                    <option value="6">6 Sellos (Recomendado)</option>
                    <option value="8">8 Sellos</option>
                    <option value="10">10 Sellos</option>
                    <option value="12">12 Sellos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">PIN Secreto Cajero</label>
                  <input 
                    type="password"
                    maxLength={4}
                    name="pin_code" 
                    defaultValue="1234" 
                    required 
                    placeholder="1234"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-black focus:outline-none font-mono font-bold" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-md cursor-pointer mt-2"
              >
                Activar Programa de Fidelización
              </button>
            </form>
          </div>
        ) : (
          <LoyaltyManager program={program} members={members} logs={logs} />
        )}
      </div>
    </div>
  )
}
