/**
 * AdminPanel — Atualização de placares dos jogos em tempo real
 * Acesso via botão oculto no rodapé ou URL ?admin=1
 * Placares salvos em localStorage e mesclados com os dados da Copa
 */

import { useState, useEffect } from "react";
import { X, Lock, Save, RefreshCw, CheckCircle, Clock, Trophy, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type AdminScore,
  loadAdminScores,
  saveAdminScores,
} from "@/utils/adminScores";
import { saveMatchResult } from "@/services/matchResultsService";

export type { AdminScore };

const ADMIN_PIN = "copa2026";

// Dados dos jogos para o painel (id → nomes dos times)
const MATCH_LABELS: Record<string, { home: string; away: string; date: string; flag?: boolean }> = {
  "r32-01": { home: "África do Sul", away: "Canadá",       date: "28/06 19h" },
  "r32-04": { home: "Países Baixos", away: "Marrocos",      date: "29/06 19h" },
  "r32-03": { home: "Alemanha",      away: "Paraguai",      date: "29/06 19h" },
  "r32-05": { home: "França",        away: "Suécia",        date: "30/06 18h" },
  "r32-02": { home: "Brasil",        away: "Japão",         date: "29/06 19h" },
  "r32-06": { home: "Costa do Marfim", away: "Noruega",     date: "30/06 14h" },
  "r32-07": { home: "México",        away: "Equador",       date: "30/06 22h" },
  "r32-08": { home: "Espanha",       away: "Áustria",       date: "02/07 16h" },
  "r32-09": { home: "Inglaterra",    away: "DR Congo",      date: "01/07 13h" },
  "r32-10": { home: "Bélgica",       away: "Senegal",       date: "01/07 17h" },
  "r32-11": { home: "EUA",           away: "Bósnia-Herz.",  date: "01/07 21h" },
  "r32-12": { home: "Portugal",      away: "Croácia",       date: "02/07 20h" },
  "r32-13": { home: "Suíça",         away: "Argélia",       date: "03/07 00h" },
  "r32-14": { home: "Austrália",     away: "Egito",         date: "03/07 15h" },
  "r32-15": { home: "Argentina",     away: "Cabo Verde",    date: "03/07 19h" },
  "r32-16": { home: "Colômbia",      away: "Gana",          date: "03/07 22h30" },
  "r16-01": { home: "Venc. r32-01",  away: "Venc. r32-04",  date: "04/07 14h" },
  "r16-02": { home: "Venc. r32-03",  away: "Venc. r32-05",  date: "04/07 18h" },
  "r16-03": { home: "Venc. r32-02",  away: "Venc. r32-06",  date: "05/07 17h" },
  "r16-04": { home: "Venc. r32-07",  away: "Venc. r32-08",  date: "05/07 21h" },
  "r16-05": { home: "Venc. r32-09",  away: "Venc. r32-10",  date: "07/07 14h" },
  "r16-06": { home: "Venc. r32-11",  away: "Venc. r32-12",  date: "07/07 18h" },
  "r16-07": { home: "Venc. r32-13",  away: "Venc. r32-14",  date: "08/07 15h" },
  "r16-08": { home: "Venc. r32-15",  away: "Venc. r32-16",  date: "08/07 19h" },
  "qf-01":  { home: "Venc. r16-01",  away: "Venc. r16-02",  date: "09/07" },
  "qf-02":  { home: "Venc. r16-03",  away: "Venc. r16-04",  date: "10/07" },
  "qf-03":  { home: "Venc. r16-05",  away: "Venc. r16-06",  date: "11/07" },
  "qf-04":  { home: "Venc. r16-07",  away: "Venc. r16-08",  date: "12/07" },
  "sf-01":  { home: "Venc. qf-01",   away: "Venc. qf-02",   date: "14/07 16h" },
  "sf-02":  { home: "Venc. qf-03",   away: "Venc. qf-04",   date: "15/07 16h" },
  "3rd":    { home: "Perd. sf-01",   away: "Perd. sf-02",   date: "18/07 16h" },
  "final":  { home: "Venc. sf-01",   away: "Venc. sf-02",   date: "19/07 16h" },
};

const MATCH_ORDER = [
  ["r32-01","r32-04","r32-03","r32-05","r32-02","r32-06","r32-07","r32-08"],
  ["r32-09","r32-10","r32-11","r32-12","r32-13","r32-14","r32-15","r32-16"],
  ["r16-01","r16-02","r16-03","r16-04","r16-05","r16-06","r16-07","r16-08"],
  ["qf-01","qf-02","qf-03","qf-04"],
  ["sf-01","sf-02"],
  ["3rd","final"],
];

