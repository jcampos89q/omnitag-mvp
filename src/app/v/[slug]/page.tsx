import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { UserCircle2, Briefcase, Mail, Phone, Download } from 'lucide-react'
import ShareButtons from '@/components/ShareButtons'
import LeadCaptureModal from './LeadCaptureModal'

export default async function PublicVCardPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient()
  const { slug } = await params

  // Buscar la vCard por su slug (URL) de forma segura
  const { data: vcard } = await supabase
    .from('vcards')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!vcard) {
    notFound() // Muestra la página 404 si no existe o está desactivada
  }

  const { id: vcardId, first_name, last_name, job_title, company_name, bio, contact_info, avatar_url, cover_url, theme, lead_capture_enabled } = vcard
  const fullName = [first_name, last_name].filter(Boolean).join(' ')
  const mainColor = theme?.color || '#111827' // Default gray-900

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Encabezado / Cover */}
        <div 
          className="h-32 relative bg-cover bg-center"
          style={{ backgroundColor: mainColor, backgroundImage: cover_url ? `url(${cover_url})` : 'none' }}
        >
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg flex items-center justify-center overflow-hidden">
              {avatar_url ? (
                <img src={avatar_url} alt={fullName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <UserCircle2 className="w-full h-full text-gray-300" />
              )}
            </div>
          </div>
        </div>

        {/* Info Principal */}
        <div className="pt-16 pb-6 px-8 text-center border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
          
          {(job_title || company_name) && (
            <div className="mt-2 text-gray-600 flex items-center justify-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>
                {job_title} {company_name ? `en ${company_name}` : ''}
              </span>
            </div>
          )}
          
          {bio && (
            <p className="mt-4 text-gray-500 text-sm leading-relaxed">
              "{bio}"
            </p>
          )}

          {/* Redes Sociales Rápidas */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {contact_info?.instagram && (
              <a href={`https://instagram.com/${contact_info.instagram}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
            )}
            {contact_info?.linkedin && (
              <a href={contact_info.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
              </a>
            )}
            {contact_info?.facebook && (
              <a href={contact_info.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
            )}
            {contact_info?.tiktok && (
              <a href={`https://tiktok.com/@${contact_info.tiktok}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-black transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.63-1.15 5.3-3.16 7.03-2.3 2.01-5.74 2.58-8.54 1.43-2.61-1.09-4.52-3.64-4.83-6.52-.3-2.92 1.12-5.91 3.66-7.5 2.16-1.34 4.88-1.58 7.31-.96v4.32c-1.3-.39-2.79-.27-3.95.45-1.15.71-1.84 2.05-1.73 3.4.11 1.25.97 2.41 2.15 2.87 1.43.55 3.19.34 4.39-.56.97-.73 1.58-1.89 1.6-3.1.03-5.71.02-11.41.02-17.12z" clipRule="evenodd" /></svg>
              </a>
            )}
            {contact_info?.website && (
              <a href={contact_info.website} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-black transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </a>
            )}
          </div>
        </div>

        {/* Botones de Acción (WhatsApp, SMS, Guardar) */}
        <div className="p-8 pt-0 space-y-3">
          
          {contact_info?.phone && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <a
                href={`https://wa.me/${contact_info.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex flex-col items-center justify-center gap-1 bg-[#25D366] text-white px-4 py-3 rounded-xl font-medium hover:bg-[#1EBE57] transition-colors shadow-sm"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                <span className="text-xs">WhatsApp</span>
              </a>
              <a
                href={`sms:${contact_info.phone.replace(/\D/g, '')}`}
                className="w-full flex flex-col items-center justify-center gap-1 bg-blue-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <span className="text-xs">SMS</span>
              </a>
            </div>
          )}

          <a
            href={`/v/${slug}/vcard`}
            style={{ backgroundColor: mainColor }}
            className="w-full flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md"
          >
            <Download className="w-5 h-5" />
            Guardar Contacto
          </a>

          {lead_capture_enabled && (
            <LeadCaptureModal vcardId={vcardId} slug={slug} mainColor={mainColor} />
          )}

          {/* Botones Sociales para Compartir */}
          <ShareButtons slug={slug} name={fullName} />

          {/* Información de Contacto Adicional */}
          <div className="mt-8 space-y-4">
            {contact_info?.phone && (
              <a 
                href={`tel:${contact_info.phone}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Teléfono</p>
                  <p className="text-gray-900 font-medium">{contact_info.phone}</p>
                </div>
              </a>
            )}

            {contact_info?.email && (
              <a 
                href={`mailto:${contact_info.email}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Correo</p>
                  <p className="text-gray-900 font-medium">{contact_info.email}</p>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Footer OmniTag */}
        <div className="bg-gray-50 py-4 text-center">
          <p className="text-xs text-gray-400 font-medium">
            Creado con <span className="text-gray-900 font-bold">OmniTag</span>
          </p>
        </div>
      </div>
    </div>
  )
}
