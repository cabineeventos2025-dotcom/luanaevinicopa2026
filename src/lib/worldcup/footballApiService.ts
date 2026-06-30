import type { WorldCupData } from "./types";
import { fetchWorldCupData as fetchFromFootballDataOrg, hasFootballDataOrgConfig } from "./footballDataOrgService";
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
 * 1. football-data.org (if configured)
 * 2. API-Football (if configured) — placeholder
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

  // (API-Football could be tried here if implemented)

  const mock = processWorldCupData(buildMockData());
  return {
    data: mock,
    source: "mock",
    warning: hasFootballDataOrgConfig()
      ? "Não foi possível buscar dados ao vivo. Mostrando dados demonstrativos."
      : "API não configurada. Mostrando dados demonstrativos.",
  };
}
