import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuthShell } from "@/components/auth/AuthShell";
import { SetPasswordForm } from "@/components/login/SetPasswordForm";

/**
 * Outside the (admin) route group deliberately — an invitee has a real
 * Supabase session at this point (established by /auth/callback) but their
 * profile is still status = 'invited', which requireActiveProfile() treats
 * as no access at all. This page must therefore read the profile through
 * the privileged admin client (bypassing RLS) rather than the normal
 * session client, purely to check "is this genuinely a pending invitation"
 * — it never grants operational access itself.
 */
export default async function SetPasswordPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || profile.status === "disabled") {
    redirect("/login?inactive=1");
  }

  if (profile.status === "active") {
    redirect("/");
  }

  return (
    <AuthShell title="Set your password" description="Welcome to Complex Admin — finish setting up your account.">
      <SetPasswordForm />
    </AuthShell>
  );
}
