import type { Prediction, RankingEntry } from "@/types/prediction";

/**
 * Interface do repositório de ranking.
 * Implementada por LocalStorageRankingRepository e SupabaseRankingRepository.
 */
export interface RankingRepository {
  savePrediction(prediction: Prediction): Promise<void>;
  loadRanking(): Promise<RankingEntry[]>;
  loadPrediction(code: string): Promise<Prediction | null>;
  loadAllPredictions(): Promise<Prediction[]>;
}
