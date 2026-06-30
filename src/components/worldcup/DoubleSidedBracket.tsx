import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Match, Team } from "@/lib/worldcup/types";
import { Trophy, Swords, ChevronRight, ChevronLeft } from "lucide-react";

interface BracketMatch {
  match: Match | null;
  label?: string;
}

interface Props {
  matches: Match[];
  onSelectWinner?: (matchId: string, slot: "home" | "away") => void;
  readonly?: boolean;
}

// ── Slot de time no chaveamento ────────────────────────────────────────────
function TeamSlot({
  team, score, pens, isWinner, isLoser, side, onClick, canClick,
}: {
  team: Team | null; score: number | null; pens: number | null;
  isWinner: boolean; isLoser: boolean; side: "home" | "away";
  onClick?: () => void; canClick?: boolean;
}) {
  return (
    <button
      onClick={canClick ? onClick : undefined}
      disabled={!canClick}
      className={cn(
        "flex items-center gap-1.5 w-full px-2 py-1.5 text-left transition-all",
        side === "home" ? "border-b border-gray-200" : "",
        isWinner && "bg-green-50 font-black text-green-700",
        isLoser && "bg-gray-50 text-gray-400 line-through",
        !isWinner && !isLoser && team && canClick && "hover:bg-amber-50 cursor-pointer",
        !team && "text-gray-400 italic",
      )}
    >
      {team ? (
        <>
          <img src={team.flagUrl} alt={team.name} className="h-4 w-6 object-cover rounded-sm flex-shrink-0" />
          <span className="truncate text-[11px] flex-1">{team.name}</span>
          {score !== null && (
            <span className={cn("text-[12px] font-black ml-auto flex-shrink-0", isWinner ? "text-green-700" : "text-gray-600")}>
              {score}{pens !== null ? `(${pens})` : ""}
            </span>
          )}
          {isWinner && <Trophy className="h-3 w-3 text-amber-500 flex-shrink-0" />}
        </>
      ) : (
        <span className="text-[10px] text-gray-300 italic">A definir</span>
      )}
    </button>
  );
}

// ── Card de uma partida ────────────────────────────────────────────────────
function MatchCard({
  match, onSelectWinner, readonly, compact,
}: {
  match: Match | null; onSelectWinner?: (slot: "home" | "away") => void; readonly?: boolean; compact?: boolean;
}) {
  if (!match) {
    return (
      <div className={cn("rounded-lg border border-dashed border-gray-200 bg-white/60", compact ? "w-28" : "w-36")}>
        <div className="h-8 flex items-center justify-center">
          <span className="text-[9px] text-gray-300">—</span>
        </div>
        <div className="border-t border-dashed border-gray-200 h-8 flex items-center justify-center">
          <span className="text-[9px] text-gray-300">—</span>
        </div>
      </div>
    );
  }

  const isFinished = match.status === "finished";
  const homeWins = match.winner && match.homeTeam && match.winner === match.homeTeam.id;
  const awayWins = match.winner && match.awayTeam && match.winner === match.awayTeam.id;
  const canClickHome = !isFinished && !readonly && !!match.homeTeam && !!match.awayTeam;
  const canClickAway = !isFinished && !readonly && !!match.homeTeam && !!match.awayTeam;

  return (
    <div className={cn(
      "rounded-lg border bg-white shadow-sm overflow-hidden",
      compact ? "w-28" : "w-36",
      isFinished ? "border-gray-300" : "border-amber-200",
      homeWins || awayWins ? "ring-1 ring-green-400" : "",
    )}>
      <TeamSlot
        team={match.homeTeam} score={match.homeScore} pens={match.penaltiesHome}
        isWinner={!!homeWins} isLoser={!!awayWins} side="home"
        onClick={() => onSelectWinner?.("home")} canClick={canClickHome}
      />
      <TeamSlot
        team={match.awayTeam} score={match.awayScore} pens={match.penaltiesAway}
        isWinner={!!awayWins} isLoser={!!homeWins} side="away"
        onClick={() => onSelectWinner?.("away")} canClick={canClickAway}
      />
    </div>
  );
}

