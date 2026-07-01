import type { Prediction } from "@/types/prediction";
import { shortHash } from "./hashUtils";

// ─── Remove acentos para que jsPDF (helvetica) não quebre os caracteres ───────
function s(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7F]/g, "?");
}

const stageNames: Record<string, string> = {
  LAST_32:        "Fase de 32",
  LAST_16:        "Oitavas de Final",
  QUARTER_FINALS: "Quartas de Final",
  SEMI_FINALS:    "Semifinais",
  THIRD_PLACE:    "3o Lugar",
  FINAL:          "Final",
};

// ─── Carrega imagem via img+canvas (melhor CORS que fetch) ────────────────────
async function fetchBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width  = img.naturalWidth  || 160;
        canvas.height = img.naturalHeight || 100;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url.includes("?") ? url : url + "?t=1";
  });
}

// ─── Gera a logo YouTube em canvas e retorna base64 ──────────────────────────
async function youtubeLogoBase64(): Promise<string | null> {
  return new Promise((resolve) => {
    const size = 120;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) { resolve(null); return; }

    // Fundo branco arredondado
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Retângulo vermelho (corpo do logo)
    const rx = 10, ry = 22, rw = 100, rh = 76, r = 18;
    ctx.fillStyle = "#FF0000";
    ctx.beginPath();
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + rw - r, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
    ctx.lineTo(rx + rw, ry + rh - r);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
    ctx.lineTo(rx + r, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
    ctx.lineTo(rx, ry + r);
    ctx.quadraticCurveTo(rx, ry, rx + r, ry);
    ctx.closePath();
    ctx.fill();

    // Triângulo branco (play button)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(44, 38);
    ctx.lineTo(44, 82);
    ctx.lineTo(86, 60);
    ctx.closePath();
    ctx.fill();

    resolve(canvas.toDataURL("image/png"));
  });
}

/**
 * Gera o PDF do palpite com layout idêntico ao site:
 * — Header vermelho YouTube com logo real
 * — Cards de jogo com bandeiras + placar, 2 colunas por fase
 */
