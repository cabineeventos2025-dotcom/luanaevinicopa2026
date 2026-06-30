import type { Match } from "@/lib/worldcup/types";
import type { PredictionMatch } from "@/types/prediction";

export interface ScoreResult {
  points: number;
  reason: string;
}

/**
 * Calcula a pontuação de um palpite comparado ao resultado real.
 * Regras do Desafio da Copa — Luana Queiroz e Família.
 *
 * Sistema de pontuação (0–10 pontos por jogo):
 * 1. Placar exato + vencedor correto: 10 pts
 * 2. Vencedor correto + diferença de gols correta: 8 pts
 * 3. Vencedor correto + gols de um dos times correto: 7 pts
 * 4. Apenas vencedor correto: 6 pts
 * 5. Empate correto, mas placar diferente: 6 pts
 * 6. Acertou gols de um dos times, mas errou vencedor: 3 pts
 * 7. Acertou apenas total de gols: 2 pts
 * 8. Não acertou nada: 0 pts
 *
 * Para mata-mata com pênaltis:
 * 1. Placar exato + classificado correto: 10 pts
 * 2. Empate correto + classificado correto: 8 pts
 * 3. Empate correto, classificado errado: 6 pts
 * 4. Classificado correto, sem acertar empate: 5 pts
 * 5. Acertou gols de um dos times: 3 pts
 * 6. Não acertou nada: 0 pts
 */
export function calculateMatchScore(
  realMatch: Match,
  prediction: PredictionMatch,
): ScoreResult {
  // Se o jogo não terminou, sem pontos ainda
  if (realMatch.status !== "finished") {
    return { points: 0, reason: "Jogo ainda não finalizado" };
  }

  const rHome = realMatch.homeScore;
  const rAway = realMatch.awayScore;
  const pHome = prediction.predictedHomeScore;
  const pAway = prediction.predictedAwayScore;

  if (rHome == null || rAway == null || pHome == null || pAway == null) {
    return { points: 0, reason: "Placar incompleto" };
  }

  const isKnockout = realMatch.stage !== "GROUP_STAGE";
  const wasDrawWithPenalties =
    isKnockout &&
    rHome === rAway &&
    realMatch.penaltiesHome != null &&
    realMatch.penaltiesAway != null;

  if (wasDrawWithPenalties) {
    return calculatePenaltyScore(realMatch, prediction, rHome, rAway, pHome, pAway);
  }

  return calculateRegularScore(realMatch, prediction, rHome, rAway, pHome, pAway);
}

function calculateRegularScore(
  realMatch: Match,
  prediction: PredictionMatch,
  rHome: number,
  rAway: number,
  pHome: number,
  pAway: number,
): ScoreResult {
  const realWinner = getRealWinner(realMatch);
  const predWinner = prediction.predictedWinnerId;

  const exactScore = rHome === pHome && rAway === pAway;
  const correctWinner = realWinner === predWinner;
  const realDiff = rHome - rAway;
  const predDiff = pHome - pAway;
  const correctDiff = realDiff === predDiff;
  const correctHomeGoals = rHome === pHome;
  const correctAwayGoals = rAway === pAway;
  const oneTeamCorrect = correctHomeGoals || correctAwayGoals;
  const realTotal = rHome + rAway;
  const predTotal = pHome + pAway;
  const realIsDrawn = rHome === rAway;
  const predIsDrawn = pHome === pAway;

  // 1. Placar exato + vencedor correto
  if (exactScore && correctWinner) {
    return { points: 10, reason: "🎯 Placar exato!" };
  }

  // 2. Vencedor correto + diferença de gols correta
  if (correctWinner && correctDiff && !exactScore) {
    return { points: 8, reason: "✅ Vencedor + diferença de gols certa" };
  }

  // 3. Vencedor correto + gols de um time correto
  if (correctWinner && oneTeamCorrect && !correctDiff) {
    return { points: 7, reason: "✅ Vencedor + gols de um time certos" };
  }

  // 4. Apenas vencedor correto
  if (correctWinner) {
    return { points: 6, reason: "✅ Vencedor correto" };
  }

  // 5. Empate correto, placar diferente
  if (realIsDrawn && predIsDrawn && !exactScore) {
    return { points: 6, reason: "✅ Empate correto" };
  }

  // 6. Acertou gols de um time, errou vencedor
  if (oneTeamCorrect && !correctWinner) {
    return { points: 3, reason: "⚡ Gols de um time corretos" };
  }

  // 7. Acertou total de gols
  if (realTotal === predTotal) {
    return { points: 2, reason: "⚡ Total de gols correto" };
  }

  // 8. Não acertou nada
  return { points: 0, reason: "❌ Sem pontos" };
}

function calculatePenaltyScore(
  realMatch: Match,
  prediction: PredictionMatch,
  rHome: number,
  rAway: number,
  pHome: number,
  pAway: number,
): ScoreResult {
  const realAdvancer = getRealWinner(realMatch); // winner after penalties
  const predAdvancer = prediction.predictedWinnerId;

  const exactScore = rHome === pHome && rAway === pAway;
  const correctDraw = rHome === rAway && pHome === pAway;
  const correctAdvancer = realAdvancer === predAdvancer;
  const correctHomeGoals = rHome === pHome;
  const correctAwayGoals = rAway === pAway;

  // 1. Placar exato + classificado correto
  if (exactScore && correctAdvancer) {
    return { points: 10, reason: "🎯 Placar exato + classificado correto!" };
  }

  // 2. Empate correto + classificado correto
  if (correctDraw && correctAdvancer) {
    return { points: 8, reason: "✅ Empate + classificado correto" };
  }

  // 3. Empate correto, classificado errado
  if (correctDraw && !correctAdvancer) {
    return { points: 6, reason: "⚡ Empate correto, classificado errado" };
  }

  // 4. Classificado correto, sem acertar empate
  if (correctAdvancer && !correctDraw) {
    return { points: 5, reason: "✅ Classificado correto" };
  }

  // 5. Acertou gols de um dos times
  if (correctHomeGoals || correctAwayGoals) {
    return { points: 3, reason: "⚡ Gols de um time corretos" };
  }

  // 6. Não acertou nada
  return { points: 0, reason: "❌ Sem pontos" };
}

function getRealWinner(match: Match): string | null {
  if (match.winner) return match.winner;
  if (match.homeScore != null && match.awayScore != null) {
    if (match.homeScore > match.awayScore) return match.homeTeam?.id ?? null;
    if (match.awayScore > match.homeScore) return match.awayTeam?.id ?? null;
    // Draw with penalties
    if (match.penaltiesHome != null && match.penaltiesAway != null) {
      if (match.penaltiesHome > match.penaltiesAway) return match.homeTeam?.id ?? null;
      if (match.penaltiesAway > match.penaltiesHome) return match.awayTeam?.id ?? null;
    }
  }
  return null;
}

/**
 * Calcula pontuação total de um conjunto de palpites contra resultados reais.
 */
export function calculateTotalScore(
  predictions: PredictionMatch[],
  realMatches: Match[],
): { totalPoints: number; exactScores: number; correctWinners: number } {
  let totalPoints = 0;
  let exactScores = 0;
  let correctWinners = 0;

  for (const pred of predictions) {
    const real = realMatches.find((m) => m.id === pred.matchId);
    if (!real || real.status !== "finished") continue;

    const result = calculateMatchScore(real, pred);
    totalPoints += result.points;
    if (result.points === 10) exactScores++;
    if (result.points >= 6) correctWinners++;
  }

  return { totalPoints, exactScores, correctWinners };
}
