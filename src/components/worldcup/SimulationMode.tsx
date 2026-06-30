import { useEffect, useState } from "react";
import type { WorldCupData } from "@/lib/worldcup/types";
import { processWorldCupData, simulateWinner } from "@/lib/worldcup/bracketEngine";
import { BracketView } from "./BracketView";
import { RotateCcw, Share2, Database } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "wc-simulation-v1";

export function SimulationMode({ realData }: { realData: WorldCupData }) {
  const [sim, setSim] = useState<WorldCupData>(realData);

  // load from storage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const stored = JSON.parse(raw);
        setSim(processWorldCupData(stored));
        return;
      } catch {}
    }
    setSim(realData);
  }, [realData]);

  const persist = (next: WorldCupData) => {
    setSim(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const pick = (matchId: string, slot: "home" | "away") => {
    const newMatches = simulateWinner(sim.matches, matchId, slot);
    const next = processWorldCupData({ ...sim, matches: newMatches });
    persist(next);
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSim(realData);
    toast.success("Simulação resetada");
  };

  const useReal = () => {
    persist(realData);
    toast.success("Usando dados reais como base");
  };

  const share = async () => {
    const text = sim.champion
      ? `Minha previsão para a Copa do Mundo: ${sim.champion.name} é o campeão! 🏆`
      : `Confira minha previsão da Copa do Mundo`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try { await navigator.share({ title: "Chaveamento Copa do Mundo", text, url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success("Link copiado para a área de transferência");
    } catch {
      toast.error("Não foi possível compartilhar");
    }
  };

  return (
    <div className="space-y-4">
      <div className="card-glass p-4 flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl">Simulador</h3>
          <p className="text-sm text-muted-foreground">Clique numa seleção para escolher o vencedor de cada confronto.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={useReal} className="chip bg-brand-blue/15 text-brand-blue hover:bg-brand-blue/25">
            <Database className="h-3 w-3" /> Usar dados reais
          </button>
          <button onClick={reset} className="chip bg-muted hover:bg-secondary">
            <RotateCcw className="h-3 w-3" /> Resetar
          </button>
          <button onClick={share} className="chip bg-brand-green/15 text-brand-green hover:bg-brand-green/25">
            <Share2 className="h-3 w-3" /> Compartilhar
          </button>
        </div>
      </div>

      {sim.champion && (
        <div className="card-glass card-glow-green p-4 flex items-center gap-3">
          <img src={sim.champion.flagUrl} alt="" className="h-10 w-14 rounded object-cover" />
          <div>
            <div className="text-xs uppercase tracking-widest text-brand-yellow">Campeão simulado</div>
            <div className="font-display text-2xl">{sim.champion.name}</div>
          </div>
        </div>
      )}

      <BracketView bracket={sim.bracket} onPickWinner={pick} />
    </div>
  );
}
