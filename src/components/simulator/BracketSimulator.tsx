import React, { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/worldcup/types";
import { Trophy } from "lucide-react";

interface Props {
  matches: Match[];
  onSelectWinner: (matchId: string, slot: "home" | "away", homeScore?: number, awayScore?: number) => void;
}

// ────────────────────────────────────────────────────────────────────────────
// Linha de time com bandeira e placar
// ────────────────────────────────────────────────────────────────────────────
function TeamRow({
  team, score, pens, isWinner, isLoser,
}: {
  team: { name: string; flagUrl: string; id: string } | null;
  score: number | null; pens: number | null;
  isWinner: boolean; isLoser: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1.5 rounded-lg min-h-[30px]",
      isWinner && "bg-green-100 ring-1 ring-green-400",
      isLoser && "opacity-40",
    )}>
      {team ? (
        <>
          <img src={team.flagUrl} alt={team.name}
            className="h-4 w-6 rounded-sm object-cover flex-shrink-0 shadow-sm"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className={cn("flex-1 truncate text-[11px]",
            isWinner ? "font-black text-green-800" : "font-semibold text-gray-700"
          )}>
            {team.name}
          </span>
          {score !== null && (
            <span className={cn("text-sm font-black flex-shrink-0 min-w-[16px] text-right",
              isWinner ? "text-green-700" : "text-gray-600"
            )}>
              {score}
              {pens !== null && <span className="text-[9px] text-gray-400">({pens})</span>}
            </span>
          )}
          {isWinner && <span className="text-amber-500 text-[10px] flex-shrink-0">✓</span>}
        </>
      ) : (
        <span className="text-[10px] text-gray-300 italic px-1">A definir</span>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Card de jogo — com inputs de placar e botões de escolha
// ────────────────────────────────────────────────────────────────────────────
function GameCard({ match, onSelectWinner }: { match: Match; onSelectWinner: Props["onSelectWinner"] }) {
  const [hs, setHs] = useState<string>("");
  const [as_, setAs] = useState<string>("");

  const isFinished = match.status === "finished";
  const homeWins = !!match.winner && match.homeTeam?.id === match.winner;
  const awayWins = !!match.winner && match.awayTeam?.id === match.winner;
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

  const handleConfirmScore = () => {
    const h = parseInt(hs, 10);
    const a = parseInt(as_, 10);
    if (isNaN(h) || isNaN(a)) return;
    const slot = h > a ? "home" : a > h ? "away" : "home";
    onSelectWinner(match.id, slot, h, a);
    setHs(""); setAs("");
  };

  const handleQuick = (slot: "home" | "away") => {
    onSelectWinner(match.id, slot);
  };

  return (
    <div className={cn(
      "rounded-xl border bg-white shadow-sm overflow-hidden w-full",
      isFinished ? "border-gray-200 opacity-95" : bothTeams ? "border-amber-300" : "border-gray-200",
      (homeWins || awayWins) && "ring-1 ring-green-400",
    )}>
      {/* Cabeçalho do card */}
      <div className={cn(
        "flex items-center justify-between px-2 py-1 border-b",
        isFinished ? "bg-green-50 border-green-100" : bothTeams ? "bg-amber-50 border-amber-100" : "bg-gray-50 border-gray-100"
      )}>
        <span className="text-[9px] text-gray-400 font-medium">{dateStr}</span>
        {isFinished
          ? <span className="text-[9px] font-black text-green-700">FIM ✓</span>
          : bothTeams
            ? <span className="text-[9px] font-bold text-amber-600">Palpite ↓</span>
            : <span className="text-[9px] text-gray-300">Aguardando</span>
        }
      </div>

      {/* Times */}
      <div className="px-1 pt-1 space-y-0.5">
        <TeamRow team={match.homeTeam} score={match.homeScore} pens={match.penaltiesHome}
          isWinner={homeWins} isLoser={awayWins} />
        <TeamRow team={match.awayTeam} score={match.awayScore} pens={match.penaltiesAway}
          isWinner={awayWins} isLoser={homeWins} />
      </div>

      {/* Inputs de placar + botões (só para jogos não finalizados com ambos times) */}
      {!isFinished && bothTeams && (
        <div className="px-1.5 pb-1.5 pt-1.5 space-y-1.5 bg-amber-50 border-t border-amber-100">
          {/* Inputs de placar */}
          <div className="flex items-center justify-center gap-1">
            <input
              type="number" min={0} max={20}
              value={hs}
              onChange={(e) => setHs(e.target.value)}
              placeholder="0"
              className="w-10 h-7 text-center rounded-lg border-2 border-amber-300 text-sm font-black text-gray-800 focus:border-amber-500 focus:outline-none bg-white"
            />
            <span className="text-[11px] font-black text-gray-400">×</span>
            <input
              type="number" min={0} max={20}
              value={as_}
              onChange={(e) => setAs(e.target.value)}
              placeholder="0"
              className="w-10 h-7 text-center rounded-lg border-2 border-amber-300 text-sm font-black text-gray-800 focus:border-amber-500 focus:outline-none bg-white"
            />
          </div>
          {/* Confirmar placar (se ambos preenchidos) */}
          {hs !== "" && as_ !== "" && (
            <button
              onClick={handleConfirmScore}
              className="w-full rounded-lg bg-amber-500 py-1 text-[10px] font-black text-white hover:bg-amber-600 transition-colors"
            >
              ✓ Confirmar {hs} × {as_}
            </button>
          )}
          {/* OU botões rápidos de escolha sem placar */}
          {(hs === "" || as_ === "") && (
            <div className="flex gap-1">
              <button
                onClick={() => handleQuick("home")}
                className="flex-1 rounded-lg bg-white border border-blue-300 py-1 text-[9px] font-bold text-blue-700 hover:bg-blue-50 transition-colors truncate px-0.5"
              >
                {match.homeTeam?.name?.split(" ")[0]} ▲
              </button>
              <span className="text-[8px] text-gray-300 self-center">ou</span>
              <button
                onClick={() => handleQuick("away")}
                className="flex-1 rounded-lg bg-white border border-orange-300 py-1 text-[9px] font-bold text-orange-700 hover:bg-orange-50 transition-colors truncate px-0.5"
              >
                ▲ {match.awayTeam?.name?.split(" ")[0]}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Coluna de fase
// ────────────────────────────────────────────────────────────────────────────
function RoundCol({ title, emoji, matches, onSelectWinner, center }: {
  title: string; emoji: string; matches: Match[];
  onSelectWinner: Props["onSelectWinner"]; center?: boolean;
}) {
  return (
    <div className={cn("flex flex-col flex-shrink-0", center ? "w-[185px]" : "w-[185px]")}>
      <div className={cn(
        "text-center text-[10px] font-black uppercase tracking-wide px-2 py-1.5 rounded-full mb-2 flex-shrink-0",
        center ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600",
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

// ────────────────────────────────────────────────────────────────────────────
// Separador visual
// ────────────────────────────────────────────────────────────────────────────
function Sep() {
  return (
    <div className="flex-shrink-0 self-stretch flex items-center mt-9 w-3">
      <div className="w-full h-px bg-amber-200" />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ────────────────────────────────────────────────────────────────────────────
export function BracketSimulator({ matches, onSelectWinner }: Props) {
  const byId = useCallback((id: string) => matches.find((m) => m.id === id) ?? null, [matches]);

  // ESQUERDO: 16avos→Oitavas→Quartas→Semis
  const lR32 = ["r32-01","r32-04","r32-03","r32-05","r32-02","r32-06","r32-07","r32-08"].map(byId).filter(Boolean) as Match[];
  const lR16 = ["r16-01","r16-02","r16-03","r16-04"].map(byId).filter(Boolean) as Match[];
  const lQF  = ["qf-01","qf-02"].map(byId).filter(Boolean) as Match[];
  const lSF  = [byId("sf-01")].filter(Boolean) as Match[];

  // DIREITO: 16avos→Oitavas→Quartas→Semis
  const rR32 = ["r32-09","r32-10","r32-11","r32-12","r32-13","r32-14","r32-15","r32-16"].map(byId).filter(Boolean) as Match[];
  const rR16 = ["r16-05","r16-06","r16-07","r16-08"].map(byId).filter(Boolean) as Match[];
  const rQF  = ["qf-03","qf-04"].map(byId).filter(Boolean) as Match[];
  const rSF  = [byId("sf-02")].filter(Boolean) as Match[];

  const finalM = byId("final");
  const thirdM = byId("3rd");

  const champion = finalM?.winner
    ? matches.flatMap((m) => [m.homeTeam, m.awayTeam]).find((t) => t?.id === finalM.winner) ?? null
    : null;

  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-4">
      <div className="flex items-start gap-0 min-w-[1200px]">

        {/* ═══ ESQUERDA ═══ */}
        <RoundCol title="16avos" emoji="🔵" matches={lR32} onSelectWinner={onSelectWinner} />
        <Sep />
        <RoundCol title="Oitavas" emoji="⚽" matches={lR16} onSelectWinner={onSelectWinner} />
        <Sep />
        <RoundCol title="Quartas" emoji="🔥" matches={lQF} onSelectWinner={onSelectWinner} />
        <Sep />
        <RoundCol title="Semis" emoji="⭐" matches={lSF} onSelectWinner={onSelectWinner} />
        <Sep />

        {/* ═══ CENTRO — FINAL ═══ */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0 w-[195px] mt-1 px-1">
          <div className="text-3xl text-center">🏆</div>
          <div className="text-[10px] font-black text-amber-600 uppercase text-center">Final</div>
          {finalM && <GameCard match={finalM} onSelectWinner={onSelectWinner} />}

          {champion && (
            <div className="w-full rounded-2xl bg-gradient-to-b from-amber-100 to-yellow-50 border-2 border-amber-400 p-3 text-center shadow-lg">
              <div className="text-[9px] font-black text-amber-600 uppercase mb-1">🥇 Campeão!</div>
              <img src={champion.flagUrl} alt={champion.name}
                className="h-8 w-12 mx-auto rounded-lg object-cover shadow mb-1"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="text-sm font-black text-amber-800 leading-tight">{champion.name}</div>
            </div>
          )}

          <div className="w-full border-t border-dashed border-gray-200 pt-2">
            <div className="text-[9px] font-bold text-gray-400 text-center mb-1">🥉 3º Lugar</div>
            {thirdM && <GameCard match={thirdM} onSelectWinner={onSelectWinner} />}
          </div>
        </div>

        {/* ═══ DIREITA ═══ */}
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
