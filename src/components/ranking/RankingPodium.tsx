import { cn } from "@/lib/utils";
import type { RankingEntry } from "@/types/prediction";
import { Trophy, MapPin, Star } from "lucide-react";

interface Props {
  entries: RankingEntry[];
}

export function RankingPodium({ entries }: Props) {
  if (entries.length === 0) return null;

  const first  = entries[0];
  const second = entries[1] ?? null;
  const third  = entries[2] ?? null;

  return (
    <div className="mb-8">
      {/* ── PALCO / PODIUM ── */}
      <div className="flex items-end justify-center gap-3 mb-2">

        {/* 2º Lugar */}
        <div className="flex flex-col items-center gap-2 w-28">
          {second ? (
            <>
              <div className="text-4xl">🥈</div>
              <div className="text-center">
                <div className="font-black text-sm text-gray-800 leading-tight truncate">{second.participantName}</div>
                <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 mt-0.5">
                  <MapPin className="h-2.5 w-2.5" />{second.participantCity}
                </div>
              </div>
              <div className="w-full rounded-t-2xl bg-gradient-to-b from-slate-300 to-slate-400 flex flex-col items-center justify-center py-4 px-2 shadow-md" style={{ height: 80 }}>
                <div className="text-2xl font-black text-white drop-shadow">{second.totalPoints}</div>
                <div className="text-[9px] text-slate-100 font-bold">pontos</div>
              </div>
            </>
          ) : (
            <div className="w-full rounded-t-2xl bg-slate-200 flex items-center justify-center py-4" style={{ height: 80 }}>
              <span className="text-[10px] text-slate-400 italic">—</span>
            </div>
          )}
          <div className="w-full bg-slate-400 rounded-b-xl h-2" />
        </div>

        {/* 1º Lugar — MAIS ALTO */}
        <div className="flex flex-col items-center gap-2 w-32">
          {/* Coroa animada */}
          <div className="relative">
            <div className="text-5xl animate-bounce">👑</div>
          </div>
          <div className="text-center">
            <div className="font-black text-base text-gray-900 leading-tight truncate">{first.participantName}</div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 mt-0.5">
              <MapPin className="h-2.5 w-2.5" />{first.participantCity}
            </div>
          </div>
          <div className="w-full rounded-t-2xl bg-gradient-to-b from-amber-400 to-yellow-500 flex flex-col items-center justify-center py-5 px-2 shadow-xl" style={{ height: 110 }}>
            <div className="text-4xl font-black text-white drop-shadow-lg">{first.totalPoints}</div>
            <div className="text-[9px] text-yellow-100 font-bold">pontos</div>
            {first.championTeamName && (
              <div className="mt-1 text-[9px] text-yellow-100 font-semibold truncate max-w-full px-1">
                🏆 {first.championTeamName}
              </div>
            )}
          </div>
          <div className="w-full bg-amber-500 rounded-b-xl h-2" />
        </div>

        {/* 3º Lugar */}
        <div className="flex flex-col items-center gap-2 w-28">
          {third ? (
            <>
              <div className="text-4xl">🥉</div>
              <div className="text-center">
                <div className="font-black text-sm text-gray-800 leading-tight truncate">{third.participantName}</div>
                <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 mt-0.5">
                  <MapPin className="h-2.5 w-2.5" />{third.participantCity}
                </div>
              </div>
              <div className="w-full rounded-t-2xl bg-gradient-to-b from-amber-600 to-amber-700 flex flex-col items-center justify-center py-3 px-2 shadow-md" style={{ height: 60 }}>
                <div className="text-2xl font-black text-white drop-shadow">{third.totalPoints}</div>
                <div className="text-[9px] text-amber-100 font-bold">pontos</div>
              </div>
            </>
          ) : (
            <div className="w-full rounded-t-2xl bg-amber-100 flex items-center justify-center py-3" style={{ height: 60 }}>
              <span className="text-[10px] text-amber-400 italic">—</span>
            </div>
          )}
          <div className="w-full bg-amber-700 rounded-b-xl h-2" />
        </div>

      </div>

      {/* Legenda */}
      <div className="flex justify-center gap-4 text-[10px] text-gray-400 mt-1">
        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> 🎯 = Placar exato</span>
        <span>✅ = Vencedor certo</span>
      </div>
    </div>
  );
}
