import { notFound } from 'next/navigation'
import { getGiftCardPublic } from '@/app/dashboard/gift-cards/actions'
import GiftCardClientView from './GiftCardClientView'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params
  const data = await getGiftCardPublic(code)
  if (!data) return { title: 'Tarjeta de Regalo no encontrada | OmniTag' }

  return {
    title: `🎁 Regalo para ${data.card.recipient_name} | ${data.business.name}`,
    description: data.card.gift_message || `Has recibido una tarjeta de regalo de ${data.business.name}`,
    openGraph: {
      title: `🎁 Tarjeta de Regalo para ${data.card.recipient_name}`,
      description: data.card.gift_message || `Canjea tu tarjeta en ${data.business.name}`,
    }
  }
}

export default async function GiftCardPage({ params }: PageProps) {
  const { code } = await params
  const data = await getGiftCardPublic(code)

  if (!data) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-900 py-6 sm:py-12 px-4 flex items-center justify-center">
      <GiftCardClientView 
        card={data.card} 
        business={data.business} 
        redemptions={data.redemptions} 
      />
    </main>
  )
}
