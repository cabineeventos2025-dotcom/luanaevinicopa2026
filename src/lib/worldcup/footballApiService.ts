import type { WorldCupData, Match } from "./types";
import {
  fetchWorldCupData as fetchFromFootballDataOrg,
} from "@/services/footballDataOrgService";
import { buildMockData } from "./mockWorldCupData";
import { processWorldCupData } from "./bracketEngine";
import { loadAdminScores } from "@/utils/adminScores";

export type DataSource = "football-data.org" | "api-football" | "mock";

export interface FetchResult {
  data: WorldCupData;
  source: DataSource;
  warning?: string;
}

/**
 * Aplica os placares salvos pelo admin (localStorage) sobre os dados da Copa.
 * Isso permite atualizar resultados sem alterar o código.
 */
function applyAdminOverrides(data: WorldCupData): WorldCupData {
  const adminScores = loadAdminScores();
  if (!adminScores.length) return data;

  const matches: Match[] = data.matches.map((m) => {
    const override = adminScores.find((s) => s.matchId === m.id);
    if (!override) return m;

    return {
      ...m,
      homeScore: override.homeScore,
      awayScore: override.awayScore,
      penaltiesHome: override.penaltiesHome ?? null,
      penaltiesAway: override.penaltiesAway ?? null,
      status: override.done ? ("finished" as const) : m.status,
      // winner/loser será recalculado por processWorldCupData
      winner: null,
      loser: null,
    };
  });

  // Re-processa para propagar vencedores e montar bracket
  return processWorldCupData({ ...data, matches });
}

/**
 * Tenta buscar dados reais da football-data.org (via proxy Vite em dev,
 * ou direto com a chave VITE_FOOTBALL_DATA_API_KEY em produção).
 * Se falhar, usa dados demonstrativos.
 * Em ambos os casos, aplica overrides do admin (localStorage).
 */
export async function fetchWorldCupData(): Promise<FetchResult> {
  try {
    const raw = await fetchFromFootballDataOrg();
    const processed = processWorldCupData(raw);
    const withAdmin = applyAdminOverrides(processed);
    return { data: withAdmin, source: "football-data.org" };
  } catch (err) {
    console.warn("[footballApiService] Usando dados demonstrativos:", err);
  }

  const mock = processWorldCupData(buildMockData());
  const withAdmin = applyAdminOverrides(mock);
  return {
    data: withAdmin,
    source: "mock",
    warning: "Não foi possível buscar dados reais. Mostrando dados demonstrativos.",
  };
}
