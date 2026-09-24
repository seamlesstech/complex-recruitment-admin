"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireActiveProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_PROFILE_ROLES, type ProfileRole } from "@/lib/auth/roles";

export type TeamActionResult = { ok: true } | { ok: false; error: string };

/**
 * Derived from the current request, not a configured env var — this app has
 * no NEXT_PUBLIC_SITE_URL, and deriving it here means invitations work
 * correctly in local dev and on whatever the actual deployed Admin domain
 * is, without needing a value kept in sync by hand.
 */
async function getBaseUrl(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Invites a new team member. Super Admin-only, enforced server-side (never
 * trusted from the client hiding the button) via requireActiveProfile()'s
 * real, RLS-backed profile plus an explicit role check here.
 *
 * Auth account creation and the Invited -> role assignment both go through
 * the privileged admin client (service role) — this is exactly the "inviting
 * a team member" use documented as this client's scope in
 * src/lib/supabase/admin.ts. Everything else here (the pre-check read) uses
 * the caller's own authenticated session, RLS-gated as normal.
 */
export async function inviteTeamMemberAction(input: {
  fullName: string;
  email: string;
  role: ProfileRole;
}): Promise<TeamActionResult> {
  const caller = await requireActiveProfile();
  if (caller.role !== "super_admin") {
    return { ok: false, error: "Only Super Admin can invite team members." };
  }

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const role = input.role;

  if (!fullName) return { ok: false, error: "Full name is required." };
  if (!isValidEmail(email)) return { ok: false, error: "Enter a valid email address." };
  if (!ALL_PROFILE_ROLES.includes(role)) return { ok: false, error: "Select a valid role." };

  const supabase = await createClient();
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("status")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) {
    if (existingProfile.status === "active") {
      return { ok: false, error: "This person is already an active team member." };
    }
    if (existingProfile.status === "invited") {
      return {
        ok: false,
        error: "This person already has a pending invitation — use Resend invitation instead.",
      };
    }
    return { ok: false, error: "An account already exists for this email address." };
  }

  const baseUrl = await getBaseUrl();
  const admin = createAdminClient();

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { display_name: fullName },
    redirectTo: `${baseUrl}/auth/callback`,
  });

  if (inviteError || !invited.user) {
    console.error("inviteTeamMemberAction: inviteUserByEmail failed:", inviteError);
    return { ok: false, error: "Could not send the invitation. Please try again." };
  }

  // handle_new_user() already created the profile row as role='viewer',
  // status='invited'. Assigning the Super Admin-selected role here, via the
  // service-role client, is the one place that role is ever set for a new
  // team member — auth.uid() is null for a service-role connection, which is
  // the documented trusted-administrative-context carve-out in
  // protect_profile_privileged_fields() (rls_foundation.sql).
  const { error: roleError } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", invited.user.id)
    .eq("status", "invited");

  if (roleError) {
    console.error("inviteTeamMemberAction: role assignment failed:", roleError);
    return {
      ok: false,
      error: "The invitation was sent, but the role could not be set. Please contact support.",
    };
  }

  revalidatePath("/team");
  return { ok: true };
}

/**
 * Resends an invitation email for a still-Invited team member. Super
 * Admin-only, same authorization shape as inviteTeamMemberAction.
 */
export async function resendInvitationAction(profileId: string): Promise<TeamActionResult> {
  const caller = await requireActiveProfile();
  if (caller.role !== "super_admin") {
    return { ok: false, error: "Only Super Admin can resend invitations." };
  }

  const supabase = await createClient();
  const { data: target, error } = await supabase
    .from("profiles")
    .select("email, status")
    .eq("id", profileId)
    .maybeSingle();

  if (error || !target) {
    return { ok: false, error: "Team member not found." };
  }
  if (target.status !== "invited") {
    return { ok: false, error: "This person's invitation is no longer pending." };
  }

  const baseUrl = await getBaseUrl();
  const admin = createAdminClient();

  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(target.email, {
    redirectTo: `${baseUrl}/auth/callback`,
  });

  if (inviteError) {
    console.error("resendInvitationAction failed:", inviteError);
    return { ok: false, error: "Could not resend the invitation. Please try again." };
  }

  revalidatePath("/team");
  return { ok: true };
}
