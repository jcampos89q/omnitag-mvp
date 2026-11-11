'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { normalizeIndustry, SELECTABLE_INDUSTRY_IDS, SelectableIndustryId } from '@/lib/industries'
import type { WhiteLabelBrandConfig } from '@/lib/whitelabel'

export async function saveWhiteLabelBrandAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const adminClient = getAdminClient()
  const { data: authData } = await adminClient.auth.admin.getUserById(user.id)
  const existingMeta = authData?.user?.user_metadata || {}

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.is_admin && !existingMeta.is_reseller) {
    throw new Error('Tu cuenta no tiene una suscripción activa de Distribuidor Marca Blanca.')
  }

  const brandConfig: WhiteLabelBrandConfig = {
    brand_name: (formData.get('brand_name') as string)?.trim() || 'Mi Marca NFC',
    logo_url: (formData.get('logo_url') as string)?.trim() || '',
    website_url: (formData.get('website_url') as string)?.trim() || '',
    support_whatsapp: (formData.get('support_whatsapp') as string)?.trim() || '',
    support_email: (formData.get('support_email') as string)?.trim() || '',
    checkout_monthly_url: (formData.get('checkout_monthly_url') as string)?.trim() || '',
    checkout_yearly_url: (formData.get('checkout_yearly_url') as string)?.trim() || '',
    price_monthly: (formData.get('price_monthly') as string)?.trim() || '19',
    price_yearly: (formData.get('price_yearly') as string)?.trim() || '190',
    bank_name: (formData.get('bank_name') as string)?.trim() || '',
    bank_account_number: (formData.get('bank_account_number') as string)?.trim() || '',
    bank_account_holder: (formData.get('bank_account_holder') as string)?.trim() || '',
    bank_account_id_doc: (formData.get('bank_account_id_doc') as string)?.trim() || '',
    hide_omnitag_branding: formData.get('hide_omnitag_branding') === 'true',
  }

  const { error } = await adminClient.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...existingMeta,
      white_label_config: brandConfig,
    },
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/reseller')
  revalidatePath('/dashboard/billing')

  return { success: true }
}

export async function createResellerSubClientAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const adminClient = getAdminClient()
  const { data: resellerAuth } = await adminClient.auth.admin.getUserById(user.id)
  const resellerMeta = resellerAuth?.user?.user_metadata || {}

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = Boolean(profile?.is_admin)
  const isReseller = Boolean(isAdmin || resellerMeta.is_reseller)

  if (!isReseller) {
    throw new Error('No tienes permisos de Distribuidor para crear sub-cuentas.')
  }

  // Verificar vigencia de la suscripción del Distribuidor
  if (resellerMeta.reseller_expires_at) {
    if (new Date(resellerMeta.reseller_expires_at) <= new Date()) {
      throw new Error('Tu suscripción de Agencia Marca Blanca ha vencido. Renuévala desde el Panel Master o en Hotmart para crear más cuentas.')
    }
  }

  // Verificar cupo disponible (incluso si eres Admin, tu cuenta de Agencia respeta el cupo asignado como cualquier suscriptor)
  const quota = Number(resellerMeta.reseller_quota || 25)
  const { data: allUsersList } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
  const currentSubClients = (allUsersList?.users || []).filter(
    u => u.user_metadata?.parent_reseller_id === user.id
  )

  if (currentSubClients.length >= quota) {
    throw new Error(`Has alcanzado el límite de tu plan de Agencia (${quota} clientes). Amplía tu cupo de Agencia desde el Panel de Suscriptores Marca Blanca.`)
  }

  const clientEmail = (formData.get('email') as string)?.trim().toLowerCase()
  const clientPassword = (formData.get('password') as string)?.trim()
  const clientName = (formData.get('full_name') as string)?.trim()
  const rawIndustry = (formData.get('industry') as string)?.trim()
  const planDays = Number(formData.get('plan_days') || 30)

  if (!clientEmail || !clientPassword || clientPassword.length < 6) {
    throw new Error('Ingresa un correo válido y una contraseña de al menos 6 caracteres.')
  }

  const normalizedIndustry = normalizeIndustry(rawIndustry) as SelectableIndustryId
  if (!SELECTABLE_INDUSTRY_IDS.includes(normalizedIndustry)) {
    throw new Error('Selecciona uno de los 5 giros oficiales para el cliente.')
  }

  const nowIso = new Date().toISOString()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + Math.max(1, Math.min(365, planDays)))

  // Crear usuario en Auth con su giro bloqueado y vinculado al Distribuidor
  const { data: createdAuth, error: createError } = await adminClient.auth.admin.createUser({
    email: clientEmail,
    password: clientPassword,
    email_confirm: true,
    user_metadata: {
      full_name: clientName || clientEmail.split('@')[0],
      industry: normalizedIndustry,
      industry_locked: true,
      industry_changed_at: nowIso,
      parent_reseller_id: user.id,
      account_type: normalizedIndustry === 'professional' ? 'professional' : 'business',
    },
  })

  if (createError || !createdAuth?.user) {
    throw new Error(createError?.message || 'No se pudo crear el sub-cliente.')
  }

  const newUserId = createdAuth.user.id
  const accountType = normalizedIndustry === 'professional' ? 'professional' : 'business'

  // Actualizar registro en public.users
  await adminClient
    .from('users')
    .upsert({
      id: newUserId,
      email: clientEmail,
      full_name: clientName || clientEmail.split('@')[0],
      industry: normalizedIndustry,
      account_type: accountType,
      subscription_expires_at: expiresAt.toISOString(),
      trial_expires_at: expiresAt.toISOString(),
    })

  revalidatePath('/dashboard/reseller')
  return {
    success: true,
    clientId: newUserId,
    email: clientEmail,
    industry: normalizedIndustry,
  }
}

