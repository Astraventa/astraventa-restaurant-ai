import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
}

// Singleton client to avoid multiple instances
export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-key");

// Cache clients by clientId to reuse instances
const clientCache = new Map<string, SupabaseClient>();

export function createSupabaseForClient(clientId?: string): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Cannot create Supabase client: missing environment variables");
    return supabase; // Return singleton if env vars missing
  }
  
  // If no clientId, return singleton
  if (!clientId) {
    return supabase;
  }
  
  // Reuse cached client for same clientId
  if (clientCache.has(clientId)) {
    return clientCache.get(clientId)!;
  }
  
  // Create new client with headers and cache it
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { "x-client-id": clientId },
    },
  });
  
  clientCache.set(clientId, client);
  return client;
}


