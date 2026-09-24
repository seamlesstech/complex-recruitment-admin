"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validatePassword } from "./password-policy";

export type CompleteInvitationResult = { ok: true } | { ok: false; error: string };

/**
 * Completes onboarding for an invited team member: sets their first
 * password (via their own session — no privileged access needed for that
 * part) and, only then, transitions their OWN profile from Invited to
 * Active.
 *
 * The Invited -> Active write goes through the privileged admin client
 * (service role bypasses RLS's protect_profile_privileged_fields trigger,
 * the same trusted-administrative-context pattern documented in
 * src/lib/supabase/admin.ts and rls_foundation.sql) because the ordinary
 * authenticated-session path cannot perform this update at all: the trigger
 * blocks any status change made by a non-Super-Admin caller, which is
 * exactly what stops a client from self-promoting — including straight to
 * Active. This function is the one narrow, deliberate exception, and it
 * only ever does the least possible thing:
 *   - the target row is hardcoded to the CALLER's own id (never client input)
 *   - it only fires `.eq("status", "invited")`, so it's a no-op on any row
 *     that isn't genuinely still Invited (already-Active, Disabled, or
 *     someone else's profile all fail closed)
 *   - it can never set role, and status can only ever become 'active' here
 * No RLS policy or trigger is modified to make this possible.
 */
export async function completeInvitationAction(
  newPassword: string,
  confirmPassword: string,
): Promise<CompleteInvitationResult> {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) {
    return { ok: false, error: "Your invitation link has expired. Please ask for a new one." };
  }

  if (newPassword !== confirmPassword) {
    return { ok: false, error: "New password and confirmation do not match." };
  }

  const policyError = validatePassword(newPassword);
  if (policyError) {
    return { ok: false, error: policyError };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    return { ok: false, error: "Could not set your password. Please try again." };
  }

  const admin = createAdminClient();
  const { data: activated, error: activateError } = await admin
    .from("profiles")
    .update({ status: "active", joined_at: new Date().toISOString() })
    .eq("id", userId)
    .eq("status", "invited")
    .select("id")
    .maybeSingle();

  if (activateError) {
    console.error("completeInvitationAction: activation failed:", activateError);
    return {
      ok: false,
      error: "Your password was set, but your account could not be activated. Please contact support.",
    };
  }
  if (!activated) {
    return { ok: false, error: "This invitation has already been used or is no longer pending." };
  }

  redirect("/");
}
