import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { YouTubeButton } from "@/components/common/YouTubeButton";

export const Route = createFileRoute("/regulamento")({
  component: RegulamentoPage,
});

function SectionTitle({ number, title }: { number: number; title: string }) {
  return (
    <h2 className="flex items-center gap-3 text-xl font-black text-gray-900 mt-8 mb-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-white shrink-0">
        {number}
      </span>
      {title}
    </h2>
  );
}

function ImportantBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 border-l-4 border-amber-400 p-4 my-4 text-sm text-gray-700">
      {children}
    </div>
  );
}

function RegulamentoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header />

      <main className="container mx-auto px-4 pb-16 max-w-3xl">
        {/* Hero */}
        <section className="py-8 text-center">
          <div className="text-5xl mb-3">📜</div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Regulamento do Desafio da Copa
          </h1>
          <p className="text-amber-600 font-semibold text-lg mb-2">
            Luana Queiroz e Família — Copa do Mundo 2026
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Leia com atenção antes de participar. Esta é uma brincadeira familiar e segura!
          </p>
        </section>

        <div className="rounded-3xl bg-white border border-amber-200 shadow-md p-6 sm:p-8 space-y-1">
          {/* Intro */}
          <ImportantBox>
            <strong>Este desafio é uma brincadeira familiar e recreativa</strong> ligada ao canal{" "}
            <strong>Luana Queiroz e Família</strong>. Para participar, monte seu palpite da Copa do
            Mundo 2026, informe seu nome e cidade, confirme que está inscrito(a) no canal e gere
            seu comprovante em PDF.
          </ImportantBox>

          <div className="rounded-2xl bg-green-50 border border-green-300 p-4 text-sm text-green-800 font-semibold">
            ✅ Esta ação <strong>não envolve pagamento, aposta, compra de produto ou qualquer tipo
            de valor financeiro</strong> para participar.
          </div>

          {/* 1. Como participar */}
          <SectionTitle number={1} title="Como participar" />
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 pl-2">
            <li>Acesse o site do canal Luana Queiroz e Família.</li>
            <li>Clique em <strong>Simulador</strong>.</li>
            <li>Preencha seu nome e cidade.</li>
            <li>Inscreva-se no canal no YouTube e confirme sua participação.</li>
            <li>Aceite este regulamento.</li>
            <li>Monte seu chaveamento escolhendo os vencedores e placares de cada jogo.</li>
            <li>Escolha seu campeão da Copa.</li>
            <li>Gere e salve seu PDF com o código único do palpite.</li>
          </ol>

          {/* 2. Pontuação */}
          <SectionTitle number={2} title="Como funciona a pontuação" />
          <p className="text-sm text-gray-600 mb-3">
            A pontuação é calculada automaticamente conforme os resultados reais da Copa saem.
            Cada jogo vale de 0 a 10 pontos:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-amber-100">
                  <th className="text-left p-2 rounded-tl-xl font-black text-gray-700">Acerto</th>
                  <th className="text-right p-2 rounded-tr-xl font-black text-gray-700">Pontos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["🎯 Placar exato + vencedor correto", "10"],
                  ["✅ Vencedor correto + diferença de gols certa", "8"],
                  ["✅ Vencedor correto + gols de um time certos", "7"],
                  ["✅ Apenas vencedor correto", "6"],
                  ["✅ Empate correto (placar diferente)", "6"],
                  ["⚡ Gols de um time corretos (errou vencedor)", "3"],
                  ["⚡ Total de gols correto", "2"],
                  ["❌ Não acertou nada", "0"],
                ].map(([label, pts]) => (
                  <tr key={label} className="hover:bg-gray-50">
                    <td className="p-2 text-gray-700">{label}</td>
                    <td className="p-2 text-right font-black text-amber-600">{pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-600 mt-3 font-semibold">Para mata-mata com pênaltis:</p>
          <div className="overflow-x-auto mt-1">
            <table className="w-full text-sm border-collapse">
              <tbody className="divide-y divide-gray-100">
                {[
                  ["🎯 Placar exato + classificado correto", "10"],
                  ["✅ Empate correto + classificado correto", "8"],
                  ["⚡ Empate correto, classificado errado", "6"],
                  ["✅ Classificado correto, sem acertar empate", "5"],
                  ["⚡ Gols de um time corretos", "3"],
                  ["❌ Não acertou nada", "0"],
                ].map(([label, pts]) => (
                  <tr key={label} className="hover:bg-gray-50">
                    <td className="p-2 text-gray-700">{label}</td>
                    <td className="p-2 text-right font-black text-amber-600">{pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. Desempate */}
          <SectionTitle number={3} title="Critérios de desempate" />
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 pl-2">
            <li>Maior número de placares exatos (🎯).</li>
            <li>Maior número de vencedores corretos (✅).</li>
            <li>Palpite enviado primeiro, considerando horário de Brasília.</li>
          </ol>

          {/* 4. Inscrição */}
          <SectionTitle number={4} title="Inscrição no canal" />
          <p className="text-sm text-gray-700">
            Para participar, é necessário estar inscrito(a) no canal{" "}
            <a
              href="https://www.youtube.com/@Luanaqueirozefamilia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 font-bold hover:underline"
            >
              Luana Queiroz e Família
            </a>{" "}
            no YouTube. A confirmação é feita de forma declaratória no formulário. A organização
            poderá verificar manualmente as inscrições antes de confirmar os resultados do ranking.
          </p>
          <div className="mt-3">
            <YouTubeButton variant="compact" label="Inscrever-se no canal" />
          </div>

          {/* 5. Ranking */}
          <SectionTitle number={5} title="Divulgação do ranking" />
          <p className="text-sm text-gray-700">
            O ranking é atualizado automaticamente conforme os jogos da Copa são finalizados.
            O ranking público mostra apenas: posição, nome, cidade e pontuação. Nenhum dado
            sensível é exibido publicamente.
          </p>

          {/* 6. Privacidade */}
          <SectionTitle number={6} title="Privacidade (LGPD)" />
          <p className="text-sm text-gray-700">
            Coletamos apenas <strong>nome</strong> e <strong>cidade</strong> para identificar
            sua participação no ranking do desafio. Nenhum telefone, CPF, endereço completo,
            data de nascimento ou dado sensível será solicitado.
          </p>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700 mt-2">
            🔒 Se você é criança, peça ajuda a um responsável para participar.
          </div>

          {/* 7. Prêmios */}
          <SectionTitle number={7} title="Prêmios" />
          <p className="text-sm text-gray-700">
            Para participar do desafio e acompanhar o ranking, monte seu palpite, confirme que
            está inscrito(a) no canal e aceite o regulamento.
          </p>
          <ImportantBox>
            Caso haja distribuição de prêmios, a organização deverá verificar previamente a
            necessidade de autorização junto aos órgãos competentes antes da divulgação oficial
            dos prêmios.
          </ImportantBox>

          {/* 8. Observações */}
          <SectionTitle number={8} title="Observações legais" />
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 pl-2">
            <li>Esta é uma brincadeira familiar e recreativa, sem fins lucrativos.</li>
            <li>
              Não envolve pagamento, compra, aposta ou qualquer tipo de valor financeiro para
              participar.
            </li>
            <li>
              A organização reserva o direito de alterar este regulamento com aviso prévio.
            </li>
            <li>
              Participações com dados falsos ou incoerentes poderão ser desqualificadas.
            </li>
            <li>
              O canal Luana Queiroz e Família não se responsabiliza por falhas técnicas ou de
              conectividade que impeçam a participação.
            </li>
          </ul>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              Regulamento do Desafio da Copa 2026 • Canal Luana Queiroz e Família
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Este palpite é uma brincadeira familiar da Copa do Mundo 2026.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <YouTubeButton variant="full" />
        </div>
      </main>
    </div>
  );
}
