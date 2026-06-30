import type { WorldCupData } from "./types";
import {
  fetchWorldCupData as fetchFromFootballDataOrg,
  hasFootballDataOrgConfig,
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
 * Order:
 * 1. football-data.org (via server proxy or direct)
 * 2. API-Football (placeholder)
 * 3. Mock fallback
 */
export async function fetchWorldCupData(): Promise<FetchResult> {
  if (hasFootballDataOrgConfig()) {
    try {
      const raw = await fetchFromFootballDataOrg();
      const processed = processWorldCupData(raw);
      return { data: processed, source: "football-data.org" };
    } catch (err) {
      console.error("[footballApiService] football-data.org falhou:", err);
    }
  }

  const mock = processWorldCupData(buildMockData());
  return {
    data: mock,
    source: "mock",
    warning: "Não foi possível buscar dados reais agora. Mostrando dados demonstrativos.",
  };
}
