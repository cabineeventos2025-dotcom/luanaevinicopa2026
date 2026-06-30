import { useEffect, useState } from "react";
import type { WorldCupData } from "@/lib/worldcup/types";
import type { Stage } from "@/lib/worldcup/types";
import { useSimulator } from "@/contexts/SimulatorContext";
import { useChannelConfig } from "@/contexts/ChannelConfigContext";
import { SimulatorCard } from "./SimulatorCard";
import { ParticipantForm } from "./ParticipantForm";
import { ChampionCelebration } from "./ChampionCelebration";
import { generatePredictionPDF } from "@/utils/pdfExport";
import { generateCode, generateHash } from "@/utils/hashUtils";
import { nowBrazil, formatBrazil } from "@/utils/dateUtils";
import { getRankingRepository } from "@/repositories";
import { RotateCcw, Info } from "lucide-react";
import { toast } from "sonner";
import type { BracketRound } from "@/lib/worldcup/types";

const STAGE_NAMES: Record<Stage, string> = {
  GROUP_STAGE: "Fase de Grupos",
  LAST_32: "Fase de 32",
  LAST_16: "Oitavas de Final",
  QUARTER_FINALS: "Quartas de Final",
  SEMI_FINALS: "Semifinais",
  THIRD_PLACE: "Disputa de 3º Lugar",
  FINAL: "Final",
};

const STAGE_EMOJI: Record<Stage, string> = {
  GROUP_STAGE: "📊",
  LAST_32: "🔵",
  LAST_16: "⚽",
  QUARTER_FINALS: "🔥",
  SEMI_FINALS: "⭐",
  THIRD_PLACE: "🥉",
  FINAL: "🏆",
};

const BRACKET_ORDER: Stage[] = [
  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL",
];

interface SimulatorViewProps {
  realData: WorldCupData;
}

export function SimulatorView({ realData }: SimulatorViewProps) {
  const { state, initSimulator, reset, buildPredictionMatches, setSavedPrediction } =
    useSimulator();
  const { config } = useChannelConfig();
  const [generating, setGenerating] = useState(false);

  // Initialize simulator with real data
  useEffect(() => {
    initSimulator(realData);
  }, [realData, initSimulator]);

  if (!state.simData) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-4xl animate-spin">⚽</div>
      </div>
    );
  }

  const champion = state.simData.champion;

  // Build bracket rounds for display
  const bracketRounds: BracketRound[] = [];
  for (const stage of BRACKET_ORDER) {
    const stageMatches = state.simData.matches.filter((m) => m.stage === stage);
    if (stageMatches.length > 0) {
      bracketRounds.push({
        id: stage,
        name: STAGE_NAMES[stage],
        stage,
        matches: stageMatches.sort((a, b) => a.id.localeCompare(b.id)),
      });
    }
  }

  const handleReset = () => {
    reset();
    toast.success("Palpite resetado! Comece de novo 🔄");
  };

  const handleSaveAndGeneratePDF = async () => {
    if (!state.participantName || !state.participantCity) {
      toast.error("Preencha seus dados antes de gerar o PDF.");
      return;
    }
    if (!champion) {
      toast.error("Escolha um campeão antes de gerar o PDF.");
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

      // Save to repository
      try {
        const repo = getRankingRepository();
        await repo.savePrediction(prediction);
        toast.success("Palpite salvo no ranking! 🎉");
      } catch (e) {
        console.error("[SimulatorView] Erro ao salvar palpite:", e);
        toast.error("Não foi possível salvar o palpite online. Gerando PDF...");
      }

      setSavedPrediction(prediction);

      // Generate PDF
      await generatePredictionPDF(prediction, {
        channelName: config.channelName,
        logoUrl: config.logoUrl,
        tagline: config.tagline,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
      });

      toast.success("PDF gerado com sucesso! 📄");
    } catch (e) {
      console.error("[SimulatorView] Erro ao gerar PDF:", e);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-yellow-50 to-green-50 border-2 border-amber-200 p-6 shadow-md">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-1">
              ✨ Simulador da Copa
            </h2>
            <p className="text-base font-bold text-amber-600 mb-2">
              Quem você acha que vai ser campeão da Copa?
            </p>
            <p className="text-sm text-gray-500 max-w-xl">
              Clique nas seleções vencedoras, escolha os placares e monte o caminho até a grande final.
              No fim, gere um PDF com seu palpite para guardar ou compartilhar com a família.
            </p>
          </div>
          <button
            onClick={handleReset}
            id="simulator-reset-btn"
            className="shrink-0 flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Resetar
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100 rounded-xl p-3">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            Este simulador é separado do chaveamento oficial. Suas escolhas não afetam os dados reais.
          </span>
        </div>
      </div>

      {/* Participant form or champion celebration */}
      {!state.formSubmitted ? (
        <ParticipantForm onConfirm={() => {}} />
      ) : champion ? (
        <ChampionCelebration
          champion={champion}
          predictionCode={state.savedPrediction?.code}
          onGeneratePDF={handleSaveAndGeneratePDF}
          generating={generating}
        />
      ) : null}

      {/* Bracket */}
      {state.formSubmitted && (
        <div className="space-y-8">
          {bracketRounds.map((round) => (
            <section key={round.id} id={`sim-round-${round.id}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{STAGE_EMOJI[round.stage]}</span>
                <h3 className="text-xl font-black text-gray-800">{round.name}</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {round.matches.map((m) => (
                  <SimulatorCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
