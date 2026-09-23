import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveCurrentProfile } from "@/lib/auth/profile";
import { LoginForm } from "@/components/login/LoginForm";

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
    <div className="flex min-h-screen items-center justify-center bg-graphite px-4 py-12">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="h-1 w-10 rounded-full bg-complex-red" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Complex Admin
            </h1>
            <p className="text-sm text-white/50">
              Recruitment operations platform
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-card p-8 shadow-2xl shadow-black/40">
          <LoginForm showInactiveMessage={showInactiveMessage} />
        </div>
      </div>
    </div>
  );
}
