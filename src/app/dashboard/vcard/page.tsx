import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { saveVCard } from './actions'
import ImageUploadInput from '@/components/ImageUploadInput'

export default async function VCardBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  if (!user) {
    redirect('/login')
  }

  // Obtener la vCard actual de forma segura con maybeSingle
  const { data: vcard } = await supabase
    .from('vcards')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Configurar mi vCard</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Completa los datos de tu tarjeta de presentación digital.</p>
          
          {params?.success && (
            <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-sm flex items-center gap-2">
              <span>✅</span>
              <span>¡Tus datos e imágenes se han guardado correctamente!</span>
            </div>
          )}

          {params?.error && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm">
              <strong>Error:</strong> {params.error}
            </div>
          )}

          {vcard && (
            <div className="mt-4 p-4 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  Tu vCard está activa
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Enlace público: <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded font-bold">/v/{vcard.slug}</span>
                </p>
              </div>
              <a 
                href={`/v/${vcard.slug}`} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs sm:text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-xs whitespace-nowrap"
              >
                Ver Mi Perfil Público &rarr;
              </a>
            </div>
          )}
        </div>

        <form action={saveVCard} className="space-y-6 max-w-2xl">
          {/* Aspecto Visual & Fotos */}
          <div className="bg-gray-50/80 p-5 sm:p-6 rounded-2xl border border-gray-100 space-y-5">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Aspecto Visual y Fotos</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <ImageUploadInput
                  name="avatar"
                  label="Foto de Perfil"
                  defaultValue={vcard?.avatar_url}
                  shape="circle"
                  helpText="Recomendado: Foto de rostro o logotipo personal."
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
              <label htmlFor="color" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Color Principal de Botones y Cabecera</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  name="color" 
                  id="color" 
                  defaultValue={vcard?.theme?.color || '#000000'}
                  className="h-10 w-14 rounded-lg border border-gray-300 cursor-pointer bg-white" 
                />
                <span className="text-xs text-gray-500">Selecciona el color distintivo de tu marca</span>
              </div>
            </div>
          </div>

          {/* Datos Personales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input 
                type="text" 
                name="first_name" 
                id="first_name" 
                required
                defaultValue={vcard?.first_name || ''}
                className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Apellidos</label>
              <input 
                type="text" 
                name="last_name" 
                id="last_name" 
                defaultValue={vcard?.last_name || ''}
                className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
              />
            </div>
            <div>
              <label htmlFor="job_title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Cargo / Profesión</label>
              <input 
                type="text" 
                name="job_title" 
                id="job_title"
                defaultValue={vcard?.job_title || ''} 
                placeholder="Ej. Director Comercial, Odontólogo..."
                className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
              />
            </div>
            <div>
              <label htmlFor="company_name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Empresa / Negocio</label>
              <input 
                type="text" 
                name="company_name" 
                id="company_name"
                defaultValue={vcard?.company_name || ''}
                className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
              />
            </div>
          </div>

          {/* Biografía */}
          <div>
            <label htmlFor="bio" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Biografía breve</label>
            <textarea 
              name="bio" 
              id="bio" 
              rows={3}
              defaultValue={vcard?.bio || ''} 
              placeholder="Hola, ayudo a empresas a crecer y conectar..."
              className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none resize-none" 
            />
          </div>

          {/* Contacto y Redes Sociales */}
          <div className="pt-4 border-t border-gray-100">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Contacto y Redes Sociales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Teléfono (WhatsApp)</label>
                <input 
                  type="tel" 
                  name="phone" 
                  id="phone" 
                  defaultValue={vcard?.contact_info?.phone || ''} 
                  placeholder="Ej. +34 600 00 00 00 o +504 99..." 
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email Público</label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  defaultValue={vcard?.contact_info?.email || ''} 
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
              <div>
                <label htmlFor="instagram" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Instagram Username</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">@</span>
                  <input 
                    type="text" 
                    name="instagram" 
                    id="instagram" 
                    defaultValue={vcard?.contact_info?.instagram || ''} 
                    className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-none rounded-r-xl border border-gray-300 bg-white shadow-xs focus:border-black focus:outline-none text-sm" 
                  />
                </div>
              </div>
              <div>
                <label htmlFor="linkedin" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input 
                  type="url" 
                  name="linkedin" 
                  id="linkedin" 
                  defaultValue={vcard?.contact_info?.linkedin || ''} 
                  placeholder="https://linkedin.com/in/..." 
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
              <div>
                <label htmlFor="facebook" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                <input 
                  type="url" 
                  name="facebook" 
                  id="facebook" 
                  defaultValue={vcard?.contact_info?.facebook || ''} 
                  placeholder="https://facebook.com/..." 
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
              <div>
                <label htmlFor="tiktok" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">TikTok Username</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">@</span>
                  <input 
                    type="text" 
                    name="tiktok" 
                    id="tiktok" 
                    defaultValue={vcard?.contact_info?.tiktok || ''} 
                    className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-none rounded-r-xl border border-gray-300 bg-white shadow-xs focus:border-black focus:outline-none text-sm" 
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="website" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
                <input 
                  type="url" 
                  name="website" 
                  id="website" 
                  defaultValue={vcard?.contact_info?.website || ''} 
                  placeholder="https://miweb.com" 
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-xs focus:border-black focus:outline-none" 
                />
              </div>
            </div>
          </div>

          {/* Modo Captura de Leads */}
          <div className="pt-4 border-t border-gray-100">
            <div className="bg-blue-50/80 border border-blue-200 p-4 sm:p-5 rounded-2xl flex items-start gap-3.5">
              <input
                id="lead_capture_enabled"
                name="lead_capture_enabled"
                type="checkbox"
                defaultChecked={vcard?.lead_capture_enabled}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
              />
              <div>
                <label htmlFor="lead_capture_enabled" className="font-bold text-blue-950 block text-sm sm:text-base cursor-pointer">
                  Activar "Modo Captura de Leads" (CRM)
                </label>
                <p className="text-xs sm:text-sm text-blue-800 mt-0.5 leading-relaxed">
                  Muestra un botón destacado de "Intercambiar Contacto" en tu vCard pública para que los visitantes te dejen sus datos (Nombre, Email, Teléfono). Los verás en tu sección de Contactos.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-black text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
