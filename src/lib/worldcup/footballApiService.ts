import type { WorldCupData, Match, BracketRound, Stage } from "./types";
import { buildMockData } from "./mockWorldCupData";
import { processWorldCupData, advanceBracket, identifyWinner } from "./bracketEngine";
import { loadAdminScores } from "@/utils/adminScores";
import { loadMatchResults } from "@/services/matchResultsService";

export type DataSource = "football-data.org" | "api-football" | "mock";

export interface FetchResult {
  data: WorldCupData;
  source: DataSource;
  warning?: string;
}

/** Tipo unificado de override de placar (vem do Supabase OU localStorage) */
interface ScoreOverride {
  matchId: string;
  homeScore: number;
  awayScore: number;
  penaltiesHome?: number | null;
  penaltiesAway?: number | null;
  done: boolean;
}

/**
 * Aplica overrides de placar (do Supabase ou localStorage) sobre os dados da Copa.
 * Usa identifyWinner para calcular o vencedor a partir do placar.
 */
function applyOverrides(data: WorldCupData, overrides: ScoreOverride[]): WorldCupData {
  if (!overrides.length) return data;

  const matches: Match[] = data.matches.map((m) => {
    const override = overrides.find((s) => s.matchId === m.id);
    if (!override) return m;

    const updated: Match = {
      ...m,
      homeScore:     override.homeScore,
      awayScore:     override.awayScore,
      penaltiesHome: override.penaltiesHome ?? null,
      penaltiesAway: override.penaltiesAway ?? null,
      status:        override.done ? "finished" : m.status,
    };

    if (override.done && m.homeTeam && m.awayTeam) {
      const { winner, loser } = identifyWinner(updated);
      updated.winner = winner?.id ?? null;
      updated.loser  = loser?.id  ?? null;
    }

    return updated;
  });

  const updatedMatches = advanceBracket(matches);

  // Reconstruir o bracket a partir dos matches atualizados
  const STAGE_ORDER: Stage[] = [
    "LAST_32", "LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "THIRD_PLACE", "FINAL",
  ];
  const STAGE_NAMES: Record<Stage, string> = {
    GROUP_STAGE: "Fase de Grupos",
    LAST_32:     "16 Avos de Final",
    LAST_16:     "Oitavas de Final",
    QUARTER_FINALS: "Quartas de Final",
    SEMI_FINALS: "Semifinais",
    THIRD_PLACE: "3º Lugar",
    FINAL:       "Final",
  };
  const bracket: BracketRound[] = STAGE_ORDER
    .map((stage) => ({
      id:      stage,
      name:    STAGE_NAMES[stage],
      stage,
      matches: updatedMatches.filter((m) => m.stage === stage),
    }))
    .filter((r) => r.matches.length > 0);

  return { ...data, matches: updatedMatches, bracket };
}

/**
 * Busca dados da Copa do Mundo.
 * Usa dados demonstrativos (mockWorldCupData) e aplica overrides de:
 * 1. Supabase match_results (admin online — sem deploy)
 * 2. Fallback: localStorage adminScores
 */
export async function fetchWorldCupData(): Promise<FetchResult> {
  const mock = processWorldCupData(buildMockData());

  // Tentar carregar overrides do Supabase (admin salvou sem deploy)
  try {
    const sbResults = await loadMatchResults();
    if (sbResults.length) {
      const overrides: ScoreOverride[] = sbResults.map((r) => ({
        matchId:      r.match_id,
        homeScore:    r.home_score,
        awayScore:    r.away_score,
        penaltiesHome: r.penalties_home,
        penaltiesAway: r.penalties_away,
        done:         r.done,
      }));
      return { data: applyOverrides(mock, overrides), source: "mock" };
    }
  } catch (err) {
    console.warn("[fetchWorldCupData] Supabase match_results indisponível, usando localStorage:", err);
  }

  // Fallback: localStorage (admin offline ou Supabase sem tabela)
  const localScores = loadAdminScores();
  if (localScores.length) {
    const overrides: ScoreOverride[] = localScores.map((s) => ({
      matchId:      s.matchId,
      homeScore:    s.homeScore,
      awayScore:    s.awayScore,
      penaltiesHome: s.penaltiesHome,
      penaltiesAway: s.penaltiesAway,
      done:         s.done,
    }));
    return { data: applyOverrides(mock, overrides), source: "mock" };
  }

  return { data: mock, source: "mock" };
}
