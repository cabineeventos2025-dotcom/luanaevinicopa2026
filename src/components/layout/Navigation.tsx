import { cn } from "@/lib/utils";
import type { TabKey } from "@/types/navigation";

const TABS: Array<{ key: TabKey; label: string; emoji: string }> = [
  { key: "overview", label: "Visão Geral", emoji: "🏠" },
  { key: "groups", label: "Grupos", emoji: "📊" },
  { key: "bracket", label: "Chaveamento", emoji: "🏆" },
  { key: "sim", label: "Simulador", emoji: "✨" },
  { key: "teams", label: "Seleções", emoji: "🚩" },
];

interface NavigationProps {
  tab: TabKey;
  setTab: (t: TabKey) => void;
}

export function Navigation({ tab, setTab }: NavigationProps) {
  return (
    <nav className="mb-6 overflow-x-auto -mx-4 px-4" aria-label="Navegação principal">
      <div className="inline-flex gap-1 p-1.5 rounded-2xl bg-white/80 backdrop-blur border border-amber-200 shadow-sm min-w-max">
        {TABS.map((t) => (
          <button
            key={t.key}
            id={`nav-tab-${t.key}`}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              tab === t.key
                ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md scale-105"
                : "text-gray-600 hover:text-gray-900 hover:bg-amber-50",
            )}
            aria-selected={tab === t.key}
            role="tab"
          >
            <span>{t.emoji}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export { TABS };
export type { TabKey };
