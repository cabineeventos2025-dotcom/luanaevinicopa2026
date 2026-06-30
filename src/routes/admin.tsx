import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getRankingRepository } from "@/repositories";
import type { Prediction } from "@/types/prediction";
import { Search, CheckCircle, Lock, Eye, EyeOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = ADMIN_PASSWORD || "admin2026";
    if (password === correct) {
      setAuthed(true);
      setAuthError("");
    } else {
      setAuthError("Senha incorreta. Tente novamente.");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-4">
        <Toaster richColors position="top-center" />
        <div className="w-full max-w-sm">
          <div className="rounded-3xl bg-white border border-amber-200 shadow-xl p-8 text-center">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Painel Admin</h1>
            <p className="text-sm text-gray-500 mb-6">
              Desafio da Copa — Luana Queiroz e Família
            </p>
            <form onSubmit={handleLogin} className="space-y-4" id="admin-login-form">
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  id="admin-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha de acesso"
                  className={cn(
                    "w-full rounded-xl border-2 px-4 py-3 pr-12 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400",
                    authError ? "border-red-400" : "border-gray-200",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {authError && <p className="text-xs text-red-500 font-semibold">{authError}</p>}
              <button
                type="submit"
                id="admin-login-btn"
                className="w-full rounded-xl bg-amber-500 py-3 text-sm font-black text-white hover:bg-amber-600 transition-colors"
              >
                <Lock className="inline h-4 w-4 mr-2" />
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "checked" | "unchecked">("all");

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const repo = getRankingRepository();
      const all = await repo.loadAllPredictions();
      setPredictions(all);
    } catch (e) {
      console.error("[AdminDashboard]", e);
      toast.error("Erro ao carregar palpites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  const filtered = predictions.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.participant.name.toLowerCase().includes(q) ||
      p.participant.city.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q);
    const matchesFilter =
      filter === "all" ||
      (filter === "checked" && p.channelSubscriptionChecked) ||
      (filter === "unchecked" && !p.channelSubscriptionChecked);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-center" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">🎛️ Painel Admin</h1>
            <p className="text-xs text-gray-500">Desafio da Copa 2026</p>
          </div>
          <button
            onClick={loadPredictions}
            disabled={loading}
            id="admin-refresh-btn"
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white border border-gray-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-black text-gray-900">{predictions.length}</div>
            <div className="text-xs text-gray-500">Total de palpites</div>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-black text-green-600">
              {predictions.filter((p) => p.channelSubscriptionChecked).length}
            </div>
            <div className="text-xs text-gray-500">Inscrições conferidas</div>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-black text-amber-600">
              {predictions.filter((p) => !p.channelSubscriptionChecked).length}
            </div>
            <div className="text-xs text-gray-500">Pendentes</div>
          </div>
        </div>

        {/* Warning about manual validation */}
        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
          <strong>ℹ️ Validação manual da inscrição no canal.</strong> Verifique no YouTube se o
          participante está de fato inscrito antes de marcar como conferido.
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              id="admin-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, cidade ou código..."
              className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "checked", "unchecked"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-bold transition-colors",
                  filter === f
                    ? "bg-amber-500 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
                )}
              >
                {f === "all" ? "Todos" : f === "checked" ? "✅ Conferidos" : "⏳ Pendentes"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-semibold">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-semibold">
            Nenhum palpite encontrado.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <AdminPredictionRow key={p.code} prediction={p} onUpdate={loadPredictions} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPredictionRow({
  prediction: p,
  onUpdate,
}: {
  prediction: Prediction;
  onUpdate: () => void;
}) {
  const [marking, setMarking] = useState(false);

  const handleMarkChecked = async () => {
    setMarking(true);
    try {
      // Since we don't have update in the repository interface,
      // we update the prediction and save it
      const repo = getRankingRepository();
      const updated = { ...p, channelSubscriptionChecked: true };
      await repo.savePrediction(updated);
      toast.success(`Inscrição de ${p.participant.name} marcada como conferida!`);
      onUpdate();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao marcar inscrição.");
    } finally {
      setMarking(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm",
        p.channelSubscriptionChecked ? "border-green-200" : "border-gray-200",
      )}
      id={`admin-row-${p.code}`}
    >
      <div className="flex items-start gap-4 flex-wrap">
        {/* Info */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-gray-900">{p.participant.name}</span>
            <span className="text-xs text-gray-400">— {p.participant.city}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span>
              🏷️ <code className="font-mono font-bold text-amber-700">{p.code}</code>
            </span>
            {p.championTeamName && <span>🏆 {p.championTeamName}</span>}
            <span>📅 {p.createdAtBrazil}</span>
            <span className="font-bold text-amber-600">{p.totalPoints} pts</span>
          </div>
        </div>

        {/* Subscription status */}
        <div className="flex items-center gap-2 shrink-0">
          {p.channelSubscriptionChecked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
              <CheckCircle className="h-3.5 w-3.5" />
              Inscrição conferida
            </span>
          ) : (
            <button
              onClick={handleMarkChecked}
              disabled={marking}
              id={`admin-check-${p.code}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-200 disabled:opacity-60 transition-colors"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {marking ? "Salvando..." : "Marcar inscrição"}
            </button>
          )}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              p.channelSubscribedConfirmed
                ? "bg-green-50 text-green-600"
                : "bg-gray-100 text-gray-500",
            )}
          >
            {p.channelSubscribedConfirmed ? "Confirmou" : "Não confirmou"}
          </span>
        </div>
      </div>
    </div>
  );
}
