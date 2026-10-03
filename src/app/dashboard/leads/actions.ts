'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type LeadStatus = 'lead' | 'contacted' | 'negotiation' | 'won' | 'lost'

export async function updateLeadStatus(params: {
  leadId: string
  status: LeadStatus
  name?: string
  phone?: string | null
  email?: string | null
  source?: string
  notes?: string | null
  category?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado.' }
  }

  // 1. Verificar si el lead ya existe en la tabla `leads`
  const { data: existingLead } = await supabase
    .from('leads')
    .select('id, user_id, vcard_id')
    .eq('id', params.leadId)
    .maybeSingle()

  if (existingLead) {
    const { error } = await supabase
      .from('leads')
      .update({
        status: params.status,
        ...(params.notes !== undefined ? { notes: params.notes } : {}),
        ...(params.category !== undefined ? { category: params.category } : {}),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.leadId)

    if (error) {
      console.error('Error actualizando estatus del lead:', error)
      return { success: false, error: error.message }
    }
  } else {
    // Si viene de otra fuente (fidelización, citas, etc.) y se clasifica por primera vez en CRM
    const { error: insertError } = await supabase
      .from('leads')
      .insert({
        id: params.leadId,
        user_id: user.id,
        name: params.name || 'Contacto',
        phone: params.phone || null,
        email: params.email || null,
        source: params.source || 'crm',
        status: params.status,
        notes: params.notes || null,
        category: params.category || null,
        updated_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error insertando lead clasificado en CRM:', insertError)
      return { success: false, error: insertError.message }
    }
  }

  revalidatePath('/dashboard/leads')
  return { success: true }
}

export async function updateLeadNotesAndCategory(params: {
  leadId: string
  notes?: string
  category?: string
  deal_value?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado.' }
  }

  const { error } = await supabase
    .from('leads')
    .update({
      ...(params.notes !== undefined ? { notes: params.notes } : {}),
      ...(params.category !== undefined ? { category: params.category } : {}),
      ...(params.deal_value !== undefined ? { deal_value: params.deal_value } : {}),
      updated_at: new Date().toISOString()
    })
    .eq('id', params.leadId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/leads')
  return { success: true }
}

export async function createManualLead(params: {
  name: string
  phone?: string | null
  email?: string | null
  category?: string | null
  status?: LeadStatus
  deal_value?: number
  notes?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado.' }
  }

  const trimmedName = params.name?.trim()
  if (!trimmedName) {
    return { success: false, error: 'El nombre es obligatorio.' }
  }

  const { data, error } = await supabase
    .from('leads')
    .insert({
      user_id: user.id,
      name: trimmedName,
      phone: params.phone?.trim() || null,
      email: params.email?.trim() || null,
      source: 'manual',
      status: params.status || 'lead',
      category: params.category?.trim() || null,
      deal_value: params.deal_value || 0,
      notes: params.notes?.trim() || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creando lead manual:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/leads')
  return { success: true, lead: data }
}

export async function deleteLead(leadId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado.' }
  }

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId)

  if (error) {
    console.error('Error eliminando lead:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/leads')
  return { success: true }
}

