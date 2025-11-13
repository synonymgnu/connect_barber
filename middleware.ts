import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Proteger rotas do barbeiro
    if (pathname.startsWith('/barber')) {
      if (token?.role !== 'BARBER') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Proteger rotas do dashboard admin
    if (pathname.startsWith('/dashboard')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
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
  matcher: [
    '/barber/:path*',
    '/dashboard/:path*',
  ],
}