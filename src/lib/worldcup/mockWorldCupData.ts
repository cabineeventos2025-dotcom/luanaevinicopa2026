import type { Team, Match, WorldCupData, GroupStanding, Stage } from "./types";

// ─── Copa do Mundo 2026 — Dados Reais ────────────────────────────────────────
// Sede: EUA, Canadá, México | 48 seleções | 12 grupos (A–L)
// Fase de grupos: 11–27 jun 2026 (encerrada)
// Fase de 32: 28 jun – 4 jul 2026
// Oitavas: 4–7 jul 2026
// ─────────────────────────────────────────────────────────────────────────────

const flag = (cc: string) => `https://flagcdn.com/w160/${cc.toLowerCase()}.png`;
const team = (id: string, name: string, cc: string, group?: string): Team => ({
  id, name, countryCode: cc, flagUrl: flag(cc), group,
});

const groupsRaw: Record<string, Team[]> = {
  A: [team("mex","México","mx","A"), team("zaf","África do Sul","za","A"), team("kor","Coreia do Sul","kr","A"), team("cze","Rep. Tcheca","cz","A")],
  B: [team("sui","Suíça","ch","B"), team("can","Canadá","ca","B"), team("bih","Bósnia-Herz.","ba","B"), team("qat","Catar","qa","B")],
  C: [team("bra","Brasil","br","C"), team("mar","Marrocos","ma","C"), team("sco","Escócia","gb-sct","C"), team("hai","Haiti","ht","C")],
  D: [team("usa","Estados Unidos","us","D"), team("aus","Austrália","au","D"), team("par","Paraguai","py","D"), team("tur","Turquia","tr","D")],
  E: [team("ger","Alemanha","de","E"), team("civ","Costa do Marfim","ci","E"), team("ecu","Equador","ec","E"), team("cur","Curaçao","cw","E")],
  F: [team("ned","Países Baixos","nl","F"), team("jpn","Japão","jp","F"), team("swe","Suécia","se","F"), team("tun","Tunísia","tn","F")],
  G: [team("egy","Egito","eg","G"), team("irn","Irã","ir","G"), team("bel","Bélgica","be","G"), team("nzl","Nova Zelândia","nz","G")],
  H: [team("esp","Espanha","es","H"), team("uru","Uruguai","uy","H"), team("cpv","Cabo Verde","cv","H"), team("ksa","Arábia Saudita","sa","H")],
  I: [team("fra","França","fr","I"), team("nor","Noruega","no","I"), team("sen","Senegal","sn","I"), team("irq","Iraque","iq","I")],
  J: [team("arg","Argentina","ar","J"), team("aut","Áustria","at","J"), team("alg","Argélia","dz","J"), team("jor","Jordânia","jo","J")],
  K: [team("col","Colômbia","co","K"), team("por","Portugal","pt","K"), team("cod","DR Congo","cd","K"), team("uzb","Uzbequistão","uz","K")],
  L: [team("eng","Inglaterra","gb-eng","L"), team("gha","Gana","gh","L"), team("cro","Croácia","hr","L"), team("pan","Panamá","pa","L")],
};

