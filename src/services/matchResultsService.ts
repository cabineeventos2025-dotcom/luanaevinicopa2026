/**
 * matchResultsService.ts
 * Salva e carrega resultados de jogos no Supabase.
 * Isso permite atualizar placares sem deploy — basta o admin salvar.
 */
import { getSupabaseClient } from "./supabaseClient";

export interface MatchResult {
  match_id: string;
  home_score: number;
  away_score: number;
  penalties_home: number | null;
  penalties_away: number | null;
  done: boolean;
  updated_at?: string;
}

/** Salva (upsert) resultado de um jogo no Supabase */
export async function saveMatchResult(result: MatchResult): Promise<void> {
  const sb = getSupabaseClient();
  const { error } = await sb.from("match_results").upsert(
    { ...result, updated_at: new Date().toISOString() },
    { onConflict: "match_id" },
  );
  if (error) throw new Error(`Erro ao salvar placar: ${error.message}`);
}

/** Carrega todos os resultados de jogos do Supabase */
export async function loadMatchResults(): Promise<MatchResult[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb
    .from("match_results")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Erro ao carregar placares: ${error.message}`);
  return (data ?? []) as MatchResult[];
}
