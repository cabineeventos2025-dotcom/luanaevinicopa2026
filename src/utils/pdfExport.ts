import type { Prediction } from "@/types/prediction";
import { shortHash } from "./hashUtils";

interface ChannelConfig {
  channelName: string;
  logoUrl?: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
}

const stageNames: Record<string, string> = {
  LAST_32: "Fase de 32",
  LAST_16: "Oitavas de Final",
  QUARTER_FINALS: "Quartas de Final",
  SEMI_FINALS: "Semifinais",
  THIRD_PLACE: "3o Lugar",
  FINAL: "Final",
};

function tryHex(h: string): [number, number, number] {
  try {
    const c = h.startsWith("#") ? h : "#" + h;
    return [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
  } catch { return [245,158,11]; }
}

/**
 * Carrega uma imagem como base64 para uso no jsPDF.
 * Retorna null em caso de falha (CORS etc.).
 */
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Gera PDF do palpite usando apenas jsPDF — sem html2canvas, sem CORS obrigatório.
 * Header vermelho com canal do YouTube. Campeão com bandeira.
 */
export async function generatePredictionPDF(
  prediction: Prediction,
  channelConfig: ChannelConfig,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, M = 14, CW = W - M * 2;
  const pH = pdf.internal.pageSize.getHeight();
  let y = 0;

  // ── HEADER VERMELHO — Canal YouTube ────────────────────────────────────────
  // Fundo vermelho YouTube
  pdf.setFillColor(255, 0, 0);
  pdf.rect(0, 0, W, 36, "F");

  // Ícone YouTube (retângulo vermelho arredondado + triângulo branco simulado)
  // Desenhamos um badge "YT" estilizado
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(M, 4, 18, 13, 2, 2, "F");
  pdf.setFillColor(255, 0, 0);
  pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 0, 0);
  // Triângulo play simulado com texto
  pdf.setTextColor(255, 0, 0);
  pdf.text("▶", M + 5, 12.5);
  pdf.setFontSize(7);
  pdf.text("YT", M + 9, 12.5);

  // Nome do canal
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18); pdf.setFont("helvetica", "bold");
  pdf.text(channelConfig.channelName, M + 22, 14);

  // Tagline / link YouTube
  pdf.setFontSize(8); pdf.setFont("helvetica", "normal");
  pdf.text("youtube.com/@Luanaqueirozefamilia  •  Desafio da Copa 2026", M + 22, 22);

  // Subtítulo
  pdf.setFontSize(7);
  pdf.text("Comprovante de palpite — guarde este PDF!", M + 22, 29);

  y = 42;

  // ── PARTICIPANTE ──────────────────────────────────────────────────────────
  pdf.setFillColor(255, 251, 235);
  pdf.roundedRect(M, y, CW, 22, 3, 3, "F");
  pdf.setDrawColor(245, 158, 11); pdf.setLineWidth(0.4);
  pdf.roundedRect(M, y, CW, 22, 3, 3, "S");

  pdf.setTextColor(150, 80, 0); pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
  pdf.text("PARTICIPANTE", M + 3, y + 6);
  pdf.setFontSize(13); pdf.setFont("helvetica", "bold");
  pdf.setTextColor(80, 40, 0);
  pdf.text(prediction.participant.name, M + 3, y + 14);
  pdf.setFontSize(8); pdf.setFont("helvetica", "normal");
  pdf.setTextColor(120, 60, 0);
  pdf.text(`📍 ${prediction.participant.city}`, M + 3, y + 20);

  // Código do palpite
  pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
  pdf.setTextColor(150, 80, 0);
  const codeStr = `Código: ${prediction.code}`;
  pdf.text(codeStr, W - M - pdf.getTextWidth(codeStr) - 2, y + 6);
  pdf.setFontSize(6); pdf.setFont("helvetica", "normal");
  pdf.setTextColor(120, 60, 0);
  const dateStr = prediction.createdAtBrazil ?? new Date(prediction.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const dateW = pdf.getTextWidth(dateStr);
  pdf.text(dateStr, W - M - dateW - 2, y + 12);

  y += 28;

  // ── CAMPEÃO ESCOLHIDO ──────────────────────────────────────────────────────
  if (prediction.championTeamName) {
    pdf.setFillColor(255, 215, 0);
    pdf.roundedRect(M, y, CW, 22, 3, 3, "F");
    pdf.setDrawColor(180, 140, 0); pdf.setLineWidth(0.4);
    pdf.roundedRect(M, y, CW, 22, 3, 3, "S");

    pdf.setTextColor(100, 70, 0); pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
    pdf.text("🏆 MEU CAMPEÃO DA COPA 2026", M + 3, y + 6);

    pdf.setFontSize(16); pdf.setFont("helvetica", "bold");
    pdf.setTextColor(60, 30, 0);
    pdf.text(prediction.championTeamName, M + 3, y + 17);

    // Tentar carregar bandeira do campeão
    if (prediction.championFlagUrl) {
      const flagBase64 = await loadImageAsBase64(prediction.championFlagUrl);
      if (flagBase64) {
        try {
          pdf.addImage(flagBase64, "PNG", W - M - 30, y + 2, 28, 18);
        } catch { /* silencia erro de imagem */ }
      }
    }

    y += 28;
  }

  // ── PALPITES POR FASE ──────────────────────────────────────────────────────
  const stageOrder = ["LAST_32","LAST_16","QUARTER_FINALS","SEMI_FINALS","THIRD_PLACE","FINAL"];
  const byStage: Record<string, typeof prediction.matches> = {};
  for (const m of prediction.matches ?? []) {
    const key = m.stage as string;
    if (!byStage[key]) byStage[key] = [];
    byStage[key].push(m);
  }

  const newPage = () => { pdf.addPage(); y = 15; };
  const checkPage = (needed: number) => { if (y + needed > pH - 15) newPage(); };

  for (const stage of stageOrder) {
    const items = byStage[stage];
    if (!items?.length) continue;

    checkPage(12);
    // Cabeçalho da fase
    const [r, g, b] = stage === "FINAL" ? [255, 0, 0] : tryHex(channelConfig.primaryColor);
    pdf.setFillColor(r, g, b);
    pdf.rect(M, y, CW, 7, "F");
    pdf.setTextColor(255, 255, 255); pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
    pdf.text(stageNames[stage] ?? stage, M + 2, y + 5);
    y += 9;

    let col = 0;
    const colW = (CW - 2) / 2;

    for (const match of items) {
      if (!match.homeTeamName && !match.awayTeamName) continue;
      checkPage(14);

      const cx = M + (col === 0 ? 0 : colW + 2);

      const hasWinner = !!match.predictedWinnerId;
      const hasScore = match.predictedHomeScore != null && match.predictedAwayScore != null;

      pdf.setFillColor(hasWinner ? 240 : 250, hasWinner ? 253 : 250, hasWinner ? 244 : 250);
      pdf.roundedRect(cx, y, colW, 12, 2, 2, "F");
      pdf.setDrawColor(hasWinner ? 34 : 200, hasWinner ? 197 : 200, hasWinner ? 94 : 200);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(cx, y, colW, 12, 2, 2, "S");

      const home = match.homeTeamName ?? "?";
      const away = match.awayTeamName ?? "?";
      const homeWins = match.predictedWinnerId === match.homeTeamId;
      const awayWins = match.predictedWinnerId === match.awayTeamId;

      pdf.setFontSize(6); pdf.setFont("helvetica", homeWins ? "bold" : "normal");
      pdf.setTextColor(homeWins ? 22 : 80, homeWins ? 101 : 80, homeWins ? 52 : 80);
      pdf.text(home.slice(0, 18), cx + 2, y + 5);

      pdf.setFontSize(6); pdf.setFont("helvetica", awayWins ? "bold" : "normal");
      pdf.setTextColor(awayWins ? 22 : 100, awayWins ? 101 : 100, awayWins ? 52 : 100);
      pdf.text(away.slice(0, 18), cx + 2, y + 10);

      if (hasScore) {
        const scoreStr = `${match.predictedHomeScore} × ${match.predictedAwayScore}`;
        pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
        pdf.setTextColor(50, 50, 50);
        const sw = pdf.getTextWidth(scoreStr);
        pdf.text(scoreStr, cx + colW - sw - 2, y + 7);
      } else if (hasWinner) {
        const w = homeWins ? "▲" : "▲";
        pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
        pdf.setTextColor(22, 101, 52);
        pdf.text(homeWins ? "▲" : " ", cx + colW - 5, y + 4.5);
        pdf.text(awayWins ? "▲" : " ", cx + colW - 5, y + 9.5);
        void w;
      }

      col++;
      if (col >= 2) { col = 0; y += 14; }
    }
    if (col > 0) { y += 14; }
    y += 2;
  }

  // ── RODAPÉ ────────────────────────────────────────────────────────────────
  checkPage(18);
  pdf.setFillColor(240, 240, 240);
  pdf.rect(M, y, CW, 14, "F");
  pdf.setTextColor(100, 100, 100); pdf.setFontSize(6); pdf.setFont("helvetica", "normal");
  const hash = await shortHash(prediction.code + prediction.participant.name);
  pdf.text(`Hash de verificação: ${hash}`, M + 2, y + 5);
  pdf.text(`Gerado em: ${dateStr}`, M + 2, y + 10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 0, 0);
  pdf.text(`youtube.com/@Luanaqueirozefamilia`, W - M - 2, y + 8, { align: "right" });

  pdf.save(`palpite_copa2026_${prediction.code}.pdf`);
}
