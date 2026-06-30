import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/worldcup/types";
import { Trophy, ChevronRight, ChevronLeft } from "lucide-react";

interface Props {
  matches: Match[];
  onSelectWinner: (matchId: string, slot: "home" | "away", homeScore?: number, awayScore?: number) => void;
}

// ── Linha de Time com Placar Editável ─────────────────────────────────────
function TeamRow({
  team, score, pens, isWinner, isLoser, side, matchId, isFinished, bothTeams,
  onSetScore, currentScore,
}: {
  team: { name: string; flagUrl: string; id: string } | null;
  score: number | null; pens: number | null;
  isWinner: boolean; isLoser: boolean;
  side: "home" | "away"; matchId: string; isFinished: boolean;
  bothTeams: boolean; onSetScore: (val: number) => void; currentScore: number | null;
}) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all",
      isWinner && "bg-green-100 ring-1 ring-green-400",
      isLoser && "opacity-40",
    )}>
      {team ? (
        <>
          <img src={team.flagUrl} alt={team.name} className="h-4 w-6 rounded-sm object-cover flex-shrink-0 shadow-sm" />
          <span className={cn("flex-1 truncate text-[11px]", isWinner ? "font-black text-green-800" : "font-semibold text-gray-700")}>
            {team.name}
          </span>
          {isFinished ? (
            <span className={cn("text-sm font-black flex-shrink-0 min-w-[20px] text-right", isWinner ? "text-green-700" : "text-gray-600")}>
              {score ?? "–"}{pens !== null ? <span className="text-[9px] text-gray-400">({pens})</span> : ""}
            </span>
          ) : bothTeams ? (
            <input
              type="number"
              min={0}
              max={20}
              value={currentScore ?? ""}
              onChange={(e) => onSetScore(parseInt(e.target.value, 10) || 0)}
              onClick={(e) => e.stopPropagation()}
              placeholder="0"
              className="w-10 text-center rounded-lg border-2 border-amber-300 text-sm font-black text-gray-800 focus:border-amber-500 focus:outline-none bg-white flex-shrink-0 py-0.5"
            />
          ) : (
            <span className="text-[11px] text-gray-300 italic">–</span>
          )}
          {isWinner && <Trophy className="h-3 w-3 text-amber-500 ml-0.5 flex-shrink-0" />}
        </>
      ) : (
        <span className="text-[11px] text-gray-300 italic">A definir</span>
      )}
    </div>
  );
}

