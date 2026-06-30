import type { Team, Match, MatchStatus, Stage, WorldCupData, GroupStanding } from "@/lib/worldcup/types";

// Endpoints / config
const DEFAULT_PROXY_ENDPOINT = "/api/public/worldcup-data";
const PROXY_ENDPOINT =
  (import.meta.env.VITE_WORLDCUP_DATA_ENDPOINT as string | undefined) || DEFAULT_PROXY_ENDPOINT;

const DIRECT_API_URL = (import.meta.env.VITE_FOOTBALL_DATA_API_URL as string | undefined) || "https://api.football-data.org/v4";
const DIRECT_API_KEY = import.meta.env.VITE_FOOTBALL_DATA_API_KEY as string | undefined;
const COMPETITION = (import.meta.env.VITE_WORLD_CUP_COMPETITION_CODE as string | undefined) || "WC";
const SEASON = (import.meta.env.VITE_WORLD_CUP_SEASON as string | undefined) || "2026";

export const hasFootballDataOrgConfig = () => true; // proxy is always available

// ---------- low-level fetchers ----------

async function getJson(url: string, headers?: HeadersInit) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function fetchViaProxy(): Promise<{ matches: any; teams: any; standings: any }> {
  console.log("[football-data] URL base:", PROXY_ENDPOINT, "(proxy)");
  const data = await getJson(PROXY_ENDPOINT);
  return data;
}

async function fetchDirect(): Promise<{ matches: any; teams: any; standings: any }> {
  console.log("[football-data] URL base:", DIRECT_API_URL, "(direct)");
  console.log("[football-data] Token existe:", Boolean(DIRECT_API_KEY));
  if (!DIRECT_API_KEY) throw new Error("Token VITE_FOOTBALL_DATA_API_KEY ausente");
  const headers = { "X-Auth-Token": DIRECT_API_KEY };

  console.log("[football-data] Buscando matches...");
  const matches = await getJson(`${DIRECT_API_URL}/competitions/${COMPETITION}/matches?season=${SEASON}`, headers);
  console.log("[football-data] Matches recebidos:", matches?.matches?.length ?? 0);

  console.log("[football-data] Buscando teams...");
  const teams = await getJson(`${DIRECT_API_URL}/competitions/${COMPETITION}/teams?season=${SEASON}`, headers).catch((e) => {
    console.warn("[football-data] teams falhou:", e);
    return { teams: [] };
  });
  console.log("[football-data] Teams recebidos:", teams?.teams?.length ?? 0);

  console.log("[football-data] Buscando standings...");
  const standings = await getJson(`${DIRECT_API_URL}/competitions/${COMPETITION}/standings`, headers).catch((e) => {
    console.warn("[football-data] standings falhou (seguindo sem standings):", e);
    return { standings: [] };
  });
  console.log("[football-data] Standings recebidos:", standings);

  return { matches, teams, standings };
}

// ---------- public endpoint-style helpers (per spec) ----------

export async function fetchWorldCupMatches() {
  try {
    const { matches } = await fetchViaProxy();
    return matches;
  } catch {
    return getJson(`${DIRECT_API_URL}/competitions/${COMPETITION}/matches?season=${SEASON}`, {
      "X-Auth-Token": DIRECT_API_KEY || "",
    });
  }
}
export async function fetchWorldCupTeams() {
  try {
    const { teams } = await fetchViaProxy();
    return teams;
  } catch {
    return getJson(`${DIRECT_API_URL}/competitions/${COMPETITION}/teams?season=${SEASON}`, {
      "X-Auth-Token": DIRECT_API_KEY || "",
    });
  }
}
export async function fetchWorldCupStandings() {
  try {
    const { standings } = await fetchViaProxy();
    return standings;
  } catch {
    return getJson(`${DIRECT_API_URL}/competitions/${COMPETITION}/standings`, {
      "X-Auth-Token": DIRECT_API_KEY || "",
    });
  }
}

