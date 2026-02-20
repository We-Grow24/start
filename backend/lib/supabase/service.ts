import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Supabase admin client using service role key.
 * Bypasses Row Level Security — use only in server-side code
 * (webhooks, cron jobs, admin API routes).
 *
 * The `server-only` import ensures this module cannot be imported
 * in any Client Component — build will fail with an explicit error.
 */
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
