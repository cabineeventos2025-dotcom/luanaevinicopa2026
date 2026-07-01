import type { WorldCupData, Match } from "./types";
import {
  fetchWorldCupData as fetchFromFootballDataOrg,
} from "@/services/footballDataOrgService";
import { buildMockData } from "./mockWorldCupData";
import { processWorldCupData, advanceBracket, identifyWinner } from "./bracketEngine";
import { loadAdminScores } from "@/utils/adminScores";

export type DataSource = "football-data.org" | "api-football" | "mock";

export interface FetchResult {
  data: WorldCupData;
  source: DataSource;
  warning?: string;
}

/**
 * Aplica os placares salvos pelo admin (localStorage) sobre os dados da Copa.
 * Usa identifyWinner para calcular o vencedor correto a partir do placar.
 */
function applyAdminOverrides(data: WorldCupData): WorldCupData {
  const adminScores = loadAdminScores();
  if (!adminScores.length) return data;

  const matches: Match[] = data.matches.map((m) => {
    const override = adminScores.find((s) => s.matchId === m.id);
    if (!override) return m;

    // Monta o match atualizado com os scores do admin
    const updated: Match = {
      ...m,
      homeScore:     override.homeScore,
      awayScore:     override.awayScore,
      penaltiesHome: override.penaltiesHome ?? null,
      penaltiesAway: override.penaltiesAway ?? null,
      status:        override.done ? "finished" : m.status,
    };

    // Calcula winner/loser a partir do placar (reutiliza lógica existente)
    if (override.done && m.homeTeam && m.awayTeam) {
      const { winner, loser } = identifyWinner(updated);
      updated.winner = winner?.id ?? null;
      updated.loser  = loser?.id  ?? null;
    }

    return updated;
  });

  // Re-propaga vencedores para as próximas fases
  return { ...data, matches: advanceBracket(matches) };
}

/**
 * Busca dados da Copa do Mundo.
 * Tenta football-data.org; cai para mock se falhar.
 * Em ambos os casos, aplica overrides do admin (localStorage).
 */
export async function fetchWorldCupData(): Promise<FetchResult> {
  try {
    const raw = await fetchFromFootballDataOrg();
    const processed = processWorldCupData(raw);
    return { data: applyAdminOverrides(processed), source: "football-data.org" };
  } catch (err) {
    console.warn("[footballApiService] Usando dados demonstrativos:", err);
  }

  const mock = processWorldCupData(buildMockData());
  return {
    data: applyAdminOverrides(mock),
    source: "mock",
    warning: "Não foi possível buscar dados reais. Mostrando dados demonstrativos.",
  };
}
