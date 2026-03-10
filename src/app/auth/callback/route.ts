import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

// Handles the PKCE code exchange after Supabase email confirmation.
// Supabase sends the user to /auth/callback?code=... after they click
// the confirmation link in their email.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Session is now set in cookies — redirect to dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — send back to login with an error message
  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}
