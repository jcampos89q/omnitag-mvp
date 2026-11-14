import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { getClientIp, getRateLimitRule, checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit'
import { isAgenciesSalesHost, isAgencyPortalHost, isMainPlatformHost, normalizeDomain, resolvePartnerByDomain } from '@/lib/whitelabel'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. Rate Limiting per IP on API endpoints (Prevents DoS, scraping, and bot loops)
  const rule = getRateLimitRule(pathname)
  if (rule) {
    const ip = getClientIp(request)
    // Categorize prefix for isolated limit buckets
    const bucket = pathname.startsWith('/api/wheel') 
      ? 'wheel' 
      : pathname.startsWith('/api/auth') 
      ? 'auth' 
      : pathname.startsWith('/api/wallet')
      ? 'wallet'
      : 'api'

    const rateLimitKey = `${ip}:${bucket}`
    const result = checkRateLimit(rateLimitKey, rule)

    if (!result.allowed) {
      return createRateLimitResponse(result.resetTime)
    }
  }

  // 1.5. Bloquear ruta pública de venta física /tienda en producción para cumplimiento SaaS internacional
  if (pathname === '/tienda') {
    return NextResponse.redirect(new URL('/pricing', request.url))
  }

  // 2. Resolución de Portal SaaS de Agencias (app.omnitag.site) o Dominio Personalizado
  const rawHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  let customContext:
    | { partnerId?: string; customDomain?: string; agencyPortal?: boolean; rewriteToPath?: string }
    | undefined

  if (isAgenciesSalesHost(rawHost)) {
    // Subdominio exclusivo de venta de licencias Marca Blanca (agencias.omnitag.site)
    if (pathname === '/tienda') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    customContext = {
      rewriteToPath: pathname === '/' ? '/agencias' : undefined,
    }
  } else if (isAgencyPortalHost(rawHost)) {
    // Bloquear páginas comerciales de OmniTag en app.omnitag.site
    if (
      pathname === '/agencias' ||
      pathname === '/tienda' ||
      pathname === '/activar-compra'
    ) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    customContext = {
      agencyPortal: true,
      rewriteToPath: pathname === '/' ? '/login' : undefined,
    }
  } else if (!isMainPlatformHost(rawHost)) {
    const partnerMatch = await resolvePartnerByDomain(rawHost)
    if (partnerMatch) {
      // Bloquear rutas comerciales de OmniTag dentro de un dominio de Agencia
      if (
        pathname === '/agencias' ||
        pathname === '/tienda' ||
        pathname === '/activar-compra'
      ) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      customContext = {
        partnerId: partnerMatch.partnerId,
        customDomain: normalizeDomain(rawHost),
        rewriteToPath: pathname === '/' ? '/login' : undefined,
      }
    }
  }

  // 3. Session Management
  return await updateSession(request, customContext)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
