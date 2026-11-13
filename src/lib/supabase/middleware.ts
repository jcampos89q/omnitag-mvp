import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(
  request: NextRequest,
  customContext?: {
    partnerId?: string
    customDomain?: string
    agencyPortal?: boolean
    rewriteToPath?: string
  }
) {
  const pathname = request.nextUrl.pathname
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-current-path', pathname)
  if (customContext?.partnerId) {
    requestHeaders.set('x-partner-id', customContext.partnerId)
  }
  if (customContext?.customDomain) {
    requestHeaders.set('x-custom-domain', customContext.customDomain)
  }
  if (customContext?.agencyPortal) {
    requestHeaders.set('x-agency-portal', 'true')
  }

  const buildResponse = () => {
    if (customContext?.rewriteToPath) {
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = customContext.rewriteToPath
      return NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      })
    }
    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  let supabaseResponse = buildResponse()

  // Solo verificar y refrescar sesión de Auth en rutas protegidas del Dashboard o Auth
  // Rutas públicas (/v/, /m/, /b/, /l/, /r/, /) cargan al instante sin latencia de Auth
  const effectivePath = customContext?.rewriteToPath || pathname
  const isDashboardRoute = effectivePath.startsWith('/dashboard')
  const isAuthRoute =
    effectivePath.startsWith('/auth') ||
    effectivePath === '/login' ||
    effectivePath === '/register' ||
    effectivePath === '/forgot-password' ||
    effectivePath === '/reset-password'

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = buildResponse()
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
