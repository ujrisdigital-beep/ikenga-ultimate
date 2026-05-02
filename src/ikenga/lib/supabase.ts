// ============================================================
// IKENGA - SUPABASE CLIENT
// Lazy server-side Supabase client for route handlers and jobs.
// Never import this in client components.
// ============================================================

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database";

// ------------------------------------------------------------------
// Environment variables - set these in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
// ------------------------------------------------------------------

type SupabaseClientInstance = ReturnType<typeof createClient<Database>>;

let supabaseClient: SupabaseClientInstance | null = null;

function readEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function createSupabaseServerClient(): SupabaseClientInstance {
  const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase server environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export function getSupabase(): SupabaseClientInstance {
  if (!supabaseClient) {
    supabaseClient = createSupabaseServerClient();
  }

  return supabaseClient;
}

// Proxy defers client creation until a request actually uses Supabase.
export const supabase = new Proxy({} as SupabaseClientInstance, {
  get(_target, property) {
    const client = getSupabase();
    const value = Reflect.get(client, property);

    return typeof value === "function" ? value.bind(client) : value;
  },
});
