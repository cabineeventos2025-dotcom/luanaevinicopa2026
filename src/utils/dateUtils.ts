import { format, toZonedTime } from "date-fns-tz";

export const BRAZIL_TZ = "America/Sao_Paulo";

/**
 * Retorna a data/hora atual em horário de Brasília.
 */
export function nowBrazil(): Date {
  const now = new Date();
  return toZonedTime(now, BRAZIL_TZ);
}

/**
 * Formata uma data para string no formato "dd/MM/yyyy HH:mm:ss" em horário de Brasília.
 */
export function formatBrazil(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const zoned = toZonedTime(d, BRAZIL_TZ);
  return format(zoned, "dd/MM/yyyy HH:mm:ss", { timeZone: BRAZIL_TZ });
}

/**
 * Formata data/hora de um jogo para exibição amigável.
 */
export function formatMatchDateTime(isoDate: string): { date: string; time: string } {
  try {
    const d = new Date(isoDate);
    const zoned = toZonedTime(d, BRAZIL_TZ);
    return {
      date: format(zoned, "dd/MM/yyyy", { timeZone: BRAZIL_TZ }),
      time: format(zoned, "HH:mm", { timeZone: BRAZIL_TZ }),
    };
  } catch {
    return { date: "—", time: "—" };
  }
}

/**
 * Formata uma data ISO para exibição resumida no card de jogo.
 */
export function formatMatchShort(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    const zoned = toZonedTime(d, BRAZIL_TZ);
    return format(zoned, "dd/MM HH:mm", { timeZone: BRAZIL_TZ });
  } catch {
    return "—";
  }
}
