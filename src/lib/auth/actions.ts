"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireActiveProfile } from "@/lib/auth/profile";
import { validatePassword } from "@/lib/auth/password-policy";

export interface SignInState {
  error?: string;
}

/**
 * Real Supabase signInWithPassword — no mock authentication fallback exists
 * anywhere in this codebase. Errors are intentionally generic: we never
 * leak whether an email exists, whether it was the password that was wrong,
 * or any other Auth-internal detail.
 */
export async function signIn(
  _prevState: SignInState | undefined,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Incorrect email or password." };
  }

  // Role/status source of truth is public.profiles, never Auth metadata.
  // RLS (profiles_select_active) only returns this row when status = 'active',
  // so a missing row here means "invited" or "disabled" without needing to
  // branch on which.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { error: "Your Complex Admin account is not currently active." };
  }

  redirect("/");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type ChangePasswordResult = { ok: true } | { ok: false; error: string };

/**
 * Requires the caller's CURRENT password before accepting a new one:
 * re-authenticates via signInWithPassword (the standard, supported way to
 * verify a Supabase Auth password without a separate privileged call) before
 * calling updateUser(). This never touches the privileged admin client —
 * changing your own password is entirely within the normal authenticated
 * session + Supabase Auth, no service role involved.
 *
 * Errors are intentionally generic and never surface the raw Supabase Auth
 * error text.
 */
export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const profile = await requireActiveProfile();

  if (!currentPassword || !newPassword) {
    return { ok: false, error: "Enter your current and new password." };
  }

  const policyError = validatePassword(newPassword);
  if (policyError) {
    return { ok: false, error: policyError };
  }

  const supabase = await createClient();

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: currentPassword,
  });
  if (reauthError) {
    return { ok: false, error: "Your current password is incorrect." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (updateError) {
    return { ok: false, error: "Could not update your password. Please try again." };
  }

  return { ok: true };
}
