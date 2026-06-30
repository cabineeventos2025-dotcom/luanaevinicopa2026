import type { RankingRepository } from "./RankingRepository";
import { isSupabaseConfigured } from "@/services/supabaseClient";
import { LocalStorageRankingRepository } from "./LocalStorageRankingRepository";
import { SupabaseRankingRepository } from "./SupabaseRankingRepository";

let _repo: RankingRepository | null = null;

/**
 * Retorna o repositório adequado:
 * - SupabaseRankingRepository se configurado
 * - LocalStorageRankingRepository como fallback
 */
export function getRankingRepository(): RankingRepository {
  if (!_repo) {
    if (isSupabaseConfigured()) {
      _repo = new SupabaseRankingRepository();
    } else {
      _repo = new LocalStorageRankingRepository();
    }
  }
  return _repo;
}

/**
 * Retorna true se estiver usando armazenamento local (não Supabase).
 */
export function isUsingLocalStorage(): boolean {
  return !isSupabaseConfigured();
}
