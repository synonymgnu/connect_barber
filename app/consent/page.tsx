'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '../_components/ui/card'
import { Button } from '../_components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../_components/ui/tabs'
import Link from 'next/link'
import Header from '../_components/header'
import { Checkbox } from '../_components/ui/checkbox'
import { Field, FieldLabel } from '../_components/ui/field'
import { CircleCheck, TriangleAlert } from 'lucide-react'
import ConsentHeader from '../_components/header-consent'

const ConsentPage = () => {
  const router = useRouter()
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [acceptedLGPD, setAcceptedLGPD] = useState(false)
  const [loading, setLoading] = useState(false)

  const allAccepted = acceptedTerms && acceptedPrivacy && acceptedLGPD

  const handleAcceptAll = async () => {
    try {
      setLoading(true)
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      router.push('/')
    } catch (error) {
      console.error('Erro ao salvar consentimento:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = () => {
    alert('Você precisa aceitar os termos para usar o sistema.')
  }

  return (
    <div className="text-white">
      <ConsentHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-[#333]">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center text-white">
              Termos e Condições
            </h1>
            <p className="text-center text-sm text-gray-400 mt-2">
              Para ter acesso aos serviços do Connect Barber, você precisa
              aceitar os seguintes documentos.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="terms" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#1a1a1a]">
                <TabsTrigger
                  value="terms"
                  className="data-[state=active]:bg-[#8161FF] data-[state=active]:text-white"
                >
                  Termos de Uso
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="data-[state=active]:bg-[#8161FF] data-[state=active]:text-white"
                >
                  Privacidade
                </TabsTrigger>
                <TabsTrigger
                  value="lgpd"
                  className="data-[state=active]:bg-[#8161FF] data-[state=active]:text-white"
                >
                  LGPD
                </TabsTrigger>
              </TabsList>

              {/* Termos de Uso */}
              <TabsContent value="terms" className="mt-4 space-y-4">
                <h2 className="text-lg font-semibold text-[#8161FF]">
                  TERMOS DE USO DO SISTEMA CONNECT BARBER
                </h2>
                <p className="text-sm">
                  Leia os{' '}
                  <Link
                    href="/consent/terms-of-use"
                    className="text-[#8161FF] hover:underline"
                  >
                    Termos de Uso completos
                  </Link>
                  .
                </p>
                <Field orientation="horizontal">
                  <Checkbox
                    id="terms-checkbox"
                    name="terms-checkbox"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                  />
                  <FieldLabel htmlFor="terms-checkbox">Aceito</FieldLabel>
                </Field>
              </TabsContent>

              {/* Política de Privacidade */}
              <TabsContent value="privacy" className="mt-4 space-y-4">
                <h2 className="text-lg font-semibold text-[#8161FF]">
                  POLÍTICA DE PRIVACIDADE
                </h2>
                <p className="text-sm">
                  Leia a{' '}
                  <Link
                    href="/consent/political-privacy"
                    className="text-[#8161FF] hover:underline"
                  >
                    Política de Privacidade completa
                  </Link>
                  .
                </p>
                <Field orientation="horizontal">
                  <Checkbox
                    id="privacy-checkbox"
                    name="privacy-checkbox"
                    checked={acceptedPrivacy}
                    onCheckedChange={(checked) => setAcceptedPrivacy(!!checked)}
                  />
                  <FieldLabel htmlFor="privacy-checkbox">Aceito</FieldLabel>
                </Field>
              </TabsContent>

              {/* Política LGPD */}
              <TabsContent value="lgpd" className="mt-4 space-y-4">
                <h2 className="text-lg font-semibold text-[#8161FF]">
                  POLÍTICA LGPD
                </h2>
                <p className="text-sm">
                  Leia a{' '}
                  <Link
                    href="/consent/political-lgpd"
                    className="text-[#8161FF] hover:underline"
                  >
                    Política LGPD completa
                  </Link>
                </p>
                <Field orientation="horizontal">
                  <Checkbox
                    id="lgpd-checkbox"
                    name="lgpd-checkbox"
                    checked={acceptedLGPD}
                    onCheckedChange={(checked) => setAcceptedLGPD(!!checked)}
                  />
                  <FieldLabel htmlFor="lgpd-checkbox">Aceito</FieldLabel>
                </Field>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center pt-4 border-t border-[#333]">
              <p
                className={`text-sm flex items-center gap-1 ${allAccepted ? 'text-green-400' : 'text-red-400'}`}
              >
                {allAccepted ? (
                  <>
                    <CircleCheck className="h-4 w-4" />
                    Todos os documentos foram aceitos.
                  </>
                ) : (
                  <>
                    <TriangleAlert className="h-4 w-4" />
                    Você precisa aceitar todos os documentos.
                  </>
                )}
              </p>
              <Button
                onClick={allAccepted ? handleAcceptAll : handleReject}
                disabled={!allAccepted || loading}
                className={
                  allAccepted
                    ? 'bg-[#8161FF] hover:bg-[#7050e0]'
                    : 'bg-gray-600 cursor-not-allowed'
                }
              >
                {loading ? 'Salvando...' : 'Continuar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default ConsentPage
