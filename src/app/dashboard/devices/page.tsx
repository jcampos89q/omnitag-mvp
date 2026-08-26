import { createClient } from '@/lib/supabase/server'
import { createDevice, deleteDevice } from './actions'
import { Plus, Link as LinkIcon, Trash2, Smartphone, QrCode } from 'lucide-react'

export default async function DevicesPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string, error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { success, error } = await searchParams

  const { data: devices } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Mis Dispositivos NFC / QRs</h1>
        <p className="text-gray-500 text-xs sm:text-sm mb-6">
          Gestiona los puntos de contacto físicos de tu negocio (placas Tap-to-Rate, menús, etc).
        </p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl border border-green-100 text-sm">
            ¡Dispositivo creado correctamente!
          </div>
        )}

        {/* Formulario de registro */}
        <div className="bg-gray-50/80 p-5 sm:p-6 rounded-2xl border border-gray-100 mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-black" /> Registrar Nuevo Dispositivo
          </h2>
          <form action={createDevice} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="device_type" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select 
                  name="device_type" 
                  id="device_type" 
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 shadow-xs focus:border-black focus:outline-none text-sm"
                >
                  <option value="tap_to_rate">Tap-to-Rate (Google Reviews)</option>
                  <option value="generic">Enlace Genérico</option>
                  <option value="vcard">Vincular a Mi vCard</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="redirect_url" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">URL de Destino o Place ID</label>
                <input 
                  type="text" 
                  name="redirect_url" 
                  id="redirect_url" 
                  placeholder="https://g.page/r/XYZ... o ChIJ..."
                  required
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 shadow-xs focus:border-black focus:outline-none text-sm" 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" id="review_filter" name="review_filter" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                <span>Activar Filtro Inteligente (Filtrar reseñas de 1 a 3 estrellas)</span>
              </label>

              <button 
                type="submit" 
                className="w-full sm:w-auto bg-black text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
              >
                Crear Enlace
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Dispositivos */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold">Dispositivos Activos ({devices?.length || 0})</h2>
          
          {devices?.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">No tienes dispositivos registrados. ¡Crea el primero arriba!</p>
          ) : (
            <div className="space-y-3">
              {devices?.map((device) => (
                <div key={device.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors gap-3">
                  <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">ID: {device.tag_id}</span>
                        <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium uppercase tracking-wider">
                          {device.device_type.replace('_', ' ')}
                        </span>
                        {device.review_filter_enabled && (
                          <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-medium border border-amber-200">
                            Filtro Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 shrink-0" /> {device.redirect_url}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
                    <a 
                      href={`/r/${device.tag_id}`}
                      target="_blank"
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
                      title="Probar enlace"
                    >
                      <QrCode className="w-4 h-4" /> Probar Enlace
                    </a>

                    <form action={deleteDevice}>
                      <input type="hidden" name="device_id" value={device.id} />
                      <button 
                        type="submit" 
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
