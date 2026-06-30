import type { Team, Match, WorldCupData, GroupStanding, Stage } from "./types";

// ─── Copa do Mundo 2026 — Dados Reais ───────────────────────────────────────
// Sede: EUA, Canadá e México | 48 seleções | 12 grupos (A–L)
// Fase de grupos: 11–27 de junho de 2026 (encerrada)
// Fase de 32: iniciada em 28 de junho de 2026
// Oitavas de final: 4–7 de julho de 2026
// ─────────────────────────────────────────────────────────────────────────────

const flag = (cc: string) => `https://flagcdn.com/w160/${cc.toLowerCase()}.png`;

const team = (id: string, name: string, cc: string, group?: string): Team => ({
  id, name, countryCode: cc, flagUrl: flag(cc), group,
});

// ── 12 grupos reais da Copa 2026 ──────────────────────────────────────────
const groupsRaw: Record<string, Team[]> = {
  A: [
    team("mex", "México",          "mx", "A"),
    team("zaf", "África do Sul",   "za", "A"),
    team("kor", "Coreia do Sul",   "kr", "A"),
    team("cze", "República Tcheca","cz", "A"),
  ],
  B: [
    team("sui", "Suíça",           "ch", "B"),
    team("can", "Canadá",          "ca", "B"),
    team("bih", "Bósnia-Herz.",    "ba", "B"),
    team("qat", "Catar",           "qa", "B"),
  ],
  C: [
    team("bra", "Brasil",          "br", "C"),
    team("mar", "Marrocos",        "ma", "C"),
    team("sco", "Escócia",         "gb-sct", "C"),
    team("hai", "Haiti",           "ht", "C"),
  ],
  D: [
    team("usa", "Estados Unidos",  "us", "D"),
    team("aus", "Austrália",       "au", "D"),
    team("par", "Paraguai",        "py", "D"),
    team("tur", "Turquia",         "tr", "D"),
  ],
  E: [
    team("ger", "Alemanha",        "de", "E"),
    team("civ", "Costa do Marfim", "ci", "E"),
    team("ecu", "Equador",         "ec", "E"),
    team("cur", "Curaçao",         "cw", "E"),
  ],
  F: [
    team("ned", "Países Baixos",   "nl", "F"),
    team("jpn", "Japão",           "jp", "F"),
    team("swe", "Suécia",          "se", "F"),
    team("tun", "Tunísia",         "tn", "F"),
  ],
  G: [
    team("egy", "Egito",           "eg", "G"),
    team("irn", "Irã",             "ir", "G"),
    team("bel", "Bélgica",         "be", "G"),
    team("nzl", "Nova Zelândia",   "nz", "G"),
  ],
  H: [
    team("esp", "Espanha",         "es", "H"),
    team("uru", "Uruguai",         "uy", "H"),
    team("cpv", "Cabo Verde",      "cv", "H"),
    team("ksa", "Arábia Saudita",  "sa", "H"),
  ],
  I: [
    team("fra", "França",          "fr", "I"),
    team("nor", "Noruega",         "no", "I"),
    team("sen", "Senegal",         "sn", "I"),
    team("irq", "Iraque",          "iq", "I"),
  ],
  J: [
    team("arg", "Argentina",       "ar", "J"),
    team("aut", "Áustria",         "at", "J"),
    team("alg", "Argélia",         "dz", "J"),
    team("jor", "Jordânia",        "jo", "J"),
  ],
  K: [
    team("col", "Colômbia",        "co", "K"),
    team("por", "Portugal",        "pt", "K"),
    team("cod", "DR Congo",        "cd", "K"),
    team("uzb", "Uzbequistão",     "uz", "K"),
  ],
  L: [
    team("eng", "Inglaterra",      "gb-eng", "L"),
    team("gha", "Gana",            "gh", "L"),
    team("cro", "Croácia",         "hr", "L"),
    team("pan", "Panamá",          "pa", "L"),
  ],
};

