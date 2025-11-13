"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

interface AuthCheckProps {
  children: React.ReactNode
  requiredRole?: 'CLIENT' | 'BARBER' | 'ADMIN'
}

export default function AuthCheck({ children, requiredRole }: AuthCheckProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      // Não autenticado, redirecionar para login com callback
      const callbackUrl = encodeURIComponent(pathname)
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`)
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      // Não tem a role necessária
      console.log(`User role: ${session.user.role}, Required: ${requiredRole}`)
      router.push('/')
      return
    }
  }, [session, status, requiredRole, router, pathname])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8161FF]"></div>
      </div>
    )
  }

  if (!session || (requiredRole && session.user.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}