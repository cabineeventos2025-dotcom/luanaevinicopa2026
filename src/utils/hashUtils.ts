/**
 * Gera um código único no formato LQF2026-XXXXXX
 * onde X são caracteres alfanuméricos maiúsculos.
 */
export function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  for (const byte of array) {
    result += chars[byte % chars.length];
  }
  return `LQF2026-${result}`;
}

/**
 * Gera um hash SHA-256 de validação dos dados do palpite.
 * Retorna uma string hexadecimal de 64 caracteres.
 */
export async function generateHash(data: {
  name: string;
  city: string;
  createdAt: string;
  championId: string | null | undefined;
  matchSelections: Array<{
    matchId: string;
    homeScore: number | null;
    awayScore: number | null;
    winnerId: string | null | undefined;
  }>;
}): Promise<string> {
  const payload = JSON.stringify(data);
  const encoder = new TextEncoder();
  const buf = encoder.encode(payload);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  const hashArray = Array.from(new Uint8Array(hashBuf));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Retorna os primeiros 16 caracteres do hash para exibição.
 */
export function shortHash(hash: string): string {
  return hash.slice(0, 16).toUpperCase();
}