// ── Classificação real após fase de grupos ────────────────────────────────
// Fonte: FIFA / olympics.com (27 jun 2026)
const standings: Record<string, Array<{ id: string; p: number; w: number; d: number; l: number; gf: number; ga: number }>> = {
  A: [
    { id: "mex", p: 9, w: 3, d: 0, l: 0, gf: 7, ga: 2 },
    { id: "zaf", p: 4, w: 1, d: 1, l: 1, gf: 3, ga: 4 },
    { id: "kor", p: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5 },
    { id: "cze", p: 1, w: 0, d: 1, l: 2, gf: 2, ga: 4 },
  ],
  B: [
    { id: "sui", p: 7, w: 2, d: 1, l: 0, gf: 5, ga: 2 },
    { id: "can", p: 4, w: 1, d: 1, l: 1, gf: 4, ga: 3 },
    { id: "bih", p: 4, w: 1, d: 1, l: 1, gf: 3, ga: 3 },
    { id: "qat", p: 1, w: 0, d: 1, l: 2, gf: 1, ga: 5 },
  ],
  C: [
    { id: "bra", p: 7, w: 2, d: 1, l: 0, gf: 5, ga: 1 },
    { id: "mar", p: 7, w: 2, d: 1, l: 0, gf: 4, ga: 2 },
    { id: "sco", p: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5 },
    { id: "hai", p: 0, w: 0, d: 0, l: 3, gf: 0, ga: 4 },
  ],
  D: [
    { id: "usa", p: 6, w: 2, d: 0, l: 1, gf: 5, ga: 3 },
    { id: "aus", p: 4, w: 1, d: 1, l: 1, gf: 3, ga: 3 },
    { id: "par", p: 4, w: 1, d: 1, l: 1, gf: 4, ga: 4 },
    { id: "tur", p: 3, w: 1, d: 0, l: 2, gf: 4, ga: 6 },
  ],
  E: [
    { id: "ger", p: 6, w: 2, d: 0, l: 1, gf: 6, ga: 3 },
    { id: "civ", p: 6, w: 2, d: 0, l: 1, gf: 5, ga: 4 },
    { id: "ecu", p: 4, w: 1, d: 1, l: 1, gf: 3, ga: 4 },
    { id: "cur", p: 1, w: 0, d: 1, l: 2, gf: 1, ga: 4 },
  ],
  F: [
    { id: "ned", p: 7, w: 2, d: 1, l: 0, gf: 6, ga: 2 },
    { id: "jpn", p: 5, w: 1, d: 2, l: 0, gf: 3, ga: 2 },
    { id: "swe", p: 4, w: 1, d: 1, l: 1, gf: 3, ga: 4 },
    { id: "tun", p: 0, w: 0, d: 0, l: 3, gf: 1, ga: 5 },
  ],
  G: [
    { id: "egy", p: 4, w: 1, d: 1, l: 1, gf: 2, ga: 2 },
    { id: "irn", p: 2, w: 0, d: 2, l: 1, gf: 2, ga: 3 },
    { id: "bel", p: 2, w: 0, d: 2, l: 1, gf: 2, ga: 3 },
    { id: "nzl", p: 1, w: 0, d: 1, l: 2, gf: 1, ga: 3 },
  ],
  H: [
    { id: "esp", p: 4, w: 1, d: 1, l: 1, gf: 4, ga: 3 },
    { id: "uru", p: 2, w: 0, d: 2, l: 1, gf: 3, ga: 4 },
    { id: "cpv", p: 2, w: 0, d: 2, l: 1, gf: 2, ga: 3 },
    { id: "ksa", p: 1, w: 0, d: 1, l: 2, gf: 2, ga: 4 },
  ],
  I: [
    { id: "fra", p: 6, w: 2, d: 0, l: 1, gf: 7, ga: 3 },
    { id: "nor", p: 6, w: 2, d: 0, l: 1, gf: 5, ga: 4 },
    { id: "sen", p: 0, w: 0, d: 0, l: 3, gf: 1, ga: 6 },
    { id: "irq", p: 0, w: 0, d: 0, l: 3, gf: 1, ga: 6 },
  ],
  J: [
    { id: "arg", p: 6, w: 2, d: 0, l: 1, gf: 5, ga: 3 },
    { id: "aut", p: 3, w: 1, d: 0, l: 2, gf: 3, ga: 4 },
    { id: "alg", p: 3, w: 1, d: 0, l: 2, gf: 2, ga: 3 },
    { id: "jor", p: 0, w: 0, d: 0, l: 3, gf: 1, ga: 5 },
  ],
  K: [
    { id: "col", p: 6, w: 2, d: 0, l: 1, gf: 5, ga: 2 },
    { id: "por", p: 4, w: 1, d: 1, l: 1, gf: 6, ga: 4 },
    { id: "cod", p: 1, w: 0, d: 1, l: 2, gf: 2, ga: 6 },
    { id: "uzb", p: 0, w: 0, d: 0, l: 3, gf: 1, ga: 5 },
  ],
  L: [
    { id: "eng", p: 4, w: 1, d: 1, l: 1, gf: 4, ga: 3 },
    { id: "gha", p: 4, w: 1, d: 1, l: 1, gf: 3, ga: 3 },
    { id: "cro", p: 3, w: 1, d: 0, l: 2, gf: 3, ga: 4 },
    { id: "pan", p: 0, w: 0, d: 0, l: 3, gf: 1, ga: 5 },
  ],
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
      .sort(
        (a, b) =>
          (b.points! - a.points!) ||
          (b.goalDifference! - a.goalDifference!) ||
          (b.goalsFor! - a.goalsFor!),
      ),
  }));
}

