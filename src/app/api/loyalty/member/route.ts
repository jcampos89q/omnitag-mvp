import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const programId = searchParams.get('program_id')
  const phone = searchParams.get('phone')

  if (!programId || !phone) {
    return NextResponse.json({ member: null }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: member } = await supabase
    .from('loyalty_members')
    .select('id, customer_name, customer_phone, current_stamps, total_rewards_claimed, last_stamp_at')
    .eq('program_id', programId)
    .eq('customer_phone', phone)
    .maybeSingle()

  return NextResponse.json({ member: member || null })
}
