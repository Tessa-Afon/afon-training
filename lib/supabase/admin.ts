// Server-only Supabase client using the service-role key. It bypasses
// row-level security, so it must never be imported by a client component.
// Every table is locked to everyone else (see supabase/migrations).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** False until Supabase is set up for this deploy; the site then falls
 *  back to Netlify Forms and the place counts in lib/courses.ts. */
export const DATABASE_CONFIGURED = Boolean(URL && SERVICE_KEY);

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!URL || !SERVICE_KEY) throw new Error("Supabase is not configured.");
  client ??= createClient(URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Place counts must be current: never let Next cache these requests.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
  return client;
}
