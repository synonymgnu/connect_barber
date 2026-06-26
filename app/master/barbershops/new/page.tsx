'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import NewBarbershopForm from '@/app/_components/new-barbershop-form'

export default function NewBarbershopPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    if (status === 'authenticated' && session?.user?.role !== 'MASTER') {
      router.push('/')
    }
  }, [status, session?.user?.role, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#151619] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-violet-500" />
          <p className="mt-4 text-zinc-400">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'MASTER') {
    return null
  }

  return <NewBarbershopForm />
}
