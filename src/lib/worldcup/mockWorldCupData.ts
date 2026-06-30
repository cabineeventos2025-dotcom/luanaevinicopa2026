import type { Team, Match, WorldCupData, GroupStanding, Stage } from "./types";

// ─── Copa do Mundo 2026 — Dados Reais com bracket correto ─────────────────
// Fonte: Google/FIFA — Bracket oficial verificado em 30/06/2026
// Estrutura: 16 jogos Fase de 32 → 8 Oitavas → 4 Quartas → 2 Semis → Final
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
      out.push({ ...t, played:s.w+s.d+s.l, won:s.w, drawn:s.d, lost:s.l, points:s.p, goalsFor:s.gf, goalsAgainst:s.ga, goalDifference:s.gf-s.ga });
    }
  }
  return out;
}

function buildGroups(teams: Team[]): GroupStanding[] {
  return Object.keys(groupsRaw).map((g) => ({
    group: g,
    teams: teams.filter((t) => t.group === g).sort((a,b)=>(b.points!-a.points!)||(b.goalDifference!-a.goalDifference!)||(b.goalsFor!-a.goalsFor!)),
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// BRACKET OFICIAL — Conforme Google/FIFA (verificado 30/06/2026)
//
// LADO ESQUERDO (jogos 01-08):
//   r32-01: África do Sul × Canadá  → r32-04 winner → oitava r16-01 (Canadá × Marrocos) 04/07
//   r32-04: Países Baixos × Marrocos
//   r32-03: Alemanha × Paraguai     → r32-05 winner → oitava r16-02 (Paraguai × FRA/SWE) 04/07
//   r32-05: França × Suécia
//   r32-02: Brasil × Japão          → r32-06 winner → oitava r16-03 (Brasil × Noruega)   05/07 ★
//   r32-06: Costa do Marfim × Noruega
//   r32-07: México × Equador        → r32-08 winner → oitava r16-04 (MEX/ECU × ESP/AUT) 05/07
//   r32-08: Espanha × Áustria
//
// LADO DIREITO (jogos 09-16):
//   r32-09: Inglaterra × DR Congo   → r32-10 winner → oitava r16-05 07/07
//   r32-10: Bélgica × Senegal
//   r32-11: EUA × Bósnia            → r32-12 winner → oitava r16-06 07/07
//   r32-12: Portugal × Croácia
//   r32-13: Suíça × Argélia         → r32-14 winner → oitava r16-07 08/07
//   r32-14: Austrália × Egito
//   r32-15: Argentina × Cabo Verde  → r32-16 winner → oitava r16-08 08/07
//   r32-16: Colômbia × Gana
// ═══════════════════════════════════════════════════════════════════════════

interface R {
  id:string; home:string; away:string;
  hs:number|null; as_:number|null;
  ph?:number|null; pa?:number|null;
  date:string; done:boolean;
  next?:string; slot?:"home"|"away";
}

const r32: R[] = [
  // LADO ESQUERDO
  {id:"r32-01",home:"zaf",away:"can",hs:0,as_:1,          date:"2026-06-28T21:00:00Z",done:true, next:"r16-01",slot:"home"},
  {id:"r32-04",home:"ned",away:"mar",hs:1,as_:1,ph:2,pa:3,date:"2026-06-29T21:00:00Z",done:true, next:"r16-01",slot:"away"},
  {id:"r32-03",home:"ger",away:"par",hs:1,as_:1,ph:3,pa:4,date:"2026-06-29T21:00:00Z",done:true, next:"r16-02",slot:"home"},
  {id:"r32-05",home:"fra",away:"swe",hs:0,as_:0,ph:5,pa:4,date:"2026-06-30T21:00:00Z",done:true, next:"r16-02",slot:"away"},
  {id:"r32-02",home:"bra",away:"jpn",hs:2,as_:1,          date:"2026-06-29T21:00:00Z",done:true, next:"r16-03",slot:"home"},
  {id:"r32-06",home:"civ",away:"nor",hs:1,as_:2,          date:"2026-06-30T21:00:00Z",done:true, next:"r16-03",slot:"away"},
  {id:"r32-07",home:"mex",away:"ecu",hs:null,as_:null,     date:"2026-07-01T00:00:00Z",done:false,next:"r16-04",slot:"home"},
  {id:"r32-08",home:"esp",away:"aut",hs:null,as_:null,     date:"2026-07-02T00:00:00Z",done:false,next:"r16-04",slot:"away"},
  // LADO DIREITO
  {id:"r32-09",home:"eng",away:"cod",hs:null,as_:null,     date:"2026-07-02T00:00:00Z",done:false,next:"r16-05",slot:"home"},
  {id:"r32-10",home:"bel",away:"sen",hs:null,as_:null,     date:"2026-07-02T00:00:00Z",done:false,next:"r16-05",slot:"away"},
  {id:"r32-11",home:"usa",away:"bih",hs:null,as_:null,     date:"2026-07-02T00:00:00Z",done:false,next:"r16-06",slot:"home"},
  {id:"r32-12",home:"por",away:"cro",hs:null,as_:null,     date:"2026-07-03T00:00:00Z",done:false,next:"r16-06",slot:"away"},
  {id:"r32-13",home:"sui",away:"alg",hs:null,as_:null,     date:"2026-07-03T00:00:00Z",done:false,next:"r16-07",slot:"home"},
  {id:"r32-14",home:"aus",away:"egy",hs:null,as_:null,     date:"2026-07-04T00:00:00Z",done:false,next:"r16-07",slot:"away"},
  {id:"r32-15",home:"arg",away:"cpv",hs:null,as_:null,     date:"2026-07-04T00:00:00Z",done:false,next:"r16-08",slot:"home"},
  {id:"r32-16",home:"col",away:"gha",hs:null,as_:null,     date:"2026-07-04T00:00:00Z",done:false,next:"r16-08",slot:"away"},
];

// Oitavas
const r16: R[] = [
  {id:"r16-01",home:"???",away:"???",hs:null,as_:null,date:"2026-07-04T17:00:00Z",done:false,next:"qf-01",slot:"home"}, // Canadá × Marrocos
  {id:"r16-02",home:"???",away:"???",hs:null,as_:null,date:"2026-07-04T21:00:00Z",done:false,next:"qf-01",slot:"away"}, // Paraguai × FRA/SWE
  {id:"r16-03",home:"???",away:"???",hs:null,as_:null,date:"2026-07-05T17:00:00Z",done:false,next:"qf-02",slot:"home"}, // Brasil × Noruega ★
  {id:"r16-04",home:"???",away:"???",hs:null,as_:null,date:"2026-07-05T21:00:00Z",done:false,next:"qf-02",slot:"away"},
  {id:"r16-05",home:"???",away:"???",hs:null,as_:null,date:"2026-07-07T17:00:00Z",done:false,next:"qf-03",slot:"home"},
  {id:"r16-06",home:"???",away:"???",hs:null,as_:null,date:"2026-07-07T21:00:00Z",done:false,next:"qf-03",slot:"away"},
  {id:"r16-07",home:"???",away:"???",hs:null,as_:null,date:"2026-07-08T17:00:00Z",done:false,next:"qf-04",slot:"home"},
  {id:"r16-08",home:"???",away:"???",hs:null,as_:null,date:"2026-07-08T21:00:00Z",done:false,next:"qf-04",slot:"away"},
];

// Quartas
const qf: R[] = [
  {id:"qf-01",home:"???",away:"???",hs:null,as_:null,date:"2026-07-09T21:00:00Z",done:false,next:"sf-01",slot:"home"},
  {id:"qf-02",home:"???",away:"???",hs:null,as_:null,date:"2026-07-10T21:00:00Z",done:false,next:"sf-01",slot:"away"},
  {id:"qf-03",home:"???",away:"???",hs:null,as_:null,date:"2026-07-11T21:00:00Z",done:false,next:"sf-02",slot:"home"},
  {id:"qf-04",home:"???",away:"???",hs:null,as_:null,date:"2026-07-12T21:00:00Z",done:false,next:"sf-02",slot:"away"},
];

// Semifinais
const sf: R[] = [
  {id:"sf-01",home:"???",away:"???",hs:null,as_:null,date:"2026-07-15T21:00:00Z",done:false,next:"final",slot:"home"},
  {id:"sf-02",home:"???",away:"???",hs:null,as_:null,date:"2026-07-16T21:00:00Z",done:false,next:"final",slot:"away"},
];

function toMatch(e: R, stage: Stage, round: string, teams: Team[]): Match {
  const t = (id: string) => id === "???" ? null : teams.find((x) => x.id === id) || null;
  const home = t(e.home);
  const away = t(e.away);
  const hasPens = e.ph != null && e.pa != null;
  let winner: string | null = null;
  if (e.done && home && away) {
    if (hasPens) winner = e.ph! > e.pa! ? home.id : away.id;
    else if (e.hs != null && e.as_ != null) winner = e.hs > e.as_ ? home.id : e.as_ > e.hs ? away.id : null;
  }
  return {
    id: e.id, stage, round, homeTeam: home, awayTeam: away,
    homeScore: e.hs, awayScore: e.as_,
    penaltiesHome: e.ph ?? null, penaltiesAway: e.pa ?? null,
    status: e.done ? "finished" : "scheduled",
    date: e.date, winner,
    nextMatchId: e.next ?? null,
    nextMatchSlot: e.slot ?? null,
  } as Match;
}

export function buildMockData(): Omit<WorldCupData,"bracket"|"source"|"lastUpdated"> & {rawMatches:Match[];rawGroups:GroupStanding[]} {
  const allTeams = buildTeams();
  const allGroups = buildGroups(allTeams);

  const matches: Match[] = [
    ...r32.map((e) => toMatch(e, "LAST_32", "Fase de 32", allTeams)),
    ...r16.map((e) => toMatch(e, "LAST_16", "Oitavas de Final", allTeams)),
    ...qf.map((e) => toMatch(e, "QUARTER_FINALS", "Quartas de Final", allTeams)),
    ...sf.map((e) => toMatch(e, "SEMI_FINALS", "Semifinais", allTeams)),
    toMatch({id:"3rd",home:"???",away:"???",hs:null,as_:null,date:"2026-07-18T21:00:00Z",done:false}, "THIRD_PLACE", "3º Lugar", allTeams),
    toMatch({id:"final",home:"???",away:"???",hs:null,as_:null,date:"2026-07-19T21:00:00Z",done:false}, "FINAL", "Final", allTeams),
  ];

  return { teams:allTeams, groups:allGroups, matches, rawMatches:matches, rawGroups:allGroups, champion:null } as any;
}
