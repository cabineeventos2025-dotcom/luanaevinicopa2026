import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RankingTable } from "@/components/ranking/RankingTable";
import { getRankingRepository } from "@/repositories";
import type { RankingEntry } from "@/types/prediction";
import { RefreshCw, Trophy, Users } from "lucide-react";
import { YouTubeButton } from "@/components/common/YouTubeButton";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/ranking")({
  component: RankingPage,
});

function RankingPage() {
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadRanking = async () => {
    setLoading(true);
    setError(null);
    try {
      const repo = getRankingRepository();
      const data = await repo.loadRanking();
      setEntries(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("[RankingPage]", e);
      setError("Não foi possível carregar o ranking agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Toaster richColors position="top-center" />
      <Header />

      <main className="container mx-auto px-4 pb-16 max-w-3xl">
        <section className="py-8 text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Ranking da Família</h1>
          <p className="text-lg font-semibold text-amber-600 mb-1">
            Quem mandou melhor nos palpites da Copa?
          </p>
          <p className="text-sm text-gray-500 max-w-lg mx-auto mb-6">
            Monte seu chaveamento, escolha os placares e acompanhe sua pontuação conforme os jogos acontecem.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={loadRanking}
              disabled={loading}
              id="ranking-refresh-btn"
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </button>
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Atualizado: {lastUpdated.toLocaleTimeString("pt-BR")}
              </span>
            )}
          </div>
        </section>

        {!loading && entries.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-2xl bg-white border border-amber-200 p-4 text-center shadow-sm">
              <div className="text-3xl font-black text-amber-600">{entries.length}</div>
              <div className="text-xs text-gray-500 font-semibold mt-1 flex items-center justify-center gap-1">
                <Users className="h-3 w-3" /> Participantes
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-amber-200 p-4 text-center shadow-sm">
              <div className="text-3xl font-black text-amber-600">
                {entries[0]?.totalPoints ?? 0}
              </div>
              <div className="text-xs text-gray-500 font-semibold mt-1 flex items-center justify-center gap-1">
                <Trophy className="h-3 w-3" /> Maior pontuação
              </div>
            </div>
          </div>
        )}

        <RankingTable entries={entries} loading={loading} error={error} />

        <div className="mt-8 rounded-2xl bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 p-6 text-center">
          <p className="text-base font-bold text-gray-800 mb-1">Ainda não participou?</p>
          <p className="text-sm text-gray-600 mb-4">
            Monte seu palpite no Simulador e entre para o Ranking da Família!
          </p>
          <a
            href="/"
            id="ranking-cta-simulator-link"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition-colors shadow-md"
          >
            ✨ Ir para o Simulador
          </a>
        </div>

        <div className="mt-6 flex justify-center">
          <YouTubeButton variant="full" />
        </div>
      </main>
    </div>
  );
}