// ── Card de Jogo ─────────────────────────────────────────────────────────
function GameCard({
  match, onSelectWinner, compact,
}: {
  match: Match;
  onSelectWinner: Props["onSelectWinner"];
  compact?: boolean;
}) {
  const [homeScore, setHomeScore] = useState<number | null>(null);
  const [awayScore, setAwayScore] = useState<number | null>(null);

  const isFinished = match.status === "finished";
  const homeWins = !!match.winner && !!match.homeTeam && match.winner === match.homeTeam.id;
  const awayWins = !!match.winner && !!match.awayTeam && match.winner === match.awayTeam.id;
  const bothTeams = !!match.homeTeam && !!match.awayTeam;

  const dateStr = useMemo(() => {
    try {
      return new Date(match.date).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "2-digit",
        hour: "2-digit", minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      });
    } catch { return ""; }
  }, [match.date]);

  const canSubmit = !isFinished && bothTeams && homeScore !== null && awayScore !== null;

  const handleConfirm = () => {
    if (!canSubmit) return;
    const h = homeScore!;
    const a = awayScore!;
    const slot = h > a ? "home" : a > h ? "away" : "home"; // empate → home (escolha padrão)
    onSelectWinner(match.id, slot, h, a);
  };

  // Botão de escolher vencedor rápido (sem placar)
  const handleQuickPick = (slot: "home" | "away") => {
    if (isFinished) return;
    if (!bothTeams) return;
    onSelectWinner(match.id, slot);
  };

  return (
    <div className={cn(
      "rounded-xl border bg-white shadow-sm overflow-hidden transition-all",
      compact ? "min-w-[150px] max-w-[175px]" : "min-w-[170px] max-w-[200px]",
      isFinished ? "border-gray-200" : "border-amber-200",
      !isFinished && bothTeams && "hover:shadow-md hover:border-amber-400",
      (homeWins || awayWins) && "ring-1 ring-green-400",
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-gray-50 border-b border-gray-100">
        <span className="text-[9px] text-gray-400">{dateStr}</span>
        {isFinished && <span className="text-[9px] font-black text-green-600">FIM ✓</span>}
        {!isFinished && bothTeams && <span className="text-[9px] font-bold text-amber-500">Palpite</span>}
      </div>

      {/* Times */}
      <div className="p-1 space-y-0.5">
        <TeamRow
          team={match.homeTeam} score={match.homeScore} pens={match.penaltiesHome}
          isWinner={homeWins} isLoser={awayWins} side="home"
          matchId={match.id} isFinished={isFinished} bothTeams={bothTeams}
          onSetScore={setHomeScore} currentScore={homeScore}
        />
        <TeamRow
          team={match.awayTeam} score={match.awayScore} pens={match.penaltiesAway}
          isWinner={awayWins} isLoser={homeWins} side="away"
          matchId={match.id} isFinished={isFinished} bothTeams={bothTeams}
          onSetScore={setAwayScore} currentScore={awayScore}
        />
      </div>

      {/* Botões de ação */}
      {!isFinished && bothTeams && (
        <div className="px-1.5 pb-1.5 space-y-1">
          {canSubmit ? (
            <button
              onClick={handleConfirm}
              className="w-full rounded-lg bg-amber-500 py-1 text-[10px] font-black text-white hover:bg-amber-600 transition-colors"
            >
              ✓ Confirmar Placar
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => handleQuickPick("home")}
                className="flex-1 rounded-lg bg-blue-50 border border-blue-200 py-1 text-[9px] font-bold text-blue-700 hover:bg-blue-100 transition-colors truncate px-1"
              >
                {match.homeTeam?.name.split(" ")[0]} ↑
              </button>
              <button
                onClick={() => handleQuickPick("away")}
                className="flex-1 rounded-lg bg-orange-50 border border-orange-200 py-1 text-[9px] font-bold text-orange-700 hover:bg-orange-100 transition-colors truncate px-1"
              >
                ↑ {match.awayTeam?.name.split(" ")[0]}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Coluna de fase ──────────────────────────────────────────────────────────
function RoundCol({
  title, emoji, matches, onSelectWinner, highlight,
}: {
  title: string; emoji: string; matches: Match[];
  onSelectWinner: Props["onSelectWinner"]; highlight?: boolean;
}) {
  return (
    <div className="flex flex-col" style={{ minWidth: matches.length > 4 ? 185 : 180 }}>
      <div className={cn(
        "text-center text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full mb-3 flex-shrink-0",
        highlight ? "bg-amber-500 text-white shadow-md" : "bg-gray-100 text-gray-500",
      )}>
        {emoji} {title}
      </div>
      <div className="flex flex-col gap-2 justify-around flex-1">
        {matches.map((m) => (
          <GameCard key={m.id} match={m} onSelectWinner={onSelectWinner} />
        ))}
      </div>
    </div>
  );
}

// ── Separador visual ─────────────────────────────────────────────────────────
function Sep() {
  return <div className="self-stretch flex items-center mt-8 px-0.5"><div className="w-3 h-px bg-amber-200" /></div>;
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export function BracketSimulator({ matches, onSelectWinner }: Props) {
  const byId = (id: string) => matches.find((m) => m.id === id) ?? null;

  // ESQUERDO
  const lR32 = ["r32-01","r32-04","r32-03","r32-05","r32-02","r32-06","r32-07","r32-08"].map(byId).filter(Boolean) as Match[];
  const lR16 = ["r16-01","r16-02","r16-03","r16-04"].map(byId).filter(Boolean) as Match[];
  const lQF  = ["qf-01","qf-02"].map(byId).filter(Boolean) as Match[];
  const lSF  = [byId("sf-01")].filter(Boolean) as Match[];

  // DIREITO
  const rR32 = ["r32-09","r32-10","r32-11","r32-12","r32-13","r32-14","r32-15","r32-16"].map(byId).filter(Boolean) as Match[];
  const rR16 = ["r16-05","r16-06","r16-07","r16-08"].map(byId).filter(Boolean) as Match[];
  const rQF  = ["qf-03","qf-04"].map(byId).filter(Boolean) as Match[];
  const rSF  = [byId("sf-02")].filter(Boolean) as Match[];

  const finalM = byId("final");
  const thirdM = byId("3rd");

  // Campeão
  const champion = finalM?.winner
    ? matches.flatMap((m) => [m.homeTeam, m.awayTeam]).find((t) => t?.id === finalM.winner) ?? null
    : null;

  return (
    <div className="overflow-x-auto pb-4 -mx-2 px-2">
      <div className="flex items-start gap-0.5" style={{ minWidth: 1100 }}>

        {/* ── ESQUERDO ── */}
        <RoundCol title="16avos" emoji="🔵" matches={lR32} onSelectWinner={onSelectWinner} />
        <Sep />
        <RoundCol title="Oitavas" emoji="⚽" matches={lR16} onSelectWinner={onSelectWinner} />
        <Sep />
        <RoundCol title="Quartas" emoji="🔥" matches={lQF} onSelectWinner={onSelectWinner} />
        <Sep />
        <RoundCol title="Semis" emoji="⭐" matches={lSF} onSelectWinner={onSelectWinner} />
        <Sep />

        {/* ── CENTRO ── */}
        <div className="flex flex-col items-center gap-3 px-2 mt-1" style={{ minWidth: 185 }}>
          {/* FINAL */}
          <div className="text-center">
            <div className="text-3xl mb-1">🏆</div>
            <div className="text-[10px] font-black text-amber-600 uppercase tracking-wide mb-2">Final</div>
            {finalM && <GameCard match={finalM} onSelectWinner={onSelectWinner} />}
          </div>

          {/* CAMPEÃO */}
          {champion && (
            <div className="w-full rounded-2xl bg-gradient-to-b from-amber-100 to-yellow-50 border-2 border-amber-400 p-3 text-center shadow-lg">
              <div className="text-[9px] font-bold text-amber-600 uppercase mb-1">🥇 Campeão do Mundo</div>
              <img src={champion.flagUrl} alt={champion.name} className="h-8 w-12 mx-auto rounded-lg object-cover shadow-md mb-1" />
              <div className="text-sm font-black text-amber-800">{champion.name}</div>
            </div>
          )}

          {/* 3º LUGAR */}
          <div className="text-center w-full mt-2 pt-2 border-t border-dashed border-gray-200">
            <div className="text-[9px] font-bold text-gray-400 uppercase mb-2">🥉 3º Lugar</div>
            {thirdM && <GameCard match={thirdM} onSelectWinner={onSelectWinner} />}
          </div>
        </div>

        {/* ── DIREITO (espelhado) ── */}
        <Sep />
        <RoundCol title="Semis" emoji="⭐" matches={rSF} onSelectWinner={onSelectWinner} />
        <Sep />
        <RoundCol title="Quartas" emoji="🔥" matches={rQF} onSelectWinner={onSelectWinner} />
        <Sep />
        <RoundCol title="Oitavas" emoji="⚽" matches={rR16} onSelectWinner={onSelectWinner} />
        <Sep />
        <RoundCol title="16avos" emoji="🔵" matches={rR32} onSelectWinner={onSelectWinner} />

      </div>
    </div>
  );
}
