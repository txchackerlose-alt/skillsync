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

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    request.nextUrl.pathname !== '/'
  ) {
    // no user, potentially respond by redirecting the user to the login page
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Handle role-based redirects if logged in and trying to access root or opposite role
  if (user) {
    // We need to know the role. Since we store role in metadata, we check it first.
    let role = user.user_metadata?.role
    
    // If user was created manually, role won't be in metadata, so we fetch it from profiles table
    if (!role) {
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      role = data?.role || 'employee'
    }
    
    if (request.nextUrl.pathname === '/') {
      url.pathname = `/${role}`
      return NextResponse.redirect(url)
    }

    if (request.nextUrl.pathname.startsWith('/manager') && role !== 'manager') {
      url.pathname = '/employee'
      return NextResponse.redirect(url)
    }

    if (request.nextUrl.pathname.startsWith('/employee') && role !== 'employee') {
      url.pathname = '/manager'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
