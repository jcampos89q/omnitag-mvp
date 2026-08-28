import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import BookingClient from './BookingClient'
import { Scissors, MapPin, Phone, Sparkles, ArrowLeft } from 'lucide-react'

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params

  const { data: business } = await supabase
    .from('appointment_businesses')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!business) {
    return {
      title: 'Agenda de Citas | OmniTag',
    }
  }

  const title = `${business.name} | Reserva tu Cita Online`
  const description = `Aparta tu turno y elige tu especialista favorito en ${business.name}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.omnitag.site/b/${slug}`,
      siteName: 'OmniTag Citas',
      type: 'website',
    }
  }
}

export default async function PublicBookingPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient()
  const { slug } = await params

  // 1. Buscar negocio de citas
  const { data: business } = await supabase
    .from('appointment_businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!business) {
    notFound()
  }

  // 2. Buscar si el negocio tiene una vCard principal para navegación cruzada
  const { data: ownerVcard } = await supabase
    .from('vcards')
    .select('slug, first_name, company_name')
    .eq('user_id', business.user_id)
    .eq('is_active', true)
    .maybeSingle()

  // 3. Buscar especialistas, servicios y reseñas en paralelo
  const [
    { data: specialists },
    { data: services },
    { data: reviews }
  ] = await Promise.all([
    supabase.from('specialists').select('*').eq('business_id', business.id).eq('is_active', true).order('order_index'),
    supabase.from('appointment_services').select('*').eq('business_id', business.id).eq('is_active', true),
    supabase.from('specialist_reviews').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(30)
  ])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Barra superior de regreso al Hub / vCard (si existe) */}
      {ownerVcard && (
        <div className="bg-white py-2 px-4 text-center border-b border-gray-200 shadow-2xs">
          <Link
            href={`/v/${ownerVcard.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-black hover:underline transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ver Tarjeta & Contacto de {ownerVcard.company_name || ownerVcard.first_name || business.name}</span>
          </Link>
        </div>
      )}

      {/* Cabecera del Negocio */}
      <header className="bg-white border-b border-gray-200 py-6 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center mx-auto shadow-md">
            <Scissors className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            {business.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500 pt-1">
            {business.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> {business.address}
              </span>
            )}
            {business.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> {business.phone}
              </span>
            )}
            {business.instagram && (
              <a
                href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-purple-700 font-bold hover:underline"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                <span>@{business.instagram.replace('@', '')}</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Flujo de Reserva Interactivo */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <BookingClient 
          business={business}
          specialists={specialists || []}
          services={services || []}
          reviews={reviews || []}
        />
      </main>

      <footer className="text-center pb-8 opacity-60 text-xs font-medium border-t border-gray-200 pt-6">
        Digitalizado por <span className="font-bold">OmniTag</span>
      </footer>
    </div>
  )
}