const ROUND_NAMES = ["16avos (Lado Esq.)", "16avos (Lado Dir.)", "Oitavas", "Quartas", "Semifinais", "3º Lugar / Final"];

interface MatchRowProps {
  matchId: string;
  existing?: AdminScore;
  onSave: (score: AdminScore) => void;
  onClear: (matchId: string) => void;
}

function MatchRow({ matchId, existing, onSave, onClear }: MatchRowProps) {
  const label = MATCH_LABELS[matchId];
  const [hs, setHs] = useState(existing?.homeScore?.toString() ?? "");
  const [as_, setAs] = useState(existing?.awayScore?.toString() ?? "");
  const [hp, setHp] = useState(existing?.penaltiesHome?.toString() ?? "");
  const [ap, setAp] = useState(existing?.penaltiesAway?.toString() ?? "");
  const [done, setDone] = useState(existing?.done ?? false);
  const [saved, setSaved] = useState(false);

  const isDraw = hs !== "" && as_ !== "" && !isNaN(+hs) && !isNaN(+as_) && +hs === +as_;

  const handleSave = () => {
    const h = parseInt(hs);
    const a = parseInt(as_);
    if (isNaN(h) || isNaN(a)) return;

    const score: AdminScore = {
      matchId,
      homeScore: h,
      awayScore: a,
      done,
      updatedAt: new Date().toISOString(),
    };
    if (hp !== "" && ap !== "") {
      score.penaltiesHome = parseInt(hp);
      score.penaltiesAway = parseInt(ap);
    }
    onSave(score);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!label) return null;

  return (
    <div className={cn(
      "grid grid-cols-12 gap-1.5 items-center py-2 px-3 rounded-xl text-sm",
      existing?.done ? "bg-green-50 border border-green-200" : "bg-white border border-gray-100",
    )}>
      {/* Time + data */}
      <div className="col-span-5">
        <div className="font-bold text-gray-800 text-xs truncate">{label.home}</div>
        <div className="text-[10px] text-gray-400">{label.date}</div>
        <div className="font-semibold text-gray-600 text-xs truncate">{label.away}</div>
      </div>

      {/* Placar */}
      <div className="col-span-3 flex items-center gap-1">
        <input
          type="number" min={0} max={20} value={hs}
          onChange={(e) => setHs(e.target.value)}
          placeholder="—"
          className="w-10 h-7 text-center rounded border border-gray-200 text-sm font-black focus:outline-none focus:border-amber-400"
        />
        <span className="text-gray-400 font-bold">×</span>
        <input
          type="number" min={0} max={20} value={as_}
          onChange={(e) => setAs(e.target.value)}
          placeholder="—"
          className="w-10 h-7 text-center rounded border border-gray-200 text-sm font-black focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Pênaltis (se empate) */}
      <div className="col-span-2">
        {isDraw && (
          <div className="flex items-center gap-0.5">
            <input
              type="number" min={0} max={20} value={hp}
              onChange={(e) => setHp(e.target.value)}
              placeholder="P"
              title="Pênaltis (Casa)"
              className="w-8 h-6 text-center rounded border border-blue-200 text-xs font-bold focus:outline-none"
            />
            <span className="text-[9px] text-gray-300">×</span>
            <input
              type="number" min={0} max={20} value={ap}
              onChange={(e) => setAp(e.target.value)}
              placeholder="P"
              title="Pênaltis (Fora)"
              className="w-8 h-6 text-center rounded border border-blue-200 text-xs font-bold focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="col-span-2 flex items-center gap-1 justify-end">
        <label className="flex items-center gap-0.5 cursor-pointer">
          <input
            type="checkbox" checked={done}
            onChange={(e) => setDone(e.target.checked)}
            className="w-3 h-3 accent-green-500"
          />
          <span className="text-[9px] text-gray-500">FIM</span>
        </label>
        <button
          onClick={handleSave}
          disabled={hs === "" || as_ === ""}
          className={cn(
            "p-1 rounded-lg transition-colors",
            saved ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-700 hover:bg-amber-200",
            (hs === "" || as_ === "") && "opacity-40 cursor-not-allowed",
          )}
          title="Salvar placar"
        >
          {saved ? <CheckCircle className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
        </button>
        {existing && (
          <button
            onClick={() => { onClear(matchId); setHs(""); setAs(""); setHp(""); setAp(""); setDone(false); }}
            className="p-1 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
            title="Limpar placar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

interface Props {
  onClose: () => void;
  onScoresUpdated: () => void;
}

export function AdminPanel({ onClose, onScoresUpdated }: Props) {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [scores, setScores] = useState<AdminScore[]>([]);

  useEffect(() => {
    if (unlocked) setScores(loadAdminScores());
  }, [unlocked]);

  const handleUnlock = () => {
    if (pin === ADMIN_PIN) { setUnlocked(true); setPinError(false); }
    else { setPinError(true); }
  };

  const [supaStatus, setSupaStatus] = useState<"idle"|"saving"|"ok"|"error">("idle");

  const handleSave = async (score: AdminScore) => {
    // 1. Salvar localStorage (fallback offline)
    setScores((prev) => {
      const updated = prev.filter((s) => s.matchId !== score.matchId).concat(score);
      saveAdminScores(updated);
      return updated;
    });

    // 2. Salvar no Supabase (compartilhado — sem deploy)
    setSupaStatus("saving");
    try {
      await saveMatchResult({
        match_id:      score.matchId,
        home_score:    score.homeScore,
        away_score:    score.awayScore,
        penalties_home: score.penaltiesHome ?? null,
        penalties_away: score.penaltiesAway ?? null,
        done:          score.done,
      });
      setSupaStatus("ok");
      setTimeout(() => setSupaStatus("idle"), 3000);
    } catch (e) {
      console.error("[Admin] Supabase falhou:", e);
      setSupaStatus("error");
    }
    onScoresUpdated();
  };

  const handleClear = (matchId: string) => {
    setScores((prev) => {
      const updated = prev.filter((s) => s.matchId !== matchId);
      saveAdminScores(updated);
      onScoresUpdated();
      return updated;
    });
  };

  const handleClearAll = () => {
    if (!confirm("Limpar TODOS os placares do admin?")) return;
    saveAdminScores([]);
    setScores([]);
    onScoresUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-white" />
            <span className="font-black text-white text-base">Atualizar Placares — Admin</span>
          </div>
          <div className="flex items-center gap-2">
            {supaStatus === "saving" && <span className="text-xs text-white/80 animate-pulse">Salvando...</span>}
            {supaStatus === "ok"     && <span className="flex items-center gap-1 text-xs text-white font-bold"><Wifi className="h-3.5 w-3.5"/>Salvo online ✓</span>}
            {supaStatus === "error"  && <span className="flex items-center gap-1 text-xs text-red-100 font-bold"><WifiOff className="h-3.5 w-3.5"/>Erro Supabase</span>}
            <button onClick={onClose} className="p-1.5 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!unlocked ? (
          /* ── PIN ── */
          <div className="flex flex-col items-center justify-center gap-5 p-10">
            <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-black text-gray-800">Área Administrativa</h2>
              <p className="text-sm text-gray-500 mt-1">Digite a senha para acessar</p>
            </div>
            <div className="w-full max-w-xs space-y-3">
              <input
                type="password"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                placeholder="Senha do admin"
                className={cn(
                  "w-full border-2 rounded-xl px-4 py-3 text-center text-lg font-bold tracking-widest focus:outline-none",
                  pinError ? "border-red-400 bg-red-50" : "border-amber-300 focus:border-amber-500",
                )}
                autoFocus
              />
              {pinError && <p className="text-red-500 text-sm text-center">Senha incorreta!</p>}
              <button
                onClick={handleUnlock}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-black hover:from-amber-600 hover:to-yellow-500 transition-all"
              >
                Entrar
              </button>
            </div>
          </div>
        ) : (
          /* ── Painel de placares ── */
          <>
            <div className="flex items-center justify-between px-4 py-2 bg-amber-50 border-b border-amber-100">
              <p className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Placares salvos localmente · atualizam o chaveamento imediatamente
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { onScoresUpdated(); }}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-700 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" /> Recarregar
                </button>
                {scores.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Limpar todos
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-3 space-y-4">
              {MATCH_ORDER.map((group, gi) => (
                <div key={gi}>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1.5 px-1">
                    {ROUND_NAMES[gi]}
                  </div>
                  <div className="space-y-1">
                    {group.map((id) => (
                      <MatchRow
                        key={id}
                        matchId={id}
                        existing={scores.find((s) => s.matchId === id)}
                        onSave={handleSave}
                        onClear={handleClear}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
              <p className="text-[10px] text-gray-400 text-center">
                ✅ = Jogo encerrado. Placares override os dados do código. Senha: <code>copa2026</code>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
