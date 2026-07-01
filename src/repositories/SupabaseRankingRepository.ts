import type { Prediction, RankingEntry } from "@/types/prediction";
import type { RankingRepository } from "./RankingRepository";
import { getSupabaseClient } from "@/services/supabaseClient";

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

    // Tenta INSERT primeiro (não precisa de UPDATE policy)
    const { error: insertError } = await sb.from("predictions").insert(payload);

    if (!insertError) return; // sucesso!

    // Se conflito de código único (23505), ignora — já foi salvo antes
    if (insertError.code === "23505") {
      console.warn("[Supabase] Palpite já existia, ignorando duplicata.");
      return;
    }

    // Qualquer outro erro — propaga para o caller
    throw new Error(`Erro ao salvar palpite: ${insertError.message} (code: ${insertError.code})`);
  }

  async loadRanking(): Promise<RankingEntry[]> {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from("predictions")
      .select("code, participant_name, participant_city, total_points, exact_scores, correct_winners, created_at_brazil, champion_team_name")
      .order("total_points", { ascending: false })
      .order("exact_scores", { ascending: false })
      .order("correct_winners", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Erro ao carregar ranking: ${error.message}`);
    }

    return (data ?? []).map((row, i) => ({
      position: i + 1,
      code: row.code,
      participantName: row.participant_name,
      participantCity: row.participant_city,
      totalPoints: row.total_points ?? 0,
      exactScores: row.exact_scores ?? 0,
      correctWinners: row.correct_winners ?? 0,
      createdAtBrazil: row.created_at_brazil ?? "",
      championTeamName: row.champion_team_name,
    }));
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
