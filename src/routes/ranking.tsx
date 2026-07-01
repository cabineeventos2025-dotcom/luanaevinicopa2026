import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { RankingTable } from "@/components/ranking/RankingTable";
import { RankingPodium } from "@/components/ranking/RankingPodium";
import { getRankingRepository } from "@/repositories";
import { getSupabaseClient } from "@/services/supabaseClient";
import type { RankingEntry } from "@/types/prediction";
import { RefreshCw, Trophy, Users, Share2, Copy, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { YouTubeButton } from "@/components/common/YouTubeButton";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export const Route = createFileRoute("/ranking")({
  component: RankingPage,
});

type SupaStatus = "checking" | "ok" | "error";

function RankingPage() {
  const [entries, setEntries]         = useState<RankingEntry[]>([]);
  const [loading, setLoading]         = useState(true);
  const [supaStatus, setSupaStatus]   = useState<SupaStatus>("checking");
  const [supaError, setSupaError]     = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Testa conexão Supabase diretamente
  const checkSupabase = useCallback(async () => {
    setSupaStatus("checking");
    setSupaError(null);
    try {
      const sb = getSupabaseClient();
      const { error } = await sb.from("predictions").select("code", { count: "exact", head: true });
      if (error) throw new Error(error.message);
      setSupaStatus("ok");
    } catch (e: any) {
      setSupaStatus("error");
      setSupaError(e?.message ?? String(e));
    }
  }, []);

  const loadRanking = useCallback(async () => {
    setLoading(true);
    try {
      const repo = getRankingRepository();
      const data = await repo.loadRanking();
      setEntries(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("[RankingPage]", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSupabase();
    loadRanking();
  }, []);

  const handleRefresh = () => {
    checkSupabase();
    loadRanking();
  };

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

          {/* Status Supabase */}
          <div className={`mb-4 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold border ${
            supaStatus === "checking" ? "bg-gray-50 border-gray-200 text-gray-500" :
            supaStatus === "ok"       ? "bg-green-50 border-green-300 text-green-700" :
                                        "bg-red-50 border-red-300 text-red-700"
          }`}>
            {supaStatus === "checking" && <RefreshCw className="h-4 w-4 animate-spin" />}
            {supaStatus === "ok"       && <Wifi className="h-4 w-4" />}
            {supaStatus === "error"    && <WifiOff className="h-4 w-4" />}
            {supaStatus === "checking" && "Verificando conexão..."}
            {supaStatus === "ok"       && "✅ Conectado ao banco online (Supabase)"}
            {supaStatus === "error"    && "❌ Banco offline — mostrando dados locais"}
          </div>

          {/* Mensagem de erro detalhada */}
          {supaStatus === "error" && supaError && (
            <div className="mx-auto max-w-lg mb-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-left">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-black text-red-700 mb-1">Erro Supabase:</p>
                  <p className="text-xs text-red-600 font-mono break-all">{supaError}</p>
                  <p className="text-xs text-red-500 mt-2">
                    Verifique se a tabela <code className="bg-red-100 px-1 rounded">predictions</code> existe no Supabase e se o projeto não está pausado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Link compartilhável */}
          <div className="mt-2 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white border-2 border-amber-300 px-4 py-2.5 shadow-sm max-w-sm w-full">
              <Share2 className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-sm font-bold text-gray-600 truncate flex-1" id="ranking-public-url">
                {typeof window !== "undefined" ? window.location.origin + "/ranking" : "luanaevinicopa2026.vercel.app/ranking"}
              </span>
              <button
                onClick={() => {
                  const url = typeof window !== "undefined" ? window.location.origin + "/ranking" : "";
                  navigator.clipboard.writeText(url).then(() => toast.success("Link copiado! Compartilhe com a família 🎉"));
                }}
                className="shrink-0 flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700 hover:bg-amber-200 transition-colors"
                id="ranking-copy-url-btn"
              >
                <Copy className="h-3 w-3" /> Copiar
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
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

        <RankingPodium entries={entries} />
        <RankingTable entries={entries} loading={loading} error={null} />

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
