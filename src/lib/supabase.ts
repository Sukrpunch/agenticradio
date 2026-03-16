import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase configuration. Some features may not work. Check your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
