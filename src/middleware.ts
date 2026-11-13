import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { getClientIp, getRateLimitRule, checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit'
import { isMainPlatformHost, normalizeDomain, resolvePartnerByDomain } from '@/lib/whitelabel'

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

  // 2. Resolución de Dominio Personalizado Marca Blanca (Opción 1)
  const rawHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  let customContext:
    | { partnerId?: string; customDomain?: string; rewriteToPath?: string }
    | undefined

  if (!isMainPlatformHost(rawHost)) {
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
