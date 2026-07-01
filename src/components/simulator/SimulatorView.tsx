import { useEffect, useState, useCallback } from "react";
import type { WorldCupData } from "@/lib/worldcup/types";
import { SimulatorList } from "./SimulatorList";
import { advanceBracket, simulateWinner, resetSimMatch } from "@/lib/worldcup/bracketEngine";
import { getRankingRepository } from "@/repositories";
import { generatePredictionPDF } from "@/utils/pdfExport";
import { generateCode, generateHash } from "@/utils/hashUtils";
import { nowBrazil, formatBrazil } from "@/utils/dateUtils";
import { RotateCcw, Send, CheckCircle2, User, MapPin, Trophy } from "lucide-react";
import { toast } from "sonner";

interface Props { realData: WorldCupData; }

export function SimulatorView({ realData }: Props) {
  const [simMatches, setSimMatches] = useState(() => advanceBracket(realData.matches));
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [palpiteCode, setPalpiteCode] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  // Re-init when realData changes
  useEffect(() => {
    setSimMatches(advanceBracket(realData.matches));
    setSaved(false);
  }, [realData]);

  // Campeão = vencedor da final
  const finalMatch = simMatches.find((m) => m.id === "final");
  const champion = finalMatch?.winner
    ? [...simMatches].flatMap((m) => [m.homeTeam, m.awayTeam]).find((t) => t?.id === finalMatch.winner) ?? null
    : null;

  // Progresso (inclui 3º lugar no total)
  const knockout = simMatches.filter((m) => m.stage !== "GROUP_STAGE");
  const chosen   = knockout.filter((m) => m.winner).length;
  const total    = knockout.length;
  const pct      = total > 0 ? Math.round((chosen / total) * 100) : 0;

  const handleSelect = useCallback((matchId: string, slot: "home" | "away", hs?: number, as_?: number, hp?: number, ap?: number) => {
    const m = simMatches.find((x) => x.id === matchId);
    if (!m || (m.status === "finished" && !m.simulated)) return;
    setSimMatches((prev) => simulateWinner(prev, matchId, slot, hs, as_, hp, ap));
  }, [simMatches]);

  const handleReset = () => {
    setSimMatches(advanceBracket(realData.matches));
    setSaved(false);
    setPalpiteCode("");
    toast.success("Palpite resetado! ♻️");
  };

  const handleResetMatch = (matchId: string) => {
    setSimMatches((prev) => resetSimMatch(prev, matchId));
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Digite seu nome! 👤"); return; }
    if (!city.trim()) { toast.error("Digite sua cidade! 📍"); return; }
    if (!champion) { toast.error("Complete o chaveamento até escolher o campeão! 🏆"); return; }

    setGenerating(true);
    try {
      const now = nowBrazil();
      const createdAt = now.toISOString();
      const createdAtBrazil = formatBrazil(now);
      const code = generateCode();

      // Monta lista de jogos para o palpite (inclui flagUrls e pênaltis para o PDF)
      const predMatches = simMatches
        .filter((m) => m.stage !== "GROUP_STAGE")
        .map((m) => ({
          matchId: m.id,
          stage: m.stage,
          homeTeamId: m.homeTeam?.id ?? null,
          homeTeamName: m.homeTeam?.name ?? null,
          homeTeamFlagUrl: m.homeTeam?.flagUrl ?? null,
          awayTeamId: m.awayTeam?.id ?? null,
          awayTeamName: m.awayTeam?.name ?? null,
          awayTeamFlagUrl: m.awayTeam?.flagUrl ?? null,
          predictedHomeScore: m.homeScore,
          predictedAwayScore: m.awayScore,
          predictedHomePens: m.penaltiesHome ?? null,
          predictedAwayPens: m.penaltiesAway ?? null,
          predictedWinnerId: m.winner ?? null,
          predictedWinnerName: m.winner
            ? (m.homeTeam?.id === m.winner ? m.homeTeam?.name : m.awayTeam?.name) ?? null
            : null,
          decidedByPenalties: !!(m.penaltiesHome !== null && m.penaltiesAway !== null),
          actualHomeScore: null,
          actualAwayScore: null,
          actualWinnerId: null,
          points: 0,
        }));

      const hash = await generateHash({
        name: name.trim(),
        city: city.trim(),
        createdAt,
        championId: champion.id,
        matchSelections: predMatches.map((m) => ({
          matchId: m.matchId,
          homeScore: m.predictedHomeScore,
          awayScore: m.predictedAwayScore,
          winnerId: m.predictedWinnerId,
        })),
      });

      const prediction = {
        code,
        participant: { name: name.trim(), city: city.trim() },
        createdAt,
        createdAtBrazil,
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

      // Salvar no banco
      const repo = getRankingRepository();
      await repo.savePrediction(prediction as any);
      setPalpiteCode(code);
      setSaved(true);
      toast.success(`✅ Palpite salvo! Código: ${code}`, { duration: 8000 });

      // Gerar PDF
      await generatePredictionPDF(prediction as any);
      toast.success("📄 PDF baixado com sucesso!");

    } catch (e) {
      console.error("[SimulatorView] Erro:", e);
      toast.error("Erro ao salvar. Verifique e tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Barra de progresso ── */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{chosen}/{total} jogos escolhidos</span>
          <span className="font-black text-amber-600">{pct}%</span>
        </div>
        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-green-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 text-center">
          👆 Clique nos campos de placar ou nos botões para escolher os vencedores
        </p>
      </div>

      {/* ── Dados do participante ── */}
      <div className="rounded-2xl bg-white border-2 border-amber-200 p-4 shadow-sm">
        <h3 className="text-sm font-black text-gray-700 mb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-amber-500" /> Seus dados para o Ranking
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1" htmlFor="sim-name">
              Seu nome completo *
            </label>
            <input
              id="sim-name" type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Maria da Silva"
              className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1" htmlFor="sim-city">
              Sua cidade *
            </label>
            <input
              id="sim-city" type="text" value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: São Paulo, SP"
              className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── Lista de palpites (identico à pag. principal) ── */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-black text-gray-800">Meus Palpites da Copa 2026</h3>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-xl border border-gray-200 px-2.5 py-1 text-[11px] font-bold text-gray-500 hover:bg-gray-50"
            id="sim-reset-btn"
          >
            <RotateCcw className="h-3 w-3" /> Resetar tudo
          </button>
        </div>

        <div className="bg-amber-50 border-b border-amber-100 px-4 py-1.5 text-[11px] text-amber-700 font-semibold flex gap-2 items-center">
          <span>🎯</span>
          <span>
            <strong>Jogos encerrados</strong> mostram placar real.{" "}
            <strong>Próximos jogos</strong>: clique em "X vence" ou preencha o placar!
          </span>
        </div>

        <div className="p-3">
          <SimulatorList matches={simMatches} onSelectWinner={handleSelect} onReset={handleResetMatch} />
        </div>
      </div>

      {/* ── Campeão destacado ── */}
      {champion && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-100 to-yellow-50 border-2 border-amber-400 p-4 shadow flex items-center gap-4">
          <img
            src={champion.flagUrl} alt={champion.name}
            className="h-12 w-16 rounded-xl object-cover shadow-md flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div>
            <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">🏆 Meu Campeão</div>
            <div className="text-xl font-black text-gray-900">{champion.name}</div>
          </div>
        </div>
      )}

      {/* ── BOTÃO DE ENVIAR PALPITE ── */}
      <div className={cn(
        "rounded-3xl p-6 shadow-xl",
        saved ? "bg-green-50 border-2 border-green-400" : "bg-gradient-to-br from-green-600 to-emerald-700"
      )}>
        {saved ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <div>
              <div className="text-lg font-black text-green-700">Palpite enviado! 🎉</div>
              <div className="text-sm text-green-600 mt-1">
                Código: <span className="font-black font-mono">{palpiteCode}</span>
              </div>
              <p className="text-sm text-green-500 mt-1">PDF baixado automaticamente!</p>
            </div>
            <a
              href="/ranking" id="sim-go-ranking-btn"
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
                {champion ? `Seu campeão: ${champion.name}` : "Complete o chaveamento!"}
              </div>
              <p className="text-green-100 text-sm mt-1">
                {!name.trim() || !city.trim()
                  ? "⬆️ Preencha seu nome e cidade acima"
                  : !champion
                    ? "Continue escolhendo vencedores até chegar à Final"
                    : "Tudo pronto! Clique para salvar no Ranking e baixar o PDF"}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!champion || generating || !name.trim() || !city.trim()}
              id="sim-palpitar-btn"
              className="inline-flex items-center gap-3 rounded-2xl bg-yellow-400 px-10 py-4 text-lg font-black text-green-900 shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {generating
                ? <><span className="animate-spin inline-block">⚽</span> Salvando...</>
                : <><Send className="h-5 w-5" /> Enviar Palpite &amp; Gerar PDF</>
              }
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

// Helper local para não importar cn de fora
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
