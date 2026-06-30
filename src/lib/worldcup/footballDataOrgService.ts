import type { Team, Match, MatchStatus, Stage, WorldCupData, GroupStanding } from "./types";

const API_URL = import.meta.env.VITE_FOOTBALL_DATA_API_URL || "https://api.football-data.org/v4";
const API_KEY = import.meta.env.VITE_FOOTBALL_DATA_API_KEY as string | undefined;
const COMPETITION = import.meta.env.VITE_WORLD_CUP_COMPETITION_CODE || "WC";
const SEASON = import.meta.env.VITE_WORLD_CUP_SEASON || "2026";

export const hasFootballDataOrgConfig = () => Boolean(API_KEY);

const headers = (): HeadersInit => ({
  "X-Auth-Token": API_KEY || "",
});

async function get<T>(path: string): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`football-data.org ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function fetchWorldCupMatches() {
  return get<any>(`/competitions/${COMPETITION}/matches?season=${SEASON}`);
}
export async function fetchWorldCupTeams() {
  return get<any>(`/competitions/${COMPETITION}/teams?season=${SEASON}`);
}
export async function fetchWorldCupStandings() {
  return get<any>(`/competitions/${COMPETITION}/standings`);
}

function mapStatus(s: string): MatchStatus {
  switch (s) {
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    case "FINISHED":
      return "finished";
    case "POSTPONED":
    case "SUSPENDED":
    case "CANCELLED":
      return "postponed";
    default:
      return "scheduled";
  }
}

function mapStage(s: string): Stage {
  switch (s) {
    case "LAST_16":
      return "LAST_16";
    case "QUARTER_FINALS":
      return "QUARTER_FINALS";
    case "SEMI_FINALS":
      return "SEMI_FINALS";
    case "THIRD_PLACE":
      return "THIRD_PLACE";
    case "FINAL":
      return "FINAL";
    case "PRELIMINARY_ROUND":
    case "PLAYOFFS":
    case "LAST_32":
      return "LAST_32";
    default:
      return "GROUP_STAGE";
  }
}

const ccFromTla = (tla?: string | null) => (tla || "").slice(0, 2).toLowerCase();
const flagUrl = (tla?: string | null) => `https://flagcdn.com/w160/${ccFromTla(tla) || "un"}.png`;

function mapTeam(t: any): Team | null {
  if (!t || !t.id) return null;
  return {
    id: String(t.id),
    name: t.name || t.shortName || t.tla || "A definir",
    countryCode: ccFromTla(t.tla),
    flagUrl: t.crest || flagUrl(t.tla),
  };
}

export function normalizeFootballDataOrgData(payload: {
  matches: any;
  teams?: any;
  standings?: any;
}): WorldCupData {
  const rawMatches: any[] = payload.matches?.matches || [];

  const matches: Match[] = rawMatches.map((m) => {
    const status = mapStatus(m.status);
    const stage = mapStage(m.stage);
    const home = mapTeam(m.homeTeam);
    const away = mapTeam(m.awayTeam);
    const winnerCode = m.score?.winner;
    let winnerId: string | null = null;
    if (winnerCode === "HOME_TEAM" && home) winnerId = home.id;
    else if (winnerCode === "AWAY_TEAM" && away) winnerId = away.id;

    return {
      id: String(m.id),
      stage,
      round: m.matchday ? `Rodada ${m.matchday}` : stage,
      homeTeam: home,
      awayTeam: away,
      homeScore: m.score?.fullTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? null,
      penaltiesHome: m.score?.penalties?.home ?? null,
      penaltiesAway: m.score?.penalties?.away ?? null,
      status,
      date: m.utcDate,
      venue: m.venue,
      winner: winnerId,
    };
  });

  // Teams
  const rawTeams: any[] = payload.teams?.teams || [];
  const teamMap = new Map<string, Team>();
  for (const t of rawTeams) {
    const mt = mapTeam(t);
    if (mt) teamMap.set(mt.id, mt);
  }
  // also collect from matches
  for (const m of matches) {
    if (m.homeTeam && !teamMap.has(m.homeTeam.id)) teamMap.set(m.homeTeam.id, m.homeTeam);
    if (m.awayTeam && !teamMap.has(m.awayTeam.id)) teamMap.set(m.awayTeam.id, m.awayTeam);
  }

  // Standings → groups
  const groups: GroupStanding[] = [];
  const rawStandings: any[] = payload.standings?.standings || [];
  for (const s of rawStandings) {
    if (s.type !== "TOTAL") continue;
    const groupName = (s.group || "").replace("GROUP_", "");
    if (!groupName) continue;
    const teams: Team[] = (s.table || []).map((row: any) => {
      const base = teamMap.get(String(row.team?.id)) || mapTeam(row.team);
      if (!base) return null;
      const enriched: Team = {
        ...base,
        group: groupName,
        played: row.playedGames,
        won: row.won,
        drawn: row.draw,
        lost: row.lost,
        points: row.points,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference: row.goalDifference,
      };
      teamMap.set(enriched.id, enriched);
      return enriched;
    }).filter(Boolean) as Team[];
    groups.push({ group: groupName, teams });
  }

  return {
    teams: Array.from(teamMap.values()),
    groups,
    matches,
    bracket: [],
    source: "football-data.org",
    lastUpdated: new Date().toISOString(),
  };
}

export async function fetchWorldCupData(): Promise<WorldCupData> {
  if (!hasFootballDataOrgConfig()) throw new Error("football-data.org não configurado");
  const [matches, teams, standings] = await Promise.allSettled([
    fetchWorldCupMatches(),
    fetchWorldCupTeams(),
    fetchWorldCupStandings(),
  ]);

  const matchesData = matches.status === "fulfilled" ? matches.value : { matches: [] };
  const teamsData = teams.status === "fulfilled" ? teams.value : { teams: [] };
  const standingsData = standings.status === "fulfilled" ? standings.value : { standings: [] };

  if (matches.status === "rejected") {
    throw matches.reason;
  }

  return normalizeFootballDataOrgData({
    matches: matchesData,
    teams: teamsData,
    standings: standingsData,
  });
}
