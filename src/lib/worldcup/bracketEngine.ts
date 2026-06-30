import type { Match, BracketRound, Team, WorldCupData, Stage } from "./types";

const STAGE_NAMES: Record<Stage, string> = {
  GROUP_STAGE: "Fase de Grupos",
  LAST_32: "Fase de 32",
  LAST_16: "Oitavas de Final",
  QUARTER_FINALS: "Quartas de Final",
  SEMI_FINALS: "Semifinais",
  THIRD_PLACE: "Disputa de 3º Lugar",
  FINAL: "Final",
};

const BRACKET_ORDER: Stage[] = ["LAST_32", "LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "THIRD_PLACE", "FINAL"];

export function getStageName(s: Stage) {
  return STAGE_NAMES[s];
}

export function identifyWinner(match: Match): { winner: Team | null; loser: Team | null } {
  if (match.status !== "finished" || !match.homeTeam || !match.awayTeam) {
    return { winner: null, loser: null };
  }
  if (match.homeScore == null || match.awayScore == null) return { winner: null, loser: null };

  if (match.homeScore > match.awayScore) return { winner: match.homeTeam, loser: match.awayTeam };
  if (match.awayScore > match.homeScore) return { winner: match.awayTeam, loser: match.homeTeam };

  // penalties
  if (match.penaltiesHome != null && match.penaltiesAway != null) {
    if (match.penaltiesHome > match.penaltiesAway) return { winner: match.homeTeam, loser: match.awayTeam };
    if (match.penaltiesAway > match.penaltiesHome) return { winner: match.awayTeam, loser: match.homeTeam };
  }
  return { winner: null, loser: null };
}

/** Propagates winners forward through bracket. Mutates copies. */
export function advanceBracket(matchesIn: Match[]): Match[] {
  const matches = matchesIn.map((m) => ({ ...m }));
  const byId = new Map(matches.map((m) => [m.id, m]));

  // process knockout in order
  const knockoutOrder: Stage[] = ["LAST_32", "LAST_16", "QUARTER_FINALS", "SEMI_FINALS"];
  for (const stage of knockoutOrder) {
    const stageMatches = matches.filter((m) => m.stage === stage);
    for (const m of stageMatches) {
      const { winner, loser } = identifyWinner(m);
      if (!winner) continue;
      m.winner = winner.id;
      m.loser = loser?.id ?? null;

      if (m.nextMatchId) {
        const next = byId.get(m.nextMatchId);
        if (next) {
          if (m.nextMatchSlot === "home" && !next.homeTeam) next.homeTeam = winner;
          else if (m.nextMatchSlot === "away" && !next.awayTeam) next.awayTeam = winner;
        }
      }

      // Semifinal losers → third place
      if (stage === "SEMI_FINALS" && loser) {
        const third = matches.find((x) => x.stage === "THIRD_PLACE");
        if (third) {
          if (!third.homeTeam) third.homeTeam = loser;
          else if (!third.awayTeam && third.homeTeam.id !== loser.id) third.awayTeam = loser;
        }
      }
    }
  }
  return matches;
}

export function buildBracket(matches: Match[]): BracketRound[] {
  const rounds: BracketRound[] = [];
  for (const stage of BRACKET_ORDER) {
    const stageMatches = matches.filter((m) => m.stage === stage);
    if (stageMatches.length === 0) continue;
    rounds.push({
      id: stage,
      name: STAGE_NAMES[stage],
      stage,
      matches: stageMatches.sort((a, b) => a.id.localeCompare(b.id)),
    });
  }
  return rounds;
}

export function getChampion(matches: Match[]): Team | null {
  const final = matches.find((m) => m.stage === "FINAL");
  if (!final) return null;
  const { winner } = identifyWinner(final);
  return winner;
}

export function processWorldCupData(input: Omit<WorldCupData, "bracket" | "champion">): WorldCupData {
  const updatedMatches = advanceBracket(input.matches);
  const bracket = buildBracket(updatedMatches);
  const champion = getChampion(updatedMatches);
  return {
    ...input,
    matches: updatedMatches,
    bracket,
    champion,
  };
}

/** Used by simulator to force a winner for a knockout match. */
export function simulateWinner(matches: Match[], matchId: string, winnerId: "home" | "away"): Match[] {
  const copy = matches.map((m) => ({ ...m, homeTeam: m.homeTeam, awayTeam: m.awayTeam }));
  const byId = new Map(copy.map((m) => [m.id, m]));
  const m = byId.get(matchId);
  if (!m || !m.homeTeam || !m.awayTeam) return matches;

  // mark as finished with synthetic score
  if (m.homeScore == null || m.awayScore == null) {
    m.homeScore = winnerId === "home" ? 1 : 0;
    m.awayScore = winnerId === "away" ? 1 : 0;
  }
  m.status = "finished";
  m.winner = winnerId === "home" ? m.homeTeam.id : m.awayTeam.id;

  // wipe forward dependencies first so they recompute
  const toClear = new Set<string>();
  const collectForward = (mid: string) => {
    const cur = byId.get(mid);
    if (!cur?.nextMatchId) return;
    toClear.add(cur.nextMatchId);
    collectForward(cur.nextMatchId);
  };
  collectForward(matchId);
  for (const id of toClear) {
    const f = byId.get(id);
    if (!f) continue;
    f.homeTeam = null;
    f.awayTeam = null;
    f.homeScore = null;
    f.awayScore = null;
    f.status = "scheduled";
    f.winner = null;
  }
  // also clear third place
  const third = copy.find((x) => x.stage === "THIRD_PLACE");
  if (third) {
    third.homeTeam = null;
    third.awayTeam = null;
    third.homeScore = null;
    third.awayScore = null;
    third.status = "scheduled";
    third.winner = null;
  }

  return advanceBracket(copy);
}

/** Path a team would take to the final, given current bracket. */
export function getTeamPath(teamId: string, matches: Match[]): Match[] {
  return matches
    .filter((m) => m.homeTeam?.id === teamId || m.awayTeam?.id === teamId)
    .sort((a, b) => BRACKET_ORDER.indexOf(a.stage) - BRACKET_ORDER.indexOf(b.stage));
}
