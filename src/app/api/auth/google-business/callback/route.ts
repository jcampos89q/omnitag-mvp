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

  const makeRedirect = (url: URL) => {
    const res = NextResponse.redirect(url)
    res.cookies.delete('google_oauth_state')
    return res
  }

  if (error || !code) {
    console.error('Google OAuth callback error:', error)
    redirectTarget.searchParams.set('error', error || 'no_code')
    return makeRedirect(redirectTarget)
  }

  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    return makeRedirect(new URL('/login', request.url))
  }

  // Validate CSRF state
  const savedStateCookie = request.cookies.get('google_oauth_state')?.value
  if (!state || !savedStateCookie) {
    console.error('Google OAuth CSRF state missing')
    redirectTarget.searchParams.set('error', 'invalid_state')
    return makeRedirect(redirectTarget)
  }

  try {
    const parsedState = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'))
    if (!parsedState?.csrf || parsedState.csrf !== savedStateCookie) {
      console.error('Google OAuth CSRF token mismatch')
      redirectTarget.searchParams.set('error', 'csrf_mismatch')
      return makeRedirect(redirectTarget)
    }

    if (parsedState.userId && parsedState.userId !== user.id) {
      console.error('Google OAuth user session mismatch')
      redirectTarget.searchParams.set('error', 'user_mismatch')
      return makeRedirect(redirectTarget)
    }
  } catch (stateErr) {
    console.error('Google OAuth state parse error:', stateErr)
    redirectTarget.searchParams.set('error', 'invalid_state_format')
    return makeRedirect(redirectTarget)
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const redirectUri = `${origin}/api/auth/google-business/callback`

  if (!clientId || !clientSecret) {
    redirectTarget.searchParams.set('error', 'missing_client_credentials')
    return makeRedirect(redirectTarget)
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
      return makeRedirect(redirectTarget)
    }

    const { access_token, refresh_token, expires_in, scope } = tokenData
    const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000).toISOString()

    // 2. Comprobar si el usuario autorizó los permisos de gestión comercial (business.manage)
    const hasBusinessScope = typeof scope === 'string' && scope.includes('business.manage')
    if (!hasBusinessScope) {
      console.warn('Google OAuth returned token without business.manage scope:', scope)
      redirectTarget.searchParams.set('error', 'missing_business_scope')
      return makeRedirect(redirectTarget)
    }

    // 3. Obtener datos básicos de la cuenta de Google (email)
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

    // 4. Intentar descubrir el Account ID y Location ID de Google Business Profile
    let accountId = ''
    let locationId = ''
    let businessName = ''
    let status = 'connected'

    try {
      // 4a. Consultar cuentas de negocio
      const accRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: { Authorization: `Bearer ${access_token}` }
      })
      if (accRes.ok) {
        const accData = await accRes.json()
        const primaryAccount = accData.accounts?.[0]
        if (primaryAccount?.name) {
          accountId = primaryAccount.name // e.g. "accounts/102938475"
          
          // 4b. Consultar ubicaciones (fichas) de la cuenta
          const locRes = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${primaryAccount.name}/locations?readMask=name,title,storefrontAddress`,
            { headers: { Authorization: `Bearer ${access_token}` } }
          )
          if (locRes.ok) {
            const locData = await locRes.json()
            const primaryLocation = locData.locations?.[0]
            if (primaryLocation?.name) {
              locationId = primaryLocation.name // e.g. "locations/98765432"
              businessName = primaryLocation.title || ''
            }
          }
        }
      } else {
        console.warn('Google Business Account Management API response:', accRes.status, await accRes.text())
      }
    } catch (e) {
      console.warn('Error discovering Google Business accounts/locations:', e)
    }

    // 5. Guardar conexión en Supabase
    const { error: dbError } = await supabase
      .from('google_business_connections')
      .upsert({
        user_id: user.id,
        email,
        business_name: businessName || null,
        account_id: accountId || null,
        location_id: locationId || null,
        access_token,
        refresh_token: refresh_token || null,
        expires_at: expiresAt,
        scope,
        status,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (dbError) {
      console.error('Error saving Google Business connection to database:', dbError)
      redirectTarget.searchParams.set('error', 'db_save_failed')
      return makeRedirect(redirectTarget)
    }

    redirectTarget.searchParams.set('connected', 'success')
    return makeRedirect(redirectTarget)
  } catch (err: any) {
    console.error('Google OAuth callback unexpected error:', err)
    redirectTarget.searchParams.set('error', err.message || 'unknown_error')
    return makeRedirect(redirectTarget)
  }
}
