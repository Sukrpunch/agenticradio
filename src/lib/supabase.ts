import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton — only instantiated at request time, never during build
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    }
    _client = createClient(url, key);
  }
  return _client;
}

// Named export for convenience — same lazy pattern
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  },
});