export async function generatePredictionPDF(prediction: Prediction): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, M = 12, CW = W - M * 2;
  const pH = pdf.internal.pageSize.getHeight();
  let y = 0;

  // Pré-carregar todas as bandeiras dos jogos em paralelo
  const flagCache = new Map<string, string | null>();
  const flagUrls = new Set<string>();

  if (prediction.championFlagUrl) flagUrls.add(prediction.championFlagUrl);

  // Extrair flagUrls dos matches via metadata (homeTeamId/awayTeamId → url)
  // As flags são previsíveis: https://flagcdn.com/w160/{cc}.png
  // Iremos armazenar no match um campo flagUrl se disponível
  const matchesWithFlags = prediction.matches ?? [];

  // Coletar todas as flagUrls dos times (injetadas via matchHomeFlag/matchAwayFlag se existirem)
  for (const m of matchesWithFlags) {
    const hFlag = (m as any).homeTeamFlagUrl as string | undefined;
    const aFlag = (m as any).awayTeamFlagUrl as string | undefined;
    if (hFlag) flagUrls.add(hFlag);
    if (aFlag) flagUrls.add(aFlag);
  }

  // Carregar tudo em paralelo
  await Promise.all(
    [...flagUrls].map(async (url) => {
      const b64 = await fetchBase64(url);
      flagCache.set(url, b64);
    })
  );

  // Logo YouTube
  const ytLogo = await youtubeLogoBase64();

  // ── HEADER: fundo vermelho ────────────────────────────────────────────────────
  pdf.setFillColor(204, 0, 0);
  pdf.rect(0, 0, W, 40, "F");

  // Logo YouTube (quadrado branco com ícone)
  if (ytLogo) {
    try { pdf.addImage(ytLogo, "PNG", M, 7, 22, 22); } catch { /* silencia */ }
  }

  // Nome do canal centralizado
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16); pdf.setFont("helvetica", "bold");
  const chanName = "Luana Queiroz e Familia";
  const chanX = M + 26;
  pdf.text(chanName, chanX, 17);

  pdf.setFontSize(7.5); pdf.setFont("helvetica", "normal");
  pdf.text("youtube.com/@Luanaqueirozefamilia  |  Desafio da Copa 2026", chanX, 25);
  pdf.text("Comprovante de palpite - guarde este PDF!", chanX, 32);

  y = 46;

  // ── PARTICIPANTE ─────────────────────────────────────────────────────────────
  pdf.setFillColor(255, 251, 235);
  pdf.roundedRect(M, y, CW, 22, 3, 3, "F");
  pdf.setDrawColor(200, 130, 0); pdf.setLineWidth(0.4);
  pdf.roundedRect(M, y, CW, 22, 3, 3, "S");

  pdf.setTextColor(140, 80, 0); pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
  pdf.text("PARTICIPANTE", M + 3, y + 7);

  pdf.setFontSize(14); pdf.setFont("helvetica", "bold"); pdf.setTextColor(60, 30, 0);
  pdf.text(s(prediction.participant.name), M + 3, y + 15);

  pdf.setFontSize(8); pdf.setFont("helvetica", "normal"); pdf.setTextColor(100, 50, 0);
  pdf.text(s(prediction.participant.city), M + 3, y + 21);

  // Código + data à direita
  pdf.setFontSize(7); pdf.setFont("helvetica", "bold"); pdf.setTextColor(140, 80, 0);
  const codeStr = `Codigo: ${prediction.code}`;
  pdf.text(codeStr, W - M - pdf.getTextWidth(codeStr) - 2, y + 7);

  pdf.setFontSize(6); pdf.setFont("helvetica", "normal"); pdf.setTextColor(110, 60, 0);
  const dateStr = prediction.createdAtBrazil
    ?? new Date(prediction.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const dw = pdf.getTextWidth(s(dateStr));
  pdf.text(s(dateStr), W - M - dw - 2, y + 13);

  y += 28;

  // ── CAMPEÃO ──────────────────────────────────────────────────────────────────
  if (prediction.championTeamName) {
    const champH = 30;
    pdf.setFillColor(255, 215, 0);
    pdf.roundedRect(M, y, CW, champH, 3, 3, "F");
    pdf.setDrawColor(180, 140, 0); pdf.setLineWidth(0.5);
    pdf.roundedRect(M, y, CW, champH, 3, 3, "S");

    pdf.setTextColor(90, 60, 0); pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
    pdf.text("MEU CAMPEAO DA COPA 2026 \u{1F3C6}", M + 3, y + 8);

    // Bandeira do campeão
    const flagX = M + 3;
    let nameX = flagX;
    if (prediction.championFlagUrl) {
      const imgData = flagCache.get(prediction.championFlagUrl);
      if (imgData) {
        try {
          pdf.addImage(imgData, "JPEG", flagX, y + 12, 20, 14);
          nameX = flagX + 24;
        } catch { /* silencia */ }
      }
    }

    pdf.setFontSize(16); pdf.setFont("helvetica", "bold"); pdf.setTextColor(50, 25, 0);
    pdf.text(s(prediction.championTeamName), nameX, y + 22);

    y += champH + 6;
  }

  // ── PALPITES POR FASE ─────────────────────────────────────────────────────────
  const stageOrder = ["LAST_32","LAST_16","QUARTER_FINALS","SEMI_FINALS","THIRD_PLACE","FINAL"];
  const byStage: Record<string, typeof prediction.matches> = {};
  for (const m of prediction.matches ?? []) {
    const key = m.stage as string;
    if (!byStage[key]) byStage[key] = [];
    byStage[key].push(m);
  }

  const newPage  = () => { pdf.addPage(); y = 14; };
  const checkY   = (need: number) => { if (y + need > pH - 14) newPage(); };

  // Layout de card: 2 colunas, com bandeiras + placar como no site
  const colCount  = 2;
  const gap       = 3;
  const colW      = (CW - gap * (colCount - 1)) / colCount;
  const cardH     = 20; // altura do card de jogo
  const flagW     = 12; // largura da bandeira no card
  const flagH     = 8;  // altura da bandeira no card

  for (const stage of stageOrder) {
    const items = byStage[stage];
    if (!items?.length) continue;

    checkY(14);

    // ── Header da fase ──
    const isFinal = stage === "FINAL";
    const isThird = stage === "THIRD_PLACE";
    if (isFinal) { pdf.setFillColor(204, 0, 0); }
    else if (isThird) { pdf.setFillColor(100, 70, 0); }
    else { pdf.setFillColor(180, 100, 0); }

    pdf.rect(M, y, CW, 7, "F");
    pdf.setTextColor(255, 255, 255); pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
    pdf.text(s(stageNames[stage] ?? stage), M + 2, y + 5);
    y += 9;

    let col = 0;

    for (const match of items) {
      if (!match.homeTeamName && !match.awayTeamName) continue;
      checkY(cardH + 2);

      const cx     = M + col * (colW + gap);
      const homeWins = match.predictedWinnerId === match.homeTeamId;
      const awayWins = match.predictedWinnerId === match.awayTeamId;
      const hasScore = match.predictedHomeScore != null && match.predictedAwayScore != null;
      const hasWinner = !!match.predictedWinnerId;

      // ── Fundo do card ──
      if (hasWinner) {
        pdf.setFillColor(240, 253, 244); // verde claro
        pdf.setDrawColor(34, 197, 94);
      } else {
        pdf.setFillColor(249, 250, 251);
        pdf.setDrawColor(210, 210, 210);
      }
      pdf.setLineWidth(0.3);
      pdf.roundedRect(cx, y, colW, cardH, 2, 2, "FD");

      // ── Linha home ──
      const homeUrl = (match as any).homeTeamFlagUrl as string | undefined;
      const awayUrl = (match as any).awayTeamFlagUrl as string | undefined;

      const homeFlag = homeUrl ? flagCache.get(homeUrl) : null;
      const awayFlag = awayUrl ? flagCache.get(awayUrl) : null;

      // Home row (y+2 a y+10)
      const homeY = y + 2;
      const awayY = y + 11;

      // Bandeira home
      if (homeFlag) {
        try { pdf.addImage(homeFlag, "JPEG", cx + 1.5, homeY + 0.5, flagW, flagH); } catch { /* skip */ }
      }
      // Bandeira away
      if (awayFlag) {
        try { pdf.addImage(awayFlag, "JPEG", cx + 1.5, awayY + 0.5, flagW, flagH); } catch { /* skip */ }
      }

      const textX = cx + flagW + 3.5;
      const maxNameW = colW - flagW - 14; // espaço para o nome (deixa lugar para placar)

      // Nome home
      pdf.setFontSize(6);
      pdf.setFont("helvetica", homeWins ? "bold" : "normal");
      pdf.setTextColor(homeWins ? 21 : 50, homeWins ? 128 : 50, homeWins ? 61 : 50);
      const homeName = s(match.homeTeamName ?? "A definir");
      pdf.text(homeName.slice(0, 16), textX, homeY + 6);

      // Nome away
      pdf.setFont("helvetica", awayWins ? "bold" : "normal");
      pdf.setTextColor(awayWins ? 21 : 70, awayWins ? 128 : 70, awayWins ? 61 : 70);
      const awayName = s(match.awayTeamName ?? "A definir");
      pdf.text(awayName.slice(0, 16), textX, awayY + 6);

      // ── Placar ──
      const scoreX = cx + colW - 2;

      if (hasScore) {
        const hs = match.predictedHomeScore!;
        const as_ = match.predictedAwayScore!;
        const hp = (match as any).decidedByPenalties ? (match as any).predictedHomePens : null;
        const ap = (match as any).decidedByPenalties ? (match as any).predictedAwayPens : null;

        pdf.setFontSize(8); pdf.setFont("helvetica", "bold");

        // Score home
        pdf.setTextColor(homeWins ? 21 : 60, homeWins ? 128 : 60, homeWins ? 61 : 60);
        const hs_str = String(hs);
        pdf.text(hs_str, scoreX - pdf.getTextWidth(hs_str), homeY + 6);

        // Score away
        pdf.setTextColor(awayWins ? 21 : 60, awayWins ? 128 : 60, awayWins ? 61 : 60);
        const as_str = String(as_);
        pdf.text(as_str, scoreX - pdf.getTextWidth(as_str), awayY + 6);

        // Pênaltis (menor, abaixo)
        if (hp != null && ap != null) {
          pdf.setFontSize(4.5); pdf.setFont("helvetica", "normal"); pdf.setTextColor(120, 120, 120);
          pdf.text(`(${hp})`, scoreX - 5, homeY + 9.5);
          pdf.text(`(${ap})`, scoreX - 5, awayY + 9.5);
        }
      } else if (hasWinner) {
        // Só o check do vencedor
        pdf.setFontSize(9); pdf.setFont("helvetica", "bold"); pdf.setTextColor(21, 128, 61);
        if (homeWins) pdf.text("v", scoreX - 4, homeY + 6);
        if (awayWins) pdf.text("v", scoreX - 4, awayY + 6);
      }

      // Check do vencedor
      if (hasWinner) {
        pdf.setFontSize(6); pdf.setFont("helvetica", "bold"); pdf.setTextColor(21, 128, 61);
        if (homeWins) pdf.text("*", cx + 1, homeY + 6);
        if (awayWins) pdf.text("*", cx + 1, awayY + 6);
      }

      col++;
      if (col >= colCount) { col = 0; y += cardH + 2; }
    }

    if (col > 0) { y += cardH + 2; }
    y += 4;
  }

  // ── RODAPÉ ───────────────────────────────────────────────────────────────────
  checkY(14);
  pdf.setFillColor(245, 245, 245);
  pdf.rect(M, y, CW, 13, "F");
  pdf.setDrawColor(200, 200, 200); pdf.setLineWidth(0.2);
  pdf.rect(M, y, CW, 13, "S");

  const hash = await shortHash(prediction.code + prediction.participant.name);
  pdf.setTextColor(130, 130, 130); pdf.setFontSize(6); pdf.setFont("helvetica", "normal");
  pdf.text(`Hash: ${hash}`, M + 2, y + 5);
  pdf.text(s(dateStr ?? ""), M + 2, y + 10);

  pdf.setFont("helvetica", "bold"); pdf.setTextColor(204, 0, 0);
  const ytText = "youtube.com/@Luanaqueirozefamilia";
  pdf.text(ytText, W - M - pdf.getTextWidth(ytText) - 2, y + 8);

  pdf.save(`palpite_copa2026_${prediction.code}.pdf`);
}
