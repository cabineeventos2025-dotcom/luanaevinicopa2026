/**
 * SimulatorList — Layout vertical de palpites, idêntico à página principal.
 * Substitui o BracketSimulator horizontal (ruim no mobile).
 */
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/worldcup/types";

const STAGE_ORDER = [
  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL",
] as const;

const STAGE_LABEL: Record<string, { name: string; emoji: string; color: string }> = {
  LAST_32:        { name: "Fase de 32",       emoji: "🔵", color: "bg-blue-600" },
  LAST_16:        { name: "Oitavas de Final", emoji: "⚽", color: "bg-amber-600" },
  QUARTER_FINALS: { name: "Quartas de Final", emoji: "🔥", color: "bg-orange-600" },
  SEMI_FINALS:    { name: "Semifinais",       emoji: "⭐", color: "bg-purple-600" },
  THIRD_PLACE:    { name: "3º Lugar",         emoji: "🥉", color: "bg-amber-700" },
  FINAL:          { name: "Final",            emoji: "🏆", color: "bg-red-600" },
};

interface Props {
  matches: Match[];
  onSelectWinner: (
    matchId: string,
    slot: "home" | "away",
    homeScore?: number,
    awayScore?: number,
    homePens?: number,
    awayPens?: number,
  ) => void;
  onReset: (matchId: string) => void;
}

