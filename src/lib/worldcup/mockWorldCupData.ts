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
// BRACKET OFICIAL — Conforme Google/FIFA (atualizado 01/07/2026)
//
// LADO ESQUERDO (jogos 01-08):
//   r32-01: África do Sul × Canadá     → r16-01 (04/07) Canadá × Marrocos
//   r32-04: Países Baixos × Marrocos   → r16-01
//   r32-03: Alemanha × Paraguai        → r16-02 (04/07)
//   r32-05: França × Suécia            → r16-02
//   r32-02: Brasil × Japão             → r16-03 (05/07) Brasil × Noruega ★
//   r32-06: Costa do Marfim × Noruega  → r16-03
//   r32-07: México × Equador (FIM 2-0) → r16-04 (05/07 21h) MEX vs ENG ← KEY
//   r32-09: Inglaterra × DR Congo (FIM 2-1) → r16-04        ← KEY FIX
//
// LADO DIREITO (jogos 10-16):
//   r32-08: Espanha × Áustria          → r16-05
//   r32-10: Bélgica × Senegal          → r16-05
//   r32-11: EUA × Bósnia               → r16-06
//   r32-12: Portugal × Croácia         → r16-06
//   r32-13: Suíça × Argélia (03/07)    → r16-07 (07/07 17h BRT) SUI/ALG × COL/GHA
//   r32-16: Colômbia × Gana (03/07)    → r16-07               ← KEY FIX
//   r32-14: Austrália × Egito          → r16-08
//   r32-15: Argentina × Cabo Verde     → r16-08
// ═══════════════════════════════════════════════════════════════════════════

interface R {
  id:string; home:string; away:string;
  hs:number|null; as_:number|null;
  ph?:number|null; pa?:number|null;
  date:string; done:boolean;
  next?:string; slot?:"home"|"away";
}

const r32: R[] = [
  // LADO ESQUERDO — todos finalizados
  {id:"r32-01",home:"zaf",away:"can",hs:0, as_:1,          date:"2026-06-28T22:00:00Z",done:true, next:"r16-01",slot:"home"}, // África do Sul 0×1 Canadá
  {id:"r32-04",home:"ned",away:"mar",hs:1, as_:1,ph:2,pa:3,date:"2026-06-29T22:00:00Z",done:true, next:"r16-01",slot:"away"}, // Países Baixos 1×1 Marrocos (MAR nos pên.)
  {id:"r32-03",home:"ger",away:"par",hs:1, as_:1,ph:3,pa:4,date:"2026-06-29T22:00:00Z",done:true, next:"r16-02",slot:"home"}, // Alemanha 1×1 Paraguai (PAR nos pên.)
  {id:"r32-05",home:"fra",away:"swe",hs:3, as_:0,          date:"2026-06-30T21:00:00Z",done:true, next:"r16-02",slot:"away"}, // França 3×0 Suécia
  {id:"r32-02",home:"bra",away:"jpn",hs:2, as_:1,          date:"2026-06-29T22:00:00Z",done:true, next:"r16-03",slot:"home"}, // Brasil 2×1 Japão
  {id:"r32-06",home:"civ",away:"nor",hs:1, as_:2,          date:"2026-06-30T17:00:00Z",done:true, next:"r16-03",slot:"away"}, // Costa do Marfim 1×2 Noruega
  {id:"r32-07",home:"mex",away:"ecu",hs:2, as_:0,          date:"2026-07-01T01:00:00Z",done:true, next:"r16-04",slot:"home"}, // México 2×0 Equador
  {id:"r32-09",home:"eng",away:"cod",hs:2, as_:1,          date:"2026-07-01T16:00:00Z",done:true, next:"r16-04",slot:"away"}, // Inglaterra 2×1 DR Congo
  // LADO DIREITO — todos finalizados
  {id:"r32-08",home:"esp",away:"aut",hs:3, as_:0,          date:"2026-07-02T19:00:00Z",done:true, next:"r16-05",slot:"home"}, // Espanha 3×0 Áustria
  {id:"r32-12",home:"por",away:"cro",hs:2, as_:1,          date:"2026-07-02T23:00:00Z",done:true, next:"r16-05",slot:"away"}, // Portugal 2×1 Croácia → OITAVAS: Espanha × Portugal
  {id:"r32-10",home:"bel",away:"sen",hs:3, as_:2,          date:"2026-07-01T20:00:00Z",done:true, next:"r16-06",slot:"home"}, // Bélgica 3×2 Senegal → OITAVAS: Bélgica × EUA
  {id:"r32-11",home:"usa",away:"bih",hs:2, as_:0,          date:"2026-07-02T00:00:00Z",done:true, next:"r16-06",slot:"away"}, // EUA 2×0 Bósnia
  {id:"r32-13",home:"sui",away:"alg",hs:2, as_:0,          date:"2026-07-03T03:00:00Z",done:true, next:"r16-07",slot:"home"}, // Suíça 2×0 Argélia
  {id:"r32-16",home:"col",away:"gha",hs:1, as_:0,          date:"2026-07-04T01:30:00Z",done:true, next:"r16-07",slot:"away"}, // Colômbia 1×0 Gana
  {id:"r32-14",home:"aus",away:"egy",hs:1, as_:1,ph:2,pa:4,date:"2026-07-03T18:00:00Z",done:true, next:"r16-08",slot:"home"}, // Austrália 1×1 Egito (Egito nos pên.)
  {id:"r32-15",home:"arg",away:"cpv",hs:2, as_:0,          date:"2026-07-03T22:00:00Z",done:true, next:"r16-08",slot:"away"}, // Argentina 2×0 Cabo Verde
];

