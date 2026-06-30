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
 * Gera PDF do palpite usando apenas jsPDF — sem html2canvas, sem CORS.
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

  const primary   = tryHex(channelConfig.primaryColor   ?? "#f59e0b");
  const secondary = tryHex(channelConfig.secondaryColor ?? "#22c55e");

  // ── HEADER ──────────────────────────────────────────────────────────────
  pdf.setFillColor(...primary);
  pdf.rect(0, 0, W, 30, "F");
  pdf.setTextColor(255,255,255);
  pdf.setFontSize(16); pdf.setFont("helvetica","bold");
  pdf.text("Palpite da Copa 2026 - " + channelConfig.channelName, W/2, 13, {align:"center"});
  pdf.setFontSize(9); pdf.setFont("helvetica","normal");
  pdf.text("Desafio da familia - Copa do Mundo 2026", W/2, 22, {align:"center"});
  y = 36;

  // ── PARTICIPANTE ─────────────────────────────────────────────────────────
  pdf.setFillColor(255,251,235);
  pdf.roundedRect(M, y, CW, 20, 3, 3, "F");
  pdf.setDrawColor(245,158,11); pdf.setLineWidth(0.4);
  pdf.roundedRect(M, y, CW, 20, 3, 3, "S");
  pdf.setTextColor(150,80,0); pdf.setFontSize(7); pdf.setFont("helvetica","bold");
  pdf.text("PARTICIPANTE", M+3, y+6);
  pdf.setTextColor(20,20,20); pdf.setFontSize(13);
  pdf.text(prediction.participant.name, M+3, y+14);
  pdf.setFontSize(8); pdf.setTextColor(90,90,90);
  pdf.text("Cidade: " + prediction.participant.city, M+3, y+19);
  pdf.text("Data: " + (prediction.createdAtBrazil ?? ""), M+CW/2+4, y+12);
  pdf.text("Codigo: " + prediction.code, M+CW/2+4, y+19);
  y += 26;

  // ── CAMPEAO ──────────────────────────────────────────────────────────────
  if (prediction.championTeamName) {
    pdf.setFillColor(...secondary);
    pdf.roundedRect(M, y, CW, 16, 3, 3, "F");
    pdf.setTextColor(255,255,255);
    pdf.setFontSize(8); pdf.setFont("helvetica","bold");
    pdf.text("CAMPEAO ESCOLHIDO", W/2, y+6, {align:"center"});
    pdf.setFontSize(13);
    pdf.text(prediction.championTeamName, W/2, y+13, {align:"center"});
    y += 22;
  }

  // ── PONTUACAO ────────────────────────────────────────────────────────────
  if (prediction.totalPoints > 0) {
    pdf.setFillColor(240,253,244);
    pdf.roundedRect(M, y, CW, 12, 3, 3, "F");
    pdf.setTextColor(22,163,74); pdf.setFontSize(10); pdf.setFont("helvetica","bold");
    pdf.text("Total: " + prediction.totalPoints + " pontos", W/2-25, y+8);
    pdf.text("Exatos: " + prediction.exactScores, W/2+25, y+8);
    y += 18;
  } else {
    pdf.setFillColor(254,252,232);
    pdf.roundedRect(M, y, CW, 9, 3, 3, "F");
    pdf.setTextColor(120,90,0); pdf.setFontSize(7); pdf.setFont("helvetica","italic");
    pdf.text("Pontuacao sera calculada conforme os jogos acontecerem.", W/2, y+6, {align:"center"});
    y += 15;
  }

  // ── JOGOS ─────────────────────────────────────────────────────────────────
  pdf.setTextColor(20,20,20); pdf.setFontSize(10); pdf.setFont("helvetica","bold");
  pdf.text("Chaveamento Completo", M, y+6);
  y += 12;

  const byStage: Record<string, typeof prediction.matches> = {};
  for (const m of prediction.matches) {
    const s = (m as any).stage ?? "LAST_32";
    if (!byStage[s]) byStage[s] = [];
    byStage[s].push(m);
  }

  const order = ["LAST_32","LAST_16","QUARTER_FINALS","SEMI_FINALS","THIRD_PLACE","FINAL"];

  for (const stage of order) {
    const ms = byStage[stage];
    if (!ms?.length) continue;
    if (y > pH - 28) { pdf.addPage(); y = 14; }

    // Stage label
    pdf.setFillColor(243,244,246);
    pdf.rect(M, y, CW, 7, "F");
    pdf.setFontSize(8); pdf.setFont("helvetica","bold"); pdf.setTextColor(80,80,80);
    pdf.text(stageNames[stage] ?? stage, M+3, y+5);
    y += 10;

    for (const m of ms) {
      if (y > pH - 12) { pdf.addPage(); y = 14; }

      const home = m.homeTeamName ?? "A definir";
      const away = m.awayTeamName ?? "A definir";
      const sc   = (m.predictedHomeScore ?? "-") + " x " + (m.predictedAwayScore ?? "-");

      pdf.setFontSize(8); pdf.setFont("helvetica","normal"); pdf.setTextColor(30,30,30);
      // Home (direita do centro)
      pdf.text(home, M + CW/2 - 18, y+5, {align:"right"});
      // Placar (centro)
      pdf.setFont("helvetica","bold");
      pdf.setFillColor(243,244,246);
      pdf.roundedRect(M+CW/2-14, y-1, 28, 7, 1, 1, "F");
      pdf.text(sc, M+CW/2, y+5, {align:"center"});
      // Away
      pdf.setFont("helvetica","normal");
      pdf.text(away, M+CW/2+16, y+5);
      // Vencedor
      if (m.predictedWinnerName) {
        pdf.setFontSize(6.5); pdf.setTextColor(22,163,74);
        pdf.text("-> " + m.predictedWinnerName, W-M, y+5, {align:"right"});
      }
      pdf.setTextColor(30,30,30);
      y += 8;
      pdf.setDrawColor(238,238,238); pdf.line(M, y, W-M, y);
      y += 2;
    }
    y += 3;
  }

  // ── RODAPE ───────────────────────────────────────────────────────────────
  const footerY = Math.max(y + 6, pH - 16);
  pdf.setFillColor(...primary);
  pdf.rect(0, footerY, W, 16, "F");
  pdf.setTextColor(255,255,255); pdf.setFontSize(7); pdf.setFont("helvetica","normal");
  pdf.text(channelConfig.channelName + " - Copa do Mundo 2026 - Desafio da familia", W/2, footerY+6, {align:"center"});
  pdf.text("Codigo: " + prediction.code + " | Hash: " + shortHash(prediction.hash), W/2, footerY+12, {align:"center"});

  const fn = "palpite-copa-2026-" + prediction.participant.name.toLowerCase().replace(/\s+/g,"-") + "-" + prediction.code + ".pdf";
  pdf.save(fn);
}

export function exportPredictionJSON(prediction: Prediction): void {
  const blob = new Blob([JSON.stringify(prediction,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "palpite-copa-2026-" + prediction.code + ".json";
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
