'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/app/_components/ui/button'
import Image from 'next/image'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    // Verificar se já está autenticado
    const checkAuth = async () => {
      const session = await getSession()
      if (session) {
        router.push(callbackUrl)
      }
    }
    checkAuth()
  }, [router, callbackUrl])

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn('google', {
        callbackUrl,
        redirect: true,
      })
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br  to-[#1A1A1A]">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Connect Barber</h1>
          <p className="text-gray-400 mb-8">
            Faça login para acessar sua conta
          </p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-6 shadow-2xl">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                Entrar na Plataforma
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                Escolha uma forma de login
              </p>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="hover:bg-primary w-full  text-white font-semibold py-3 px-4 rounded-lg border border-gray-300 transition-all duration-200 flex items-center justify-center gap-3"
              size="lg"
            >
              <Image src="/google.svg" alt="Google" width={20} height={20} />
              Continuar com Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-white">Carregando...</div></div>}>
      <SignInContent />
    </Suspense>
  )
}
