import { useEffect, useState } from "react";
import type { WorldCupData } from "@/lib/worldcup/types";
import { useSimulator } from "@/contexts/SimulatorContext";
import { useChannelConfig } from "@/contexts/ChannelConfigContext";
import { ParticipantForm } from "./ParticipantForm";
import { ChampionCelebration } from "./ChampionCelebration";
import { DoubleSidedBracket } from "@/components/worldcup/DoubleSidedBracket";
import { generatePredictionPDF } from "@/utils/pdfExport";
import { generateCode, generateHash } from "@/utils/hashUtils";
import { nowBrazil, formatBrazil } from "@/utils/dateUtils";
import { getRankingRepository } from "@/repositories";
import { RotateCcw, Info, Trophy, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { simulateWinner } from "@/lib/worldcup/bracketEngine";

interface SimulatorViewProps {
  realData: WorldCupData;
}

export function SimulatorView({ realData }: SimulatorViewProps) {
  const { state, initSimulator, reset, buildPredictionMatches, setSavedPrediction } = useSimulator();
  const { config } = useChannelConfig();
  const [generating, setGenerating] = useState(false);
  const [simMatches, setSimMatches] = useState(realData.matches);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    initSimulator(realData);
    setSimMatches(realData.matches);
    setSaved(false);
  }, [realData, initSimulator]);

  // Campeão = vencedor da Final
  const finalMatch = simMatches.find((m) => m.id === "final");
  const champion = finalMatch?.winner
    ? simMatches.flatMap((m) => [m.homeTeam, m.awayTeam]).find((t) => t?.id === finalMatch.winner) ?? null
    : null;

  // Selecionou vencedor de um jogo do simulador
  const handleSelectWinner = (matchId: string, slot: "home" | "away") => {
    const match = simMatches.find((m) => m.id === matchId);
    if (!match) return;
    // Jogos já finalizados (com resultado real) não podem ser alterados
    if (match.status === "finished") return;
    const updated = simulateWinner(simMatches, matchId, slot);
    setSimMatches(updated);
  };

  const handleReset = () => {
    setSimMatches(realData.matches);
    setSaved(false);
    reset();
    toast.success("Palpite resetado! Comece do zero 🔄");
  };

  const handleSave = async () => {
    if (!state.participantName || !state.participantCity) {
      toast.error("Preencha seu nome e cidade antes de palpitar.");
      return;
    }
    if (!champion) {
      toast.error("Complete o chaveamento até escolher um campeão! 🏆");
      return;
    }

    setGenerating(true);
    try {
      const predictionMatches = buildPredictionMatches();
      const now = nowBrazil();
      const createdAt = now.toISOString();
      const createdAtBrazil = formatBrazil(now);

      const hash = await generateHash({
        name: state.participantName,
        city: state.participantCity,
        createdAt,
        championId: champion.id,
        matchSelections: predictionMatches.map((m) => ({
          matchId: m.matchId,
          homeScore: m.predictedHomeScore,
          awayScore: m.predictedAwayScore,
          winnerId: m.predictedWinnerId ?? null,
        })),
      });

      const code = generateCode();
      const prediction = {
        code,
        participant: { name: state.participantName, city: state.participantCity },
        createdAt,
        createdAtBrazil,
        timezone: "America/Sao_Paulo" as const,
        championTeamId: champion.id,
        championTeamName: champion.name,
        championFlagUrl: champion.flagUrl,
        matches: predictionMatches,
        totalPoints: 0,
        exactScores: 0,
        correctWinners: 0,
        hash,
        channelSubscribedConfirmed: state.channelSubscribed,
        channelSubscriptionChecked: false,
        termsAccepted: state.termsAccepted,
      };

      // Salvar no banco (Supabase ou LocalStorage)
      try {
        const repo = getRankingRepository();
        await repo.savePrediction(prediction);
        setSaved(true);
        toast.success(`Palpite salvo no Ranking! 🎉 Código: ${code}`, { duration: 6000 });
      } catch (e) {
        console.error("[SimulatorView] Erro ao salvar:", e);
        toast.error("Não foi possível salvar online. Tente novamente.");
      }

      setSavedPrediction(prediction);

      // Gerar PDF
      await generatePredictionPDF(prediction, {
        channelName: config.channelName,
        logoUrl: config.logoUrl,
        tagline: config.tagline,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
      });

      toast.success("PDF gerado! Compartilhe com a família 📄");
    } catch (e) {
      console.error("[SimulatorView] Erro:", e);
      toast.error("Erro ao processar palpite. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  // Conta quantos jogos foram escolhidos
  const totalKnockout = simMatches.filter((m) => m.stage !== "GROUP_STAGE").length;
  const chosen = simMatches.filter((m) => m.stage !== "GROUP_STAGE" && m.winner).length;
  const progress = totalKnockout > 0 ? Math.round((chosen / totalKnockout) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-yellow-50 to-green-50 border-2 border-amber-200 p-5 shadow-md">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">✨ Meu Chaveamento da Copa</h2>
            <p className="text-sm text-amber-700 font-semibold">
              Clique no time que você acha que vai vencer cada jogo. O chaveamento avança automaticamente!
            </p>
          </div>
          <button
            onClick={handleReset}
            id="simulator-reset-btn"
            className="shrink-0 flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Resetar
          </button>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{chosen} de {totalKnockout} jogos escolhidos</span>
            <span className="font-bold text-amber-600">{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100 rounded-xl p-3 mt-3">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            Jogos já realizados (com resultado real) são mostrados com placar — não podem ser alterados.
            Os próximos jogos são seu palpite!
          </span>
        </div>
      </div>

      {/* ── Formulário de participante ── */}
      {!state.formSubmitted && (
        <div className="rounded-2xl bg-white border-2 border-amber-200 p-5 shadow-sm">
          <h3 className="text-lg font-black text-gray-800 mb-4">👤 Seus dados</h3>
          <ParticipantForm onConfirm={() => {}} />
        </div>
      )}

      {/* ── Chaveamento de 2 lados ── */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-black text-gray-800">Chaveamento da Copa 2026</h3>
          <span className="text-xs text-gray-400 ml-auto">← clique no time que vai vencer →</span>
        </div>
        <DoubleSidedBracket
          matches={simMatches}
          onSelectWinner={handleSelectWinner}
          readonly={false}
        />
      </div>

      {/* ── Campeão escolhido ── */}
      {champion && (
        <ChampionCelebration
          champion={champion}
          predictionCode={state.savedPrediction?.code}
          onGeneratePDF={handleSave}
          generating={generating}
        />
      )}

      {/* ── Botão de Palpitar ── */}
      <div className="rounded-3xl bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 p-6 shadow-md">
        <div className="flex flex-col items-center gap-4 text-center">
          {saved ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div>
                <div className="text-xl font-black text-green-700">Palpite enviado! 🎉</div>
                <p className="text-sm text-green-600 mt-1">
                  Você já está no Ranking da Família. Veja como você se saiu!
                </p>
              </div>
              <a
                href="/ranking"
                className="inline-flex items-center gap-2 rounded-2xl bg-green-500 px-8 py-3 text-base font-black text-white hover:bg-green-600 transition-all hover:scale-105 shadow-lg"
              >
                🏅 Ver Ranking da Família
              </a>
            </>
          ) : (
            <>
              <div className="text-4xl">⚽🏆</div>
              <div>
                <div className="text-xl font-black text-gray-800">Pronto para palpitar?</div>
                <p className="text-sm text-gray-500 mt-1">
                  {!champion
                    ? "Complete o chaveamento escolhendo um campeão para poder enviar."
                    : `Seu campeão: 🏆 ${champion.name} — Clique para salvar no Ranking!`}
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={!champion || generating || !state.formSubmitted}
                id="simulator-palpitar-btn"
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-10 py-4 text-lg font-black text-white shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {generating ? (
                  <><span className="animate-spin">⚽</span> Salvando...</>
                ) : (
                  <><Send className="h-5 w-5" /> Enviar Palpite & Gerar PDF</>
                )}
              </button>
              {!state.formSubmitted && (
                <p className="text-xs text-gray-400">Preencha seus dados acima primeiro</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
