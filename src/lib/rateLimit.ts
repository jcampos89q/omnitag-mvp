import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

interface RateLimitRecord {
  count: number
  resetTime: number
}

// In-memory cache for sliding window rate limiting
const ipCache = new Map<string, RateLimitRecord>()

// Clean up expired entries every 60 seconds or when cache gets large
let lastCleanup = Date.now()
const CLEANUP_INTERVAL_MS = 60 * 1000
const MAX_CACHE_SIZE = 10000

function cleanupExpired() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS && ipCache.size < MAX_CACHE_SIZE) {
    return
  }

  lastCleanup = now
  for (const [key, record] of ipCache.entries()) {
    if (now > record.resetTime) {
      ipCache.delete(key)
    }
  }
}

/**
 * Extracts the real client IP address from request headers
 */
export function getClientIp(request: NextRequest): string {
  // Cloudflare Connecting IP
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()

  // X-Forwarded-For (take the first / client IP)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim()
    if (firstIp) return firstIp
  }

  // X-Real-IP
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'anonymous'
}

/**
 * Checks in-memory rate limit for a specific key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  cleanupExpired()

  const now = Date.now()
  const record = ipCache.get(key)

  if (!record || now > record.resetTime) {
    const newResetTime = now + config.windowMs
    ipCache.set(key, { count: 1, resetTime: newResetTime })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newResetTime
    }
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime
    }
  }

  record.count += 1
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime
  }
}

/**
 * Determines rate limit rules based on the request pathname
 */
export function getRateLimitRule(pathname: string): RateLimitConfig | null {
  // Only apply rate limiting to API routes
  if (!pathname.startsWith('/api')) {
    return null
  }

  // Strict limits for game/wheel and gift-card/redeem endpoints (prevent spin botting)
  if (pathname.startsWith('/api/wheel/')) {
    return { maxRequests: 20, windowMs: 60 * 1000 } // 20 requests per minute
  }

  // Authentication endpoints
  if (pathname.startsWith('/api/auth/')) {
    return { maxRequests: 25, windowMs: 60 * 1000 } // 25 requests per minute
  }

  // Wallet and pass generation endpoints
  if (pathname.startsWith('/api/wallet/')) {
    return { maxRequests: 30, windowMs: 60 * 1000 } // 30 requests per minute
  }

  // General API endpoints default limit
  return { maxRequests: 60, windowMs: 60 * 1000 } // 60 requests per minute
}

/**
 * Returns a 429 response when rate limit is exceeded
 */
export function createRateLimitResponse(resetTime: number): NextResponse {
  const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000))

  return NextResponse.json(
    {
      error: 'Demasiadas solicitudes. Por favor espera unos momentos antes de reintentar.',
      retryAfter: retryAfterSeconds
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfterSeconds.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': resetTime.toString()
      }
    }
  )
}
