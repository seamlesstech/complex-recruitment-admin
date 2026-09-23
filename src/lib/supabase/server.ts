import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Only ever uses the publishable key — RLS is the authorization boundary,
 * not this client's privilege level.
 *
 * `setAll` can be called from a Server Component (which cannot write
 * cookies); the resulting error is safe to ignore there because `proxy.ts`
 * already refreshes and writes the session cookie on every request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore since proxy.ts
            // is refreshing user sessions.
          }
        },
      },
    },
  );
}
