import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE_NAME = 'ves_session'

const protectedPrefixes = ['/app']
const authPaths = ['/auth/sign-in']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value

  // Redirect unauthenticated users away from protected routes
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))
  if (isProtected && !sessionCookie) {
    const signInUrl = new URL('/auth/sign-in', request.url)
    signInUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect authenticated users away from auth pages
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p))
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL('/app/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/auth/:path*'],
}