// ── Card individual de jogo ────────────────────────────────────────────────
function MatchCard({
  match,
  onSelectWinner,
  onReset,
}: {
  match: Match;
  onSelectWinner: Props["onSelectWinner"];
  onReset: Props["onReset"];
}) {
  const [hs, setHs] = useState("");
  const [as_, setAs] = useState("");
  const [showPens, setShowPens] = useState(false);
  const [hp, setHp] = useState("");
  const [ap, setAp] = useState("");

  const isRealFinished = match.status === "finished" && !match.simulated;
  const isSimulated    = !!match.simulated && !!match.winner;
  const bothTeams      = !!match.homeTeam && !!match.awayTeam;
  const homeWins       = !!match.winner && match.homeTeam?.id === match.winner;
  const awayWins       = !!match.winner && match.awayTeam?.id === match.winner;

  const dateStr = useMemo(() => {
    try {
      return new Date(match.date).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit",
        hour: "2-digit", minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      });
    } catch { return ""; }
  }, [match.date]);

  const clearInputs = () => {
    setHs(""); setAs(""); setHp(""); setAp(""); setShowPens(false);
  };

  const handleConfirmScore = () => {
    const h = parseInt(hs, 10);
    const a = parseInt(as_, 10);
    if (isNaN(h) || isNaN(a)) return;
    if (h === a) { setShowPens(true); return; }
    onSelectWinner(match.id, h > a ? "home" : "away", h, a);
    clearInputs();
  };

  const handleConfirmPens = () => {
    const h = parseInt(hs, 10);
    const a = parseInt(as_, 10);
    const ph = parseInt(hp, 10);
    const pa = parseInt(ap, 10);
    if (isNaN(h) || isNaN(a) || isNaN(ph) || isNaN(pa) || ph === pa) return;
    onSelectWinner(match.id, ph > pa ? "home" : "away", h, a, ph, pa);
    clearInputs();
  };

  // ── Card: jogo já finalizado (resultado real) ──────────────────────────────
  if (isRealFinished) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50/60 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-green-100/80 border-b border-green-200">
          <span className="text-[10px] text-green-700 font-semibold">{dateStr}</span>
          <span className="text-[10px] font-black text-green-700">FIM ✓</span>
        </div>
        <div className="px-3 py-2 space-y-1.5">
          <TeamRow team={match.homeTeam} score={match.homeScore} pens={match.penaltiesHome ?? null}
            isWinner={homeWins} isLoser={awayWins} />
          <div className="flex items-center gap-2"><div className="flex-1 h-px bg-green-200/60" /><span className="text-[9px] text-green-400 font-bold">vs</span><div className="flex-1 h-px bg-green-200/60" /></div>
          <TeamRow team={match.awayTeam} score={match.awayScore} pens={match.penaltiesAway ?? null}
            isWinner={awayWins} isLoser={homeWins} />
        </div>
      </div>
    );
  }

  // ── Card: palpite já dado (simulado) ──────────────────────────────────────
  if (isSimulated) {
    return (
      <div className="rounded-2xl border-2 border-green-400 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-3 py-1.5 bg-green-50 border-b border-green-200">
          <span className="text-[10px] text-gray-400 font-medium">{dateStr}</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => onReset(match.id)}
              title="Resetar este palpite"
              className="text-[10px] text-gray-400 hover:text-red-500 transition-colors font-bold px-1 rounded hover:bg-red-50">
              ↺
            </button>
            <span className="text-[10px] font-black text-green-600">✓ Palpite dado</span>
          </div>
        </div>
        <div className="px-3 py-2 space-y-1.5">
          <TeamRow team={match.homeTeam} score={match.homeScore} pens={match.penaltiesHome ?? null}
            isWinner={homeWins} isLoser={awayWins} />
          <div className="flex items-center gap-2"><div className="flex-1 h-px bg-gray-100" /><span className="text-[9px] text-gray-400 font-bold">vs</span><div className="flex-1 h-px bg-gray-100" /></div>
          <TeamRow team={match.awayTeam} score={match.awayScore} pens={match.penaltiesAway ?? null}
            isWinner={awayWins} isLoser={homeWins} />
        </div>
      </div>
    );
  }

  // ── Card: aguardando times ─────────────────────────────────────────────────
  if (!bothTeams) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100/50 border-b border-gray-100">
          <span className="text-[10px] text-gray-400 font-medium">{dateStr}</span>
          <span className="text-[10px] text-gray-300">Aguardando definição</span>
        </div>
        <div className="px-3 py-3 space-y-1.5">
          <TeamRow team={match.homeTeam} score={null} pens={null} isWinner={false} isLoser={false} />
          <div className="flex items-center gap-2"><div className="flex-1 h-px bg-gray-200" /><span className="text-[9px] text-gray-300 font-bold">vs</span><div className="flex-1 h-px bg-gray-200" /></div>
          <TeamRow team={match.awayTeam} score={null} pens={null} isWinner={false} isLoser={false} />
        </div>
      </div>
    );
  }

  // ── Card: disponível para palpite ─────────────────────────────────────────
  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-amber-50 border-b border-amber-200">
        <span className="text-[10px] text-gray-400 font-medium">{dateStr}</span>
        <span className="text-[10px] font-bold text-amber-600">Clique para palpitar ↓</span>
      </div>

      <div className="px-3 pt-2 space-y-1">
        <TeamRow team={match.homeTeam} score={null} pens={null} isWinner={false} isLoser={false} />
        <div className="flex items-center gap-2"><div className="flex-1 h-px bg-amber-100" /><span className="text-[9px] text-amber-400 font-bold">vs</span><div className="flex-1 h-px bg-amber-100" /></div>
        <TeamRow team={match.awayTeam} score={null} pens={null} isWinner={false} isLoser={false} />
      </div>

      {/* Área de palpite */}
      <div className="px-3 pb-3 pt-2 space-y-2 bg-amber-50/50">
        {!showPens ? (
          <>
            {/* Linha de placar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 text-center">
                <div className="text-[9px] text-gray-400 mb-0.5 truncate">{match.homeTeam?.name?.split(" ")[0]}</div>
                <input
                  type="number" min={0} max={20} value={hs}
                  onChange={(e) => setHs(e.target.value)}
                  placeholder="0"
                  className="w-full h-9 text-center rounded-xl border-2 border-amber-300 text-base font-black text-gray-800 focus:border-amber-500 focus:outline-none bg-white"
                />
              </div>
              <div className="text-gray-400 font-black text-lg flex-shrink-0">×</div>
              <div className="flex-1 text-center">
                <div className="text-[9px] text-gray-400 mb-0.5 truncate">{match.awayTeam?.name?.split(" ")[0]}</div>
                <input
                  type="number" min={0} max={20} value={as_}
                  onChange={(e) => setAs(e.target.value)}
                  placeholder="0"
                  className="w-full h-9 text-center rounded-xl border-2 border-amber-300 text-base font-black text-gray-800 focus:border-amber-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* Confirmar placar ou pênaltis */}
            {hs !== "" && as_ !== "" ? (
              <button onClick={handleConfirmScore}
                className="w-full rounded-xl bg-amber-500 py-2 text-sm font-black text-white hover:bg-amber-600 transition-colors active:scale-95">
                {parseInt(hs) === parseInt(as_) && !isNaN(parseInt(hs))
                  ? `⚡ Empate ${hs}×${as_} — ir para pênaltis →`
                  : `✓ Confirmar ${hs} × ${as_}`}
              </button>
            ) : (
              /* Botões rápidos */
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onSelectWinner(match.id, "home")}
                  className="rounded-xl bg-white border-2 border-blue-300 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors active:scale-95 truncate px-2">
                  {match.homeTeam?.name?.split(" ")[0]} vence ▲
                </button>
                <button onClick={() => onSelectWinner(match.id, "away")}
                  className="rounded-xl bg-white border-2 border-orange-300 py-2 text-xs font-bold text-orange-700 hover:bg-orange-50 transition-colors active:scale-95 truncate px-2">
                  ▲ {match.awayTeam?.name?.split(" ")[0]} vence
                </button>
              </div>
            )}
          </>
        ) : (
          /* Pênaltis */
          <div className="space-y-2">
            <div className="text-xs font-black text-center text-amber-700">
              ⚡ Empate {hs}×{as_} — Placar nos Pênaltis:
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-center">
                <div className="text-[9px] text-gray-400 mb-0.5">{match.homeTeam?.name?.split(" ")[0]}</div>
                <input type="number" min={0} max={20} value={hp}
                  onChange={(e) => setHp(e.target.value)} placeholder="0"
                  className="w-full h-9 text-center rounded-xl border-2 border-blue-300 text-base font-black focus:outline-none bg-white" />
              </div>
              <div className="text-gray-400 font-black text-lg flex-shrink-0">×</div>
              <div className="flex-1 text-center">
                <div className="text-[9px] text-gray-400 mb-0.5">{match.awayTeam?.name?.split(" ")[0]}</div>
                <input type="number" min={0} max={20} value={ap}
                  onChange={(e) => setAp(e.target.value)} placeholder="0"
                  className="w-full h-9 text-center rounded-xl border-2 border-orange-300 text-base font-black focus:outline-none bg-white" />
              </div>
            </div>
            {hp !== "" && ap !== "" && (
              parseInt(hp) === parseInt(ap)
                ? <p className="text-xs text-red-500 text-center font-bold">Pênaltis não podem empatar!</p>
                : <button onClick={handleConfirmPens}
                    className="w-full rounded-xl bg-green-500 py-2 text-sm font-black text-white hover:bg-green-600 transition-colors">
                    ✓ Confirmar pênaltis {hp} × {ap}
                  </button>
            )}
            <button onClick={clearInputs}
              className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">
              ← Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Linha de time com bandeira ─────────────────────────────────────────────
function TeamRow({
  team, score, pens, isWinner, isLoser,
}: {
  team: Match["homeTeam"];
  score: number | null;
  pens: number | null;
  isWinner: boolean;
  isLoser: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-xl px-2 py-1.5 min-h-[36px]",
      isWinner && "bg-green-100 ring-1 ring-green-400",
      isLoser && "opacity-40",
    )}>
      {team ? (
        <>
          <img src={team.flagUrl} alt={team.name}
            className="h-5 w-7 rounded object-cover flex-shrink-0 shadow-sm"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className={cn(
            "flex-1 text-sm font-semibold truncate",
            isWinner ? "font-black text-green-800" : "text-gray-700",
          )}>
            {team.name}
          </span>
          {score !== null && (
            <span className={cn(
              "text-lg font-black flex-shrink-0 min-w-[24px] text-right",
              isWinner ? "text-green-700" : "text-gray-500",
            )}>
              {score}
              {pens !== null && (
                <span className="text-[10px] text-gray-400 ml-0.5">({pens})</span>
              )}
            </span>
          )}
          {isWinner && <span className="text-amber-500 text-sm flex-shrink-0">✓</span>}
        </>
      ) : (
        <span className="text-xs text-gray-300 italic">A definir</span>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export function SimulatorList({ matches, onSelectWinner, onReset }: Props) {
  const byStage: Record<string, Match[]> = {};
  for (const m of matches) {
    if (m.stage === "GROUP_STAGE") continue;
    if (!byStage[m.stage]) byStage[m.stage] = [];
    byStage[m.stage].push(m);
  }

  // Ordena cada fase por id
  for (const key of Object.keys(byStage)) {
    byStage[key].sort((a, b) => a.id.localeCompare(b.id));
  }

  return (
    <div className="space-y-6">
      {STAGE_ORDER.map((stage) => {
        const stageMatches = byStage[stage];
        if (!stageMatches?.length) return null;
        const info = STAGE_LABEL[stage];
        return (
          <section key={stage}>
            {/* Header da fase */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl mb-3 text-white font-black text-sm",
              info.color,
            )}>
              <span className="text-base">{info.emoji}</span>
              <span>{info.name}</span>
              <span className="ml-auto text-xs font-normal opacity-80">
                {stageMatches.filter(m => m.winner).length}/{stageMatches.length} palpites
              </span>
            </div>

            {/* Grid 2 col desktop / 1 col mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stageMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  onSelectWinner={onSelectWinner}
                  onReset={onReset}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
