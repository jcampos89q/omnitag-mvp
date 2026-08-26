import { createClient } from '@/lib/supabase/server'
import { saveVCard } from './actions'
import ImageUploadInput from '@/components/ImageUploadInput'

export default async function VCardBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  // Obtener la vCard actual si existe
  const { data: vcard } = await supabase
    .from('vcards')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurar mi vCard</h1>
        <p className="text-gray-500 mt-1">Completa los datos de tu tarjeta de presentación digital.</p>
        
        {params?.success && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-md border border-green-100">
            ¡Tus datos e imágenes se han guardado correctamente!
          </div>
        )}

        {vcard && (
          <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-md border border-blue-100 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Tu vCard está activa</p>
              <p className="text-xs mt-1">Enlace público: <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">/v/{vcard.slug}</span></p>
            </div>
            <a href={`/v/${vcard.slug}`} target="_blank" rel="noreferrer" className="text-sm font-medium bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700">
              Ver Perfil
            </a>
          </div>
        )}
      </div>

      <form action={saveVCard} className="space-y-6 max-w-2xl">
        {/* Aspecto Visual & Fotos */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Aspecto Visual y Fotos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ImageUploadInput
                name="avatar"
                label="Foto de Perfil"
                defaultValue={vcard?.avatar_url}
                shape="circle"
                helpText="Recomendado: Imagen cuadrada de tu rostro o logotipo personal."
              />
            </div>
            <div>
              <ImageUploadInput
                name="cover"
                label="Imagen de Portada / Banner"
                defaultValue={vcard?.cover_url}
                shape="banner"
                helpText="Recomendado: Imagen horizontal para el encabezado."
              />
            </div>
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color Principal</label>
            <div className="flex items-center gap-3 mt-1">
              <input 
                type="color" name="color" id="color" 
                defaultValue={vcard?.theme?.color || '#000000'}
                className="h-10 w-14 rounded-md border border-gray-300 cursor-pointer" 
              />
              <span className="text-sm text-gray-500">Selecciona el color de tu marca o botón</span>
            </div>
          </div>
        </div>

        {/* Datos Personales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Nombre *</label>
            <input 
              type="text" name="first_name" id="first_name" required
              defaultValue={vcard?.first_name || ''}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none sm:text-sm" 
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Apellidos</label>
            <input 
              type="text" name="last_name" id="last_name" 
              defaultValue={vcard?.last_name || ''}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none sm:text-sm" 
            />
          </div>
          <div>
            <label htmlFor="job_title" className="block text-sm font-medium text-gray-700">Cargo / Profesión</label>
            <input 
              type="text" name="job_title" id="job_title"
              defaultValue={vcard?.job_title || ''} placeholder="Ej. Desarrollador Web"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none sm:text-sm" 
            />
          </div>
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Empresa / Negocio</label>
            <input 
              type="text" name="company_name" id="company_name"
              defaultValue={vcard?.company_name || ''}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none sm:text-sm" 
            />
          </div>
        </div>

        {/* Biografía */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Biografía breve</label>
          <textarea 
            name="bio" id="bio" rows={3}
            defaultValue={vcard?.bio || ''} placeholder="Hola, ayudo a empresas a crecer..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none sm:text-sm" 
          />
        </div>

        {/* Contacto y Redes Sociales */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contacto y Redes Sociales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono (WhatsApp)</label>
              <input type="tel" name="phone" id="phone" defaultValue={vcard?.contact_info?.phone || ''} placeholder="+34 600 00 00 00" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none sm:text-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Público</label>
              <input type="email" name="email" id="email" defaultValue={vcard?.contact_info?.email || ''} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none sm:text-sm" />
            </div>
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">Instagram Username</label>
              <div className="flex mt-1">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">@</span>
                <input type="text" name="instagram" id="instagram" defaultValue={vcard?.contact_info?.instagram || ''} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 shadow-sm focus:border-black focus:outline-none sm:text-sm" />
              </div>
            </div>
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
              <input type="url" name="linkedin" id="linkedin" defaultValue={vcard?.contact_info?.linkedin || ''} placeholder="https://linkedin.com/in/..." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none sm:text-sm" />
            </div>
            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">Facebook URL</label>
              <input type="url" name="facebook" id="facebook" defaultValue={vcard?.contact_info?.facebook || ''} placeholder="https://facebook.com/..." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none sm:text-sm" />
            </div>
            <div>
              <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700">TikTok Username</label>
              <div className="flex mt-1">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">@</span>
                <input type="text" name="tiktok" id="tiktok" defaultValue={vcard?.contact_info?.tiktok || ''} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 shadow-sm focus:border-black focus:outline-none sm:text-sm" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">Sitio Web</label>
              <input type="url" name="website" id="website" defaultValue={vcard?.contact_info?.website || ''} placeholder="https://miweb.com" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none sm:text-sm" />
            </div>
          </div>
        </div>

        {/* Modo Captura de Leads */}
        <div className="pt-6 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex items-start gap-4">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="lead_capture_enabled"
                name="lead_capture_enabled"
                type="checkbox"
                defaultChecked={vcard?.lead_capture_enabled}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
            </div>
            <div>
              <label htmlFor="lead_capture_enabled" className="font-semibold text-blue-900 block">
                Activar "Modo Captura de Leads" (CRM)
              </label>
              <p className="text-sm text-blue-700 mt-1">
                Al activar esto, se mostrará un botón de "Intercambiar Contacto" en tu vCard pública para que los visitantes puedan dejarte sus datos (Nombre, Email, Teléfono). Los verás en tu sección de Contactos.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button 
            type="submit" 
            className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  )
}
