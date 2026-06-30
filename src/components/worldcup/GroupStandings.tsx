import type { GroupStanding } from "@/lib/worldcup/types";
import { cn } from "@/lib/utils";

export function GroupStandings({ groups }: { groups: GroupStanding[] }) {
  if (!groups.length) {
    return <div className="text-center text-muted-foreground py-12">Sem dados de grupos.</div>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {groups.map((g) => (
        <div key={g.group} className="card-glass p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-xl">Grupo {g.group}</h3>
            <span className="chip bg-brand-blue/15 text-brand-blue">Top 2 avançam</span>
          </div>
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="text-left text-[10px] uppercase tracking-wider">
                <th className="font-medium pb-1 w-6">#</th>
                <th className="font-medium pb-1">Seleção</th>
                <th className="font-medium pb-1 text-center">J</th>
                <th className="font-medium pb-1 text-center">SG</th>
                <th className="font-medium pb-1 text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {g.teams.map((t, i) => {
                const qualified = i < 2;
                return (
                  <tr key={t.id} className="border-t border-border/60">
                    <td className="py-1.5">
                      <span className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold",
                        qualified ? "bg-brand-green text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}>{i + 1}</span>
                    </td>
                    <td className="py-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={t.flagUrl} alt="" className="h-4 w-6 rounded-sm object-cover ring-1 ring-border" />
                        <span className="truncate font-medium">{t.name}</span>
                      </div>
                    </td>
                    <td className="py-1.5 text-center tabular-nums">{t.played ?? 0}</td>
                    <td className="py-1.5 text-center tabular-nums">{(t.goalDifference ?? 0) > 0 ? `+${t.goalDifference}` : t.goalDifference ?? 0}</td>
                    <td className="py-1.5 text-center tabular-nums font-bold">{t.points ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
