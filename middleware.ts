import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Bloqueia se não for ADMIN ou BARBER
    if (pathname.startsWith('/dashboard')) {
      if (token?.role !== 'ADMIN' && token?.role !== 'BARBER') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Bloqueia se não for ADMIN
    if (
      pathname.startsWith('/dashboard/settings') ||
      pathname.startsWith('/dashboard/barbers')
    ) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/bookings/:path*', '/admin/:path*'],
}
