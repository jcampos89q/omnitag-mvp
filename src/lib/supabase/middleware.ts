import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { detectLocaleFromHeaders, LOCALE_COOKIE_NAME, type Locale } from '@/lib/i18n/config'

export async function updateSession(
  request: NextRequest,
  customContext?: {
    partnerId?: string
    customDomain?: string
    agencyPortal?: boolean
    rewriteToPath?: string
    locale?: Locale
  }
) {
  const pathname = request.nextUrl.pathname
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-current-path', pathname)

  // Detección de idioma por región geográfica, cabecera de navegador o cookie previa
  const detectedLocale = customContext?.locale || detectLocaleFromHeaders(request.headers, request.cookies)
  requestHeaders.set('x-locale', detectedLocale)

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
    let res: NextResponse
    if (customContext?.rewriteToPath) {
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = customContext.rewriteToPath
      res = NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      })
    } else {
      res = NextResponse.next({
        request: { headers: requestHeaders },
      })
    }

    // Persistir cookie si el usuario es nuevo para que el cliente la conozca
    if (!request.cookies.get(LOCALE_COOKIE_NAME)) {
      res.cookies.set(LOCALE_COOKIE_NAME, detectedLocale, {
        path: '/',
        maxAge: 31536000,
        sameSite: 'lax',
      })
    }

    return res
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
