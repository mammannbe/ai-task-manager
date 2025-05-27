// src/app/api/google-calendar-auth/route.ts (Optional für echte Google Calendar Integration)
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Google OAuth2 Flow für Calendar-Zugriff
  const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&` +
    `scope=https://www.googleapis.com/auth/calendar&` +
    `response_type=code&` +
    `access_type=offline&` +
    `prompt=consent`

  return NextResponse.json({ authUrl })
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI
      })
    })

    const tokens = await tokenResponse.json()
    
    // Speichere Tokens in Supabase für den User
    // const { data, error } = await supabase.from('user_tokens').upsert({
    //   user_id: 'current-user-id',
    //   google_access_token: tokens.access_token,
    //   google_refresh_token: tokens.refresh_token,
    //   expires_at: new Date(Date.now() + tokens.expires_in * 1000)
    // })

    return NextResponse.json({ success: true, message: 'Kalender-Zugriff gewährt' })

  } catch (error) {
    console.error('Google Auth Fehler:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Google-Authentifizierung' },
      { status: 500 }
    )
  }
}