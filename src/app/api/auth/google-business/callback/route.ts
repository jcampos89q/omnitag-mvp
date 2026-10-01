import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state')

  const origin = new URL(request.url).origin
  const redirectTarget = new URL('/dashboard/google-business?tab=api', origin)

  if (error || !code) {
    console.error('Google OAuth callback error:', error)
    redirectTarget.searchParams.set('error', error || 'no_code')
    return NextResponse.redirect(redirectTarget)
  }

  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const redirectUri = `${origin}/api/auth/google-business/callback`

  if (!clientId || !clientSecret) {
    redirectTarget.searchParams.set('error', 'missing_client_credentials')
    return NextResponse.redirect(redirectTarget)
  }

  try {
    // 1. Intercambiar authorization code por tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      console.error('Error exchanging Google OAuth code:', tokenData)
      redirectTarget.searchParams.set('error', tokenData.error || 'token_exchange_failed')
      return NextResponse.redirect(redirectTarget)
    }

    const { access_token, refresh_token, expires_in, scope } = tokenData
    const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000).toISOString()

    // 2. Obtener datos básicos de la cuenta de Google (email)
    let email = ''
    try {
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      })
      if (userInfoRes.ok) {
        const userInfo = await userInfoRes.json()
        email = userInfo.email || ''
      }
    } catch (e) {
      console.warn('Could not fetch Google userinfo:', e)
    }

    // 3. Guardar conexión en Supabase
    const { error: dbError } = await supabase
      .from('google_business_connections')
      .upsert({
        user_id: user.id,
        email,
        access_token,
        refresh_token: refresh_token || null,
        expires_at: expiresAt,
        scope,
        status: 'connected',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (dbError) {
      console.error('Error saving Google Business connection to database:', dbError)
      redirectTarget.searchParams.set('error', 'db_save_failed')
      return NextResponse.redirect(redirectTarget)
    }

    redirectTarget.searchParams.set('connected', 'success')
    return NextResponse.redirect(redirectTarget)
  } catch (err: any) {
    console.error('Google OAuth callback unexpected error:', err)
    redirectTarget.searchParams.set('error', err.message || 'unknown_error')
    return NextResponse.redirect(redirectTarget)
  }
}
