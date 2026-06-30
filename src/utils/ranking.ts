import type { Match } from "@/lib/worldcup/types";
import type { Prediction, PredictionMatch, RankingEntry } from "@/types/prediction";
import { calculateMatchScore, calculateTotalScore } from "./scoring";

/**
 * Atualiza os pontos de um palpite com base nos resultados reais.
 */
export function updatePredictionWithRealResults(
  prediction: Prediction,
  realMatches: Match[],
): Prediction {
  const updatedMatches: PredictionMatch[] = prediction.matches.map((pred) => {
    const real = realMatches.find((m) => m.id === pred.matchId);
    if (!real || real.status !== "finished") return pred;

    const { points, reason } = calculateMatchScore(real, pred);
    return { ...pred, points, scoreReason: reason };
  });

  const { totalPoints, exactScores, correctWinners } = calculateTotalScore(
    updatedMatches,
    realMatches,
  );

  return { ...prediction, matches: updatedMatches, totalPoints, exactScores, correctWinners };
}

/**
 * Ordena o ranking com critérios de desempate:
 * 1. Maior pontuação total
 * 2. Maior número de placares exatos
 * 3. Maior número de vencedores corretos
 * 4. Palpite enviado primeiro (horário de Brasília)
 */
export function sortRanking(predictions: Prediction[]): RankingEntry[] {
  const sorted = [...predictions].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores;
    if (b.correctWinners !== a.correctWinners) return b.correctWinners - a.correctWinners;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return sorted.map((p, i) => ({
    position: i + 1,
    code: p.code,
    participantName: p.participant.name,
    participantCity: p.participant.city,
    totalPoints: p.totalPoints,
    exactScores: p.exactScores,
    correctWinners: p.correctWinners,
    createdAtBrazil: p.createdAtBrazil,
    championTeamName: p.championTeamName,
  }));
}

/**
 * Atualiza o ranking inteiro com resultados reais.
 */
export function updateRankingWithRealResults(
  predictions: Prediction[],
  realMatches: Match[],
): Prediction[] {
  return predictions.map((p) => updatePredictionWithRealResults(p, realMatches));
}
