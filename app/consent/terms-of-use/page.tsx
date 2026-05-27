import Link from 'next/link'
import { Card, CardContent } from '@/app/_components/ui/card'
import ConsentHeader from '@/app/_components/header-consent'

export default async function TermsOfUse() {
  return (
    <div className="min-h-screen text-white">
      <ConsentHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className=" border-[#333]">
          <CardContent className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-white">
              TERMOS DE USO DO SISTEMA CONNECT BARBER
            </h1>

            <div className="space-y-6 text-sm sm:text-base leading-relaxed">
              <section>
                <Card className="w-fit p-2 mb-3">
                  <h2 className="text-lg font-semibold text-gray-400">
                    ÚLTIMA ATUALIZAÇÃO: 23/11/2025
                  </h2>
                </Card>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  1. APRESENTAÇÃO E ACEITAÇÃO
                </h2>
                <p>
                  O presente documento, denominado Termos de Uso, estabelece as
                  regras e condições para a utilização do sistema Connect Barber
                  (doravante “Sistema”), disponibilizado sob o domínio{' '}
                  <Link
                    href="https://www.connectbarber.com.br"
                    className="text-[#8161FF] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    www.connectbarber.com.br
                  </Link>
                  .
                </p>
                <p className="mt-2">
                  Ao acessar, navegar ou utilizar qualquer funcionalidade do
                  Sistema, o usuário (doravante “Usuário” ou “Você”) declara que
                  leu, compreendeu e concorda integralmente com estes Termos de
                  Uso. Caso não concorde com qualquer disposição, o Usuário não
                  deve utilizar o Sistema.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  2. DADOS DO SISTEMA
                </h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <span className="font-medium">Nome do Sistema:</span>{' '}
                    Connect Barber
                  </li>
                  <li>
                    <span className="font-medium">URL:</span>{' '}
                    <Link
                      href="https://www.connectbarber.com.br"
                      className="text-[#8161FF] hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      www.connectbarber.com.br
                    </Link>
                  </li>
                  <li>
                    <span className="font-medium">Contato para Dúvidas:</span>{' '}
                    <Link
                      href="mailto:ctt.connectbarber@gmail.com"
                      className="text-[#8161FF] hover:underline"
                    >
                      ctt.connectbarber@gmail.com
                    </Link>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  3. OBJETIVO DO SISTEMA
                </h2>
                <p>
                  O Connect Barber é uma plataforma desenvolvida para
                  Desenvolver um sistema web completo para agendamento de
                  serviços em barbearias, tornando o processo mais acessível,
                  eficiente e seguro para clientes, barbeiros e administradores.
                  O sistema permitirá que clientes encontrem barbearias,
                  visualizem profissionais, escolham serviços e realizem
                  agendamentos com facilidade, enquanto oferece as barbearias um
                  painel administrativo intuitivo com dashboards para acompanhar
                  agendamentos, desempenho, indicadores financeiros e a gestão
                  do estabelecimento.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  4. CONDIÇÕES DE ACESSO E CADASTRO
                </h2>
                <h3 className="font-medium mt-3">4.1. Elegibilidade</h3>
                <p>
                  O acesso e uso do Sistema são destinados a pessoas maiores de
                  18 (dezoito) anos ou emancipadas, e/ou que possuam capacidade
                  civil e legal para concordar com estes Termos.
                </p>
                <h3 className="font-medium mt-3">
                  4.2. Responsabilidade do Cadastro
                </h3>
                <p>
                  Ao se cadastrar, o Usuário se compromete a fornecer
                  informações verdadeiras, completas e atualizadas. A manutenção
                  da segurança da sua conta de acesso (login e senha) é de
                  responsabilidade exclusiva do Usuário.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  5. REGRAS DE UTILIZAÇÃO E CONDUTA
                </h2>
                <p>O Usuário se compromete a não utilizar o Sistema para:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    Realizar qualquer atividade que infrinja a lei, a moral, os
                    bons costumes ou a ordem pública.
                  </li>
                  <li>
                    Distribuir ou enviar vírus, códigos maliciosos ou qualquer
                    outro software que cause dano ao Sistema, a outros Usuários
                    ou a terceiros.
                  </li>
                  <li>
                    Fazer uso de engenharia reversa, descompilação ou tentar
                    acessar o código-fonte do Sistema.
                  </li>
                  <li>
                    Violar os direitos de propriedade intelectual do Connect
                    Barber ou de terceiros.
                  </li>
                </ul>
                <p className="mt-2">
                  O descumprimento destas regras pode resultar na suspensão ou
                  cancelamento imediato da conta do Usuário, sem prejuízo das
                  medidas legais cabíveis.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  6. PROPRIEDADE INTELECTUAL
                </h2>
                <p>
                  Todo o conteúdo disponível no Sistema (incluindo, mas não se
                  limitando a, textos, gráficos, logotipos, ícones, imagens,
                  códigos, etc.) é de propriedade exclusiva do Connect Barber ou
                  de seus licenciadores e é protegido pelas leis brasileiras de
                  propriedade intelectual e direitos autorais.
                </p>
                <p className="mt-2">
                  É proibida a reprodução, cópia, distribuição, modificação ou
                  uso, total ou parcial, de qualquer conteúdo do Sistema sem a
                  autorização prévia e expressa do Connect Barber.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  7. ISENÇÃO E LIMITAÇÃO DE RESPONSABILIDADE
                </h2>
                <p>O Connect Barber não se responsabiliza por:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    Danos ou prejuízos decorrentes do uso inadequado ou indevido
                    do Sistema pelo Usuário.
                  </li>
                  <li>
                    Vírus, malwares ou outros códigos maliciosos que possam ser
                    transmitidos ou introduzidos por terceiros.
                  </li>
                  <li>
                    Falhas ou interrupções nos serviços de terceiros que afetam
                    o funcionamento do Sistema (ex: provedores de internet,
                    energia elétrica, etc.).
                  </li>
                  <li>
                    A qualidade e a prestação dos serviços agendados por meio da
                    plataforma (se aplicável), sendo esta responsabilidade
                    exclusiva da barbearia/profissional.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  8. POLÍTICA DE PRIVACIDADE
                </h2>
                <p>
                  O Connect Barber se preocupa com a segurança e privacidade dos
                  dados do Usuário. O tratamento dos dados pessoais coletados é
                  regido pela{' '}
                  <Link
                    href="/consent/political-privacy"
                    className="text-[#8161FF] hover:underline"
                  >
                    Política de Privacidade
                  </Link>
                  , documento que deve ser lido e aceito separadamente pelo
                  Usuário.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  9. DISPOSIÇÕES GERAIS
                </h2>
                <h3 className="font-medium mt-3">9.1. Modificações</h3>
                <p>
                  O Connect Barber reserva-se o direito de modificar estes
                  Termos de Uso a qualquer momento. As alterações entrarão em
                  vigor imediatamente após sua publicação no website. O uso
                  contínuo do Sistema após a publicação das modificações
                  constitui aceitação dos novos Termos.
                </p>
                <h3 className="font-medium mt-3">9.2. Comunicação</h3>
                <p>
                  Quaisquer dúvidas ou comunicações relacionadas a estes Termos
                  devem ser direcionadas ao e-mail:{' '}
                  <Link
                    href="mailto: ctt.connectbarber@gmail.com"
                    className="text-[#8161FF] hover:underline"
                  >
                    ctt.connectbarber@gmail.com
                  </Link>
                  .
                </p>
                <h3 className="font-medium mt-3">9.3. Lei Aplicável e Foro</h3>
                <p>
                  Estes Termos de Uso são regidos pelas leis da República
                  Federativa do Brasil. As partes elegem o Foro da Comarca de
                  Brasilia/DF para dirimir quaisquer dúvidas ou conflitos
                  decorrentes destes Termos, renunciando a qualquer outro, por
                  mais privilegiado que seja.
                </p>
              </section>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/consent"
                className="text-[#8161FF] font-medium hover:underline inline-block"
              >
                ← Voltar para a página inicial
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
