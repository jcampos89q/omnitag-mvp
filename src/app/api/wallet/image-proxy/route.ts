import { NextRequest, NextResponse } from 'next/server'

// Maximum allowed image size in bytes (10 MB)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

// Allowed domains for proxying images
const ALLOWED_DOMAIN_PATTERNS = [
  /\.supabase\.co$/,
  /\.unsplash\.com$/,
  /\.cloudinary\.com$/,
  /\.googleusercontent\.com$/,
  /\.omnitag\.site$/,
  /^omnitag\.site$/,
  /omnitag.*\.vercel\.app$/,
]

function isAllowedHost(hostname: string): boolean {
  const lowerHost = hostname.toLowerCase()

  // Disallow localhost, private IPs, loopback, and local network addresses
  if (
    lowerHost === 'localhost' ||
    lowerHost.endsWith('.local') ||
    lowerHost.endsWith('.internal') ||
    lowerHost.endsWith('.lan') ||
    /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|169\.254\.|0\.)/.test(lowerHost) ||
    lowerHost.includes(':') // IPv6
  ) {
    return false
  }

  // Also allow the configured Supabase hostname from environment if available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl) {
    try {
      const parsedSupabase = new URL(supabaseUrl)
      if (lowerHost === parsedSupabase.hostname.toLowerCase()) {
        return true
      }
    } catch {
      // ignore
    }
  }

  return ALLOWED_DOMAIN_PATTERNS.some(pattern => pattern.test(lowerHost))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return new NextResponse('URL no proporcionada', { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(imageUrl)
  } catch {
    return new NextResponse('URL no válida', { status: 400 })
  }

  // Enforce HTTPS
  if (parsedUrl.protocol !== 'https:') {
    return new NextResponse('Solo se permiten URLs HTTPS', { status: 400 })
  }

  // Enforce allowed hosts to prevent SSRF
  if (!isAllowedHost(parsedUrl.hostname)) {
    return new NextResponse('Dominio no autorizado para proxy de imágenes', { status: 403 })
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OmniTagProxy/1.0)'
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return new NextResponse('No se pudo obtener la imagen del servidor origen', { status: response.status })
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.toLowerCase().startsWith('image/')) {
      return new NextResponse('El recurso solicitado no es una imagen válida', { status: 400 })
    }

    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_SIZE) {
      return new NextResponse('La imagen excede el tamaño máximo permitido (10MB)', { status: 413 })
    }

    const arrayBuffer = await response.arrayBuffer()
    if (arrayBuffer.byteLength > MAX_IMAGE_SIZE) {
      return new NextResponse('La imagen excede el tamaño máximo permitido (10MB)', { status: 413 })
    }

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  } catch (err: any) {
    console.error('Error en image-proxy:', err)
    return new NextResponse('Error al procesar la imagen', { status: 500 })
  }
}
