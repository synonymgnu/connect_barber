"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "../_components/ui/card";
import { Button } from "../_components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../_components/ui/tabs";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

// Seu componente de Header (opcional — remova se não quiser no consentimento)
import Header from "../_components/header";

const ConsentPage = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedLGPD, setAcceptedLGPD] = useState(false);

  const allAccepted = acceptedTerms && acceptedPrivacy && acceptedLGPD;

  const handleAcceptAll = () => {
    // Aqui você pode salvar no localStorage, cookies ou enviar para o backend
    localStorage.setItem("termsAccepted", "true");
    localStorage.setItem("privacyAccepted", "true");
    localStorage.setItem("lgpdAccepted", "true");
    // Redirecionar para o dashboard ou home
    window.location.href = "/";
  };

  const handleReject = () => {
    // Opcional: mostrar alerta ou sair
    alert("Você precisa aceitar os termos para usar o sistema.");
  };

  return (
    <div className="min-h-screen text-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className=" border-[#333]">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center text-white">
              Consentimento de Políticas
            </h1>
            <p className="text-center text-sm text-gray-400 mt-2">
              Para continuar usando o Connect Barber, você precisa aceitar os seguintes documentos.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="terms" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#1a1a1a]">
                <TabsTrigger
                  value="terms"
                  className={`data-[state=active]:bg-[#8161FF] data-[state=active]:text-white`}
                >
                  Termos de Uso
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className={`data-[state=active]:bg-[#8161FF] data-[state=active]:text-white`}
                >
                  Privacidade
                </TabsTrigger>
                <TabsTrigger
                  value="lgpd"
                  className={`data-[state=active]:bg-[#8161FF] data-[state=active]:text-white`}
                >
                  LGPD
                </TabsTrigger>
              </TabsList>

              {/* Termos de Uso */}
              <TabsContent value="terms" className="mt-4 space-y-4">
                <h2 className="text-lg font-semibold text-[#8161FF]">TERMOS DE USO DO SISTEMA CONNECT BARBER</h2>
                <p className="text-sm">
                  Leia os <Link href="/consent/terms-of-use" className="text-[#8161FF] hover:underline">Termos de Uso completos</Link>.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant={acceptedTerms ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAcceptedTerms(true)}
                    className={acceptedTerms ? "bg-[#8161FF] hover:bg-[#7050e0]" : ""}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aceito
                  </Button>
                  <Button
                    variant={acceptedTerms ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => setAcceptedTerms(false)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Não aceito
                  </Button>
                </div>
              </TabsContent>

              {/* Política de Privacidade */}
              <TabsContent value="privacy" className="mt-4 space-y-4">
                <h2 className="text-lg font-semibold text-[#8161FF]">POLÍTICA DE PRIVACIDADE</h2>
                <p className="text-sm">
                  Leia a <Link href="/consent/political-privacy" className="text-[#8161FF] hover:underline">Política de Privacidade completa</Link>.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant={acceptedPrivacy ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAcceptedPrivacy(true)}
                    className={acceptedPrivacy ? "bg-[#8161FF] hover:bg-[#7050e0]" : ""}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aceito
                  </Button>
                  <Button
                    variant={acceptedPrivacy ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => setAcceptedPrivacy(false)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Não aceito
                  </Button>
                </div>
              </TabsContent>

              {/* Política LGPD */}
              <TabsContent value="lgpd" className="mt-4 space-y-4">
                <h2 className="text-lg font-semibold text-[#8161FF]">POLÍTICA LGPD</h2>
                <p className="text-sm">
                  Leia a <Link href="/consent/political-lgpd" className="text-[#8161FF] hover:underline"> Política LGPD </Link>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant={acceptedLGPD ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAcceptedLGPD(true)}
                    className={acceptedLGPD ? "bg-[#8161FF] hover:bg-[#7050e0]" : ""}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aceito
                  </Button>
                  <Button
                    variant={acceptedLGPD ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => setAcceptedLGPD(false)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Não aceito
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Botão final */}
            <div className="flex justify-between items-center pt-4 border-t border-[#333]">
              <p className={`text-sm ${allAccepted ? "text-green-400" : "text-red-400"}`}>
                {allAccepted ? "✅ Todos os documentos foram aceitos." : "⚠️ Você precisa aceitar todos os documentos."}
              </p>
              <Button
                onClick={allAccepted ? handleAcceptAll : handleReject}
                disabled={!allAccepted}
                className={allAccepted ? "bg-[#8161FF] hover:bg-[#7050e0]" : "bg-gray-600 cursor-not-allowed"}
              >
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ConsentPage;