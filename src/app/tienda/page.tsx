import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Planes y Precios Oficiales | OmniTag',
  description: 'Suscripciones y planes de software en la nube para agencias y negocios locales.',
}

export default function TiendaPage() {
  redirect('/pricing')
}
