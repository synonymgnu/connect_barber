import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    if (pathname.startsWith('/barber')) {
      const isBarber = token?.role === 'BARBER'
      const isOwnerWithBarberProfile =
        token?.role === 'ADMIN' && !!token?.barberId

      if (!isBarber && !isOwnerWithBarberProfile) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    if (pathname.startsWith('/dashboard')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    if (pathname.startsWith('/master')) {
      if (token?.role !== 'MASTER') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    if (pathname.startsWith('/audit-logs')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Rotas públicas
        const publicPaths = [
          '/',
          '/api/auth',
          '/auth',
          '/signin',
          '/api/barbershops',
          '/barbershops',
        ]

        const isPublicPath = publicPaths.some(
          (path) => pathname === path || pathname.startsWith(`${path}/`)
        )

        if (isPublicPath) {
          return true
        }

        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/barber/:path*',
    '/dashboard/:path*',
    '/master/:path*',
    '/audit-logs/:path*',
    '/audit-logs',
  ],
}