const standings: Record<string, Array<{id:string;p:number;w:number;d:number;l:number;gf:number;ga:number}>> = {
  A: [{id:"mex",p:9,w:3,d:0,l:0,gf:7,ga:2},{id:"zaf",p:4,w:1,d:1,l:1,gf:3,ga:4},{id:"kor",p:3,w:1,d:0,l:2,gf:3,ga:5},{id:"cze",p:1,w:0,d:1,l:2,gf:2,ga:4}],
  B: [{id:"sui",p:7,w:2,d:1,l:0,gf:5,ga:2},{id:"can",p:4,w:1,d:1,l:1,gf:4,ga:3},{id:"bih",p:4,w:1,d:1,l:1,gf:3,ga:3},{id:"qat",p:1,w:0,d:1,l:2,gf:1,ga:5}],
  C: [{id:"bra",p:7,w:2,d:1,l:0,gf:5,ga:1},{id:"mar",p:7,w:2,d:1,l:0,gf:4,ga:2},{id:"sco",p:3,w:1,d:0,l:2,gf:3,ga:5},{id:"hai",p:0,w:0,d:0,l:3,gf:0,ga:4}],
  D: [{id:"usa",p:6,w:2,d:0,l:1,gf:5,ga:3},{id:"aus",p:4,w:1,d:1,l:1,gf:3,ga:3},{id:"par",p:4,w:1,d:1,l:1,gf:4,ga:4},{id:"tur",p:3,w:1,d:0,l:2,gf:4,ga:6}],
  E: [{id:"ger",p:6,w:2,d:0,l:1,gf:6,ga:3},{id:"civ",p:6,w:2,d:0,l:1,gf:5,ga:4},{id:"ecu",p:4,w:1,d:1,l:1,gf:3,ga:4},{id:"cur",p:1,w:0,d:1,l:2,gf:1,ga:4}],
  F: [{id:"ned",p:7,w:2,d:1,l:0,gf:6,ga:2},{id:"jpn",p:5,w:1,d:2,l:0,gf:3,ga:2},{id:"swe",p:4,w:1,d:1,l:1,gf:3,ga:4},{id:"tun",p:0,w:0,d:0,l:3,gf:1,ga:5}],
  G: [{id:"egy",p:4,w:1,d:1,l:1,gf:2,ga:2},{id:"irn",p:2,w:0,d:2,l:1,gf:2,ga:3},{id:"bel",p:2,w:0,d:2,l:1,gf:2,ga:3},{id:"nzl",p:1,w:0,d:1,l:2,gf:1,ga:3}],
  H: [{id:"esp",p:4,w:1,d:1,l:1,gf:4,ga:3},{id:"uru",p:2,w:0,d:2,l:1,gf:3,ga:4},{id:"cpv",p:2,w:0,d:2,l:1,gf:2,ga:3},{id:"ksa",p:1,w:0,d:1,l:2,gf:2,ga:4}],
  I: [{id:"fra",p:6,w:2,d:0,l:1,gf:7,ga:3},{id:"nor",p:6,w:2,d:0,l:1,gf:5,ga:4},{id:"sen",p:0,w:0,d:0,l:3,gf:1,ga:6},{id:"irq",p:0,w:0,d:0,l:3,gf:1,ga:6}],
  J: [{id:"arg",p:6,w:2,d:0,l:1,gf:5,ga:3},{id:"aut",p:3,w:1,d:0,l:2,gf:3,ga:4},{id:"alg",p:3,w:1,d:0,l:2,gf:2,ga:3},{id:"jor",p:0,w:0,d:0,l:3,gf:1,ga:5}],
  K: [{id:"col",p:6,w:2,d:0,l:1,gf:5,ga:2},{id:"por",p:4,w:1,d:1,l:1,gf:6,ga:4},{id:"cod",p:1,w:0,d:1,l:2,gf:2,ga:6},{id:"uzb",p:0,w:0,d:0,l:3,gf:1,ga:5}],
  L: [{id:"eng",p:4,w:1,d:1,l:1,gf:4,ga:3},{id:"gha",p:4,w:1,d:1,l:1,gf:3,ga:3},{id:"cro",p:3,w:1,d:0,l:2,gf:3,ga:4},{id:"pan",p:0,w:0,d:0,l:3,gf:1,ga:5}],
};

function buildTeams(): Team[] {
  const out: Team[] = [];
  for (const g of Object.keys(groupsRaw)) {
    for (const t of groupsRaw[g]) {
      const s = standings[g].find((x) => x.id === t.id)!;
      out.push({ ...t, played: s.w+s.d+s.l, won: s.w, drawn: s.d, lost: s.l, points: s.p, goalsFor: s.gf, goalsAgainst: s.ga, goalDifference: s.gf-s.ga });
    }
  }
  return out;
}

function buildGroups(teams: Team[]): GroupStanding[] {
  return Object.keys(groupsRaw).map((g) => ({
    group: g,
    teams: teams.filter((t) => t.group === g).sort((a,b) => (b.points!-a.points!) || (b.goalDifference!-a.goalDifference!) || (b.goalsFor!-a.goalsFor!)),
  }));
}

// ── Fase de 32 — Dados reais (Fonte: FIFA / Wikipedia) ───────────────────────
// Resultados conhecidos até 30/06/2026
// Jogos em andamento / agendados a partir de 30/06

