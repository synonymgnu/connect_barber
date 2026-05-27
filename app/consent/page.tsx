'use client'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../_components/ui/tabs'
import Link from 'next/link'
import ConsentHeader from '../_components/header-consent'
import { Card, CardContent, CardHeader } from '../_components/ui/card'

const ConsentPage = () => {
  return (
    <div className="text-white">
      <ConsentHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-[#333]">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center text-white">
              Termos e Condições
            </h1>
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default ConsentPage
