import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Credenciais públicas do Supabase (anon key é segura no client-side)
// Fallback hardcoded garante funcionamento mesmo se env vars não chegarem no build
const SUPABASE_URL     = "https://rxxaffcdhvtrpqneurbm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4eGFmZmNkaHZ0cnBxbmV1cmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NDYwNjQsImV4cCI6MjA5ODQyMjA2NH0." +
  "LYeg1-AxJoe7WKRE9UEpp23WYVFPE5ZikvEPn8OI7eo";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || SUPABASE_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

/** Sempre retorna true — credenciais estão hardcoded como fallback */
export function isSupabaseConfigured(): boolean {
  return true;
}

/** Retorna o cliente Supabase (singleton). */
export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}
