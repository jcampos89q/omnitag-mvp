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

  if (!email || !password) {
    redirect('/register?error=' + encodeURIComponent('Por favor completa todos los campos requeridos.'))
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
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
    redirect('/register?error=' + encodeURIComponent(message))
  }

  if (data?.user && !data.session) {
    redirect('/login?message=' + encodeURIComponent('¡Cuenta creada con éxito! Si tienes activada la verificación, revisa tu correo para confirmar.'))
  }

  revalidatePath('/', 'layout')
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
