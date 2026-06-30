import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/worldcup/types";
import type { SimulationScores } from "@/contexts/SimulatorContext";
import { useSimulator } from "@/contexts/SimulatorContext";
import { formatMatchShort } from "@/utils/dateUtils";

interface SimulatorCardProps {
  match: Match;
}

function ScoreInput({
  value,
  onChange,
  label,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
        {label}
      </label>
      <input
        type="number"
        min={0}
        max={99}
        value={value ?? ""}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          onChange(isNaN(v) || v < 0 ? null : v);
        }}
        className="w-12 h-10 text-center text-lg font-black rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
        placeholder="–"
        aria-label={label}
      />
    </div>
  );
}

export function SimulatorCard({ match }: SimulatorCardProps) {
  const { state, pickWinner, setScore } = useSimulator();
  const score = state.scores[match.id];

  const homeScore = score?.homeScore ?? null;
  const awayScore = score?.awayScore ?? null;
  const decidedByPenalties = score?.decidedByPenalties ?? false;
  const penaltyWinnerId = score?.penaltyWinnerId ?? null;

  const selectedWinnerId = match.winner;
  const isHomeWinner = selectedWinnerId === match.homeTeam?.id;
  const isAwayWinner = selectedWinnerId === match.awayTeam?.id;
  const isKnockout = match.stage !== "GROUP_STAGE";

  // Detect draw scenario
  const isDraw =
    homeScore !== null &&
    awayScore !== null &&
    homeScore === awayScore &&
    isKnockout;

  const handlePickHome = () => {
    if (!match.homeTeam) return;
    pickWinner(match.id, "home");
    // Update score if it was a draw, set penalty winner
    if (isDraw) {
      setScore(match.id, homeScore, awayScore, true, match.homeTeam.id);
    }
  };

  const handlePickAway = () => {
    if (!match.awayTeam) return;
    pickWinner(match.id, "away");
    if (isDraw) {
      setScore(match.id, homeScore, awayScore, true, match.awayTeam.id);
    }
  };

  const handleScoreChange = (
    newHome: number | null,
    newAway: number | null,
  ) => {
    const newIsDraw =
      newHome !== null && newAway !== null && newHome === newAway && isKnockout;
    setScore(match.id, newHome, newAway, newIsDraw ? decidedByPenalties : false, newIsDraw ? penaltyWinnerId : null);
  };

  const canPick = match.homeTeam && match.awayTeam;

  return (
    <div
      className={cn(
        "rounded-2xl border-2 bg-white shadow-sm transition-all",
        selectedWinnerId ? "border-amber-300 shadow-md" : "border-gray-200",
        !canPick && "opacity-60",
      )}
      id={`sim-card-${match.id}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          {formatMatchShort(match.date)}
        </span>
        {selectedWinnerId && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            ✓ Escolhido
          </span>
        )}
      </div>

      {/* Scores row */}
      <div className="flex items-center justify-between px-3 py-3 gap-2">
        {/* Home team picker */}
        <button
          type="button"
          onClick={handlePickHome}
          disabled={!canPick}
          className={cn(
            "flex-1 flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all",
            isHomeWinner
              ? "bg-gradient-to-b from-amber-50 to-yellow-50 ring-2 ring-amber-400 scale-105 shadow-md"
              : "hover:bg-gray-50 active:scale-95",
            !canPick && "cursor-not-allowed",
          )}
          id={`sim-pick-home-${match.id}`}
          title={`Escolher ${match.homeTeam?.name ?? "Time A"}`}
        >
          {match.homeTeam?.flagUrl ? (
            <img
              src={match.homeTeam.flagUrl}
              alt={match.homeTeam.name}
              className="h-8 w-12 object-cover rounded-lg shadow-sm"
            />
          ) : (
            <div className="h-8 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
              ?
            </div>
          )}
          <span
            className={cn(
              "text-xs font-bold text-center leading-tight max-w-[70px]",
              isHomeWinner ? "text-amber-700" : "text-gray-700",
            )}
          >
            {match.homeTeam?.name ?? "A definir"}
          </span>
          {isHomeWinner && <span className="text-sm">🏆</span>}
        </button>

        {/* Score inputs */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ScoreInput
            value={homeScore}
            onChange={(v) => handleScoreChange(v, awayScore)}
            label="Casa"
          />
          <span className="text-lg font-black text-gray-300">×</span>
          <ScoreInput
            value={awayScore}
            onChange={(v) => handleScoreChange(homeScore, v)}
            label="Fora"
          />
        </div>

        {/* Away team picker */}
        <button
          type="button"
          onClick={handlePickAway}
          disabled={!canPick}
          className={cn(
            "flex-1 flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all",
            isAwayWinner
              ? "bg-gradient-to-b from-amber-50 to-yellow-50 ring-2 ring-amber-400 scale-105 shadow-md"
              : "hover:bg-gray-50 active:scale-95",
            !canPick && "cursor-not-allowed",
          )}
          id={`sim-pick-away-${match.id}`}
          title={`Escolher ${match.awayTeam?.name ?? "Time B"}`}
        >
          {match.awayTeam?.flagUrl ? (
            <img
              src={match.awayTeam.flagUrl}
              alt={match.awayTeam.name}
              className="h-8 w-12 object-cover rounded-lg shadow-sm"
            />
          ) : (
            <div className="h-8 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
              ?
            </div>
          )}
          <span
            className={cn(
              "text-xs font-bold text-center leading-tight max-w-[70px]",
              isAwayWinner ? "text-amber-700" : "text-gray-700",
            )}
          >
            {match.awayTeam?.name ?? "A definir"}
          </span>
          {isAwayWinner && <span className="text-sm">🏆</span>}
        </button>
      </div>

      {/* Penalty tiebreaker (only for knockout draws) */}
      {isDraw && canPick && (
        <div className="mx-3 mb-3 rounded-xl bg-blue-50 border border-blue-200 p-3">
          <p className="text-xs font-bold text-blue-700 mb-2 text-center">
            ⚡ Empate! Quem avança nos pênaltis?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePickHome}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-bold transition-all border-2",
                penaltyWinnerId === match.homeTeam?.id
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-white border-blue-300 text-blue-700 hover:bg-blue-100",
              )}
              id={`sim-penalty-home-${match.id}`}
            >
              {match.homeTeam?.name ?? "Casa"}
            </button>
            <button
              type="button"
              onClick={handlePickAway}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-bold transition-all border-2",
                penaltyWinnerId === match.awayTeam?.id
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-white border-blue-300 text-blue-700 hover:bg-blue-100",
              )}
              id={`sim-penalty-away-${match.id}`}
            >
              {match.awayTeam?.name ?? "Fora"}
            </button>
          </div>
        </div>
      )}

      {/* No teams placeholder */}
      {!canPick && (
        <div className="px-3 pb-3 text-center text-xs text-gray-400 font-semibold">
          Aguardando classificados das fases anteriores...
        </div>
      )}
    </div>
  );
}
