// Prediction types for the Copa 2026 family challenge
// "Palpite da Família" — Desafio da Copa Luana Queiroz e Família

export interface PredictionMatch {
  matchId: string;
  round?: string;
  homeTeamId?: string;
  homeTeamName?: string;
  awayTeamId?: string;
  awayTeamName?: string;
  predictedHomeScore: number | null;
  predictedAwayScore: number | null;
  predictedWinnerId?: string | null;
  predictedWinnerName?: string | null;
  decidedByPenalties: boolean;
  points: number;
  scoreReason: string;
}

export interface Participant {
  name: string;
  city: string;
}

export interface Prediction {
  code: string;
  participant: Participant;
  createdAt: string; // ISO
  createdAtBrazil: string; // "dd/MM/yyyy HH:mm:ss"
  timezone: "America/Sao_Paulo";
  championTeamId?: string | null;
  championTeamName?: string | null;
  championFlagUrl?: string | null;
  matches: PredictionMatch[];
  totalPoints: number;
  exactScores: number;
  correctWinners: number;
  hash: string;
  channelSubscribedConfirmed: boolean;
  channelSubscriptionChecked: boolean;
  termsAccepted: boolean;
}

export interface RankingEntry {
  position: number;
  code: string;
  participantName: string;
  participantCity: string;
  totalPoints: number;
  exactScores: number;
  correctWinners: number;
  createdAtBrazil: string;
  championTeamName?: string | null;
}

export type PredictionStatus = "draft" | "submitted";