type R32Entry = {
  id: string; home: string; away: string;
  homeScore: number|null; awayScore: number|null;
  penH?: number|null; penA?: number|null;
  date: string; finished: boolean;
  // qual jogo da próxima fase este alimenta
  nextMatchId?: string; nextSlot?: "home"|"away";
};

// CHAVEAMENTO REAL: baseado no bracket oficial da FIFA Copa 2026
// Lado Esquerdo (jogos 1-8) e Lado Direito (jogos 9-16)
const r32Data: R32Entry[] = [
  // ── LADO ESQUERDO ──
  { id:"r32-01", home:"zaf", away:"can",  homeScore:0,    awayScore:1,    date:"2026-06-28T21:00:00Z", finished:true,  nextMatchId:"r16-L1", nextSlot:"home" },
  { id:"r32-02", home:"bra", away:"jpn",  homeScore:2,    awayScore:1,    date:"2026-06-29T21:00:00Z", finished:true,  nextMatchId:"r16-L1", nextSlot:"away" },
  { id:"r32-03", home:"ger", away:"par",  homeScore:1,    awayScore:1, penH:3, penA:4, date:"2026-06-29T21:00:00Z", finished:true,  nextMatchId:"r16-L2", nextSlot:"home" },
  { id:"r32-04", home:"ned", away:"mar",  homeScore:1,    awayScore:1, penH:2, penA:3, date:"2026-06-29T21:00:00Z", finished:true,  nextMatchId:"r16-L2", nextSlot:"away" },
  { id:"r32-05", home:"fra", away:"swe",  homeScore:null, awayScore:null, date:"2026-06-30T21:00:00Z", finished:false, nextMatchId:"r16-L3", nextSlot:"home" },
  { id:"r32-06", home:"civ", away:"nor",  homeScore:null, awayScore:null, date:"2026-07-01T21:00:00Z", finished:false, nextMatchId:"r16-L3", nextSlot:"away" },
  { id:"r32-07", home:"mex", away:"ecu",  homeScore:null, awayScore:null, date:"2026-07-01T21:00:00Z", finished:false, nextMatchId:"r16-L4", nextSlot:"home" },
  { id:"r32-08", home:"esp", away:"aut",  homeScore:null, awayScore:null, date:"2026-07-02T21:00:00Z", finished:false, nextMatchId:"r16-L4", nextSlot:"away" },

  // ── LADO DIREITO ──
  { id:"r32-09", home:"eng", away:"cod",  homeScore:null, awayScore:null, date:"2026-07-02T21:00:00Z", finished:false, nextMatchId:"r16-R1", nextSlot:"home" },
  { id:"r32-10", home:"bel", away:"sen",  homeScore:null, awayScore:null, date:"2026-07-02T21:00:00Z", finished:false, nextMatchId:"r16-R1", nextSlot:"away" },
  { id:"r32-11", home:"usa", away:"bih",  homeScore:null, awayScore:null, date:"2026-07-02T21:00:00Z", finished:false, nextMatchId:"r16-R2", nextSlot:"home" },
  { id:"r32-12", home:"por", away:"cro",  homeScore:null, awayScore:null, date:"2026-07-03T21:00:00Z", finished:false, nextMatchId:"r16-R2", nextSlot:"away" },
  { id:"r32-13", home:"sui", away:"alg",  homeScore:null, awayScore:null, date:"2026-07-03T21:00:00Z", finished:false, nextMatchId:"r16-R3", nextSlot:"home" },
  { id:"r32-14", home:"aus", away:"egy",  homeScore:null, awayScore:null, date:"2026-07-04T21:00:00Z", finished:false, nextMatchId:"r16-R3", nextSlot:"away" },
  { id:"r32-15", home:"arg", away:"cpv",  homeScore:null, awayScore:null, date:"2026-07-04T21:00:00Z", finished:false, nextMatchId:"r16-R4", nextSlot:"home" },
  { id:"r32-16", home:"col", away:"gha",  homeScore:null, awayScore:null, date:"2026-07-04T21:00:00Z", finished:false, nextMatchId:"r16-R4", nextSlot:"away" },
];

