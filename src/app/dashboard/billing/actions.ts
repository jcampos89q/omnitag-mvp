'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitBankTransfer(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const referenceNumber = (formData.get('reference_number') as string)?.trim()
  const receiptUrl = (formData.get('receipt_url') as string)?.trim()
  const amount = (formData.get('amount') as string)?.trim() || 'L. 550 HNL'
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!referenceNumber) {
    return { success: false, error: 'Por favor ingresa el número de referencia o transacción' }
  }

  if (!receiptUrl) {
    return { success: false, error: 'Por favor adjunta la foto o comprobante de la transferencia' }
  }

  // Obtener el workspace del usuario
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const { error } = await supabase
    .from('bank_transfers')
    .insert({
      user_id: user.id,
      workspace_id: member?.workspace_id || null,
      amount,
      reference_number: referenceNumber,
      receipt_url: receiptUrl,
      bank_name: 'BAC Credomatic',
      notes,
      status: 'pending'
    })

  if (error) {
    console.error('Error insertando comprobante bancario:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/billing')
  revalidatePath('/dashboard/admin')

  return { success: true }
}

export async function approveBankTransferAction(transferId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_approve_bank_transfer', {
    p_transfer_id: transferId
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/billing')
  return { success: true }
}

export async function rejectBankTransferAction(transferId: string, reason?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_reject_bank_transfer', {
    p_transfer_id: transferId,
    p_reason: reason || null
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/billing')
  return { success: true }
}
