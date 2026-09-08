import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PatientsClient from './PatientsClient'

export default async function PatientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Ensure they are in the health industry
  const { data: profile } = await supabase
    .from('users')
    .select('industry')
    .eq('id', user.id)
    .single()
    
  if (profile?.industry !== 'health') {
    redirect('/dashboard/settings') // Or show unauthorized
  }

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', user.id)
    .order('created_at', { ascending: false })

  return <PatientsClient initialPatients={patients || []} />
}
