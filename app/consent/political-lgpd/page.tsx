import Link from 'next/link'
import { Card, CardContent } from '@/app/_components/ui/card'
import Header from '@/app/_components/header'

export default function LGPDPrivacyPolicy() {
  return (
    <div className="min-h-screen text-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className=" border-[#333]">
          <CardContent className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-white">
              POLÍTICA DE PRIVACIDADE DO CONNECT BARBER (LGPD)
            </h1>

            <div className="space-y-6 text-sm sm:text-base leading-relaxed">
              <section>
                <Card className="w-fit p-2 mb-3">
                  <h2 className="text-lg font-semibold text-gray-400">
                    ÚLTIMA ATUALIZAÇÃO: 23/11/2025
                  </h2>
                </Card>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  INTRODUÇÃO
                </h2>
                <p>
                  A presente Política de Privacidade foi elaborada para
                  reafirmar o compromisso do Connect Barber (
                  <Link
                    href="https://www.connectbarber.com.br"
                    className="text-[#8161FF] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    www.connectbarber.com.br
                  </Link>
                  ) com a segurança, a privacidade e a transparência no
                  tratamento das informações pessoais de seus Usuários. Esta
                  Política está em conformidade com a Lei Geral de Proteção de
                  Dados Pessoais (LGPD), Lei nº 13.709/2018.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  2. DEFINIÇÕES IMPORTANTES
                </h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <span className="font-medium">Dados Pessoais:</span>{' '}
                    Qualquer informação relacionada a pessoa natural
                    identificada ou identificável.
                  </li>
                  <li>
                    <span className="font-medium">Titular:</span> Pessoa natural
                    a quem se referem os dados pessoais que são objeto de
                    tratamento. No caso, Você, Usuário do Connect Barber.
                  </li>
                  <li>
                    <span className="font-medium">Tratamento:</span> Toda
                    operação realizada com dados pessoais (coleta, produção,
                    recepção, classificação, utilização, acesso, etc.).
                  </li>
                  <li>
                    <span className="font-medium">Controlador:</span> Pessoa
                    jurídica responsável pelas decisões referentes ao tratamento
                    dos dados pessoais.
                  </li>
                  <li>
                    <span className="font-medium">Operador:</span> Pessoa
                    jurídica que realiza o tratamento de dados pessoais em nome
                    do Controlador.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  3. CONTROLADOR E CONTATO
                </h2>
                <p>
                  O Connect Barber atua como o Controlador dos dados pessoais
                  tratados em seu sistema.
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
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
                    <span className="font-medium">
                      E-mail para Contato (Encarregado/DPO):
                    </span>{' '}
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
                  4. QUAIS DADOS COLETAMOS E A FINALIDADE
                </h2>
                <p>
                  Coletamos e tratamos os seguintes dados pessoais dos Usuários,
                  conforme a finalidade específica:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>
                    <span className="font-medium">Dados de Cadastro</span>, como
                    Nome Completo
                    <br />
                    <span className="text-muted-foreground">
                      Finalidade:
                    </span>{' '}
                    Identificação e individualização do Usuário.
                    <br />
                    <span className="text-muted-foreground">
                      Base Legal:
                    </span>{' '}
                    Execução de contrato.
                  </li>
                  <li>
                    <span className="font-medium">Endereço de e-mail</span>
                    <br />
                    <span className="text-muted-foreground">
                      Finalidade:
                    </span>{' '}
                    Comunicação sobre agendamentos e recuperação de acesso.
                    <br />
                    <span className="text-muted-foreground">
                      Base Legal:
                    </span>{' '}
                    Execução de contrato.
                  </li>
                  <li>
                    <span className="font-medium">Telefone/WhatsApp</span>
                    <br />
                    <span className="text-muted-foreground">
                      Finalidade:
                    </span>{' '}
                    Contato rápido para confirmação ou reagendamento de
                    serviços.
                    <br />
                    <span className="text-muted-foreground">
                      Base Legal:
                    </span>{' '}
                    Execução de contrato / Legítimo Interesse.
                  </li>
                  <li>
                    <span className="font-medium">
                      Senha de Acesso Criptografada
                    </span>
                    <br />
                    <span className="text-muted-foreground">
                      Finalidade:
                    </span>{' '}
                    Garantir a segurança e o acesso exclusivo à conta.
                    <br />
                    <span className="text-muted-foreground">
                      Base Legal:
                    </span>{' '}
                    Execução de contrato.
                  </li>
                  <li>
                    <span className="font-medium">Dados de Agendamento</span>,
                    como Data e Hora do Agendamento
                    <br />
                    <span className="text-muted-foreground">
                      Finalidade:
                    </span>{' '}
                    Prestação e registro do serviço solicitado.
                    <br />
                    <span className="text-muted-foreground">
                      Base Legal:
                    </span>{' '}
                    Execução de contrato.
                  </li>
                  <li>
                    <span className="font-medium">
                      Tipo de Serviço Contratado
                    </span>
                    <br />
                    <span className="text-muted-foreground">
                      Finalidade:
                    </span>{' '}
                    Prestação e registro do serviço solicitado.
                    <br />
                    <span className="text-muted-foreground">
                      Base Legal:
                    </span>{' '}
                    Execução de contrato.
                  </li>
                  <li>
                    <span className="font-medium">
                      Dados de Navegação (Cookies)
                    </span>
                    , como Endereço IP, Geolocalização, Histórico de Navegação
                    <br />
                    <span className="text-muted-foreground">
                      Finalidade:
                    </span>{' '}
                    Melhoria contínua da experiência do usuário, análise de
                    desempenho e segurança.
                    <br />
                    <span className="text-muted-foreground">
                      Base Legal:
                    </span>{' '}
                    Legítimo Interesse / Consentimento.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  5. COMO OS DADOS SÃO COLETADOS
                </h2>
                <p>
                  Os seus dados são coletados principalmente das seguintes
                  formas:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <span className="font-medium">
                      Fornecidos pelo Titular:
                    </span>{' '}
                    Dados inseridos diretamente por você no momento do cadastro
                    ou ao realizar um agendamento.
                  </li>
                  <li>
                    <span className="font-medium">Coleta Automática:</span>{' '}
                    Dados de navegação e utilização coletados por meio de
                    cookies ou ferramentas de análise, de forma automática, para
                    fins de segurança e melhoria do sistema.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  6. COM QUEM COMPARTILHAMOS SEUS DADOS
                </h2>
                <p>
                  O Connect Barber não vende ou aluga seus dados pessoais. O
                  compartilhamento ocorre estritamente com o objetivo de
                  executar as funcionalidades do Sistema:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <span className="font-medium">
                      Barbearias/Profissionais Parceiros:
                    </span>{' '}
                    Os dados de agendamento (nome, telefone, serviço, data/hora)
                    são compartilhados com o profissional ou a barbearia que
                    você escolheu, sendo essencial para a prestação do serviço.
                  </li>
                  <li>
                    <span className="font-medium">
                      Provedores de Serviços de TI:
                    </span>{' '}
                    Empresas que fornecem hospedagem de dados, armazenamento em
                    nuvem e ferramentas de segurança, que atuam como Operadores
                    dos dados em nosso nome, sob contrato e confidencialidade.
                  </li>
                  <li>
                    <span className="font-medium">Autoridades:</span> Para
                    cumprir obrigações legais, regulatórias ou em resposta a
                    ordens judiciais.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  7. RETENÇÃO E TÉRMINO DO TRATAMENTO
                </h2>
                <p>
                  Os seus dados pessoais serão mantidos pelo Connect Barber
                  durante o período necessário para atingir as finalidades
                  descritas nesta Política e, posteriormente, pelo prazo exigido
                  por lei (ex: para fins fiscais, contábeis ou de defesa
                  judicial).
                </p>
                <p className="mt-2">O término do tratamento ocorrerá quando:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>A finalidade for alcançada.</li>
                  <li>O Usuário solicitar a exclusão de sua conta.</li>
                  <li>
                    Houver determinação legal ou da Autoridade Nacional de
                    Proteção de Dados (ANPD).
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  8. SEUS DIREITOS COMO TITULAR (LGPD)
                </h2>
                <p>
                  Você possui direitos garantidos pela LGPD, que podem ser
                  exercidos mediante solicitação através do e-mail{' '}
                  <Link
                    href="mailto:connectbarber@gmail.com"
                    className="text-[#8161FF] hover:underline"
                  >
                    connectbarber@gmail.com
                  </Link>
                  .
                </p>
                <p className="mt-2">Os direitos são:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <span className="font-medium">Confirmação e Acesso:</span>{' '}
                    Confirmar se tratamos seus dados e acessá-los.
                  </li>
                  <li>
                    <span className="font-medium">Correção:</span> Solicitar a
                    correção de dados incompletos, inexatos ou desatualizados.
                  </li>
                  <li>
                    <span className="font-medium">
                      Anonimização, Bloqueio ou Exclusão:
                    </span>{' '}
                    Solicitar a suspensão do tratamento, ou exclusão de dados
                    desnecessários, excessivos ou tratados em desconformidade
                    com a LGPD.
                  </li>
                  <li>
                    <span className="font-medium">Portabilidade:</span> Obter a
                    transferência de seus dados para outro fornecedor de serviço
                    ou produto.
                  </li>
                  <li>
                    <span className="font-medium">
                      Revogação do Consentimento:
                    </span>{' '}
                    Revogar o consentimento para tratamento de dados realizado
                    com base nessa base legal.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  9. SEGURANÇA DOS DADOS
                </h2>
                <p>
                  O Connect Barber adota medidas técnicas e administrativas
                  aptas a proteger os dados pessoais de acessos não autorizados
                  e de situações acidentais ou ilícitas de destruição, perda,
                  alteração, comunicação ou difusão. Isso inclui, mas não se
                  limita a:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Criptografia de dados em trânsito (SSL/TLS)</li>
                  <li>
                    Criptografia de senhas (hashing) para que nunca sejam
                    armazenadas em texto simples
                  </li>
                  <li>
                    Controle de acesso estrito aos bancos de dados apenas para
                    funcionários autorizados
                  </li>
                  <li>Backups regulares</li>
                  <li>Uso de firewalls e sistemas de detecção de intrusão</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  10. ATUALIZAÇÕES DESTA POLÍTICA
                </h2>
                <p>
                  Esta Política de Privacidade poderá ser atualizada a qualquer
                  momento, visando aprimorar nossos serviços e adequar-se à
                  legislação. Recomendamos que você a revise periodicamente.
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