const findTeam = (teams: Team[], id: string) => teams.find((t) => t.id === id) || null;

function buildMatches(teams: Team[]): Match[] {
  const t = (id: string) => findTeam(teams, id);
  const matches: Match[] = [];

  // ── Fase de 32 (32 avos de final) — resultados conhecidos até 30/06 ──
  // África do Sul 0 x 1 Canadá (28/06)
  // Brasil 2 x 1 Japão (29/06)
  // Alemanha 1(3) x (4)1 Paraguai — pênaltis (29/06)
  // Países Baixos 1(2) x (3)1 Marrocos — pênaltis (29/06)

  const r32Finished: Array<[string, string, string, number, number, number?, number?]> = [
    ["r32-1",  "zaf", "can",  0, 1],
    ["r32-2",  "bra", "jpn",  2, 1],
    ["r32-3",  "ger", "par",  1, 1, 3, 4], // Paraguai nos pênaltis
    ["r32-4",  "ned", "mar",  1, 1, 2, 3], // Marrocos nos pênaltis
  ];

  for (const [id, h, a, hs, as_, ph, pa] of r32Finished) {
    const home = t(h);
    const away = t(a);
    const hasPens = ph !== undefined && pa !== undefined;
    const winner = hasPens
      ? ph! > pa! ? h : a
      : hs > as_ ? h : as_ > hs ? a : null;
    matches.push({
      id,
      stage: "LAST_32" as Stage,
      round: "Fase de 32",
      homeTeam: home,
      awayTeam: away,
      homeScore: hs,
      awayScore: as_,
      penaltiesHome: hasPens ? ph! : null,
      penaltiesAway: hasPens ? pa! : null,
      status: "finished",
      date: "2026-06-29T20:00:00Z",
      winner,
    });
  }

  // Jogos de 30/06 — ainda em andamento / agendados
  const r32Scheduled: Array<[string, string, string, string]> = [
    ["r32-5",  "fra", "swe",  "2026-06-30T21:00:00Z"],
    ["r32-6",  "mex", "ecu",  "2026-06-30T21:00:00Z"],
    ["r32-7",  "civ", "nor",  "2026-06-30T21:00:00Z"],
    ["r32-8",  "esp", "egy",  "2026-06-30T21:00:00Z"],
  ];

  for (const [id, h, a, date] of r32Scheduled) {
    matches.push({
      id,
      stage: "LAST_32" as Stage,
      round: "Fase de 32",
      homeTeam: t(h),
      awayTeam: t(a),
      homeScore: null,
      awayScore: null,
      penaltiesHome: null,
      penaltiesAway: null,
      status: "scheduled",
      date,
      winner: null,
    });
  }

  // Fase de 32 — restantes a definir
  const r32Tbd: Array<[string, string, string, string]> = [
    ["r32-9",  "arg", "sui",  "2026-07-01T21:00:00Z"],
    ["r32-10", "col", "aut",  "2026-07-01T21:00:00Z"],
    ["r32-11", "usa", "irn",  "2026-07-02T21:00:00Z"],
    ["r32-12", "eng", "bih",  "2026-07-02T21:00:00Z"],
    ["r32-13", "por", "gha",  "2026-07-03T21:00:00Z"],
    ["r32-14", "uru", "kor",  "2026-07-03T21:00:00Z"],
    ["r32-15", "fra", "egy",  "2026-07-03T21:00:00Z"], // placeholder
    ["r32-16", "bra", "nor",  "2026-07-05T21:00:00Z"], // Brasil x Noruega — oitavas
  ];

  for (const [id, h, a, date] of r32Tbd) {
    matches.push({
      id,
      stage: id === "r32-16" ? "LAST_16" as Stage : "LAST_32" as Stage,
      round: id === "r32-16" ? "Oitavas de Final" : "Fase de 32",
      homeTeam: t(h),
      awayTeam: t(a),
      homeScore: null,
      awayScore: null,
      penaltiesHome: null,
      penaltiesAway: null,
      status: "scheduled",
      date,
      winner: null,
    });
  }

  return matches;
}

export function buildMockData(): Omit<WorldCupData, "bracket" | "source" | "lastUpdated"> & {
  rawMatches: Match[];
  rawGroups: GroupStanding[];
} {
  const allTeams = buildTeams();
  const allGroups = buildGroups(allTeams);
  const allMatches = buildMatches(allTeams);

  return {
    teams: allTeams,
    groups: allGroups,
    matches: allMatches,
    rawMatches: allMatches,
    rawGroups: allGroups,
    champion: null,
  } as any;
}
