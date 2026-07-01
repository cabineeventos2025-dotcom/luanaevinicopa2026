/**
 * adminScores.ts — Tipos e utilitários de placares do admin
 * Separado do componente para poder ser importado nos serviços.
 */

const STORAGE_KEY = "copa2026_admin_scores";

export interface AdminScore {
  matchId: string;
  homeScore: number;
  awayScore: number;
  penaltiesHome?: number;
  penaltiesAway?: number;
  done: boolean;
  updatedAt: string;
}

export function loadAdminScores(): AdminScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveAdminScores(scores: AdminScore[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}
