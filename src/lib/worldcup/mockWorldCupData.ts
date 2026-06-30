import type { Team, Match, WorldCupData, BracketRound, GroupStanding, Stage } from "./types";

const flag = (cc: string) => `https://flagcdn.com/w160/${cc.toLowerCase()}.png`;

const team = (id: string, name: string, cc: string, group?: string): Team => ({
  id,
  name,
  countryCode: cc,
  flagUrl: flag(cc),
  group,
});

// 32 selections, 8 groups
const groupsRaw: Record<string, Team[]> = {
  A: [team("qat", "Catar", "qa", "A"), team("ecu", "Equador", "ec", "A"), team("sen", "Senegal", "sn", "A"), team("ned", "Holanda", "nl", "A")],
  B: [team("eng", "Inglaterra", "gb", "B"), team("usa", "Estados Unidos", "us", "B"), team("irn", "Irã", "ir", "B"), team("wal", "País de Gales", "gb", "B")],
  C: [team("arg", "Argentina", "ar", "C"), team("ksa", "Arábia Saudita", "sa", "C"), team("mex", "México", "mx", "C"), team("pol", "Polônia", "pl", "C")],
  D: [team("fra", "França", "fr", "D"), team("aus", "Austrália", "au", "D"), team("den", "Dinamarca", "dk", "D"), team("tun", "Tunísia", "tn", "D")],
  E: [team("esp", "Espanha", "es", "E"), team("cri", "Costa Rica", "cr", "E"), team("ger", "Alemanha", "de", "E"), team("jpn", "Japão", "jp", "E")],
  F: [team("bel", "Bélgica", "be", "F"), team("can", "Canadá", "ca", "F"), team("mar", "Marrocos", "ma", "F"), team("cro", "Croácia", "hr", "F")],
  G: [team("bra", "Brasil", "br", "G"), team("srb", "Sérvia", "rs", "G"), team("sui", "Suíça", "ch", "G"), team("cmr", "Camarões", "cm", "G")],
  H: [team("por", "Portugal", "pt", "H"), team("gha", "Gana", "gh", "H"), team("uru", "Uruguai", "uy", "H"), team("kor", "Coreia do Sul", "kr", "H")],
};

// Fictitious standings for demonstration
const standings: Record<string, Array<{ id: string; p: number; w: number; d: number; l: number; gf: number; ga: number }>> = {
  A: [{ id: "ned", p: 7, w: 2, d: 1, l: 0, gf: 5, ga: 1 }, { id: "sen", p: 6, w: 2, d: 0, l: 1, gf: 5, ga: 4 }, { id: "ecu", p: 4, w: 1, d: 1, l: 1, gf: 4, ga: 3 }, { id: "qat", p: 0, w: 0, d: 0, l: 3, gf: 1, ga: 7 }],
  B: [{ id: "eng", p: 7, w: 2, d: 1, l: 0, gf: 9, ga: 2 }, { id: "usa", p: 5, w: 1, d: 2, l: 0, gf: 2, ga: 1 }, { id: "irn", p: 3, w: 1, d: 0, l: 2, gf: 4, ga: 7 }, { id: "wal", p: 1, w: 0, d: 1, l: 2, gf: 1, ga: 6 }],
  C: [{ id: "arg", p: 6, w: 2, d: 0, l: 1, gf: 5, ga: 2 }, { id: "pol", p: 4, w: 1, d: 1, l: 1, gf: 2, ga: 2 }, { id: "mex", p: 4, w: 1, d: 1, l: 1, gf: 2, ga: 3 }, { id: "ksa", p: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5 }],
  D: [{ id: "fra", p: 6, w: 2, d: 0, l: 1, gf: 6, ga: 3 }, { id: "aus", p: 6, w: 2, d: 0, l: 1, gf: 3, ga: 4 }, { id: "tun", p: 4, w: 1, d: 1, l: 1, gf: 1, ga: 1 }, { id: "den", p: 1, w: 0, d: 1, l: 2, gf: 1, ga: 3 }],
  E: [{ id: "jpn", p: 6, w: 2, d: 0, l: 1, gf: 4, ga: 3 }, { id: "esp", p: 4, w: 1, d: 1, l: 1, gf: 9, ga: 3 }, { id: "ger", p: 4, w: 1, d: 1, l: 1, gf: 6, ga: 5 }, { id: "cri", p: 3, w: 1, d: 0, l: 2, gf: 3, ga: 11 }],
  F: [{ id: "mar", p: 7, w: 2, d: 1, l: 0, gf: 4, ga: 1 }, { id: "cro", p: 5, w: 1, d: 2, l: 0, gf: 4, ga: 1 }, { id: "bel", p: 4, w: 1, d: 1, l: 1, gf: 1, ga: 2 }, { id: "can", p: 0, w: 0, d: 0, l: 3, gf: 2, ga: 7 }],
  G: [{ id: "bra", p: 6, w: 2, d: 0, l: 1, gf: 3, ga: 1 }, { id: "sui", p: 6, w: 2, d: 0, l: 1, gf: 4, ga: 3 }, { id: "cmr", p: 4, w: 1, d: 1, l: 1, gf: 4, ga: 4 }, { id: "srb", p: 1, w: 0, d: 1, l: 2, gf: 5, ga: 8 }],
  H: [{ id: "por", p: 6, w: 2, d: 0, l: 1, gf: 6, ga: 4 }, { id: "kor", p: 4, w: 1, d: 1, l: 1, gf: 4, ga: 4 }, { id: "uru", p: 4, w: 1, d: 1, l: 1, gf: 2, ga: 2 }, { id: "gha", p: 3, w: 1, d: 0, l: 2, gf: 5, ga: 7 }],
};

