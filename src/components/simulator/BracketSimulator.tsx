import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/worldcup/types";
import { Trophy } from "lucide-react";

interface Props {
  matches: Match[];
  onSelectWinner: (matchId: string, slot: "home" | "away") => void;
}

// ── Bandeira + Nome ─────────────────────────────────────────────────────────
function TeamRow({
  team, score, pens, isWinner, isLoser, onClick, canClick,
}: {
  team: { name: string; flagUrl: string; id: string } | null;
  score: number | null; pens: number | null;
  isWinner: boolean; isLoser: boolean;
  onClick?: () => void; canClick?: boolean;
}) {
  return (
    <button
      onClick={canClick ? onClick : undefined}
      disabled={!canClick}
      className={cn(
        "w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-lg transition-all text-sm",
        isWinner && "bg-green-100 font-black text-green-800 ring-1 ring-green-400",
        isLoser && "opacity-40",
        !isWinner && !isLoser && team && canClick && "hover:bg-amber-50 cursor-pointer active:bg-amber-100",
        !team && "cursor-default",
      )}
    >
      {team ? (
        <>
          <img src={team.flagUrl} alt={team.name} className="h-4 w-6 rounded-sm object-cover flex-shrink-0 shadow-sm" />
          <span className="flex-1 truncate text-xs font-semibold">{team.name}</span>
          {score !== null && (
            <span className={cn("text-sm font-black flex-shrink-0", isWinner ? "text-green-700" : "text-gray-600")}>
              {score}{pens !== null ? <span className="text-[10px] text-gray-400">({pens})</span> : ""}
            </span>
          )}
          {isWinner && canClick === false && <Trophy className="h-3 w-3 text-amber-500 ml-1 flex-shrink-0" />}
        </>
      ) : (
        <span className="text-[11px] text-gray-300 italic px-1">A definir</span>
      )}
    </button>
  );
}