// Placeholders para as fases seguintes (preenchidos progressivamente no simulador)
const r16Data: R32Entry[] = [
  // LADO ESQUERDO
  { id:"r16-L1", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-05T21:00:00Z", finished:false, nextMatchId:"qf-L1", nextSlot:"home" },
  { id:"r16-L2", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-05T21:00:00Z", finished:false, nextMatchId:"qf-L1", nextSlot:"away" },
  { id:"r16-L3", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-06T21:00:00Z", finished:false, nextMatchId:"qf-L2", nextSlot:"home" },
  { id:"r16-L4", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-06T21:00:00Z", finished:false, nextMatchId:"qf-L2", nextSlot:"away" },
  // LADO DIREITO
  { id:"r16-R1", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-07T21:00:00Z", finished:false, nextMatchId:"qf-R1", nextSlot:"home" },
  { id:"r16-R2", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-07T21:00:00Z", finished:false, nextMatchId:"qf-R1", nextSlot:"away" },
  { id:"r16-R3", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-08T21:00:00Z", finished:false, nextMatchId:"qf-R2", nextSlot:"home" },
  { id:"r16-R4", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-08T21:00:00Z", finished:false, nextMatchId:"qf-R2", nextSlot:"away" },
];

const qfData: R32Entry[] = [
  { id:"qf-L1", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-10T21:00:00Z", finished:false, nextMatchId:"sf-1", nextSlot:"home" },
  { id:"qf-L2", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-11T21:00:00Z", finished:false, nextMatchId:"sf-1", nextSlot:"away" },
  { id:"qf-R1", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-12T21:00:00Z", finished:false, nextMatchId:"sf-2", nextSlot:"home" },
  { id:"qf-R2", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-13T21:00:00Z", finished:false, nextMatchId:"sf-2", nextSlot:"away" },
];

const sfData: R32Entry[] = [
  { id:"sf-1", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-15T21:00:00Z", finished:false, nextMatchId:"final", nextSlot:"home" },
  { id:"sf-2", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-16T21:00:00Z", finished:false, nextMatchId:"final", nextSlot:"away" },
];

export function buildMockData(): Omit<WorldCupData, "bracket"|"source"|"lastUpdated"> & { rawMatches: Match[]; rawGroups: GroupStanding[] } {
  const allTeams = buildTeams();
  const allGroups = buildGroups(allTeams);
  const t = (id: string) => allTeams.find((x) => x.id === id) || null;

  const toMatch = (entry: R32Entry, stage: Stage, round: string): Match => {
    const home = entry.home === "???" ? null : t(entry.home);
    const away = entry.away === "???" ? null : t(entry.away);
    const hasPens = entry.penH != null && entry.penA != null;
    let winner: string | null = null;
    if (entry.finished && home && away) {
      if (hasPens) {
        winner = entry.penH! > entry.penA! ? home.id : away.id;
      } else if (entry.homeScore != null && entry.awayScore != null) {
        winner = entry.homeScore > entry.awayScore ? home.id : entry.awayScore > entry.homeScore ? away.id : null;
      }
    }
    return {
      id: entry.id,
      stage,
      round,
      homeTeam: home,
      awayTeam: away,
      homeScore: entry.homeScore,
      awayScore: entry.awayScore,
      penaltiesHome: entry.penH ?? null,
      penaltiesAway: entry.penA ?? null,
      status: entry.finished ? "finished" : "scheduled",
      date: entry.date,
      winner,
      nextMatchId: entry.nextMatchId,
      nextMatchSlot: entry.nextSlot,
    } as Match;
  };

  const matches: Match[] = [
    ...r32Data.map((e) => toMatch(e, "LAST_32", "Fase de 32")),
    ...r16Data.map((e) => toMatch(e, "LAST_16", "Oitavas de Final")),
    ...qfData.map((e) => toMatch(e, "QUARTER_FINALS", "Quartas de Final")),
    ...sfData.map((e) => toMatch(e, "SEMI_FINALS", "Semifinais")),
    toMatch({ id:"3rd", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-18T21:00:00Z", finished:false }, "THIRD_PLACE", "Disputa 3º Lugar"),
    toMatch({ id:"final", home:"???", away:"???", homeScore:null, awayScore:null, date:"2026-07-19T21:00:00Z", finished:false }, "FINAL", "Final"),
  ];

  return { teams: allTeams, groups: allGroups, matches, rawMatches: matches, rawGroups: allGroups, champion: null } as any;
}
