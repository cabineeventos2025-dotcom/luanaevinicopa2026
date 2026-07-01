import type { Prediction, RankingEntry } from "@/types/prediction";
import type { RankingRepository } from "./RankingRepository";
import { getSupabaseClient } from "@/services/supabaseClient";
import { fetchWorldCupData } from "@/lib/worldcup/footballApiService";
import { updateRankingWithRealResults, sortRanking } from "@/utils/ranking";

export class SupabaseRankingRepository implements RankingRepository {
  async savePrediction(prediction: Prediction): Promise<void> {
    const sb = getSupabaseClient();

    const payload = {
      code: prediction.code,
      participant_name: prediction.participant.name,
      participant_city: prediction.participant.city,
      channel_subscribed_confirmed: prediction.channelSubscribedConfirmed,
      channel_subscription_checked: prediction.channelSubscriptionChecked,
      terms_accepted: prediction.termsAccepted,
      created_at: prediction.createdAt,
      created_at_brazil: prediction.createdAtBrazil,
      timezone: prediction.timezone,
      champion_team_id: prediction.championTeamId,
      champion_team_name: prediction.championTeamName,
      total_points: prediction.totalPoints,
      exact_scores: prediction.exactScores,
      correct_winners: prediction.correctWinners,
      hash: prediction.hash,
      prediction_json: prediction,
    };

    // Tenta INSERT (não precisa de UPDATE policy)
    const { error: insertError } = await sb.from("predictions").insert(payload);

    if (!insertError) return; // sucesso!

    // Código duplicado (23505) = mesmo usuário tentou de novo, ignora
    if (insertError.code === "23505") {
      console.warn("[Supabase] Palpite já existia, ignorando duplicata.");
      return;
    }

    throw new Error(`Erro ao salvar palpite: ${insertError.message} (code: ${insertError.code})`);
  }

  /**
   * Carrega o ranking do Supabase e recalcula os pontos com os resultados reais.
   * Isso garante que a pontuação reflita os jogos que já terminaram.
   */
  async loadRanking(): Promise<RankingEntry[]> {
    const sb = getSupabaseClient();

    // 1. Carregar todos os palpites (com prediction_json para recalcular pontos)
    const { data, error } = await sb
      .from("predictions")
      .select("prediction_json, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Erro ao carregar ranking: ${error.message}`);
    }

    const predictions = (data ?? [])
      .map((row) => row.prediction_json as Prediction)
      .filter(Boolean);

    if (!predictions.length) return [];

    // 2. Carregar resultados reais dos jogos (mock + overrides do Supabase/admin)
    let realMatches: import("@/lib/worldcup/types").Match[] = [];
    try {
      const { data: matchData } = await fetchWorldCupData();
      realMatches = matchData.matches;
    } catch {
      // Se falhar, usa pontos salvos no banco (pode estar desatualizado)
    }

    // 3. Recalcular pontos de cada palpite com os resultados reais
    const updated = realMatches.length
      ? updateRankingWithRealResults(predictions, realMatches)
      : predictions;

    // 4. Ordenar e retornar
    return sortRanking(updated);
  }

  async loadPrediction(code: string): Promise<Prediction | null> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from("predictions")
      .select("prediction_json")
      .eq("code", code)
      .maybeSingle();

    if (error || !data) return null;
    return data.prediction_json as Prediction;
  }

  async loadAllPredictions(): Promise<Prediction[]> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from("predictions")
      .select("prediction_json")
      .order("created_at", { ascending: true });

    if (error) return [];
    return (data ?? []).map((row) => row.prediction_json as Prediction);
  }
}
