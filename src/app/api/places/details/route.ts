import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('place_id') || ''

  if (!placeId.trim()) {
    return NextResponse.json({ error: 'place_id es requerido' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Google Places API Key no configurada en el servidor' },
      { status: 500 }
    )
  }

  try {
    const fields = 'name,formatted_address,formatted_phone_number,international_phone_number,website,types,url'
    const url = 'https://maps.googleapis.com/maps/api/place/details/json?' + new URLSearchParams({
      place_id: placeId,
      fields,
      key: apiKey,
      language: 'es'
    })

    const res = await fetch(url)
    const data = await res.json()

    if (data.status !== 'OK') {
      console.error('Google Places Details Error:', data)
      return NextResponse.json({ error: data.status }, { status: 500 })
    }

    const result = data.result || {}
    const reviewUrl = 'https://search.google.com/local/writereview?placeid=' + placeId

    return NextResponse.json({
      place_id: placeId,
      name: result.name || '',
      formatted_address: result.formatted_address || '',
      formatted_phone_number: result.formatted_phone_number || '',
      international_phone_number: result.international_phone_number || '',
      website: result.website || '',
      types: result.types || [],
      google_maps_url: result.url || '',
      direct_review_url: reviewUrl
    })
  } catch (error: any) {
    console.error('Error fetching place details:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
