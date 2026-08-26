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

  // Obtener URL host para los QRs
  const hostUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis Dispositivos NFC / QRs</h1>
        <p className="text-gray-500 mb-6">
          Gestiona los puntos de contacto físicos de tu negocio (placas Tap-to-Rate, menús, etc).
        </p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-md border border-green-100">
            ¡Dispositivo creado correctamente!
          </div>
        )}

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Registrar Nuevo Dispositivo
          </h2>
          <form action={createDevice} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label htmlFor="device_type" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select name="device_type" id="device_type" className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm">
                <option value="tap_to_rate">Tap-to-Rate (Google Reviews)</option>
                <option value="generic">Enlace Genérico</option>
                <option value="vcard">Vincular a Mi vCard</option>
              </select>
            </div>
            <div className="flex-[2] w-full">
              <label htmlFor="redirect_url" className="block text-sm font-medium text-gray-700 mb-1">URL de Destino o Place ID</label>
              <input 
                type="text" 
                name="redirect_url" 
                id="redirect_url" 
                placeholder="https://g.page/r/XYZ... o ChIJ..."
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm" 
              />
              <div className="mt-3 flex items-center gap-2">
                <input type="checkbox" id="review_filter" name="review_filter" className="rounded border-gray-300 text-black focus:ring-black" />
                <label htmlFor="review_filter" className="text-sm font-medium text-gray-700">
                  Activar Filtro Inteligente (Pedir estrellas antes de enviar a Google)
                </label>
              </div>
            </div>
            <button type="submit" className="w-full md:w-auto bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors">
              Crear Enlace
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-4">Dispositivos Activos ({devices?.length || 0})</h2>
          
          {devices?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tienes dispositivos registrados. ¡Crea el primero arriba!</p>
          ) : (
            devices?.map((device) => (
              <div key={device.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-4 mb-4 sm:mb-0 w-full">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">ID: {device.tag_id}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium uppercase tracking-wider">
                        {device.device_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 shrink-0" /> {device.redirect_url}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  {/* Botón para probar el QR/Link (abre el motor de redirección) */}
                  <a 
                    href={`/r/${device.tag_id}`}
                    target="_blank"
                    className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                    title="Probar enlace"
                  >
                    <QrCode className="w-5 h-5" />
                  </a>

                  <form action={deleteDevice}>
                    <input type="hidden" name="device_id" value={device.id} />
                    <button 
                      type="submit" 
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
