import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl || !imageUrl.startsWith('http')) {
    return new NextResponse('URL no válida', { status: 400 })
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        // Simular solicitud estándar
        'User-Agent': 'Mozilla/5.0 (compatible; OmniTagProxy/1.0)'
      }
    })

    if (!response.ok) {
      return new NextResponse('No se pudo obtener la imagen', { status: response.status })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const arrayBuffer = await response.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        // Permitir a Google Wallet y navegadores almacenar en caché sin bloqueo de robots
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (err: any) {
    console.error('Error en image-proxy:', err)
    return new NextResponse('Error al procesar la imagen', { status: 500 })
  }
}
