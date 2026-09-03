import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import WheelPublicClient from './WheelPublicClient'
import { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ table?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: wheel } = await supabase
    .from('prize_wheels')
    .select('name, description')
    .eq('slug', slug)
    .maybeSingle()

  if (!wheel) return { title: 'Ruleta de Premios • OmniTag' }

  return {
    title: `${wheel.name} | Gira y Gana`,
    description: wheel.description || 'Gira la ruleta de la fortuna y gana premios exclusivos.',
  }
}

export default async function PublicWheelPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { table } = await searchParams
  const supabase = await createClient()

  // 1. Obtener la ruleta por slug
  const { data: wheel, error: wheelErr } = await supabase
    .from('prize_wheels')
    .select('*, prize_wheel_items(*)')
    .eq('slug', slug)
    .maybeSingle()

  if (wheelErr || !wheel) {
    notFound()
  }

  // Ordenar items activos
  const activeItems = (wheel.prize_wheel_items || [])
    .filter((it: any) => it.is_active)
    .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))

  // Validar si la ruleta está pausada o fuera de horario
  let isClosed = !wheel.is_active
  let closedReason = wheel.paused_message || 'La ruleta de premios está temporalmente en pausa.'

  const now = new Date()
  if (wheel.is_active && wheel.schedule_mode === 'days_of_week') {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = days[now.getDay()]
    const activeDays = Array.isArray(wheel.active_days) ? wheel.active_days : []
    if (!activeDays.includes(currentDay)) {
      isClosed = true
      closedReason = 'La ruleta no está activa hoy. ¡Vuelve en nuestros días de promoción!'
    }
  } else if (wheel.is_active && wheel.schedule_mode === 'date_range') {
    if (wheel.start_date && now < new Date(wheel.start_date)) {
      isClosed = true
      closedReason = 'Esta promoción especial aún no ha comenzado.'
    } else if (wheel.end_date && now > new Date(wheel.end_date)) {
      isClosed = true
      closedReason = 'Esta promoción especial ha concluido.'
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-3 sm:p-6 select-none">
      <WheelPublicClient 
        wheel={wheel} 
        items={activeItems} 
        isClosed={isClosed} 
        closedReason={closedReason} 
        table={table} 
      />
    </main>
  )
}
