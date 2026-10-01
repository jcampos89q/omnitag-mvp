import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(
      new URL('/dashboard/google-business?setup_oauth=true', request.url)
    )
  }

  const redirectUri = `${new URL(request.url).origin}/api/auth/google-business/callback`
  const state = Buffer.from(JSON.stringify({ userId: user.id, timestamp: Date.now() })).toString('base64url')

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
    state
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}
