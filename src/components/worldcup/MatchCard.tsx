import type { Match, Team } from "@/lib/worldcup/types";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

function TeamRow({ team, score, pens, isWinner, isLoser }: {
  team: Team | null; score: number | null; pens?: number | null; isWinner: boolean; isLoser: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-colors",
      isWinner && "bg-[color-mix(in_oklab,var(--brand-green)_18%,transparent)]",
      isLoser && "opacity-60",
    )}>
      <div className="flex items-center gap-2 min-w-0">
        {team?.flagUrl ? (
          <img src={team.flagUrl} alt={team.name} className="h-6 w-9 object-cover rounded-sm shrink-0 ring-1 ring-border" />
        ) : (
          <div className="h-6 w-9 rounded-sm bg-muted shrink-0" />
        )}
        <span className={cn("truncate text-sm font-semibold", isWinner && "text-brand-green")}>
          {team?.name ?? "A definir"}
        </span>
      </div>
      <div className="flex items-baseline gap-1 shrink-0">
        <span className="text-xl font-display tabular-nums">
          {score ?? "–"}
        </span>
        {pens != null && (
          <span className="text-xs text-muted-foreground">({pens})</span>
        )}
      </div>
    </div>
  );
}

export function MatchCard({ match, onPickWinner }: { match: Match; onPickWinner?: (slot: "home" | "away") => void }) {
  const winnerId = match.winner;
  const homeWin = winnerId && match.homeTeam?.id === winnerId;
  const awayWin = winnerId && match.awayTeam?.id === winnerId;
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  return (
    <div className="card-glass p-3 w-full min-w-0">
      <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
        <span className="truncate">{formatDate(match.date)}</span>
        {isLive ? (
          <span className="chip bg-destructive/15 text-destructive">
            <span className="live-dot" /> Ao vivo
          </span>
        ) : isFinished ? (
          <span className="chip bg-brand-green/15 text-brand-green">Final</span>
        ) : (
          <span className="chip bg-muted text-muted-foreground">Agendado</span>
        )}
      </div>
      <button
        type="button"
        disabled={!onPickWinner || !match.homeTeam}
        onClick={() => onPickWinner?.("home")}
        className="w-full text-left disabled:cursor-default"
      >
        <TeamRow team={match.homeTeam} score={match.homeScore} pens={match.penaltiesHome} isWinner={!!homeWin} isLoser={!!awayWin} />
      </button>
      <div className="h-px bg-border/60 my-1" />
      <button
        type="button"
        disabled={!onPickWinner || !match.awayTeam}
        onClick={() => onPickWinner?.("away")}
        className="w-full text-left disabled:cursor-default"
      >
        <TeamRow team={match.awayTeam} score={match.awayScore} pens={match.penaltiesAway} isWinner={!!awayWin} isLoser={!!homeWin} />
      </button>
      {match.venue && (
        <div className="mt-2 text-[10px] text-muted-foreground truncate">{match.venue}</div>
      )}
    </div>
  );
}
