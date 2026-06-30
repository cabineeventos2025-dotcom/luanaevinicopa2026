import type { Prediction, RankingEntry } from "@/types/prediction";
import type { RankingRepository } from "./RankingRepository";
import { sortRanking } from "@/utils/ranking";

const STORAGE_KEY = "lqf-predictions-v1";

function loadAll(): Prediction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Prediction[];
  } catch {
    return [];
  }
}

function saveAll(predictions: Prediction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
  } catch (e) {
    console.error("[LocalStorageRankingRepository] Erro ao salvar:", e);
  }
}

export class LocalStorageRankingRepository implements RankingRepository {
  async savePrediction(prediction: Prediction): Promise<void> {
    const all = loadAll();
    const existing = all.findIndex((p) => p.code === prediction.code);
    if (existing >= 0) {
      all[existing] = prediction;
    } else {
      all.push(prediction);
    }
    saveAll(all);
  }

  async loadRanking(): Promise<RankingEntry[]> {
    const all = loadAll();
    return sortRanking(all);
  }

  async loadPrediction(code: string): Promise<Prediction | null> {
    const all = loadAll();
    return all.find((p) => p.code === code) ?? null;
  }

  async loadAllPredictions(): Promise<Prediction[]> {
    return loadAll();
  }
}
