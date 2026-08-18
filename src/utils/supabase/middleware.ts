import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           (request.nextUrl.pathname.startsWith('/assessment') && !request.nextUrl.pathname.includes('/login') && !request.nextUrl.pathname.includes('/reset-password')) ||
                           (request.nextUrl.pathname.startsWith('/representative') && !request.nextUrl.pathname.includes('/login') && !request.nextUrl.pathname.includes('/reset-password')) ||
                           (request.nextUrl.pathname.startsWith('/complaint') && !request.nextUrl.pathname.includes('/login') && !request.nextUrl.pathname.includes('/reset-password'))

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth/login')

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    if (request.nextUrl.pathname.startsWith('/representative')) {
      url.pathname = '/representative/login'
    } else if (request.nextUrl.pathname.startsWith('/assessment')) {
      url.pathname = '/assessment/login'
    } else if (request.nextUrl.pathname.startsWith('/complaint')) {
      url.pathname = '/complaint/login'
    } else {
      url.pathname = '/auth/login'
    }
    return NextResponse.redirect(url)
  }

  if (isProtectedRoute && user) {
    const needsPasswordChange = user.user_metadata?.force_password_change || user.user_metadata?.requires_password_change;
    const isChangePasswordRoute = request.nextUrl.pathname.includes('/change-password');

    if (needsPasswordChange && !isChangePasswordRoute) {
      const url = request.nextUrl.clone();
      
      if (request.nextUrl.pathname.startsWith('/representative')) {
        url.pathname = '/representative/change-password';
      } else if (request.nextUrl.pathname.startsWith('/assessment')) {
        url.pathname = '/assessment/change-password';
      } else {
        url.pathname = '/auth/change-password';
      }
      return NextResponse.redirect(url);
    }
  }

  if (isAuthRoute && user && !request.nextUrl.searchParams.has('error')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
