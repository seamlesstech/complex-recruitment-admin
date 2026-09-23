import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRole, ProfileStatus } from "./roles";

/**
 * The real authenticated profile — display_name/email/role/initials come
 * from public.profiles, never from Auth user metadata (see the Supabase
 * architecture notes in supabase/migrations/20260922120220_profiles.sql for
 * why user metadata must never be trusted for authorization).
 */
export interface AuthenticatedProfile {
  id: string;
  displayName: string;
  email: string;
  initials: string | null;
  role: ProfileRole;
  status: ProfileStatus;
}

export type ProfileResolution =
  | { kind: "unauthenticated" }
  /** A verified Supabase Auth session exists, but no active profiles row does. */
  | { kind: "inactive" }
  | { kind: "active"; profile: AuthenticatedProfile };

/**
 * Resolves the current request's profile. Cached per request (React
 * `cache()`) so every call site in one render pass shares a single round
 * trip instead of re-querying.
 *
 * Deliberately does not distinguish "no profiles row" from "profiles row
 * exists but status isn't active": RLS's profiles_select_active policy
 * already requires status = 'active' to return the row at all, so both
 * cases surface identically here as "inactive" — exactly the authorization
 * boundary we want, enforced by the database rather than duplicated in
 * application code.
 */
export const resolveCurrentProfile = cache(
  async (): Promise<ProfileResolution> => {
    const supabase = await createClient();

    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;
    if (!userId) {
      return { kind: "unauthenticated" };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, display_name, email, initials, role, status")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      return { kind: "inactive" };
    }

    return {
      kind: "active",
      profile: {
        id: profile.id,
        displayName: profile.display_name,
        email: profile.email,
        initials: profile.initials,
        role: profile.role,
        status: profile.status,
      },
    };
  },
);

/**
 * For Server Components inside the (admin) route group: guarantees either a
 * real, active profile is returned, or the request never renders protected
 * content — it redirects first. This is the "secure" check (hits the
 * database) that Proxy deliberately defers to here.
 */
export async function requireActiveProfile(): Promise<AuthenticatedProfile> {
  const resolution = await resolveCurrentProfile();

  if (resolution.kind === "unauthenticated") {
    redirect("/login");
  }

  if (resolution.kind === "inactive") {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login?inactive=1");
  }

  return resolution.profile;
}
