'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Por favor ingresa tu correo y contraseña.'))
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    let message = error.message
    if (error.message.includes('Invalid login credentials')) {
      message = 'Credenciales inválidas. Verifica tu correo y contraseña o restablece tu clave.'
    } else if (error.message.includes('Email not confirmed')) {
      message = 'Tu correo no ha sido confirmado. Revisa tu bandeja de entrada o solicita asistencia.'
    }
    redirect('/login?error=' + encodeURIComponent(message))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const fullName = (formData.get('full_name') as string)?.trim()
  const accountType = (formData.get('account_type') as string)?.trim() || 'professional'
  const industry = (formData.get('industry') as string)?.trim() || 'general'
  const professionTitle = (formData.get('profession_title') as string)?.trim() || ''
  const cardToken = (formData.get('card_token') as string)?.trim() || ''

  if (!email || !password) {
    const errorUrl = cardToken 
      ? `/register?token=${encodeURIComponent(cardToken)}&error=` 
      : '/register?error='
    redirect(errorUrl + encodeURIComponent('Por favor completa todos los campos requeridos.'))
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        account_type: accountType,
        industry: industry,
        profession_title: professionTitle,
      },
    },
  })

  if (error) {
    let message = error.message
    if (error.message.includes('User already registered')) {
      message = 'Este correo ya se encuentra registrado. Intenta iniciar sesión o recuperar tu clave.'
    } else if (error.message.includes('rate limit')) {
      message = 'Límite de correos alcanzado en Supabase. Intenta más tarde.'
    }
    const errorUrl = cardToken 
      ? `/register?token=${encodeURIComponent(cardToken)}&error=` 
      : '/register?error='
    redirect(errorUrl + encodeURIComponent(message))
  }

  // Si se proporcionó un token NFC válido, vincularlo y activar 1 año PRO
  if (data?.user && cardToken) {
    try {
      const { data: card } = await supabase
        .from('nfc_cards')
        .select('*')
        .eq('card_token', cardToken)
        .eq('status', 'unclaimed')
        .maybeSingle()

      if (card) {
        const planDays = card.plan_duration_days || 365
        const expiresAt = new Date(Date.now() + planDays * 24 * 60 * 60 * 1000).toISOString()

        // 1. Marcar tarjeta como activa y asignada al usuario
        await supabase
          .from('nfc_cards')
          .update({
            status: 'active',
            claimed_by_user_id: data.user.id,
            claimed_at: new Date().toISOString()
          })
          .eq('id', card.id)

        // 2. Extender suscripción por 1 año en la tabla users
        await supabase
          .from('users')
          .update({
            subscription_expires_at: expiresAt,
            plan_status: 'pro_annual',
            account_type: accountType,
            industry: industry,
            profession_title: professionTitle
          })
          .eq('id', data.user.id)
      }
    } catch (nfcErr) {
      console.error('Error vinculando tarjeta NFC en registro:', nfcErr)
    }
  }

  if (data?.user && !data.session) {
    redirect('/login?message=' + encodeURIComponent('¡Cuenta creada con éxito! Si tienes activada la verificación, revisa tu correo para confirmar.'))
  }

  revalidatePath('/', 'layout')
  
  if (cardToken) {
    redirect('/dashboard/vcard?nfc_activated=true')
  }

  redirect('/dashboard')
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string)?.trim()

  if (!email) {
    redirect('/forgot-password?error=' + encodeURIComponent('Por favor ingresa tu correo electrónico.'))
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://www.omnitag.site/auth/callback?next=/reset-password',
  })

  if (error) {
    redirect('/forgot-password?error=' + encodeURIComponent(error.message))
  }

  redirect('/forgot-password?success=true&email=' + encodeURIComponent(email))
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const password = (formData.get('password') as string)?.trim()

  if (!password || password.length < 6) {
    redirect('/reset-password?error=' + encodeURIComponent('La contraseña debe tener al menos 6 caracteres.'))
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect('/reset-password?error=' + encodeURIComponent(error.message))
  }

  redirect('/login?message=' + encodeURIComponent('¡Tu contraseña ha sido actualizada con éxito! Ya puedes iniciar sesión.'))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
