import Link from 'next/link'
import Header from '@/app/_components/header'
import { Card, CardContent } from '@/app/_components/ui/card'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen text-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className=" border-[#333]">
          <CardContent className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-white">
              POLÍTICA DE PRIVACIDADE
            </h1>

            <div className="space-y-6 text-sm sm:text-base leading-relaxed">
              <section>
                <Card className="w-fit p-2 mb-3">
                  <h2 className="text-lg font-semibold text-gray-400">
                    ÚLTIMA ATUALIZAÇÃO: 23/11/2025
                  </h2>
                </Card>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  1. INTRODUÇÃO E DADOS DO CONTROLADOR
                </h2>
                <p>
                  Esta Política de Privacidade visa dar transparência sobre como
                  o sistema Connect Barber coleta, utiliza, armazena, e protege
                  os dados pessoais dos usuários.
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
                    <span className="font-medium">Controlador (Empresa):</span>{' '}
                    [Insira o nome da sua empresa/CNPJ]
                  </li>
                  <li>
                    <span className="font-medium">
                      Contato do Encarregado de Dados (DPO):
                    </span>{' '}
                    <Link
                      href="mailto:ctt.connectbarber@gmail.com"
                      className="text-[#8161FF] hover:underline"
                    >
                      ctt.connectbarber@gmail.com
                    </Link>
                  </li>
                </ul>
                <p className="mt-3">
                  Ao utilizar o Sistema, você concorda com o tratamento dos seus
                  dados conforme descrito nesta política.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  2. QUAIS DADOS SÃO COLETADOS?
                </h2>
                <p>
                  Coletamos os seguintes tipos de dados pessoais, dependendo do
                  seu uso da plataforma:
                </p>
                <h3 className="font-medium mt-3">
                  2.1. Dados Fornecidos pelo Usuário (Cadastro)
                </h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <span className="font-medium">
                      Barbeiro/Estabelecimento:
                    </span>{' '}
                    Nome/Razão Social, CPF/CNPJ, Endereço completo, Telefone de
                    contato, E-mail, Dados bancários (para recebimento de
                    pagamentos, se aplicável).
                  </li>
                  <li>
                    <span className="font-medium">Cliente:</span> Nome completo,
                    Telefone de contato, E-mail.
                  </li>
                </ul>
                <h3 className="font-medium mt-3">
                  2.2. Dados de Uso e Navegação (Coleta Automática)
                </h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    Endereço IP, data e hora de acesso, localização geográfica
                    aproximada.
                  </li>
                  <li>
                    Informações sobre o dispositivo (navegador, sistema
                    operacional).
                  </li>
                  <li>
                    Dados de cliques e páginas visitadas (via Cookies,
                    Analytics).
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  3. QUAL A FINALIDADE DA COLETA?
                </h2>
                <p className="mb-2">
                  Os dados coletados são estritamente necessários para as
                  seguintes finalidades:
                </p>
                <table className="w-full text-sm mt-2 border-collapse">
                  <thead>
                    <tr className="border-b border-[#333]">
                      <th className="text-left py-2 px-1 font-medium">
                        Dado Coletado
                      </th>
                      <th className="text-left py-2 px-1 font-medium">
                        Finalidade Específica (Para que serve?)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#333]">
                      <td className="py-2 px-1">Nome e E-mail</td>
                      <td className="py-2 px-1">
                        Identificar o usuário e comunicar sobre agendamentos e
                        alterações.
                      </td>
                    </tr>
                    <tr className="border-b border-[#333]">
                      <td className="py-2 px-1">Telefone de Contato</td>
                      <td className="py-2 px-1">
                        Enviar lembretes de agendamento (via SMS ou WhatsApp).
                      </td>
                    </tr>
                    <tr className="border-b border-[#333]">
                      <td className="py-2 px-1">CPF/CNPJ e Dados Bancários</td>
                      <td className="py-2 px-1">
                        Efetuar o cadastro da empresa e processar transações
                        financeiras (se o Connect Barber processar pagamentos).
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-1">Endereço IP e Uso</td>
                      <td className="py-2 px-1">
                        Garantir a segurança da plataforma e monitorar o
                        desempenho para melhorias.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  4. BASE LEGAL DO TRATAMENTO
                </h2>
                <p>
                  O tratamento dos seus dados pessoais é realizado em
                  conformidade com a Lei Geral de Proteção de Dados (Lei nº
                  13.709/2018 – LGPD) e se baseia principalmente nas seguintes
                  hipóteses legais:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <span className="font-medium">Execução de Contrato:</span>{' '}
                    Para cumprir a relação estabelecida com você (ex: usar seu
                    nome e e-mail para efetivar e gerenciar um agendamento
                    solicitado).
                  </li>
                  <li>
                    <span className="font-medium">
                      Cumprimento de Obrigação Legal ou Regulatória:
                    </span>{' '}
                    Para atender a requisições de autoridades ou leis
                    aplicáveis.
                  </li>
                  <li>
                    <span className="font-medium">Consentimento:</span> Em casos
                    específicos onde a lei exige (ex: envio de comunicações de
                    marketing não essenciais).
                  </li>
                  <li>
                    <span className="font-medium">Legítimo Interesse:</span>{' '}
                    Para melhoria do sistema, segurança e prevenção de fraudes.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  5. COMPARTILHAMENTO DE DADOS
                </h2>
                <p>
                  O Connect Barber não comercializa dados pessoais. O
                  compartilhamento ocorre apenas quando estritamente necessário
                  e sob rigoroso controle:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <span className="font-medium">Barbeiro e Cliente:</span>{' '}
                    Para viabilizar o serviço, o Cliente compartilha seu nome e
                    contato com o Barbeiro, e vice-versa.
                  </li>
                  <li>
                    <span className="font-medium">Provedores de Serviço:</span>{' '}
                    Empresas terceirizadas que prestam serviços essenciais (ex:
                    Hospedagem de dados, plataformas de pagamento, serviços de
                    e-mail marketing e ferramentas de análise de tráfego, como o
                    Google Analytics).
                  </li>
                  <li>
                    <span className="font-medium">Autoridades:</span> Em
                    cumprimento de decisões judiciais ou requisições legais.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  6. ARMAZENAMENTO E SEGURANÇA
                </h2>
                <p>
                  Os dados são armazenados em servidores seguros e o Connect
                  Barber adota medidas técnicas e administrativas para
                  protegê-los contra acesso não autorizado, destruição, perda,
                  alteração ou divulgação indevida.
                </p>
                <p className="mt-2">
                  Os dados são mantidos apenas pelo tempo necessário para
                  cumprir as finalidades descritas nesta política ou para o
                  cumprimento de obrigações legais.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  7. DIREITOS DO TITULAR DOS DADOS
                </h2>
                <p>
                  A LGPD garante a você, como titular dos dados, os seguintes
                  direitos:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Confirmação da existência de tratamento.</li>
                  <li>Acesso aos dados.</li>
                  <li>
                    Correção de dados incompletos, inexatos ou desatualizados.
                  </li>
                  <li>
                    Anonimização, bloqueio ou eliminação de dados
                    desnecessários.
                  </li>
                  <li>
                    Portabilidade a outro fornecedor de serviço ou produto.
                  </li>
                  <li>
                    Eliminação dos dados pessoais tratados com base no seu
                    consentimento.
                  </li>
                  <li>Informação sobre o compartilhamento de dados.</li>
                  <li>Revogação do consentimento.</li>
                </ul>
                <p className="mt-3">
                  Você pode exercer estes direitos enviando uma solicitação para
                  o e-mail do Encarregado:{' '}
                  <Link
                    href="mailto:ctt.connectbarber@gmail.com"
                    className="text-[#8161FF] hover:underline"
                  >
                    ctt.connectbarber@gmail.com
                  </Link>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 text-[#8161FF]">
                  8. ATUALIZAÇÕES DESTA POLÍTICA
                </h2>
                <p>
                  Esta Política de Privacidade pode ser atualizada a qualquer
                  momento para garantir a conformidade legal. A versão mais
                  recente será sempre publicada no website. Recomendamos a
                  consulta periódica.
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