// ── Cartão de um jogo ────────────────────────────────────────────────────────
function GameCard({ match, onSelectWinner }: { match: Match; onSelectWinner: Props["onSelectWinner"] }) {
  const isFinished = match.status === "finished";
  const homeWins = match.winner != null && match.homeTeam != null && match.winner === match.homeTeam.id;
  const awayWins = match.winner != null && match.awayTeam != null && match.winner === match.awayTeam.id;
  const canClick = !isFinished && !!match.homeTeam && !!match.awayTeam;

  const dateStr = useMemo(() => {
    try {
      return new Date(match.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
    } catch { return ""; }
  }, [match.date]);

  return (
    <div className={cn(
      "rounded-xl border bg-white shadow-sm overflow-hidden transition-all",
      isFinished ? "border-gray-200" : "border-amber-200",
      canClick && "hover:shadow-md hover:border-amber-400",
      homeWins || awayWins ? "ring-1 ring-green-400" : "",
    )}>
      <div className="flex items-center justify-between px-2.5 pt-1.5 pb-1 border-b border-gray-100">
        <span className="text-[9px] text-gray-400 font-medium">{dateStr}</span>
        {isFinished && <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">FIM</span>}
        {!isFinished && canClick && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Clique p/ escolher</span>}
      </div>
      <div className="p-1 space-y-0.5">
        <TeamRow
          team={match.homeTeam} score={match.homeScore} pens={match.penaltiesHome}
          isWinner={homeWins} isLoser={awayWins}
          onClick={() => onSelectWinner(match.id, "home")} canClick={canClick}
        />
        <TeamRow
          team={match.awayTeam} score={match.awayScore} pens={match.penaltiesAway}
          isWinner={awayWins} isLoser={homeWins}
          onClick={() => onSelectWinner(match.id, "away")} canClick={canClick}
        />
      </div>
    </div>
  );
}

// ── Conectores SVG entre colunas ─────────────────────────────────────────────
function Connector({ count }: { count: number }) {
  return (
    <div className="flex flex-col justify-around" style={{ height: "100%" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className="w-3 h-px bg-amber-300" />
        </div>
      ))}
    </div>
  );
}

// ── Coluna de fase ───────────────────────────────────────────────────────────
function RoundColumn({
  title, emoji, matches, onSelectWinner, isFinal,
}: {
  title: string; emoji: string; matches: Match[];
  onSelectWinner: Props["onSelectWinner"]; isFinal?: boolean;
}) {
  return (
    <div className="flex flex-col min-w-[160px] max-w-[190px]">
      <div className={cn(
        "text-center text-[10px] font-black uppercase tracking-wider px-2 py-1.5 rounded-full mb-3",
        isFinal ? "bg-amber-500 text-white shadow-md" : "bg-gray-100 text-gray-500",
      )}>
        {emoji} {title}
      </div>
      <div className="flex flex-col gap-3 justify-around flex-1">
        {matches.map((m) => (
          <GameCard key={m.id} match={m} onSelectWinner={onSelectWinner} />
        ))}
      </div>
    </div>
  );
}

// ── Campeão central ──────────────────────────────────────────────────────────
function ChampionBox({ match, onSelectWinner }: { match: Match | null; onSelectWinner: Props["onSelectWinner"] }) {
  if (!match) return null;
  const winner = match.winner
    ? [match.homeTeam, match.awayTeam].find((t) => t?.id === match.winner)
    : null;

  return (
    <div className="flex flex-col items-center gap-2 min-w-[140px]">
      <div className="text-4xl">🏆</div>
      <div className="text-[10px] font-black text-amber-600 uppercase tracking-wide text-center">Campeão do Mundo</div>
      {winner ? (
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-gradient-to-b from-amber-100 to-yellow-50 border-2 border-amber-400 p-3 shadow-lg">
          <img src={winner.flagUrl} alt={winner.name} className="h-8 w-12 rounded-lg object-cover shadow-md" />
          <span className="text-sm font-black text-amber-800">{winner.name}</span>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 p-4 text-center">
          <div className="text-[11px] text-amber-400 font-bold">Complete o chaveamento</div>
        </div>
      )}
      {match && !match.winner && (
        <GameCard match={match} onSelectWinner={onSelectWinner} />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Componente principal — Chaveamento responsivo com scroll horizontal
// ══════════════════════════════════════════════════════════════════════════════
export function BracketSimulator({ matches, onSelectWinner }: Props) {
  const byId = (id: string) => matches.find((m) => m.id === id) ?? null;

  // LADO ESQUERDO (r32-01..08 → r16-01..04 → qf-01..02 → sf-01)
  const leftR32  = ["r32-01","r32-04","r32-03","r32-05","r32-02","r32-06","r32-07","r32-08"].map(byId).filter(Boolean) as Match[];
  const leftR16  = ["r16-01","r16-02","r16-03","r16-04"].map(byId).filter(Boolean) as Match[];
  const leftQF   = ["qf-01","qf-02"].map(byId).filter(Boolean) as Match[];
  const leftSF   = [byId("sf-01")].filter(Boolean) as Match[];

  // LADO DIREITO (r32-09..16 → r16-05..08 → qf-03..04 → sf-02)
  const rightR32 = ["r32-09","r32-10","r32-11","r32-12","r32-13","r32-14","r32-15","r32-16"].map(byId).filter(Boolean) as Match[];
  const rightR16 = ["r16-05","r16-06","r16-07","r16-08"].map(byId).filter(Boolean) as Match[];
  const rightQF  = ["qf-03","qf-04"].map(byId).filter(Boolean) as Match[];
  const rightSF  = [byId("sf-02")].filter(Boolean) as Match[];

  const finalMatch = byId("final");
  const thirdMatch = byId("3rd");

  return (
    <div className="overflow-x-auto pb-2 -mx-2 px-2">
      <div className="flex items-start gap-1 min-w-fit" style={{ minWidth: "900px" }}>

        {/* ═══ ESQUERDA ═══ */}
        <RoundColumn title="16avos" emoji="🔵" matches={leftR32} onSelectWinner={onSelectWinner} />
        <div className="self-stretch flex items-center pt-6">
          <div className="w-2 h-px bg-amber-200" />
        </div>
        <RoundColumn title="Oitavas" emoji="⚽" matches={leftR16} onSelectWinner={onSelectWinner} />
        <div className="self-stretch flex items-center pt-6">
          <div className="w-2 h-px bg-amber-200" />
        </div>
        <RoundColumn title="Quartas" emoji="🔥" matches={leftQF} onSelectWinner={onSelectWinner} />
        <div className="self-stretch flex items-center pt-6">
          <div className="w-2 h-px bg-amber-200" />
        </div>
        <RoundColumn title="Semis" emoji="⭐" matches={leftSF} onSelectWinner={onSelectWinner} />
        <div className="self-stretch flex items-center pt-6">
          <div className="w-2 h-px bg-amber-200" />
        </div>

        {/* ═══ CENTRO ═══ */}
        <div className="flex flex-col items-center gap-4 min-w-[150px] pt-2">
          <ChampionBox match={finalMatch} onSelectWinner={onSelectWinner} />
          <div className="w-full mt-2 border-t border-dashed border-gray-200 pt-3">
            <div className="text-center text-[10px] font-bold text-gray-400 mb-2">🥉 3º Lugar</div>
            {thirdMatch && <GameCard match={thirdMatch} onSelectWinner={onSelectWinner} />}
          </div>
        </div>

        {/* ═══ DIREITA (espelhada) ═══ */}
        <div className="self-stretch flex items-center pt-6">
          <div className="w-2 h-px bg-amber-200" />
        </div>
        <RoundColumn title="Semis" emoji="⭐" matches={rightSF} onSelectWinner={onSelectWinner} />
        <div className="self-stretch flex items-center pt-6">
          <div className="w-2 h-px bg-amber-200" />
        </div>
        <RoundColumn title="Quartas" emoji="🔥" matches={rightQF} onSelectWinner={onSelectWinner} />
        <div className="self-stretch flex items-center pt-6">
          <div className="w-2 h-px bg-amber-200" />
        </div>
        <RoundColumn title="Oitavas" emoji="⚽" matches={rightR16} onSelectWinner={onSelectWinner} />
        <div className="self-stretch flex items-center pt-6">
          <div className="w-2 h-px bg-amber-200" />
        </div>
        <RoundColumn title="16avos" emoji="🔵" matches={rightR32} onSelectWinner={onSelectWinner} />

      </div>
    </div>
  );
}