function buildTeams(): Team[] {
  const out: Team[] = [];
  for (const g of Object.keys(groupsRaw)) {
    for (const t of groupsRaw[g]) {
      const s = standings[g].find((x) => x.id === t.id)!;
      out.push({
        ...t,
        played: s.w + s.d + s.l,
        won: s.w,
        drawn: s.d,
        lost: s.l,
        points: s.p,
        goalsFor: s.gf,
        goalsAgainst: s.ga,
        goalDifference: s.gf - s.ga,
      });
    }
  }
  return out;
}

function buildGroups(teams: Team[]): GroupStanding[] {
  return Object.keys(groupsRaw).map((g) => ({
    group: g,
    teams: teams
      .filter((t) => t.group === g)
      .sort((a, b) => (b.points! - a.points!) || (b.goalDifference! - a.goalDifference!) || (b.goalsFor! - a.goalsFor!)),
  }));
}

const findTeam = (teams: Team[], id: string) => teams.find((t) => t.id === id) || null;

function buildMatches(teams: Team[]): Match[] {
  const t = (id: string) => findTeam(teams, id);
  const matches: Match[] = [];

  // Last 16 — finished
  const r16: Array<[string, string, string, number, number, number?, number?]> = [
    ["r16-1", "ned", "usa", 3, 1],
    ["r16-2", "arg", "aus", 2, 1],
    ["r16-3", "fra", "pol", 3, 1],
    ["r16-4", "eng", "sen", 3, 0],
    ["r16-5", "jpn", "cro", 1, 1, 1, 3], // pens
    ["r16-6", "bra", "kor", 4, 1],
    ["r16-7", "mar", "esp", 0, 0, 3, 0],
    ["r16-8", "por", "sui", 6, 1],
  ];

  r16.forEach(([id, h, a, hs, as_, ph, pa], i) => {
    const nextId = `qf-${Math.floor(i / 2) + 1}`;
    matches.push({
      id,
      stage: "LAST_16",
      homeTeam: t(h),
      awayTeam: t(a),
      homeScore: hs,
      awayScore: as_,
      penaltiesHome: ph ?? null,
      penaltiesAway: pa ?? null,
      status: "finished",
      date: "2026-06-25T20:00:00Z",
      winner: ph !== undefined ? (ph! > pa! ? h : a) : (hs > as_ ? h : a),
      nextMatchId: nextId,
      nextMatchSlot: i % 2 === 0 ? "home" : "away",
    });
  });

  // QF — 2 finished, 2 scheduled
  matches.push({
    id: "qf-1", stage: "QUARTER_FINALS",
    homeTeam: t("ned"), awayTeam: t("arg"),
    homeScore: 2, awayScore: 2, penaltiesHome: 3, penaltiesAway: 4,
    status: "finished", date: "2026-07-01T20:00:00Z",
    winner: "arg", nextMatchId: "sf-1", nextMatchSlot: "home",
  });
  matches.push({
    id: "qf-2", stage: "QUARTER_FINALS",
    homeTeam: t("fra"), awayTeam: t("eng"),
    homeScore: 2, awayScore: 1, penaltiesHome: null, penaltiesAway: null,
    status: "finished", date: "2026-07-02T20:00:00Z",
    winner: "fra", nextMatchId: "sf-1", nextMatchSlot: "away",
  });
  matches.push({
    id: "qf-3", stage: "QUARTER_FINALS",
    homeTeam: t("jpn"), awayTeam: t("bra"),
    homeScore: null, awayScore: null,
    status: "scheduled", date: "2026-07-03T20:00:00Z",
    nextMatchId: "sf-2", nextMatchSlot: "home",
  });
  matches.push({
    id: "qf-4", stage: "QUARTER_FINALS",
    homeTeam: t("mar"), awayTeam: t("por"),
    homeScore: null, awayScore: null,
    status: "scheduled", date: "2026-07-04T20:00:00Z",
    nextMatchId: "sf-2", nextMatchSlot: "away",
  });

  // SF — empty
  matches.push({
    id: "sf-1", stage: "SEMI_FINALS",
    homeTeam: t("arg"), awayTeam: t("fra"),
    homeScore: null, awayScore: null, status: "scheduled",
    date: "2026-07-08T20:00:00Z",
    nextMatchId: "final", nextMatchSlot: "home",
  });
  matches.push({
    id: "sf-2", stage: "SEMI_FINALS",
    homeTeam: null, awayTeam: null,
    homeScore: null, awayScore: null, status: "scheduled",
    date: "2026-07-09T20:00:00Z",
    nextMatchId: "final", nextMatchSlot: "away",
  });

  matches.push({
    id: "third", stage: "THIRD_PLACE",
    homeTeam: null, awayTeam: null,
    homeScore: null, awayScore: null, status: "scheduled",
    date: "2026-07-15T20:00:00Z",
  });
  matches.push({
    id: "final", stage: "FINAL",
    homeTeam: null, awayTeam: null,
    homeScore: null, awayScore: null, status: "scheduled",
    date: "2026-07-16T20:00:00Z",
  });

  return matches;
}

export function buildMockData(): WorldCupData {
  const teams = buildTeams();
  const groups = buildGroups(teams);
  const matches = buildMatches(teams);
  return {
    teams,
    groups,
    matches,
    bracket: [],
    source: "mock",
    lastUpdated: new Date().toISOString(),
  };
}
