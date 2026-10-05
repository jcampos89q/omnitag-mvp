import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(
      new URL('/dashboard/google-business?tab=api&error=missing_credentials_in_vercel', request.url)
    )
  }

  const redirectUri = `${new URL(request.url).origin}/api/auth/google-business/callback`
  const csrfToken = crypto.randomBytes(32).toString('hex')
  const state = Buffer.from(JSON.stringify({ 
    userId: user.id, 
    csrf: csrfToken, 
    timestamp: Date.now() 
  })).toString('base64url')

  const scopes = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/business.manage'
  ].join(' ')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state
  })

  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)

  // Store CSRF state token in HttpOnly secure cookie valid for 10 minutes
  response.cookies.set('google_oauth_state', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/'
  })

  return response
}