// ── Coluna de fase ──────────────────────────────────────────────────────────
function PhaseColumn({
  title, matches, side, onSelectWinner, readonly, compact,
}: {
  title: string; matches: (Match | null)[];
  side: "left" | "right" | "center";
  onSelectWinner?: (matchId: string, slot: "home" | "away") => void;
  readonly?: boolean; compact?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn(
        "text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full mb-2",
        side === "center" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500",
      )}>
        {title}
      </div>
      <div className="flex flex-col gap-3 justify-around h-full">
        {matches.map((m, i) => (
          <MatchCard
            key={m?.id ?? `empty-${i}`}
            match={m}
            onSelectWinner={m ? (slot) => onSelectWinner?.(m.id, slot) : undefined}
            readonly={readonly}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

// ── Chaveamento de dois lados ───────────────────────────────────────────────
export function DoubleSidedBracket({ matches, onSelectWinner, readonly }: Props) {
  const byId = useMemo(() => new Map(matches.map((m) => [m.id, m])), [matches]);
  const get = (id: string) => byId.get(id) ?? null;

  // LADO ESQUERDO
  const leftR32  = ["r32-01","r32-02","r32-03","r32-04","r32-05","r32-06","r32-07","r32-08"].map(get);
  const leftR16  = ["r16-L1","r16-L2","r16-L3","r16-L4"].map(get);
  const leftQF   = ["qf-L1","qf-L2"].map(get);
  const leftSF   = [get("sf-1")];

  // LADO DIREITO
  const rightR32 = ["r32-09","r32-10","r32-11","r32-12","r32-13","r32-14","r32-15","r32-16"].map(get);
  const rightR16 = ["r16-R1","r16-R2","r16-R3","r16-R4"].map(get);
  const rightQF  = ["qf-R1","qf-R2"].map(get);
  const rightSF  = [get("sf-2")];

  // CENTRO
  const final_   = get("final");
  const third_   = get("3rd");

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[900px] flex gap-2 items-center justify-center">

        {/* ── LADO ESQUERDO ── */}
        <div className="flex gap-1 items-center">
          <PhaseColumn title="16avos" matches={leftR32} side="left" onSelectWinner={onSelectWinner} readonly={readonly} />
          <div className="flex flex-col justify-around h-full gap-16 py-4 px-0.5">
            {leftR32.map((_, i) => i % 2 === 0 && <ChevronRight key={i} className="h-3 w-3 text-gray-300" />)}
          </div>
          <PhaseColumn title="Oitavas" matches={leftR16} side="left" onSelectWinner={onSelectWinner} readonly={readonly} />
          <div className="flex flex-col justify-around gap-8 py-8 px-0.5">
            {leftR16.map((_, i) => i % 2 === 0 && <ChevronRight key={i} className="h-3 w-3 text-gray-300" />)}
          </div>
          <PhaseColumn title="Quartas" matches={leftQF} side="left" onSelectWinner={onSelectWinner} readonly={readonly} />
          <div className="flex flex-col justify-around gap-4 py-16 px-0.5">
            <ChevronRight className="h-3 w-3 text-gray-300" />
          </div>
          <PhaseColumn title="Semis" matches={leftSF} side="left" onSelectWinner={onSelectWinner} readonly={readonly} />
          <div className="py-16 px-0.5">
            <ChevronRight className="h-3 w-3 text-gray-300" />
          </div>
        </div>

        {/* ── CENTRO ── */}
        <div className="flex flex-col items-center gap-4 min-w-[120px]">
          {/* Troféu */}
          <div className="flex flex-col items-center gap-1 mb-2">
            <div className="text-3xl">🏆</div>
            <div className="text-[10px] font-black text-amber-600 uppercase tracking-wide text-center">Campeão</div>
          </div>

          <MatchCard
            match={final_}
            onSelectWinner={final_ ? (slot) => onSelectWinner?.(final_.id, slot) : undefined}
            readonly={readonly}
            compact={false}
          />

          {/* 3º lugar */}
          <div className="flex flex-col items-center gap-1 mt-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">3º Lugar</div>
            <MatchCard
              match={third_}
              onSelectWinner={third_ ? (slot) => onSelectWinner?.(third_.id, slot) : undefined}
              readonly={readonly}
              compact={false}
            />
          </div>
        </div>

        {/* ── LADO DIREITO ── */}
        <div className="flex gap-1 items-center">
          <div className="py-16 px-0.5">
            <ChevronLeft className="h-3 w-3 text-gray-300" />
          </div>
          <PhaseColumn title="Semis" matches={rightSF} side="right" onSelectWinner={onSelectWinner} readonly={readonly} />
          <div className="py-16 px-0.5">
            <ChevronLeft className="h-3 w-3 text-gray-300" />
          </div>
          <PhaseColumn title="Quartas" matches={rightQF} side="right" onSelectWinner={onSelectWinner} readonly={readonly} />
          <div className="flex flex-col justify-around gap-8 py-8 px-0.5">
            {rightR16.map((_, i) => i % 2 === 0 && <ChevronLeft key={i} className="h-3 w-3 text-gray-300" />)}
          </div>
          <PhaseColumn title="Oitavas" matches={rightR16} side="right" onSelectWinner={onSelectWinner} readonly={readonly} />
          <div className="flex flex-col justify-around h-full gap-16 py-4 px-0.5">
            {rightR32.map((_, i) => i % 2 === 0 && <ChevronLeft key={i} className="h-3 w-3 text-gray-300" />)}
          </div>
          <PhaseColumn title="16avos" matches={rightR32} side="right" onSelectWinner={onSelectWinner} readonly={readonly} />
        </div>

      </div>
    </div>
  );
}
