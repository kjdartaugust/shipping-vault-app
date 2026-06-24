/**
 * Centralised environment access. `isSupabaseConfigured` lets the UI render a
 * helpful setup screen (instead of crashing) when env vars are missing — handy
 * for first-run / preview deployments before credentials are wired up.
 */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  vaultKey: process.env.VAULT_ENCRYPTION_KEY ?? "",
};

export const isSupabaseConfigured =
  env.supabaseUrl.startsWith("http") && env.supabaseAnonKey.length > 20;
