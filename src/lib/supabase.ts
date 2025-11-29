import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-key");

export function createSupabaseForClient(clientId?: string): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Cannot create Supabase client: missing environment variables");
  }
  return createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-key", {
    global: {
      headers: clientId ? { "x-client-id": clientId } : {},
    },
  });
}


