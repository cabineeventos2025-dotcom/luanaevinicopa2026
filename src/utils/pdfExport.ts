import type { Prediction } from "@/types/prediction";
import { shortHash } from "./hashUtils";
import { formatBrazil } from "./dateUtils";

interface ChannelConfig {
  channelName: string;
  logoUrl?: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
}

/**
 * Gera um PDF do palpite usando jsPDF + html2canvas.
 * Renderiza um elemento HTML oculto e o captura como imagem.
 */
export async function generatePredictionPDF(
  prediction: Prediction,
  channelConfig: ChannelConfig,
): Promise<void> {
  // Dynamic imports to avoid SSR issues
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  // Create a hidden container to render the PDF content
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 800px;
    background: white;
    font-family: 'Nunito', 'Inter', sans-serif;
    padding: 40px;
    box-sizing: border-box;
    color: #1a1a2e;
  `;

  const stagesMap: Record<string, string> = {
    LAST_32: "Fase de 32",
    LAST_16: "Oitavas de Final",
    QUARTER_FINALS: "Quartas de Final",
    SEMI_FINALS: "Semifinais",
    THIRD_PLACE: "Disputa de 3º Lugar",
    FINAL: "Final",
    GROUP_STAGE: "Fase de Grupos",
  };

  const hasResults =
    prediction.matches.some((m) => m.points > 0) || prediction.totalPoints > 0;

  container.innerHTML = `
    <div style="text-align:center; margin-bottom:24px; border-bottom:3px solid ${channelConfig.primaryColor}; padding-bottom:20px;">
      <div style="font-size:28px; font-weight:900; color:${channelConfig.primaryColor}; margin-bottom:4px;">
        🏆 ${channelConfig.channelName}
      </div>
      <div style="font-size:18px; font-weight:700; color:#333; margin-bottom:4px;">
        Meu Palpite da Copa do Mundo 2026
      </div>
      <div style="font-size:13px; color:#666;">Desafio divertido da família</div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px;">
      <div style="background:#f0f9ff; border-radius:12px; padding:16px;">
        <div style="font-size:11px; color:#666; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Participante</div>
        <div style="font-size:18px; font-weight:800; color:#1a1a2e;">${prediction.participant.name}</div>
        <div style="font-size:13px; color:#555;">📍 ${prediction.participant.city}</div>
      </div>
      <div style="background:#fffbeb; border-radius:12px; padding:16px;">
        <div style="font-size:11px; color:#666; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Data do Palpite</div>
        <div style="font-size:14px; font-weight:700; color:#1a1a2e;">${prediction.createdAtBrazil}</div>
        <div style="font-size:11px; color:#666;">Horário de Brasília</div>
      </div>
    </div>

    ${
      prediction.championTeamName
        ? `
    <div style="background:linear-gradient(135deg, ${channelConfig.primaryColor}, ${channelConfig.secondaryColor}); border-radius:16px; padding:20px; text-align:center; margin-bottom:24px; color:white;">
      <div style="font-size:13px; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px; opacity:0.9;">🏆 Meu Campeão da Copa</div>
      <div style="font-size:26px; font-weight:900;">${prediction.championTeamName}</div>
    </div>`
        : ""
    }

    ${
      hasResults
        ? `
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:24px;">
      <div style="background:#f0fdf4; border-radius:12px; padding:14px; text-align:center;">
        <div style="font-size:24px; font-weight:900; color:#16a34a;">${prediction.totalPoints}</div>
        <div style="font-size:11px; color:#555;">Pontos totais</div>
      </div>
      <div style="background:#eff6ff; border-radius:12px; padding:14px; text-align:center;">
        <div style="font-size:24px; font-weight:900; color:#2563eb;">${prediction.exactScores}</div>
        <div style="font-size:11px; color:#555;">Placares exatos</div>
      </div>
      <div style="background:#fefce8; border-radius:12px; padding:14px; text-align:center;">
        <div style="font-size:24px; font-weight:900; color:#ca8a04;">${prediction.correctWinners}</div>
        <div style="font-size:11px; color:#555;">Vencedores certos</div>
      </div>
    </div>`
        : `
    <div style="background:#fefce8; border-radius:12px; padding:14px; text-align:center; margin-bottom:24px; color:#666; font-style:italic;">
      Pontuação será calculada conforme os jogos da Copa forem acontecendo.
    </div>`
    }

    <div style="margin-bottom:24px;">
      <div style="font-size:15px; font-weight:800; color:#1a1a2e; margin-bottom:12px; padding-bottom:8px; border-bottom:2px solid #e5e7eb;">
        📋 Chaveamento Completo
      </div>
      ${prediction.matches
        .map(
          (m) => `
        <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:8px; align-items:center; padding:8px 0; border-bottom:1px solid #f3f4f6;">
          <div style="text-align:right; font-size:13px; font-weight:600; color:#1a1a2e;">${m.homeTeamName ?? "A definir"}</div>
          <div style="text-align:center; background:#f3f4f6; border-radius:8px; padding:4px 10px; font-weight:800; font-size:13px;">
            ${m.predictedHomeScore ?? "–"} × ${m.predictedAwayScore ?? "–"}
            ${m.decidedByPenalties ? `<div style="font-size:10px; color:#666;">(pênaltis)</div>` : ""}
          </div>
          <div style="font-size:13px; font-weight:600; color:#1a1a2e;">${m.awayTeamName ?? "A definir"}</div>
        </div>
        ${
          m.predictedWinnerName
            ? `<div style="font-size:11px; color:#16a34a; text-align:center; margin-bottom:4px;">✅ Avança: ${m.predictedWinnerName}</div>`
            : ""
        }
      `,
        )
        .join("")}
    </div>

    <div style="background:#f8fafc; border-radius:12px; padding:16px; margin-bottom:20px;">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <div style="font-size:11px; color:#666; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Código do Palpite</div>
          <div style="font-size:16px; font-weight:900; color:${channelConfig.primaryColor}; font-family:monospace;">${prediction.code}</div>
        </div>
        <div>
          <div style="font-size:11px; color:#666; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Hash de Validação</div>
          <div style="font-size:12px; font-weight:700; color:#555; font-family:monospace;">${shortHash(prediction.hash)}</div>
        </div>
      </div>
    </div>

    <div style="text-align:center; font-size:11px; color:#999; border-top:1px solid #e5e7eb; padding-top:16px;">
      <p style="margin:0 0 4px;">Este palpite é uma brincadeira familiar da Copa do Mundo 2026.</p>
      <p style="margin:0;">Criado em horário de Brasília • ${channelConfig.channelName}</p>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: 800,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // If content exceeds one page, add pages
    const pageHeight = pdf.internal.pageSize.getHeight();
    if (pdfHeight <= pageHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    } else {
      let yOffset = 0;
      let remainingHeight = pdfHeight;
      while (remainingHeight > 0) {
        pdf.addImage(imgData, "PNG", 0, -yOffset, pdfWidth, pdfHeight);
        remainingHeight -= pageHeight;
        yOffset += pageHeight;
        if (remainingHeight > 0) pdf.addPage();
      }
    }

    const fileName = `palpite-copa-2026-${prediction.participant.name.toLowerCase().replace(/\s+/g, "-")}-${prediction.code}.pdf`;
    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Exporta o palpite como JSON para download.
 */
export function exportPredictionJSON(prediction: Prediction): void {
  const blob = new Blob([JSON.stringify(prediction, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `palpite-copa-2026-${prediction.code}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
