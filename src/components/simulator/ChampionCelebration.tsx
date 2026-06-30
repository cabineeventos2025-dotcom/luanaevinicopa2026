import { useEffect, useRef, useState } from "react";
import type { Team } from "@/lib/worldcup/types";
import { useChannelConfig } from "@/contexts/ChannelConfigContext";
import { YouTubeButton } from "@/components/common/YouTubeButton";
import { Share2, Download } from "lucide-react";
import { toast } from "sonner";

interface ChampionCelebrationProps {
  champion: Team;
  predictionCode?: string;
  onGeneratePDF?: () => void;
  onShare?: () => void;
  generating?: boolean;
}

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      {Array.from({ length: 20 }).map((_, i) => {
        const colors = [
          "bg-yellow-400",
          "bg-green-400",
          "bg-blue-400",
          "bg-red-400",
          "bg-purple-400",
          "bg-pink-400",
        ];
        const color = colors[i % colors.length];
        const left = `${(i * 37 + 13) % 100}%`;
        const delay = `${(i * 0.15) % 2}s`;
        const size = i % 3 === 0 ? "h-3 w-3" : i % 3 === 1 ? "h-2 w-2" : "h-4 w-1";
        return (
          <div
            key={i}
            className={`absolute top-0 ${size} ${color} rounded-sm opacity-80 animate-bounce`}
            style={{ left, animationDelay: delay, animationDuration: `${1 + (i % 3) * 0.3}s` }}
          />
        );
      })}
    </div>
  );
}

export function ChampionCelebration({
  champion,
  predictionCode,
  onGeneratePDF,
  onShare,
  generating,
}: ChampionCelebrationProps) {
  const { config } = useChannelConfig();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const shareText = `Olha meu palpite para a Copa do Mundo 2026! Eu escolhi ${champion.name} como campeão. E você, quem acha que ganha? 🏆⚽`;

  const handleShare = async () => {
    if (onShare) return onShare();
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Meu Palpite da Copa 2026", text: shareText, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      toast.success("Texto copiado para compartilhar! 🎉");
    } catch {
      toast.error("Não foi possível compartilhar");
    }
  };

  return (
    <div
      className={`relative rounded-3xl overflow-hidden shadow-2xl border-4 border-yellow-400 transition-all duration-500 ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{
        background: `linear-gradient(135deg, ${config.primaryColor}22, ${config.secondaryColor}22)`,
      }}
      id="champion-celebration"
    >
      <Confetti />

      <div className="relative z-10 p-6 sm:p-8 text-center">
        {/* Emoji trophy */}
        <div className="text-7xl mb-4 animate-bounce">🏆</div>

        <div className="text-sm font-black uppercase tracking-widest text-amber-600 mb-2">
          {config.channelName}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
          Uhuuul! Seu campeão escolhido foi:
        </h2>

        {/* Champion card */}
        <div className="inline-flex items-center gap-4 rounded-2xl bg-white/80 backdrop-blur border-2 border-yellow-300 px-6 py-4 my-4 shadow-lg">
          {champion.flagUrl && (
            <img
              src={champion.flagUrl}
              alt={champion.name}
              className="h-12 w-16 object-cover rounded-lg shadow-md ring-2 ring-yellow-300"
            />
          )}
          <div className="text-left">
            <div className="text-2xl font-black text-gray-900">{champion.name}</div>
            {champion.tla && (
              <div className="text-sm font-bold text-amber-600 uppercase tracking-wider">
                {champion.tla}
              </div>
            )}
          </div>
        </div>

        {/* Code */}
        {predictionCode && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Código do seu palpite:</p>
            <code className="text-base font-black text-amber-700 bg-amber-50 rounded-xl px-4 py-1.5 border border-amber-200">
              {predictionCode}
            </code>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          {onGeneratePDF && (
            <button
              onClick={onGeneratePDF}
              disabled={generating}
              id="generate-pdf-btn"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 text-base font-black text-white shadow-lg hover:from-amber-600 hover:to-yellow-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5" />
              {generating ? "Gerando PDF..." : "🏆 Gerar PDF do Meu Palpite"}
            </button>
          )}

          <button
            onClick={handleShare}
            id="share-prediction-btn"
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-400 bg-white px-6 py-3 text-base font-bold text-amber-700 hover:bg-amber-50 hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <Share2 className="h-5 w-5" />
            Compartilhar com a família
          </button>
        </div>

        {/* YouTube CTA */}
        <div className="mt-5 pt-4 border-t border-amber-200">
          <p className="text-sm text-gray-500 mb-2">
            Acompanhe os resultados no nosso canal! 🎬
          </p>
          <YouTubeButton variant="compact" className="mx-auto" />
        </div>
      </div>
    </div>
  );
}
