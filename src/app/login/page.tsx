import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveCurrentProfile } from "@/lib/auth/profile";
import { LoginForm } from "@/components/login/LoginForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const resolution = await resolveCurrentProfile();

  if (resolution.kind === "active") {
    redirect("/");
  }

  let showInactiveMessage = params.inactive === "1";

  if (resolution.kind === "inactive") {
    // A stale, not-yet-cleared session for an invited/disabled profile —
    // clear it now rather than leaving a dead session sitting in cookies.
    const supabase = await createClient();
    await supabase.auth.signOut();
    showInactiveMessage = true;
  }

  return (
    <AuthShell title="Complex Admin" description="Recruitment operations platform">
      <LoginForm showInactiveMessage={showInactiveMessage} />
    </AuthShell>
  );
}
