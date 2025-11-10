import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Protege todas as rotas de dashboard
    if (pathname.startsWith("/dashboard")) {
        
      // Verifica se é ADMIN ou BARBER
      if (token?.role !== "ADMIN" && token?.role !== "BARBER") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    // Protege rotas de admin específicas
    if (pathname.startsWith("/dashboard/settings") || pathname.startsWith("/dashboard/barbers")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
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
  matcher: ['/bookings/:path*', '/admin/:path*'],
  
}