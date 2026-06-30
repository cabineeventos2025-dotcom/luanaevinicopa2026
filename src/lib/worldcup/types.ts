export type MatchStatus = "scheduled" | "live" | "finished" | "postponed";

export type Stage =
  | "GROUP_STAGE"
  | "LAST_32"
  | "LAST_16"
  | "QUARTER_FINALS"
  | "SEMI_FINALS"
  | "THIRD_PLACE"
  | "FINAL";

export interface Team {
  id: string;
  name: string;
  shortName?: string;
  tla?: string;
  countryCode: string;
  flagUrl: string;
  group?: string;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  points?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
}

export interface Match {
  id: string;
  stage: Stage;
  round?: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore: number | null;
  awayScore: number | null;
  penaltiesHome?: number | null;
  penaltiesAway?: number | null;
  winner?: string | null;
  loser?: string | null;
  status: MatchStatus;
  date: string;
  venue?: string;
  city?: string;
  nextMatchId?: string | null;
  nextMatchSlot?: "home" | "away" | null;
  simulated?: boolean; // true when resultado foi definido pelo simulador (não real)
}

export interface BracketRound {
  id: string;
  name: string;
  stage: Stage;
  matches: Match[];
}

export interface GroupStanding {
  group: string;
  teams: Team[];
}

export interface WorldCupData {
  teams: Team[];
  groups: GroupStanding[];
  matches: Match[];
  bracket: BracketRound[];
  champion?: Team | null;
  source: "football-data.org" | "api-football" | "mock";
  lastUpdated: string;
}
