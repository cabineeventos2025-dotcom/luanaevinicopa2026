import type { BracketRound, Match } from "@/lib/worldcup/types";
import { MatchCard } from "./MatchCard";

export function BracketView({
  bracket,
  onPickWinner,
}: {
  bracket: BracketRound[];
  onPickWinner?: (matchId: string, slot: "home" | "away") => void;
}) {
  if (!bracket.length) {
    return <div className="text-center text-muted-foreground py-12">Chaveamento ainda não disponível.</div>;
  }
  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4">
      <div className="flex gap-4 min-w-max">
        {bracket.map((round) => (
          <div key={round.id} className="w-[260px] shrink-0">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow" />
              <h3 className="text-sm font-display uppercase tracking-widest text-foreground">{round.name}</h3>
            </div>
            <div className="flex flex-col gap-3">
              {round.matches.map((m: Match) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  onPickWinner={onPickWinner ? (slot) => onPickWinner(m.id, slot) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