// Oitavas — horários oficiais Google/FIFA (BRT → UTC)
const r16: R[] = [
  {id:"r16-01",home:"???",away:"???",hs:0,   as_:3,         date:"2026-07-04T17:00:00Z",done:true, next:"qf-01",slot:"home"}, // 04/07 14h BRT: Canadá 0×3 Marrocos ★
  {id:"r16-02",home:"???",away:"???",hs:0,   as_:1,         date:"2026-07-04T21:00:00Z",done:true, next:"qf-01",slot:"away"}, // 04/07 18h BRT: Paraguai 0×1 França ★
  {id:"r16-03",home:"???",away:"???",hs:1,   as_:2,         date:"2026-07-05T20:00:00Z",done:true, next:"qf-02",slot:"home"}, // 05/07 17h BRT: Brasil 1×2 Noruega ★
  {id:"r16-04",home:"???",away:"???",hs:2,   as_:3,         date:"2026-07-06T00:00:00Z",done:true, next:"qf-02",slot:"away"}, // 05/07 21h BRT: México 2×3 Inglaterra ★
  {id:"r16-05",home:"???",away:"???",hs:1,   as_:0,         date:"2026-07-06T19:00:00Z",done:true, next:"qf-03",slot:"home"}, // 06/07 16h BRT: Espanha 1×0 Portugal ★
  {id:"r16-06",home:"???",away:"???",hs:4,   as_:1,         date:"2026-07-07T00:00:00Z",done:true, next:"qf-03",slot:"away"}, // 06/07 21h BRT: Bélgica 4×1 EUA ★
  {id:"r16-07",home:"???",away:"???",hs:0,   as_:0,ph:4,pa:3,date:"2026-07-07T20:00:00Z",done:true, next:"qf-04",slot:"home"}, // 07/07 17h BRT: Suíça 0×0 Colômbia (SUI 4-3 pên.) ★
  {id:"r16-08",home:"???",away:"???",hs:2,   as_:3,         date:"2026-07-08T22:00:00Z",done:true, next:"qf-04",slot:"away"}, // 08/07 19h BRT: Egito 2×3 Argentina ★
];

// Quartas — todos finalizados (9–12 julho)
const qf: R[] = [
  {id:"qf-01",home:"???",away:"???",hs:0,as_:2,date:"2026-07-09T21:00:00Z",done:true, next:"sf-01",slot:"home"}, // 09/07 18h BRT: Marrocos 0×2 França ★
  {id:"qf-02",home:"???",away:"???",hs:1,as_:2,date:"2026-07-11T21:00:00Z",done:true, next:"sf-02",slot:"home"}, // 11/07 18h BRT: Noruega 1×2 Inglaterra → sf-02 ★
  {id:"qf-03",home:"???",away:"???",hs:2,as_:1,date:"2026-07-10T21:00:00Z",done:true, next:"sf-01",slot:"away"}, // 10/07 18h BRT: Espanha 2×1 Bélgica → sf-01 ★
  {id:"qf-04",home:"???",away:"???",hs:1,as_:3,date:"2026-07-12T21:00:00Z",done:true, next:"sf-02",slot:"away"}, // 12/07 18h BRT: Suíça 1×3 Argentina ★
];

// Semifinais — 14 e 15 de julho (ambas finalizadas)
const sf: R[] = [
  {id:"sf-01",home:"???",away:"???",hs:0,as_:2,date:"2026-07-14T22:00:00Z",done:true, next:"final",slot:"home"}, // 14/07 19h BRT: França 0×2 Espanha ★ (Espanha → Final)
  {id:"sf-02",home:"???",away:"???",hs:1,as_:2,date:"2026-07-15T22:00:00Z",done:true, next:"final",slot:"away"}, // 15/07 19h BRT: Inglaterra 1×2 Argentina ★ (Argentina → Final)
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
    toMatch({id:"3rd",home:"???",away:"???",hs:null,as_:null,date:"2026-07-18T19:00:00Z",done:false}, "THIRD_PLACE", "3º Lugar", allTeams), // 18/07 16h BRT
    toMatch({id:"final",home:"???",away:"???",hs:null,as_:null,date:"2026-07-19T19:00:00Z",done:false}, "FINAL", "Final", allTeams), // 19/07 16h BRT
  ];

  return { teams:allTeams, groups:allGroups, matches, rawMatches:matches, rawGroups:allGroups, champion:null } as any;
}
