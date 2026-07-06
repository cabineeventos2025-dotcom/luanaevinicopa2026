import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { RankingTable } from "@/components/ranking/RankingTable";
import { RankingPodium } from "@/components/ranking/RankingPodium";
import { getRankingRepository } from "@/repositories";
import { fetchWorldCupData } from "@/lib/worldcup/footballApiService";
import { updateRankingWithRealResults, sortRanking } from "@/utils/ranking";
import type { RankingEntry, Prediction, PredictionMatch } from "@/types/prediction";
import type { Match } from "@/lib/worldcup/types";
import { RefreshCw, Trophy, Users, Share2, Copy, X, Star, Target, Clock } from "lucide-react";
import { YouTubeButton } from "@/components/common/YouTubeButton";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ranking")({
  component: RankingPage,
});

// ─── Componente de detalhe de palpite ────────────────────────────────────────
const STAGE_LABELS: Record<string, string> = {
  LAST_32:       "Fase de 32",
  LAST_16:       "Oitavas de Final",
  QUARTER_FINALS:"Quartas de Final",
  SEMI_FINALS:   "Semifinais",
  THIRD_PLACE:   "3º Lugar",
  FINAL:         "Final",
};

function MatchRow({ pm, real }: { pm: PredictionMatch; real?: Match }) {
  const isFinished = real?.status === "finished";
  const pts = pm.points ?? 0;

  const pointsColor =
    pts === 10 ? "text-green-600 bg-green-50 border-green-200" :
    pts >= 6   ? "text-blue-600 bg-blue-50 border-blue-200" :
    pts >= 2   ? "text-orange-600 bg-orange-50 border-orange-200" :
    isFinished ? "text-red-500 bg-red-50 border-red-200" :
                 "text-gray-400 bg-gray-50 border-gray-200";

  const homeFlag = real?.homeTeam?.flagUrl ?? null;
  const awayFlag = real?.awayTeam?.flagUrl ?? null;
  const homeName = real?.homeTeam?.name ?? pm.homeTeamName ?? "—";
  const awayName = real?.awayTeam?.name ?? pm.awayTeamName ?? "—";

  return (
    <div className={cn(
      "rounded-xl border p-3 transition-all",
      isFinished ? "bg-white" : "bg-gray-50 opacity-80",
    )}>
      {/* Teams + Scores */}
      <div className="flex items-center gap-2">
        {/* Home team */}
        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          {homeFlag && (
            <img src={homeFlag} alt={homeName} className="h-4 w-6 object-cover rounded-sm shrink-0" />
          )}
          <span className="text-xs font-bold text-gray-700 truncate">{homeName}</span>
        </div>

        {/* Scores block */}
        <div className="shrink-0 flex flex-col items-center gap-0.5">
          {/* Predicted */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-400 text-[10px]">Palpite:</span>
            <span className="font-black text-sm text-gray-800 tabular-nums">
              {pm.predictedHomeScore ?? "–"} × {pm.predictedAwayScore ?? "–"}
            </span>
          </div>
          {/* Real */}
          {isFinished && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-400 text-[10px]">Real:</span>
              <span className={cn(
                "font-black text-sm tabular-nums",
                pts >= 6 ? "text-green-700" : "text-red-500"
              )}>
                {real?.homeScore ?? "–"} × {real?.awayScore ?? "–"}
              </span>
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
          <span className="text-xs font-bold text-gray-700 truncate text-right">{awayName}</span>
          {awayFlag && (
            <img src={awayFlag} alt={awayName} className="h-4 w-6 object-cover rounded-sm shrink-0" />
          )}
        </div>
      </div>

      {/* Points + Reason */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-gray-400 italic">
          {isFinished ? pm.scoreReason || "—" : <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>A jogar</span>}
        </span>
        {isFinished && (
          <span className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-black",
            pointsColor,
          )}>
            +{pts} pts
          </span>
        )}
      </div>
    </div>
  );
}

function PredictionDetailModal({
  prediction,
  realMatches,
  onClose,
}: {
  prediction: Prediction;
  realMatches: Match[];
  onClose: () => void;
}) {
  const stages = ["LAST_32", "LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "THIRD_PLACE", "FINAL"];

  // Group prediction matches by stage
  const byStage = stages.map((stage) => {
    const stageMatches = prediction.matches
      .map((pm) => ({ pm, real: realMatches.find((m) => m.id === pm.matchId) }))
      .filter(({ real }) => real?.stage === stage);
    return { stage, matches: stageMatches };
  }).filter((s) => s.matches.length > 0);

  const finishedCount = prediction.matches.filter((pm) => {
    const real = realMatches.find((m) => m.id === pm.matchId);
    return real?.status === "finished";
  }).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-5 flex items-start gap-4 shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-white leading-tight truncate">
              {prediction.participant.name}
            </h2>
            <p className="text-amber-100 text-sm mt-0.5">{prediction.participant.city}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 text-white text-xs font-bold">
                <Trophy className="h-3 w-3" />
                {prediction.totalPoints} pontos
              </span>
              <span className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 text-white text-xs font-bold">
                <Target className="h-3 w-3" />
                🎯 {prediction.exactScores} exatos
              </span>
              <span className="bg-white/20 rounded-full px-2 py-0.5 text-white text-xs font-bold">
                ✅ {prediction.correctWinners} vencedores
              </span>
              <span className="bg-white/20 rounded-full px-2 py-0.5 text-white text-xs font-bold">
                {finishedCount}/{prediction.matches.length} jogos
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white shrink-0"
            id="prediction-modal-close-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Champion pick */}
        {prediction.championTeamName && (
          <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 border-b border-amber-100 shrink-0">
            {prediction.championFlagUrl && (
              <img
                src={prediction.championFlagUrl}
                alt={prediction.championTeamName}
                className="h-5 w-7 object-cover rounded shadow-sm"
              />
            )}
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-gray-700">
              Campeão apostado: <span className="text-amber-700">{prediction.championTeamName}</span>
            </span>
          </div>
        )}

        {/* Match list */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">
          {byStage.map(({ stage, matches }) => (
            <div key={stage}>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 px-1">
                {STAGE_LABELS[stage] ?? stage}
              </h3>
              <div className="space-y-2">
                {matches.map(({ pm, real }) => (
                  <MatchRow key={pm.matchId} pm={pm} real={real} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 text-center shrink-0">
          <p className="text-[10px] text-gray-400">
            Palpite enviado em {prediction.createdAtBrazil}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
function RankingPage() {
  const [entries, setEntries]         = useState<RankingEntry[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [realMatches, setRealMatches] = useState<Match[]>([]);
  const [loading, setLoading]         = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const loadRanking = useCallback(async () => {
    setLoading(true);
    try {
      const repo = getRankingRepository();

      // Load raw predictions + real match data in parallel
      const [rawPredictions, { data: matchData }] = await Promise.all([
        repo.loadAllPredictions(),
        fetchWorldCupData(),
      ]);

      const matches = matchData.matches;
      setRealMatches(matches);

      // Apply real results to all predictions
      const updatedPredictions = updateRankingWithRealResults(rawPredictions, matches);
      setPredictions(updatedPredictions);
      setEntries(sortRanking(updatedPredictions));
      setLastUpdated(new Date());
    } catch (e) {
      console.error("[RankingPage]", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRanking(); }, []);

  const selectedPrediction = selectedCode
    ? predictions.find((p) => p.code === selectedCode) ?? null
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Toaster richColors position="top-center" />
      <Header />

      {selectedPrediction && (
        <PredictionDetailModal
          prediction={selectedPrediction}
          realMatches={realMatches}
          onClose={() => setSelectedCode(null)}
        />
      )}

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

          {/* Link compartilhável */}
          <div className="flex flex-col items-center gap-3">
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
        <RankingTable
          entries={entries}
          loading={loading}
          error={null}
          onSelectEntry={setSelectedCode}
        />

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
