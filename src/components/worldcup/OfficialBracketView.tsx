import type { Match, Stage } from "@/lib/worldcup/types";
import { cn } from "@/lib/utils";
import { formatMatchShort } from "@/utils/dateUtils";
import { MapPin } from "lucide-react";

// ─── Configuração de rounds ───────────────────────────────────────────────────
const ROUND_CONFIG: { stage: Stage; name: string; emoji: string }[] = [
  { stage: "LAST_32",        name: "16 Avos de Final",   emoji: "🔵" },
  { stage: "LAST_16",        name: "Oitavas de Final",   emoji: "⚽" },
  { stage: "QUARTER_FINALS", name: "Quartas de Final",   emoji: "🔥" },
  { stage: "SEMI_FINALS",    name: "Semifinais",         emoji: "⭐" },
  { stage: "THIRD_PLACE",    name: "3º Lugar",           emoji: "🥉" },
  { stage: "FINAL",          name: "Final",              emoji: "🏆" },
];

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function TeamRow({
  team,
  score,
  pens,
  isWinner,
  isLoser,
}: {
  team: Match["homeTeam"];
  score: number | null;
  pens?: number | null;
  isWinner: boolean;
  isLoser: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors",
        isWinner && "bg-green-100 ring-1 ring-green-300",
        isLoser && "opacity-50",
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {team?.flagUrl ? (
          <img
            src={team.flagUrl}
            alt={team.name}
            className="h-6 w-9 object-cover rounded-md shrink-0 shadow-sm ring-1 ring-gray-200"
          />
        ) : (
          <div className="h-6 w-9 rounded-md bg-gray-100 shrink-0 flex items-center justify-center">
            <span className="text-gray-400 text-xs">❓</span>
          </div>
        )}
        <div className="min-w-0">
          <div className={cn("truncate text-sm font-bold", isWinner && "text-green-700")}>
            {team?.name ?? "A definir"}
          </div>
          {team?.tla && (
            <div className="text-[10px] text-gray-400 uppercase">{team.tla}</div>
          )}
        </div>
      </div>
      <div className="flex items-baseline gap-1 shrink-0">
        <span className="text-xl font-black tabular-nums text-gray-900">
          {score ?? "–"}
        </span>
        {pens != null && (
          <span className="text-xs text-gray-400 font-semibold">({pens})</span>
        )}
      </div>
    </div>
  );
}

function OfficialMatchCard({ match }: { match: Match }) {
  const winnerId = match.winner;
  const homeWin = winnerId && match.homeTeam?.id === winnerId;
  const awayWin = winnerId && match.awayTeam?.id === winnerId;
  const isLive     = match.status === "live";
  const isFinished = match.status === "finished";
  const matchTime  = formatMatchShort(match.date);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md",
        isLive     && "border-red-300 ring-2 ring-red-200",
        isFinished && "border-green-200",
        !isFinished && !isLive && "border-gray-200",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          {matchTime}
        </span>
        {isLive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Ao vivo
          </span>
        ) : isFinished ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
            Final
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
            Agendado
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="px-2 pb-2 space-y-1">
        <TeamRow
          team={match.homeTeam}
          score={match.homeScore}
          pens={match.penaltiesHome}
          isWinner={!!homeWin}
          isLoser={!!awayWin}
        />
        <div className="flex items-center gap-2 px-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[10px] font-black text-gray-300 uppercase">vs</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <TeamRow
          team={match.awayTeam}
          score={match.awayScore}
          pens={match.penaltiesAway}
          isWinner={!!awayWin}
          isLoser={!!homeWin}
        />
      </div>

      {/* Venue */}
      {(match.venue || match.city) && (
        <div className="flex items-center gap-1 px-3 pb-2 text-[10px] text-gray-400">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{match.city ?? match.venue}</span>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
/**
 * Recebe matches diretamente (não o bracket pré-montado) para sempre
 * refletir os últimos dados — incluindo overrides do admin em tempo real.
 */
export function OfficialBracketView({ matches }: { matches: Match[] }) {
  const knockoutMatches = matches.filter((m) => m.stage !== "GROUP_STAGE");

  if (!knockoutMatches.length) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">⏳</div>
        <p className="text-gray-500 font-semibold">Chaveamento ainda não disponível.</p>
        <p className="text-sm text-gray-400 mt-1">Os dados serão atualizados conforme a Copa avança.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4">
      <div className="flex gap-4 min-w-max items-start">
        {ROUND_CONFIG.map(({ stage, name, emoji }) => {
          const roundMatches = knockoutMatches.filter((m) => m.stage === stage);
          if (!roundMatches.length) return null;
          return (
            <div key={stage} className="w-[260px] shrink-0">
              {/* Round header */}
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className="text-lg">{emoji}</span>
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider">
                  {name}
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {roundMatches.map((m) => (
                  <OfficialMatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
