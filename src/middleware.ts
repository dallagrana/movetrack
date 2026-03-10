import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip static assets immediately
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next({ request })
  }

  // Intercept any ?code= param and forward to /auth/callback for PKCE exchange
  const code = request.nextUrl.searchParams.get('code')
  if (code && pathname !== '/auth/callback') {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    url.search = `?code=${encodeURIComponent(code)}`
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({ request })

  // @supabase/ssr v0.3.0 uses get/set/remove (not getAll/setAll)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user ?? null
  const isAuthPage = pathname === '/login' || pathname === '/register'

  console.log(`[middleware] ${pathname} | user: ${user?.email ?? 'none'}`)

  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
