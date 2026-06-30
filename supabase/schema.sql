-- =====================================================
-- Desafio da Copa 2026 — Luana Queiroz e Família
-- Schema do Supabase
-- =====================================================

-- Habilitar extensão pgcrypto para UUID
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- Tabela: predictions
-- ─────────────────────────────────────────
create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  participant_name text not null,
  participant_city text not null,
  channel_subscribed_confirmed boolean default false,
  channel_subscription_checked boolean default false,
  terms_accepted boolean default false,
  created_at timestamptz default now(),
  created_at_brazil text not null,
  timezone text default 'America/Sao_Paulo',
  champion_team_id text,
  champion_team_name text,
  total_points integer default 0,
  exact_scores integer default 0,
  correct_winners integer default 0,
  hash text not null,
  prediction_json jsonb not null
);

-- Índices
create index if not exists idx_predictions_total_points
  on predictions (total_points desc);

create index if not exists idx_predictions_created_at
  on predictions (created_at desc);

create index if not exists idx_predictions_code
  on predictions (code);

-- ─────────────────────────────────────────
-- Tabela: prediction_matches
-- ─────────────────────────────────────────
create table if not exists prediction_matches (
  id uuid primary key default gen_random_uuid(),
  prediction_id uuid references predictions(id) on delete cascade,
  match_id text not null,
  round text,
  home_team_id text,
  home_team_name text,
  away_team_id text,
  away_team_name text,
  predicted_home_score integer,
  predicted_away_score integer,
  predicted_winner_team_id text,
  predicted_winner_team_name text,
  decided_by_penalties boolean default false,
  points integer default 0,
  score_reason text
);

-- Índice
create index if not exists idx_prediction_matches_prediction_id
  on prediction_matches (prediction_id);

-- ─────────────────────────────────────────
-- Row Level Security (RLS)
-- ─────────────────────────────────────────

-- Ativar RLS nas tabelas
alter table predictions enable row level security;
alter table prediction_matches enable row level security;

-- ─── Políticas para predictions ───

-- Qualquer pessoa pode inserir um palpite (público)
create policy "predictions_insert_public"
  on predictions
  for insert
  to anon, authenticated
  with check (true);

-- Qualquer pessoa pode ler o ranking (apenas colunas seguras)
-- O SELECT completo é controlado pela aplicação
create policy "predictions_select_public"
  on predictions
  for select
  to anon, authenticated
  using (true);

-- NÃO permitir UPDATE público
-- (apenas via service_role no backend admin, se necessário)

-- NÃO permitir DELETE público

-- ─── Políticas para prediction_matches ───

-- INSERT público
create policy "prediction_matches_insert_public"
  on prediction_matches
  for insert
  to anon, authenticated
  with check (true);

-- SELECT público
create policy "prediction_matches_select_public"
  on prediction_matches
  for select
  to anon, authenticated
  using (true);

-- ─────────────────────────────────────────
-- View pública do ranking (sem dados sensíveis)
-- ─────────────────────────────────────────
create or replace view ranking_public as
  select
    row_number() over (
      order by total_points desc, exact_scores desc, correct_winners desc, created_at asc
    ) as position,
    code,
    participant_name,
    participant_city,
    champion_team_name,
    total_points,
    exact_scores,
    correct_winners,
    created_at_brazil
  from predictions
  order by total_points desc, exact_scores desc, correct_winners desc, created_at asc;

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================
-- 1. Acesse seu projeto no Supabase: https://supabase.com/
-- 2. Vá em SQL Editor
-- 3. Cole e execute este script
-- 4. Configure as variáveis de ambiente:
--    VITE_SUPABASE_URL=https://xxxx.supabase.co
--    VITE_SUPABASE_ANON_KEY=xxxx
-- =====================================================
