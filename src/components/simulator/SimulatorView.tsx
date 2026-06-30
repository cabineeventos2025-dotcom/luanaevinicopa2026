import { useEffect, useState } from "react";
import type { WorldCupData } from "@/lib/worldcup/types";
import { useSimulator } from "@/contexts/SimulatorContext";
import { useChannelConfig } from "@/contexts/ChannelConfigContext";
import { BracketSimulator } from "./BracketSimulator";
import { generatePredictionPDF } from "@/utils/pdfExport";
import { generateCode, generateHash } from "@/utils/hashUtils";
import { nowBrazil, formatBrazil } from "@/utils/dateUtils";
import { getRankingRepository } from "@/repositories";
import { simulateWinner, advanceBracket } from "@/lib/worldcup/bracketEngine";
import { RotateCcw, Send, CheckCircle2, User, MapPin, Trophy, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface Props { realData: WorldCupData; }

export function SimulatorView({ realData }: Props) {
  const { state, initSimulator, reset, buildPredictionMatches, setSavedPrediction } = useSimulator();
  const { config } = useChannelConfig();
  const [simMatches, setSimMatches] = useState(realData.matches);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    initSimulator(realData);
    // Pre-propaga vencedores dos jogos já finalizados
    setSimMatches(advanceBracket(realData.matches));
    setSaved(false);
  }, [realData, initSimulator]);

  // Campeão = vencedor da final
  const finalMatch = simMatches.find((m) => m.id === "final");
  const champion = finalMatch?.winner
    ? simMatches.flatMap((m) => [m.homeTeam, m.awayTeam]).find((t) => t?.id === finalMatch.winner) ?? null
    : null;

  // Progresso: jogos da fase de 32 em diante
  const knockout = simMatches.filter((m) => m.stage !== "GROUP_STAGE" && m.id !== "3rd");
  const chosen = knockout.filter((m) => m.winner).length;
  const total = knockout.length;
  const progress = total > 0 ? Math.round((chosen / total) * 100) : 0;

  const handleSelect = (matchId: string, slot: "home" | "away") => {
    const match = simMatches.find((m) => m.id === matchId);
    if (!match || match.status === "finished") return;
    const updated = simulateWinner(simMatches, matchId, slot);
    setSimMatches(updated);
  };

  const handleReset = () => {
    setSimMatches(advanceBracket(realData.matches));
    setSaved(false);
    reset();
    toast.success("Palpite resetado! ♻️");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !city.trim()) {
      toast.error("Preencha seu nome e cidade! 👇");
      return;
    }
    if (!champion) {
      toast.error("Complete o chaveamento até escolher o campeão! 🏆");
      return;
    }
    setGenerating(true);
    try {
      const predMatches = buildPredictionMatches();
      const now = nowBrazil();
      const createdAt = now.toISOString();

      const hash = await generateHash({
        name: name.trim(),
        city: city.trim(),
        createdAt,
        championId: champion.id,
        matchSelections: predMatches.map((m) => ({
          matchId: m.matchId,
          homeScore: m.predictedHomeScore,
          awayScore: m.predictedAwayScore,
          winnerId: m.predictedWinnerId ?? null,
        })),
      });

      const code = generateCode();
      const prediction = {
        code,
        participant: { name: name.trim(), city: city.trim() },
        createdAt,
        createdAtBrazil: formatBrazil(now),
        timezone: "America/Sao_Paulo" as const,
        championTeamId: champion.id,
        championTeamName: champion.name,
        championFlagUrl: champion.flagUrl,
        matches: predMatches,
        totalPoints: 0,
        exactScores: 0,
        correctWinners: 0,
        hash,
        channelSubscribedConfirmed: true,
        channelSubscriptionChecked: false,
        termsAccepted: true,
      };

      // Salvar no banco de dados (Supabase ou LocalStorage)
      const repo = getRankingRepository();
      await repo.savePrediction(prediction);
      setSaved(true);
      setSavedPrediction(prediction);
      toast.success(`✅ Palpite salvo no Ranking! Código: ${code}`, { duration: 8000 });

      // Gerar PDF
      await generatePredictionPDF(prediction, {
        channelName: config.channelName,
        logoUrl: config.logoUrl,
        tagline: config.tagline,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
      });
      toast.success("📄 PDF gerado! Compartilhe com a família!");
    } catch (e) {
      console.error("[SimulatorView]", e);
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════════════════
          HERO — CTA GRANDE para participar
      ══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-6 text-white shadow-2xl">
        {/* Bolas decorativas */}
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-yellow-400/10" />

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="text-6xl flex-shrink-0 drop-shadow-lg">⚽🏆</div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black leading-tight mb-2">
              Monte seu Palpite da Copa!
            </h2>
            <p className="text-green-100 text-sm md:text-base mb-1">
              Escolha os vencedores de cada jogo, descubra seu campeão e entre para o
              <span className="font-black text-yellow-300"> Ranking da Família!</span>
            </p>
            <p className="text-green-200 text-xs">
              🎯 Jogos já finalizados são mostrados automaticamente • 🔮 Os próximos são seu palpite!
            </p>
          </div>
          {!started && (
            <button
              onClick={() => setStarted(true)}
              id="simulator-start-btn"
              className="flex-shrink-0 flex items-center gap-2 rounded-2xl bg-yellow-400 px-8 py-4 text-lg font-black text-green-900 hover:bg-yellow-300 transition-all hover:scale-105 shadow-xl"
            >
              ✨ Quero Palpitar!
            </button>
          )}
        </div>

        {/* Barra de progresso */}
        {started && (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-green-200">
              <span>Progresso: {chosen}/{total} jogos escolhidos</span>
              <span className="font-black text-yellow-300">{progress}%</span>
            </div>
            <div className="h-3 rounded-full bg-green-900/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          FORMULÁRIO — Nome e Cidade (sempre visível)
      ══════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white border-2 border-amber-200 p-5 shadow-sm">
        <h3 className="text-base font-black text-gray-800 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-amber-500" /> Seus dados para o Ranking
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5" htmlFor="sim-name">
              Seu nome *
            </label>
            <input
              id="sim-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Maria da Silva"
              className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:border-amber-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5" htmlFor="sim-city">
              Sua cidade *
            </label>
            <input
              id="sim-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: São Paulo, SP"
              className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:border-amber-400 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          CHAVEAMENTO — Bracket completo com scroll horizontal
      ══════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-black text-gray-800">Meu Chaveamento</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-gray-400">← arraste para ver tudo →</span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              id="simulator-reset-btn"
            >
              <RotateCcw className="h-3 w-3" /> Resetar
            </button>
          </div>
        </div>

        {/* Instrução colorida */}
        <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 font-semibold flex items-center gap-2">
          <span>👆</span>
          <span>Clique no time que você acha que vai vencer cada jogo — o vencedor avança automaticamente!</span>
        </div>

        <div className="p-4">
          <BracketSimulator matches={simMatches} onSelectWinner={handleSelect} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          CAMPEÃO ESCOLHIDO — Destaque
      ══════════════════════════════════════════════════════ */}
      {champion && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-400 p-5 shadow-md flex items-center gap-4">
          <img src={champion.flagUrl} alt={champion.name} className="h-14 w-20 rounded-xl object-cover shadow-md" />
          <div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wide">🏆 Seu Campeão Escolhido</div>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{champion.name}</div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          BOTÃO DE ENVIAR PALPITE — Grande e proeminente
      ══════════════════════════════════════════════════════ */}
      <div className={`rounded-3xl p-6 shadow-md transition-all ${saved ? "bg-green-50 border-2 border-green-400" : "bg-gradient-to-br from-amber-400 to-yellow-400 shadow-xl"}`}>
        {saved ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-14 w-14 text-green-500" />
            <div>
              <div className="text-xl font-black text-green-700">Palpite enviado com sucesso! 🎉</div>
              <p className="text-sm text-green-600 mt-1">Você está no Ranking da Família. Boa sorte!</p>
            </div>
            <a
              href="/ranking"
              id="sim-go-ranking-btn"
              className="inline-flex items-center gap-2 rounded-2xl bg-green-500 px-8 py-3 text-base font-black text-white hover:bg-green-600 transition-all hover:scale-105 shadow-lg"
            >
              🏅 Ver Ranking da Família
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="text-4xl">🎯</div>
            <div>
              <div className="text-xl font-black text-white drop-shadow">
                {champion ? `Torcendo por ${champion.name}?` : "Escolha seu campeão!"}
              </div>
              <p className="text-yellow-100 text-sm mt-1">
                {!name.trim() || !city.trim()
                  ? "Preencha seu nome e cidade acima"
                  : !champion
                    ? "Continue o chaveamento até escolher o campeão"
                    : "Clique para salvar no Ranking e gerar seu PDF!"}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!champion || generating || !name.trim() || !city.trim()}
              id="simulator-palpitar-btn"
              className="inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-4 text-lg font-black text-amber-700 shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {generating ? (
                <><span className="animate-spin">⚽</span> Salvando...</>
              ) : (
                <><Send className="h-5 w-5" /> Enviar Palpite & Gerar PDF</>
              )}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
