import type { RankingRepository } from "./RankingRepository";
import { LocalStorageRankingRepository } from "./LocalStorageRankingRepository";
import { SupabaseRankingRepository } from "./SupabaseRankingRepository";

// Verifica se Supabase está configurado
function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  return Boolean(url && key && url.startsWith("https://"));
}

const _local = new LocalStorageRankingRepository();
const _supabase = isSupabaseConfigured() ? new SupabaseRankingRepository() : null;

/**
 * Repositório resiliente: tenta Supabase, cai para localStorage no erro.
 * Assim o ranking NUNCA mostra erro — mostra dados locais como fallback.
 */
class ResilientRankingRepository implements RankingRepository {
  async savePrediction(prediction: import("@/types/prediction").Prediction): Promise<void> {
    // Sempre salvar localmente
    await _local.savePrediction(prediction);
    // Tentar Supabase em paralelo (silencioso em erro)
    if (_supabase) {
      _supabase.savePrediction(prediction).catch((e) => {
        console.warn("[Ranking] Supabase não disponível, usando localStorage:", e?.message ?? e);
      });
    }
  }

  async loadRanking(): Promise<import("@/types/prediction").RankingEntry[]> {
    if (_supabase) {
      try {
        const entries = await _supabase.loadRanking();
        return entries;
      } catch (e) {
        console.warn("[Ranking] Supabase falhou, usando localStorage:", e);
      }
    }
    return _local.loadRanking();
  }

  async loadPrediction(code: string): Promise<import("@/types/prediction").Prediction | null> {
    if (_supabase) {
      try { return await _supabase.loadPrediction(code); } catch {}
    }
    return _local.loadPrediction(code);
  }

  async loadAllPredictions(): Promise<import("@/types/prediction").Prediction[]> {
    if (_supabase) {
      try { return await _supabase.loadAllPredictions(); } catch {}
    }
    return _local.loadAllPredictions();
  }
}

const _repo = new ResilientRankingRepository();

export function getRankingRepository(): RankingRepository {
  return _repo;
}

export function isUsingLocalStorage(): boolean {
  return !isSupabaseConfigured();
}
