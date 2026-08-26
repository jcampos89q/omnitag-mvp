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
      message = 'Credenciales inválidas. Verifica tu correo y contraseña.'
    } else if (error.message.includes('Email not confirmed')) {
      message = 'Tu correo no ha sido confirmado. Revisa tu bandeja de entrada o desactiva la confirmación en Supabase.'
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
      message = 'Este correo ya se encuentra registrado. Intenta iniciar sesión.'
    } else if (error.message.includes('rate limit')) {
      message = 'Límite de correos alcanzado en Supabase. Desactiva "Confirm email" en el panel de Supabase o intenta más tarde.'
    }
    redirect('/register?error=' + encodeURIComponent(message))
  }

  // Si Supabase requiere confirmación de correo, la sesión es nula
  if (data?.user && !data.session) {
    redirect('/login?message=' + encodeURIComponent('¡Cuenta creada con éxito! Si tienes activada la verificación, revisa tu correo para confirmar.'))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
