import { cn } from "@/lib/utils";
import type { RankingEntry } from "@/types/prediction";
import { isUsingLocalStorage } from "@/repositories";
import { Trophy, MapPin, Info, ChevronRight } from "lucide-react";

interface RankingTableProps {
  entries: RankingEntry[];
  loading?: boolean;
  error?: string | null;
  onSelectEntry?: (code: string) => void;
}

function PositionBadge({ position }: { position: number }) {
  if (position === 1)
    return <span className="text-2xl" title="1º lugar">🥇</span>;
  if (position === 2)
    return <span className="text-2xl" title="2º lugar">🥈</span>;
  if (position === 3)
    return <span className="text-2xl" title="3º lugar">🥉</span>;
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-700">
      {position}º
    </span>
  );
}

export function RankingTable({ entries, loading, error, onSelectEntry }: RankingTableProps) {
  const isLocal = isUsingLocalStorage();

  return (
    <div className="space-y-4">
      {/* Local storage warning */}
      {isLocal && (
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <Info className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Ranking salvo neste dispositivo.</strong> Para ranking online com todos os participantes, configure o Supabase.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="text-4xl animate-bounce">🏆</div>
            <p className="text-gray-500 font-semibold">Carregando ranking...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="text-6xl">🏠</div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-700">Ninguém no ranking ainda!</p>
            <p className="text-sm text-gray-500 mt-1">
              Seja o primeiro a montar seu palpite da Copa.
            </p>
          </div>
        </div>
      )}

      {/* Ranking list */}
      {!loading && entries.length > 0 && (
        <div className="space-y-2">
          {onSelectEntry && (
            <p className="text-xs text-gray-400 text-center mb-2">
              👆 Toque no nome para ver os palpites completos
            </p>
          )}
          {entries.map((entry) => (
            <div
              key={entry.code}
              onClick={() => onSelectEntry?.(entry.code)}
              className={cn(
                "flex items-center gap-4 rounded-2xl border p-4 transition-all hover:shadow-md",
                onSelectEntry && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
                entry.position === 1 && "bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-300 shadow-md",
                entry.position === 2 && "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300",
                entry.position === 3 && "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300",
                entry.position > 3 && "bg-white border-gray-200",
              )}
              id={`ranking-entry-${entry.position}`}
            >
              {/* Position */}
              <div className="shrink-0 w-10 flex justify-center">
                <PositionBadge position={entry.position} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-black text-gray-900 truncate">{entry.participantName}</div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {entry.participantCity}
                  {entry.championTeamName && (
                    <span className="ml-2 text-amber-600">• 🏆 {entry.championTeamName}</span>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="shrink-0 text-right flex items-center gap-2">
                <div>
                  <div className="font-black text-2xl text-amber-600 leading-none">
                    {entry.totalPoints}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">pontos</div>
                  <div className="flex gap-2 mt-1 text-[10px] text-gray-500">
                    <span title="Placares exatos">🎯 {entry.exactScores}</span>
                    <span title="Vencedores corretos">✅ {entry.correctWinners}</span>
                  </div>
                </div>
                {onSelectEntry && (
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tiebreaker legend */}
      {entries.length > 0 && (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
          <p className="text-xs font-bold text-gray-600 mb-1">Critérios de desempate:</p>
          <ol className="text-xs text-gray-500 space-y-0.5 list-decimal list-inside">
            <li>Maior número de placares exatos (🎯)</li>
            <li>Maior número de vencedores corretos (✅)</li>
            <li>Palpite enviado primeiro</li>
          </ol>
        </div>
      )}
    </div>
  );
}
