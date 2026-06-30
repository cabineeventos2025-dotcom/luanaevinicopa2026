import { useMemo, useState } from "react";
import type { WorldCupData } from "@/lib/worldcup/types";
import { getTeamPath } from "@/lib/worldcup/bracketEngine";
import { MatchCard } from "./MatchCard";
import { Search, Trophy } from "lucide-react";

export function TeamSearch({ data }: { data: WorldCupData }) {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!q) return data.teams.slice(0, 12);
    return data.teams.filter((t) => t.name.toLowerCase().includes(q.toLowerCase())).slice(0, 20);
  }, [q, data.teams]);

  const selected = selectedId ? data.teams.find((t) => t.id === selectedId) : null;
  const path = selected ? getTeamPath(selected.id, data.matches) : [];
  const eliminated = selected && path.some((m) => m.status === "finished" && m.winner && m.winner !== selected.id);
  const isChampion = data.champion?.id === selected?.id;

  return (
    <div className="space-y-4">
      <div className="card-glass p-3 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar seleção…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filtered.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            className={`chip border ${selectedId === t.id ? "bg-brand-green/20 border-brand-green text-foreground" : "bg-card border-border hover:border-brand-green/60"}`}
          >
            <img src={t.flagUrl} alt="" className="h-3 w-4 rounded-sm object-cover" />
            {t.name}
          </button>
        ))}
      </div>

      {selected && (
        <div className="card-glass p-4 space-y-3">
          <div className="flex items-center gap-3">
            <img src={selected.flagUrl} alt="" className="h-10 w-14 rounded object-cover ring-1 ring-border" />
            <div className="min-w-0">
              <h3 className="font-display text-2xl truncate">{selected.name}</h3>
              <div className="text-xs text-muted-foreground">
                {selected.group ? `Grupo ${selected.group}` : "—"}
                {selected.points != null && ` • ${selected.points} pts`}
              </div>
            </div>
            <div className="ml-auto">
              {isChampion ? (
                <span className="chip bg-brand-yellow/20 text-brand-yellow"><Trophy className="h-3 w-3" /> Campeão</span>
              ) : eliminated ? (
                <span className="chip bg-destructive/15 text-destructive">Eliminada</span>
              ) : (
                <span className="chip bg-brand-green/15 text-brand-green">Em disputa</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Caminho até a final</h4>
            {path.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem jogos de mata-mata ainda.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {path.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
