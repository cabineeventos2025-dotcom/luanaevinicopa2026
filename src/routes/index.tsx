import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useWorldCupData } from "@/lib/worldcup/useWorldCupData";
import { BracketView } from "@/components/worldcup/BracketView";
import { GroupStandings } from "@/components/worldcup/GroupStandings";
import { TeamSearch } from "@/components/worldcup/TeamSearch";
import { SimulationMode } from "@/components/worldcup/SimulationMode";
import { MatchCard } from "@/components/worldcup/MatchCard";
import { Trophy, Calendar, Flag, RefreshCw, Share2, CircleAlert, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chaveamento Copa do Mundo — Acompanhe em tempo real" },
      { name: "description", content: "Acompanhe o chaveamento da Copa do Mundo: grupos, mata-mata, classificados, próximos jogos e simulador." },
      { property: "og:title", content: "Chaveamento Copa do Mundo" },
      { property: "og:description", content: "Acompanhe em tempo real o caminho das seleções até a final." },
    ],
  }),
  component: HomePage,
});

type TabKey = "overview" | "groups" | "bracket" | "sim" | "teams";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "overview", label: "Visão Geral" },
  { key: "groups", label: "Grupos" },
  { key: "bracket", label: "Chaveamento" },
  { key: "sim", label: "Simulador" },
  { key: "teams", label: "Seleções" },
];

function formatDateTime(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function HomePage() {
  const { data, source, warning, loading, refreshing, lastUpdated, refresh } = useWorldCupData();
  const [tab, setTab] = useState<TabKey>("overview");

  const stats = useMemo(() => {
    if (!data) return { total: 0, finished: 0, upcoming: 0, next: [] as typeof data extends null ? never : any[] };
    const total = data.teams.length;
    const finished = data.matches.filter((m) => m.status === "finished").length;
    const upcoming = data.matches.filter((m) => m.status === "scheduled" && m.homeTeam && m.awayTeam);
    return { total, finished, upcoming: upcoming.length, next: upcoming.slice(0, 4) };
  }, [data]);

  const share = async () => {
    const text = "Veja o chaveamento atualizado da Copa do Mundo";
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try { await navigator.share({ title: "Chaveamento Copa do Mundo", text, url }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(`${text}: ${url}`); toast.success("Link copiado!"); }
    catch { toast.error("Falha ao compartilhar"); }
  };

  return (
    <div className="min-h-screen text-foreground">
      <Toaster richColors theme="dark" position="top-center" />
      <Header onShare={share} />

      <main className="container mx-auto px-4 pb-16 max-w-6xl">
        <Hero refreshing={refreshing} onRefresh={refresh} lastUpdated={lastUpdated} source={source} warning={warning} />

        {loading || !data ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando dados…
          </div>
        ) : (
          <>
            <Tabs tab={tab} setTab={setTab} />

            {tab === "overview" && (
              <div className="space-y-6">
                <DashboardSummary
                  total={stats.total}
                  finished={stats.finished}
                  upcoming={stats.upcoming}
                  champion={data.champion}
                  lastUpdated={lastUpdated}
                />
                <section>
                  <SectionHeader title="Próximos jogos" icon={<Calendar className="h-4 w-4" />} />
                  {stats.next.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sem jogos agendados.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {stats.next.map((m) => <MatchCard key={m.id} match={m} />)}
                    </div>
                  )}
                </section>
                <section>
                  <SectionHeader title="Chaveamento" icon={<Trophy className="h-4 w-4" />} />
                  <BracketView bracket={data.bracket} />
                </section>
              </div>
            )}
            {tab === "groups" && <GroupStandings groups={data.groups} />}
            {tab === "bracket" && (
              <div>
                <p className="text-sm text-muted-foreground mb-4">O vencedor avança automaticamente para a próxima fase.</p>
                <BracketView bracket={data.bracket} />
              </div>
            )}
            {tab === "sim" && <SimulationMode realData={data} />}
            {tab === "teams" && <TeamSearch data={data} />}
          </>
        )}
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Chaveamento Copa do Mundo • Dados {source === "football-data.org" ? "via football-data.org" : "demonstrativos"}
      </footer>
    </div>
  );
}

