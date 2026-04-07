import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/middleware'

/**
 * Routes that never require authentication.
 * The store slug pages and the auth flow are always public.
 */
function isPublicRoute(pathname: string) {
  return (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/store/')
  )
}

export async function middleware(request: NextRequest) {
  const { response, claims } = await updateSession(request)
  const { pathname } = request.nextUrl

  if (isPublicRoute(pathname)) return response

  // Unauthenticated user hitting a protected route → login
  if (!claims) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    const redirect = NextResponse.redirect(url)
    // Copy session cookies so the refresh isn't lost
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
