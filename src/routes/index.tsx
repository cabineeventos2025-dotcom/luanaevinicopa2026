import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useWorldCupData } from "@/lib/worldcup/useWorldCupData";
import { OfficialBracketView } from "@/components/worldcup/OfficialBracketView";
import { GroupStandings } from "@/components/worldcup/GroupStandings";
import { TeamSearch } from "@/components/worldcup/TeamSearch";
import { SimulatorView } from "@/components/simulator/SimulatorView";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { YouTubeButton } from "@/components/common/YouTubeButton";
import { SimulatorProvider } from "@/contexts/SimulatorContext";
import type { TabKey } from "@/types/navigation";
import {
  Trophy,
  Calendar,
  Flag,
  RefreshCw,
  CircleAlert,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function formatDateTime(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HomePage() {
  const { data, source, warning, loading, refreshing, lastUpdated, refresh } = useWorldCupData();
  const [tab, setTab] = useState<TabKey>("overview");
  const [showAdmin, setShowAdmin] = useState(false);

  const stats = useMemo(() => {
    if (!data) return { total: 0, finished: 0, upcoming: 0, next: [] as any[] };
    const total = data.teams.length;
    const finished = data.matches.filter((m) => m.status === "finished").length;
    const upcoming = data.matches.filter(
      (m) => m.status === "scheduled" && m.homeTeam && m.awayTeam,
    );
    return { total, finished, upcoming: upcoming.length, next: upcoming.slice(0, 4) };
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50/30 to-white text-gray-900">
      <Toaster richColors position="top-center" />
      <Header />

      <main className="container mx-auto px-4 pb-20 max-w-6xl">
        {/* Hero */}
        <section className="py-8 sm:py-10">
          <div className="rounded-3xl bg-white border-2 border-amber-200 shadow-lg p-6 sm:p-8 overflow-hidden relative">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-8 -right-8 text-[120px] opacity-5 select-none">⚽</div>
              <div className="absolute -bottom-8 -left-8 text-[100px] opacity-5 select-none">🏆</div>
            </div>

            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div className="min-w-0">
                  {/* Logo + Channel */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest text-amber-600">
                        Luana Queiroz e Família
                      </div>
                      <div className="text-xs text-gray-400">Copa do Mundo 2026</div>
                    </div>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight mb-2">
                    <span className="text-amber-500">Palpite</span> da Copa{" "}
                    <span className="text-green-600">2026</span> 🏆
                  </h1>
                  <p className="text-base text-gray-500 max-w-prose">
                    Simule o chaveamento, faça seus palpites e compita com a família toda!
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={refresh}
                    disabled={refreshing}
                    id="hero-refresh-btn"
                    className="flex items-center gap-2 rounded-xl bg-green-500 text-white px-4 py-2.5 text-sm font-bold hover:bg-green-600 disabled:opacity-60 transition-all shadow-md"
                  >
                    <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                    <span className="hidden sm:inline">Atualizar agora</span>
                  </button>
                  <YouTubeButton variant="pill" />
                </div>
              </div>

              {/* Status bar */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {source === "football-data.org" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 font-bold text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Dados via football-data.org
                  </span>
                ) : source === "mock" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-700">
                    <CircleAlert className="h-3.5 w-3.5" /> Dados demonstrativos
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 font-bold text-blue-700">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Buscando dados reais…
                  </span>
                )}
                <span className="text-gray-400">
                  Última atualização: {formatDateTime(lastUpdated)}
                </span>
                {warning && (
                  <span className="text-gray-400 italic">• {warning}</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Loading state */}
        {loading || !data ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            <span className="font-semibold">Buscando dados reais…</span>
          </div>
        ) : (
          <>
            {/* ═══ BANNER CTA PALPITAR — sempre visível acima das abas ═══ */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-5 text-white shadow-2xl mb-4">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/5" />
              <div className="absolute -bottom-3 -left-3 h-16 w-16 rounded-full bg-yellow-400/10" />
              <div className="relative flex flex-col sm:flex-row items-center gap-4">
                <div className="text-5xl flex-shrink-0">⚽🏆</div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-lg sm:text-xl font-black leading-tight mb-1">
                    Monte seu Palpite da Copa!
                  </h2>
                  <p className="text-green-100 text-sm mb-1">
                    Escolha os vencedores de cada jogo, descubra seu campeão e entre para o
                    <span className="font-black text-yellow-300"> Ranking da Família!</span>
                  </p>
                  <p className="text-green-200 text-xs">
                    🎯 Jogos já finalizados são mostrados automaticamente • 🔮 Os próximos são seu palpite!
                  </p>
                </div>
                <button
                  onClick={() => setTab("sim")}
                  id="home-cta-palpitar-btn"
                  className="flex-shrink-0 flex items-center gap-2 rounded-2xl bg-yellow-400 px-6 py-3 text-base font-black text-green-900 hover:bg-yellow-300 transition-all hover:scale-105 shadow-xl whitespace-nowrap"
                >
                  ✨ Quero Palpitar!
                </button>
              </div>
            </div>

            <Navigation tab={tab} setTab={setTab} />

            {/* Overview */}
            {tab === "overview" && (
              <div className="space-y-6">


                {/* Stats */}
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Seleções"
                    value={stats.total}
                    icon={<Flag className="h-5 w-5 text-blue-500" />}
                    accent="bg-blue-50 border-blue-200"
                    valueColor="text-blue-700"
                  />
                  <StatCard
                    label="Finalizados"
                    value={stats.finished}
                    icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                    accent="bg-green-50 border-green-200"
                    valueColor="text-green-700"
                  />
                  <StatCard
                    label="Próximos"
                    value={stats.upcoming}
                    icon={<Calendar className="h-5 w-5 text-amber-500" />}
                    accent="bg-amber-50 border-amber-200"
                    valueColor="text-amber-700"
                  />
                  <StatCard
                    label="Campeão"
                    value={
                      data.champion ? (
                        <span className="flex items-center gap-2">
                          <img
                            src={data.champion.flagUrl}
                            alt=""
                            className="h-5 w-7 rounded-sm object-cover shadow-sm"
                          />
                          <span className="truncate">{data.champion.name}</span>
                        </span>
                      ) : (
                        "A definir"
                      )
                    }
                    icon={<Trophy className="h-5 w-5 text-yellow-500" />}
                    accent="bg-yellow-50 border-yellow-200"
                    valueColor="text-yellow-700"
                  />
                </div>

                {/* Next matches */}
                {stats.next.length > 0 && (
                  <section>
                    <SectionHeader
                      title="Próximos jogos"
                      icon={<Calendar className="h-5 w-5" />}
                    />
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {stats.next.map((m) => (
                        <OverviewMatchCard key={m.id} match={m} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Bracket preview */}
                <section>
                  <SectionHeader title="Chaveamento oficial" icon={<Trophy className="h-5 w-5" />} />
                  <OfficialBracketView bracket={data.bracket} />
                </section>

                {/* Simulator CTA */}
                <div className="rounded-3xl bg-gradient-to-r from-amber-400 to-yellow-400 p-6 sm:p-8 text-center shadow-xl">
                  <div className="text-5xl mb-3">✨</div>
                  <h2 className="text-2xl font-black text-white mb-2">
                    Monte seu Palpite da Copa!
                  </h2>
                  <p className="text-amber-100 mb-5 max-w-md mx-auto">
                    Escolha os vencedores, informe os placares e gere seu PDF para compartilhar com a família.
                  </p>
                  <button
                    onClick={() => setTab("sim")}
                    id="overview-go-to-simulator-btn"
                    className="rounded-2xl bg-white px-8 py-3.5 text-base font-black text-amber-600 hover:bg-amber-50 transition-all shadow-lg hover:scale-105 active:scale-95"
                  >
                    ⚽ Ir para o Simulador
                  </button>
                </div>
              </div>
            )}


            {/* Groups */}
            {tab === "groups" && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-white border border-amber-200 p-4 text-center shadow-sm">
                  <p className="text-sm text-gray-500">
                    📊 Classificação dos grupos da Copa do Mundo 2026.
                  </p>
                </div>
                <GroupStandings groups={data.groups} />
              </div>
            )}

            {/* Official Bracket */}
            {tab === "bracket" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white border border-amber-200 p-4 shadow-sm">
                  <h2 className="font-black text-xl text-gray-900 mb-1">Chaveamento Oficial</h2>
                  <p className="text-sm text-gray-500">
                    Este é o chaveamento oficial com os dados reais. Não é afetado pelo simulador.
                  </p>
                </div>
                <OfficialBracketView matches={data.matches} />
              </div>
            )}

            {/* Simulator */}
            {tab === "sim" && (
              <SimulatorProvider>
                <SimulatorView realData={data} />
              </SimulatorProvider>
            )}

            {/* Teams */}
            {tab === "teams" && <TeamSearch data={data} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/60 bg-white/80 backdrop-blur py-8 text-center">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <YouTubeButton variant="compact" />
            <a
              href="/ranking"
              className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors"
            >
              🥇 Ranking da Família
            </a>
            <a
              href="/regulamento"
              className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
            >
              📜 Regulamento
            </a>
          </div>
          <p className="text-xs text-gray-400">
            Palpite da Copa 2026 • Luana Queiroz e Família •{" "}
            {source === "football-data.org" ? "Dados via football-data.org" : "Dados demonstrativos"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Esta é uma brincadeira familiar. Não envolve pagamento ou qualquer valor financeiro.
          </p>
          <button
            onClick={() => setShowAdmin(true)}
            className="mt-3 text-[10px] text-gray-300 hover:text-amber-500 transition-colors"
            id="footer-admin-btn"
          >
            ⚙️ Atualizar placares
          </button>
        </div>
      </footer>

      {/* Admin Panel Modal */}
      {showAdmin && (
        <AdminPanel
          onClose={() => setShowAdmin(false)}
          onScoresUpdated={() => { refresh(); }}
        />
      )}
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-amber-500">{icon}</span>
      <h2 className="text-2xl font-black text-gray-900">{title}</h2>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  valueColor,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accent: string;
  valueColor: string;
}) {
  return (
    <div className={cn("rounded-2xl border-2 bg-white p-4 shadow-sm", accent)}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</div>
      </div>
      <div className={cn("text-2xl font-black leading-none truncate", valueColor)}>{value}</div>
    </div>
  );
}

function OverviewMatchCard({ match }: { match: any }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <TeamRowMini
          team={match.homeTeam}
          score={match.homeScore}
          isWinner={match.winner === match.homeTeam?.id}
        />
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[10px] font-black text-gray-300">vs</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <TeamRowMini
          team={match.awayTeam}
          score={match.awayScore}
          isWinner={match.winner === match.awayTeam?.id}
        />
      </div>
      {match.date && (
        <div className="mt-2 text-[10px] text-gray-400 text-right font-semibold">
          {new Date(match.date).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </div>
  );
}

function TeamRowMini({
  team,
  score,
  isWinner,
}: {
  team: any;
  score: number | null;
  isWinner: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-2", isWinner && "font-black")}>
      <div className="flex items-center gap-1.5 min-w-0">
        {team?.flagUrl && (
          <img
            src={team.flagUrl}
            alt={team?.name}
            className="h-4 w-6 object-cover rounded-sm shadow-sm"
          />
        )}
        <span className={cn("text-xs truncate", isWinner ? "text-green-700" : "text-gray-700")}>
          {team?.name ?? "A definir"}
        </span>
      </div>
      <span className={cn("text-sm shrink-0", isWinner ? "text-green-700 font-black" : "text-gray-500")}>
        {score ?? "–"}
      </span>
    </div>
  );
}