function Header({ onShare }: { onShare: () => void }) {
  return (
    <header className="border-b border-border/60 bg-background/60 backdrop-blur sticky top-0 z-20">
      <div className="container mx-auto px-4 max-w-6xl py-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-green via-brand-yellow to-brand-blue">
            <Trophy className="h-5 w-5 text-background" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-lg sm:text-xl leading-tight truncate">Chaveamento Copa do Mundo</div>
            <div className="text-[11px] text-muted-foreground truncate">Acompanhe em tempo real o caminho até a final</div>
          </div>
        </div>
        <button onClick={onShare} className="chip bg-brand-blue/15 text-brand-blue hover:bg-brand-blue/25">
          <Share2 className="h-3 w-3" /> Compartilhar
        </button>
      </div>
    </header>
  );
}

function Hero({
  refreshing, onRefresh, lastUpdated, source, warning,
}: {
  refreshing: boolean; onRefresh: () => void; lastUpdated: Date | null;
  source: "football-data.org" | "api-football" | "mock"; warning?: string;
}) {
  return (
    <section className="py-6 sm:py-10">
      <div className="card-glass p-5 sm:p-7">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-start sm:items-center">
          <div className="min-w-0">
            <span className="chip bg-brand-green/15 text-brand-green mb-2">Edição 2026</span>
            <h1 className="font-display text-3xl sm:text-5xl leading-none">
              O <span className="text-brand-yellow">caminho</span> até a <span className="text-brand-green">taça</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-prose">
              Grupos, mata-mata e simulador num só lugar. O chaveamento atualiza automaticamente assim que cada jogo termina.
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-brand-green text-primary-foreground px-3 py-2 text-sm font-semibold hover:bg-brand-green/90 disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            <span className="hidden sm:inline">Atualizar agora</span>
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {source === "football-data.org" ? (
            <span className="chip bg-brand-green/15 text-brand-green"><CheckCircle2 className="h-3 w-3" /> Dados via football-data.org</span>
          ) : (
            <span className="chip bg-brand-yellow/15 text-brand-yellow"><CircleAlert className="h-3 w-3" /> Dados demonstrativos</span>
          )}
          <span className="text-muted-foreground">Última atualização: {formatDateTime(lastUpdated)}</span>
          {warning && <span className="text-muted-foreground italic">• {warning}</span>}
        </div>
      </div>
    </section>
  );
}

function Tabs({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  return (
    <div className="mb-6 overflow-x-auto -mx-4 px-4">
      <div className="inline-flex gap-1 p-1 rounded-xl bg-card border border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap",
              tab === t.key
                ? "bg-brand-green text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="text-brand-yellow">{icon}</span>}
      <h2 className="font-display text-2xl">{title}</h2>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: React.ReactNode; icon: React.ReactNode; accent: string }) {
  return (
    <div className="card-glass p-4 flex items-center gap-3">
      <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", accent)}>{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="font-display text-2xl leading-none truncate">{value}</div>
      </div>
    </div>
  );
}

function DashboardSummary({
  total, finished, upcoming, champion, lastUpdated,
}: {
  total: number; finished: number; upcoming: number;
  champion?: { name: string; flagUrl: string } | null; lastUpdated: Date | null;
}) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      <StatCard label="Seleções" value={total} icon={<Flag className="h-5 w-5 text-brand-blue" />} accent="bg-brand-blue/15" />
      <StatCard label="Finalizados" value={finished} icon={<CheckCircle2 className="h-5 w-5 text-brand-green" />} accent="bg-brand-green/15" />
      <StatCard label="Próximos" value={upcoming} icon={<Calendar className="h-5 w-5 text-brand-yellow" />} accent="bg-brand-yellow/15" />
      <StatCard
        label="Campeão"
        value={champion ? (
          <span className="flex items-center gap-2">
            <img src={champion.flagUrl} alt="" className="h-5 w-7 rounded-sm object-cover" />
            <span className="truncate">{champion.name}</span>
          </span>
        ) : "A definir"}
        icon={<Trophy className="h-5 w-5 text-brand-yellow" />}
        accent="bg-brand-yellow/15"
      />
    </div>
  );
}
