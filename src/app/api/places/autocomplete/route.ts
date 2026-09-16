import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get('input') || ''

  if (!input.trim() || input.trim().length < 2) {
    return NextResponse.json({ predictions: [] })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Google Places API Key no configurada en el servidor' },
      { status: 500 }
    )
  }

  try {
    const lat = searchParams.get('lat') || request.headers.get('x-vercel-ip-latitude') || '15.5'
    const lng = searchParams.get('lng') || request.headers.get('x-vercel-ip-longitude') || '-88.0'

    const params: Record<string, string> = {
      input,
      key: apiKey,
      language: 'es',
      location: `${lat},${lng}`,
      radius: '60000'
    }

    const url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?' + new URLSearchParams(params)

    const res = await fetch(url)
    const data = await res.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places Autocomplete Error:', data)
      return NextResponse.json({ predictions: [], error: data.status })
    }

    const predictions = (data.predictions || []).map((p: any) => ({
      place_id: p.place_id,
      description: p.description,
      main_text: p.structured_formatting?.main_text || p.description,
      secondary_text: p.structured_formatting?.secondary_text || '',
      types: p.types || []
    }))

    return NextResponse.json({ predictions })
  } catch (error: any) {
    console.error('Error fetching places autocomplete:', error)
    return NextResponse.json({ predictions: [], error: error.message }, { status: 500 })
  }
}
