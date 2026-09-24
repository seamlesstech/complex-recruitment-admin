import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * The ONLY privileged Supabase client in this app. Uses SUPABASE_SECRET_KEY
 * (service role) and therefore bypasses RLS entirely — it must never be used
 * for ordinary operational reads/writes (Jobs, Candidates, Applications,
 * Staff Requests, Enquiries, Employers, Notes, Documents, Settings), which
 * all continue to use the authenticated user's own session via
 * src/lib/supabase/{server,client}.ts.
 *
 * Scope: this client is imported only from src/lib/team/actions.ts (Super
 * Admin team-member invitation + resend, via supabase.auth.admin.*) and
 * src/lib/auth/invite-actions.ts (the narrow, self-only Invited → Active
 * transition after an invitee sets their first password). Nothing else may
 * import this module.
 *
 * "server-only" is Next.js's built-in webpack alias (see
 * src/lib/auth/profile.ts for the same pattern) — it hard-fails the build if
 * this file is ever pulled into a Client Component bundle. The runtime guard
 * below is defense in depth for any bundler configuration that alias might
 * miss.
 */
if (typeof window !== "undefined") {
  throw new Error("lib/supabase/admin.ts must never run in the browser.");
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY (or NEXT_PUBLIC_SUPABASE_URL) is not configured — privileged Supabase operations are unavailable.",
    );
  }

  return createSupabaseClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