export async function manageSubClientPlanAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const targetClientId = (formData.get('client_id') as string)?.trim()
  const actionType = (formData.get('action_type') as string)?.trim() // 'add_30' | 'add_365' | 'suspend'

  if (!targetClientId) throw new Error('Cliente inválido')

  const adminClient = getAdminClient()
  const [{ data: resellerAuth }, { data: targetAuth }, { data: profile }] = await Promise.all([
    adminClient.auth.admin.getUserById(user.id),
    adminClient.auth.admin.getUserById(targetClientId),
    supabase.from('users').select('is_admin').eq('id', user.id).maybeSingle(),
  ])

  const isAdmin = Boolean(profile?.is_admin)
  const resellerMeta = resellerAuth?.user?.user_metadata || {}
  const targetMeta = targetAuth?.user?.user_metadata || {}

  if (!isAdmin && targetMeta.parent_reseller_id !== user.id) {
    throw new Error('Este cliente no pertenece a tu cartera de Distribuidor.')
  }

  if (!isAdmin && resellerMeta.reseller_expires_at && new Date(resellerMeta.reseller_expires_at) <= new Date()) {
    throw new Error('Tu suscripción de Distribuidor con OmniTag está vencida.')
  }

  let newExpiresAt: string | null = null
  const now = new Date()

  if (actionType === 'suspend') {
    const past = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    newExpiresAt = past.toISOString()
  } else {
    const daysToAdd = actionType === 'add_365' ? 365 : 30
    const future = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
    newExpiresAt = future.toISOString()
  }

  const { error } = await adminClient
    .from('users')
    .update({
      subscription_expires_at: newExpiresAt,
      trial_expires_at: newExpiresAt,
    })
    .eq('id', targetClientId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/reseller')
  return { success: true }
}

