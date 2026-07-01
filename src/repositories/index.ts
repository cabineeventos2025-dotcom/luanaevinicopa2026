import type { RankingRepository } from "./RankingRepository";
import { LocalStorageRankingRepository } from "./LocalStorageRankingRepository";
import { SupabaseRankingRepository } from "./SupabaseRankingRepository";

// Supabase sempre ativo — credenciais estão hardcoded no supabaseClient.ts
const _local    = new LocalStorageRankingRepository();
const _supabase = new SupabaseRankingRepository();

/**
 * Repositório resiliente: salva em Supabase (ranking compartilhado entre todos).
 * Propaga erros para o caller para que possam ser exibidos na UI.
 */
class ResilientRankingRepository implements RankingRepository {
  async savePrediction(prediction: import("@/types/prediction").Prediction): Promise<void> {
    // Salva no Supabase — propaga erro se falhar
    await _supabase.savePrediction(prediction);
    // Salva localmente como backup (silencioso)
    _local.savePrediction(prediction).catch(() => {});
  }

  async loadRanking(): Promise<import("@/types/prediction").RankingEntry[]> {
    try {
      const entries = await _supabase.loadRanking();
      return entries;
    } catch (e) {
      console.warn("[Ranking] Supabase falhou ao carregar, usando localStorage:", e);
      return _local.loadRanking();
    }
  }

  async loadPrediction(code: string): Promise<import("@/types/prediction").Prediction | null> {
    try { return await _supabase.loadPrediction(code); } catch {}
    return _local.loadPrediction(code);
  }

  async loadAllPredictions(): Promise<import("@/types/prediction").Prediction[]> {
    try { return await _supabase.loadAllPredictions(); } catch {}
    return _local.loadAllPredictions();
  }
}

const _repo = new ResilientRankingRepository();

export function getRankingRepository(): RankingRepository {
  return _repo;
}

/** Agora sempre usa Supabase — mantido por compatibilidade */
export function isUsingLocalStorage(): boolean {
  return false;
}
