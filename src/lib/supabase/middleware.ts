import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname

  // Solo verificar y refrescar sesión de Auth en rutas protegidas del Dashboard o Auth
  // Rutas públicas (/v/, /m/, /b/, /l/, /r/, /) cargan al instante sin latencia de Auth
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAuthRoute = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/register'

  if (!isDashboardRoute && !isAuthRoute) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Solo refresca si es ruta que realmente utiliza sesión de usuario autenticado
  await supabase.auth.getUser()

  return supabaseResponse
}
