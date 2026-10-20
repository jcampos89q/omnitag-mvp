import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user, isImpersonating } = await getEffectiveUser(supabase)
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const db = isImpersonating ? getAdminClient() : supabase

    const { searchParams } = new URL(request.url)
    const menuId = searchParams.get('menu_id')

    let query = db
      .from('restaurant_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200)

    if (menuId) {
      query = query.eq('menu_id', menuId)
    }

    const { data: orders, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, orders: orders || [] })
  } catch (err: any) {
    console.error('Error in /api/orders/list:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
