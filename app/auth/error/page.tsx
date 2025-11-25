"use client"

import { useSearchParams } from 'next/navigation'
import { Button } from '@/app/_components/ui/button'
import Link from 'next/link'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return 'Este email já está associado a outra conta. Por favor, faça login usando o método original.'
      case 'AccessDenied':
        return 'Você não tem permissão para acessar esta página.'
      default:
        return 'Ocorreu um erro durante a autenticação. Tente novamente.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A]">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Erro de Autenticação
          </h1>
          <p className="text-gray-400 mb-8">
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-6 shadow-2xl">
          <div className="space-y-4 text-center">
            <div className="text-red-400 text-lg mb-4">
              {getErrorMessage(error)}
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full bg-[#8161FF] hover:bg-[#6a4dff]">
                <Link href="/auth/signin">
                  Tentar Novamente
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Voltar para Início
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-white">Carregando...</div></div>}>
      <AuthErrorContent />
    </Suspense>
  )
}