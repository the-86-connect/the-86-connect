import { createClient } from "@supabase/supabase-js";

// Supabase client for Auth, Storage, and Realtime.
// Uses the service_role key for admin operations (server-side only).
// Never expose the service_role key to the client.

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env",
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Public client (anon key) for operations that don't need admin privileges
export const supabasePublic = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY!,
);