import type { WorldCupData } from "./types";
import {
  fetchWorldCupData as fetchFromFootballDataOrg,
} from "@/services/footballDataOrgService";
import { buildMockData } from "./mockWorldCupData";
import { processWorldCupData } from "./bracketEngine";

export type DataSource = "football-data.org" | "api-football" | "mock";

export interface FetchResult {
  data: WorldCupData;
  source: DataSource;
  warning?: string;
}

/**
 * Tenta buscar dados reais da football-data.org (via proxy Vite em dev,
 * ou direto com a chave VITE_FOOTBALL_DATA_API_KEY em produção).
 * Se falhar, usa dados demonstrativos.
 */
export async function fetchWorldCupData(): Promise<FetchResult> {
  try {
    const raw = await fetchFromFootballDataOrg();
    const processed = processWorldCupData(raw);
    return { data: processed, source: "football-data.org" };
  } catch (err) {
    console.warn("[footballApiService] Usando dados demonstrativos:", err);
  }

  const mock = processWorldCupData(buildMockData());
  return {
    data: mock,
    source: "mock",
    warning: "Não foi possível buscar dados reais. Mostrando dados demonstrativos.",
  };
}