export async function adminConfigureDistributorAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.is_admin) {
    throw new Error('Solo el Super Administrador de OmniTag puede autorizar Distribuidores.')
  }

  const targetEmail = (formData.get('email') as string)?.trim().toLowerCase()
  const targetPassword = (formData.get('password') as string)?.trim()
  const targetName = (formData.get('full_name') as string)?.trim()
  const brandName = (formData.get('brand_name') as string)?.trim()
  const quota = Number(formData.get('quota') || 25)
  const durationDays = Number(formData.get('duration_days') || 30)
  const enableReseller = formData.get('enable_reseller') !== 'false'

  if (!targetEmail) throw new Error('Ingresa el correo del usuario o nueva Agencia.')

  const adminClient = getAdminClient()
  let { data: targetUserRow } = await adminClient
    .from('users')
    .select('id, email, full_name')
    .ilike('email', targetEmail)
    .maybeSingle()

  // Si el correo aún no existe y el Super Admin ingresó contraseña, crear la cuenta de Agencia automáticamente
  if (!targetUserRow) {
    if (!targetPassword || targetPassword.length < 6) {
      throw new Error(`El correo ${targetEmail} no existe aún. Ingresa una contraseña inicial (mín. 6 caracteres) para crear la cuenta de Agencia automáticamente.`)
    }

    const { data: createdAgency, error: createErr } = await adminClient.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      email_confirm: true,
      user_metadata: {
        full_name: targetName || brandName || targetEmail.split('@')[0],
        industry: 'professional',
        industry_locked: true,
        account_type: 'business',
      },
    })

    if (createErr || !createdAgency?.user) {
      throw new Error(createErr?.message || 'No se pudo crear la nueva cuenta de Agencia.')
    }

    await adminClient.from('users').upsert({
      id: createdAgency.user.id,
      email: targetEmail,
      full_name: targetName || brandName || targetEmail.split('@')[0],
      industry: 'professional',
      account_type: 'business',
    })

    targetUserRow = {
      id: createdAgency.user.id,
      email: targetEmail,
      full_name: targetName || brandName || targetEmail.split('@')[0],
    }
  }

  const { data: targetAuth } = await adminClient.auth.admin.getUserById(targetUserRow.id)
  const existingMeta = targetAuth?.user?.user_metadata || {}
  const existingWl = existingMeta.white_label_config || {}

  const expiresAt = new Date()
  if (durationDays <= 0) {
    // Suspender agencia poniendo fecha en el pasado
    expiresAt.setDate(expiresAt.getDate() - 1)
  } else {
    expiresAt.setDate(expiresAt.getDate() + durationDays)
  }
  const expiresIso = expiresAt.toISOString()

  const { error } = await adminClient.auth.admin.updateUserById(targetUserRow.id, {
    user_metadata: {
      ...existingMeta,
      is_reseller: enableReseller,
      reseller_quota: quota,
      reseller_expires_at: expiresIso,
      white_label_config: {
        ...existingWl,
        ...(brandName ? { brand_name: brandName } : {}),
      },
    },
  })

  if (error) throw new Error(error.message)

  await adminClient
    .from('users')
    .update({
      subscription_expires_at: expiresIso,
      trial_expires_at: expiresIso,
    })
    .eq('id', targetUserRow.id)

  revalidatePath('/dashboard/reseller')
  revalidatePath('/dashboard/admin')

  return {
    success: true,
    email: targetEmail,
    isReseller: enableReseller,
    quota,
  }
}

export async function adminQuickManageAgencyAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.is_admin) {
    throw new Error('Solo el Super Administrador puede gestionar suscripciones de Agencias.')
  }

  const agencyId = (formData.get('agency_id') as string)?.trim()
  const actionType = (formData.get('action_type') as string)?.trim() // 'add_30' | 'add_365' | 'suspend' | 'set_quota'
  const newQuota = Number(formData.get('quota') || 25)

  if (!agencyId) throw new Error('Agencia inválida')

  const adminClient = getAdminClient()
  const { data: targetAuth } = await adminClient.auth.admin.getUserById(agencyId)
  const existingMeta = targetAuth?.user?.user_metadata || {}

  const updatedMeta: Record<string, any> = {
    ...existingMeta,
    is_reseller: true,
  }

  const now = new Date()
  if (actionType === 'set_quota') {
    updatedMeta.reseller_quota = newQuota
  } else if (actionType === 'suspend') {
    const past = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    updatedMeta.reseller_expires_at = past
    await adminClient.from('users').update({ subscription_expires_at: past }).eq('id', agencyId)
  } else if (actionType === 'add_30' || actionType === 'add_365') {
    const days = actionType === 'add_365' ? 365 : 30
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
    updatedMeta.reseller_expires_at = future
    if (!updatedMeta.reseller_quota) updatedMeta.reseller_quota = 25
    await adminClient.from('users').update({ subscription_expires_at: future, trial_expires_at: future }).eq('id', agencyId)
  }

  const { error } = await adminClient.auth.admin.updateUserById(agencyId, {
    user_metadata: updatedMeta,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/reseller')
  return { success: true }
}