// ---------- normalization ----------

function mapStatus(s: string): MatchStatus {
  switch (s) {
    case "SCHEDULED":
    case "TIMED":
      return "scheduled";
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

function mapStage(s?: string): Stage {
  switch (s) {
    case "LAST_16": return "LAST_16";
    case "QUARTER_FINALS": return "QUARTER_FINALS";
    case "SEMI_FINALS": return "SEMI_FINALS";
    case "THIRD_PLACE": return "THIRD_PLACE";
    case "FINAL": return "FINAL";
    case "LAST_32":
    case "PLAYOFFS":
    case "PRELIMINARY_ROUND":
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

function determineWinnerId(match: any, home: Team | null, away: Team | null): string | null {
  const w = match.score?.winner;
  if (w === "HOME_TEAM" && home) return home.id;
  if (w === "AWAY_TEAM" && away) return away.id;
  if (w === "DRAW") {
    const ph = match.score?.penalties?.home;
    const pa = match.score?.penalties?.away;
    if (typeof ph === "number" && typeof pa === "number") {
      if (ph > pa && home) return home.id;
      if (pa > ph && away) return away.id;
    }
  }
  return null;
}

export function normalizeFootballDataOrgData(payload: {
  matches: any;
  teams?: any;
  standings?: any;
}): WorldCupData {
  const rawMatches: any[] = payload.matches?.matches || [];

  const matches: Match[] = rawMatches.map((m) => {
    const home = mapTeam(m.homeTeam);
    const away = mapTeam(m.awayTeam);
    const stage = mapStage(m.stage);
    return {
      id: String(m.id),
      stage,
      round: m.stage || (m.matchday ? `Rodada ${m.matchday}` : stage),
      homeTeam: home,
      awayTeam: away,
      homeScore: m.score?.fullTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? null,
      penaltiesHome: m.score?.penalties?.home ?? null,
      penaltiesAway: m.score?.penalties?.away ?? null,
      status: mapStatus(m.status),
      date: m.utcDate,
      venue: m.venue,
      winner: determineWinnerId(m, home, away),
    };
  });

  const teamMap = new Map<string, Team>();
  for (const t of payload.teams?.teams || []) {
    const mt = mapTeam(t);
    if (mt) teamMap.set(mt.id, mt);
  }
  for (const m of matches) {
    if (m.homeTeam && !teamMap.has(m.homeTeam.id)) teamMap.set(m.homeTeam.id, m.homeTeam);
    if (m.awayTeam && !teamMap.has(m.awayTeam.id)) teamMap.set(m.awayTeam.id, m.awayTeam);
  }

  const groups: GroupStanding[] = [];
  for (const s of payload.standings?.standings || []) {
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

// ---------- main entry ----------

export async function fetchWorldCupData(): Promise<WorldCupData> {
  // 1) proxy (preferred — no CORS, no exposed key)
  try {
    const payload = await fetchViaProxy();
    const matchesCount = payload?.matches?.matches?.length ?? 0;
    console.log("[football-data] Matches recebidos:", matchesCount);
    console.log("[football-data] Teams recebidos:", payload?.teams?.teams?.length ?? 0);
    console.log("[football-data] Standings recebidos:", payload?.standings);
    if (matchesCount === 0) throw new Error("Proxy retornou 0 matches");
    return normalizeFootballDataOrgData(payload);
  } catch (proxyErr) {
    console.error("[football-data] Proxy falhou:", proxyErr);
  }

  // 2) direct (only if VITE key was provided)
  if (DIRECT_API_KEY) {
    try {
      const payload = await fetchDirect();
      const matchesCount = payload?.matches?.matches?.length ?? 0;
      if (matchesCount === 0) throw new Error("Direct retornou 0 matches");
      return normalizeFootballDataOrgData(payload);
    } catch (directErr) {
      console.error("[football-data] Erro direto:", directErr);
      throw directErr;
    }
  }

  throw new Error("football-data.org indisponível");
}
