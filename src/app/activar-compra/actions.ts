'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function verifyHotmartBuyerEmailAction(rawEmail: string) {
  const email = (rawEmail || '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    throw new Error('Ingresa el correo electrónico exacto con el que realizaste tu compra en Hotmart.')
  }

  const admin = getAdminClient()
  const { data: userRow } = await admin
    .from('users')
    .select('id, email, full_name, subscription_expires_at')
    .ilike('email', email)
    .maybeSingle()

  if (!userRow) {
    return {
      status: 'not_found_yet' as const,
      isReseller: false,
      buyerName: '',
    }
  }

  const { data: authData } = await admin.auth.admin.getUserById(userRow.id)
  const meta = authData?.user?.user_metadata || {}
  const isReseller = Boolean(meta.is_reseller)
  const isFromHotmartUnclaimed = meta.source === 'hotmart' && !meta.hotmart_password_claimed

  if (isFromHotmartUnclaimed) {
    return {
      status: 'ready_to_claim' as const,
      isReseller,
      buyerName: userRow.full_name || meta.full_name || email.split('@')[0],
    }
  }

  return {
    status: 'already_claimed' as const,
    isReseller,
    buyerName: userRow.full_name || meta.full_name || email.split('@')[0],
  }
}

export async function claimHotmartAccountAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = (formData.get('password') as string)?.trim()
  const fullName = (formData.get('full_name') as string)?.trim()

  if (!email || !password || password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.')
  }

  const admin = getAdminClient()
  const { data: userRow } = await admin
    .from('users')
    .select('id, email, full_name')
    .ilike('email', email)
    .maybeSingle()

  if (!userRow) {
    throw new Error('Aún no hemos recibido la confirmación de Hotmart para este correo. Espera 30 segundos y vuelve a intentar.')
  }

  const { data: authData } = await admin.auth.admin.getUserById(userRow.id)
  const meta = authData?.user?.user_metadata || {}

  if (meta.source !== 'hotmart' || meta.hotmart_password_claimed) {
    throw new Error('Esta cuenta ya tiene una contraseña configurada. Inicia sesión normalmente en /login.')
  }

  const finalName = fullName || userRow.full_name || meta.full_name || email.split('@')[0]

  const { error: updateErr } = await admin.auth.admin.updateUserById(userRow.id, {
    password,
    email_confirm: true,
    user_metadata: {
      ...meta,
      full_name: finalName,
      hotmart_password_claimed: true,
    },
  })

  if (updateErr) {
    throw new Error(updateErr.message)
  }

  await admin
    .from('users')
    .update({ full_name: finalName })
    .eq('id', userRow.id)

  // Iniciar sesión automáticamente
  const supabase = await createClient()
  await supabase.auth.signInWithPassword({
    email,
    password,
  })

  const redirectTo = meta.is_reseller ? '/dashboard/reseller' : '/dashboard'
  return {
    success: true,
    redirectTo,
  }
}
