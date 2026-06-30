import type { Prediction } from "@/types/prediction";
import { shortHash } from "./hashUtils";

// ─── Remove acentos para que jsPDF (helvetica) não quebre os caracteres ───────
function s(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7F]/g, "?"); // qualquer outro não-ASCII vira ?
}

const stageNames: Record<string, string> = {
  LAST_32:       "Fase de 32",
  LAST_16:       "Oitavas de Final",
  QUARTER_FINALS:"Quartas de Final",
  SEMI_FINALS:   "Semifinais",
  THIRD_PLACE:   "3o Lugar",
  FINAL:         "Final",
};

/**
 * Tenta carregar imagem via fetch para uso no PDF.
 * Retorna null em caso de falha (CORS etc.).
 */
async function fetchBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror   = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

/**
 * Gera o PDF do palpite.
 * Header vermelho com canal YouTube da Luana.
 * Sem dependência de ChannelConfig — branding fixo.
 */
export async function generatePredictionPDF(prediction: Prediction): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, M = 14, CW = W - M * 2;
  const pH = pdf.internal.pageSize.getHeight();
  let y = 0;

  // ── HEADER: fundo vermelho YouTube ──────────────────────────────────────────
  pdf.setFillColor(200, 0, 0);
  pdf.rect(0, 0, W, 38, "F");

  // Badge YT
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(M, 7, 22, 14, 2, 2, "F");
  pdf.setFontSize(9); pdf.setFont("helvetica", "bold");
  pdf.setTextColor(200, 0, 0);
  pdf.text("YT", M + 7, 16.5);

  // Nome do canal
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(17); pdf.setFont("helvetica", "bold");
  pdf.text("Luana Queiroz e Familia", M + 26, 16);

  // Subtítulo
  pdf.setFontSize(8); pdf.setFont("helvetica", "normal");
  pdf.text("youtube.com/@Luanaqueirozefamilia  |  Desafio da Copa 2026", M + 26, 24);
  pdf.text("Comprovante de palpite - guarde este PDF!", M + 26, 31);

  y = 44;

  // ── PARTICIPANTE ────────────────────────────────────────────────────────────
  pdf.setFillColor(255, 251, 235);
  pdf.roundedRect(M, y, CW, 22, 3, 3, "F");
  pdf.setDrawColor(200, 130, 0); pdf.setLineWidth(0.4);
  pdf.roundedRect(M, y, CW, 22, 3, 3, "S");

  pdf.setTextColor(140, 80, 0); pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
  pdf.text("PARTICIPANTE", M + 3, y + 7);

  pdf.setFontSize(14); pdf.setFont("helvetica", "bold");
  pdf.setTextColor(60, 30, 0);
  pdf.text(s(prediction.participant.name), M + 3, y + 15);

  pdf.setFontSize(8); pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 50, 0);
  pdf.text(s(prediction.participant.city), M + 3, y + 21);

  // Código + data (direita)
  pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
  pdf.setTextColor(140, 80, 0);
  const codeStr = `Codigo: ${prediction.code}`;
  pdf.text(codeStr, W - M - pdf.getTextWidth(codeStr) - 2, y + 7);

  pdf.setFontSize(6); pdf.setFont("helvetica", "normal");
  pdf.setTextColor(110, 60, 0);
  const dateStr = prediction.createdAtBrazil
    ?? new Date(prediction.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const dw = pdf.getTextWidth(s(dateStr));
  pdf.text(s(dateStr), W - M - dw - 2, y + 13);

  y += 28;

  // ── CAMPEÃO ─────────────────────────────────────────────────────────────────
  if (prediction.championTeamName) {
    pdf.setFillColor(255, 215, 0);
    pdf.roundedRect(M, y, CW, 26, 3, 3, "F");
    pdf.setDrawColor(180, 140, 0); pdf.setLineWidth(0.5);
    pdf.roundedRect(M, y, CW, 26, 3, 3, "S");

    pdf.setTextColor(90, 60, 0); pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
    pdf.text("MEU CAMPEAO DA COPA 2026  (Trofeu)", M + 3, y + 7);

    pdf.setFontSize(17); pdf.setFont("helvetica", "bold");
    pdf.setTextColor(50, 25, 0);
    pdf.text(s(prediction.championTeamName), M + 3, y + 19);

    // Tentar bandeira
    if (prediction.championFlagUrl) {
      const imgData = await fetchBase64(prediction.championFlagUrl);
      if (imgData) {
        try { pdf.addImage(imgData, "PNG", W - M - 30, y + 3, 28, 20); } catch { /* silencia */ }
      }
    }

    y += 32;
  }

  // ── PALPITES POR FASE ───────────────────────────────────────────────────────
  const stageOrder = ["LAST_32","LAST_16","QUARTER_FINALS","SEMI_FINALS","THIRD_PLACE","FINAL"];
  const byStage: Record<string, typeof prediction.matches> = {};
  for (const m of prediction.matches ?? []) {
    const key = m.stage as string;
    if (!byStage[key]) byStage[key] = [];
    byStage[key].push(m);
  }

  const newPage  = () => { pdf.addPage(); y = 15; };
  const checkY   = (need: number) => { if (y + need > pH - 15) newPage(); };

  for (const stage of stageOrder) {
    const items = byStage[stage];
    if (!items?.length) continue;

    checkY(12);

    // Header da fase
    const isFinal = stage === "FINAL";
    pdf.setFillColor(isFinal ? 200 : 245, isFinal ? 0 : 120, isFinal ? 0 : 11);
    pdf.rect(M, y, CW, 7, "F");
    pdf.setTextColor(255, 255, 255); pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
    pdf.text(s(stageNames[stage] ?? stage), M + 2, y + 5);
    y += 9;

    let col = 0;
    const colW = (CW - 2) / 2;

    for (const match of items) {
      if (!match.homeTeamName && !match.awayTeamName) continue;
      checkY(14);

      const cx = M + col * (colW + 2);
      const hasWinner = !!match.predictedWinnerId;
      const hasScore  = match.predictedHomeScore != null && match.predictedAwayScore != null;
      const homeWins  = match.predictedWinnerId === match.homeTeamId;
      const awayWins  = match.predictedWinnerId === match.awayTeamId;

      // Card fundo
      pdf.setFillColor(hasWinner ? 240 : 250, hasWinner ? 255 : 250, hasWinner ? 240 : 250);
      pdf.roundedRect(cx, y, colW, 13, 2, 2, "F");
      pdf.setDrawColor(hasWinner ? 34 : 200, hasWinner ? 170 : 200, hasWinner ? 85 : 200);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(cx, y, colW, 13, 2, 2, "S");

      // Times
      const home = s(match.homeTeamName ?? "A definir");
      const away = s(match.awayTeamName ?? "A definir");

      pdf.setFontSize(6);
      pdf.setFont("helvetica", homeWins ? "bold" : "normal");
      pdf.setTextColor(homeWins ? 22 : 60, homeWins ? 101 : 60, homeWins ? 52 : 60);
      pdf.text(home.slice(0, 20), cx + 2, y + 5);

      pdf.setFont("helvetica", awayWins ? "bold" : "normal");
      pdf.setTextColor(awayWins ? 22 : 80, awayWins ? 101 : 80, awayWins ? 52 : 80);
      pdf.text(away.slice(0, 20), cx + 2, y + 11);

      // Placar ou seta vencedor
      if (hasScore) {
        const sc = `${match.predictedHomeScore} x ${match.predictedAwayScore}`;
        pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
        pdf.setTextColor(50, 50, 50);
        const sw = pdf.getTextWidth(sc);
        pdf.text(sc, cx + colW - sw - 2, y + 8);
      } else if (hasWinner) {
        pdf.setFontSize(8); pdf.setFont("helvetica", "bold");
        pdf.setTextColor(22, 101, 52);
        if (homeWins) pdf.text("v", cx + colW - 5, y + 5.5);
        if (awayWins) pdf.text("v", cx + colW - 5, y + 11.5);
      }

      col++;
      if (col >= 2) { col = 0; y += 15; }
    }
    if (col > 0) { y += 15; }
    y += 3;
  }

  // ── RODAPÉ ─────────────────────────────────────────────────────────────────
  checkY(14);
  pdf.setFillColor(245, 245, 245);
  pdf.rect(M, y, CW, 12, "F");
  pdf.setDrawColor(200, 200, 200); pdf.setLineWidth(0.2);
  pdf.rect(M, y, CW, 12, "S");

  pdf.setTextColor(120, 120, 120); pdf.setFontSize(6); pdf.setFont("helvetica", "normal");
  const hash = await shortHash(prediction.code + prediction.participant.name);
  pdf.text(`Hash: ${hash}`, M + 2, y + 5);
  pdf.text(s(dateStr ?? ""), M + 2, y + 10);

  pdf.setFont("helvetica", "bold"); pdf.setTextColor(200, 0, 0);
  const ytText = "youtube.com/@Luanaqueirozefamilia";
  pdf.text(ytText, W - M - pdf.getTextWidth(ytText) - 2, y + 8);

  pdf.save(`palpite_copa2026_${prediction.code}.pdf`);
}
